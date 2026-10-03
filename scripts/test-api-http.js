const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'corenix_super_secure_jwt_token_key_2026_enterprise';

async function testApiEndpoint() {
  try {
    const token = jwt.sign(
      { userId: 1, email: 'admin@corenix.com', roleId: 1, roleSlug: 'super_admin', type: 'staff' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Testing GET /api/admin/purchases/other-house/sales...');
    const res = await fetch('http://localhost:3000/api/admin/purchases/other-house/sales', {
      headers: {
        Cookie: `corenix_token=${token}`
      }
    });

    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response success:', data.success);
    console.log('Sales count:', data.sales?.length);
    console.log('Metrics:', data.metrics);
    if (data.sales && data.sales.length > 0) {
      console.log('First sale sample:', {
        invoice_no: data.sales[0].invoice_no,
        house_name: data.sales[0].house_name,
        product_name: data.sales[0].product_name,
        serial_number: data.sales[0].serial_number,
        total_amount: data.sales[0].total_amount,
        payment_status: data.sales[0].payment_status
      });
    }

    console.log('\nTesting GET /api/admin/partner-houses...');
    const resHouses = await fetch('http://localhost:3000/api/admin/partner-houses', {
      headers: {
        Cookie: `corenix_token=${token}`
      }
    });
    const housesData = await resHouses.json();
    console.log('Houses status:', resHouses.status, 'success:', housesData.success, 'count:', housesData.houses?.length);

    console.log('\nTesting GET /api/admin/purchases/other-house/ledger?house=Ryans%20Computers%20Ltd....');
    const resLedger = await fetch('http://localhost:3000/api/admin/purchases/other-house/ledger?house=Ryans%20Computers%20Ltd.', {
      headers: {
        Cookie: `corenix_token=${token}`
      }
    });
    const ledgerData = await resLedger.json();
    console.log('Ledger status:', resLedger.status, 'success:', ledgerData.success);
    if (ledgerData.summary) {
      console.log('Ledger Summary:', ledgerData.summary);
    }
  } catch (err) {
    console.error('API test error:', err);
  }
}

testApiEndpoint();
