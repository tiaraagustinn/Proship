"use client";

import { useState, useEffect } from 'react';
import { usePageTitle } from '@/app/admin/layout';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface DataKapal {
  id: number;
  nama: string;
  type: string;
  kapasitas: number;
  status: 'AKTIF' | 'Nonaktif';
}

interface DataPelabuhan {
  id: number;
  nama: string;
  lokasi: string;
  kapasitas: number;
  status: 'AKTIF' | 'Nonaktif';
}

interface DataRute {
  id: number;
  nama: string;
  asal: string;
  tujuan: string;
  status: 'AKTIF' | 'Nonaktif';
}

export default function DataMasterPage() {
  const { setTitle } = usePageTitle();
  const [activeTab, setActiveTab] = useState<'kapal' | 'pelabuhan' | 'rute'>('kapal');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setTitle('Data Master');
  }, [setTitle]);

  // Data Kapal
  const [dataKapal, setDataKapal] = useState<DataKapal[]>([
    { id: 1, nama: 'KMP. BRR', type: 'Ferry', kapasitas: 500, status: 'AKTIF' },
    { id: 2, nama: 'KMP. Aceh Hebat', type: 'Ferry', kapasitas: 650, status: 'AKTIF' },
    { id: 3, nama: 'KMP. Seulawah', type: 'Ferry', kapasitas: 400, status: 'Nonaktif' },
  ]);

  // Data Pelabuhan
  const [dataPelabuhan, setDataPelabuhan] = useState<DataPelabuhan[]>([
    { id: 1, nama: 'Pelabuhan Banda Aceh', lokasi: 'Banda Aceh', kapasitas: 20, status: 'AKTIF' },
    { id: 2, nama: 'Pelabuhan Sabang', lokasi: 'Sabang', kapasitas: 15, status: 'AKTIF' },
  ]);

  // Data Rute
  const [dataRute, setDataRute] = useState<DataRute[]>([
    { id: 1, nama: 'Banda Aceh - Sabang', asal: 'Banda Aceh', tujuan: 'Sabang', status: 'AKTIF' },
    { id: 2, nama: 'Sabang - Banda Aceh', asal: 'Sabang', tujuan: 'Banda Aceh', status: 'AKTIF' },
  ]);

  const [kapalFormData, setKapalFormData] = useState({
    nama: '',
    type: '',
    kapasitas: '',
    status: 'AKTIF' as 'AKTIF' | 'Nonaktif',
  });
  const [editFormData, setEditFormData] = useState({
    nama: '',
    type: '',
    lokasi: '',
    asal: '',
    tujuan: '',
    kapasitas: '',
    status: 'AKTIF' as 'AKTIF' | 'Nonaktif',
  });

  const handleAddData = () => {
    if (activeTab === 'kapal') {
      setKapalFormData({
        nama: '',
        type: '',
        kapasitas: '',
        status: 'AKTIF',
      });
    }
    setShowAddModal(true);
  };

  const handleKapalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setKapalFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitKapal = () => {
    const nama = kapalFormData.nama.trim();
    const type = kapalFormData.type.trim();
    const kapasitas = Number(kapalFormData.kapasitas);

    if (!nama || !type || !Number.isFinite(kapasitas) || kapasitas <= 0) {
      return;
    }

    const nextId = dataKapal.length ? Math.max(...dataKapal.map(item => item.id)) + 1 : 1;
    const newKapal: DataKapal = {
      id: nextId,
      nama,
      type,
      kapasitas,
      status: kapalFormData.status,
    };

    setDataKapal(prev => [...prev, newKapal]);
    setShowAddModal(false);
    setKapalFormData({
      nama: '',
      type: '',
      kapasitas: '',
      status: 'AKTIF',
    });
  };

  const handleEdit = (id: number) => {
    if (activeTab === 'kapal') {
      const selected = dataKapal.find(item => item.id === id);
      if (!selected) return;
      setEditFormData({
        nama: selected.nama,
        type: selected.type,
        lokasi: '',
        asal: '',
        tujuan: '',
        kapasitas: String(selected.kapasitas),
        status: selected.status,
      });
    } else if (activeTab === 'pelabuhan') {
      const selected = dataPelabuhan.find(item => item.id === id);
      if (!selected) return;
      setEditFormData({
        nama: selected.nama,
        type: '',
        lokasi: selected.lokasi,
        asal: '',
        tujuan: '',
        kapasitas: String(selected.kapasitas),
        status: selected.status,
      });
    } else {
      const selected = dataRute.find(item => item.id === id);
      if (!selected) return;
      setEditFormData({
        nama: selected.nama,
        type: '',
        lokasi: '',
        asal: selected.asal,
        tujuan: selected.tujuan,
        kapasitas: '',
        status: selected.status,
      });
    }

    setSelectedId(id);
    setShowEditModal(true);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateData = () => {
    if (selectedId === null) return;

    if (activeTab === 'kapal') {
      const nama = editFormData.nama.trim();
      const type = editFormData.type.trim();
      const kapasitas = Number(editFormData.kapasitas);
      if (!nama || !type || !Number.isFinite(kapasitas) || kapasitas <= 0) return;

      setDataKapal(prev =>
        prev.map(item =>
          item.id === selectedId
            ? { ...item, nama, type, kapasitas, status: editFormData.status }
            : item
        )
      );
    } else if (activeTab === 'pelabuhan') {
      const nama = editFormData.nama.trim();
      const lokasi = editFormData.lokasi.trim();
      const kapasitas = Number(editFormData.kapasitas);
      if (!nama || !lokasi || !Number.isFinite(kapasitas) || kapasitas <= 0) return;

      setDataPelabuhan(prev =>
        prev.map(item =>
          item.id === selectedId
            ? { ...item, nama, lokasi, kapasitas, status: editFormData.status }
            : item
        )
      );
    } else {
      const nama = editFormData.nama.trim();
      const asal = editFormData.asal.trim();
      const tujuan = editFormData.tujuan.trim();
      if (!nama || !asal || !tujuan) return;

      setDataRute(prev =>
        prev.map(item =>
          item.id === selectedId
            ? { ...item, nama, asal, tujuan, status: editFormData.status }
            : item
        )
      );
    }

    setShowEditModal(false);
    setSelectedId(null);
  };

  const handleDelete = (id: number) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedId === null) return;

    if (activeTab === 'kapal') {
      setDataKapal(prev => prev.filter(item => item.id !== selectedId));
    } else if (activeTab === 'pelabuhan') {
      setDataPelabuhan(prev => prev.filter(item => item.id !== selectedId));
    } else {
      setDataRute(prev => prev.filter(item => item.id !== selectedId));
    }

    setShowDeleteModal(false);
    setSelectedId(null);
  };

  const renderTable = () => {
    if (activeTab === 'kapal') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-teal-800 text-white">
                <th className="p-4 text-center font-semibold">Nama Kapal</th>
                <th className="p-4 text-center font-semibold">Type</th>
                <th className="p-4 text-center font-semibold">Kapasitas</th>
                <th className="p-4 text-center font-semibold">Status</th>
                <th className="p-4 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataKapal.map((item, index) => (
                <tr
                  key={item.id}
                  className={`${index % 2 === 0 ? 'bg-gray-200' : 'bg-white'} hover:bg-gray-100 transition`}
                >
                  <td className="p-4 text-center text-gray-800 border-r border-gray-300">
                    {item.nama}
                  </td>
                  <td className="p-4 text-center text-gray-800 border-r border-gray-300">
                    {item.type}
                  </td>
                  <td className="p-4 text-center text-gray-800 border-r border-gray-300">
                    {item.kapasitas}
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
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {dataKapal.length === 0 && (
            <div className="p-8 text-center text-gray-500 bg-white">
              Tidak ada data kapal
            </div>
          )}
        </div>
      );
    } else if (activeTab === 'pelabuhan') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-teal-800 text-white">
                <th className="p-4 text-center font-semibold">Nama Pelabuhan</th>
                <th className="p-4 text-center font-semibold">Lokasi</th>
                <th className="p-4 text-center font-semibold">Kapasitas</th>
                <th className="p-4 text-center font-semibold">Status</th>
                <th className="p-4 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataPelabuhan.map((item, index) => (
                <tr
                  key={item.id}
                  className={`${index % 2 === 0 ? 'bg-gray-200' : 'bg-white'} hover:bg-gray-100 transition`}
                >
                  <td className="p-4 text-center text-gray-800 border-r border-gray-300">
                    {item.nama}
                  </td>
                  <td className="p-4 text-center text-gray-800 border-r border-gray-300">
                    {item.lokasi}
                  </td>
                  <td className="p-4 text-center text-gray-800 border-r border-gray-300">
                    {item.kapasitas}
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
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {dataPelabuhan.length === 0 && (
            <div className="p-8 text-center text-gray-500 bg-white">
              Tidak ada data pelabuhan
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-teal-800 text-white">
                <th className="p-4 text-center font-semibold">Nama Rute</th>
                <th className="p-4 text-center font-semibold">Asal</th>
                <th className="p-4 text-center font-semibold">Tujuan</th>
                <th className="p-4 text-center font-semibold">Status</th>
                <th className="p-4 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataRute.map((item, index) => (
                <tr
                  key={item.id}
                  className={`${index % 2 === 0 ? 'bg-gray-200' : 'bg-white'} hover:bg-gray-100 transition`}
                >
                  <td className="p-4 text-center text-gray-800 border-r border-gray-300">
                    {item.nama}
                  </td>
                  <td className="p-4 text-center text-gray-800 border-r border-gray-300">
                    {item.asal}
                  </td>
                  <td className="p-4 text-center text-gray-800 border-r border-gray-300">
                    {item.tujuan}
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
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {dataRute.length === 0 && (
            <div className="p-8 text-center text-gray-500 bg-white">
              Tidak ada data rute
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="m-7 p-8 bg-[#838383] rounded-lg shadow">
      {/* Tabs */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-0 border-b-2 border-white">
          <button
            onClick={() => setActiveTab('kapal')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'kapal'
                ? 'bg-white text-gray-800 border-b-4 border-white'
                : 'text-white hover:bg-gray-200 hover:text-gray-600'
            }`}
          >
            Data Kapal
          </button>
          <button
            onClick={() => setActiveTab('pelabuhan')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'pelabuhan'
                ? 'bg-white text-gray-800 border-b-4 border-white'
                : 'text-white hover:bg-gray-200 hover:text-gray-600'
            }`}
          >
            Data Pelabuhan
          </button>
          <button
            onClick={() => setActiveTab('rute')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'rute'
                ? 'bg-white text-gray-800 border-b-4 border-white'
                : 'text-white hover:bg-gray-200 hover:text-gray-600'
            }`}
          >
            Data Rute
          </button>
        </div>

        {/* Add Button */}
        <button
          onClick={handleAddData}
          className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Tambah Data
        </button>
      </div>

      {/* Table Container */}
      <div className="rounded-xl overflow-hidden border-8 border-teal-700 shadow-lg bg-white">
        {renderTable()}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white backdrop-blur-md p-6 rounded-xl w-full max-w-[420px] shadow-2xl border border-white/30">
            <h2 className="text-lg font-semibold mb-4">Tambah Data</h2>

            {activeTab === 'kapal' ? (
              <>
                <input
                  type="text"
                  name="nama"
                  placeholder="Nama Kapal"
                  value={kapalFormData.nama}
                  onChange={handleKapalInputChange}
                  className="w-full mb-3 p-2 border rounded"
                />
                <input
                  type="text"
                  name="type"
                  placeholder="Type"
                  value={kapalFormData.type}
                  onChange={handleKapalInputChange}
                  className="w-full mb-3 p-2 border rounded"
                />
                <input
                  type="number"
                  name="kapasitas"
                  placeholder="Kapasitas"
                  value={kapalFormData.kapasitas}
                  onChange={handleKapalInputChange}
                  className="w-full mb-3 p-2 border rounded"
                  min={1}
                />
                <select
                  name="status"
                  value={kapalFormData.status}
                  onChange={handleKapalInputChange}
                  className="w-full mb-4 p-2 border rounded"
                >
                  <option value="AKTIF">AKTIF</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </>
            ) : (
              <p className="text-sm text-gray-600 mb-4">Fitur tambah data akan diimplementasikan</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Batal
              </button>
              <button
                onClick={activeTab === 'kapal' ? handleSubmitKapal : () => setShowAddModal(false)}
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
            <h2 className="text-lg font-semibold mb-4">Edit Data</h2>

            {activeTab === 'kapal' && (
              <>
                <input
                  type="text"
                  name="nama"
                  placeholder="Nama Kapal"
                  value={editFormData.nama}
                  onChange={handleEditInputChange}
                  className="w-full mb-3 p-2 border rounded"
                />
                <input
                  type="text"
                  name="type"
                  placeholder="Type"
                  value={editFormData.type}
                  onChange={handleEditInputChange}
                  className="w-full mb-3 p-2 border rounded"
                />
                <input
                  type="number"
                  name="kapasitas"
                  placeholder="Kapasitas"
                  value={editFormData.kapasitas}
                  onChange={handleEditInputChange}
                  className="w-full mb-3 p-2 border rounded"
                  min={1}
                />
              </>
            )}

            {activeTab === 'pelabuhan' && (
              <>
                <input
                  type="text"
                  name="nama"
                  placeholder="Nama Pelabuhan"
                  value={editFormData.nama}
                  onChange={handleEditInputChange}
                  className="w-full mb-3 p-2 border rounded"
                />
                <input
                  type="text"
                  name="lokasi"
                  placeholder="Lokasi"
                  value={editFormData.lokasi}
                  onChange={handleEditInputChange}
                  className="w-full mb-3 p-2 border rounded"
                />
                <input
                  type="number"
                  name="kapasitas"
                  placeholder="Kapasitas"
                  value={editFormData.kapasitas}
                  onChange={handleEditInputChange}
                  className="w-full mb-3 p-2 border rounded"
                  min={1}
                />
              </>
            )}

            {activeTab === 'rute' && (
              <>
                <input
                  type="text"
                  name="nama"
                  placeholder="Nama Rute"
                  value={editFormData.nama}
                  onChange={handleEditInputChange}
                  className="w-full mb-3 p-2 border rounded"
                />
                <input
                  type="text"
                  name="asal"
                  placeholder="Asal"
                  value={editFormData.asal}
                  onChange={handleEditInputChange}
                  className="w-full mb-3 p-2 border rounded"
                />
                <input
                  type="text"
                  name="tujuan"
                  placeholder="Tujuan"
                  value={editFormData.tujuan}
                  onChange={handleEditInputChange}
                  className="w-full mb-3 p-2 border rounded"
                />
              </>
            )}

            <select
              name="status"
              value={editFormData.status}
              onChange={handleEditInputChange}
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
                }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateData}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hapus Data</h2>
            <p className="text-base text-gray-600 leading-relaxed max-w-[430px]">
              Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
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
