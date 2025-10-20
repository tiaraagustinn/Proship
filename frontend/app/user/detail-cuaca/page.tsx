import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import WeatherDetail from '@/app/components/detailCuaca/WeatherDetail';


export default function DetailCuacaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        {/* Main Title */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Detail Cuaca</h1>
        </div>
        <WeatherDetail />
      </main>
      <Footer />
    </div>
  );
}
