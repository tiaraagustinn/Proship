"use client";

import { useState, useEffect } from 'react';
import { usePageTitle } from '@/app/petugas/layout';
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

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

  const jamOptions = [
  "08:00",
  "11:00",
  "14:00",
  "17:00",
  "20:00"
];

  const handleEdit = (id: number) => {
    const selected = jadwalData.find(item => item.id === id);
    if (!selected) return;

    setSelectedId(id);
    setFormData({
      keberangkatan: selected.keberangkatan,
      kedatangan: selected.kedatangan,
      jam: selected.jam,
      armada: selected.armada,
    });
    setShowEditModal(true);
  };

  const handleDelete = (id: number) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleAddData = () => {
  setShowAddModal(true);
};

  const filteredData = jadwalData.filter(item => {
  const keywords = searchQuery.toLowerCase().split(" ");

  return keywords.every(word =>
    item.keberangkatan.toLowerCase().includes(word) ||
    item.kedatangan.toLowerCase().includes(word) ||
    item.armada.toLowerCase().includes(word) ||
    item.jam.toLowerCase().includes(word)
  );
});

const [formData, setFormData] = useState({
  keberangkatan: '',
  kedatangan: '',
  jam: '',
  armada: '',
});

const handleChange = (e: any) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};

const handleSubmit = () => {
  const newData = {
    id: jadwalData.length + 1,
    ...formData
  };

  setJadwalData([...jadwalData, newData]);
  setShowAddModal(false);

  setFormData({
    keberangkatan: '',
    kedatangan: '',
    jam: '',
    armada: '',
  });
};

const handleUpdate = () => {
  if (selectedId == null) return;

  setJadwalData(prev =>
    prev.map(item =>
      item.id === selectedId
        ? { ...item, ...formData }
        : item
    )
  );

  setShowEditModal(false);
  setSelectedId(null);
  setFormData({
    keberangkatan: '',
    kedatangan: '',
    jam: '',
    armada: '',
  });
};

const handleConfirmDelete = () => {
  if (selectedId == null) return;

  setJadwalData(prev => prev.filter(item => item.id !== selectedId));
  setShowDeleteModal(false);
  setSelectedId(null);
};

  return (
    <div className="m-7 p-8 bg-white rounded-lg shadow">
      {/* Search and Add Button */}
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Cari jadwal"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg w-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddData}
          className="flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition"
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
          {showAddModal && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
              <div className="bg-white backdrop-blur-md p-6 rounded-xl w-full max-w-[420px] shadow-2xl border border-white/30">
                <h2 className="text-lg font-semibold mb-4">Tambah Jadwal</h2>

                <select
                  name="keberangkatan"
                  value={formData.keberangkatan}
                  onChange={handleChange}
                  className="w-full mb-3 p-2 border rounded"
                >
                  <option value="">Pilih Keberangkatan</option>
                  <option value="Banda Aceh">Banda Aceh</option>
                  <option value="Sabang">Sabang</option>
                </select>

                <select
                  name="kedatangan"
                  value={formData.kedatangan}
                  onChange={handleChange}
                  className="w-full mb-3 p-2 border rounded"
                >
                  <option value="">Pilih Kedatangan</option>
                  <option value="Banda Aceh">Banda Aceh</option>
                  <option value="Sabang">Sabang</option>
                </select>

                <select
                  name="jam"
                  value={formData.jam}
                  onChange={handleChange}
                  className="w-full mb-3 p-2 border rounded"
                >
                  <option value="">Pilih Jam</option>
                  {jamOptions.map((jam, index) => (
                    <option key={index} value={jam}>
                      {jam}
                    </option>
                  ))}
                </select>

                <select
                  name="armada"
                  value={formData.armada}
                  onChange={handleChange}
                  className="w-full mb-4 p-2 border rounded"
                >
                  <option value="">Pilih Armada</option>
                  <option value="KMP. BRR">KMP. BRR</option>
                  <option value="KMP. Aceh Hebat">KMP. Aceh Hebat</option>
                </select>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-300 rounded"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}

          {showEditModal && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
              <div className="bg-white backdrop-blur-md p-6 rounded-xl w-full max-w-[420px] shadow-2xl border border-white/30">
                <h2 className="text-lg font-semibold mb-4">Edit Jadwal</h2>

                <select
                  name="keberangkatan"
                  value={formData.keberangkatan}
                  onChange={handleChange}
                  className="w-full mb-3 p-2 border rounded"
                >
                  <option value="">Pilih Keberangkatan</option>
                  <option value="Banda Aceh">Banda Aceh</option>
                  <option value="Sabang">Sabang</option>
                </select>

                <select
                  name="kedatangan"
                  value={formData.kedatangan}
                  onChange={handleChange}
                  className="w-full mb-3 p-2 border rounded"
                >
                  <option value="">Pilih Kedatangan</option>
                  <option value="Banda Aceh">Banda Aceh</option>
                  <option value="Sabang">Sabang</option>
                </select>

                <select
                  name="jam"
                  value={formData.jam}
                  onChange={handleChange}
                  className="w-full mb-3 p-2 border rounded"
                >
                  <option value="">Pilih Jam</option>
                  {jamOptions.map((jam, index) => (
                    <option key={index} value={jam}>
                      {jam}
                    </option>
                  ))}
                </select>

                <select
                  name="armada"
                  value={formData.armada}
                  onChange={handleChange}
                  className="w-full mb-4 p-2 border rounded"
                >
                  <option value="">Pilih Armada</option>
                  <option value="KMP. BRR">KMP. BRR</option>
                  <option value="KMP. Aceh Hebat">KMP. Aceh Hebat</option>
                </select>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedId(null);
                      setFormData({
                        keberangkatan: '',
                        kedatangan: '',
                        jam: '',
                        armada: '',
                      });
                    }}
                    className="px-4 py-2 bg-gray-300 rounded"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
              <div className="bg-white p-6 rounded-xl w-full max-w-[380px] shadow-2xl border border-white/30">
                <h2 className="text-lg font-semibold mb-2">Hapus Jadwal</h2>
                <p className="text-sm text-gray-600 mb-5">
                  Apakah Anda yakin ingin menghapus jadwal ini? Tindakan ini tidak dapat dibatalkan.
                </p>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedId(null);
                    }}
                    className="px-4 py-2 bg-gray-300 rounded"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* No Data Message */}
        {filteredData.length === 0 && (
          <div className="p-8 text-center text-gray-500 bg-white">
            Tidak ada jadwal yang ditemukan
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 text-sm text-gray-600">
        Total {filteredData.length} jadwal
      </div>
    </div>
  );
}