'use client';

import React, { useState } from 'react';

export default function PmbDashboard() {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [applicants, setApplicants] = useState([
    { id: '1', name: 'Budi Santoso', email: 'budi@gmail.com', status: 'REGISTERED', payment: 'UNPAID', docCheck: 'PENDING' },
    { id: '2', name: 'John Doe', email: 'john.doe@gmail.com', status: 'DOCUMENTS_UPLOADED', payment: 'PAID', docCheck: 'VERIFIED' },
    { id: '3', name: 'Siti Aminah', email: 'siti.aminah@gmail.com', status: 'BIODATA_COMPLETED', payment: 'UNPAID', docCheck: 'PENDING' },
  ]);

  const handleVerifyDocs = (id: string) => {
    setLoadingAction(`verify-${id}`);
    setTimeout(() => {
      setApplicants(applicants.map(app => 
        app.id === id ? { ...app, docCheck: 'VERIFIED', status: 'DOCUMENTS_UPLOADED' } : app
      ));
      setLoadingAction(null);
    }, 1000);
  };

  const handleHandover = (id: string) => {
    setLoadingAction(`handover-${id}`);
    setTimeout(() => {
      setApplicants(applicants.map(app => 
        app.id === id ? { ...app, status: 'HANDOVER_COMPLETED' } : app
      ));
      setLoadingAction(null);
      alert(`Applicant ${id} successfully onboarded as a new Student with a generated NIM!`);
    }, 1500);
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          PMB Admission Console
        </h2>
        <p className="text-slate-400 mt-1">Verify documents, check payment clearances, and trigger academic onboarding handover.</p>
      </div>

      <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="p-4">Nama Lengkap</th>
              <th className="p-4">Email</th>
              <th className="p-4">Status PMB</th>
              <th className="p-4">Clearance Pembayaran</th>
              <th className="p-4">Berkas Dokumen</th>
              <th className="p-4 text-right">Aksi Integrasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {applicants.map((app) => (
              <tr key={app.id} className="hover:bg-slate-900/10 transition-colors">
                <td className="p-4 font-semibold">{app.name}</td>
                <td className="p-4 text-slate-400">{app.email}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                    app.status === 'HANDOVER_COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : app.status === 'DOCUMENTS_UPLOADED'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="p-4 font-semibold text-xs">
                  <span className={app.payment === 'PAID' ? 'text-emerald-400' : 'text-rose-400'}>
                    ● {app.payment}
                  </span>
                </td>
                <td className="p-4 text-slate-400">{app.docCheck}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    {app.docCheck !== 'VERIFIED' && (
                      <button
                        onClick={() => handleVerifyDocs(app.id)}
                        disabled={loadingAction !== null}
                        className="px-3 py-1.5 bg-slate-800 text-xs font-semibold rounded hover:bg-slate-700 transition"
                      >
                        {loadingAction === `verify-${app.id}` ? 'Memproses...' : 'Verifikasi Berkas'}
                      </button>
                    )}
                    {app.status !== 'HANDOVER_COMPLETED' && (
                      <button
                        onClick={() => handleHandover(app.id)}
                        disabled={app.payment !== 'PAID' || app.docCheck !== 'VERIFIED' || loadingAction !== null}
                        className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
                          app.payment === 'PAID' && app.docCheck === 'VERIFIED'
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                        }`}
                      >
                        {loadingAction === `handover-${app.id}` ? 'Handover...' : 'Handover ke Academic'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
