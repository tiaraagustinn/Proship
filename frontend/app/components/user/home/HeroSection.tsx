'use client';

import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative bg-cover bg-center min-h-[500px] flex items-center overflow-hidden" style={{ backgroundImage: "url('/images/dash-bg.png')" }}>
      {/* Lapisan transparan di atas gambar */}
      <div className="absolute inset-0" style={{ backgroundColor: '#CDD7E0', opacity: 0.5 }}></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-5 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-black">
              <h1 className="text-4xl lg:text-3xl font-semibold mb-12 leading-tight">
                Navigasi Lebih Aman dengan Informasi Maritim Terintegrasi
              </h1>
              <div className="space-y-4 text-lg leading-relaxed">
                <p>
                 Akses data cuaca laut, pelacakan kapal berbasis AIS, dan dashboard monitoring dalam satu platform yang dirancang untuk mendukung keselamatan pelayaran dan operasional pelabuhan.
                </p>
                <p>
                  Dapatkan informasi terkini secara real-time untuk membantu memantau kondisi laut dan aktivitas pelayaran dengan lebih mudah dan efektif.
                </p>
              </div>
          </div>

         {/* Gambar di atas background
         <section className="relative bg-cover min-h-[500px] flex items-center left-10 w-200 h-auto" style={{ backgroundImage: "url('/images/ship-bg.png')" }}>

         </section> */}
        <img src="/images/ship-bg2.png" alt="kapal" className="absolute left-195 w-160 h-auto"/>
        <img src="/images/ship.png" alt="kapal" className="absolute top-9 right-0 left-210 w-141 h-auto"/>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
