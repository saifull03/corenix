import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { getCurrentUser, canManagePurchases, canPurchaseProducts } from '@/lib/auth';

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

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canPurchaseProducts(user)) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Access restricted.' }, { status: 403 });
    }

    await ensurePartnerHousesTable();

    // Ensure sales table exists
    await query(`
      CREATE TABLE IF NOT EXISTS other_house_sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_no VARCHAR(50) NOT NULL UNIQUE,
        house_name VARCHAR(150) NOT NULL,
        house_contact VARCHAR(100) NULL,
        house_phone VARCHAR(50) NULL,
        house_address TEXT NULL,
        branch_id INT NOT NULL,
        product_id INT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_brand VARCHAR(100) NULL,
        product_category VARCHAR(100) NULL,
        product_model VARCHAR(100) NULL,
        serial_number VARCHAR(255) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        cost_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        warranty_period VARCHAR(100) NULL DEFAULT '1 Year Official Warranty',
        is_lend BOOLEAN NOT NULL DEFAULT TRUE,
        payment_status ENUM('lend', 'paid', 'partially_paid') NOT NULL DEFAULT 'lend',
        paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        due_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        payment_method VARCHAR(50) NULL,
        payment_reference VARCHAR(100) NULL,
        paid_at DATETIME NULL,
        received_by_name VARCHAR(100) NULL,
        payment_notes TEXT NULL,
        status ENUM('completed', 'delivered', 'returned_by_house', 'cancelled') NOT NULL DEFAULT 'completed',
        notes TEXT NULL,
        created_by INT NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Fetch houses with summary stats from both purchases and sales
    const houses = await query<any[]>(`
      SELECT ph.*,
        COUNT(DISTINCT ohp.id) as total_purchases_count,
        COALESCE(SUM(ohp.total_cost), 0) as total_purchase_amount,
        COALESCE(SUM(ohp.paid_amount), 0) as total_purchase_paid,
        COALESCE(SUM(CASE WHEN ohp.payment_status IN ('lend', 'partially_paid') THEN ohp.due_amount ELSE 0 END), 0) as total_lend_due,
        COALESCE(sales_stat.total_sales_count, 0) as total_sales_count,
        COALESCE(sales_stat.total_sales_amount, 0) as total_sales_amount,
        COALESCE(sales_stat.total_sales_paid, 0) as total_sales_paid,
        COALESCE(sales_stat.total_sales_due, 0) as total_sales_due
      FROM partner_houses ph
      LEFT JOIN other_house_purchases ohp ON ph.name = ohp.house_name
      LEFT JOIN (
        SELECT house_name,
               COUNT(id) as total_sales_count,
               SUM(total_amount) as total_sales_amount,
               SUM(paid_amount) as total_sales_paid,
               SUM(CASE WHEN payment_status IN ('lend', 'partially_paid') THEN due_amount ELSE 0 END) as total_sales_due
        FROM other_house_sales
        GROUP BY house_name
      ) sales_stat ON ph.name = sales_stat.house_name
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
    const user = await getCurrentUser();
    if (!user || !canManagePurchases(user)) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Only Accounts Manager, Admin, and HR can manage partner houses.' }, { status: 403 });
    }

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
    const user = await getCurrentUser();
    if (!user || !canManagePurchases(user)) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Only Accounts Manager, Admin, and HR can manage partner houses.' }, { status: 403 });
    }

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
