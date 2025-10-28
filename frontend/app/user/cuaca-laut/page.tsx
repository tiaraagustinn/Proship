import Header from '@/app/components/user/Header';
import SeaWeatherMap from '@/app/components/user/cuacaLaut/SeaWeatherMap';
import WeatherForecastSection from '@/app/components/user/cuacaLaut/WeatherForecastSection';
import Footer from '@/app/components/user/Footer';

export default function CuacaLautPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        {/* Main Title */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Peta Cuaca Laut</h1>
        </div>

        {/* Sea Weather Map */}
        <SeaWeatherMap />

        {/* Weather Forecast Section */}
        <WeatherForecastSection />
      </main>
      <Footer />
    </div>
  );
}


