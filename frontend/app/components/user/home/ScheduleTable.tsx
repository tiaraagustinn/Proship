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
    { day: 'Rabu', date: '10 September 2025' },
    { day: 'Kamis', date: '11 September 2025' },
    { day: 'Jumat', date: '12 September 2025' }
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
        return 'inline-flex min-w-28 items-center justify-center rounded-xl border-2 border-green-700 bg-green-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-green-600';
      case 'Waspada':
        return 'inline-flex min-w-28 items-center justify-center rounded-xl border-2 border-yellow-700 bg-yellow-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-yellow-600';
      case 'Bahaya':
        return 'inline-flex min-w-28 items-center justify-center rounded-xl border-2 border-orange-800 bg-orange-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700';
      default:
        return 'inline-flex min-w-28 items-center justify-center rounded-xl border-2 border-gray-700 bg-gray-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-600';
    }
  };

  return (
    <section id="jadwal" className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 rounded-2xl bg-blue-100 p-10">
          {/* Date Tabs */}
          <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-xl border border-blue-900 bg-white">
            <div className="grid grid-cols-3">
              {dates.map((date, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDate(index)}
                  className={`flex flex-col items-center justify-center gap-1 border-r border-blue-900 px-4 py-3 text-center font-semibold transition-all last:border-r-0 ${
                    selectedDate === index
                      ? 'bg-[#4f548c] text-white shadow-sm'
                      : 'bg-white text-blue-800 hover:bg-[#f1f3ff] hover:text-[#13376c]'
                  }`}
                >
                  <span className="text-xl leading-none">{date.day}</span>
                  <span className="text-xs leading-none">{date.date}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-teal-500/40 bg-white shadow-lg">
            <table className="min-w-[860px] w-full table-fixed border-collapse">
              <thead className="bg-gray-600">
                <tr>
                  <th className="w-1/5 whitespace-nowrap border border-blue-200 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white">
                    Keberangkatan
                  </th>
                  <th className="w-1/5 whitespace-nowrap border border-blue-200 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white">
                    Kedatangan
                  </th>
                  <th className="w-1/5 whitespace-nowrap border border-blue-200 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white">
                    Jam
                  </th>
                  <th className="w-1/5 whitespace-nowrap border border-blue-200 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white">
                    Armada
                  </th>
                  <th className="w-1/5 border border-blue-200 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white">
                    Tingkat Keselamatan
                  </th>
                </tr>
              </thead>
              <tbody>
                {scheduleData.map((schedule, index) => (
                  <tr
                    key={index}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-blue-50/70'} hover:bg-blue-50`}
                  >
                    <td className="whitespace-nowrap border border-blue-100 px-4 py-2.5 text-center text-sm font-medium text-gray-900">
                      {schedule.departure}
                    </td>
                    <td className="whitespace-nowrap border border-blue-100 px-4 py-2.5 text-center text-sm font-medium text-gray-900">
                      {schedule.arrival}
                    </td>
                    <td className="whitespace-nowrap border border-blue-100 px-4 py-2.5 text-center text-sm font-semibold text-gray-900">
                      {schedule.time}
                    </td>
                    <td className="whitespace-nowrap border border-blue-100 px-4 py-2.5 text-center text-sm text-gray-900">
                      {schedule.fleet}
                    </td>
                    <td className="border border-blue-100 px-4 py-2.5 text-center">
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
