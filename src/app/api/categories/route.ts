import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const categories = await query<any[]>(
      `SELECT c.*, p.name as parent_name,
              (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
       FROM categories c
       LEFT JOIN categories p ON c.parent_id = p.id
       ORDER BY c.order_index ASC, c.name ASC`
    );
    return NextResponse.json({ categories });
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
      parent_id,
      h1,
      short_desc,
      long_desc,
      meta_title,
      meta_desc,
      focus_keyword,
    } = body;

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const res = await query<any>(
      `INSERT INTO categories (
        parent_id, name, slug, h1, short_desc, long_desc, meta_title, meta_desc, focus_keyword
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parent_id || null,
        name,
        finalSlug,
        h1 || `${name} Price in Bangladesh`,
        short_desc || '',
        long_desc || '',
        meta_title || `${name} Price in Bangladesh | CORENIX`,
        meta_desc || `Buy ${name} at best price from CORENIX.`,
        focus_keyword || name.toLowerCase(),
      ]
    );

    const categoryId = (res as any).insertId;

    await logAudit({
      module: 'Categories',
      action: 'Create Category',
      recordId: categoryId,
      newData: { name, slug: finalSlug, parent_id },
    });

    return NextResponse.json({ success: true, categoryId, slug: finalSlug });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 });
  }
}
