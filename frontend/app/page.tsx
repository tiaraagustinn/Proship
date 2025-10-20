// app/page.tsx

import Header from "./components/Header";
import HeroSection from "../app/components/home/HeroSection";
import WeatherSection from "./components/cuacaLaut/WeatherSection";
import ScheduleTable from "../app/components/home/ScheduleTable";
import SeaWeatherMap from "../app/components/home/SeaWeatherMap";
import Footer from "../app/components/Footer";

export default function Home() {
  return (
    <div>
      <Header />
      <HeroSection />
      
      <div className="container bg-white mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WeatherSection
            pelabuhan="balohan"
            title="Pelabuhan Balohan"
            icon="⚓"
            city="Sabang"
            backgroundImage="/images/balohan-bg.png" // Opsional
          />
          <WeatherSection
            pelabuhan="ulee-lheue"
            title="Pelabuhan Ulee Lheue"
            icon="🌊"
            city="Banda Aceh"
            backgroundImage="/images/uleelheue-bg.png" // Opsional
          />
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