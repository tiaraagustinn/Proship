import mysql from 'mysql2';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_proship',
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