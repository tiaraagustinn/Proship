"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePageTitle } from '@/app/admin/layout';
import { Plus, Edit, Trash2, Clock } from 'lucide-react';

interface DataKapal {
  id_kapal: number;
  nama_kapal: string;
  tipe_kapal: string;
  kapasitas_muatan: number;
  kapasitas_kend_r2: number;
  kapasitas_kend_r4: number;
  kapasitas_penumpang: number;
  status_kapal: string;
}

interface DataPelabuhan {
  id_pelabuhan: number;
  nama_pelabuhan: string;
  alamat: string;
  latitude: string | number;
  longitude: string | number;
}

interface DataRute {
  id_rute: number;
  nama_rute: string;
  asal: string;
  tujuan: string;
  jarak_tempuh: number;
}

const API_URL = 'http://localhost:5000/api';

export default function DataMasterPage() {
  const { setTitle } = usePageTitle();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as 'kapal' | 'pelabuhan' | 'rute' | null;
  
  const [activeTab, setActiveTab] = useState<'kapal' | 'pelabuhan' | 'rute'>('kapal');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dataKapal, setDataKapal] = useState<DataKapal[]>([]);
  const [dataPelabuhan, setDataPelabuhan] = useState<DataPelabuhan[]>([]);
  const [dataRute, setDataRute] = useState<DataRute[]>([]);
  const [pelabuhanList, setPelabuhanList] = useState<DataPelabuhan[]>([]);

  const [kapalFormData, setKapalFormData] = useState({
    nama_kapal: '',
    tipe_kapal: 'ferry',
    kapasitas_muatan: '',
    kapasitas_kend_r2: '',
    kapasitas_kend_r4: '',
    kapasitas_penumpang: '',
    status_kapal: 'aktif',
  });
  
  const [editFormData, setEditFormData] = useState({
    nama_kapal: '',
    tipe_kapal: 'ferry',
    nama_pelabuhan: '',
    alamat: '',
    latitude: '',
    longitude: '',
    kapasitas_muatan: '',
    kapasitas_kend_r2: '',
    kapasitas_kend_r4: '',
    kapasitas_penumpang: '',
    status_kapal: 'aktif',
    id_pelabuhan_asal: '',
    id_pelabuhan_tujuan: '',
    jarak_tempuh: '',
  });

  useEffect(() => {
    setTitle('Data Master');
    if (tabParam && ['kapal', 'pelabuhan', 'rute'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [setTitle, tabParam]);

  useEffect(() => {
    if (activeTab === 'kapal') {
      const fetchKapal = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await fetch(`${API_URL}/kapal`);
          if (!res.ok) throw new Error('Gagal mengambil data kapal');
          const result = await res.json();
          setDataKapal(result.data || []);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error fetching kapal');
        } finally {
          setIsLoading(false);
        }
      };
      fetchKapal();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'pelabuhan') {
      const fetchPelabuhan = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await fetch(`${API_URL}/pelabuhan`);
          if (!res.ok) throw new Error('Gagal mengambil data pelabuhan');
          const result = await res.json();
          setDataPelabuhan(result.data || []);
          setPelabuhanList(result.data || []);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error fetching pelabuhan');
        } finally {
          setIsLoading(false);
        }
      };
      fetchPelabuhan();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'rute') {
      const fetchRute = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const [ruteRes, pelabuhanRes] = await Promise.all([
            fetch(`${API_URL}/rute`),
            fetch(`${API_URL}/pelabuhan`)
          ]);
          if (!ruteRes.ok) throw new Error('Gagal mengambil data rute');
          if (!pelabuhanRes.ok) throw new Error('Gagal mengambil data pelabuhan');
          
          const ruteData = await ruteRes.json();
          const pelabuhanData = await pelabuhanRes.json();
          
          setDataRute(ruteData.data || []);
          setPelabuhanList(pelabuhanData.data || []);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error fetching rute');
        } finally {
          setIsLoading(false);
        }
      };
      fetchRute();
    }
  }, [activeTab]);

  const handleAddData = () => {
    setError(null);
    if (activeTab === 'kapal') {
      setKapalFormData({
        nama_kapal: '',
        tipe_kapal: 'ferry',
        kapasitas_muatan: '',
        kapasitas_kend_r2: '',
        kapasitas_kend_r4: '',
        kapasitas_penumpang: '',
        status_kapal: 'aktif',
      });
    } else if (activeTab === 'pelabuhan') {
      setEditFormData(prev => ({
        ...prev,
        nama_pelabuhan: '',
        alamat: '',
        latitude: '',
        longitude: '',
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        id_pelabuhan_asal: '',
        id_pelabuhan_tujuan: '',
        jarak_tempuh: '',
      }));
    }
    setShowAddModal(true);
  };

  const handleKapalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setKapalFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitKapal = async () => {
    const nama_kapal = kapalFormData.nama_kapal.trim();
    const tipe_kapal = kapalFormData.tipe_kapal;
    const kapasitas_muatan = Number(kapalFormData.kapasitas_muatan);

    if (!nama_kapal || !tipe_kapal || !Number.isFinite(kapasitas_muatan) || kapasitas_muatan <= 0) {
      setError('Nama, tipe, dan kapasitas muatan harus diisi dengan benar');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/kapal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nama_kapal, 
          tipe_kapal, 
          kapasitas_muatan,
          kapasitas_kend_r2: Number(kapalFormData.kapasitas_kend_r2) || 0,
          kapasitas_kend_r4: Number(kapalFormData.kapasitas_kend_r4) || 0,
          kapasitas_penumpang: Number(kapalFormData.kapasitas_penumpang) || 0,
          status_kapal: kapalFormData.status_kapal 
        }),
      });

      if (!res.ok) throw new Error('Gagal menambah kapal');

      const refreshRes = await fetch(`${API_URL}/kapal`);
      const refreshData = await refreshRes.json();
      setDataKapal(refreshData.data || []);

      setShowAddModal(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambah kapal');
    }
  };

  const handleSubmitPelabuhan = async () => {
    const nama_pelabuhan = editFormData.nama_pelabuhan.trim();
    const alamat = editFormData.alamat.trim();

    if (!nama_pelabuhan || !alamat) {
      setError('Nama pelabuhan dan alamat harus diisi');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/pelabuhan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nama_pelabuhan, 
          alamat,
          latitude: editFormData.latitude ? Number(editFormData.latitude) : null,
          longitude: editFormData.longitude ? Number(editFormData.longitude) : null,
        }),
      });

      if (!res.ok) throw new Error('Gagal menambah pelabuhan');

      const refreshRes = await fetch(`${API_URL}/pelabuhan`);
      const refreshData = await refreshRes.json();
      setDataPelabuhan(refreshData.data || []);

      setShowAddModal(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambah pelabuhan');
    }
  };

  const handleSubmitRute = async () => {
    const id_pelabuhan_asal = Number(editFormData.id_pelabuhan_asal);
    const id_pelabuhan_tujuan = Number(editFormData.id_pelabuhan_tujuan);

    if (!id_pelabuhan_asal || !id_pelabuhan_tujuan || id_pelabuhan_asal === id_pelabuhan_tujuan) {
      setError('Pilih pelabuhan asal dan tujuan yang berbeda');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/rute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id_pelabuhan_asal, 
          id_pelabuhan_tujuan,
          jarak_tempuh: editFormData.jarak_tempuh ? Number(editFormData.jarak_tempuh) : null,
        }),
      });

      if (!res.ok) throw new Error('Gagal menambah rute');

      const refreshRes = await fetch(`${API_URL}/rute`);
      const refreshData = await refreshRes.json();
      setDataRute(refreshData.data || []);

      setShowAddModal(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambah rute');
    }
  };

  const handleEdit = (id: number) => {
    setError(null);
    if (activeTab === 'kapal') {
      const selected = dataKapal.find(item => item.id_kapal === id);
      if (selected) {
        setEditFormData({
          ...editFormData,
          nama_kapal: selected.nama_kapal,
          tipe_kapal: selected.tipe_kapal,
          kapasitas_muatan: String(selected.kapasitas_muatan),
          kapasitas_kend_r2: String(selected.kapasitas_kend_r2),
          kapasitas_kend_r4: String(selected.kapasitas_kend_r4),
          kapasitas_penumpang: String(selected.kapasitas_penumpang),
          status_kapal: selected.status_kapal,
        });
      }
    } else if (activeTab === 'pelabuhan') {
      const selected = dataPelabuhan.find(item => item.id_pelabuhan === id);
      if (selected) {
        setEditFormData({
          ...editFormData,
          nama_pelabuhan: selected.nama_pelabuhan,
          alamat: selected.alamat,
          latitude: String(selected.latitude || ''),
          longitude: String(selected.longitude || ''),
        });
      }
    } else {
      const selected = dataRute.find(item => item.id_rute === id);
      if (selected) {
        setEditFormData({
          ...editFormData,
          id_pelabuhan_asal: String(pelabuhanList.find(p => p.nama_pelabuhan === selected.asal)?.id_pelabuhan || ''),
          id_pelabuhan_tujuan: String(pelabuhanList.find(p => p.nama_pelabuhan === selected.tujuan)?.id_pelabuhan || ''),
          jarak_tempuh: String(selected.jarak_tempuh || ''),
        });
      }
    }
    setSelectedId(id);
    setShowEditModal(true);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateData = async () => {
    if (selectedId === null) return;

    try {
      if (activeTab === 'kapal') {
        const res = await fetch(`${API_URL}/kapal/${selectedId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nama_kapal: editFormData.nama_kapal,
            tipe_kapal: editFormData.tipe_kapal,
            kapasitas_muatan: Number(editFormData.kapasitas_muatan),
            kapasitas_kend_r2: Number(editFormData.kapasitas_kend_r2) || 0,
            kapasitas_kend_r4: Number(editFormData.kapasitas_kend_r4) || 0,
            kapasitas_penumpang: Number(editFormData.kapasitas_penumpang) || 0,
            status_kapal: editFormData.status_kapal,
          }),
        });
        if (!res.ok) throw new Error('Gagal mengupdate kapal');
        const refreshRes = await fetch(`${API_URL}/kapal`);
        setDataKapal((await refreshRes.json()).data || []);
      } else if (activeTab === 'pelabuhan') {
        const res = await fetch(`${API_URL}/pelabuhan/${selectedId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nama_pelabuhan: editFormData.nama_pelabuhan,
            alamat: editFormData.alamat,
            latitude: editFormData.latitude ? Number(editFormData.latitude) : null,
            longitude: editFormData.longitude ? Number(editFormData.longitude) : null,
          }),
        });
        if (!res.ok) throw new Error('Gagal mengupdate pelabuhan');
        const refreshRes = await fetch(`${API_URL}/pelabuhan`);
        setDataPelabuhan((await refreshRes.json()).data || []);
      } else {
        const res = await fetch(`${API_URL}/rute/${selectedId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_pelabuhan_asal: Number(editFormData.id_pelabuhan_asal),
            id_pelabuhan_tujuan: Number(editFormData.id_pelabuhan_tujuan),
            jarak_tempuh: editFormData.jarak_tempuh ? Number(editFormData.jarak_tempuh) : null,
          }),
        });
        if (!res.ok) throw new Error('Gagal mengupdate rute');
        const refreshRes = await fetch(`${API_URL}/rute`);
        setDataRute((await refreshRes.json()).data || []);
      }
      setShowEditModal(false);
      setSelectedId(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengupdate data');
    }
  };

  const handleDelete = (id: number) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedId === null) return;

    try {
      let endpoint = '';
      if (activeTab === 'kapal') endpoint = `${API_URL}/kapal/${selectedId}`;
      else if (activeTab === 'pelabuhan') endpoint = `${API_URL}/pelabuhan/${selectedId}`;
      else endpoint = `${API_URL}/rute/${selectedId}`;

      const res = await fetch(endpoint, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus data');

      if (activeTab === 'kapal') {
        setDataKapal(data => data.filter(item => item.id_kapal !== selectedId));
      } else if (activeTab === 'pelabuhan') {
        setDataPelabuhan(data => data.filter(item => item.id_pelabuhan !== selectedId));
      } else {
        setDataRute(data => data.filter(item => item.id_rute !== selectedId));
      }

      setShowDeleteModal(false);
      setSelectedId(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus data');
    }
  };

  const renderTable = () => {
    if (isLoading) return <div className="p-8 text-center text-gray-500 bg-white">Loading...</div>;

    if (activeTab === 'kapal') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-teal-800 text-white">
                <th className="p-4 text-left font-semibold">Nama Kapal</th>
                <th className="p-4 text-center font-semibold">Tipe</th>
                <th className="p-4 text-center font-semibold">Kap. Muatan</th>
                <th className="p-4 text-center font-semibold">Status</th>
                <th className="p-4 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataKapal.map((item, index) => (
                <tr key={item.id_kapal} className={`${index % 2 === 0 ? 'bg-gray-200' : 'bg-white'} hover:bg-gray-100`}>
                  <td className="p-4 text-left">{item.nama_kapal}</td>
                  <td className="p-4 text-center">{item.tipe_kapal}</td>
                  <td className="p-4 text-center">{item.kapasitas_muatan}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded text-white text-sm ${item.status_kapal === 'aktif' ? 'bg-green-500' : 'bg-red-500'}`}>
                      {item.status_kapal === 'aktif' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <button onClick={() => handleEdit(item.id_kapal)} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id_kapal)} className="p-2 bg-red-500 text-white rounded hover:bg-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {dataKapal.length === 0 && <div className="p-8 text-center text-gray-500 bg-white">Tidak ada data kapal</div>}
        </div>
      );
    } else if (activeTab === 'pelabuhan') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-teal-800 text-white">
                <th className="p-4 text-left font-semibold">Nama Pelabuhan</th>
                <th className="p-4 text-left font-semibold">Alamat</th>
                <th className="p-4 text-center font-semibold">Lat / Long</th>
                <th className="p-4 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataPelabuhan.map((item, index) => (
                <tr key={item.id_pelabuhan} className={`${index % 2 === 0 ? 'bg-gray-200' : 'bg-white'} hover:bg-gray-100`}>
                  <td className="p-4 text-left">{item.nama_pelabuhan}</td>
                  <td className="p-4 text-left">{item.alamat}</td>
                  <td className="p-4 text-center text-sm">{Number(item.latitude)?.toFixed(4)} / {Number(item.longitude)?.toFixed(4)}</td>
                  <td className="p-4 flex justify-center gap-2">
                    <button onClick={() => handleEdit(item.id_pelabuhan)} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id_pelabuhan)} className="p-2 bg-red-500 text-white rounded hover:bg-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {dataPelabuhan.length === 0 && <div className="p-8 text-center text-gray-500 bg-white">Tidak ada data pelabuhan</div>}
        </div>
      );
    } else {
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-teal-800 text-white">
                <th className="p-4 text-center font-semibold">Rute</th>
                <th className="p-4 text-center font-semibold">Jarak (km)</th>
                <th className="p-4 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataRute.map((item, index) => (
                <tr key={item.id_rute} className={`${index % 2 === 0 ? 'bg-gray-200' : 'bg-white'} hover:bg-gray-100`}>
                  <td className="p-4 text-center">{item.nama_rute}</td>
                  <td className="p-4 text-center">{item.jarak_tempuh || '-'}</td>
                  <td className="p-4 flex justify-center gap-2">
                    <button onClick={() => handleEdit(item.id_rute)} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id_rute)} className="p-2 bg-red-500 text-white rounded hover:bg-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {dataRute.length === 0 && <div className="p-8 text-center text-gray-500 bg-white">Tidak ada data rute</div>}
        </div>
      );
    }
  };

  return (
    <div className="m-7 p-8 bg-[#838383] rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-0 border-b-2 border-white">
          {['kapal', 'pelabuhan', 'rute'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 font-semibold transition ${activeTab === tab ? 'bg-white text-gray-800' : 'text-white hover:bg-gray-200'}`}
            >
              Data {tab === 'kapal' ? 'Kapal' : tab === 'pelabuhan' ? 'Pelabuhan' : 'Rute'}
            </button>
          ))}
        </div>
        <button
          onClick={handleAddData}
          className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-100"
        >
          <Plus className="w-5 h-5" /> Tambah Data
        </button>
      </div>
      {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>}
      <div className="rounded-xl overflow-hidden border-8 border-teal-700 shadow-lg bg-white">{renderTable()}</div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-[500px] shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Tambah Data</h2>
            {activeTab === 'kapal' && (
              <>
                <input type="text" name="nama_kapal" placeholder="Nama Kapal" value={kapalFormData.nama_kapal} onChange={handleKapalInputChange} className="w-full mb-3 p-2 border rounded" />
                <select name="tipe_kapal" value={kapalFormData.tipe_kapal} onChange={handleKapalInputChange} className="w-full mb-3 p-2 border rounded">
                  <option value="ferry">Ferry</option>
                  <option value="cepat">Cepat</option>
                </select>
                <input type="number" name="kapasitas_muatan" placeholder="Kapasitas Muatan" value={kapalFormData.kapasitas_muatan} onChange={handleKapalInputChange} className="w-full mb-3 p-2 border rounded" step="0.01" />
                <input type="number" name="kapasitas_kend_r2" placeholder="Kap. Kend R2" value={kapalFormData.kapasitas_kend_r2} onChange={handleKapalInputChange} className="w-full mb-3 p-2 border rounded" />
                <input type="number" name="kapasitas_kend_r4" placeholder="Kap. Kend R4" value={kapalFormData.kapasitas_kend_r4} onChange={handleKapalInputChange} className="w-full mb-3 p-2 border rounded" />
                <input type="number" name="kapasitas_penumpang" placeholder="Kap. Penumpang" value={kapalFormData.kapasitas_penumpang} onChange={handleKapalInputChange} className="w-full mb-3 p-2 border rounded" />
                <select name="status_kapal" value={kapalFormData.status_kapal} onChange={handleKapalInputChange} className="w-full mb-4 p-2 border rounded">
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-300 rounded">Batal</button>
                  <button onClick={handleSubmitKapal} className="px-4 py-2 bg-green-600 text-white rounded">Simpan</button>
                </div>
              </>
            )}
            {(activeTab === 'pelabuhan' || activeTab === 'rute') && (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-7 h-7 text-gray-400" />
                </div>
                <p className="font-semibold text-gray-700 mb-1">Fitur Segera Hadir</p>
                <p className="text-sm text-gray-500 mb-6">
                  Penambahan data {activeTab === 'pelabuhan' ? 'pelabuhan' : 'rute'} akan segera ditambahkan.
                </p>
                <button onClick={() => setShowAddModal(false)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-[500px] shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Edit Data</h2>
            {activeTab === 'kapal' && (
              <>
                <input type="text" name="nama_kapal" placeholder="Nama Kapal" value={editFormData.nama_kapal} onChange={handleEditInputChange} className="w-full mb-3 p-2 border rounded" />
                <select name="tipe_kapal" value={editFormData.tipe_kapal} onChange={handleEditInputChange} className="w-full mb-3 p-2 border rounded">
                  <option value="ferry">Ferry</option>
                  <option value="cepat">Cepat</option>
                </select>
                <input type="number" name="kapasitas_muatan" placeholder="Kapasitas Muatan" value={editFormData.kapasitas_muatan} onChange={handleEditInputChange} className="w-full mb-3 p-2 border rounded" step="0.01" />
                <input type="number" name="kapasitas_kend_r2" placeholder="Kap. Kend R2" value={editFormData.kapasitas_kend_r2} onChange={handleEditInputChange} className="w-full mb-3 p-2 border rounded" />
                <input type="number" name="kapasitas_kend_r4" placeholder="Kap. Kend R4" value={editFormData.kapasitas_kend_r4} onChange={handleEditInputChange} className="w-full mb-3 p-2 border rounded" />
                <input type="number" name="kapasitas_penumpang" placeholder="Kap. Penumpang" value={editFormData.kapasitas_penumpang} onChange={handleEditInputChange} className="w-full mb-3 p-2 border rounded" />
                <select name="status_kapal" value={editFormData.status_kapal} onChange={handleEditInputChange} className="w-full mb-4 p-2 border rounded">
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </>
            )}
            {activeTab === 'pelabuhan' && (
              <>
                <input type="text" name="nama_pelabuhan" placeholder="Nama Pelabuhan" value={editFormData.nama_pelabuhan} onChange={handleEditInputChange} className="w-full mb-3 p-2 border rounded" />
                <input type="text" name="alamat" placeholder="Alamat" value={editFormData.alamat} onChange={handleEditInputChange} className="w-full mb-3 p-2 border rounded" />
                <input type="number" name="latitude" placeholder="Latitude" value={editFormData.latitude} onChange={handleEditInputChange} className="w-full mb-3 p-2 border rounded" step="0.00000001" />
                <input type="number" name="longitude" placeholder="Longitude" value={editFormData.longitude} onChange={handleEditInputChange} className="w-full mb-4 p-2 border rounded" step="0.00000001" />
              </>
            )}
            {activeTab === 'rute' && (
              <>
                <select name="id_pelabuhan_asal" value={editFormData.id_pelabuhan_asal} onChange={handleEditInputChange} className="w-full mb-3 p-2 border rounded">
                  <option value="">Pilih Pelabuhan Asal</option>
                  {pelabuhanList.map(p => <option key={p.id_pelabuhan} value={p.id_pelabuhan}>{p.nama_pelabuhan}</option>)}
                </select>
                <select name="id_pelabuhan_tujuan" value={editFormData.id_pelabuhan_tujuan} onChange={handleEditInputChange} className="w-full mb-3 p-2 border rounded">
                  <option value="">Pilih Pelabuhan Tujuan</option>
                  {pelabuhanList.map(p => <option key={p.id_pelabuhan} value={p.id_pelabuhan}>{p.nama_pelabuhan}</option>)}
                </select>
                <input type="number" name="jarak_tempuh" placeholder="Jarak Tempuh (km)" value={editFormData.jarak_tempuh} onChange={handleEditInputChange} className="w-full mb-4 p-2 border rounded" step="0.01" />
              </>
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowEditModal(false); setSelectedId(null); }} className="px-4 py-2 bg-gray-300 rounded">Batal</button>
              <button onClick={handleUpdateData} className="px-4 py-2 bg-blue-600 text-white rounded">Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-[540px]">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hapus Data</h2>
            <p className="text-base text-gray-600 mb-8">Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowDeleteModal(false); setSelectedId(null); }} className="px-6 py-3 bg-gray-300 rounded-md">Batal</button>
              <button onClick={handleConfirmDelete} className="px-6 py-3 bg-red-600 text-white rounded-md">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
