import React from 'react';
import { query } from '@/lib/db';
import ProductsManager, { ProductItem } from '@/components/admin/ProductsManager';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products = await query<ProductItem[]>(
    `SELECT p.*,
            b.name as brand_name,
            c.name as category_name,
            (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.id ASC LIMIT 1) as primary_image,
            (SELECT SUM(quantity) FROM inventory WHERE product_id = p.id) as total_stock
     FROM products p
     JOIN brands b ON p.brand_id = b.id
     JOIN categories c ON p.category_id = c.id
     GROUP BY p.id
     ORDER BY p.id DESC`
  );

  return <ProductsManager initialProducts={products} />;
}
