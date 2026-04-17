import { getAllJadwal, createJadwal, updateJadwal, deleteJadwal } from '../services/jadwalService.js';

export const getJadwal = async (req, res) => {
  try {
    const { tanggal } = req.query;
    const data = await getAllJadwal(tanggal);
    res.json(data);
  } catch (error) {
    console.error("JADWAL ERROR:", error);
    res.status(500).json({
      error: "Gagal ambil data",
      message: error.message,
      sqlError: error.sql || null
    });
  }
};

export const postJadwal = async (req, res) => {
  try {
    const { id_rute, id_kapal, tanggal, jam } = req.body;

    if (!id_rute || !id_kapal || !tanggal || !jam) {
      return res.status(400).json({ message: 'id_rute, id_kapal, tanggal, dan jam harus diisi' });
    }

    const waktu_berangkat = `${tanggal} ${jam}:00`;
    const insertId = await createJadwal(id_rute, id_kapal, waktu_berangkat);

    res.status(201).json({ success: true, message: 'Jadwal berhasil ditambahkan', id: insertId });
  } catch (error) {
    console.error("JADWAL CREATE ERROR:", error);
    res.status(500).json({ error: "Gagal tambah jadwal", message: error.message });
  }
};

export const putJadwal = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_rute, id_kapal, tanggal, jam } = req.body;

    if (!id_rute || !id_kapal || !tanggal || !jam) {
      return res.status(400).json({ message: 'id_rute, id_kapal, tanggal, dan jam harus diisi' });
    }

    const waktu_berangkat = `${tanggal} ${jam}:00`;
    const affected = await updateJadwal(id, id_rute, id_kapal, waktu_berangkat);

    if (affected === 0) {
      return res.status(404).json({ error: 'Jadwal tidak ditemukan' });
    }

    res.status(200).json({ success: true, message: 'Jadwal berhasil diupdate' });
  } catch (error) {
    console.error("JADWAL UPDATE ERROR:", error);
    res.status(500).json({ error: "Gagal update jadwal", message: error.message });
  }
};

export const removeJadwal = async (req, res) => {
  try {
    const { id } = req.params;
    const affected = await deleteJadwal(id);

    if (affected === 0) {
      return res.status(404).json({ error: 'Jadwal tidak ditemukan' });
    }

    res.status(200).json({ success: true, message: 'Jadwal berhasil dihapus' });
  } catch (error) {
    console.error("JADWAL DELETE ERROR:", error);
    res.status(500).json({ error: "Gagal hapus jadwal", message: error.message });
  }
};
