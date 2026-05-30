const { Pool } = require('pg');

// підключення до PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://reflect_user:reflect_pass@localhost:5488/reflect_db'
});

module.exports = pool;
