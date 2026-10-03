const mysql = require('mysql2/promise');

async function syncSerials() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'corenix_db',
  });

  try {
    console.log('Connected to MySQL database.');

    // 1. Fetch all inventory records where quantity > 0
    const [invRows] = await conn.query(`
      SELECT inv.product_id, inv.branch_id, inv.quantity, inv.reserved_qty,
             p.name as product_name, p.sku, p.barcode, b.name as branch_name, b.code as branch_code
      FROM inventory inv
      JOIN products p ON inv.product_id = p.id
      JOIN branches b ON inv.branch_id = b.id
      WHERE inv.quantity > 0
      ORDER BY inv.product_id, inv.branch_id
    `);

    console.log(`Found ${invRows.length} inventory records with positive stock.`);

    let totalCreated = 0;

    for (const item of invRows) {
      const netAvailable = item.quantity;
      const cleanSku = (item.sku || 'PRD').replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();

      // Check how many available serials already exist for this product & branch
      const [existingSerials] = await conn.query(
        `SELECT id, serial_number, barcode, status FROM product_serials 
         WHERE product_id = ? AND branch_id = ? AND status = 'available'
         ORDER BY id ASC`,
        [item.product_id, item.branch_id]
      );

      const existingCount = existingSerials.length;
      const needed = netAvailable - existingCount;

      if (needed > 0) {
        console.log(`[Product ${item.product_id} - ${item.sku}] Branch ${item.branch_id} (${item.branch_name}): Stock = ${netAvailable}, Existing Serials = ${existingCount}. Adding ${needed} serials...`);

        // Find highest existing index for this product & branch to avoid collision
        const [allExistingForBranch] = await conn.query(
          `SELECT serial_number FROM product_serials WHERE product_id = ? AND branch_id = ?`,
          [item.product_id, item.branch_id]
        );

        let serialIdx = 1;
        for (let i = 0; i < needed; i++) {
          let sn = '';
          let exists = true;
          while (exists) {
            sn = `SN-${cleanSku}-B${item.branch_id}-${String(serialIdx).padStart(3, '0')}`;
            const [check] = await conn.query('SELECT id FROM product_serials WHERE serial_number = ?', [sn]);
            if (check.length === 0) {
              exists = false;
            } else {
              serialIdx++;
            }
          }

          const barcode = item.barcode || `880${String(item.product_id).padStart(4, '0')}${item.branch_id}${String(serialIdx).padStart(2, '0')}`;

          await conn.query(
            `INSERT INTO product_serials (product_id, branch_id, serial_number, barcode, status) VALUES (?, ?, ?, ?, 'available')`,
            [item.product_id, item.branch_id, sn, barcode]
          );

          totalCreated++;
          serialIdx++;
        }
      }
    }

    console.log(`\nSuccessfully added ${totalCreated} missing serial numbers!`);

    // Fetch summary of AMD Ryzen 5 7600X
    const [ryzen] = await conn.query(`
      SELECT ps.id, ps.serial_number, ps.barcode, ps.status, b.name as branch_name
      FROM product_serials ps
      JOIN branches b ON ps.branch_id = b.id
      JOIN products p ON ps.product_id = p.id
      WHERE p.sku = 'CPU-AMD-7600X' AND ps.branch_id = 1
      ORDER BY ps.id ASC
    `);
    console.log(`\nAMD Ryzen 5 7600X at Central Main Warehouse (Branch 1): Now has ${ryzen.length} serials:`);
    console.table(ryzen);

  } catch (err) {
    console.error('Error syncing serials:', err);
  } finally {
    await conn.end();
  }
}

syncSerials();
