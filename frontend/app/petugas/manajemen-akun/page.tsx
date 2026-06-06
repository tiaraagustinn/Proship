"use client";

import { useState, useEffect } from 'react';
import { usePageTitle } from '@/app/petugas/layout';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface AkunPetugas {
  id: number;
  nip: string;
  nama: string;
  email: string;
  noTelepon: string;
  status: 'AKTIF' | 'Nonaktif';
}

export default function ManajemenAkunPage() {
  const { setTitle } = usePageTitle();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nip: '',
    nama: '',
    email: '',
    noTelepon: '',
    status: 'AKTIF' as 'AKTIF' | 'Nonaktif',
  });

  useEffect(() => {
    setTitle('Manajemen Akun');
  }, [setTitle]);

  const [akunData, setAkunData] = useState<AkunPetugas[]>([
    {
      id: 1,
      nip: '237874683479283',
      nama: 'Roy Mustang',
      email: 'RoyMustang@gmail.com',
      noTelepon: '08045074054',
      status: 'AKTIF',
    },
    {
      id: 2,
      nip: '237874683479283',
      nama: 'Roy Mustang',
      email: 'RoyMustang@gmail.com',
      noTelepon: '08045074054',
      status: 'Nonaktif',
    },
    {
      id: 3,
      nip: '237874683479283',
      nama: 'Roy Mustang',
      email: 'RoyMustang@gmail.com',
      noTelepon: '08045074054',
      status: 'AKTIF',
    },
    {
      id: 4,
      nip: '237874683479283',
      nama: 'Roy Mustang',
      email: 'RoyMustang@gmail.com',
      noTelepon: '08045074054',
      status: 'Nonaktif',
    },
    {
      id: 5,
      nip: '237874683479283',
      nama: 'Roy Mustang',
      email: 'RoyMustang@gmail.com',
      noTelepon: '08045074054',
      status: 'AKTIF',
    },
    {
      id: 6,
      nip: '237874683479283',
      nama: 'Roy Mustang',
      email: 'RoyMustang@gmail.com',
      noTelepon: '08045074054',
      status: 'Nonaktif',
    },
    {
      id: 7,
      nip: '237874683479283',
      nama: 'Roy Mustang',
      email: 'RoyMustang@gmail.com',
      noTelepon: '08045074054',
      status: 'AKTIF',
    },
    {
      id: 8,
      nip: '237874683479283',
      nama: 'Roy Mustang',
      email: 'RoyMustang@gmail.com',
      noTelepon: '08045074054',
      status: 'Nonaktif',
    },
    {
      id: 9,
      nip: '237874683479283',
      nama: 'Roy Mustang',
      email: 'RoyMustang@gmail.com',
      noTelepon: '08045074054',
      status: 'AKTIF',
    },
    {
      id: 10,
      nip: '237874683479283',
      nama: 'Roy Mustang',
      email: 'RoyMustang@gmail.com',
      noTelepon: '08045074054',
      status: 'Nonaktif',
    },
    {
      id: 11,
      nip: '237874683479283',
      nama: 'Roy Mustang',
      email: 'RoyMustang@gmail.com',
      noTelepon: '08045074054',
      status: 'AKTIF',
    },
  ]);

  const handleAddAkun = () => {
    setFormData({
      nip: '',
      nama: '',
      email: '',
      noTelepon: '',
      status: 'AKTIF',
    });
    setShowAddModal(true);
  };

  const handleEdit = (id: number) => {
    const selected = akunData.find(item => item.id === id);
    if (!selected) return;

    setSelectedId(id);
    setFormData({
      nip: selected.nip,
      nama: selected.nama,
      email: selected.email,
      noTelepon: selected.noTelepon,
      status: selected.status,
    });
    setShowEditModal(true);
  };

  const handleDelete = (id: number) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedId === null) return;

    setAkunData(prev => prev.filter(item => item.id !== selectedId));
    setShowDeleteModal(false);
    setSelectedId(null);
  };

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    const newData = {
      id: akunData.length + 1,
      ...formData
    };

    setAkunData([...akunData, newData]);
    setShowAddModal(false);

    setFormData({
      nip: '',
      nama: '',
      email: '',
      noTelepon: '',
      status: 'AKTIF',
    });
  };

  const handleUpdate = () => {
    if (selectedId == null) return;

    setAkunData(prev =>
      prev.map(item =>
        item.id === selectedId
          ? { ...item, ...formData }
          : item
      )
    );

    setShowEditModal(false);
    setSelectedId(null);
    setFormData({
      nip: '',
      nama: '',
      email: '',
      noTelepon: '',
      status: 'AKTIF',
    });
  };

  const filteredData = akunData.filter(item => {
    const keywords = searchQuery.toLowerCase().split(" ");

    return keywords.every(word =>
      item.nip.toLowerCase().includes(word) ||
      item.nama.toLowerCase().includes(word) ||
      item.email.toLowerCase().includes(word) ||
      item.noTelepon.toLowerCase().includes(word)
    );
  });

  return (
    <div className="m-7 p-8 bg-[#838383] rounded-lg shadow">
      {/* Search and Add Button */}
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Cari akun petugas"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-3 border border-gray-500 bg-[#D9D9D9] rounded-lg w-96 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-gray-600 shadow-lg"
        />
        <button
          onClick={handleAddAkun}
          className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Tambah Akun Petugas
        </button>
      </div>

      {/* Table Container */}
      <div className="rounded-xl overflow-hidden border-8 border-teal-700 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-teal-800 text-white">
                <th className="p-4 text-center font-semibold">NIP</th>
                <th className="p-4 text-center font-semibold">Nama</th>
                <th className="p-4 text-center font-semibold">Email</th>
                <th className="p-4 text-center font-semibold">No. Telepon</th>
                <th className="p-4 text-center font-semibold">Status</th>
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
                    {item.nip}
                  </td>
                  <td className="p-4 text-center text-gray-800 border-r border-gray-300">
                    {item.nama}
                  </td>
                  <td className="p-4 text-center text-gray-800 border-r border-gray-300">
                    {item.email}
                  </td>
                  <td className="p-4 text-center text-gray-800 border-r border-gray-300">
                    {item.noTelepon}
                  </td>
                  <td className="p-4 text-center border-r border-gray-300">
                    <span className={`px-3 py-1 rounded text-white text-sm font-semibold ${item.status === 'AKTIF' ? 'bg-green-500' : 'bg-red-500'}`}>
                      {item.status}
                    </span>
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
            Tidak ada akun petugas yang ditemukan
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white backdrop-blur-md p-6 rounded-xl w-full max-w-[420px] shadow-2xl border border-white/30">
            <h2 className="text-lg font-semibold mb-4">Tambah Akun Petugas</h2>

            <input
              type="text"
              name="nip"
              placeholder="NIP"
              value={formData.nip}
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
            />

            <input
              type="text"
              name="nama"
              placeholder="Nama"
              value={formData.nama}
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
            />

            <input
              type="text"
              name="noTelepon"
              placeholder="No. Telepon"
              value={formData.noTelepon}
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full mb-4 p-2 border rounded"
            >
              <option value="AKTIF">AKTIF</option>
              <option value="Nonaktif">Nonaktif</option>
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white backdrop-blur-md p-6 rounded-xl w-full max-w-[420px] shadow-2xl border border-white/30">
            <h2 className="text-lg font-semibold mb-4">Edit Akun Petugas</h2>

            <input
              type="text"
              name="nip"
              placeholder="NIP"
              value={formData.nip}
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
            />

            <input
              type="text"
              name="nama"
              placeholder="Nama"
              value={formData.nama}
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
            />

            <input
              type="text"
              name="noTelepon"
              placeholder="No. Telepon"
              value={formData.noTelepon}
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full mb-4 p-2 border rounded"
            >
              <option value="AKTIF">AKTIF</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedId(null);
                  setFormData({
                    nip: '',
                    nama: '',
                    email: '',
                    noTelepon: '',
                    status: 'AKTIF',
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

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-[540px] rounded-[18px] shadow-2xl px-8 py-9 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hapus Akun Petugas</h2>
            <p className="text-base text-gray-600 leading-relaxed max-w-[430px]">
              Apakah Anda yakin ingin menghapus akun ini? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedId(null);
                }}
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
