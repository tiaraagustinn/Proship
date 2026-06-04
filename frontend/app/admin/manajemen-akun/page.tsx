"use client";

import { useState, useEffect } from 'react';
import { usePageTitle } from '@/app/admin/layout';
import { Plus, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

interface AkunPetugas {
  id_petugas: number;
  username: string;
  nama: string;
  email: string;
  role: string;
  status: 'aktif' | 'nonaktif';
}

const API_URL = 'http://localhost:5000/api';

export default function ManajemenAkunPage() {
  const { setTitle } = usePageTitle();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    nama: '',
    email: '',
    role: 'petugas' as string,
    password: '',
    status: 'aktif' as 'aktif' | 'nonaktif',
  });

  const [akunData, setAkunData] = useState<AkunPetugas[]>([]);
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
  const currentUserId = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;

  useEffect(() => {
    setTitle('Manajemen Akun');
    fetchPetugas();
  }, [setTitle]);

  const fetchPetugas = async () => {
    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_URL}/petugas`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Gagal mengambil data');
      const result = await response.json();
      setAkunData(result.data || []);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        showNotification('error', 'Request timeout - server tidak merespons');
      } else {
        showNotification('error', 'Gagal mengambil data petugas');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 2000); // Shorter timeout - 2 seconds
  };

  const handleAddAkun = () => {
    setFormData({ username: '', nama: '', email: '', role: 'petugas', password: '', status: 'aktif' });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleEdit = (id: number) => {
    const selected = akunData.find(item => item.id_petugas === id);
    if (!selected) return;

    setSelectedId(id);
    setFormData({
      username: selected.username,
      nama: selected.nama,
      email: selected.email,
      role: selected.role,
      password: '',
      status: selected.status,
    });
    setShowEditModal(true);
  };

  const handleDelete = (id: number) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedId === null) return;

    try {
      const response = await fetch(`${API_URL}/petugas/${selectedId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Gagal menghapus');
      showNotification('success', 'Petugas berhasil dihapus');
      setAkunData(prev => prev.filter(item => item.id_petugas !== selectedId));
      setShowDeleteModal(false);
      setSelectedId(null);
    } catch (err) {
      showNotification('error', 'Gagal menghapus petugas');
      console.error(err);
    }
  };

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async () => {
    const errors: { email?: string; password?: string } = {};
    if (!formData.username || !formData.nama || !formData.email || !formData.password || !formData.role) {
      showNotification('error', 'Semua field harus diisi');
      return;
    }
    if (!isValidEmail(formData.email)) errors.email = 'Format email tidak valid';
    if (formData.password.length < 8) errors.password = 'Password minimal 8 karakter';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const response = await fetch(`${API_URL}/petugas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          nama: formData.nama,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menambahkan');
      }

      showNotification('success', 'Petugas berhasil ditambahkan');
      setShowAddModal(false);
      setFormData({
        username: '',
        nama: '',
        email: '',
        role: 'petugas',
        password: '',
        status: 'aktif',
      });
      fetchPetugas();
    } catch (err: any) {
      showNotification('error', err.message || 'Gagal menambahkan petugas');
      console.error(err);
    }
  };

  const isLastAdmin = (id: number) => {
    const adminCount = akunData.filter(a => a.role === 'admin').length;
    const target = akunData.find(a => a.id_petugas === id);
    return target?.role === 'admin' && adminCount <= 1;
  };

  const handleUpdate = async () => {
    if (selectedId == null || !formData.username || !formData.nama || !formData.email || !formData.role) {
      showNotification('error', 'Semua field harus diisi');
      return;
    }

    if (isLastAdmin(selectedId) && formData.role !== 'admin') {
      showNotification('error', 'Role admin utama tidak dapat diubah');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/petugas/${selectedId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          nama: formData.nama,
          email: formData.email,
          role: formData.role,
          status: formData.status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengupdate');
      }

      showNotification('success', 'Petugas berhasil diupdate');
      setShowEditModal(false);
      setSelectedId(null);
      setFormData({
        username: '',
        nama: '',
        email: '',
        role: 'petugas',
        password: '',
        status: 'aktif',
      });
      fetchPetugas();
    } catch (err: any) {
      showNotification('error', err.message || 'Gagal mengupdate petugas');
      console.error(err);
    }
  };

  const filteredData = akunData.filter(item => {
    const keywords = searchQuery.toLowerCase().split(" ");

    return keywords.every(word =>
      item.username.toLowerCase().includes(word) ||
      item.nama.toLowerCase().includes(word) ||
      item.email.toLowerCase().includes(word)
    );
  });

  if (loading) {
    return (
      <div className="m-7 p-8 bg-[#3D518C] rounded-lg shadow flex items-center justify-center min-h-[400px]">
        <p className="text-white text-lg">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="m-7 p-8 bg-[#3D518C] rounded-lg shadow">
      {/* Notification */}
      {notification && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' 
            ? <CheckCircle className="w-5 h-5" />
            : <AlertCircle className="w-5 h-5" />
          }
          <span>{notification.message}</span>
        </div>
      )}

      {/* Search and Add Button */}
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Cari akun petugas (username, nama, email)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-3 border border-gray-500 bg-gray-100 rounded-lg w-96 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-gray-600 shadow-lg"
        />
        <button
          onClick={handleAddAkun}
          className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-[#D9D9D9] transition shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Tambah Akun Petugas
        </button>
      </div>

      {/* Table Container */}
      <div className="rounded-xl overflow-hidden border-8 border-[#8ba1fa] shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#7692FF] text-white">
                <th className="p-4 text-center font-semibold">Username</th>
                <th className="p-4 text-center font-semibold">Nama</th>
                <th className="p-4 text-center font-semibold">Email</th>
                <th className="p-4 text-center font-semibold">Role</th>
                <th className="p-4 text-center font-semibold">Status</th>
                <th className="p-4 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr
                  key={item.id_petugas}
                  className={`${
                    index % 2 === 0 ? 'bg-gray-200' : 'bg-white'
                  } hover:bg-gray-100 transition`}
                >
                  <td className="p-4 text-center text-gray-800 border-r border-gray-300">
                    {item.username}
                  </td>
                  <td className="p-4 text-center text-gray-800 border-r border-gray-300">
                    {item.nama}
                  </td>
                  <td className="p-4 text-center text-gray-800 border-r border-gray-300">
                    {item.email}
                  </td>
                  <td className="p-4 text-center text-gray-800 border-r border-gray-300">
                    {item.role}
                  </td>
                  <td className="p-4 text-center border-r border-gray-300">
                    <span className={`px-3 py-1 rounded text-white text-sm font-semibold ${item.status === 'aktif' ? 'bg-green-500' : 'bg-red-500'}`}>
                      {item.status === 'aktif' ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                  </td>
                  <td className="p-4">
                    {(() => {
                      const isSelf = String(item.id_petugas) === String(currentUserId);
                      const adminCount = akunData.filter(a => a.role === 'admin').length;
                      const isLastAdmin = item.role === 'admin' && adminCount <= 1;
                      const isProtected = isSelf || isLastAdmin;
                      return (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item.id_petugas)}
                            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {isProtected ? (
                            <span
                              className="p-2 bg-gray-300 text-gray-400 rounded cursor-not-allowed"
                              title={isSelf ? 'Tidak dapat menghapus akun sendiri' : 'Admin utama tidak dapat dihapus'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </span>
                          ) : (
                            <button
                              onClick={() => handleDelete(item.id_petugas)}
                              className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })()}
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
              name="username"
              placeholder="Username"
              value={formData.username}
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
              onChange={e => { handleChange(e); setFormErrors(prev => ({ ...prev, email: undefined })); }}
              className={`w-full p-2 border rounded ${formErrors.email ? 'border-red-500 mb-1' : 'mb-3'}`}
            />
            {formErrors.email && <p className="text-red-500 text-xs mb-3">{formErrors.email}</p>}

            <input
              type="password"
              name="password"
              placeholder="Password (min. 8 karakter)"
              value={formData.password}
              onChange={e => { handleChange(e); setFormErrors(prev => ({ ...prev, password: undefined })); }}
              className={`w-full p-2 border rounded ${formErrors.password ? 'border-red-500 mb-1' : 'mb-3'}`}
            />
            {formErrors.password && <p className="text-red-500 text-xs mb-3">{formErrors.password}</p>}

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full mb-4 p-2 border rounded"
            >
              <option value="petugas">Petugas</option>
              <option value="admin">Admin</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
              name="username"
              placeholder="Username"
              value={formData.username}
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

            {selectedId !== null && isLastAdmin(selectedId) ? (
              <div className="w-full mb-3 p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed flex justify-between items-center">
                <span>Admin</span>
                <span className="text-xs text-gray-400">🔒 Tidak dapat diubah</span>
              </div>
            ) : (
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full mb-3 p-2 border rounded"
              >
                <option value="petugas">Petugas</option>
                <option value="admin">Admin</option>
              </select>
            )}

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full mb-4 p-2 border rounded"
            >
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>

            <p className="text-xs text-gray-500 mb-4">
              {formData.status === 'nonaktif' && 'Petugas dengan status NONAKTIF tidak dapat login'}
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedId(null);
                  setFormData({
                    username: '',
                    nama: '',
                    email: '',
                    role: 'petugas',
                    password: '',
                    status: 'aktif',
                  });
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
