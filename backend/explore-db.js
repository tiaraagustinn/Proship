import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_proship',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function exploreTables() {
  try {
    const connection = await pool.getConnection();

    // Get all tables
    console.log('\n========== DATABASE TABLES ==========\n');
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'db_proship'`
    );
    
    const tableNames = tables.map(t => t.TABLE_NAME);
    console.log('Tables found:', tableNames);

    // For each table, get structure and sample data
    for (const tableName of tableNames) {
      console.log(`\n\n========== TABLE: ${tableName.toUpperCase()} ==========`);
      
      // Get column information
      console.log(`\n--- Structure of ${tableName} ---`);
      const [columns] = await connection.execute(
        `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'db_proship' AND TABLE_NAME = ?`,
        [tableName]
      );
      
      console.table(columns);

      // Get sample data (first 5 rows)
      console.log(`\n--- Sample Data from ${tableName} (first 5 rows) ---`);
      const [rows] = await connection.execute(
        `SELECT * FROM ${tableName} LIMIT 5`
      );
      
      if (rows.length === 0) {
        console.log('(no data)');
      } else {
        console.table(rows);
      }
    }

    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

exploreTables();
