import { query } from './db';
import { Product } from './types';

export interface SearchOptions {
  q: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'relevance';
  limit?: number;
  offset?: number;
}

export async function searchProducts(options: SearchOptions): Promise<{
  products: Product[];
  total: number;
  facets: {
    categories: Array<{ id: number; name: string; slug: string; count: number }>;
    brands: Array<{ id: number; name: string; slug: string; count: number }>;
  };
}> {
  const {
    q,
    category,
    brand,
    minPrice,
    maxPrice,
    inStock,
    sortBy = 'relevance',
    limit = 24,
    offset = 0,
  } = options;

  const conditions: string[] = ["p.status = 'published'"];
  const params: any[] = [];

  // Search query filter
  if (q && q.trim().length > 0) {
    const cleanQ = q.trim();
    const searchPattern = `%${cleanQ}%`;
    conditions.push(`(
      p.name LIKE ? OR
      p.sku LIKE ? OR
      p.model LIKE ? OR
      b.name LIKE ? OR
      c.name LIKE ? OR
      EXISTS (
        SELECT 1 FROM product_specifications ps
        WHERE ps.product_id = p.id AND ps.attribute_value LIKE ?
      )
    )`);
    params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);

    // Track search analytics
    trackSearchQuery(cleanQ);
  }

  // Category filter
  if (category) {
    conditions.push('(c.slug = ? OR c.parent_id IN (SELECT id FROM categories WHERE slug = ?))');
    params.push(category, category);
  }

  // Brand filter
  if (brand) {
    const brandSlugs = brand.split(',');
    conditions.push(`b.slug IN (${brandSlugs.map(() => '?').join(',')})`);
    params.push(...brandSlugs);
  }

  // Price range
  if (minPrice !== undefined && minPrice > 0) {
    conditions.push('p.selling_price >= ?');
    params.push(minPrice);
  }
  if (maxPrice !== undefined && maxPrice > 0) {
    conditions.push('p.selling_price <= ?');
    params.push(maxPrice);
  }

  // In Stock filter
  if (inStock) {
    conditions.push(`EXISTS (
      SELECT 1 FROM inventory inv
      WHERE inv.product_id = p.id AND inv.quantity > inv.reserved_qty
    )`);
  }

  const whereClause = conditions.join(' AND ');

  // Sorting
  let orderBy = 'p.is_featured DESC, p.created_at DESC';
  if (sortBy === 'price_asc') {
    orderBy = 'p.selling_price ASC';
  } else if (sortBy === 'price_desc') {
    orderBy = 'p.selling_price DESC';
  } else if (sortBy === 'newest') {
    orderBy = 'p.created_at DESC';
  } else if (sortBy === 'relevance' && q) {
    orderBy = `CASE WHEN p.name LIKE ? THEN 1 WHEN p.sku LIKE ? THEN 2 ELSE 3 END, p.is_featured DESC`;
    params.unshift(`%${q.trim()}%`, `%${q.trim()}%`);
  }

  // Main search query
  const sql = `
    SELECT
      p.*,
      b.name as brand_name,
      b.slug as brand_slug,
      c.name as category_name,
      c.slug as category_slug,
      (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.id ASC LIMIT 1) as primary_image,
      (SELECT SUM(quantity - reserved_qty) FROM inventory WHERE product_id = p.id) as total_stock
    FROM products p
    JOIN brands b ON p.brand_id = b.id
    JOIN categories c ON p.category_id = c.id
    WHERE ${whereClause}
    GROUP BY p.id
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const queryParams = [...params, limit, offset];
  const products = await query<Product[]>(sql, queryParams);

  // Total count
  const countSql = `
    SELECT COUNT(*) as total
    FROM products p
    JOIN brands b ON p.brand_id = b.id
    JOIN categories c ON p.category_id = c.id
    WHERE ${whereClause}
  `;
  const countRes = await query<{ total: number }[]>(countSql, params.slice(q && sortBy === 'relevance' ? 2 : 0));
  const total = countRes[0]?.total || 0;

  // Facets
  const categoryFacets = await query<any[]>(
    `SELECT c.id, c.name, c.slug, COUNT(p.id) as count
     FROM products p
     JOIN categories c ON p.category_id = c.id
     JOIN brands b ON p.brand_id = b.id
     WHERE p.status = 'published'
     GROUP BY c.id, c.name, c.slug
     ORDER BY count DESC LIMIT 10`
  );

  const brandFacets = await query<any[]>(
    `SELECT b.id, b.name, b.slug, COUNT(p.id) as count
     FROM products p
     JOIN brands b ON p.brand_id = b.id
     WHERE p.status = 'published'
     GROUP BY b.id, b.name, b.slug
     ORDER BY count DESC LIMIT 10`
  );

  // If zero results, flag search analytics
  if (q && total === 0) {
    markZeroResults(q.trim());
  }

  return {
    products,
    total,
    facets: {
      categories: categoryFacets,
      brands: brandFacets,
    },
  };
}

export async function getAutocompleteSuggestions(queryText: string): Promise<Array<{
  text: string;
  type: 'product' | 'category' | 'brand';
  slug: string;
  image?: string;
  price?: number;
  discount_price?: number;
  sku?: string;
}>> {
  if (!queryText || queryText.trim().length < 2) return [];

  const pattern = `%${queryText.trim()}%`;
  const results: Array<{
    text: string;
    type: 'product' | 'category' | 'brand';
    slug: string;
    image?: string;
    price?: number;
    discount_price?: number;
    sku?: string;
  }> = [];

  // Products
  const products = await query<any[]>(
    `SELECT p.name, p.slug, p.sku, p.selling_price, p.discount_price, pi.image_url as primary_image
     FROM products p
     LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
     WHERE p.status = 'published' AND (p.name LIKE ? OR p.sku LIKE ? OR p.model LIKE ?)
     LIMIT 6`,
    [pattern, pattern, pattern]
  );
  products.forEach(p => results.push({
    text: p.name,
    type: 'product',
    slug: `/product/${p.slug}`,
    image: p.primary_image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=150&q=80',
    price: Number(p.selling_price || 0),
    discount_price: p.discount_price ? Number(p.discount_price) : undefined,
    sku: p.sku,
  }));

  // Categories
  const categories = await query<any[]>(
    `SELECT name, slug FROM categories WHERE is_active = 1 AND name LIKE ? LIMIT 3`,
    [pattern]
  );
  categories.forEach(c => results.push({ text: c.name, type: 'category', slug: `/category/${c.slug}` }));

  // Brands
  const brands = await query<any[]>(
    `SELECT name, slug FROM brands WHERE is_active = 1 AND name LIKE ? LIMIT 3`,
    [pattern]
  );
  brands.forEach(b => results.push({ text: b.name, type: 'brand', slug: `/brand/${b.slug}` }));

  return results;
}

async function trackSearchQuery(q: string) {
  try {
    await query(
      `INSERT INTO search_analytics (query, hits_count)
       VALUES (?, 1)
       ON DUPLICATE KEY UPDATE hits_count = hits_count + 1`,
      [q.toLowerCase()]
    );
  } catch (e) {
    // Ignore error
  }
}

async function markZeroResults(q: string) {
  try {
    await query(
      `UPDATE search_analytics SET zero_results = 1, results_count = 0 WHERE query = ?`,
      [q.toLowerCase()]
    );
  } catch (e) {
    // Ignore error
  }
}
