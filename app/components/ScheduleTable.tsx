'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface ScheduleData {
  departure: string;
  arrival: string;
  time: string;
  fleet: string;
  safetyLevel: 'Aman' | 'Waspada' | 'Bahaya';
}

const ScheduleTable = () => {
  const [selectedDate, setSelectedDate] = useState(0);

  const dates = [
    'Rabu 10 September 2025',
    'Kamis 11 September 2025', 
    'Jumat 12 September 2025'
  ];

  const scheduleData: ScheduleData[] = [
    {
      departure: 'Banda Aceh',
      arrival: 'Sabang',
      time: '08.00',
      fleet: 'KMP. BRR',
      safetyLevel: 'Aman'
    },
    {
      departure: 'Sabang',
      arrival: 'Banda Aceh',
      time: '08.00',
      fleet: 'KMP. Aceh Hebat',
      safetyLevel: 'Waspada'
    },
    {
      departure: 'Banda Aceh',
      arrival: 'Sabang',
      time: '11.00',
      fleet: 'KMP. Aceh Hebat',
      safetyLevel: 'Bahaya'
    },
    {
      departure: 'Sabang',
      arrival: 'Banda Aceh',
      time: '11.00',
      fleet: 'KMP. BRR',
      safetyLevel: 'Waspada'
    },
    {
      departure: 'Banda Aceh',
      arrival: 'Sabang',
      time: '14.00',
      fleet: 'KMP. Aceh Hebat',
      safetyLevel: 'Aman'
    },
    {
      departure: 'Sabang',
      arrival: 'Banda Aceh',
      time: '14.00',
      fleet: 'KMP. BRR',
      safetyLevel: 'Aman'
    },
    {
      departure: 'Banda Aceh',
      arrival: 'Sabang',
      time: '17.00',
      fleet: 'KMP. Aceh Hebat',
      safetyLevel: 'Waspada'
    },
    {
      departure: 'Sabang',
      arrival: 'Banda Aceh',
      time: '17.00',
      fleet: 'KMP. BRR',
      safetyLevel: 'Waspada'
    }
  ];

  const getSafetyLevelStyle = (level: string) => {
    switch (level) {
      case 'Aman':
        return 'bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium cursor-pointer transition-colors duration-200 shadow-sm hover:shadow-md';
      case 'Waspada':
        return 'bg-orange-400 hover:bg-orange-500 text-white px-3 py-1 rounded text-sm font-medium cursor-pointer transition-colors duration-200 shadow-sm hover:shadow-md';
      case 'Bahaya':
        return 'bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium cursor-pointer transition-colors duration-200 shadow-sm hover:shadow-md';
      default:
        return 'bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium cursor-pointer transition-colors duration-200 shadow-sm hover:shadow-md';
    }
  };

  return (
    <section className="py-12 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg border-2 border-teal-500 overflow-hidden">
          {/* Date Tabs */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="flex">
              {dates.map((date, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDate(index)}
                  className={`px-6 py-4 font-medium text-sm transition-colors ${
                    selectedDate === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  {date}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-800">
                    Keberangkatan
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-800">
                    Kedatangan
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-800">
                    Jam
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-800">
                    Armada
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-800">
                    Tingkat Keselamatan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-gray-100">
                {scheduleData.map((schedule, index) => (
                  <tr key={index} className="bg-white">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {schedule.departure}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {schedule.arrival}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {schedule.time}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {schedule.fleet}
                    </td>
                    <td className="px-6 py-4">
                      <Link href="/user/tingkat-keselamatan" className={getSafetyLevelStyle(schedule.safetyLevel)}>
                        {schedule.safetyLevel}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScheduleTable;
