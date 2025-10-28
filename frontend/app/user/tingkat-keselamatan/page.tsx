import Header from '@/app/components/user/Header';
import Footer from '@/app/components/user/Footer';

export default function TingkatKeselatamanPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        {/* Main Title */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tingkat Keselamatan</h1>
        </div>

        {/* Info Box */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="bg-green-100 border border-green-300 rounded-lg p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold text-gray-700">Rabu</div>
              <div className="text-gray-600">10 September 2025</div>
            </div>
            <div className="text-green-700 font-bold text-lg">AMAN</div>
            <div className="text-gray-700">Banda Aceh - Sabang<br /><span className="text-sm">08.00</span></div>
          </div>
        </div>

        {/* Table */}
        <div className="max-w-5xl mx-auto mb-8">
          <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-green-700 text-white">
              <tr>
                <th className="px-2 py-2 text-left">Waktu (WIB)</th>
                <th className="px-2 py-2 text-left">Cuaca</th>
                <th className="px-2 py-2 text-left">Angin dari</th>
                <th className="px-2 py-2 text-left">Gelombang</th>
                <th className="px-2 py-2 text-left">Arah Arus</th>
                <th className="px-2 py-2 text-left">Jarak Pandang</th>
                <th className="px-2 py-2 text-left">Suhu (°C)</th>
                <th className="px-2 py-2 text-left">Kelembaban (%)</th>
              </tr>
            </thead>
            <tbody className="bg-white text-gray-700">
              {/* Contoh data statis */}
              <tr>
                <td className="px-2 py-2 border">17 Sep 25, 15:00</td>
                <td className="px-2 py-2 border flex items-center gap-2"><span>☀️</span>Cerah</td>
                <td className="px-2 py-2 border">Barat Daya 16 kt<br /><span className="text-xs text-gray-500">Gust: 25 kt</span></td>
                <td className="px-2 py-2 border">0.3 m<br /><span className="text-xs text-blue-500">Tenang</span></td>
                <td className="px-2 py-2 border">Timur Laut<br /><span className="text-xs text-gray-500">4.50 cm/s</span></td>
                <td className="px-2 py-2 border">10 km</td>
                <td className="px-2 py-2 border">30 °C</td>
                <td className="px-2 py-2 border">73 %</td>
              </tr>
              {/* Tambahkan baris lain sesuai kebutuhan */}
              <tr>
                <td className="px-2 py-2 border">17 Sep 25, 16:00</td>
                <td className="px-2 py-2 border flex items-center gap-2"><span>☀️</span>Cerah</td>
                <td className="px-2 py-2 border">Barat Daya 16 kt<br /><span className="text-xs text-gray-500">Gust: 25 kt</span></td>
                <td className="px-2 py-2 border">0.2 m<br /><span className="text-xs text-blue-500">Tenang</span></td>
                <td className="px-2 py-2 border">Timur Laut<br /><span className="text-xs text-gray-500">4.90 cm/s</span></td>
                <td className="px-2 py-2 border">10 km</td>
                <td className="px-2 py-2 border">30 °C</td>
                <td className="px-2 py-2 border">74 %</td>
              </tr>
              {/* ...tambahkan baris lain sesuai gambar... */}
            </tbody>
          </table>
        </div>

        {/* Keterangan */}
        <div className="max-w-5xl mx-auto bg-gray-200 rounded-lg p-6 min-h-[150px]">
          <h2 className="font-semibold mb-2">Keterangan</h2>
          <p className="text-gray-700">...</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}