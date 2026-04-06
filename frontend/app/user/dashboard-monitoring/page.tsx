"use client";

import Header from "@/app/components/user/Header";
import Footer from "@/app/components/user/Footer";
import DatePicker from "react-datepicker";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";

const pieData = [
  { name: "Roda 2", value: 5249 },
  { name: "Roda 4", value: 1483 },
];

const COLORS = ["#22c55e", "#0369a1"];

const areaData = [
  { name: "Jul", value: 200 },
  { name: "Aug", value: 300 },
  { name: "Sep", value: 400 },
  { name: "Oct", value: 500 },
  { name: "Nov", value: 300 },
  { name: "Dec", value: 200 },
  { name: "Jan", value: 400 },
];

const barData = [
  { name: "KMP BRR", penumpang: 340 },
  { name: "KMP Papuyu", penumpang: 420 },
  { name: "KMP Tanjung Burang", penumpang: 290 },
  { name: "KMP Express", penumpang: 510 },
];

export default function DashboardMonitoringPage() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleFilter = () => {
    console.log("Filter dari:", startDate, "sampai:", endDate);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-cyan-50 to-blue-50">
      <Header />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-black">
          <h1 className="text-3xl font-bold mb-6 tracking-tight">Dashboard Monitoring</h1>

          <div className="bg-white/90 backdrop-blur rounded-xl border border-sky-100 shadow-sm p-4 sm:p-5 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] gap-4 items-end">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Mulai dari tanggal</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
                  placeholderText="Pilih tanggal"
                />
              </div>
              <div className="hidden md:flex justify-center text-slate-500">s/d</div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Hingga tanggal</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
                  placeholderText="Pilih tanggal"
                />
              </div>
              <button
                onClick={handleFilter}
                disabled={!startDate || !endDate}
                className="h-[42px] px-5 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors disabled:bg-slate-400"
              >
                Terapkan Filter
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-medium mb-1 text-slate-600">Jumlah Penumpang</h3>
              <p className="text-2xl font-bold text-slate-900">5,249</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-medium mb-1 text-slate-600">Jumlah Kendaraan Roda 2</h3>
              <p className="text-2xl font-bold text-slate-900">5,249</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-medium mb-1 text-slate-600">Jumlah Kendaraan Roda 4</h3>
              <p className="text-2xl font-bold text-slate-900">123</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-medium mb-1 text-slate-600">Berat Muatan (Ton)</h3>
              <p className="text-2xl font-bold text-slate-900">456</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-black text-sm">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left whitespace-nowrap">Pelabuhan Asal</th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">Tujuan</th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">Jumlah Penumpang</th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">Jumlah Kend. Roda 2</th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">Jumlah Kend. Roda 4</th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">Berat Muatan (Ton)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">Banda Aceh</td>
                    <td className="px-6 py-4">Sabang</td>
                    <td className="px-6 py-4">345</td>
                    <td className="px-6 py-4">4,398</td>
                    <td className="px-6 py-4">3,843</td>
                    <td className="px-6 py-4">837</td>
                  </tr>
                  <tr className="bg-slate-50 hover:bg-slate-100 transition-colors">
                    <td className="px-6 py-4">Sabang</td>
                    <td className="px-6 py-4">Banda Aceh</td>
                    <td className="px-6 py-4">347</td>
                    <td className="px-6 py-4">234</td>
                    <td className="px-6 py-4">4,244</td>
                    <td className="px-6 py-4">2,442</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-black">
              <h3 className="text-base font-semibold mb-4">Distribusi Kendaraan</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-black">
              <h3 className="text-base font-semibold mb-4">Penumpang per Kapal</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="penumpang" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-black">
            <h3 className="text-base font-semibold mb-4 mt-2">Tren Pergerakan Jumlah Penumpang</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#0ea5e9" fill="#38bdf8" fillOpacity={0.28} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
