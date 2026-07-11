'use client';

import React, { useState, useEffect } from 'react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: 'Google Ads' | 'Meta Ads' | 'Referral Agent' | 'Organic Search';
  status: 'NEW' | 'CONTACTED' | 'REGISTERED' | 'LOST';
  notes: string;
  agentName?: string;
  commissionPaid?: boolean;
}

export default function CrmDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'kanban' | 'campaigns' | 'commissions'>('kanban');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>([
    { id: 'LD-2026-001', name: 'Zack Wijaya', email: 'zack.w@gmail.com', phone: '081299001122', source: 'Google Ads', status: 'NEW', notes: 'Tertarik jurusan Teknik Informatika. Butuh info diskon SPP.' },
    { id: 'LD-2026-002', name: 'Maya Lestari', email: 'maya.lestari@gmail.com', phone: '082133002211', source: 'Referral Agent', status: 'CONTACTED', notes: 'Ditelepon kemarin. Berencana daftar lewat jalur beasiswa.', agentName: 'Agus Prayogo', commissionPaid: false },
    { id: 'LD-2026-003', name: 'Fajar Nugraha', email: 'fajar.nug@outlook.com', phone: '085711003344', source: 'Meta Ads', status: 'REGISTERED', notes: 'Sudah mendaftar PMB Jalur RPL. Dokumen sedang diverifikasi.', agentName: 'Agus Prayogo', commissionPaid: true },
    { id: 'LD-2026-004', name: 'Diana Ratih', email: 'diana.ratih@yahoo.com', phone: '089988004455', source: 'Organic Search', status: 'LOST', notes: 'Memutuskan kuliah di kampus offline terdekat.' },
  ]);

  // Form states for new lead
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newSource, setNewSource] = useState<'Google Ads' | 'Meta Ads' | 'Referral Agent' | 'Organic Search'>('Google Ads');
  const [newNotes, setNewNotes] = useState('');
  const [newAgent, setNewAgent] = useState('');

  // Fetch leads from real backend API on mount, with fallback
  const fetchLeads = async () => {
    try {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const response = await fetch(`http://${hostname}:3003/api/v1/leads`);
      const result = await response.json();
      if (response.ok && result.data && result.data.length > 0) {
        // Map database schema fields to UI fields
        const mapped: Lead[] = result.data.map((item: any) => ({
          id: item.id,
          name: `${item.firstName} ${item.lastName}`,
          email: item.email,
          phone: item.phone,
          source: item.source || 'Organic Search',
          status: item.status || 'NEW',
          notes: item.notes || 'No description provided.',
          agentName: item.agentId || undefined,
          commissionPaid: false
        }));
        setLeads(mapped);
        console.log('CRM active: loaded real data from core db.');
      }
    } catch (err) {
      console.warn('CRM operating in degraded fallback mode (service offline).');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    // Split name into first and last
    const nameParts = newName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || 'Candidate';

    const payload = {
      firstName,
      lastName,
      email: newEmail || `${firstName.toLowerCase()}@example.com`,
      phone: newPhone,
      source: newSource,
      notes: newNotes,
    };

    try {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const response = await fetch(`http://${hostname}:3003/api/v1/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Sukses! Prospek berhasil disimpan langsung ke database CRM.');
        setNewName('');
        setNewEmail('');
        setNewPhone('');
        setNewNotes('');
        fetchLeads();
        return;
      }
    } catch (err) {
      console.error('Failed to post to backend. Fallback to offline mock state.');
    }

    // Fallback Mock State update
    const newLeadItem: Lead = {
      id: `LD-2026-0${leads.length + 1}`,
      name: newName,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      phone: newPhone,
      source: newSource,
      status: 'NEW',
      notes: newNotes || 'No notes added.',
      agentName: newSource === 'Referral Agent' ? newAgent || 'Agen Umum' : undefined,
      commissionPaid: newSource === 'Referral Agent' ? false : undefined,
    };

    setLeads([...leads, newLeadItem]);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewNotes('');
    setNewAgent('');
    alert('Lead prospek baru berhasil ditambahkan (degraded mode offline state)!');
  };

  const handleUpdateStatus = (id: string, newStatus: Lead['status']) => {
    const updated = leads.map(lead => {
      if (lead.id === id) {
        const leadCopy = { ...lead, status: newStatus };
        if (newStatus === 'REGISTERED') {
          // Trigger integration helper notification
          console.log(`Triggering PMB handover for Lead ${lead.name}`);
        }
        return leadCopy;
      }
      return lead;
    });
    setLeads(updated);
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
  };

  const handleToggleCommission = (id: string) => {
    const updated = leads.map(lead => {
      if (lead.id === id && lead.source === 'Referral Agent') {
        return { ...lead, commissionPaid: !lead.commissionPaid };
      }
      return lead;
    });
    setLeads(updated);
  };

  const columns: { label: string; status: Lead['status']; bg: string; text: string }[] = [
    { label: 'Prospek Baru', status: 'NEW', bg: 'bg-indigo-500/10 border-indigo-500/30', text: 'text-indigo-400' },
    { label: 'Hubungi (Follow-up)', status: 'CONTACTED', bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400' },
    { label: 'Terdaftar PMB', status: 'REGISTERED', bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400' },
    { label: 'Lost / Batal', status: 'LOST', bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-400' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 font-sans text-slate-200">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-2 w-full max-w-md">
            <div className="h-8 bg-slate-900 rounded-xl sk-shimmer w-3/4"></div>
            <div className="h-4 bg-slate-900 rounded-lg sk-shimmer w-full"></div>
          </div>
          <div className="h-10 bg-slate-900 rounded-xl sk-shimmer w-48"></div>
        </header>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-3">
              <div className="h-3 bg-slate-900 rounded sk-shimmer w-1/2"></div>
              <div className="h-8 bg-slate-900 rounded sk-shimmer w-1/3"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-4 bg-slate-900/20 border border-slate-800 rounded-2xl space-y-4 min-h-[300px]">
                <div className="h-4 bg-slate-900 rounded sk-shimmer w-1/2"></div>
                <div className="space-y-3">
                  {[1, 2].map(j => (
                    <div key={j} className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl space-y-2">
                      <div className="h-3 bg-slate-900 rounded sk-shimmer w-1/3"></div>
                      <div className="h-3 bg-slate-900 rounded sk-shimmer w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="xl:col-span-1 bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="h-6 bg-slate-900 rounded-lg sk-shimmer w-1/2"></div>
            <div className="h-40 bg-slate-900 rounded-xl sk-shimmer w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-slate-200">
      {/* Header and navigation */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            CRM & Marketing Dashboard
          </h2>
          <p className="text-slate-400 mt-1">
            Pantau pipeline konversi pendaftar calon mahasiswa dari berbagai kampanye pemasaran.
          </p>
        </div>

        {/* Console view switcher */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1.5 shadow-lg shadow-black/20">
          {(['kanban', 'campaigns', 'commissions'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize"
              style={{
                backgroundColor: activeTab === tab ? '#4f46e5' : 'transparent',
                color: activeTab === tab ? '#ffffff' : '#94a3b8'
              }}
            >
              {tab === 'commissions' ? 'Komisi Agen' : tab === 'kanban' ? 'Kanban Pipeline' : 'Analitik Kampanye'}
            </button>
          ))}
        </div>
      </header>

      {/* ========================================== */}
      {/* TAB: KANBAN PIPELINE                       */}
      {/* ========================================== */}
      {activeTab === 'kanban' && (
        <div className="space-y-8">
          
          {/* Upper Statistics row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Leads Masuk</span>
              <p className="text-3xl font-black text-white mt-1">{leads.length}</p>
            </div>
            <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Sedang Dihubungi</span>
              <p className="text-3xl font-black text-white mt-1">{leads.filter(l => l.status === 'CONTACTED').length}</p>
            </div>
            <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Rasio Konversi PMB</span>
              <p className="text-3xl font-black text-emerald-400 mt-1">
                {leads.length > 0 ? Math.round((leads.filter(l => l.status === 'REGISTERED').length / leads.length) * 100) : 0}%
              </p>
            </div>
            <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Rata-rata Respon</span>
              <p className="text-3xl font-black text-indigo-400 mt-1">12 mnt</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            
            {/* Kanban Columns */}
            <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {columns.map(col => {
                const colLeads = leads.filter(l => l.status === col.status);
                return (
                  <div key={col.status} className={`p-4 rounded-2xl border ${col.bg} flex flex-col space-y-4 min-h-[380px]`}>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800/30">
                      <span className="text-xs font-black text-white uppercase tracking-wider">{col.label}</span>
                      <span className="px-2 py-0.5 bg-white/5 text-slate-400 rounded-md text-[10px] font-mono font-bold">
                        {colLeads.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {colLeads.map(lead => (
                        <div
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl cursor-pointer hover:border-indigo-500/50 hover:bg-slate-950 transition-all shadow-inner group"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-mono text-slate-500 font-semibold">{lead.id}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 uppercase font-bold tracking-wider">{lead.source}</span>
                          </div>
                          <h4 className="font-bold text-xs text-white group-hover:text-indigo-400 transition-colors">{lead.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">{lead.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Add Form / Details Workspace */}
            <div className="xl:col-span-1 bg-slate-900/20 border border-slate-800 rounded-2xl p-6">
              {selectedLead ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 font-bold">{selectedLead.id}</span>
                      <h3 className="font-bold text-lg text-white mt-1">{selectedLead.name}</h3>
                    </div>
                    <button
                      onClick={() => setSelectedLead(null)}
                      className="text-xs text-slate-500 hover:text-white"
                    >
                      Tutup
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Email / Whatsapp</span>
                      <p className="font-semibold text-slate-200">{selectedLead.email} • {selectedLead.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Saluran Marketing</span>
                      <p className="font-semibold text-slate-200">{selectedLead.source}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Detail Notes Prospek</span>
                      <p className="text-slate-300 leading-relaxed">{selectedLead.notes}</p>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-slate-850">
                      <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">Pindahkan Stage</span>
                      <div className="grid grid-cols-2 gap-2">
                        {columns.map(col => (
                          <button
                            key={col.status}
                            disabled={selectedLead.status === col.status}
                            onClick={() => handleUpdateStatus(selectedLead.id, col.status)}
                            className="py-1.5 px-2 rounded-lg border text-[10px] font-bold text-center transition-all"
                            style={{
                              backgroundColor: selectedLead.status === col.status ? '#4f46e5' : '#020617',
                              borderColor: selectedLead.status === col.status ? '#4f46e5' : '#1e293b',
                              color: selectedLead.status === col.status ? '#ffffff' : '#94a3b8'
                            }}
                          >
                            {col.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg text-white">Tambah Leads Baru</h3>
                    <p className="text-xs text-slate-400 mt-1">Daftarkan leads prospektif yang diperoleh lewat offline/walk-in.</p>
                  </div>

                  <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
                    <div className="space-y-2">
                      <label className="text-slate-300 font-semibold">Nama Prospek</label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Zainal Arifin"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-slate-300 font-semibold">WhatsApp</label>
                        <input
                          type="text"
                          required
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="0812..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-slate-300 font-semibold">Email (Opsional)</label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="zainal@mail.com"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-slate-300 font-semibold">Saluran Masuk</label>
                      <select
                        value={newSource}
                        onChange={(e) => setNewSource(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-slate-300 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Google Ads">Google Ads</option>
                        <option value="Meta Ads">Meta Ads</option>
                        <option value="Referral Agent">Referral Agent</option>
                        <option value="Organic Search">Organic Search</option>
                      </select>
                    </div>

                    {newSource === 'Referral Agent' && (
                      <div className="space-y-2">
                        <label className="text-slate-300 font-semibold">Nama Agen Referral</label>
                        <input
                          type="text"
                          required
                          value={newAgent}
                          onChange={(e) => setNewAgent(e.target.value)}
                          placeholder="Agus Prayogo"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-slate-300 font-semibold">Catatan Minat Jurusan</label>
                      <textarea
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                        placeholder="Tertarik sistem informasi kelas karyawan..."
                        className="w-full h-16 bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md"
                    >
                      Daftarkan Leads
                    </button>
                  </form>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB: CAMPAIGNS ANALYTICS                   */}
      {/* ========================================== */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-2xl space-y-4">
              <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-md font-mono">GOOGLE ADS</span>
              <h3 className="text-2xl font-bold text-white">Google Search 2026</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Penargetan kata kunci: &quot;kuliah online siber&quot;, &quot;SIAKAD Universitas Siber Asia&quot;.</p>
              <div className="flex justify-between items-center text-xs pt-4 border-t border-slate-850">
                <span className="text-slate-500">Leads Terkumpul</span>
                <span className="font-bold text-white">{leads.filter(l => l.source === 'Google Ads').length} leads</span>
              </div>
            </div>

            <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-2xl space-y-4">
              <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-md font-mono">META ADS</span>
              <h3 className="text-2xl font-bold text-white">Meta Funnel Kelas Karyawan</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Retargeting video testimoni alumni SIAKAD kelas karyawan di Instagram & Facebook.</p>
              <div className="flex justify-between items-center text-xs pt-4 border-t border-slate-850">
                <span className="text-slate-500">Leads Terkumpul</span>
                <span className="font-bold text-white">{leads.filter(l => l.source === 'Meta Ads').length} leads</span>
              </div>
            </div>

            <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-2xl space-y-4">
              <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-md font-mono">REFERRAL PROGRAM</span>
              <h3 className="text-2xl font-bold text-white">SIAKAD Referral Hub</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Komisi insentif agen eksternal & mahasiswa aktif yang merujuk pendaftar baru.</p>
              <div className="flex justify-between items-center text-xs pt-4 border-t border-slate-850">
                <span className="text-slate-500">Leads Terkumpul</span>
                <span className="font-bold text-white">{leads.filter(l => l.source === 'Referral Agent').length} leads</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB: REFERRAL COMMISSIONS                  */}
      {/* ========================================== */}
      {activeTab === 'commissions' && (
        <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-lg text-white">Pencatatan Komisi Agen Referral</h3>
              <p className="text-xs text-slate-400 mt-1">Daftar pencairan komisi flat Rp 500,000 per lead yang dikonversi lunas (status REGISTERED).</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-4">Nama Agen</th>
                  <th className="py-3 px-4">Nama Calon Mahasiswa</th>
                  <th className="py-3 px-4">Status Transaksi</th>
                  <th className="py-3 px-4">Komisi Pembayaran</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {leads.filter(l => l.source === 'Referral Agent').map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-950/20 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-200">{lead.agentName || '-'}</td>
                    <td className="py-3 px-4 text-slate-400">{lead.name} ({lead.id})</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        lead.status === 'REGISTERED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {lead.status === 'REGISTERED' ? 'LUNAS (REGISTERED)' : 'PROSES SELEKSI'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">
                      IDR 500,000
                    </td>
                    <td className="py-3 px-4 text-right">
                      {lead.status === 'REGISTERED' ? (
                        <button
                          onClick={() => handleToggleCommission(lead.id)}
                          className="px-3 py-1.5 rounded-lg font-bold text-[10px] transition"
                          style={{
                            backgroundColor: lead.commissionPaid ? '#0f172a' : '#059669',
                            borderColor: '#1e293b',
                            color: lead.commissionPaid ? '#94a3b8' : '#ffffff'
                          }}
                        >
                          {lead.commissionPaid ? 'Sudah Ditransfer ✓' : 'Konfirmasi Transfer'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">Menunggu pendaftaran lunas</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
