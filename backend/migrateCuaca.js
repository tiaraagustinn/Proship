import mysql from 'mysql2';
import { evalMamdani } from './src/utils/fuzzyMamdani.js';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_proship'
});

db.connect((err) => {
  if (err) {
    console.error('DB error:', err);
    process.exit(1);
  }
  console.log('Connected to DB for migration');

  db.query('SELECT * FROM cuaca_laut', async (err, rows) => {
    if (err) {
      console.error(err);
      db.end();
      process.exit(1);
    }

    try {
      for (const row of rows) {
        let wave = parseFloat(row.input_gelombang) || 0;
        let wind = parseFloat(row.input_angin) || 0;
        let curr = parseFloat(row.input_arus) || 0;

        let changed = false;

        // Jika input_arus dalam knot (< 10) dan bukan 0
        if (curr > 0 && curr < 10) {
          const originalCurr = curr;
          curr = curr * 51.444;
          row.input_arus = curr;
          row.kec_arus = Math.min(parseFloat((curr / 100).toFixed(2)), 9.99);
          changed = true;
          console.log(`id_cuaca ${row.id_cuaca}: converted current from ${originalCurr} to ${curr.toFixed(2)} cm/s`);
        }

        // Selalu recalculate score & category berdasarkan aturan baru
        const fuzzy = evalMamdani(wave, wind, curr);
        const newScore = fuzzy.score;
        const newCat = fuzzy.category.toLowerCase();

        if (row.skor_fuzzy !== newScore || row.tingkat_keselamatan !== newCat || changed) {
          console.log(`Updating id_cuaca ${row.id_cuaca}: score ${row.skor_fuzzy} -> ${newScore}, cat ${row.tingkat_keselamatan} -> ${newCat}`);
          
          await new Promise((resolve, reject) => {
            db.query(
              'UPDATE cuaca_laut SET input_arus = ?, kec_arus = ?, skor_fuzzy = ?, tingkat_keselamatan = ? WHERE id_cuaca = ?',
              [curr, row.kec_arus, newScore, newCat, row.id_cuaca],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
      }
      console.log('Migration complete!');
    } catch (error) {
      console.error('Migration error:', error);
    } finally {
      db.end();
    }
  });
});
