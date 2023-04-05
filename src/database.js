const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'electrondb',
  password: 'juli',
  port: 5432,
});

module.exports = {
  Pool,
  pool,
};