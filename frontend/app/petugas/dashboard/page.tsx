"use client";

import { useState } from 'react';
import Image from 'next/image';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const trendData = [
  { name: 'Jul', value: 200 },
  { name: 'Aug', value: 300 },
  { name: 'Sep', value: 500 },
  { name: 'Oct', value: 750 },
  { name: 'Nov', value: 400 },
  { name: 'Dec', value: 600 },
  { name: 'Jan', value: 650 },
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6">
        <div className="mb-8">
          <Image
            src="/logo-dishub.png"
            alt="Dishub Aceh Logo"
            width={150}
            height={60}
          />
        </div>

        <nav className="space-y-2">
          <button className="w-full px-4 py-2 text-left bg-black text-white rounded">
            Dashboard
          </button>
          <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded">
            Input Historis Pelayaran
          </button>
          <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded">
            Jadwal
          </button>
          <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded">
            Historis Pelayaran
          </button>
          <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded">
            Profil
          </button>
        </nav>

        <button className="w-full px-4 py-2 bg-red-500 text-white rounded mt-auto">
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-emerald-400 text-white p-6 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-4xl font-bold mb-2">2,734</h3>
                <p className="text-sm">Penumpang bulan ini</p>
              </div>
              <div className="p-2 bg-white/20 rounded-full">
                <Image
                  src="/icons/passengers.png"
                  alt="Passengers icon"
                  width={24}
                  height={24}
                />
              </div>
            </div>
            <button className="mt-4 text-sm hover:underline">Detail →</button>
          </div>

          <div className="bg-blue-400 text-white p-6 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-4xl font-bold mb-2">6</h3>
                <p className="text-sm">Berat muatan bulan ini</p>
              </div>
              <div className="p-2 bg-white/20 rounded-full">
                <Image
                  src="/icons/cargo.png"
                  alt="Cargo icon"
                  width={24}
                  height={24}
                />
              </div>
            </div>
            <button className="mt-4 text-sm hover:underline">Detail →</button>
          </div>

          <div className="bg-indigo-400 text-white p-6 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-4xl font-bold mb-2">300</h3>
                <p className="text-sm">Kapal berangkat bulan ini</p>
              </div>
              <div className="p-2 bg-white/20 rounded-full">
                <Image
                  src="/icons/ship.png"
                  alt="Ship icon"
                  width={24}
                  height={24}
                />
              </div>
            </div>
            <button className="mt-4 text-sm hover:underline">Detail →</button>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-black p-6 rounded-xl">
          <h3 className="text-white mb-4">Tren Pergerakan Jumlah Penumpang</h3>
          <AreaChart
            width={900}
            height={400}
            data={trendData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0066FF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#0066FF"
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </div>
      </div>
    </div>
  );
}