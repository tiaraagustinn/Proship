"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { usePageTitle } from '@/app/petugas/layout';

interface FormData {
  idJadwal: string;
  jumlahPenumpang: string;
  jumlahKendaraanRoda2: string;
  jumlahKendaraanRoda4: string;
  beratMuatan: string;
}

export default function InputHistorisPage() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle('Input Historis Pelayaran');
  }, [setTitle]);

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

  return (
    <div className="m-7 p-8 bg-white rounded-lg shadow">
      {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ID Jadwal */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Id Jadwal
            </label>
            <select
              name="idJadwal"
              value={formData.idJadwal}
              onChange={handleInputChange}
              className={`w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!formData.idJadwal ? "text-gray-400" : "text-gray-700"}`}
              required
            >
              <option value="" disabled>Pilih id jadwal</option>
              <option value="1">Jadwal 1 - Banda Aceh - Sabang 08:00</option>
              <option value="2">Jadwal 2 - Sabang - Banda Aceh 08:00</option>
              <option value="3">Jadwal 3 - Banda Aceh - Sabang 11:00</option>
              <option value="4">Jadwal 4 - Sabang - Banda Aceh 11:00</option>
            </select>
          </div>

          {/* Jumlah Penumpang */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Jumlah penumpang
            </label>
            <input
              type="number"
              name="jumlahPenumpang"
              value={formData.jumlahPenumpang}
              onChange={handleInputChange}
              placeholder="Jumlah penumpang"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              required
            />
          </div>

          {/* Jumlah Kendaraan Roda 2 */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Jumlah kendaraan roda 2
            </label>
            <input
              type="number"
              name="jumlahKendaraanRoda2"
              value={formData.jumlahKendaraanRoda2}
              onChange={handleInputChange}
              placeholder="Jumlah kendaraan roda 2"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              required
            />
          </div>

          {/* Jumlah Kendaraan Roda 4 */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Jumlah kendaraan roda 4
            </label>
            <input
              type="number"
              name="jumlahKendaraanRoda4"
              value={formData.jumlahKendaraanRoda4}
              onChange={handleInputChange}
              placeholder="Jumlah kendaraan roda 4"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              required
            />
          </div>

          {/* Berat Muatan */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Berat Muatan (ton)
            </label>
            <input
              type="number"
              step="0.01"
              name="beratMuatan"
              value={formData.beratMuatan}
              onChange={handleInputChange}
              placeholder="Berat Muatan (ton)"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-8 py-2.5 bg-black text-white rounded hover:bg-gray-800 transition-colors font-medium"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
  );
}