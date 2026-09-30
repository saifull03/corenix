import React from 'react';
import { query } from '@/lib/db';
import BrandsManager from '@/components/admin/BrandsManager';

export const dynamic = 'force-dynamic';

export default async function AdminBrandsPage() {
  const brands = await query<any[]>(
    `SELECT b.*,
            (SELECT COUNT(*) FROM products WHERE brand_id = b.id) as product_count
     FROM brands b
     ORDER BY b.is_featured DESC, b.name ASC`
  );

  return <BrandsManager initialBrands={brands} />;
}
