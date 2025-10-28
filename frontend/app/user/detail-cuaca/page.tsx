import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import WeatherDetail from '@/app/components/detailCuaca/WeatherDetail';

export default function DetailCuacaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <WeatherDetail />
      </main>
      <Footer />
    </div>
  );
}