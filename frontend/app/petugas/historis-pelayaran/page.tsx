"use client";

import { useState, useEffect } from 'react';
import { usePageTitle } from '@/app/petugas/layout';
import { Edit, Trash2 } from 'lucide-react';

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
    alert(`Edit data dengan ID: ${id}`);
    // TODO: Implement edit functionality
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      setHistorisData(historisData.filter(item => item.id !== id));
      alert('Data berhasil dihapus!');
    }
  };

  const handleExportData = () => {
    // TODO: Implement export to Excel/CSV
    alert('Export data ke Excel');
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
          className="px-8 py-3 mt-5 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition"
        >
          Export Data
        </button>
      </div>
    </div>
  );
}