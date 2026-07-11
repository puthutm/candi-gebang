'use client';

import React, { useState, useEffect } from 'react';

interface Invoice {
  id: string;
  invoiceNo: string;
  billTo: string;
  type: 'APPLICANT' | 'STUDENT';
  category: 'Admission Fee' | 'Semester SPP' | 'Graduation Fee' | 'KRS Fine';
  amount: number;
  dueDate: string;
  status: 'PAID' | 'UNPAID' | 'EXPIRED';
  paidAt?: string;
}

export default function FinanceDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'student'>('admin');
  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'generator' | 'gateway'>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  
  // Student checkout states
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<'BNI' | 'MANDIRI' | 'CREDIT_CARD'>('BNI');
  const [payingState, setPayingState] = useState(false);

  // Form states for generating custom invoices
  const [billToName, setBillToName] = useState('');
  const [billType, setBillType] = useState<'APPLICANT' | 'STUDENT'>('STUDENT');
  const [billCategory, setBillCategory] = useState<'Admission Fee' | 'Semester SPP' | 'Graduation Fee' | 'KRS Fine'>('Semester SPP');
  const [billAmount, setBillAmount] = useState('');
  const [billDays, setBillDays] = useState('7');

  // Mock Invoices database
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: '1', invoiceNo: 'INV-2026-001', billTo: 'Rian Hidayat', type: 'APPLICANT', category: 'Admission Fee', amount: 250000, dueDate: '2026-07-20', status: 'PAID', paidAt: '2026-07-11 10:14:32' },
    { id: '2', invoiceNo: 'INV-2026-002', billTo: 'Sherly Angelina', type: 'APPLICANT', category: 'Admission Fee', amount: 250000, dueDate: '2026-07-25', status: 'PAID', paidAt: '2026-07-11 11:24:08' },
    { id: '3', invoiceNo: 'INV-2026-003', billTo: 'Dimas Prabowo', type: 'APPLICANT', category: 'Admission Fee', amount: 250000, dueDate: '2026-07-10', status: 'UNPAID' },
    { id: '4', invoiceNo: 'INV-2026-004', billTo: 'Amalia Putri', type: 'STUDENT', category: 'Semester SPP', amount: 3500000, dueDate: '2026-08-05', status: 'UNPAID' },
  ]);

  // Fetch invoices from finance backend API
  const fetchInvoices = async () => {
    try {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const response = await fetch(`http://${hostname}:3005/api/v1/invoices`);
      const result = await response.json();
      if (response.ok && result.data && result.data.length > 0) {
        const mapped: Invoice[] = result.data.map((item: any) => ({
          id: item.id,
          invoiceNo: item.invoiceNo,
          billTo: item.billToRefId || 'Mahasiswa Terdaftar',
          type: item.billToType || 'STUDENT',
          category: item.description || 'Semester SPP',
          amount: parseFloat(item.amount),
          dueDate: item.dueDate ? item.dueDate.substring(0, 10) : '2026-07-20',
          status: item.status || 'UNPAID',
          paidAt: item.payments?.[0]?.paidAt || undefined,
        }));
        setInvoices(mapped);
        console.log('Finance active: loaded data from finance_db.');
      }
    } catch (err) {
      console.warn('Finance operating in degraded fallback mode (service offline).');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Load user role from session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.role === 'super_admin' || parsed.role === 'admin') {
            setUserRole('admin');
          } else {
            setUserRole('student');
          }
        } catch (e) {}
      }
    }
  }, []);

  // Autofill student view invoice
  useEffect(() => {
    if (userRole === 'student' && invoices.length > 0) {
      const unpaid = invoices.find(inv => inv.status === 'UNPAID');
      if (unpaid) setSelectedInvoice(unpaid);
    }
  }, [userRole, invoices]);

  const handleSimulatePayment = (invoiceNo: string) => {
    const updated = invoices.map(inv => {
      if (inv.invoiceNo === invoiceNo) {
        return {
          ...inv,
          status: 'PAID' as const,
          paidAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
      }
      return inv;
    });
    setInvoices(updated);
    if (selectedInvoice && selectedInvoice.invoiceNo === invoiceNo) {
      setSelectedInvoice({
        ...selectedInvoice,
        status: 'PAID',
        paidAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      });
    }
    alert(`Sukses! Callback IPN Payment Gateway berhasil diterima. Invoice ${invoiceNo} di-update menjadi PAID.`);
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billToName || !billAmount) return;

    const payload = {
      billToType: billType,
      billToRefId: billToName,
      amount: parseFloat(billAmount),
      description: billCategory,
      items: [
        {
          itemCode: "SPP_DETAIL",
          itemName: billCategory,
          amount: parseFloat(billAmount),
        }
      ]
    };

    try {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const response = await fetch(`http://${hostname}:3005/api/v1/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Sukses! Tagihan/invoice berhasil disimpan ke database Keuangan.');
        setBillToName('');
        setBillAmount('');
        fetchInvoices();
        return;
      }
    } catch (err) {
      console.error('Failed to post invoice. Fallback to local state.');
    }

    const due = new Date();
    due.setDate(due.getDate() + parseInt(billDays));

    const newInvoice: Invoice = {
      id: String(invoices.length + 1),
      invoiceNo: `INV-2026-0${invoices.length + 1}`,
      billTo: billToName,
      type: billType,
      category: billCategory,
      amount: parseFloat(billAmount),
      dueDate: due.toISOString().substring(0, 10),
      status: 'UNPAID',
    };

    setInvoices([...invoices, newInvoice]);
    setBillToName('');
    setBillAmount('');
    alert(`Invoice ${newInvoice.invoiceNo} berhasil diterbitkan (degraded mode offline state).`);
  };

  const handleStudentCheckout = () => {
    if (!selectedInvoice) return;
    setPayingState(true);
    setTimeout(() => {
      handleSimulatePayment(selectedInvoice.invoiceNo);
      setPayingState(false);
    }, 1500);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.billTo.toLowerCase().includes(searchQuery.toLowerCase()) || inv.invoiceNo.includes(searchQuery);
    const matchesStatus = filterStatus === 'ALL' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
  const totalUnpaid = invoices.filter(i => i.status === 'UNPAID').reduce((sum, i) => sum + i.amount, 0);

  if (isLoading) {
    return (
      <div className="space-y-8 font-sans text-slate-200">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-2 w-full max-w-md">
            <div className="h-8 bg-slate-900 rounded-xl sk-shimmer w-3/4"></div>
            <div className="h-4 bg-slate-900 rounded-lg sk-shimmer w-full"></div>
          </div>
          <div className="h-10 bg-slate-900 rounded-xl sk-shimmer w-32"></div>
        </header>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-3">
              <div className="h-3 bg-slate-900 rounded sk-shimmer w-1/2"></div>
              <div className="h-8 bg-slate-900 rounded sk-shimmer w-1/3"></div>
            </div>
          ))}
        </div>
        <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="h-10 bg-slate-900 rounded-xl sk-shimmer w-full"></div>
          <div className="h-40 bg-slate-900 rounded-xl sk-shimmer w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-slate-200">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Sistem Keuangan & Billing Clearance
          </h2>
          <p className="text-slate-400 mt-1">
            {userRole === 'admin'
              ? 'Pantau pembayaran masuk, kelola tagihan mahasiswa/pendaftar secara dinamis, dan terbitkan kuitansi.'
              : 'Periksa tagihan semester akademik Anda, lakukan pembayaran tagihan pendaftaran, serta lihat riwayat transaksi.'}
          </p>
        </div>

        {/* Development View Switcher */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1.5 shadow-lg shadow-black/20">
          <button
            onClick={() => setUserRole('admin')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              userRole === 'admin' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Admin View
          </button>
          <button
            onClick={() => setUserRole('student')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              userRole === 'student' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Student View
          </button>
        </div>
      </header>

      {/* ========================================== */}
      {/* ADMIN VIEW LAYOUT                          */}
      {/* ========================================== */}
      {userRole === 'admin' && (
        <div className="space-y-8">
          
          {/* Revenue Statistics metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pendapatan Masuk</span>
              <p className="text-2xl font-black text-white mt-1">IDR {(totalPaid / 1000000).toFixed(2)} M</p>
              <span className="text-[10px] text-emerald-400 font-bold mt-1">Lunas Terverifikasi</span>
            </div>
            <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Piutang Berjalan</span>
              <p className="text-2xl font-black text-white mt-1">IDR {(totalUnpaid / 1000000).toFixed(2)} M</p>
              <span className="text-[10px] text-rose-400 font-bold mt-1">Belum Dibayar</span>
            </div>
            <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Persentase Sukses</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {invoices.length > 0 ? Math.round((invoices.filter(i => i.status === 'PAID').length / invoices.length) * 100) : 0}%
              </p>
              <span className="text-[10px] text-slate-500 font-bold mt-1">Transaksi Berhasil</span>
            </div>
            <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Gateway Latency</span>
              <p className="text-2xl font-black text-indigo-400 mt-1">14ms</p>
              <span className="text-[10px] text-slate-500 font-bold mt-1">Midtrans VA Connection</span>
            </div>
          </div>

          {/* Sub Navigation Console */}
          <div className="flex border-b border-slate-800 gap-4">
            <button
              onClick={() => setActiveSubTab('invoices')}
              className={`py-2 px-1 text-xs font-bold border-b-2 transition-all ${
                activeSubTab === 'invoices' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Daftar Invoice
            </button>
            <button
              onClick={() => setActiveSubTab('generator')}
              className={`py-2 px-1 text-xs font-bold border-b-2 transition-all ${
                activeSubTab === 'generator' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Terbitkan Tagihan Baru
            </button>
          </div>

          {/* Invoices List Panel */}
          {activeSubTab === 'invoices' && (
            <div className="space-y-4">
              
              {/* Search filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/20 p-4 border border-slate-850 rounded-2xl">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari No. Invoice atau nama pembayar..."
                  className="w-full sm:max-w-xs bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                />

                <div className="flex gap-2">
                  {(['ALL', 'PAID', 'UNPAID'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        filterStatus === status 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-slate-950 border border-slate-850 text-slate-400 hover:text-white'
                      }`}
                    >
                      {status === 'ALL' ? 'Semua' : status === 'PAID' ? 'Lunas' : 'Belum Bayar'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 uppercase font-semibold">
                      <th className="p-4">No. Invoice</th>
                      <th className="p-4">Ditagihkan Kepada</th>
                      <th className="p-4">Kategori Tagihan</th>
                      <th className="p-4">Batas Pembayaran</th>
                      <th className="p-4">Jumlah</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Simulasi Lunas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-950/20 transition-colors">
                        <td className="p-4 font-bold text-indigo-400">{inv.invoiceNo}</td>
                        <td className="p-4 font-semibold text-slate-200">
                          {inv.billTo}
                          <span className="text-[10px] text-slate-500 ml-2">({inv.type})</span>
                        </td>
                        <td className="p-4 text-slate-400">{inv.category}</td>
                        <td className="p-4 text-slate-400">{inv.dueDate}</td>
                        <td className="p-4 font-mono font-bold text-slate-200">
                          IDR {inv.amount.toLocaleString()}
                        </td>
                        <td className="p-4 font-bold">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {inv.status === 'UNPAID' ? (
                            <button
                              onClick={() => handleSimulatePayment(inv.invoiceNo)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold rounded-lg text-white transition-all shadow-md active:scale-95"
                            >
                              Bayar VA (Simulasi)
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic font-mono">Paid at: {inv.paidAt}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* Generator Tab */}
          {activeSubTab === 'generator' && (
            <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-6 max-w-lg">
              <h3 className="font-bold text-lg text-white mb-4">Terbitkan Tagihan Manual</h3>
              <form onSubmit={handleGenerateInvoice} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-slate-300 font-semibold">Tipe Subjek</label>
                    <select
                      value={billType}
                      onChange={(e) => setBillType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-slate-350 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="STUDENT">Mahasiswa Aktif</option>
                      <option value="APPLICANT">Calon Mahasiswa Baru (PMB)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-slate-300 font-semibold">Kategori Tagihan</label>
                    <select
                      value={billCategory}
                      onChange={(e) => setBillCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-slate-350 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Semester SPP">SPP Semesteran</option>
                      <option value="Admission Fee">Biaya Pendaftaran PMB</option>
                      <option value="Graduation Fee">Biaya Wisuda</option>
                      <option value="KRS Fine">Denda Keterlambatan KRS</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-slate-300 font-semibold">Nama Mahasiswa / Calon Pembayar</label>
                  <input
                    type="text"
                    required
                    value={billToName}
                    onChange={(e) => setBillToName(e.target.value)}
                    placeholder="Budi Setiadi"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-slate-300 font-semibold">Jumlah Tagihan (IDR)</label>
                    <input
                      type="number"
                      required
                      value={billAmount}
                      onChange={(e) => setBillAmount(e.target.value)}
                      placeholder="3500000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-slate-300 font-semibold">Masa Berlaku Tagihan (Hari)</label>
                    <select
                      value={billDays}
                      onChange={(e) => setBillDays(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-slate-350 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="3">3 Hari</option>
                      <option value="7">7 Hari</option>
                      <option value="14">14 Hari</option>
                      <option value="30">30 Hari</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md"
                >
                  Terbitkan Tagihan Resmi
                </button>
              </form>
            </div>
          )}

        </div>
      )}

      {/* ========================================== */}
      {/* STUDENT VIEW LAYOUT                        */}
      {/* ========================================== */}
      {userRole === 'student' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Invoice card selector */}
            <div className="lg:col-span-1 bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-6">
              <h3 className="font-bold text-lg text-white">Daftar Tagihan Anda</h3>
              <div className="space-y-3">
                {invoices.map(inv => (
                  <div
                    key={inv.invoiceNo}
                    onClick={() => setSelectedInvoice(inv)}
                    className="p-4 border rounded-xl cursor-pointer transition-all"
                    style={{
                      backgroundColor: selectedInvoice?.invoiceNo === inv.invoiceNo ? 'rgba(79, 70, 229, 0.1)' : 'rgba(2, 6, 23, 0.4)',
                      borderColor: selectedInvoice?.invoiceNo === inv.invoiceNo ? '#4f46e5' : '#1e293b'
                    }}
                  >
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-500 font-mono">{inv.invoiceNo}</span>
                      <span className={`px-2 py-0.5 rounded ${
                        inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>{inv.status}</span>
                    </div>
                    <h4 className="font-bold text-sm text-white mt-2">{inv.category}</h4>
                    <p className="text-xs font-mono font-bold text-slate-350 mt-1">IDR {inv.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 mt-2">Batas Akhir: {inv.dueDate}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Details / Gateway Simulator */}
            <div className="lg:col-span-2 bg-slate-900/20 border border-slate-800 rounded-2xl p-6">
              {selectedInvoice ? (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-slate-800">
                    <span className="text-xs font-mono text-indigo-400 font-bold">{selectedInvoice.invoiceNo}</span>
                    <h3 className="text-xl font-bold text-white mt-1">{selectedInvoice.category}</h3>
                    <p className="text-xs text-slate-400 mt-1">Lakukan transfer persis sesuai jumlah tagihan di bawah.</p>
                  </div>

                  <div className="p-5 bg-slate-950/60 border border-slate-850 rounded-2xl flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Pembayaran</span>
                      <p className="text-2xl font-black text-white font-mono mt-1">IDR {selectedInvoice.amount.toLocaleString()}</p>
                    </div>
                    {selectedInvoice.status === 'PAID' && (
                      <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl font-mono">
                        LUNAS ✓
                      </div>
                    )}
                  </div>

                  {selectedInvoice.status === 'UNPAID' ? (
                    <div className="space-y-6">
                      
                      {/* Payment Methods */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-300">Pilih Metode Pembayaran Virtual Account</span>
                        <div className="grid grid-cols-3 gap-3">
                          {(['BNI', 'MANDIRI', 'CREDIT_CARD'] as const).map(gw => (
                            <button
                              key={gw}
                              onClick={() => setSelectedGateway(gw)}
                              className="p-3 border rounded-xl text-center text-xs font-bold transition-all"
                              style={{
                                backgroundColor: selectedGateway === gw ? 'rgba(79, 70, 229, 0.1)' : 'rgba(2, 6, 23, 0.4)',
                                borderColor: selectedGateway === gw ? '#4f46e5' : '#1e293b',
                                color: selectedGateway === gw ? '#ffffff' : '#94a3b8'
                              }}
                            >
                              {gw === 'BNI' ? 'BNI VA' : gw === 'MANDIRI' ? 'Mandiri Bill' : 'Credit Card'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* VA Details */}
                      <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                          {selectedGateway === 'BNI' ? 'Nomor Virtual Account BNI' : selectedGateway === 'MANDIRI' ? 'Kode Bayar Mandiri (E-Commerce)' : 'Link Checkout Kartu Kredit'}
                        </span>
                        <div className="flex justify-between items-center font-mono font-bold text-sm text-slate-200">
                          <span>{selectedGateway === 'BNI' ? '988001220260001' : selectedGateway === 'MANDIRI' ? '70012 988001220' : 'https://checkout.midtrans.com/pay/...'}</span>
                          <button className="text-xs text-indigo-400 hover:underline">Salin</button>
                        </div>
                      </div>

                      {/* Payment Actions */}
                      <button
                        onClick={handleStudentCheckout}
                        disabled={payingState}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-md"
                      >
                        {payingState ? 'Menghubungkan ke Gateway...' : 'Bayar Tagihan Sekarang (Simulasi)'}
                      </button>

                    </div>
                  ) : (
                    <div className="space-y-4 text-xs">
                      <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl text-slate-400">
                        Pembayaran tagihan ini telah dikonfirmasi oleh sistem bank pada <span className="text-white font-mono">{selectedInvoice.paidAt}</span>. Status clearance KRS Anda di module Akademik telah diperbarui menjadi **CLEARED**.
                      </div>
                    </div>
                  )}

                  {/* Transaction Guidelines */}
                  <div className="pt-4 border-t border-slate-850 text-xs text-slate-500 space-y-2">
                    <p className="font-bold text-slate-400">Panduan Pembayaran Virtual Account:</p>
                    <p>1. Masuk ke aplikasi Mobile Banking atau ATM terdekat.</p>
                    <p>2. Pilih menu Transfer / Pembayaran ➡️ Virtual Account.</p>
                    <p>3. Masukkan kode bayar Virtual Account di atas.</p>
                    <p>4. Jumlah tagihan akan muncul otomatis, konfirmasi nama pendaftar/mahasiswa lalu kirim.</p>
                  </div>

                </div>
              ) : (
                <div className="text-center text-slate-500 text-sm py-12">Semua tagihan Anda telah lunas. Tidak ada pembayaran jatuh tempo.</div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
