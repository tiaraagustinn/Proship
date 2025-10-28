"use client";

import { useState, useEffect } from 'react';
import { usePageTitle } from '@/app/admin/layout';
import { Edit, Trash2, Plus } from 'lucide-react';

interface JadwalData {
  id: number;
  keberangkatan: string;
  kedatangan: string;
  jam: string;
  armada: string;
}

export default function JadwalPage() {
  const { setTitle } = usePageTitle();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setTitle('Input Jadwal');
  }, [setTitle]);

  // Sample data - nanti diganti dengan data dari API
  const [jadwalData, setJadwalData] = useState<JadwalData[]>([
    {
      id: 1,
      keberangkatan: 'Banda Aceh',
      kedatangan: 'Sabang',
      jam: '08.00',
      armada: 'KMP. BRR'
    },
    {
      id: 2,
      keberangkatan: 'Sabang',
      kedatangan: 'Banda Aceh',
      jam: '08.00',
      armada: 'KMP. Aceh Hebat'
    },
    {
      id: 3,
      keberangkatan: 'Banda Aceh',
      kedatangan: 'Sabang',
      jam: '11.00',
      armada: 'KMP. Aceh Hebat'
    },
    {
      id: 4,
      keberangkatan: 'Sabang',
      kedatangan: 'Banda Aceh',
      jam: '11.00',
      armada: 'KMP. BRR'
    },
    {
      id: 5,
      keberangkatan: 'Banda Aceh',
      kedatangan: 'Sabang',
      jam: '14.00',
      armada: 'KMP. Aceh Hebat'
    },
    {
      id: 6,
      keberangkatan: 'Sabang',
      kedatangan: 'Banda Aceh',
      jam: '14.00',
      armada: 'KMP. BRR'
    },
    {
      id: 7,
      keberangkatan: 'Banda Aceh',
      kedatangan: 'Sabang',
      jam: '17.00',
      armada: 'KMP. Aceh Hebat'
    },
    {
      id: 8,
      keberangkatan: 'Sabang',
      kedatangan: 'Banda Aceh',
      jam: '17.00',
      armada: 'KMP. BRR'
    },
  ]);

  const handleEdit = (id: number) => {
    alert(`Edit jadwal dengan ID: ${id}`);
    // TODO: Implement edit functionality
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      setJadwalData(jadwalData.filter(item => item.id !== id));
      alert('Jadwal berhasil dihapus!');
    }
  };

  const handleAddData = () => {
    setShowAddModal(true);
    // TODO: Implement add modal
    alert('Form tambah jadwal akan muncul');
  };

  const filteredData = jadwalData.filter(item =>
    item.keberangkatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.kedatangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.armada.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="m-7 p-8 bg-[#838383] rounded-lg shadow">
      {/* Search and Add Button */}
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Cari jadwal"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-3 border border-gray-500 bg-[#D9D9D9] rounded-lg w-96 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-gray-600 shadow-lg"
        />
        <button
          onClick={handleAddData}
          className="flex items-center gap-2 px-6 py-3 bg-[#D9D9D9] text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition shadow-gray-600 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Tambah Data
        </button>
      </div>

      {/* Table Container with Teal Border */}
      <div className="rounded-xl overflow-hidden border-8 border-teal-700 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-teal-800 text-white">
                <th className="p-4 text-center font-semibold">Keberangkatan</th>
                <th className="p-4 text-center font-semibold">Kedatangan</th>
                <th className="p-4 text-center font-semibold">Jam</th>
                <th className="p-4 text-center font-semibold">Armada</th>
                <th className="p-4 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr
                  key={item.id}
                  className={`${
                    index % 2 === 0 ? 'bg-gray-200' : 'bg-white'
                  } hover:bg-gray-100 transition`}
                >
                  <td className="p-4 text-center text-gray-800 border-r border-gray-300">
                    {item.keberangkatan}
                  </td>
                  <td className="p-4 text-center text-gray-800 border-r border-gray-300">
                    {item.kedatangan}
                  </td>
                  <td className="p-4 text-center text-gray-800 border-r border-gray-300">
                    {item.jam}
                  </td>
                  <td className="p-4 text-center text-gray-800 border-r border-gray-300">
                    {item.armada}
                  </td>
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

        {/* No Data Message */}
        {filteredData.length === 0 && (
          <div className="p-8 text-center text-gray-500 bg-white">
            Tidak ada jadwal yang ditemukan
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 text-sm text-white">
        Total {filteredData.length} jadwal
      </div>
    </div>
  );
}