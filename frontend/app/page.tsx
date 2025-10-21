// app/page.tsx

import Header from "./components/Header";
import HeroSection from "../app/components/home/HeroSection";
import WeatherSection from "./components/home/WeatherSection";
import ScheduleTable from "../app/components/home/ScheduleTable";
import SeaWeatherMap from "./components/cuacaLaut/SeaWeatherMap";
import Footer from "../app/components/Footer";

export default function Home() {
  return (
    <div>
      <Header />
      <HeroSection />
      
      <div className="container bg-white mx-auto px-40 py-15">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 items-center">
          <WeatherSection
            pelabuhan="balohan"
            title="Pelabuhan Balohan"
            icon="⚓"
            city="Sabang"
            backgroundImage="/images/balohan-bg4.png" // Opsional
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