"use client";

import { useState, useEffect } from 'react';
import { usePageTitle } from '@/app/petugas/layout';
import { Edit, Trash2, X } from 'lucide-react';

interface HistorisData {
  id: number;
  tanggal: string;
  keberangkatan: string;
  tujuan: string;
  jumlahPenumpang: number;
  kendaraanRoda2: number;
  kendaraanRoda4: number;
  beratMuatan: number;
  armada: string;
}

export default function HistorisPelayaranPage() {
  const { setTitle } = usePageTitle();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<HistorisData | null>(null);

  useEffect(() => {
    setTitle('Historis Pelayaran');
  }, [setTitle]);

  // Sample data - nanti diganti dengan data dari API
  const [historisData, setHistorisData] = useState<HistorisData[]>([
    {
      id: 1,
      tanggal: '2024-10-28',
      keberangkatan: 'Banda Aceh',
      tujuan: 'Sabang',
      jumlahPenumpang: 245,
      kendaraanRoda2: 35,
      kendaraanRoda4: 12,
      beratMuatan: 5.2,
      armada: 'KMP. BRR'
    },
    {
      id: 2,
      tanggal: '2024-10-28',
      keberangkatan: 'Sabang',
      tujuan: 'Banda Aceh',
      jumlahPenumpang: 198,
      kendaraanRoda2: 28,
      kendaraanRoda4: 8,
      beratMuatan: 4.1,
      armada: 'KMP. Aceh Hebat'
    },
    {
      id: 3,
      tanggal: '2024-10-27',
      keberangkatan: 'Banda Aceh',
      tujuan: 'Sabang',
      jumlahPenumpang: 312,
      kendaraanRoda2: 42,
      kendaraanRoda4: 15,
      beratMuatan: 6.8,
      armada: 'KMP. BRR'
    },
    {
      id: 4,
      tanggal: '2024-10-27',
      keberangkatan: 'Sabang',
      tujuan: 'Banda Aceh',
      jumlahPenumpang: 267,
      kendaraanRoda2: 38,
      kendaraanRoda4: 11,
      beratMuatan: 5.5,
      armada: 'KMP. Aceh Hebat'
    },
    {
      id: 5,
      tanggal: '2024-10-26',
      keberangkatan: 'Banda Aceh',
      tujuan: 'Sabang',
      jumlahPenumpang: 289,
      kendaraanRoda2: 40,
      kendaraanRoda4: 13,
      beratMuatan: 6.2,
      armada: 'KMP. BRR'
    },
    {
      id: 6,
      tanggal: '2024-10-26',
      keberangkatan: 'Sabang',
      tujuan: 'Banda Aceh',
      jumlahPenumpang: 223,
      kendaraanRoda2: 31,
      kendaraanRoda4: 9,
      beratMuatan: 4.7,
      armada: 'KMP. Aceh Hebat'
    },
    {
      id: 7,
      tanggal: '2024-10-25',
      keberangkatan: 'Banda Aceh',
      tujuan: 'Sabang',
      jumlahPenumpang: 278,
      kendaraanRoda2: 37,
      kendaraanRoda4: 14,
      beratMuatan: 5.9,
      armada: 'KMP. BRR'
    },
    {
      id: 8,
      tanggal: '2024-10-25',
      keberangkatan: 'Sabang',
      tujuan: 'Banda Aceh',
      jumlahPenumpang: 251,
      kendaraanRoda2: 33,
      kendaraanRoda4: 10,
      beratMuatan: 5.1,
      armada: 'KMP. Aceh Hebat'
    },
    {
      id: 9,
      tanggal: '2024-10-24',
      keberangkatan: 'Banda Aceh',
      tujuan: 'Sabang',
      jumlahPenumpang: 295,
      kendaraanRoda2: 41,
      kendaraanRoda4: 16,
      beratMuatan: 6.5,
      armada: 'KMP. BRR'
    },
    {
      id: 10,
      tanggal: '2024-10-24',
      keberangkatan: 'Sabang',
      tujuan: 'Banda Aceh',
      jumlahPenumpang: 234,
      kendaraanRoda2: 32,
      kendaraanRoda4: 11,
      beratMuatan: 4.9,
      armada: 'KMP. Aceh Hebat'
    },
  ]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(historisData.map(item => item.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectRow = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleEdit = (id: number) => {
    const item = historisData.find(d => d.id === id);
    if (item) {
      setFormData({ ...item });
      setEditingId(id);
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (formData) {
      setHistorisData(historisData.map(item =>
        item.id === editingId ? formData : item
      ));
      setIsEditModalOpen(false);
      setEditingId(null);
      setFormData(null);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      setHistorisData(historisData.filter(item => item.id !== deletingId));
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingId(null);
    setFormData(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({
        ...formData,
        [name]: isNaN(Number(value)) ? value : Number(value),
      });
    }
  };

  const handleExportData = () => {
    if (selectedIds.length === 0) {
      return;
    }
    setIsExportModalOpen(true);
  };

  const handleExportCSV = () => {
    const selectedData = historisData.filter(item => selectedIds.includes(item.id));
    const headers = ['Tanggal', 'Keberangkatan', 'Tujuan', 'Penumpang', 'Roda 2', 'Roda 4', 'Muatan (ton)', 'Armada'];
    const rows = selectedData.map(item => [
      item.tanggal,
      item.keberangkatan,
      item.tujuan,
      item.jumlahPenumpang,
      item.kendaraanRoda2,
      item.kendaraanRoda4,
      item.beratMuatan,
      item.armada
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'historis_pelayaran.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExportModalOpen(false);
  };

  const handleExportPDF = () => {
    const selectedData = historisData.filter(item => selectedIds.includes(item.id));
    
    // Export as formatted CSV (PDF-like)
    const headers = ['Tanggal', 'Keberangkatan', 'Tujuan', 'Penumpang', 'Roda 2', 'Roda 4', 'Muatan (ton)', 'Armada'];
    const rows = selectedData.map(item => [
      item.tanggal,
      item.keberangkatan,
      item.tujuan,
      item.jumlahPenumpang,
      item.kendaraanRoda2,
      item.kendaraanRoda4,
      item.beratMuatan,
      item.armada
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'historis_pelayaran_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExportModalOpen(false);
  };

  return (
    <div className="m-7 p-8 bg-white rounded-lg shadow">

      {/* Table Container */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="p-4 text-left w-12">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
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
              {historisData.map((item, index) => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-200 ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-gray-100 transition`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => handleSelectRow(item.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="p-4 text-gray-700">{item.tanggal}</td>
                  <td className="p-4 text-gray-700">{item.keberangkatan}</td>
                  <td className="p-4 text-gray-700">{item.tujuan}</td>
                  <td className="p-4 text-gray-700">{item.jumlahPenumpang}</td>
                  <td className="p-4 text-gray-700">{item.kendaraanRoda2}</td>
                  <td className="p-4 text-gray-700">{item.kendaraanRoda4}</td>
                  <td className="p-4 text-gray-700">{item.beratMuatan}</td>
                  <td className="p-4 text-gray-700">{item.armada}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Info */}
      {selectedIds.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          {selectedIds.length} item dipilih
        </div>
      )}

      {/* Export Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleExportData}
          disabled={selectedIds.length === 0}
          className={`px-8 py-3 mt-5 font-semibold rounded-lg transition ${
            selectedIds.length === 0
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          Export Data
        </button>
      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-[540px] rounded-[18px] shadow-2xl px-8 py-9 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Export Data</h2>
            <p className="text-base text-gray-600 leading-relaxed max-w-[430px] mb-8">
              Pilih format file untuk mengekspor data historis pelayaran
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="min-w-[96px] px-6 py-3 bg-[#D1D5DB] text-gray-900 rounded-md text-base font-medium hover:bg-gray-400 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleExportCSV}
                className="min-w-[96px] px-6 py-3 bg-green-600 text-white rounded-md text-base font-medium hover:bg-green-700 transition-colors"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && formData && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white backdrop-blur-md p-6 rounded-xl w-full max-w-[420px] shadow-2xl border border-white/30">
            <h2 className="text-lg font-semibold mb-4">Edit Historis</h2>

            <select
              name="keberangkatan"
              value={formData.keberangkatan}
              onChange={(e) => setFormData({ ...formData, keberangkatan: e.target.value })}
              className="w-full mb-3 p-2 border rounded"
            >
              <option value="">Pilih Keberangkatan</option>
              <option value="Banda Aceh">Banda Aceh</option>
              <option value="Sabang">Sabang</option>
            </select>

            <select
              name="tujuan"
              value={formData.tujuan}
              onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
              className="w-full mb-3 p-2 border rounded"
            >
              <option value="">Pilih Tujuan</option>
              <option value="Sabang">Sabang</option>
              <option value="Banda Aceh">Banda Aceh</option>
            </select>

            <input
              type="date"
              name="tanggal"
              value={formData.tanggal}
              onChange={handleFormChange}
              className="w-full mb-3 p-2 border rounded"
            />

            <input
              type="number"
              name="jumlahPenumpang"
              value={formData.jumlahPenumpang}
              onChange={handleFormChange}
              placeholder="Jumlah Penumpang"
              className="w-full mb-3 p-2 border rounded"
            />

            <input
              type="number"
              name="kendaraanRoda2"
              value={formData.kendaraanRoda2}
              onChange={handleFormChange}
              placeholder="Kendaraan Roda 2"
              className="w-full mb-3 p-2 border rounded"
            />

            <input
              type="number"
              name="kendaraanRoda4"
              value={formData.kendaraanRoda4}
              onChange={handleFormChange}
              placeholder="Kendaraan Roda 4"
              className="w-full mb-3 p-2 border rounded"
            />

            <input
              type="number"
              name="beratMuatan"
              value={formData.beratMuatan}
              onChange={handleFormChange}
              placeholder="Berat Muatan (ton)"
              step="0.1"
              className="w-full mb-3 p-2 border rounded"
            />

            <select
              name="armada"
              value={formData.armada}
              onChange={(e) => setFormData({ ...formData, armada: e.target.value })}
              className="w-full mb-4 p-2 border rounded"
            >
              <option value="">Pilih Armada</option>
              <option value="KMP. BRR">KMP. BRR</option>
              <option value="KMP. Aceh Hebat">KMP. Aceh Hebat</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleCloseEditModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Simpan Perubahan
              </button>
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
              <button
                onClick={() => setIsDeleteModalOpen(false)}
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