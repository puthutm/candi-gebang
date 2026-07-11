'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [user, setUser] = useState<{ fullName: string; role: string } | null>(null);
  const [adminUser, setAdminUser] = useState<{ fullName: string; username: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse user session:', e);
        }
      }
      const storedAdminUser = localStorage.getItem('adminUser');
      if (storedAdminUser) {
        try {
          setAdminUser(JSON.parse(storedAdminUser));
        } catch (e) {
          console.error('Failed to parse admin session:', e);
        }
      }
    }
  }, []);

  const menuItems = [
    { name: 'Overview', href: '/dashboard' },
    { name: 'Data Calon Mahasiswa (PMB)', href: '/dashboard/pmb' },
    { name: 'Keuangan & Pembayaran', href: '/dashboard/finance' },
    { name: 'Akademik & KRS', href: '/dashboard/academic' },
    { name: 'E-Learning (LMS)', href: '/dashboard/lms' },
    { name: 'Kepegawaian (HRIS)', href: '/dashboard/hris' },
    { name: 'Marketing & Leads (CRM)', href: '/dashboard/crm' },
  ];

  const fullName = user?.fullName || 'Administrator';
  const role = user?.role || 'Super Admin';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AD';

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
  };

  const handleRestoreAdmin = () => {
    if (typeof window !== 'undefined') {
      const adminToken = localStorage.getItem('adminToken');
      const storedAdminUser = localStorage.getItem('adminUser');
      if (adminToken && storedAdminUser) {
        localStorage.setItem('token', adminToken);
        localStorage.setItem('user', storedAdminUser);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.reload();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Impersonation Banner */}
      {adminUser && (
        <div className="bg-amber-600 text-slate-950 font-bold px-6 py-2.5 flex items-center justify-between text-xs sm:text-sm shadow-lg tracking-wide border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-950 animate-ping"></span>
            <span>MODES MENYAMAR: ANDA SEDANG MENGAKSES AKUN <strong>{fullName.toUpperCase()}</strong> ({role.toUpperCase()})</span>
          </div>
          <button
            onClick={handleRestoreAdmin}
            className="bg-slate-950 hover:bg-slate-900 text-amber-500 hover:text-amber-400 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
          >
            Kembali ke Admin ({adminUser.fullName})
          </button>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-80 border-r border-slate-800 bg-slate-900/60 backdrop-blur-md p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-500/30">
                U
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">UNSIA Portal</h1>
                <span className="text-xs text-slate-500">Modular ERP Ecosystem</span>
              </div>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setActiveTab(item.name)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === item.name
                      ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500 pl-3'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center font-semibold text-slate-300">
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold">{fullName}</p>
                <p className="text-xs text-slate-500 capitalize">{role}</p>
                <Link
                  href="/"
                  onClick={handleLogout}
                  className="text-xs text-rose-400 hover:underline block mt-1"
                >
                  Keluar
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
