'use client';

import React, { useState, useEffect } from 'react';

interface Application {
  id: string;
  code: string;
  name: string;
  description: string | null;
  url: string;
}

export default function DashboardOverview() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ fullName: string; role: string; username: string } | null>(null);

  // Form states for adding application
  const [appCode, setAppCode] = useState('');
  const [appName, setAppName] = useState('');
  const [appDesc, setAppDesc] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [addingApp, setAddingApp] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);
  const [appSuccess, setAppSuccess] = useState<string | null>(null);

  // Impersonate states
  const [targetUsername, setTargetUsername] = useState('');
  const [impersonateReason, setImpersonateReason] = useState('');
  const [impersonating, setImpersonating] = useState(false);
  const [impersonateError, setImpersonateError] = useState<string | null>(null);

  // Load session and fetch apps
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          console.error(e);
        }
      }
    }
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoadingApps(true);
    try {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const response = await fetch(`http://${hostname}:3001/api/v1/applications`);
      const result = await response.json();
      if (response.ok) {
        setApps(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingApp(true);
    setAppError(null);
    setAppSuccess(null);

    try {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const response = await fetch(`http://${hostname}:3001/api/v1/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: appCode,
          name: appName,
          description: appDesc,
          url: appUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menambahkan aplikasi.');
      }

      setAppSuccess('Aplikasi SSO berhasil didaftarkan secara dinamis!');
      setAppCode('');
      setAppName('');
      setAppDesc('');
      setAppUrl('');
      fetchApplications();
    } catch (err: any) {
      setAppError(err.message || 'Gagal menambahkan aplikasi.');
    } finally {
      setAddingApp(false);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus integrasi aplikasi ini?')) return;
    try {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const response = await fetch(`http://${hostname}:3001/api/v1/applications/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchApplications();
      }
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };

  const handleImpersonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setImpersonating(true);
    setImpersonateError(null);

    try {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const token = localStorage.getItem('token');

      const response = await fetch(`http://${hostname}:3001/api/v1/auth/impersonate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetUsername,
          reason: impersonateReason || 'Administratif Impersonation (Login As)',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal melakukan impersonasi.');
      }

      // Store current admin credentials
      if (typeof window !== 'undefined') {
        const currentToken = localStorage.getItem('token');
        const currentUserData = localStorage.getItem('user');
        if (currentToken && currentUserData) {
          localStorage.setItem('adminToken', currentToken);
          localStorage.setItem('adminUser', currentUserData);
        }

        // Save impersonated credentials
        localStorage.setItem('token', result.data.accessToken);
        localStorage.setItem('user', JSON.stringify(result.data.user));

        // Reload dashboard to apply active session change
        window.location.reload();
      }
    } catch (err: any) {
      setImpersonateError(err.message || 'Gagal masuk sebagai user ini. Pastikan username/NIM terdaftar.');
    } finally {
      setImpersonating(false);
    }
  };

  const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <header className="flex justify-between items-center pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            SSO Launchpad
          </h2>
          <p className="text-slate-400 mt-1">
            Selamat datang di Portal Akses Terpadu Universitas Siber Asia.
          </p>
        </div>
        <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-xs font-semibold uppercase tracking-wider">
          Role: {currentUser?.role || 'Super Admin'}
        </div>
      </header>

      {/* Dynamic SSO Apps Section */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
          Aplikasi SSO Terintegrasi
        </h3>

        {loadingApps ? (
          <div className="text-slate-500 text-sm italic py-8">Memuat aplikasi terdaftar...</div>
        ) : apps.length === 0 ? (
          <div className="p-8 bg-slate-900/20 border border-slate-900 rounded-2xl text-center text-slate-500 text-sm">
            Belum ada aplikasi yang terintegrasi di SSO. Gunakan konsol admin untuk mendaftarkan aplikasi baru.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <div
                key={app.id}
                className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/15 transition-all duration-300"></div>
                
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-slate-300">
                      {app.code}
                    </span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <h4 className="font-bold text-lg text-white mb-2 group-hover:text-indigo-400 transition-colors">
                    {app.name}
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    {app.description || 'Tidak ada deskripsi.'}
                  </p>
                </div>

                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-center text-sm font-semibold transition-all shadow-md hover:shadow-indigo-600/10 block"
                >
                  Buka Aplikasi
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Impersonation & Application Registry */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-slate-900">
          
          {/* Section: Impersonation (Login As) */}
          <section className="p-6 bg-slate-900/30 border border-slate-800/80 rounded-2xl backdrop-blur-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                Login As (Impersonasi User)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Gunakan konsol ini untuk masuk sebagai dosen, mahasiswa, atau admin lain tanpa kata sandi.
              </p>
            </div>

            <form onSubmit={handleImpersonate} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2" htmlFor="targetUsername">
                  Username / NIM Target
                </label>
                <input
                  id="targetUsername"
                  type="text"
                  required
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value)}
                  placeholder="Contoh: NIM2026001 atau superadmin"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2" htmlFor="impersonateReason">
                  Alasan Impersonasi
                </label>
                <input
                  id="impersonateReason"
                  type="text"
                  value={impersonateReason}
                  onChange={(e) => setImpersonateReason(e.target.value)}
                  placeholder="Contoh: Troubleshooting Nilai KRS Akademik"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {impersonateError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium">
                  {impersonateError}
                </div>
              )}

              <button
                type="submit"
                disabled={impersonating}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {impersonating ? 'Memproses Impersonasi...' : 'Masuk Sebagai User'}
              </button>
            </form>
          </section>

          {/* Section: Add SSO Application (Dinamis) */}
          <section className="p-6 bg-slate-900/30 border border-slate-800/80 rounded-2xl backdrop-blur-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
                Daftarkan Aplikasi Baru ke SSO
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Modul yang ditambahkan di sini akan langsung tampil dinamis di Launchpad SSO semua user.
              </p>
            </div>

            <form onSubmit={handleAddApplication} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2" htmlFor="appCode">
                    Kode Aplikasi
                  </label>
                  <input
                    id="appCode"
                    type="text"
                    required
                    value={appCode}
                    onChange={(e) => setAppCode(e.target.value)}
                    placeholder="lms-v2"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2" htmlFor="appName">
                    Nama Aplikasi
                  </label>
                  <input
                    id="appName"
                    type="text"
                    required
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="E-learning LMS V2"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2" htmlFor="appUrl">
                  URL / Endpoint Aplikasi
                </label>
                <input
                  id="appUrl"
                  type="url"
                  required
                  value={appUrl}
                  onChange={(e) => setAppUrl(e.target.value)}
                  placeholder="http://10.10.20.56:3008"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2" htmlFor="appDesc">
                  Deskripsi Singkat
                </label>
                <input
                  id="appDesc"
                  type="text"
                  value={appDesc}
                  onChange={(e) => setAppDesc(e.target.value)}
                  placeholder="Platform belajar-mengajar online siber terintegrasi"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {appError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium">
                  {appError}
                </div>
              )}

              {appSuccess && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-medium">
                  {appSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={addingApp}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {addingApp ? 'Mendaftarkan...' : 'Daftarkan Aplikasi'}
              </button>
            </form>

            {/* List and Delete registered Apps */}
            <div className="pt-4 border-t border-slate-850">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                List & Hapus Integrasi Aplikasi
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {apps.map((app) => (
                  <div key={app.id} className="flex justify-between items-center p-2.5 bg-slate-950 border border-slate-900 rounded-xl text-xs">
                    <div>
                      <span className="font-bold text-white">{app.name}</span>
                      <span className="text-slate-500 ml-2">({app.code})</span>
                    </div>
                    <button
                      onClick={() => handleDeleteApplication(app.id)}
                      className="text-rose-500 hover:text-rose-400 hover:underline font-semibold"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </section>
        </div>
      )}
    </div>
  );
}
