import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
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
    return NextResponse.json({ error: error.message || 'Error fetching brands' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      slug,
      logo,
      banner,
      country,
      website,
      description,
      short_desc,
      is_featured,
      meta_title,
      meta_desc,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Brand name is required.' }, { status: 400 });
    }

    const cleanName = name.trim();
    const finalSlug = (slug?.trim() || cleanName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!finalSlug) {
      return NextResponse.json({ error: 'Invalid brand slug generated.' }, { status: 400 });
    }

    // Check slug collision
    const existing = await queryOne<any>(`SELECT id, name FROM brands WHERE slug = ?`, [finalSlug]);
    if (existing) {
      return NextResponse.json(
        { error: `A brand with slug '${finalSlug}' already exists (${existing.name}). Please use a distinct name or slug.` },
        { status: 409 }
      );
    }

    const res = await query<any>(
      `INSERT INTO brands (
        name, slug, logo, banner, country, website, description, short_desc,
        is_featured, is_active, meta_title, meta_desc
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        cleanName,
        finalSlug,
        logo?.trim() || null,
        banner?.trim() || null,
        country?.trim() || 'Global',
        website?.trim() || null,
        description?.trim() || '',
        short_desc?.trim() || '',
        is_featured ? 1 : 0,
        meta_title?.trim() || `${cleanName} Price in Bangladesh | Official CORENIX`,
        meta_desc?.trim() || `Buy genuine ${cleanName} products in Bangladesh with official manufacturer warranty at CORENIX.`,
      ]
    );

    const brandId = (res as any).insertId;

    await logAudit({
      module: 'Brands',
      action: 'Create Brand',
      recordId: brandId,
      newData: { name: cleanName, slug: finalSlug, country: country || 'Global', is_featured: !!is_featured },
    });

    const newBrand = await queryOne<any>(
      `SELECT b.*, 0 as product_count FROM brands b WHERE b.id = ?`,
      [brandId]
    );

    return NextResponse.json({ success: true, brand: newBrand });
  } catch (error: any) {
    console.error('Error creating brand:', error);
    return NextResponse.json({ error: error.message || 'Error creating brand' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      slug,
      logo,
      banner,
      country,
      website,
      description,
      short_desc,
      is_featured,
      is_active,
      meta_title,
      meta_desc,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Brand ID is required for updating.' }, { status: 400 });
    }

    const existing = await queryOne<any>(`SELECT * FROM brands WHERE id = ?`, [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Brand not found.' }, { status: 404 });
    }

    const cleanName = (name !== undefined ? name : existing.name).trim();
    const finalSlug = (slug !== undefined ? slug : existing.slug)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // Check if new slug collides with another brand
    if (finalSlug !== existing.slug) {
      const slugCollision = await queryOne<any>(`SELECT id FROM brands WHERE slug = ? AND id != ?`, [finalSlug, id]);
      if (slugCollision) {
        return NextResponse.json({ error: `Slug '${finalSlug}' is already used by another brand.` }, { status: 409 });
      }
    }

    await query(
      `UPDATE brands SET
        name = ?,
        slug = ?,
        logo = ?,
        banner = ?,
        country = ?,
        website = ?,
        description = ?,
        short_desc = ?,
        is_featured = ?,
        is_active = ?,
        meta_title = ?,
        meta_desc = ?
      WHERE id = ?`,
      [
        cleanName,
        finalSlug,
        logo !== undefined ? (logo?.trim() || null) : existing.logo,
        banner !== undefined ? (banner?.trim() || null) : existing.banner,
        country !== undefined ? (country?.trim() || 'Global') : existing.country,
        website !== undefined ? (website?.trim() || null) : existing.website,
        description !== undefined ? description : existing.description,
        short_desc !== undefined ? short_desc : existing.short_desc,
        is_featured !== undefined ? (is_featured ? 1 : 0) : existing.is_featured,
        is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
        meta_title !== undefined ? meta_title : existing.meta_title,
        meta_desc !== undefined ? meta_desc : existing.meta_desc,
        id,
      ]
    );

    await logAudit({
      module: 'Brands',
      action: 'Update Brand',
      recordId: id,
      oldData: existing,
      newData: { id, name: cleanName, slug: finalSlug },
    });

    const updated = await queryOne<any>(
      `SELECT b.*,
              (SELECT COUNT(*) FROM products WHERE brand_id = b.id) as product_count
       FROM brands b WHERE b.id = ?`,
      [id]
    );

    return NextResponse.json({ success: true, brand: updated });
  } catch (error: any) {
    console.error('Error updating brand:', error);
    return NextResponse.json({ error: error.message || 'Error updating brand' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const id = idParam ? parseInt(idParam) : null;

    if (!id) {
      return NextResponse.json({ error: 'Brand ID is required.' }, { status: 400 });
    }

    const existing = await queryOne<any>(`SELECT * FROM brands WHERE id = ?`, [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Brand not found.' }, { status: 404 });
    }

    // Check if any products are assigned to this brand
    const [prodCount] = await query<any[]>(
      `SELECT COUNT(*) as count FROM products WHERE brand_id = ?`,
      [id]
    );

    if (prodCount && prodCount.count > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete '${existing.name}' because ${prodCount.count} product(s) are currently assigned to it. Reassign or delete these products first.`,
        },
        { status: 400 }
      );
    }

    await query(`DELETE FROM brands WHERE id = ?`, [id]);

    await logAudit({
      module: 'Brands',
      action: 'Delete Brand',
      recordId: id,
      oldData: existing,
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('Error deleting brand:', error);
    return NextResponse.json({ error: error.message || 'Error deleting brand' }, { status: 500 });
  }
}
