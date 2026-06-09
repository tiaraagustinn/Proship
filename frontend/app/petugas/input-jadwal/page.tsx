"use client";

import { useState, useEffect } from 'react';
import { usePageTitle } from '@/app/petugas/layout';
import { Edit, Trash2, Plus } from 'lucide-react';

function formatTanggal(raw: string): string {
  if (!raw) return '-';
  const datePart = String(raw).substring(0, 10);
  const [year, month, day] = datePart.split('-');
  if (!year || !month || !day) return raw;
  return `${day}/${month}/${year}`;
}

const API = 'http://localhost:5000/api';

interface JadwalData {
  id_jadwal: number;
  id_rute: number;
  id_kapal: number;
  asal: string;
  tujuan: string;
  jam: string;
  tanggal: string;
  armada: string;
  status_jadwal: string;
  tingkat_keselamatan?: string;
}

interface RuteOption {
  id_rute: number;
  asal: string;
  tujuan: string;
  nama_rute: string;
}

interface KapalOption {
  id_kapal: number;
  nama_kapal: string;
}

export default function JadwalPage() {
  const { setTitle } = usePageTitle();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [jadwalData, setJadwalData] = useState<JadwalData[]>([]);
  const [ruteList, setRuteList] = useState<RuteOption[]>([]);
  const [kapalList, setKapalList] = useState<KapalOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    id_rute: '',
    id_kapal: '',
    tanggal: '',
    jam: '',
    status_jadwal: 'terjadwal',
  });

  useEffect(() => {
    setTitle('Input Jadwal');
    fetchData();
    fetchDropdowns();
  }, [setTitle]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/jadwal`);
      const data = await res.json();
      setJadwalData(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Gagal memuat data jadwal');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [ruteRes, kapalRes] = await Promise.all([
        fetch(`${API}/rute`),
        fetch(`${API}/kapal`),
      ]);
      const ruteJson = await ruteRes.json();
      const kapalJson = await kapalRes.json();
      setRuteList(ruteJson.data || []);
      setKapalList(kapalJson.data || []);
    } catch (err) {
      console.error('Gagal memuat dropdown:', err);
    }
  };

  const handleEdit = (item: JadwalData) => {
    setSelectedId(item.id_jadwal);
    setFormData({
      id_rute: String(item.id_rute),
      id_kapal: String(item.id_kapal),
      tanggal: item.tanggal ? String(item.tanggal).substring(0, 10) : '',
      jam: item.jam ? item.jam.substring(0, 5) : '',
      status_jadwal: item.status_jadwal || 'terjadwal',
    });
    setShowEditModal(true);
  };

  const handleDelete = (id: number) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({ id_rute: '', id_kapal: '', tanggal: '', jam: '', status_jadwal: 'terjadwal' });
    setSelectedId(null);
  };

  const handleSubmit = async () => {
    if (!formData.id_rute || !formData.id_kapal || !formData.tanggal || !formData.jam) {
      alert('Semua field harus diisi');
      return;
    }
    try {
      const token = sessionStorage.getItem('token') || '';
      const res = await fetch(`${API}/jadwal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Gagal menyimpan');
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      alert('Gagal menambah jadwal');
    }
  };

  const handleUpdate = async () => {
    if (!selectedId || !formData.id_rute || !formData.id_kapal || !formData.tanggal || !formData.jam) {
      alert('Semua field harus diisi');
      return;
    }
    try {
      const res = await fetch(`${API}/jadwal/${selectedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Gagal mengupdate');
      setShowEditModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      alert('Gagal mengupdate jadwal');
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedId == null) return;
    try {
      const res = await fetch(`${API}/jadwal/${selectedId}`, { method: 'DELETE' });
      if (!res.ok) {
        const result = await res.json();
        alert(result.error || 'Gagal menghapus jadwal');
        return;
      }
      setShowDeleteModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      alert('Gagal menghapus jadwal');
    }
  };

  const filteredData = jadwalData.filter(item => {
    const keywords = searchQuery.toLowerCase().split(' ');
    const tanggalFormatted = formatTanggal(item.tanggal).toLowerCase();
    return keywords.every(word =>
      item.asal?.toLowerCase().includes(word) ||
      item.tujuan?.toLowerCase().includes(word) ||
      item.armada?.toLowerCase().includes(word) ||
      item.jam?.toLowerCase().includes(word) ||
      tanggalFormatted.includes(word) ||
      item.tanggal?.toLowerCase().includes(word) ||
      item.status_jadwal?.toLowerCase().includes(word)
    );
  });

  const ModalForm = ({ title, onSubmit, onCancel, submitLabel, submitClass }: {
    title: string;
    onSubmit: () => void;
    onCancel: () => void;
    submitLabel: string;
    submitClass: string;
  }) => (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-[420px] shadow-2xl border border-white/30">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>

        <label className="block text-sm text-gray-600 mb-1">Rute</label>
        <select name="id_rute" value={formData.id_rute} onChange={handleChange} className="w-full mb-3 p-2 border rounded">
          <option value="">Pilih Rute</option>
          {ruteList.map(r => (
            <option key={r.id_rute} value={r.id_rute}>{r.asal} → {r.tujuan}</option>
          ))}
        </select>

        <label className="block text-sm text-gray-600 mb-1">Armada</label>
        <select name="id_kapal" value={formData.id_kapal} onChange={handleChange} className="w-full mb-3 p-2 border rounded">
          <option value="">Pilih Armada</option>
          {kapalList.map(k => (
            <option key={k.id_kapal} value={k.id_kapal}>{k.nama_kapal}</option>
          ))}
        </select>

        <label className="block text-sm text-gray-600 mb-1">Tanggal</label>
        <input
          type="date"
          name="tanggal"
          value={formData.tanggal}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
        />

        <label className="block text-sm text-gray-600 mb-1">Jam Berangkat</label>
        <input
          type="time"
          name="jam"
          value={formData.jam}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
        />

        <label className="block text-sm text-gray-600 mb-1">Status Jadwal</label>
        <select name="status_jadwal" value={formData.status_jadwal} onChange={handleChange} className="w-full mb-4 p-2 border rounded">
          <option value="terjadwal">Terjadwal</option>
          <option value="berlangsung">Berlangsung</option>
          <option value="selesai">Selesai</option>
          <option value="dibatalkan">Dibatalkan</option>
          <option value="ditunda">Ditunda</option>
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">Batal</button>
          <button onClick={onSubmit} className={`px-4 py-2 text-white rounded ${submitClass}`}>{submitLabel}</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="m-3 md:m-7 p-4 md:p-8 bg-white rounded-lg shadow">
      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Cari jadwal"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg w-full sm:w-80 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition"
        >
          <Plus className="w-5 h-5" />
          Tambah Data
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden border-8 border-teal-700 shadow-lg">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500 bg-white">Memuat data...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 bg-white">{error}</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-teal-800 text-white">
                  <th className="p-4 text-center font-semibold">Keberangkatan</th>
                  <th className="p-4 text-center font-semibold">Kedatangan</th>
                  <th className="p-4 text-center font-semibold">Tanggal</th>
                  <th className="p-4 text-center font-semibold">Jam</th>
                  <th className="p-4 text-center font-semibold">Armada</th>
                  <th className="p-4 text-center font-semibold">Status</th>
                  <th className="p-4 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={item.id_jadwal} className={`${index % 2 === 0 ? 'bg-gray-200' : 'bg-white'} hover:bg-gray-100 transition`}>
                    <td className="p-4 text-center text-gray-800 border-r border-gray-300">{item.asal}</td>
                    <td className="p-4 text-center text-gray-800 border-r border-gray-300">{item.tujuan}</td>
                    <td className="p-4 text-center text-gray-800 border-r border-gray-300">{formatTanggal(item.tanggal)}</td>
                    <td className="p-4 text-center text-gray-800 border-r border-gray-300">{item.jam ? item.jam.substring(0, 5) : '-'}</td>
                    <td className="p-4 text-center text-gray-800 border-r border-gray-300">{item.armada}</td>
                    <td className="p-4 text-center border-r border-gray-300">
                      <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${
                        item.status_jadwal === 'terjadwal'   ? 'bg-blue-500'   :
                        item.status_jadwal === 'berlangsung' ? 'bg-purple-400' :
                        item.status_jadwal === 'selesai'     ? 'bg-green-500'  :
                        item.status_jadwal === 'dibatalkan'  ? 'bg-red-500'    :
                        item.status_jadwal === 'ditunda'     ? 'bg-orange-400' : 'bg-gray-400'
                      }`}>
                        {item.status_jadwal || '-'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id_jadwal)} className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && !error && filteredData.length === 0 && (
          <div className="p-8 text-center text-gray-500 bg-white">Tidak ada jadwal yang ditemukan</div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">Total {filteredData.length} jadwal</div>

      {/* Modals */}
      {showAddModal && (
        <ModalForm
          title="Tambah Jadwal"
          onSubmit={handleSubmit}
          onCancel={() => { setShowAddModal(false); resetForm(); }}
          submitLabel="Simpan"
          submitClass="bg-green-600 hover:bg-green-700"
        />
      )}

      {showEditModal && (
        <ModalForm
          title="Edit Jadwal"
          onSubmit={handleUpdate}
          onCancel={() => { setShowEditModal(false); resetForm(); }}
          submitLabel="Simpan Perubahan"
          submitClass="bg-blue-600 hover:bg-blue-700"
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-[540px] rounded-[18px] shadow-2xl px-8 py-9 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hapus Jadwal</h2>
            <p className="text-base text-gray-600 leading-relaxed max-w-[430px]">
              Apakah Anda yakin ingin menghapus jadwal ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedId(null); }}
                className="min-w-[96px] px-6 py-3 bg-[#D1D5DB] text-gray-900 rounded-md text-base font-medium hover:bg-gray-400 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="min-w-[96px] px-6 py-3 bg-[#E30613] text-white rounded-md text-base font-medium hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
