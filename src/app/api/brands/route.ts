import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const brands = await query<any[]>(
      `SELECT b.*,
              (SELECT COUNT(*) FROM products WHERE brand_id = b.id) as product_count
       FROM brands b
       ORDER BY b.is_featured DESC, b.name ASC`
    );
    return NextResponse.json({ brands });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      slug,
      country,
      website,
      description,
      short_desc,
      meta_title,
      meta_desc,
    } = body;

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const res = await query<any>(
      `INSERT INTO brands (
        name, slug, country, website, description, short_desc, meta_title, meta_desc
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        finalSlug,
        country || 'Global',
        website || '',
        description || '',
        short_desc || '',
        meta_title || `${name} in Bangladesh | Official CORENIX`,
        meta_desc || `Authentic ${name} products available at CORENIX Bangladesh.`,
      ]
    );

    const brandId = (res as any).insertId;

    await logAudit({
      module: 'Brands',
      action: 'Create Brand',
      recordId: brandId,
      newData: { name, slug: finalSlug, country },
    });

    return NextResponse.json({ success: true, brandId, slug: finalSlug });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 });
  }
}
