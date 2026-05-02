"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";

const HARI  = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const BULAN = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

function generateDates() {
  const today = new Date();
  return Array.from({ length: 3 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const y   = d.getFullYear();
    const m   = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return {
      hari:  HARI[d.getDay()],
      label: `${d.getDate()} ${BULAN[d.getMonth()]}`,
      value: `${y}-${m}-${day}`,
      isToday: i === 0,
    };
  });
}

function safetyStyle(level: string) {
  switch (level) {
    case 'AMAN':    return 'bg-emerald-100 text-emerald-700 border border-emerald-300';
    case 'WASPADA': return 'bg-amber-100 text-amber-700 border border-amber-300';
    case 'BAHAYA':  return 'bg-red-100 text-red-700 border border-red-300';
    default:        return 'bg-gray-100 text-gray-500 border border-gray-200';
  }
}

function safetyDot(level: string) {
  switch (level) {
    case 'AMAN':    return 'bg-emerald-500';
    case 'WASPADA': return 'bg-amber-500';
    case 'BAHAYA':  return 'bg-red-500';
    default:        return 'bg-gray-400';
  }
}

function normalizeLevel(raw: string | null | undefined): string {
  if (!raw) return '—';
  const up = raw.toUpperCase();
  if (up.includes('AMAN'))    return 'AMAN';
  if (up.includes('WASPADA')) return 'WASPADA';
  if (up.includes('BAHAYA'))  return 'BAHAYA';
  return '—';
}

function formatJam(jam: string) {
  return (jam ?? '').slice(0, 5);
}

interface Schedule {
  asal: string;
  tujuan: string;
  jam: string;
  armada: string;
  tingkat_keselamatan?: string;
}

export default function ScheduleTable() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [data, setData]               = useState<Schedule[]>([]);
  const [loading, setLoading]         = useState(true);

  const dates = useMemo(() => generateDates(), []);

  useEffect(() => {
    setLoading(true);
    setData([]);
    const tanggal = dates[selectedIdx].value;
    fetch(`http://localhost:5000/api/jadwal?tanggal=${tanggal}`)
      .then(r => r.json())
      .then(result => {
        if (Array.isArray(result))             setData(result);
        else if (Array.isArray(result.data))   setData(result.data);
        else if (Array.isArray(result.jadwal)) setData(result.jadwal);
        else setData([]);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [selectedIdx, dates]);

  return (
    <section id="jadwal" className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Jadwal Pelayaran</h2>
          <p className="text-gray-500 text-sm mt-1">Rute Ulee Lheue – Balohan (Banda Aceh ↔ Sabang)</p>
        </div>

        {/* Tabs tanggal */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {dates.map((d, i) => (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              className={`flex-shrink-0 flex flex-col items-center px-5 py-3 rounded-xl border font-semibold transition-all text-sm ${
                selectedIdx === i
                  ? 'bg-blue-700 border-blue-700 text-white shadow-md'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <span className="text-xs font-medium opacity-80">
                {d.isToday ? 'Hari Ini' : d.hari}
              </span>
              <span className="text-base font-bold mt-0.5">{d.label}</span>
            </button>
          ))}
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-700 text-white text-left">
                  <th className="px-5 py-3.5 font-semibold whitespace-nowrap">Keberangkatan</th>
                  <th className="px-5 py-3.5 font-semibold whitespace-nowrap">Kedatangan</th>
                  <th className="px-5 py-3.5 font-semibold whitespace-nowrap text-center">Jam</th>
                  <th className="px-5 py-3.5 font-semibold whitespace-nowrap">Armada</th>
                  <th className="px-5 py-3.5 font-semibold whitespace-nowrap text-center">Tingkat Keselamatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-gray-100 rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <div className="text-gray-400">
                        <div className="text-3xl mb-2">🚢</div>
                        <p className="font-medium text-gray-500">Tidak ada jadwal</p>
                        <p className="text-xs mt-1 text-gray-400">Belum ada jadwal pelayaran untuk tanggal ini</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((row, i) => {
                    const level = normalizeLevel(row.tingkat_keselamatan);
                    return (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                        <td className="px-5 py-3.5 font-medium text-gray-800">{row.asal}</td>
                        <td className="px-5 py-3.5 text-gray-700">{row.tujuan}</td>
                        <td className="px-5 py-3.5 text-center font-bold text-gray-900 tabular-nums">
                          {formatJam(row.jam)}
                        </td>
                        <td className="px-5 py-3.5 text-gray-700">{row.armada}</td>
                        <td className="px-5 py-3.5 text-center">
                          <Link
                            href="/user/tingkat-keselamatan"
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-opacity hover:opacity-80 ${safetyStyle(level)}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${safetyDot(level)}`} />
                            {level}
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
