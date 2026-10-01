import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const isPcBuilder = searchParams.get('pc_builder');
    const q = searchParams.get('q');

    const conditions: string[] = ["p.status = 'published'"];
    const params: any[] = [];

    if (category) {
      conditions.push(`p.category_id IN (
        WITH RECURSIVE cat_tree AS (
          SELECT id FROM categories WHERE slug = ?
          UNION ALL
          SELECT c.id FROM categories c JOIN cat_tree ct ON c.parent_id = ct.id
        )
        SELECT id FROM cat_tree
      )`);
      params.push(category);
    }
    if (brand) {
      conditions.push('b.slug = ?');
      params.push(brand);
    }
    if (isPcBuilder === '1') {
      conditions.push('p.is_pc_builder = 1');
    }
    if (q) {
      conditions.push('(p.name LIKE ? OR p.sku LIKE ? OR p.model LIKE ?)');
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    const limitParam = parseInt(searchParams.get('limit') || '50', 10);
    const limit = Math.min(Math.max(1, isNaN(limitParam) ? 50 : limitParam), 500);

    const products = await query<any[]>(
      `SELECT p.*,
              b.name as brand_name, b.slug as brand_slug,
              c.name as category_name, c.slug as category_slug,
              pi.image_url as primary_image,
              (SELECT SUM(quantity - reserved_qty) FROM inventory WHERE product_id = p.id) as total_stock
       FROM products p
       JOIN brands b ON p.brand_id = b.id
       JOIN categories c ON p.category_id = c.id
       LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
       WHERE ${conditions.join(' AND ')}
       ORDER BY p.id DESC LIMIT ${limit}`,
      params
    );

    return NextResponse.json({ products });
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
      sku,
      model,
      brand_id,
      category_id,
      warranty_period,
      purchase_cost,
      selling_price,
      discount_price,
      is_featured = false,
      is_new = false,
      is_pc_builder = false,
      pc_builder_component = null,
      primary_image,
      overview,
      key_features = [],
      specs = [], // Array of { attribute_id, attribute_value }
      inventory = [], // Array of { branch_id, quantity }
      meta_title,
      meta_desc,
      focus_keyword,
    } = body;

    // 0. Auto-resolve slug uniqueness to prevent duplicate key errors
    let baseSlug = (slug || name || 'product')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    if (!baseSlug) baseSlug = 'product-' + Date.now().toString(36);
    let finalSlug = baseSlug;
    let slugCounter = 1;
    while (true) {
      const existing = await query<any[]>(`SELECT id FROM products WHERE slug = ? LIMIT 1`, [finalSlug]);
      if (!existing || existing.length === 0) break;
      slugCounter++;
      finalSlug = `${baseSlug}-${slugCounter}`;
    }

    // 0b. Auto-resolve SKU uniqueness
    let baseSku = (sku || `SKU-${Date.now().toString(36).toUpperCase()}`).trim();
    let finalSku = baseSku;
    let skuCounter = 1;
    while (true) {
      const existing = await query<any[]>(`SELECT id FROM products WHERE sku = ? LIMIT 1`, [finalSku]);
      if (!existing || existing.length === 0) break;
      skuCounter++;
      finalSku = `${baseSku}-${skuCounter}`;
    }

    const discountAmount = discount_price ? selling_price - discount_price : 0;
    const discountPercent = discount_price ? Math.round((discountAmount / selling_price) * 100) : 0;

    // 1. Insert product
    const pRes = await query<any>(
      `INSERT INTO products (
        name, slug, sku, model, brand_id, category_id, warranty_period,
        purchase_cost, avg_cost, selling_price, discount_price, min_selling_price,
        discount_amount, discount_percent, is_featured, is_new, is_pc_builder,
        pc_builder_component, seo_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 92)`,
      [
        name,
        finalSlug,
        finalSku,
        model || null,
        brand_id,
        category_id,
        warranty_period || '1 Year Official Warranty',
        purchase_cost || 0,
        purchase_cost || 0,
        selling_price,
        discount_price || null,
        purchase_cost ? purchase_cost * 1.05 : 0,
        discountAmount,
        discountPercent,
        is_featured ? 1 : 0,
        is_new ? 1 : 0,
        is_pc_builder ? 1 : 0,
        pc_builder_component || null,
      ]
    );

    const productId = (pRes as any).insertId;

    // 2. Primary Image
    if (primary_image) {
      await query(
        `INSERT INTO product_images (product_id, image_url, alt_text, is_primary) VALUES (?, ?, ?, 1)`,
        [productId, primary_image, name]
      );
    }

    // 3. Dynamic Specifications
    if (specs && Array.isArray(specs)) {
      for (const s of specs) {
        const val = s.attribute_value || s.value;
        const label = s.custom_label || s.label || s.name || s.key;
        if (!val || !val.toString().trim()) continue;

        let attrId = s.attribute_id;
        if (!attrId && label) {
          const code = (s.key || label).toString().toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 48);
          try {
            const existing = await query<any[]>(`SELECT id FROM attributes WHERE code = ? LIMIT 1`, [code]);
            if (existing && existing.length > 0) {
              attrId = existing[0].id;
            } else {
              const res = await query<any>(`INSERT INTO attributes (name, code) VALUES (?, ?)`, [label, code]);
              attrId = (res as any).insertId;
            }
          } catch {
            // fallback if attributes insert has edge collision
            const fallback = await query<any[]>(`SELECT id FROM attributes LIMIT 1`);
            if (fallback && fallback.length > 0) attrId = fallback[0].id;
          }
        }

        if (attrId) {
          await query(
            `INSERT INTO product_specifications (product_id, attribute_id, attribute_value, custom_label) VALUES (?, ?, ?, ?)`,
            [productId, attrId, val.toString().trim(), label || null]
          );
        }
      }
    }

    // 4. Structured Product Overview & Description
    await query(
      `INSERT INTO product_descriptions (product_id, overview, key_features_json, what_in_box, warranty_info)
       VALUES (?, ?, ?, ?, ?)`,
      [
        productId,
        overview || '',
        JSON.stringify(key_features),
        'Product, manual, documentation',
        warranty_period || 'Official Manufacturer Warranty'
      ]
    );

    // 5. Dedicated SEO & Schema
    await query(
      `INSERT INTO product_seo (product_id, meta_title, meta_desc, focus_keyword, canonical_url, og_title, og_desc)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        productId,
        meta_title || `${name} Price in Bangladesh | CORENIX`,
        meta_desc || `Buy ${name} at lowest price from CORENIX Bangladesh. Genuine warranty and multi-branch stock.`,
        focus_keyword || name.toLowerCase(),
        `https://corenix.com.bd/product/${finalSlug}`,
        meta_title || `${name} | CORENIX`,
        meta_desc || `Official ${name} available in Bangladesh.`
      ]
    );

    // 6. Location-Based Multi-Branch Inventory
    const branches = await query<any[]>(`SELECT id FROM branches`);
    for (const b of branches) {
      const branchStock = inventory.find((inv: any) => inv.branch_id === b.id)?.quantity || 5;
      await query(
        `INSERT INTO inventory (product_id, branch_id, quantity, reserved_qty, min_stock_level, shelf_location)
         VALUES (?, ?, ?, 0, 2, ?)`,
        [productId, b.id, branchStock, `SHELF-${b.id}-01`]
      );
    }

    // 7. Audit Log
    await logAudit({
      module: 'Catalogue',
      action: 'Create Product',
      recordId: productId,
      newData: { name, sku, finalSlug, selling_price },
    });

    return NextResponse.json({ success: true, productId, slug: finalSlug });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
