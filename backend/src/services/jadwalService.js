import db from '../config/db.js';

export const getAllJadwal = (tanggal) => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT 
        j.id_jadwal,
        pa.nama_pelabuhan AS asal,
        pt.nama_pelabuhan AS tujuan,
        TIME(j.waktu_berangkat) AS jam,
        k.nama_kapal AS armada,
        c.tingkat_keselamatan
      FROM Jadwal_Pelayaran j
      JOIN Kapal k ON j.id_kapal = k.id_kapal
      JOIN Rute_Pelayaran r ON j.id_rute = r.id_rute
      JOIN Pelabuhan pa ON r.id_pelabuhan_asal = pa.id_pelabuhan
      JOIN Pelabuhan pt ON r.id_pelabuhan_tujuan = pt.id_pelabuhan
      JOIN Cuaca_Laut c ON j.id_cuaca = c.id_cuaca
    `;

    let params = [];

    if (tanggal) {
      sql += `
        WHERE j.waktu_berangkat BETWEEN ? AND ?
      `;
      params.push(`${tanggal} 00:00:00`, `${tanggal} 23:59:59`);
    }

    sql += ` ORDER BY j.waktu_berangkat`;

    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("SQL ERROR:", err); // 🔥 LIHAT ERROR ASLI
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};