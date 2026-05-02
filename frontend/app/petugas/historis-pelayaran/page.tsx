"use client";

import { useState, useEffect, useMemo } from 'react';
import { usePageTitle } from '@/app/petugas/layout';
import { Edit, Trash2, Filter, X } from 'lucide-react';

const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function formatTanggal(raw: string): string {
  if (!raw) return '-';
  const datePart = String(raw).substring(0, 10);
  const [year, month, day] = datePart.split('-');
  if (!year || !month || !day) return raw;
  return `${day}/${month}/${year}`;
}

interface HistorisData {
  id_historis: number;
  tanggal: string;
  keberangkatan: string;
  tujuan: string;
  jumlahPenumpang: number;
  kendaraanRoda2: number;
  kendaraanRoda4: number;
  beratMuatan: number;
  armada: string;
  id_jadwal: number;
}

interface JadwalOption {
  id_jadwal: number;
  asal: string;
  tujuan: string;
  jam: string;
  armada: string;
}

export default function HistorisPelayaranPage() {
  const { setTitle } = usePageTitle();
  const [historisData, setHistorisData] = useState<HistorisData[]>([]);
  const [jadwalList, setJadwalList] = useState<JadwalOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    id_jadwal: number;
    jmlh_penumpang: number;
    jmlh_kend_r2: number;
    jmlh_kend_r4: number;
    berat_muatan: number;
  } | null>(null);

  // Filter state
  const [filterBulan, setFilterBulan] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  const [filterRute, setFilterRute] = useState('');

  useEffect(() => { setTitle('Historis Pelayaran'); }, [setTitle]);

  const fetchHistoris = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/historis')
      .then(res => res.json())
      .then(data => { if (data.success) setHistorisData(data.data); })
      .catch(err => console.error('Gagal fetch historis:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistoris();
    fetch('http://localhost:5000/api/jadwal')
      .then(res => res.json())
      .then(data => setJadwalList(Array.isArray(data) ? data : []));
  }, []);

  // Derived filter options
  const tahunOptions = useMemo(() =>
    [...new Set(historisData.map(d => d.tanggal.substring(0, 4)))].sort().reverse()
  , [historisData]);

  const ruteOptions = useMemo(() =>
    [...new Set(historisData.map(d => `${d.keberangkatan} → ${d.tujuan}`))].sort()
  , [historisData]);

  // Filtered data
  const filteredData = useMemo(() => {
    return historisData.filter(item => {
      const date = item.tanggal.substring(0, 10);
      const [year, month] = date.split('-');
      if (filterTahun && year !== filterTahun) return false;
      if (filterBulan && parseInt(month) !== parseInt(filterBulan)) return false;
      if (filterRute && `${item.keberangkatan} → ${item.tujuan}` !== filterRute) return false;
      return true;
    });
  }, [historisData, filterTahun, filterBulan, filterRute]);

  const hasFilter = filterBulan || filterTahun || filterRute;

  const resetFilter = () => { setFilterBulan(''); setFilterTahun(''); setFilterRute(''); setSelectedIds([]); setSelectAll(false); };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredData.map(item => item.id_historis));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectRow = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(s => s !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleEdit = (item: HistorisData) => {
    setEditForm({
      id_jadwal: item.id_jadwal,
      jmlh_penumpang: item.jumlahPenumpang,
      jmlh_kend_r2: item.kendaraanRoda2,
      jmlh_kend_r4: item.kendaraanRoda4,
      berat_muatan: item.beratMuatan,
    });
    setEditingId(item.id_historis);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm || !editingId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/historis/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) { setIsEditModalOpen(false); setEditingId(null); setEditForm(null); fetchHistoris(); }
      else alert('Gagal mengupdate data');
    } catch { alert('Terjadi kesalahan koneksi'); }
  };

  const handleDelete = (id: number) => { setDeletingId(id); setIsDeleteModalOpen(true); };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/historis/${deletingId}`, { method: 'DELETE' });
      if (res.ok) { setIsDeleteModalOpen(false); setDeletingId(null); setSelectedIds(selectedIds.filter(id => id !== deletingId)); fetchHistoris(); }
      else alert('Gagal menghapus data');
    } catch { alert('Terjadi kesalahan koneksi'); }
  };

  const handleExportCSV = () => {
    const exportData = selectedIds.length > 0
      ? filteredData.filter(item => selectedIds.includes(item.id_historis))
      : filteredData;
    const headers = ['Tanggal','Keberangkatan','Tujuan','Penumpang','Roda 2','Roda 4','Muatan (ton)','Armada'];
    const rows = exportData.map(item => [
      item.tanggal, item.keberangkatan, item.tujuan,
      item.jumlahPenumpang, item.kendaraanRoda2, item.kendaraanRoda4,
      item.beratMuatan, item.armada
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const nameParts = [
      'historis_pelayaran',
      filterTahun || '',
      filterBulan ? BULAN[parseInt(filterBulan) - 1] : '',
      filterRute ? filterRute.replace(' → ', '-') : '',
    ].filter(Boolean);
    link.download = nameParts.join('_') + '.csv';
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportModalOpen(false);
  };

  return (
    <div className="m-3 md:m-7 p-4 md:p-8 bg-white rounded-lg shadow">

      {/* Filter Bar */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-5 py-4 mb-4 flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
          <Filter className="w-4 h-4" />
          Filter
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Tahun</label>
          <select
            value={filterTahun}
            onChange={e => { setFilterTahun(e.target.value); setSelectedIds([]); setSelectAll(false); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 min-w-[100px]"
          >
            <option value="">Semua</option>
            {tahunOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Bulan</label>
          <select
            value={filterBulan}
            onChange={e => { setFilterBulan(e.target.value); setSelectedIds([]); setSelectAll(false); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 min-w-[130px]"
          >
            <option value="">Semua</option>
            {BULAN.map((b, i) => <option key={i} value={String(i + 1)}>{b}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Rute</label>
          <select
            value={filterRute}
            onChange={e => { setFilterRute(e.target.value); setSelectedIds([]); setSelectAll(false); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 min-w-[200px]"
          >
            <option value="">Semua Rute</option>
            {ruteOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {hasFilter && (
          <button
            onClick={resetFilter}
            className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition"
          >
            <X className="w-3.5 h-3.5" /> Reset
          </button>
        )}

        <div className="ml-auto text-sm text-gray-500">
          {filteredData.length} data{hasFilter ? ' (difilter)' : ''}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="p-4 text-left w-12">
                  <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="w-4 h-4 cursor-pointer" />
                </th>
                <th className="p-4 text-left font-semibold text-gray-700">Tanggal</th>
                <th className="p-4 text-left font-semibold text-gray-700">Keberangkatan</th>
                <th className="p-4 text-left font-semibold text-gray-700">Tujuan</th>
                <th className="p-4 text-left font-semibold text-gray-700">Penumpang</th>
                <th className="p-4 text-left font-semibold text-gray-700">Roda 2</th>
                <th className="p-4 text-left font-semibold text-gray-700">Roda 4</th>
                <th className="p-4 text-left font-semibold text-gray-700">Muatan (ton)</th>
                <th className="p-4 text-left font-semibold text-gray-700">Armada</th>
                <th className="p-4 text-center font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="p-8 text-center text-gray-400">Memuat data...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={10} className="p-8 text-center text-gray-400">{hasFilter ? 'Tidak ada data untuk filter yang dipilih' : 'Belum ada data historis pelayaran'}</td></tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id_historis} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition`}>
                    <td className="p-4">
                      <input type="checkbox" checked={selectedIds.includes(item.id_historis)} onChange={() => handleSelectRow(item.id_historis)} className="w-4 h-4 cursor-pointer" />
                    </td>
                    <td className="p-4 text-gray-700">{formatTanggal(item.tanggal)}</td>
                    <td className="p-4 text-gray-700">{item.keberangkatan}</td>
                    <td className="p-4 text-gray-700">{item.tujuan}</td>
                    <td className="p-4 text-gray-700">{item.jumlahPenumpang}</td>
                    <td className="p-4 text-gray-700">{item.kendaraanRoda2}</td>
                    <td className="p-4 text-gray-700">{item.kendaraanRoda4}</td>
                    <td className="p-4 text-gray-700">{item.beratMuatan}</td>
                    <td className="p-4 text-gray-700">{item.armada}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id_historis)} className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">{selectedIds.length} item dipilih</div>
      )}

      <div className="flex justify-end mb-6">
        <button
          onClick={() => setIsExportModalOpen(true)}
          disabled={selectedIds.length === 0}
          className={`px-8 py-3 mt-5 font-semibold rounded-lg transition ${selectedIds.length === 0 ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
        >
          Export Data {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
        </button>
      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-[540px] rounded-[18px] shadow-2xl px-8 py-9 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Export Data</h2>
            <p className="text-base text-gray-600 leading-relaxed max-w-[430px] mb-2">
              Export {selectedIds.length > 0 ? `${selectedIds.length} data dipilih` : `${filteredData.length} data`}
              {hasFilter && ` (terfilter)`}
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsExportModalOpen(false)} className="min-w-[96px] px-6 py-3 bg-[#D1D5DB] text-gray-900 rounded-md text-base font-medium hover:bg-gray-400 transition-colors">Batal</button>
              <button onClick={handleExportCSV} className="min-w-[96px] px-6 py-3 bg-green-600 text-white rounded-md text-base font-medium hover:bg-green-700 transition-colors">Export CSV</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-[420px] shadow-2xl border border-white/30">
            <h2 className="text-lg font-semibold mb-4">Edit Historis</h2>
            <label className="block text-sm text-gray-600 mb-1">Jadwal Pelayaran</label>
            <select value={editForm.id_jadwal} onChange={e => setEditForm({ ...editForm, id_jadwal: Number(e.target.value) })} className="w-full mb-3 p-2 border rounded">
              {jadwalList.map(j => (
                <option key={j.id_jadwal} value={j.id_jadwal}>{j.asal} → {j.tujuan} | {j.jam} | {j.armada}</option>
              ))}
            </select>
            <label className="block text-sm text-gray-600 mb-1">Jumlah Penumpang</label>
            <input type="number" value={editForm.jmlh_penumpang} onChange={e => setEditForm({ ...editForm, jmlh_penumpang: Number(e.target.value) })} className="w-full mb-3 p-2 border rounded" min="0" />
            <label className="block text-sm text-gray-600 mb-1">Kendaraan Roda 2</label>
            <input type="number" value={editForm.jmlh_kend_r2} onChange={e => setEditForm({ ...editForm, jmlh_kend_r2: Number(e.target.value) })} className="w-full mb-3 p-2 border rounded" min="0" />
            <label className="block text-sm text-gray-600 mb-1">Kendaraan Roda 4</label>
            <input type="number" value={editForm.jmlh_kend_r4} onChange={e => setEditForm({ ...editForm, jmlh_kend_r4: Number(e.target.value) })} className="w-full mb-3 p-2 border rounded" min="0" />
            <label className="block text-sm text-gray-600 mb-1">Berat Muatan (ton)</label>
            <input type="number" step="0.01" value={editForm.berat_muatan} onChange={e => setEditForm({ ...editForm, berat_muatan: Number(e.target.value) })} className="w-full mb-4 p-2 border rounded" min="0" />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setIsEditModalOpen(false); setEditingId(null); setEditForm(null); }} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition">Batal</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-[540px] rounded-[18px] shadow-2xl px-8 py-9 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hapus Historis</h2>
            <p className="text-base text-gray-600 leading-relaxed max-w-[430px]">
              Apakah Anda yakin ingin menghapus data historis ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setIsDeleteModalOpen(false)} className="min-w-[96px] px-6 py-3 bg-[#D1D5DB] text-gray-900 rounded-md text-base font-medium hover:bg-gray-400 transition-colors">Batal</button>
              <button onClick={handleConfirmDelete} className="min-w-[96px] px-6 py-3 bg-[#E30613] text-white rounded-md text-base font-medium hover:bg-red-700 transition-colors">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
