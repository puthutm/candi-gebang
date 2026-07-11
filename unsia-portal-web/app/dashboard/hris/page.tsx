'use client';

import React, { useState, useEffect } from 'react';

interface Employee {
  id: string;
  nip: string;
  name: string;
  type: 'Dosen' | 'Staf';
  department: string;
  title: string;
  status: 'ACTIVE' | 'LEAVE' | 'SUSPENDED';
}

interface LeaveRequest {
  id: string;
  employeeName: string;
  type: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function HrisDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'employee'>('admin');
  const [activeSubTab, setActiveSubTab] = useState<'registry' | 'leaves' | 'form'>('registry');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'Dosen' | 'Staf'>('ALL');

  // Employee specific states
  const [newLeaveType, setNewLeaveType] = useState('Cuti Sakit');
  const [newLeaveReason, setNewLeaveReason] = useState('');
  const [newLeaveStart, setNewLeaveStart] = useState('');
  const [newLeaveEnd, setNewLeaveEnd] = useState('');
  const [personalHistory, setPersonalHistory] = useState<LeaveRequest[]>([
    { id: 'LV-001', employeeName: 'Diana Sari, M.T.', type: 'Cuti Sakit', reason: 'Pemulihan medis pasca operasi gigi', startDate: '2026-05-10', endDate: '2026-05-12', status: 'APPROVED' }
  ]);

  // Form states for adding employees
  const [empName, setEmpName] = useState('');
  const [empNip, setEmpNip] = useState('');
  const [empType, setEmpType] = useState<'Dosen' | 'Staf'>('Dosen');
  const [empDept, setEmpDept] = useState('Informatika');
  const [empTitle, setEmpTitle] = useState('Asisten Ahli');

  // Mock Employees Database
  const [employees, setEmployees] = useState<Employee[]>([
    { id: '1', nip: '19840212003', name: 'Diana Sari, M.T.', type: 'Dosen', department: 'Informatika', title: 'Lektor / Dosen PA', status: 'ACTIVE' },
    { id: '2', nip: '19760814002', name: 'Ahmad Faisal, Ph.D.', type: 'Dosen', department: 'Informatika', title: 'Lektor Kepala / Dekan', status: 'ACTIVE' },
    { id: '3', nip: '19901103009', name: 'Robert Albert, M.T.', type: 'Dosen', department: 'Informatika', title: 'Asisten Ahli', status: 'LEAVE' },
    { id: '4', nip: '19890412015', name: 'Rina Herawati, S.Kom.', type: 'Staf', department: 'Administrasi Akademik', title: 'Kepala Biro BAA', status: 'ACTIVE' },
  ]);

