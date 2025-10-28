"use client";

import Header from '@/app/components/user/Header';
import Footer from '@/app/components/user/Footer';
import DatePicker from 'react-datepicker';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import "react-datepicker/dist/react-datepicker.css";
import { useState } from 'react';

const pieData = [
  { name: 'Roda 2', value: 5249 },
  { name: 'Roda 4', value: 1483 },
];

const COLORS = ['#FFC0CB', '#000080'];

const areaData = [
  { name: 'Jul', value: 200 },
  { name: 'Aug', value: 300 },
  { name: 'Sep', value: 400 },
  { name: 'Oct', value: 500 },
  { name: 'Nov', value: 300 },
  { name: 'Dec', value: 200 },
  { name: 'Jan', value: 400 },
];

export default function DashboardMonitoringPage() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  return (
    <div className="min-h-screen bg-green-50">
      <Header />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-black">
          <h1 className="text-3xl font-bold mb-8">Dashboard Monitoring</h1>

          {/* Date Range Picker */}
          <div className="flex items-center gap-4 mb-8">
            <div>
              <label className="block text-base mb-1">Mulai dari tanggal</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                className="p-2 border rounded"
              />
            </div>
            <div className="mt-6">→</div>
            <div>
              <label className="block text-base mb-1">Hingga tanggal</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                className="p-2 border rounded"
              />
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium mb-2">Jumlah Penumpang</h3>
              <p className="text-sm font-bold mb-2">5,249</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium mb-2">Jumlah Kendaraan Roda 2</h3>
              <p className="text-sm font-bold mb-2">5249</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium mb-2">Jumlah Kendaraan Roda 4</h3>
              <p className="text-sm font-bold mb-2">123</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium mb-2">Berat Muatan (Ton)</h3>
              <p  className="text-sm font-bold mb-2">456</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
            <table className="min-w-full text-black">
              <thead className="bg-black text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Pelabuhan Asal</th>
                  <th className="px-6 py-3 text-left">Tujuan</th>
                  <th className="px-6 py-3 text-left">Jumlah Penumpang</th>
                  <th className="px-6 py-3 text-left">Jumlah Kend. Roda 2</th>
                  <th className="px-6 py-3 text-left">Jumlah Kend. Roda 4</th>
                  <th className="px-6 py-3 text-left">Berat Muatan (Ton)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-6 py-4">Banda Aceh</td>
                  <td className="px-6 py-4">Sabang</td>
                  <td className="px-6 py-4">345</td>
                  <td className="px-6 py-4">4398</td>
                  <td className="px-6 py-4">3843</td>
                  <td className="px-6 py-4">837</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4">Sabang</td>
                  <td className="px-6 py-4">Banda Aceh</td>
                  <td className="px-6 py-4">347</td>
                  <td className="px-6 py-4">234</td>
                  <td className="px-6 py-4">4244</td>
                  <td className="px-6 py-4">2442</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow text-black">
              <h3 className="text-base font-medium mb-4">Distribusi Kendaraan</h3>
              <PieChart width={400} height={300}>
                <Pie
                  data={pieData}
                  cx={200}
                  cy={150}
                  innerRadius={0}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-black">
              <h3 className="text-base font-medium mb-4">Penumpang per Kapal</h3>
              {/* Add bar chart here */}
            </div>
          </div>

          {/* Area Chart */}
          <div className="bg-white p-4 rounded-lg shadow text-black">
            <h3 className="text-base font-medium mb-4 mt-2">Tren Pergerakan Jumlah Penumpang</h3>
            <AreaChart
              width={1050}
              height={350}
              data={areaData}
              margin={{ top: 10, right: 0, left: 80, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
            </AreaChart>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
