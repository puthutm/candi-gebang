'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState('Overview');

  const menuItems = [
    { name: 'Overview', href: '/dashboard' },
    { name: 'Data Calon Mahasiswa (PMB)', href: '/dashboard/pmb' },
    { name: 'Keuangan & Pembayaran', href: '/dashboard/finance' },
    { name: 'Akademik & KRS', href: '/dashboard/academic' },
    { name: 'E-Learning (LMS)', href: '/dashboard/lms' },
    { name: 'Kepegawaian (HRIS)', href: '/dashboard/hris' },
    { name: 'Marketing & Leads (CRM)', href: '/dashboard/crm' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
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
              AD
            </div>
            <div>
              <p className="text-sm font-semibold">Administrator</p>
              <Link href="/" className="text-xs text-rose-400 hover:underline">
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
  );
}
