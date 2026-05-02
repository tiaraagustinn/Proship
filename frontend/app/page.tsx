// app/page.tsx

import Header from "./components/user/Header";
import HeroSection from "../app/components/user/home/HeroSection";
import WeatherSection from "./components/user/home/WeatherSection";
import ScheduleTable from "../app/components/user/home/ScheduleTable";
import SeaWeatherMap from "./components/user/cuacaLaut/SeaWeatherMap";
import Footer from "./components/user/Footer";

export default function Home() {
  return (
    <div>
      <Header />
      <HeroSection />
      
      <div className="bg-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-800 mb-5">Cuaca Pelabuhan Saat Ini</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <WeatherSection
              pelabuhan="balohan"
              title="Pelabuhan Balohan"
              icon="⚓"
              city="Sabang"
              backgroundImage="/images/balohan-bg4.png"
            />
            <WeatherSection
              pelabuhan="ulee-lheue"
              title="Pelabuhan Ulee Lheue"
              icon="🌊"
              city="Banda Aceh"
              backgroundImage="/images/uleelheue-bg.png"
            />
          </div>
        </div>
      </div>
      <div>
      <ScheduleTable />
      <SeaWeatherMap />
      <Footer />
      </div>
      
    </div>
  );
}