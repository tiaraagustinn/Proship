"use client";

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, User, Lock } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
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

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.userName || loginData.username);
        router.push('/petugas/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Username atau password salah');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // For development: Allow login without backend
      if (loginData.username && loginData.password) {
        localStorage.setItem('userName', loginData.username);
        router.push('/petugas/dashboard');
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative bg-cover bg-center min-h-screen flex items-center justify-center  overflow-hidden bg-blue-950">

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-6">
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

          {/* Forgot Password */}
          <div className="text-right">
            <button 
              type="button" 
              className="text-pink-400 hover:text-pink-300 text-sm font-bold transition-colors tracking-wide"
              onClick={() => alert('Fitur lupa password akan segera hadir')}
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
        <img src="/images/wave1.png" alt="wave1" className="absolute bottom-0 left-0 w-200 h-150"/>
        <img src="/images/wave2.png" alt="wave2" className="absolute top-0 right-0 w-250 h-160"/>
    </section>
  );
}