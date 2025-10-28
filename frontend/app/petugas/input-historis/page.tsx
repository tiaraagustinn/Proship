"use client";

import { useState, FormEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface FormData {
  idJadwal: string;
  jumlahPenumpang: string;
  jumlahKendaraanRoda2: string;
  jumlahKendaraanRoda4: string;
  beratMuatan: string;
}

export default function InputHistorisPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    idJadwal: '',
    jumlahPenumpang: '',
    jumlahKendaraanRoda2: '',
    jumlahKendaraanRoda4: '',
    beratMuatan: '',
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/historis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Data berhasil disimpan!');
        // Reset form
        setFormData({
          idJadwal: '',
          jumlahPenumpang: '',
          jumlahKendaraanRoda2: '',
          jumlahKendaraanRoda4: '',
          beratMuatan: '',
        });
      } else {
        alert('Gagal menyimpan data');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan');
    }
  };

  const handleLogout = () => {
    router.push('/petugas/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6 flex flex-col">
        <div className="mb-8">
          <Image
            src="/images/dishub-logo-black.png"
            alt="Dishub Aceh Logo"
            width={150}
            height={60}
          />
        </div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => router.push('/petugas/dashboard')}
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded"
          >
            Dashboard
          </button>
          <button className="w-full px-4 py-2 text-left bg-black text-white rounded">
            Input Historis Pelayaran
          </button>
          <button 
            onClick={() => router.push('/petugas/jadwal')}
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded"
          >
            Jadwal
          </button>
          <button 
            onClick={() => router.push('/petugas/historis')}
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded"
          >
            Historis Pelayaran
          </button>
          <button 
            onClick={() => router.push('/petugas/profil')}
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded"
          >
            Profil
          </button>
        </nav>

        <button 
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mt-4"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Input Historis Pelayaran</h1>
          <div className="flex items-center gap-2">
            <Image
              src="/avatar-placeholder.png"
              alt="User avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
            <select className="border rounded px-2 py-1">
              <option>Tiara Agustin</option>
            </select>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-8 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ID Jadwal */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Id Jadwal
              </label>
              <select
                name="idJadwal"
                value={formData.idJadwal}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Pilih id jadwal</option>
                <option value="1">Jadwal 1 - Banda Aceh - Sabang 08:00</option>
                <option value="2">Jadwal 2 - Sabang - Banda Aceh 08:00</option>
                <option value="3">Jadwal 3 - Banda Aceh - Sabang 11:00</option>
                <option value="4">Jadwal 4 - Sabang - Banda Aceh 11:00</option>
              </select>
            </div>

            {/* Jumlah Penumpang */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Jumlah penumpang
              </label>
              <input
                type="number"
                name="jumlahPenumpang"
                value={formData.jumlahPenumpang}
                onChange={handleInputChange}
                placeholder="Jumlah penumpang"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Jumlah Kendaraan Roda 2 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Jumlah kendaraan roda 2
              </label>
              <input
                type="number"
                name="jumlahKendaraanRoda2"
                value={formData.jumlahKendaraanRoda2}
                onChange={handleInputChange}
                placeholder="Jumlah kendaraan roda 2"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Jumlah Kendaraan Roda 4 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Jumlah kendaraan roda 4
              </label>
              <input
                type="number"
                name="jumlahKendaraanRoda4"
                value={formData.jumlahKendaraanRoda4}
                onChange={handleInputChange}
                placeholder="Jumlah kendaraan roda 4"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Berat Muatan */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Berat Muatan (ton)
              </label>
              <input
                type="number"
                step="0.01"
                name="beratMuatan"
                value={formData.beratMuatan}
                onChange={handleInputChange}
                placeholder="Berat Muatan (ton)"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-8 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}