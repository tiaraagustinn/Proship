// ...existing code...
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header = () => {
  const pathname = usePathname() || '/';

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-5">
        <div className="flex justify-between items-center h-17">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/images/dishub-logo.png" alt="DISHUB" className="w-28 h-12" />
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
            <button className="text-gray-700 hover:text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
// ...existing code...