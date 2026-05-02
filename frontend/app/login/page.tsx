"use client";

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail } from 'lucide-react';

const ADMIN_EMAIL = 'admin@dishub-aceh.go.id';

interface LoginData {
  username: string;
  password: string;
}

export default function PetugasLoginPage() {
  const router = useRouter();
  const [loginData, setLoginData] = useState<LoginData>({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [isInactive, setIsInactive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setIsInactive(false);
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!loginData.username || !loginData.password) {
        setError('Username dan password harus diisi');
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (response.status === 403) {
        const errorData = await response.json();
        setIsInactive(true);
        setError('');
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('userId', data.userId);
        sessionStorage.setItem('userName', data.userName || loginData.username);
        sessionStorage.setItem('username', data.username);
        sessionStorage.setItem('role', data.role);
        sessionStorage.setItem('email', data.email);
        
        // Redirect berdasarkan role
        if (data.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (data.role === 'petugas') {
          router.push('/petugas/dashboard');
        } else {
          router.push('/user/dashboard-monitoring');
        }
      } else {
        const errorData = await response.json();
        setIsInactive(false);
        setError(errorData.message || 'Username atau password salah');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative bg-cover bg-center min-h-screen flex items-center justify-center  overflow-hidden bg-blue-950">

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-sm md:max-w-md px-4 md:px-6">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <img src="/images/simbol-dishub.png" alt="Dinas Perhubungan Aceh" className="w-32 h-35"/>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username Input */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              name="username"
              placeholder="USERNAME"
              value={loginData.username}
              onChange={handleInputChange}
              className="w-full pl-12 pr-4 py-4 bg-blue-900/30 backdrop-blur-md border-2 border-yellow-400 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-yellow-300 focus:bg-blue-900/40 transition-all font-medium"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              name="password"
              placeholder="PASSWORD"
              value={loginData.password}
              onChange={handleInputChange}
              className="w-full pl-12 pr-4 py-4 bg-blue-900/30 backdrop-blur-md border-2 border-yellow-400 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-yellow-300 focus:bg-blue-900/40 transition-all font-medium"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 backdrop-blur-sm border border-red-400 text-white px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Akun Nonaktif */}
          {isInactive && (
            <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-400 text-white px-4 py-3 rounded-lg text-sm space-y-1">
              <p className="font-semibold">Akun Anda telah dinonaktifkan</p>
              <p className="text-yellow-200 text-xs">Untuk pengaktifan kembali, silakan hubungi admin.</p>
            </div>
          )}

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              className="text-pink-400 hover:text-pink-300 text-sm font-bold transition-colors tracking-wide"
              onClick={() => setShowForgot(true)}
            >
              LUPA PASSWORD?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-white text-blue-700 font-bold text-lg rounded-lg hover:bg-gray-100 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
          >
            {isLoading ? 'LOADING...' : 'LOGIN'}
          </button>
        </form>

        {/* Footer Text */}
        <div className="text-center mt-8">
          <p className="text-white/60 text-sm">
            © 2025 Dinas Perhubungan Aceh
          </p>
        </div>
      </div>
      <img src="/images/wave1.png" alt="wave1" className="absolute bottom-0 left-0 w-1/2 md:w-2/5 h-auto opacity-80"/>
      <img src="/images/wave2.png" alt="wave2" className="absolute top-0 right-0 w-1/2 md:w-2/5 h-auto opacity-80"/>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-blue-900" />
            </div>
            <h2 className="text-xl font-bold text-blue-900 mb-2">Lupa Password?</h2>
            <p className="text-gray-500 text-sm mb-4">
              Untuk reset password, silakan hubungi admin melalui email berikut:
            </p>
            <a
              href={`mailto:${ADMIN_EMAIL}`}
              className="inline-block bg-blue-50 border border-blue-200 text-blue-900 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-100 transition mb-6"
            >
              {ADMIN_EMAIL}
            </a>
            <button
              onClick={() => setShowForgot(false)}
              className="w-full py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition font-medium"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </section>
  );
}