  // Mock Leave Requests
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    { id: 'LV-002', employeeName: 'Robert Albert, M.T.', type: 'Cuti Tahunan', reason: 'Keperluan keluarga penting', startDate: '2026-07-15', endDate: '2026-07-20', status: 'PENDING' },
  ]);

  // Simulated latency for skeleton check
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Load user role from session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.role === 'super_admin' || parsed.role === 'admin' || parsed.role === 'lecturer') {
            setUserRole('admin');
          } else {
            setUserRole('employee');
          }
        } catch (e) {}
      }
    }
  }, []);

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName || !empNip) return;

    const newEmp: Employee = {
      id: String(employees.length + 1),
      nip: empNip,
      name: empName,
      type: empType,
      department: empDept,
      title: empTitle,
      status: 'ACTIVE',
    };

    setEmployees([...employees, newEmp]);
    setEmpName('');
    setEmpNip('');
    alert(`Pegawai baru ${newEmp.name} (NIP: ${newEmp.nip}) berhasil didaftarkan.`);
  };

  const handleCreateLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeaveReason || !newLeaveStart || !newLeaveEnd) return;

    const newReq: LeaveRequest = {
      id: `LV-00${leaveRequests.length + personalHistory.length + 2}`,
      employeeName: 'Diana Sari, M.T.', // Assume logged-in lecturer
      type: newLeaveType,
      reason: newLeaveReason,
      startDate: newLeaveStart,
      endDate: newLeaveEnd,
      status: 'PENDING',
    };

    setLeaveRequests([...leaveRequests, newReq]);
    setPersonalHistory([newReq, ...personalHistory]);
    setNewLeaveReason('');
    setNewLeaveStart('');
    setNewLeaveEnd('');
    alert('Pengajuan cuti berhasil dikirimkan. Menunggu persetujuan admin SDM.');
  };

  const handleUpdateLeaveStatus = (id: string, newStatus: LeaveRequest['status']) => {
    // Update active leaves queue
    const updatedLeaves = leaveRequests.map(req => {
      if (req.id === id) {
        return { ...req, status: newStatus };
      }
      return req;
    });
    setLeaveRequests(updatedLeaves);

    // Update employees status accordingly
    const targetReq = leaveRequests.find(r => r.id === id);
    if (targetReq && newStatus === 'APPROVED') {
      const updatedEmployees = employees.map(emp => {
        if (emp.name === targetReq.employeeName) {
          return { ...emp, status: 'LEAVE' as const };
        }
        return emp;
      });
      setEmployees(updatedEmployees);
    }

    alert(`Pengajuan cuti ${id} berhasil di-${newStatus.toLowerCase()}.`);
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || emp.nip.includes(searchQuery);
    const matchesType = filterType === 'ALL' || emp.type === filterType;
    return matchesSearch && matchesType;
  });

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
      {/* Header Controls */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            HRIS Kepegawaian & SDM
          </h2>
          <p className="text-slate-400 mt-1">
            {userRole === 'admin'
              ? 'Tinjau daftar dosen/staf aktif, kelola berkas kepegawaian, verifikasi pengajuan cuti, dan catat pegawai baru.'
              : 'Periksa portofolio dosen, kelola biodata kepegawaian, dan ajukan permohonan cuti dinas.'}
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
            onClick={() => setUserRole('employee')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              userRole === 'employee' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pegawai View
          </button>
        </div>
      </header>

      {/* ========================================== */}
      {/* ADMIN VIEW LAYOUT                          */}
      {/* ========================================== */}
      {userRole === 'admin' && (
        <div className="space-y-8">
          
          {/* HRIS Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Pegawai</span>
              <p className="text-2xl font-black text-white mt-1">42</p>
            </div>
            <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Dosen Aktif</span>
              <p className="text-2xl font-black text-white mt-1">{employees.filter(e => e.type === 'Dosen' && e.status === 'ACTIVE').length}</p>
            </div>
            <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Sedang Cuti</span>
              <p className="text-2xl font-black text-amber-400 mt-1">{employees.filter(e => e.status === 'LEAVE').length}</p>
            </div>
            <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pengajuan Cuti</span>
              <p className="text-2xl font-black text-indigo-400 mt-1">{leaveRequests.filter(l => l.status === 'PENDING').length}</p>
            </div>
          </div>

          {/* Sub Navigation Console */}
          <div className="flex border-b border-slate-800 gap-4">
            <button
              onClick={() => setActiveSubTab('registry')}
              className={`py-2 px-1 text-xs font-bold border-b-2 transition-all ${
                activeSubTab === 'registry' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Registry Pegawai
            </button>
            <button
              onClick={() => setActiveSubTab('leaves')}
              className={`py-2 px-1 text-xs font-bold border-b-2 transition-all ${
                activeSubTab === 'leaves' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Persetujuan Cuti
            </button>
            <button
              onClick={() => setActiveSubTab('form')}
              className={`py-2 px-1 text-xs font-bold border-b-2 transition-all ${
                activeSubTab === 'form' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Daftarkan Pegawai
            </button>
          </div>

          {/* Tab Content: Registry list */}
          {activeSubTab === 'registry' && (
            <div className="space-y-4">
              
              {/* Search Filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/20 p-4 border border-slate-850 rounded-2xl">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari NIP atau nama pegawai..."
                  className="w-full sm:max-w-xs bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                />

                <div className="flex gap-2">
                  {(['ALL', 'Dosen', 'Staf'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        filterType === type 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-slate-950 border border-slate-850 text-slate-400 hover:text-white'
                      }`}
                    >
                      {type === 'ALL' ? 'Semua Kategori' : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 uppercase font-semibold">
                      <th className="p-4">NIP</th>
                      <th className="p-4">Nama Lengkap</th>
                      <th className="p-4">Jabatan Struktural</th>
                      <th className="p-4">Departemen / Homebase</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-950/20 transition-colors">
                        <td className="p-4 font-mono font-bold text-indigo-400">{emp.nip}</td>
                        <td className="p-4 font-semibold text-slate-200">{emp.name}</td>
                        <td className="p-4 text-slate-400">{emp.title}</td>
                        <td className="p-4 text-slate-450">{emp.department}</td>
                        <td className="p-4 text-slate-400">{emp.type}</td>
                        <td className="p-4 font-bold">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            emp.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {emp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* Tab: Leave approvals */}
          {activeSubTab === 'leaves' && (
            <div className="space-y-4">
              <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 uppercase font-semibold">
                      <th className="p-4">ID Cuti</th>
                      <th className="p-4">Nama Pegawai</th>
                      <th className="p-4">Jenis Cuti</th>
                      <th className="p-4">Alasan Cuti</th>
                      <th className="p-4">Durasi Cuti</th>
                      <th className="p-4 text-right">Persetujuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {leaveRequests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-950/20 transition-colors">
                        <td className="p-4 font-mono font-bold text-indigo-400">{req.id}</td>
                        <td className="p-4 font-semibold text-slate-200">{req.employeeName}</td>
                        <td className="p-4 text-slate-400">{req.type}</td>
                        <td className="p-4 text-slate-400">{req.reason}</td>
                        <td className="p-4 text-slate-450">{req.startDate} s/d {req.endDate}</td>
                        <td className="p-4 text-right">
                          {req.status === 'PENDING' ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleUpdateLeaveStatus(req.id, 'APPROVED')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[10px]"
                              >
                                Setujui
                              </button>
                              <button
                                onClick={() => handleUpdateLeaveStatus(req.id, 'REJECTED')}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-[10px]"
                              >
                                Tolak
                              </button>
                            </div>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>{req.status}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Form Tab */}
          {activeSubTab === 'form' && (
            <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-6 max-w-lg">
              <h3 className="font-bold text-lg text-white mb-4">Daftarkan Pegawai / Dosen Baru</h3>
              <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-slate-300 font-semibold">Tipe Pegawai</label>
                    <select
                      value={empType}
                      onChange={(e) => setEmpType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-slate-350 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Dosen">Dosen Akademik</option>
                      <option value="Staf">Staf Pendukung (Administrasi)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-slate-300 font-semibold">Departemen / Homebase</label>
                    <input
                      type="text"
                      required
                      value={empDept}
                      onChange={(e) => setEmpDept(e.target.value)}
                      placeholder="Informatika"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-slate-300 font-semibold">NIP Pegawai</label>
                    <input
                      type="text"
                      required
                      value={empNip}
                      onChange={(e) => setEmpNip(e.target.value)}
                      placeholder="19920412001"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-slate-300 font-semibold">Jabatan / Jenjang</label>
                    <input
                      type="text"
                      required
                      value={empTitle}
                      onChange={(e) => setEmpTitle(e.target.value)}
                      placeholder="Asisten Ahli"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-slate-300 font-semibold">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    required
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    placeholder="Rosalia, M.MSI"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md"
                >
                  Daftarkan Pegawai Resmi
                </button>
              </form>
            </div>
          )}

        </div>
      )}

      {/* ========================================== */}
      {/* EMPLOYEE / LECTURER VIEW                   */}
      {/* ========================================== */}
      {userRole === 'employee' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Lecturer profile card */}
            <div className="lg:col-span-1 bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-6">
              <h3 className="font-bold text-lg text-white">Profil Kepegawaian</h3>
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Nama Pegawai</span>
                    <p className="text-slate-200 font-semibold">Diana Sari, M.T.</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">NIP / NIDN</span>
                    <p className="text-slate-200 font-mono font-semibold">19840212003 / 0312028401</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Jabatan / Fungsional</span>
                    <p className="text-slate-200 font-semibold">Lektor / Dosen PA Informatika</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Homebase Program Studi</span>
                    <p className="text-slate-200 font-semibold">PJJ Informatika (Fakultas Teknologi Informasi)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Leave application & history */}
            <div className="lg:col-span-2 bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="font-bold text-lg text-white">Ajukan Cuti Dinas</h3>
                <p className="text-xs text-slate-400 mt-1">Isi formulir berikut untuk mengirimkan pengajuan izin/cuti tahunan ke Biro Kepegawaian.</p>
              </div>

              <form onSubmit={handleCreateLeaveRequest} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-slate-300 font-semibold">Jenis Cuti</label>
                    <select
                      value={newLeaveType}
                      onChange={(e) => setNewLeaveType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-slate-350 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Cuti Sakit">Cuti Sakit (Medical Leave)</option>
                      <option value="Cuti Tahunan">Cuti Tahunan</option>
                      <option value="Cuti Melahirkan">Cuti Melahirkan</option>
                      <option value="Izin Dinas Luar">Izin Dinas Luar Kampus</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-slate-300 font-semibold">Tanggal Mulai</label>
                      <input
                        type="date"
                        required
                        value={newLeaveStart}
                        onChange={(e) => setNewLeaveStart(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-slate-300 font-semibold">Tanggal Selesai</label>
                      <input
                        type="date"
                        required
                        value={newLeaveEnd}
                        onChange={(e) => setNewLeaveEnd(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-slate-300 font-semibold">Alasan Permohonan Izin</label>
                  <input
                    type="text"
                    required
                    value={newLeaveReason}
                    onChange={(e) => setNewLeaveReason(e.target.value)}
                    placeholder="Contoh: Menghadiri Seminar Konferensi IEEE di Yogyakarta"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                  Ajukan Cuti Dinas
                </button>
              </form>

              {/* History */}
              <div className="pt-6 border-t border-slate-850 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Histori Pengajuan Cuti Anda</h4>
                <div className="space-y-2">
                  {personalHistory.map(req => (
                    <div key={req.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white">{req.type}</span>
                        <p className="text-slate-500 mt-0.5">{req.reason} ({req.startDate} s/d {req.endDate})</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500 animate-pulse'
                      }`}>{req.status}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
