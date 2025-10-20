'use client';

import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative bg-cover bg-center min-h-[500px] flex items-center" style={{ backgroundImage: "url('/images/dash-bg.png')" }}>
      {/* Lapisan transparan di atas gambar */}
      <div className="absolute inset-0" style={{ backgroundColor: '#CDD7E0', opacity: 0.5 }}></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-5 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-black">
              <h1 className="text-4xl lg:text-3xl font-semibold mb-12 leading-tight">
                LOREM IPSUM DOLOR SIT AMET
              </h1>
              <div className="space-y-4 text-lg leading-relaxed">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
                </p>
                <p>
                  Ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
                <p>
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error.
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
