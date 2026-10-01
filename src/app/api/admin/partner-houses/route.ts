import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';

async function ensurePartnerHousesTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS partner_houses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      contact_person VARCHAR(150),
      phone VARCHAR(50),
      address TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Seed default partner houses if table is empty
  const count = await queryOne<{ total: number }>(`SELECT COUNT(*) as total FROM partner_houses`);
  if (!count || count.total === 0) {
    // Populate from existing other_house_purchases if any
    const existing = await query<any[]>(`
      SELECT DISTINCT house_name, house_contact, house_phone, house_address
      FROM other_house_purchases
      WHERE house_name IS NOT NULL AND TRIM(house_name) != ''
    `);

    if (existing && existing.length > 0) {
      for (const h of existing) {
        await query(
          `INSERT IGNORE INTO partner_houses (name, contact_person, phone, address) VALUES (?, ?, ?, ?)`,
          [h.house_name, h.house_contact || null, h.house_phone || null, h.house_address || null]
        );
      }
    } else {
      // Default common partner houses
      const defaultHouses = [
        ['Ryans Computers Ltd (IDB Bhaban)', 'Mr. Kamal', '01711-234567', 'IDB Bhaban, Level 3, Agargaon, Dhaka', 'Main wholesale partner for GPUs and Keyboards'],
        ['Star Tech & Engineering (Multiplan Branch)', 'Sujon Ahmed', '01822-345678', 'Multiplan Center, Level 4, Elephant Road, Dhaka', 'High priority supplier for processors & motherboards'],
        ['Computer Source (Elephant Road)', 'Farhan Chowdhury', '01933-456789', 'ECS Computer City, Level 2, Dhaka', 'Lend allowed with 7-day settlement terms'],
        ['UCC (Uttara Branch Partner)', 'Tanvir Hasan', '01644-567890', 'Rajlaxmi Complex, Level 5, Sector 3, Uttara', 'Quick walk-in hardware sourcing'],
      ];
      for (const [name, contact, phone, address, notes] of defaultHouses) {
        await query(
          `INSERT IGNORE INTO partner_houses (name, contact_person, phone, address, notes) VALUES (?, ?, ?, ?, ?)`,
          [name, contact, phone, address, notes]
        );
      }
    }
  }
}

export async function GET() {
  try {
    await ensurePartnerHousesTable();

    // Fetch houses with summary stats from other_house_purchases
    const houses = await query<any[]>(`
      SELECT ph.*,
        COUNT(ohp.id) as total_transactions,
        COALESCE(SUM(ohp.total_cost), 0) as total_purchase_amount,
        COALESCE(SUM(ohp.paid_amount), 0) as total_paid_amount,
        COALESCE(SUM(CASE WHEN ohp.payment_status IN ('lend', 'partially_paid') THEN ohp.due_amount ELSE 0 END), 0) as total_lend_due
      FROM partner_houses ph
      LEFT JOIN other_house_purchases ohp ON ph.name = ohp.house_name
      GROUP BY ph.id
      ORDER BY ph.name ASC
    `);

    return NextResponse.json({
      success: true,
      houses: houses || [],
    });
  } catch (error: any) {
    console.error('Fetch partner houses error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch partner houses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensurePartnerHousesTable();
    const body = await req.json();
    const { name, contact_person, phone, address, notes } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'House/Shop Name is required.' }, { status: 400 });
    }

    const trimmedName = name.trim();

    // Check duplicate
    const existing = await queryOne<any>(`SELECT id FROM partner_houses WHERE name = ?`, [trimmedName]);
    if (existing) {
      return NextResponse.json({ success: false, error: 'A partner house with this name already exists.' }, { status: 400 });
    }

    const res: any = await query(
      `INSERT INTO partner_houses (name, contact_person, phone, address, notes) VALUES (?, ?, ?, ?, ?)`,
      [trimmedName, contact_person?.trim() || null, phone?.trim() || null, address?.trim() || null, notes?.trim() || null]
    );

    await logAudit({
      module: 'purchases',
      action: 'partner_house_created',
      recordId: res.insertId,
      newData: { name: trimmedName, contact_person, phone, address, notes },
    });

    return NextResponse.json({
      success: true,
      message: 'Partner House registered successfully!',
      house: {
        id: res.insertId,
        name: trimmedName,
        contact_person: contact_person?.trim() || '',
        phone: phone?.trim() || '',
        address: address?.trim() || '',
        notes: notes?.trim() || '',
      },
    });
  } catch (error: any) {
    console.error('Create partner house error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create partner house' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Partner House ID is required.' }, { status: 400 });
    }

    const house = await queryOne<any>(`SELECT * FROM partner_houses WHERE id = ?`, [id]);
    if (!house) {
      return NextResponse.json({ success: false, error: 'Partner House not found' }, { status: 404 });
    }

    await query(`DELETE FROM partner_houses WHERE id = ?`, [id]);

    await logAudit({
      module: 'purchases',
      action: 'partner_house_deleted',
      recordId: Number(id),
      oldData: house,
    });

    return NextResponse.json({
      success: true,
      message: `Partner House "${house.name}" deleted successfully.`,
    });
  } catch (error: any) {
    console.error('Delete partner house error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete partner house' }, { status: 500 });
  }
}
