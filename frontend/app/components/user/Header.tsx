'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header = () => {
  const pathname = usePathname() || '/';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-[1100] bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-5">
        <div className="flex justify-between items-center h-17">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
            <img src="/images/dishub-logo.png" alt="DISHUB" className="w-28 h-12" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className={isActive('/') ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-blue-400 font-semibold transition-colors'}
              aria-current={isActive('/') ? 'page' : undefined}
            >
              HOME
            </Link>
            <Link
              href="/user/cuaca-laut"
              className={isActive('/user/cuaca-laut') ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-blue-400 font-semibold transition-colors'}
              aria-current={isActive('/user/cuaca-laut') ? 'page' : undefined}
            >
              CUACA LAUT
            </Link>
            <Link
              href="/user/ais"
              className={isActive('/user/ais') ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-blue-400 font-semibold transition-colors'}
              aria-current={isActive('/user/ais') ? 'page' : undefined}
            >
              AIS TRACKER
            </Link>
            <Link
              href="/user/dashboard-monitoring"
              className={isActive('/user/dashboard-monitoring') ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-blue-400 font-semibold transition-colors'}
              aria-current={isActive('/user/dashboard-monitoring') ? 'page' : undefined}
            >
              DASHBOARD MONITORING
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              className="text-gray-700 hover:text-blue-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block rounded px-3 py-2 ${
                isActive('/') ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-400 font-semibold'
              }`}
              aria-current={isActive('/') ? 'page' : undefined}
            >
              HOME
            </Link>
            <Link
              href="/user/cuaca-laut"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block rounded px-3 py-2 ${
                isActive('/user/cuaca-laut')
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-400 font-semibold'
              }`}
              aria-current={isActive('/user/cuaca-laut') ? 'page' : undefined}
            >
              CUACA LAUT
            </Link>
            <Link
              href="/user/ais"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block rounded px-3 py-2 ${
                isActive('/user/ais') ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-400 font-semibold'
              }`}
              aria-current={isActive('/user/ais') ? 'page' : undefined}
            >
              AIS TRACKER
            </Link>
            <Link
              href="/user/dashboard-monitoring"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block rounded px-3 py-2 ${
                isActive('/user/dashboard-monitoring')
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-400 font-semibold'
              }`}
              aria-current={isActive('/user/dashboard-monitoring') ? 'page' : undefined}
            >
              DASHBOARD MONITORING
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
// ...existing code...