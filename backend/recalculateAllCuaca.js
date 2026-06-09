import mysql from 'mysql2';
import { evalMamdani } from './src/utils/fuzzyMamdani.js';
import { getBmkgEntryForTime } from './src/services/bmkgCacheService.js';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_proship'
});

const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
  );

async function run() {
  console.log('Recalculating all cuaca_laut records based on schedules...');
  try {
    const schedules = await query(`
      SELECT j.id_jadwal, j.tanggal, j.waktu_berangkat, j.id_cuaca
      FROM jadwal_pelayaran j
      JOIN cuaca_laut c ON j.id_cuaca = c.id_cuaca
    `);

    for (const sched of schedules) {
      // Clean date format (YYYY-MM-DD)
      const dateObj = new Date(sched.tanggal);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const tanggal = `${year}-${month}-${day}`;
      const jam = sched.waktu_berangkat;
      
      const entry = await getBmkgEntryForTime('sabang-bandaAceh', tanggal, jam);
      if (!entry) {
        console.warn(`No BMKG entry found for schedule ${sched.id_jadwal} on ${tanggal} ${jam}`);
        continue;
      }

      const waveM   = parseFloat(entry.wave_height)   || 0;
      const windKt  = parseFloat(entry.wind_speed)     || 0;
      const currKmh = parseFloat(entry.current_speed)  || 0;
      const currCms = currKmh * 27.7778; // km/h → cm/s

      const fuzzy = evalMamdani(waveM, windKt, currCms);

      const kecAngin = Math.min(parseFloat((windKt  * 0.514).toFixed(2)), 9.99);
      const kecArus  = Math.min(parseFloat((currCms / 100  ).toFixed(2)), 9.99);
      const tinggi   = Math.min(parseFloat(waveM.toFixed(2)),             9.99);

      console.log(`Sched ${sched.id_jadwal} (${tanggal} ${jam}):`);
      console.log(`  Wave: ${waveM}m, Wind: ${windKt}kt, Current: ${currKmh} km/h -> ${currCms.toFixed(2)} cm/s`);
      console.log(`  Fuzzy Score: ${fuzzy.score}, Category: ${fuzzy.category}`);

      await query(
        `UPDATE cuaca_laut SET 
           kec_angin = ?, kec_arus = ?, tinggi_gelombang = ?,
           input_gelombang = ?, input_angin = ?, input_arus = ?,
           skor_fuzzy = ?, tingkat_keselamatan = ?
         WHERE id_cuaca = ?`,
        [kecAngin, kecArus, tinggi, waveM, windKt, currCms, fuzzy.score, fuzzy.category.toLowerCase(), sched.id_cuaca]
      );
    }
    console.log('Recalculation complete!');
  } catch (err) {
    console.error('Error during recalculation:', err);
  } finally {
    db.end();
  }
}

run();
