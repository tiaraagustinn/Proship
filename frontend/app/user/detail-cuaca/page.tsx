import Header from '@/app/components/user/Header';
import Footer from '@/app/components/user/Footer';
import WeatherDetail from '@/app/components/user/detailCuaca/WeatherDetail';

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