'use client';

import React, { useState } from 'react';

export default function FinanceDashboard() {
  const [loadingPay, setLoadingPay] = useState<string | null>(null);
  const [invoices, setInvoices] = useState([
    { id: '1', invoiceNo: 'INV/2026/1004', billTo: 'Budi Santoso', type: 'APPLICANT', amount: '250,000.00', status: 'UNPAID' },
    { id: '2', invoiceNo: 'INV/2026/8390', billTo: 'John Doe', type: 'APPLICANT', amount: '250,000.00', status: 'PAID' },
    { id: '3', invoiceNo: 'INV/2026/7542', billTo: 'Siti Aminah', type: 'APPLICANT', amount: '250,000.00', status: 'UNPAID' },
  ]);

  const handleSimulatePayment = (invoiceNo: string) => {
    setLoadingPay(invoiceNo);
    setTimeout(() => {
      setInvoices(invoices.map(inv => 
        inv.invoiceNo === invoiceNo ? { ...inv, status: 'PAID' } : inv
      ));
      setLoadingPay(null);
      alert(`Payment Callback Simulated! Invoice ${invoiceNo} status updated to PAID and clearance granted.`);
    }, 1200);
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Billing & Payments Control
        </h2>
        <p className="text-slate-400 mt-1">Manage invoice lifecycle, simulate virtual account callbacks, and grant clearance status.</p>
      </div>

      <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="p-4">No. Invoice</th>
              <th className="p-4">Ditagihkan Kepada</th>
              <th className="p-4">Tipe Subjek</th>
              <th className="p-4">Jumlah Tagihan</th>
              <th className="p-4">Status Invoice</th>
              <th className="p-4 text-right">Aksi Simulasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-900/10 transition-colors">
                <td className="p-4 font-semibold text-indigo-400">{inv.invoiceNo}</td>
                <td className="p-4">{inv.billTo}</td>
                <td className="p-4 text-xs text-slate-500">{inv.type}</td>
                <td className="p-4 font-semibold">IDR {inv.amount}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                    inv.status === 'PAID'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {inv.status === 'UNPAID' ? (
                    <button
                      onClick={() => handleSimulatePayment(inv.invoiceNo)}
                      disabled={loadingPay !== null}
                      className="px-3 py-1.5 bg-indigo-600 text-xs font-semibold rounded text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20"
                    >
                      {loadingPay === inv.invoiceNo ? 'Memproses...' : 'Simulasikan Pembayaran VA'}
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-semibold italic">Lunas</span>
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
