"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const ScheduleTable = () => {
  const [selectedDate, setSelectedDate] = useState(0);
  const [data, setData] = useState<any[]>([]);

  // 🔥 TANGGAL (STABIL)
  const dates = [
    { day: "Rabu", label: "12 April 2026", value: "2026-04-12" },
    { day: "Kamis", label: "13 April 2026", value: "2026-04-13" },
    { day: "Jumat", label: "14 April 2026", value: "2026-04-14" },
  ];

  // 🔥 FETCH DATA (ANTI ERROR)
  useEffect(() => {
    const selected = dates[selectedDate];

    fetch(`http://localhost:5000/api/jadwal?tanggal=${selected.value}`)
      .then((res) => res.json())
      .then((result) => {
        console.log("API:", result);

        // 🔥 HANDLE SEMUA KEMUNGKINAN RESPONSE
        if (Array.isArray(result)) {
          setData(result);
        } else if (Array.isArray(result.data)) {
          setData(result.data);
        } else if (Array.isArray(result.jadwal)) {
          setData(result.jadwal);
        } else {
          setData([]); // fallback biar ga crash
        }
      })
      .catch((err) => console.error(err));
  }, [selectedDate]);

  // 🎨 STYLE BADGE
  const getSafetyLevelStyle = (level: string) => {
    switch (level) {
      case "Aman":
        return "inline-flex min-w-28 items-center justify-center rounded-xl border-2 border-green-700 bg-green-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-green-600";
      case "Waspada":
        return "inline-flex min-w-28 items-center justify-center rounded-xl border-2 border-yellow-700 bg-yellow-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-yellow-600";
      case "Bahaya":
        return "inline-flex min-w-28 items-center justify-center rounded-xl border-2 border-orange-800 bg-orange-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700";
      default:
        return "inline-flex min-w-28 items-center justify-center rounded-xl border-2 border-gray-700 bg-gray-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-600";
    }
  };

  // 🔧 FORMAT JAM
  const formatJam = (jam: string) => {
    return jam.slice(0, 5).replace(":", ".");
  };

  // 🔧 KONVERSI STATUS
  const convertStatus = (status: string) => {
    if (status === "aman") return "Aman";
    if (status === "waspada") return "Waspada";
    return "Bahaya";
  };

  return (
    <section id="jadwal" className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 rounded-2xl bg-blue-100 p-10">

          {/* DATE TABS */}
          <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-xl border border-blue-900 bg-white">
            <div className="grid grid-cols-3">
              {dates.map((date, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDate(index)}
                  className={`flex flex-col items-center justify-center gap-1 border-r border-blue-900 px-4 py-3 text-center font-semibold transition-all last:border-r-0 ${
                    selectedDate === index
                      ? "bg-[#4f548c] text-white shadow-sm"
                      : "bg-white text-blue-800 hover:bg-[#f1f3ff] hover:text-[#13376c]"
                  }`}
                >
                  <span className="text-xl">{date.day}</span>
                  <span className="text-xs">{date.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto rounded-2xl border border-teal-500/40 bg-white shadow-lg">
            <table className="min-w-[860px] w-full table-fixed border-collapse">
              <thead className="bg-gray-600">
                <tr>
                  <th className="w-1/5 border px-4 py-3 text-center text-xs font-semibold text-white">
                    Keberangkatan
                  </th>
                  <th className="w-1/5 border px-4 py-3 text-center text-xs font-semibold text-white">
                    Kedatangan
                  </th>
                  <th className="w-1/5 border px-4 py-3 text-center text-xs font-semibold text-white">
                    Jam
                  </th>
                  <th className="w-1/5 border px-4 py-3 text-center text-xs font-semibold text-white">
                    Armada
                  </th>
                  <th className="w-1/5 border px-4 py-3 text-center text-xs font-semibold text-white">
                    Tingkat Keselamatan
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  data.map((schedule, index) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-blue-50/70"
                      } hover:bg-blue-50`}
                    >
                      <td className="border px-4 py-2 text-center text-sm">
                        {schedule.asal}
                      </td>
                      <td className="border px-4 py-2 text-center text-sm">
                        {schedule.tujuan}
                      </td>
                      <td className="border px-4 py-2 text-center text-sm font-semibold">
                        {formatJam(schedule.jam)}
                      </td>
                      <td className="border px-4 py-2 text-center text-sm">
                        {schedule.armada}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        <Link
                          href="/user/tingkat-keselamatan"
                          className={getSafetyLevelStyle(
                            convertStatus(schedule.tingkat_keselamatan)
                          )}
                        >
                          {convertStatus(schedule.tingkat_keselamatan)}
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ScheduleTable;