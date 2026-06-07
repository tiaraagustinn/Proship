'use client';

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#2c2f5b] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-2">

          {/* Brand & Kontak */}
          <div>
            <img src="/images/dishub-aceh-white.png" alt="Dishub Aceh" className="w-28 h-auto mb-4" />
            <p className="text-sm text-gray-300 leading-relaxed">
              Sistem Dashboard Monitoring Pelayaran yang menyediakan informasi terkait
              kondisi cuaca, tinggi gelombang, dan aktivitas penyeberangan untuk mendukung
              keselamatan transportasi laut.
            </p>
            <div className="mt-6">
              <h3 className="font-semibold text-base mb-3">Kontak</h3>
              <div className="flex items-center gap-4">
                <a
                  href="https://instagram.com/dishub_aceh"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=dishub@acehprov.go.id"
                  aria-label="Email"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </a>
                <a href="tel:(0651)22110" aria-label="Telepon" className="text-gray-300 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Navigasi */}
          <div>
            <h3 className="font-semibold text-base mb-3">Navigasi</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/#jadwal" className="hover:text-white transition-colors">Jadwal</a></li>
              <li><a href="/user/cuaca-laut" className="hover:text-white transition-colors">Cuaca Laut</a></li>
              <li><a href="/user/ais" className="hover:text-white transition-colors">Peta AIS</a></li>
              <li><a href="/user/dashboard-monitoring" className="hover:text-white transition-colors">Dashboard Monitoring</a></li>
            </ul>
          </div>

          {/* Lokasi */}
          <div>
            <h3 className="font-semibold text-base mb-3">Lokasi Dinas Perhubungan</h3>
            <div className="overflow-hidden rounded-xl border border-white/20">
              <iframe
                title="Lokasi Dinas Perhubungan"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3971.076143345433!2d95.32218717746593!3d5.55573141930171!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3040374126edbf49%3A0xfdaa83d3648d978a!2sDinas%20Perhubungan%20Aceh!5e0!3m2!1sen!2sus!4v1772784914402!5m2!1sen!2sus"
                width="100%"
                height="220"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>
            <p className="mt-3 text-sm text-gray-300 leading-relaxed">
              Jl. Mayjen T. Hamzah Bendahara No.52, Kuta Alam, Kec. Kuta Alam,
              Kota Banda Aceh, Aceh 23121
            </p>
          </div>

        </div>

        <div className="border-t border-gray-600 mt-8 pt-4 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Dinas Perhubungan Aceh. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
