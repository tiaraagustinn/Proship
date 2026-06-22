"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePageTitle } from '@/app/petugas/layout';
import { Edit, Trash2, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function formatTanggal(raw: string): string {
  if (!raw) return '-';
  const datePart = String(raw).substring(0, 10);
  const [year, month, day] = datePart.split('-');
  if (!year || !month || !day) return raw;
  return `${day}/${month}/${year}`;
}

interface ManifesData {
  id: string;
  tanggal: string;
  jam: string;
  asal: string;
  tujuan: string;
  jmlh_penumpang: number;
  jmlh_kend_r2: number;
  jmlh_kend_r4: number;
  berat_muatan: number;
  armada: string;
  kapasitas_kapal: number;
}

export default function HistorisPelayaranPage() {
  const { setTitle } = usePageTitle();
  const [manifesData, setManifesData] = useState<ManifesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    jmlh_penumpang: number;
    jmlh_kend_r2: number;
    jmlh_kend_r4: number;
    berat_muatan: number;
  } | null>(null);

  // Filter state
  const [filterBulan, setFilterBulan] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  const [filterRute, setFilterRute] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { setTitle('Historis Angkutan'); }, [setTitle]);

  const fetchManifes = () => {
    setLoading(true);
    fetch(API_BASE + '/historis')
      .then(res => res.json())
      .then(data => { if (data.success) setManifesData(data.data.map((h: { id_historis: string; tanggal: string; jam: string; asal: string; tujuan: string; jmlh_penumpang: number; jmlh_kend_r2: number; jmlh_kend_r4: number; berat_muatan: number; armada: string; load_factor: number; kapasitas_kapal: number }) => ({ ...h, id: h.id_historis }))); })
      .catch(err => console.error('Gagal fetch historis:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchManifes(); }, []);

  // Derived filter options
  const tahunOptions = useMemo(() =>
    [...new Set(manifesData.map(d => d.tanggal ? d.tanggal.substring(0, 4) : ''))].filter(Boolean).sort().reverse()
  , [manifesData]);

  const ruteOptions = useMemo(() =>
    [...new Set(manifesData.map(d => `${d.asal} → ${d.tujuan}`))].sort()
  , [manifesData]);

  // Filtered data
  const filteredData = useMemo(() => {
    return manifesData.filter(item => {
      const date = item.tanggal ? item.tanggal.substring(0, 10) : '';
      const [year, month] = date.split('-');
      if (filterTahun && year !== filterTahun) return false;
      if (filterBulan && parseInt(month) !== parseInt(filterBulan)) return false;
      if (filterRute && `${item.asal} → ${item.tujuan}` !== filterRute) return false;
      return true;
    });
  }, [manifesData, filterTahun, filterBulan, filterRute]);

  // Pagination derived
  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); setSelectedIds([]); setSelectAll(false); }, [filterBulan, filterTahun, filterRute]);

  const hasFilter = filterBulan || filterTahun || filterRute;
  const resetFilter = () => { setFilterBulan(''); setFilterTahun(''); setFilterRute(''); setSelectedIds([]); setSelectAll(false); setCurrentPage(1); };

  // Pagination page numbers helper
  const getPageNumbers = useCallback(() => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  const handleSelectAll = () => {
    if (selectAll) { setSelectedIds([]); }
    else { setSelectedIds(pagedData.map(item => item.id)); }
    setSelectAll(!selectAll);
  };

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) { setSelectedIds(selectedIds.filter(s => s !== id)); }
    else { setSelectedIds([...selectedIds, id]); }
  };

  const handleEdit = (item: ManifesData) => {
    setEditForm({
      jmlh_penumpang: item.jmlh_penumpang,
      jmlh_kend_r2: item.jmlh_kend_r2,
      jmlh_kend_r4: item.jmlh_kend_r4,
      berat_muatan: item.berat_muatan,
    });
    setEditingId(item.id);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm || !editingId) return;
    try {
      const res = await fetch(`${API_BASE}/historis/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) { setIsEditModalOpen(false); setEditingId(null); setEditForm(null); fetchManifes(); }
      else alert('Gagal mengupdate data');
    } catch { alert('Terjadi kesalahan koneksi'); }
  };

  const handleDelete = (id: string) => { setDeletingId(id); setIsDeleteModalOpen(true); };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`${API_BASE}/historis/${deletingId}`, { method: 'DELETE' });
      if (res.ok) { setIsDeleteModalOpen(false); setDeletingId(null); setSelectedIds(selectedIds.filter(id => id !== deletingId)); fetchManifes(); }
      else alert('Gagal menghapus data');
    } catch { alert('Terjadi kesalahan koneksi'); }
  };

  const handleExportCSV = () => {
    const exportData = selectedIds.length > 0
      ? filteredData.filter(item => selectedIds.includes(item.id))
      : filteredData;
    const headers = ['Tanggal','Jam Berangkat','Keberangkatan','Tujuan','Penumpang','Roda 2','Roda 4','Muatan (ton)','Armada'];
    const rows = exportData.map(item => [
      item.tanggal ? item.tanggal.substring(0, 10) : '-',
      item.jam || '-',
      item.asal, item.tujuan,
      item.jmlh_penumpang, item.jmlh_kend_r2, item.jmlh_kend_r4,
      item.berat_muatan, item.armada
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
      <div className="bg-white rounded-lg px-5 py-4 mb-4 flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
          <Filter className="w-4 h-4" /> Filter
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Tahun</label>
          <select value={filterTahun} onChange={e => { setFilterTahun(e.target.value); setSelectedIds([]); setSelectAll(false); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 min-w-[100px]">
            <option value="">Semua</option>
            {tahunOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Bulan</label>
          <select value={filterBulan} onChange={e => { setFilterBulan(e.target.value); setSelectedIds([]); setSelectAll(false); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 min-w-[130px]">
            <option value="">Semua</option>
            {BULAN.map((b, i) => <option key={i} value={String(i + 1)}>{b}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Rute</label>
          <select value={filterRute} onChange={e => { setFilterRute(e.target.value); setSelectedIds([]); setSelectAll(false); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 min-w-[200px]">
            <option value="">Semua Rute</option>
            {ruteOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        {hasFilter && (
          <button onClick={resetFilter} className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition">
            <X className="w-3.5 h-3.5" /> Reset
          </button>
        )}
        <div className="ml-auto text-sm text-gray-500">{filteredData.length} data{hasFilter ? ' (difilter)' : ''}</div>
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
                <th className="p-4 text-left font-semibold text-gray-700">Jam Berangkat</th>
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
                <tr><td colSpan={11} className="p-8 text-center text-gray-400">Memuat data...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={11} className="p-8 text-center text-gray-400">{hasFilter ? 'Tidak ada data untuk filter yang dipilih' : 'Belum ada data historis angkutan'}</td></tr>
              ) : (
                pagedData.map((item, index) => (
                  <tr key={item.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition`}>
                    <td className="p-4">
                      <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelectRow(item.id)} className="w-4 h-4 cursor-pointer" />
                    </td>
                    <td className="p-4 text-gray-700">{formatTanggal(item.tanggal)}</td>
                    <td className="p-4 text-gray-700">{item.jam ? item.jam.substring(0, 5) : '-'}</td>
                    <td className="p-4 text-gray-700">{item.asal}</td>
                    <td className="p-4 text-gray-700">{item.tujuan}</td>
                    <td className="p-4 text-gray-700">{item.jmlh_penumpang}</td>
                    <td className="p-4 text-gray-700">{item.jmlh_kend_r2}</td>
                    <td className="p-4 text-gray-700">{item.jmlh_kend_r4}</td>
                    <td className="p-4 text-gray-700">{item.berat_muatan}</td>
                    <td className="p-4 text-gray-700">{item.armada || '-'}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition" title="Hapus">
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

      {/* Pagination */}
      {!loading && filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1">
          <p className="text-sm text-gray-500">
            Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} dari {filteredData.length} data
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {getPageNumbers().map((page, i) =>
              page === '...' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium border transition ${
                    currentPage === page
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              )
            )}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="mt-4 text-sm text-white">{selectedIds.length} item dipilih</div>
      )}

      <div className="flex justify-end mb-6">
        <button
          onClick={() => setIsExportModalOpen(true)}
          disabled={selectedIds.length === 0}
          className={`px-8 py-3 mt-5 font-semibold rounded-lg transition ${selectedIds.length === 0 ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
        >
          Export Data {selectedIds.length > 0 ? `(${selectedIds.length} dipilih)` : ''}
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
          <div className="bg-white p-6 rounded-xl w-full max-w-[420px] shadow-2xl">
            <h2 className="text-lg font-semibold mb-4">Edit Data Historis</h2>
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
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-[540px] rounded-[18px] shadow-2xl px-8 py-9 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hapus Historis</h2>
            <p className="text-base text-gray-600 leading-relaxed max-w-[430px]">Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.</p>
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
