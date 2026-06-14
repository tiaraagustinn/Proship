import mysql from 'mysql2';
import 'dotenv/config';

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_proship',
  dateStrings: ['DATE']
});

db.connect((err) => {
  if (err) {
    console.error('DB error:', err);
  } else {
    console.log('DB connected!');
  }
});

export default db;