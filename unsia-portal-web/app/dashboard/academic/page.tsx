'use client';

import React, { useState } from 'react';

export default function AcademicDashboard() {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [students, setStudents] = useState([
    { id: '1', nim: '26IF0001', name: 'John Doe', studyProgram: 'Informatika', krsStatus: 'SUBMITTED', lmsSync: 'NOT_SYNCED', financeClearance: 'CLEARED' },
    { id: '2', nim: '26IF0002', name: 'Jane Smith', studyProgram: 'Informatika', krsStatus: 'DRAFT', lmsSync: 'NOT_SYNCED', financeClearance: 'BLOCKED' },
  ]);

  const handleApproveKrs = (id: string) => {
    setLoadingAction(`approve-${id}`);
    setTimeout(() => {
      setStudents(students.map(st => 
        st.id === id ? { ...st, krsStatus: 'APPROVED', lmsSync: 'SYNCED' } : st
      ));
      setLoadingAction(null);
      alert(`KRS approved! Classes successfully synchronized and student enrolled into the LMS courses.`);
    }, 1500);
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Academic & KRS Approval Console
        </h2>
        <p className="text-slate-400 mt-1">Review student KRS submittals, verify clearance state, and sync active classes to LMS.</p>
      </div>

      <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="p-4">NIM</th>
              <th className="p-4">Nama Mahasiswa</th>
              <th className="p-4">Program Studi</th>
              <th className="p-4">Clearance KRS</th>
              <th className="p-4">Status KRS</th>
              <th className="p-4">Sinkronisasi LMS</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {students.map((st) => (
              <tr key={st.id} className="hover:bg-slate-900/10 transition-colors">
                <td className="p-4 font-semibold text-indigo-400">{st.nim}</td>
                <td className="p-4 font-semibold">{st.name}</td>
                <td className="p-4 text-slate-400">{st.studyProgram}</td>
                <td className="p-4 font-semibold text-xs">
                  <span className={st.financeClearance === 'CLEARED' ? 'text-emerald-400' : 'text-rose-400'}>
                    ● {st.financeClearance}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                    st.krsStatus === 'APPROVED'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : st.krsStatus === 'SUBMITTED'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {st.krsStatus}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                    st.lmsSync === 'SYNCED'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {st.lmsSync}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {st.krsStatus === 'SUBMITTED' ? (
                    <button
                      onClick={() => handleApproveKrs(st.id)}
                      disabled={st.financeClearance !== 'CLEARED' || loadingAction !== null}
                      className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
                        st.financeClearance === 'CLEARED'
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                      }`}
                    >
                      {loadingAction === `approve-${st.id}` ? 'Memproses...' : 'Setujui KRS & Sync LMS'}
                    </button>
                  ) : st.krsStatus === 'APPROVED' ? (
                    <span className="text-xs text-emerald-400 font-semibold italic">Approved & Synced</span>
                  ) : (
                    <span className="text-xs text-slate-500 italic">Draft (Belum Submit)</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
