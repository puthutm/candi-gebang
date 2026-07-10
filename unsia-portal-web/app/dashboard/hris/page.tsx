'use client';

import React, { useState } from 'react';

export default function HrisDashboard() {
  const [lecturers, setLecturers] = useState([
    { id: 1, name: 'Dr. John Doe', nip: '19840212003', status: 'ACTIVE', department: 'Informatika' },
    { id: 2, name: 'Prof. Jane Smith', nip: '19760814002', status: 'ACTIVE', department: 'Sistem Informasi' },
    { id: 3, name: 'Robert Albert, M.T.', nip: '19901103009', status: 'LEAVE', department: 'Informatika' },
  ]);

  const toggleLecturerStatus = (id: number) => {
    setLecturers(lecturers.map((lec: any) =>
      lec.id === id ? { ...lec, status: lec.status === 'ACTIVE' ? 'LEAVE' : 'ACTIVE' } : lec
    ));
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          HRIS Kepegawaian & Dosen
        </h2>
        <p className="text-slate-400 mt-1">Manage active lecturers list, update teaching status, and synchronize with the SIAKAD schedule.</p>
      </div>

      <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="p-4">NIP</th>
              <th className="p-4">Nama Lengkap</th>
              <th className="p-4">Homebase Program Studi</th>
              <th className="p-4">Status Mengajar</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {lecturers.map((lec: any) => (
              <tr key={lec.id} className="hover:bg-slate-900/10 transition-colors">
                <td className="p-4 text-slate-400">{lec.nip}</td>
                <td className="p-4 font-semibold">{lec.name}</td>
                <td className="p-4 text-slate-400">{lec.department}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                    lec.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {lec.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => toggleLecturerStatus(lec.id)}
                    className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-xs font-semibold rounded text-slate-300 transition border border-slate-800"
                  >
                    Ubah Status Dinas
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
