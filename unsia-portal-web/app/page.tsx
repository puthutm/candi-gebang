'use client';

import React, { useState } from 'react';

function generateUUID() {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const response = await fetch(`http://${hostname}:3001/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-correlation-id': generateUUID(),
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login gagal. Periksa kembali username dan password Anda.');
      }

      setSuccess(`Selamat datang kembali, ${result.data.user.fullName}!`);
      // In real scenario, store token and redirect to dashboard based on role
    } catch (err: any) {
      setError(err.message || 'Koneksi gagal ke Core Auth Service. Pastikan service berjalan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-slate-900 text-slate-100">
      {/* Left Panel: Hero Brand and Info */}
      <section className="flex-1 hero-mesh relative flex flex-col justify-between p-8 md:p-16 overflow-hidden min-h-[350px] md:min-h-screen">
        <div className="absolute inset-0 dot-pattern opacity-60 z-0"></div>
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-cyan-500/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-accent/15 blur-[100px]"></div>

        {/* Logo and Brand Header */}
        <header className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center shadow-lg shadow-brand-accent/20">
            <i className="ph-bold ph-graduation-cap text-slate-900 text-2xl animate-pulse"></i>
          </div>
          <div>
            <h1 className="font-display font-extrabold text-lg tracking-tight text-white leading-none">
              SIAKAD UNSIA
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-300 font-medium mt-1">
              Universitas Siber Asia
            </p>
          </div>
        </header>

        {/* Hero Copy */}
        <div className="relative z-10 my-auto py-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-brand-accent text-xs font-semibold backdrop-blur-md border border-white/10 mb-6">
            <i className="ph-fill ph-sparkle text-brand-accent"></i>
            Integrated Campus Ecosystem
          </span>
          <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1] mb-6">
            Satu Identitas,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-amber-300">
              Akses Tanpa Batas.
            </span>
          </h2>
          <p className="text-slate-300 max-w-lg text-sm md:text-base leading-relaxed">
            Portal Single Sign-On (SSO) Terpadu untuk mahasiswa, dosen, admin, dan pimpinan Universitas Siber Asia.
          </p>
        </div>

        {/* Stats / Widgets */}
        <footer className="relative z-10 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
          <div className="flex items-center gap-3 bg-white/5 border border-white/5 backdrop-blur-md rounded-xl p-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-brand-accent text-lg">
              <i className="ph-bold ph-shield-check"></i>
            </div>
            <div>
              <p className="text-white font-extrabold text-sm leading-none">SSO Secure</p>
              <p className="text-slate-400 text-[10px] mt-1">OIDC/JWT Standard</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 border border-white/5 backdrop-blur-md rounded-xl p-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-brand-accent text-lg">
              <i className="ph-bold ph-squares-four"></i>
            </div>
            <div>
              <p className="text-white font-extrabold text-sm leading-none">26 Modul</p>
              <p className="text-slate-400 text-[10px] mt-1">Sistem Terintegrasi</p>
            </div>
          </div>
        </footer>
      </section>

      {/* Right Panel: Login Form */}
      <section className="w-full md:w-[480px] flex flex-col justify-center p-8 md:p-12 bg-slate-950 border-l border-slate-800 relative">
        <div className="max-w-md w-full mx-auto">
          {/* Welcome Text */}
          <div className="mb-8">
            <h3 className="font-display font-bold text-2xl text-white">
              Selamat Datang
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Masukkan kredensial SIAKAD Anda untuk masuk ke dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-2" htmlFor="username">
                Username / NIM
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <i className="ph-bold ph-user text-lg"></i>
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username/NIM"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-slate-300 text-xs font-semibold" htmlFor="password">
                  Kata Sandi
                </label>
                <a href="#" className="text-xs text-brand-accent hover:underline">
                  Lupa Sandi?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <i className="ph-bold ph-lock text-lg"></i>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  <i className={`ph-bold ${showPassword ? 'ph-eye-slash' : 'ph-eye'} text-lg`}></i>
                </button>
              </div>
            </div>

            {/* Message Handlers */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs leading-relaxed">
                <i className="ph-fill ph-warning-circle text-lg shrink-0 mt-0.5"></i>
                <div>
                  <p className="font-semibold">Login Gagal</p>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs leading-relaxed">
                <i className="ph-fill ph-check-circle text-lg shrink-0 mt-0.5"></i>
                <div>
                  <p className="font-semibold">Login Berhasil</p>
                  <p className="mt-0.5">{success}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-accent hover:bg-brand-accent-deep text-slate-950 font-bold py-3.5 px-4 rounded-xl text-sm transition-colors duration-150 flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk Aplikasi</span>
                  <i className="ph-bold ph-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          {/* Switch Role Hint / Footer */}
          <div className="mt-12 text-center text-xs text-slate-500">
            <p>SIAKAD v1.0 · Universitas Siber Asia © 2026</p>
          </div>
        </div>
      </section>
    </main>
  );
}
