const mysql = require('mysql2/promise');

async function ensureRoles() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'corenix_db'
  });

  try {
    const [existing] = await conn.query("SELECT * FROM roles WHERE slug IN ('hr', 'hr-manager') OR name LIKE '%HR%'");
    if (existing.length === 0) {
      await conn.query(
        "INSERT INTO roles (name, slug, description, is_system) VALUES ('HR Manager', 'hr-manager', 'Human Resources & Personnel Operations', 1)"
      );
      console.log('Added HR Manager role.');
    } else {
      console.log('HR role already exists:', existing);
    }

    const [allRoles] = await conn.query('SELECT id, name, slug FROM roles ORDER BY id ASC');
    console.table(allRoles);
  } finally {
    await conn.end();
  }
}

ensureRoles();
