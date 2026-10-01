import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const product = await queryOne<any>(
      `SELECT p.*,
              b.name as brand_name, b.slug as brand_slug,
              c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [productId]
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const images = await query<any[]>(
      `SELECT id, image_url, alt_text, is_primary, order_index FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, id ASC`,
      [productId]
    );

    const description = await queryOne<any>(
      `SELECT * FROM product_descriptions WHERE product_id = ? LIMIT 1`,
      [productId]
    );

    const seo = await queryOne<any>(
      `SELECT * FROM product_seo WHERE product_id = ? LIMIT 1`,
      [productId]
    );

    const specs = await query<any[]>(
      `SELECT ps.id, ps.attribute_id, ps.attribute_value, ps.custom_label, a.name as attr_name, a.code as attr_code
       FROM product_specifications ps
       LEFT JOIN attributes a ON ps.attribute_id = a.id
       WHERE ps.product_id = ?
       ORDER BY ps.id ASC`,
      [productId]
    );

    const inventory = await query<any[]>(
      `SELECT inv.*, b.name as branch_name, b.code as branch_code, b.type as branch_type
       FROM inventory inv
       JOIN branches b ON inv.branch_id = b.id
       WHERE inv.product_id = ?
       ORDER BY b.id ASC`,
      [productId]
    );

    return NextResponse.json({
      product: {
        ...product,
        images,
        description,
        seo,
        specs,
        inventory,
      },
    });
  } catch (error: any) {
    console.error('Fetch product error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const body = await req.json();
    const {
      name,
      slug,
      sku,
      model,
      barcode,
      mpn,
      brand_id,
      category_id,
      warranty_period,
      status,
      purchase_cost,
      selling_price,
      discount_price,
      is_featured,
      is_new,
      is_pc_builder,
      pc_builder_component,
      primary_image,
      images,
      overview,
      key_features,
      what_in_box,
      warranty_info,
      specs,
      inventory,
      meta_title,
      meta_desc,
      focus_keyword,
    } = body;

    const discountAmount = discount_price ? Number(selling_price) - Number(discount_price) : 0;
    const discountPercent = discount_price && Number(selling_price) > 0 ? Math.round((discountAmount / Number(selling_price)) * 100) : 0;

    // 1. Update Core Product Table
    await query(
      `UPDATE products SET
        name = ?,
        slug = ?,
        sku = ?,
        model = ?,
        barcode = ?,
        mpn = ?,
        brand_id = ?,
        category_id = ?,
        warranty_period = ?,
        status = ?,
        purchase_cost = ?,
        selling_price = ?,
        discount_price = ?,
        discount_amount = ?,
        discount_percent = ?,
        is_featured = ?,
        is_new = ?,
        is_pc_builder = ?,
        pc_builder_component = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [
        name,
        slug,
        sku,
        model || null,
        barcode || null,
        mpn || null,
        brand_id,
        category_id,
        warranty_period || '1 Year Official Warranty',
        status || 'published',
        purchase_cost || 0,
        selling_price || 0,
        discount_price || null,
        discountAmount,
        discountPercent,
        is_featured ? 1 : 0,
        is_new ? 1 : 0,
        is_pc_builder ? 1 : 0,
        pc_builder_component || null,
        productId,
      ]
    );

    // 2. Update Primary / Additional Images
    if (primary_image) {
      const existingPrimary = await query<any[]>(
        `SELECT id FROM product_images WHERE product_id = ? AND is_primary = 1 LIMIT 1`,
        [productId]
      );
      if (existingPrimary && existingPrimary.length > 0) {
        await query(
          `UPDATE product_images SET image_url = ?, alt_text = ? WHERE id = ?`,
          [primary_image, name, existingPrimary[0].id]
        );
      } else {
        await query(
          `INSERT INTO product_images (product_id, image_url, alt_text, is_primary) VALUES (?, ?, ?, 1)`,
          [productId, primary_image, name]
        );
      }
    }

    // 3. Update Descriptions
    const descExists = await queryOne<any>(
      `SELECT id FROM product_descriptions WHERE product_id = ? LIMIT 1`,
      [productId]
    );

    const keyFeaturesJson = Array.isArray(key_features)
      ? JSON.stringify(key_features)
      : typeof key_features === 'string'
      ? key_features
      : '[]';

    if (descExists) {
      await query(
        `UPDATE product_descriptions SET
          overview = ?,
          key_features_json = ?,
          what_in_box = ?,
          warranty_info = ?
         WHERE product_id = ?`,
        [
          overview || '',
          keyFeaturesJson,
          what_in_box || 'Product, manual, documentation',
          warranty_info || warranty_period || 'Official Manufacturer Warranty',
          productId,
        ]
      );
    } else {
      await query(
        `INSERT INTO product_descriptions (product_id, overview, key_features_json, what_in_box, warranty_info)
         VALUES (?, ?, ?, ?, ?)`,
        [
          productId,
          overview || '',
          keyFeaturesJson,
          what_in_box || 'Product, manual, documentation',
          warranty_info || warranty_period || 'Official Manufacturer Warranty',
        ]
      );
    }

    // 4. Update SEO
    const seoExists = await queryOne<any>(
      `SELECT id FROM product_seo WHERE product_id = ? LIMIT 1`,
      [productId]
    );

    if (seoExists) {
      await query(
        `UPDATE product_seo SET
          meta_title = ?,
          meta_desc = ?,
          focus_keyword = ?,
          canonical_url = ?
         WHERE product_id = ?`,
        [
          meta_title || `${name} Price in Bangladesh | CORENIX`,
          meta_desc || `Buy ${name} at lowest price from CORENIX Bangladesh. Genuine warranty and multi-branch stock.`,
          focus_keyword || (name || '').toLowerCase(),
          `https://corenix.com.bd/product/${slug}`,
          productId,
        ]
      );
    } else {
      await query(
        `INSERT INTO product_seo (product_id, meta_title, meta_desc, focus_keyword, canonical_url, og_title, og_desc)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          productId,
          meta_title || `${name} Price in Bangladesh | CORENIX`,
          meta_desc || `Buy ${name} at lowest price from CORENIX Bangladesh. Genuine warranty and multi-branch stock.`,
          focus_keyword || (name || '').toLowerCase(),
          `https://corenix.com.bd/product/${slug}`,
          meta_title || `${name} | CORENIX`,
          meta_desc || `Official ${name} available in Bangladesh.`,
        ]
      );
    }

    // 5. Update Inventory per Branch
    if (inventory && Array.isArray(inventory)) {
      for (const inv of inventory) {
        if (!inv.branch_id) continue;
        const qty = parseInt(inv.quantity, 10) || 0;
        const existingInv = await queryOne<any>(
          `SELECT id FROM inventory WHERE product_id = ? AND branch_id = ? LIMIT 1`,
          [productId, inv.branch_id]
        );

        if (existingInv) {
          await query(
            `UPDATE inventory SET quantity = ?, shelf_location = ? WHERE id = ?`,
            [qty, inv.shelf_location || `SHELF-${inv.branch_id}-01`, existingInv.id]
          );
        } else {
          await query(
            `INSERT INTO inventory (product_id, branch_id, quantity, reserved_qty, min_stock_level, shelf_location)
             VALUES (?, ?, ?, 0, 2, ?)`,
            [productId, inv.branch_id, qty, inv.shelf_location || `SHELF-${inv.branch_id}-01`]
          );
        }
      }
    }

    // 6. Update Specifications if provided
    if (specs && Array.isArray(specs)) {
      await query(`DELETE FROM product_specifications WHERE product_id = ?`, [productId]);
      for (const s of specs) {
        const val = s.attribute_value || s.value;
        const label = s.custom_label || s.label || s.attr_name || s.name;
        if (!val || !val.toString().trim()) continue;

        let attrId = s.attribute_id;
        if (!attrId && label) {
          const code = label.toString().toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 48);
          const existingAttr = await queryOne<any>(`SELECT id FROM attributes WHERE code = ? LIMIT 1`, [code]);
          if (existingAttr) {
            attrId = existingAttr.id;
          } else {
            const res = await query<any>(`INSERT INTO attributes (name, code) VALUES (?, ?)`, [label, code]);
            attrId = (res as any).insertId;
          }
        }

        if (attrId) {
          await query(
            `INSERT INTO product_specifications (product_id, attribute_id, attribute_value, custom_label)
             VALUES (?, ?, ?, ?)`,
            [productId, attrId, val.toString().trim(), label || null]
          );
        }
      }
    }

    // 7. Audit Log
    await logAudit({
      module: 'Catalogue',
      action: 'Edit Product',
      recordId: productId,
      newData: { name, sku, slug, selling_price, status },
    });

    return NextResponse.json({ success: true, message: 'Product updated successfully' });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    // Set to archived / draft rather than hard cascade delete to maintain foreign key integrity with orders
    await query(`UPDATE products SET status = 'archived', updated_at = NOW() WHERE id = ?`, [productId]);

    await logAudit({
      module: 'Catalogue',
      action: 'Archive Product',
      recordId: productId,
    });

    return NextResponse.json({ success: true, message: 'Product archived successfully' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
