'use client';

import React, { useState } from 'react';

export default function CrmDashboard() {
  const [leads, setLeads] = useState([
    { id: 1, name: 'Budi Santoso', email: 'budi@gmail.com', source: 'Facebook Ads', status: 'PROSPECT' },
    { id: 2, name: 'Siti Aminah', email: 'siti@gmail.com', source: 'Referral Agent', status: 'CONVERTED' },
    { id: 3, name: 'John Doe', email: 'john@gmail.com', source: 'Instagram Ads', status: 'PROSPECT' },
  ]);

  const convertLead = (id: number) => {
    setLeads(leads.map((lead: any) =>
      lead.id === id ? { ...lead, status: 'CONVERTED' } : lead
    ));
    alert(`Lead ${id} successfully converted! Sending profile details to PMB admission registry.`);
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          CRM & Marketing Console
        </h2>
        <p className="text-slate-400 mt-1">Capture candidate leads from marketing campaigns, refer agents, and trigger PMB registration conversion.</p>
      </div>

      <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="p-4">Nama Prospek</th>
              <th className="p-4">Email</th>
              <th className="p-4">Sumber Kampanye</th>
              <th className="p-4">Funnel Status</th>
              <th className="p-4 text-right">Aksi Konversi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {leads.map((lead: any) => (
              <tr key={lead.id} className="hover:bg-slate-900/10 transition-colors">
                <td className="p-4 font-semibold">{lead.name}</td>
                <td className="p-4 text-slate-400">{lead.email}</td>
                <td className="p-4 text-xs text-slate-500">{lead.source}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                    lead.status === 'CONVERTED'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-indigo-500/10 text-indigo-400'
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {lead.status === 'PROSPECT' ? (
                    <button
                      onClick={() => convertLead(lead.id)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded text-white transition shadow-lg shadow-indigo-500/20"
                    >
                      Konversi ke PMB
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-semibold italic">Converted to PMB</span>
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
