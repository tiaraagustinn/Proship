"use client";

import { useEffect } from 'react';
import Layout from '@/app/petugas/layout';
import { usePageTitle } from '@/app/petugas/layout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Image from 'next/image';

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
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle('Dashboard');
  }, [setTitle]);

  return (
    <div className="p-8 m-7 bg-white rounded-lg shadow">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8 ">
        <div className="bg-emerald-400 text-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-4xl font-bold mb-2">2,734</h3>
              <p className="text-sm">Penumpang bulan ini</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
              </svg>
            </div>
          </div>
          <button className="mt-4 text-sm hover:underline">Detail →</button>
        </div>

        <div className="bg-blue-400 text-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-4xl font-bold mb-2">6</h3>
              <p className="text-sm">Berat muatan bulan ini</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"/>
              </svg>
            </div>
          </div>
          <button className="mt-4 text-sm hover:underline">Detail →</button>
        </div>

        <div className="bg-indigo-400 text-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-4xl font-bold mb-2">300</h3>
              <p className="text-sm">Kapal berangkat bulan ini</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
            </div>
          </div>
          <button className="mt-4 text-sm hover:underline">Detail →</button>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-black p-6 rounded-xl shadow-md">
        <h3 className="text-white mb-6 text-lg font-semibold">
          Tren Pergerakan Jumlah Penumpang
        </h3>
        <AreaChart width={1080} height={400} data={trendData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="name" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#fff' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#3B82F6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </div>
    </div>
  );
}