"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { usePageTitle } from '@/app/petugas/layout';
import { CheckCircle, XCircle, Ship, MapPin, Clock } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface JadwalOption {
  id_jadwal: number;
  asal: string;
  tujuan: string;
  jam: string;
  tanggal: string;
  armada: string;
}

interface FormData {
  id_jadwal: string;
  jmlh_penumpang: string;
  jmlh_kend_r2: string;
  jmlh_kend_r4: string;
  berat_muatan: string;
}

function formatTanggal(raw: string): string {
  if (!raw) return '-';
  const datePart = String(raw).substring(0, 10);
  const [year, month, day] = datePart.split('-');
  if (!year || !month || !day) return raw;
  return `${day}/${month}/${year}`;
}

function formatJam(raw: string): string {
  if (!raw) return '-';
  return raw.substring(0, 5);
}

const NAMA_BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function daysInMonth(m: string, y: string): number {
  if (!m || !y) return 31;
  return new Date(parseInt(y), parseInt(m), 0).getDate();
}

export default function InputHistorisPage() {
  const { setTitle } = usePageTitle();
  const [jadwalList, setJadwalList] = useState<JadwalOption[]>([]);
  const [inputtedJadwalIds, setInputtedJadwalIds] = useState<Set<number>>(new Set());
  const [loadingJadwal, setLoadingJadwal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedTanggal, setSelectedTanggal] = useState('');

  // Date picker state
  const [selDay, setSelDay] = useState('');
  const [selMonth, setSelMonth] = useState('');
  const [selYear, setSelYear] = useState('');

  const thisYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => String(thisYear - 2 + i));

  const [formData, setFormData] = useState<FormData>({
    id_jadwal: '',
    jmlh_penumpang: '',
    jmlh_kend_r2: '',
    jmlh_kend_r4: '',
    berat_muatan: '',
  });

  const selectedJadwal = jadwalList.find(j => String(j.id_jadwal) === formData.id_jadwal) ?? null;

  useEffect(() => {
    setTitle('Input Historis Angkutan Penyeberangan');
  }, [setTitle]);

  const handleTanggalChange = (day: string, month: string, year: string) => {
    setSelDay(day);
    setSelMonth(month);
    setSelYear(year);
    if (day && month && year) {
      setSelectedTanggal(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    } else {
      setSelectedTanggal('');
    }
  };

  useEffect(() => {
    if (!selectedTanggal) {
      setJadwalList([]);
      setInputtedJadwalIds(new Set());
      return;
    }
    setLoadingJadwal(true);
    setFormData(prev => ({ ...prev, id_jadwal: '' }));

    Promise.all([
      fetch(`${API}/jadwal?tanggal=${selectedTanggal}`).then(r => r.json()),
      fetch(`${API}/historis`).then(r => r.json()),
    ])
      .then(([jadwalData, historisData]) => {
        setJadwalList(Array.isArray(jadwalData) ? jadwalData : []);
        if (historisData.success && Array.isArray(historisData.data)) {
          const ids = new Set<number>(
            historisData.data
              .filter((h: { tanggal: string; id_jadwal: number }) =>
                h.tanggal && String(h.tanggal).substring(0, 10) === selectedTanggal
              )
              .map((h: { id_jadwal: number }) => h.id_jadwal)
          );
          setInputtedJadwalIds(ids);
        }
      })
      .catch(err => console.error('Gagal fetch data:', err))
      .finally(() => setLoadingJadwal(false));
  }, [selectedTanggal]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ id_jadwal: '', jmlh_penumpang: '', jmlh_kend_r2: '', jmlh_kend_r4: '', berat_muatan: '' });
    setSelectedTanggal('');
    setSelDay(''); setSelMonth(''); setSelYear('');
    setJadwalList([]);
    setInputtedJadwalIds(new Set());
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedJadwal) {
      showNotification('error', 'Pilih jadwal pelayaran terlebih dahulu.');
      return;
    }
    setSubmitting(true);

    // Gabungkan tanggal + jam jadwal jadi timestamp
    const tanggalJadwal = selectedJadwal.tanggal
      ? String(selectedJadwal.tanggal).substring(0, 10)
      : selectedTanggal;
    const jamJadwal = selectedJadwal.jam ? formatJam(selectedJadwal.jam) : '00:00';
    const timestamp = `${tanggalJadwal} ${jamJadwal}:00`;

    try {
      const response = await fetch(`${API}/manifes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp,
          nama_kapal:       selectedJadwal.armada,
          pelabuhan_asal:   selectedJadwal.asal,
          tujuan:           selectedJadwal.tujuan,
          jumlah_penumpang: Number(formData.jmlh_penumpang),
          kendaraan_gol_2:  Number(formData.jmlh_kend_r2),
          kendaraan_gol_4:  Number(formData.jmlh_kend_r4),
          jumlah_barang_ton: Number(formData.berat_muatan),
        }),
      });

      if (response.ok) {
        showNotification('success', 'Data historis berhasil disimpan.');
        resetForm();
      } else {
        const err = await response.json();
        showNotification('error', 'Gagal menyimpan: ' + (err.message || 'Terjadi kesalahan.'));
      }
    } catch {
      showNotification('error', 'Tidak dapat terhubung ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-400";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const selectDateClass = "border border-gray-300 rounded-lg px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white";

  return (
    <div className="m-3 md:m-7">
      {notification && (
        <div className={`flex items-center gap-3 px-5 py-4 rounded-lg mb-5 shadow-sm border ${
          notification.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {notification.type === 'success'
            ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
            : <XCircle className="w-5 h-5 flex-shrink-0" />
          }
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Pilih Tanggal — dd/mm/yyyy dropdown */}
          <div>
            <label className={labelClass}>Tanggal Pelayaran</label>
            <div className="flex gap-2">
              <select
                value={selDay}
                onChange={e => handleTanggalChange(e.target.value, selMonth, selYear)}
                className={`${selectDateClass} w-24`}
                required
              >
                <option value="">Tgl</option>
                {Array.from({ length: daysInMonth(selMonth, selYear) }, (_, i) =>
                  String(i + 1).padStart(2, '0')
                ).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select
                value={selMonth}
                onChange={e => handleTanggalChange(selDay, e.target.value, selYear)}
                className={`${selectDateClass} flex-1`}
                required
              >
                <option value="">Bulan</option>
                {NAMA_BULAN.map((b, i) => (
                  <option key={i} value={String(i + 1).padStart(2, '0')}>{b}</option>
                ))}
              </select>
              <select
                value={selYear}
                onChange={e => handleTanggalChange(selDay, selMonth, e.target.value)}
                className={`${selectDateClass} w-28`}
                required
              >
                <option value="">Tahun</option>
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Pilih Jadwal */}
          {selectedTanggal && (
            <div>
              <label className={labelClass}>Jadwal Pelayaran</label>
              <select
                name="id_jadwal"
                value={formData.id_jadwal}
                onChange={handleInputChange}
                className={`${inputClass} ${!formData.id_jadwal ? 'text-gray-400' : 'text-gray-700'}`}
                required
                disabled={loadingJadwal}
              >
                <option value="" disabled>
                  {loadingJadwal ? 'Memuat jadwal...' : jadwalList.length === 0 ? 'Tidak ada jadwal di tanggal ini' : 'Pilih jadwal pelayaran'}
                </option>
                {jadwalList.map(j => (
                  <option key={j.id_jadwal} value={j.id_jadwal} className="text-gray-700">
                    {inputtedJadwalIds.has(j.id_jadwal) ? '✓ ' : ''}{j.asal} → {j.tujuan} | {formatJam(j.jam)} | {j.armada}{inputtedJadwalIds.has(j.id_jadwal) ? ' (sudah diinput)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Warning sudah diinput */}
          {formData.id_jadwal && inputtedJadwalIds.has(Number(formData.id_jadwal)) && (
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg px-4 py-3 text-sm">
              <XCircle className="w-4 h-4 flex-shrink-0 text-yellow-600" />
              <span>Jadwal ini sudah pernah diinput historisnya. Pastikan tidak ada duplikasi data.</span>
            </div>
          )}

          {/* Preview Jadwal Terpilih */}
          {selectedJadwal && (
            <div className="rounded-lg border border-teal-200 bg-teal-50 px-5 py-4">
              <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-3">Detail Jadwal Terpilih</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-teal-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Rute</p>
                    <p className="font-medium">{selectedJadwal.asal} → {selectedJadwal.tujuan}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 text-teal-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Tanggal & Jam</p>
                    <p className="font-medium">{formatTanggal(selectedJadwal.tanggal)}, {formatJam(selectedJadwal.jam)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Ship className="w-4 h-4 mt-0.5 text-teal-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Armada</p>
                    <p className="font-medium">{selectedJadwal.armada}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200" />

          {/* Data Angkutan */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-4">Data Angkutan</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Jumlah Penumpang <span className="text-gray-400 font-normal">(orang)</span></label>
                <input type="number" name="jmlh_penumpang" value={formData.jmlh_penumpang} onChange={handleInputChange} placeholder="0" min="0" className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Berat Muatan <span className="text-gray-400 font-normal">(ton)</span></label>
                <input type="number" step="0.01" name="berat_muatan" value={formData.berat_muatan} onChange={handleInputChange} placeholder="0.00" min="0" className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Kendaraan Roda 2 <span className="text-gray-400 font-normal">(unit)</span></label>
                <input type="number" name="jmlh_kend_r2" value={formData.jmlh_kend_r2} onChange={handleInputChange} placeholder="0" min="0" className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Kendaraan Roda 4 <span className="text-gray-400 font-normal">(unit)</span></label>
                <input type="number" name="jmlh_kend_r4" value={formData.jmlh_kend_r4} onChange={handleInputChange} placeholder="0" min="0" className={inputClass} required />
              </div>
            </div>
          </div>

          {/* Tombol */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
              Reset
            </button>
            <button type="submit" disabled={submitting} className={`px-10 py-2.5 rounded-lg font-semibold transition-colors ${submitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-teal-700 text-white hover:bg-teal-800'}`}>
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
