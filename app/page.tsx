import Header from '@/app/components/Header';
import HeroSection from '@/app/components/HeroSection';
import WeatherSection from '@/app/components/WeatherSection';
import ScheduleTable from '@/app/components/ScheduleTable';
import SeaWeatherMap from '@/app/components/SeaWeatherMap';
import Footer from '@/app/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
      <WeatherSection />
      <ScheduleTable />
      <SeaWeatherMap />
      <Footer />
    </div>
  );
}
