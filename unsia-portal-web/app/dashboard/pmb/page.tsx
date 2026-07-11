'use client';

import React, { useState, useEffect } from 'react';

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  path: string;
  status: 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'ACCEPTED' | 'LOA_ISSUED' | 'HANDED_OVER';
  payment: 'UNPAID' | 'PAID';
  examScore: number | null;
  docs: {
    ktp: 'PENDING' | 'APPROVED' | 'REJECTED';
    ijazah: 'PENDING' | 'APPROVED' | 'REJECTED';
    photo: 'PENDING' | 'APPROVED' | 'REJECTED';
  };
}

export default function PmbDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'student'>('admin');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [activeTab, setActiveTab] = useState<'biodata' | 'documents' | 'exam'>('biodata');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPath, setFilterPath] = useState('ALL');

  // Interactive CBT Exam State for Student Mode
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  // Mock Applicants Database
  const [applicants, setApplicants] = useState<Applicant[]>([
    {
      id: 'PMB-2026-001',
      name: 'Rian Hidayat',
      email: 'rian.hidayat@gmail.com',
      phone: '081299887766',
      path: 'Regular',
      status: 'SUBMITTED',
      payment: 'PAID',
      examScore: 82,
      docs: { ktp: 'PENDING', ijazah: 'PENDING', photo: 'PENDING' },
    },
    {
      id: 'PMB-2026-002',
      name: 'Sherly Angelina',
      email: 'sherly.ang@gmail.com',
      phone: '082133445566',
      path: 'Beasiswa',
      status: 'VERIFIED',
      payment: 'PAID',
      examScore: 90,
      docs: { ktp: 'APPROVED', ijazah: 'APPROVED', photo: 'APPROVED' },
    },
    {
      id: 'PMB-2026-003',
      name: 'Dimas Prabowo',
      email: 'dimas.prab@gmail.com',
      phone: '085711223344',
      path: 'RPL (Rekognisi Pembelajaran Lampau)',
      status: 'DRAFT',
      payment: 'UNPAID',
      examScore: null,
      docs: { ktp: 'REJECTED', ijazah: 'PENDING', photo: 'PENDING' },
    },
    {
      id: 'PMB-2026-004',
      name: 'Amalia Putri',
      email: 'amalia.putri@outlook.com',
      phone: '089988776655',
      path: 'Regular',
      status: 'LOA_ISSUED',
      payment: 'PAID',
      examScore: 78,
      docs: { ktp: 'APPROVED', ijazah: 'APPROVED', photo: 'APPROVED' },
    },
  ]);

  // Simulated latency for skeleton check
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Set default selection
  useEffect(() => {
    if (applicants.length > 0 && !selectedApplicant) {
      setSelectedApplicant(applicants[0]);
    }
  }, [applicants, selectedApplicant]);

  // CBT countdown timer
  useEffect(() => {
    if (examStarted && timeLeft > 0 && !examSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !examSubmitted) {
      handleFinishExam();
    }
  }, [examStarted, timeLeft, examSubmitted]);

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

  const handleUpdateDocStatus = (docType: 'ktp' | 'ijazah' | 'photo', newStatus: 'APPROVED' | 'REJECTED') => {
    if (!selectedApplicant) return;

    const updatedDocs = {
      ...selectedApplicant.docs,
      [docType]: newStatus,
    };

    // Determine status check
    const allApproved = Object.values(updatedDocs).every(status => status === 'APPROVED');
    const newStatusVal = allApproved ? 'VERIFIED' : selectedApplicant.status;

    const updatedList = applicants.map(app => {
      if (app.id === selectedApplicant.id) {
        return {
          ...app,
          status: newStatusVal as any,
          docs: updatedDocs,
        };
      }
      return app;
    });

    setApplicants(updatedList);
    setSelectedApplicant({
      ...selectedApplicant,
      status: newStatusVal as any,
      docs: updatedDocs,
    });
  };

  const handleIssueLoA = (id: string) => {
    const updated = applicants.map(app => {
      if (app.id === id) {
        return { ...app, status: 'LOA_ISSUED' as const };
      }
      return app;
    });
    setApplicants(updated);
    if (selectedApplicant?.id === id) {
      setSelectedApplicant({ ...selectedApplicant, status: 'LOA_ISSUED' });
    }
    alert(`Letter of Acceptance (LoA) berhasil diterbitkan untuk pendaftar: ${id}`);
  };

  const handleHandover = (id: string) => {
    const updated = applicants.map(app => {
      if (app.id === id) {
        return { ...app, status: 'HANDED_OVER' as const };
      }
      return app;
    });
    setApplicants(updated);
    if (selectedApplicant?.id === id) {
      setSelectedApplicant({ ...selectedApplicant, status: 'HANDED_OVER' });
    }
    alert(`Handover selesai! Akun mahasiswa aktif berhasil dibuat di module Akademik (SIAKAD) dengan NIM terkompilasi.`);
  };

  // CBT Exam Mock Data
  const examQuestions = [
    {
      q: 'Manakah di bawah ini yang merupakan struktur dasar dari database PostgreSQL?',
      options: ['Schema, Table, Row', 'Table, Collection, Document', 'Workspace, Sheet, Cells', 'Database, Container, Blobs'],
      correct: 'A',
    },
    {
      q: 'Dalam arsitektur microservices SIAKAD UNSIA, port berapakah yang digunakan oleh Core Service?',
      options: ['Port 3000', 'Port 3001', 'Port 3005', 'Port 3008'],
      correct: 'B',
    },
    {
      q: 'Manakah dari berikut ini yang merupakan protokol utama untuk integrasi sistem secara sinkron?',
      options: ['gRPC / REST API HTTP', 'RabbitMQ Message Queue', 'Redis Cache Publish', 'SMTP Mail Server'],
      correct: 'A',
    },
  ];

  const handleAnswerSelect = (opt: string) => {
    setAnswers({ ...answers, [currentQuestion]: opt });
  };

  const handleFinishExam = () => {
    setExamSubmitted(true);
    // Score based on correct answers
    let correctCount = 0;
    examQuestions.forEach((q, idx) => {
      const charIndex = q.options.indexOf(answers[idx] || '');
      const charMap = ['A', 'B', 'C', 'D'];
      if (charMap[charIndex] === q.correct) {
        correctCount++;
      }
    });
    const score = Math.round((correctCount / examQuestions.length) * 100);

    // Update applicant profile
    const updatedList = applicants.map(app => {
      if (app.id === 'PMB-2026-001') { // Assume logged-in student is PMB-2026-001
        return { ...app, examScore: score, status: 'SUBMITTED' as const };
      }
      return app;
    });
    setApplicants(updatedList);
    if (selectedApplicant?.id === 'PMB-2026-001') {
      setSelectedApplicant({ ...selectedApplicant, examScore: score, status: 'SUBMITTED' });
    }
  };

  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || app.id.includes(searchQuery);
    const matchesPath = filterPath === 'ALL' || app.path === filterPath;
    return matchesSearch && matchesPath;
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
              <div className="h-3 bg-slate-900 rounded sk-shimmer w-2/3"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 bg-slate-900/20 border border-slate-805 rounded-2xl p-6 space-y-4">
            <div className="h-6 bg-slate-900 rounded-lg sk-shimmer w-1/3"></div>
            <div className="h-10 bg-slate-900 rounded-xl sk-shimmer w-full"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
                  <div className="h-3 bg-slate-900 rounded sk-shimmer w-1/4"></div>
                  <div className="h-4 bg-slate-900 rounded sk-shimmer w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="xl:col-span-2 bg-slate-900/20 border border-slate-805 rounded-2xl p-6 space-y-4">
            <div className="h-6 bg-slate-900 rounded-lg sk-shimmer w-1/2"></div>
            <div className="h-32 bg-slate-900 rounded-xl sk-shimmer w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-slate-200">
      {/* Header and Toggle Controls */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            PMB Admission Console
          </h2>
          <p className="text-slate-400 mt-1">
            {userRole === 'admin' 
              ? 'Kelola pendaftar baru, verifikasi berkas pendaftaran, input nilai ujian, serta lakukan handover mahasiswa baru.' 
              : 'Pantau status admisi, lengkapi berkas data diri, bayar tagihan registrasi, dan ikuti Ujian Tes Masuk CBT.'}
          </p>
        </div>

        {/* Development Mode Role Switcher */}
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
      {/* ADMIN CONSOLE VIEW                         */}
      {/* ========================================== */}
      {userRole === 'admin' && (
        <div className="space-y-8">
          {/* Funnel Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl relative overflow-hidden">
              <div className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Pendaftar Baru</div>
              <div className="text-3xl font-black text-white mt-2">126</div>
              <div className="text-xs text-emerald-400 font-semibold mt-1">+14% minggu ini</div>
            </div>
            <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl relative overflow-hidden">
              <div className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Dokumen Terverifikasi</div>
              <div className="text-3xl font-black text-white mt-2">84</div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Menunggu: {applicants.filter(a => a.status === 'SUBMITTED').length}</div>
            </div>
            <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl relative overflow-hidden">
              <div className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Lolos Ujian CBT</div>
              <div className="text-3xl font-black text-white mt-2">62</div>
              <div className="text-xs text-emerald-400 font-semibold mt-1">Rata-rata Nilai: 84.6</div>
            </div>
            <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl relative overflow-hidden">
              <div className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Lunas & Handover</div>
              <div className="text-3xl font-black text-white mt-2">49</div>
              <div className="text-xs text-indigo-400 font-semibold mt-1">NIM Otomatis Terbit</div>
            </div>
          </div>

          {/* Main Grid: Queue & Document verification */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Queue / Applicant List */}
            <div className="xl:col-span-1 bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-white">Antrean Pendaftar</h3>
                <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs rounded-full font-mono font-bold">
                  {filteredApplicants.length} Aktif
                </span>
              </div>

              {/* Filters */}
              <div className="space-y-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama atau kode pendaftaran..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />

                <select
                  value={filterPath}
                  onChange={(e) => setFilterPath(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">Semua Jalur Pendaftaran</option>
                  <option value="Regular">Jalur Regular</option>
                  <option value="Beasiswa">Jalur Beasiswa</option>
                  <option value="RPL (Rekognisi Pembelajaran Lampau)">Jalur RPL</option>
                </select>
              </div>

              {/* List */}
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {filteredApplicants.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApplicant(app)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${
                      selectedApplicant?.id === app.id
                        ? 'bg-indigo-600/10 border-indigo-500 shadow-md shadow-indigo-600/5'
                        : 'bg-slate-950/40 border-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-slate-500 font-bold">{app.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        app.status === 'HANDED_OVER' ? 'bg-emerald-500/10 text-emerald-400' :
                        app.status === 'LOA_ISSUED' ? 'bg-indigo-500/10 text-indigo-400' :
                        app.status === 'VERIFIED' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-white mt-2">{app.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{app.path}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Applicant details & Verification Workspace */}
            <div className="xl:col-span-2 bg-slate-900/20 border border-slate-800 rounded-2xl p-6">
              {selectedApplicant ? (
                <div className="space-y-6">
                  {/* Info Header */}
                  <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedApplicant.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">ID Pendaftaran: {selectedApplicant.id} • Jalur: {selectedApplicant.path}</p>
                    </div>

                    <div className="flex gap-2">
                      {selectedApplicant.status === 'VERIFIED' && selectedApplicant.payment === 'PAID' && (
                        <button
                          onClick={() => handleIssueLoA(selectedApplicant.id)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all"
                        >
                          Terbitkan LoA
                        </button>
                      )}
                      {selectedApplicant.status === 'LOA_ISSUED' && (
                        <button
                          onClick={() => handleHandover(selectedApplicant.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all"
                        >
                          Handover ke Akademik
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-slate-850 gap-4">
                    {(['biodata', 'documents', 'exam'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-1 text-xs font-bold border-b-2 capitalize transition-all ${
                          activeTab === tab ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tab === 'exam' ? 'Nilai Ujian CBT' : tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab Contents */}
                  {activeTab === 'biodata' && (
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div className="space-y-1">
                        <span className="text-xs text-slate-500">Email</span>
                        <p className="text-slate-200 font-semibold">{selectedApplicant.email}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-slate-500">Nomor Telepon / WA</span>
                        <p className="text-slate-200 font-semibold">{selectedApplicant.phone}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-slate-500">Jalur Penerimaan</span>
                        <p className="text-slate-200 font-semibold">{selectedApplicant.path}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-slate-500">Status Pembayaran Tagihan PMB</span>
                        <p className={`font-bold ${selectedApplicant.payment === 'PAID' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ● {selectedApplicant.payment === 'PAID' ? 'LUNAS (PAID)' : 'BELUM DIBAYAR (UNPAID)'}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'documents' && (
                    <div className="space-y-6">
                      <h4 className="text-sm font-bold text-white mb-2">Verifikasi Kelengkapan Dokumen Fisik</h4>
                      
                      {/* Document List */}
                      {(['ktp', 'ijazah', 'photo'] as const).map(doc => (
                        <div key={doc} className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{doc}</span>
                            <p className="text-xs text-slate-500 mt-1">Pemberkasan dokumen digital terlampir.</p>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                              selectedApplicant.docs[doc] === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                              selectedApplicant.docs[doc] === 'REJECTED' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {selectedApplicant.docs[doc]}
                            </span>
                            
                            <div className="flex gap-2 border border-slate-850 rounded-lg p-1 bg-slate-900">
                              <button
                                onClick={() => handleUpdateDocStatus(doc, 'APPROVED')}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded ${
                                  selectedApplicant.docs[doc] === 'APPROVED' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateDocStatus(doc, 'REJECTED')}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded ${
                                  selectedApplicant.docs[doc] === 'REJECTED' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'exam' && (
                    <div className="space-y-6">
                      <h4 className="text-sm font-bold text-white mb-2">Skor Hasil Ujian CBT Masuk</h4>
                      <div className="p-6 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center gap-6">
                        <div className="h-16 w-16 rounded-full border-4 border-indigo-500/30 flex items-center justify-center font-mono text-xl font-bold text-white bg-indigo-500/5">
                          {selectedApplicant.examScore || '-'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-300">
                            {selectedApplicant.examScore !== null 
                              ? `Ujian Selesai. Pendaftar dinyatakan ${selectedApplicant.examScore >= 70 ? 'LOLOS' : 'TIDAK LOLOS'} batas Kriteria Ketuntasan Minimal (KKM: 70).` 
                              : 'Pendaftar belum mengikuti Ujian Tes Masuk CBT.'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">Platform: UNSIA CBT System v1.0</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-slate-500 text-sm py-12">Pilih pendaftar dari list antrean untuk memulai verifikasi.</div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* STUDENT ONLINE PORTAL VIEW                 */}
      {/* ========================================== */}
      {userRole === 'student' && (
        <div className="space-y-8">
          
          {/* Main Grid for student flow */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Admission Checklist Status */}
            <div className="lg:col-span-1 bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-6">
              <h3 className="font-bold text-lg text-white">Alur Pendaftaran Anda</h3>
              <p className="text-xs text-slate-400 mt-1">Selesaikan seluruh tahapan berikut untuk mengaktifkan Nomor Induk Mahasiswa (NIM).</p>

              <div className="space-y-4">
                <div className="flex gap-3.5 items-start p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                  <div className="h-5 w-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Bayar Tagihan Pendaftaran</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Sudah diverifikasi oleh sistem keuangan.</p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    applicants[0].examScore !== null ? 'bg-emerald-500 text-slate-950' : 'bg-amber-600 text-white animate-pulse'
                  }`}>
                    {applicants[0].examScore !== null ? '✓' : '2'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Ikuti Tes Ujian Masuk CBT</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {applicants[0].examScore !== null 
                        ? `Sudah diikuti dengan Nilai: ${applicants[0].examScore}` 
                        : 'Ikuti tes ujian online pada modul sebelah kanan.'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl opacity-60">
                  <div className="h-5 w-5 rounded-full bg-slate-850 border border-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400">Verifikasi Berkas Kelulusan</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Berkas KTP, Ijazah, dan Photo dalam proses antrean validasi Admin.</p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl opacity-60">
                  <div className="h-5 w-5 rounded-full bg-slate-850 border border-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400">Penerbitan LoA & Handover NIM</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">LoA terbit, onboarding pengisian KRS dimulai.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Test CBT Workspace / Dashboard Module */}
            <div className="lg:col-span-2 bg-slate-900/20 border border-slate-800 rounded-2xl p-6">
              {!examStarted && !examSubmitted && applicants[0].examScore === null && (
                <div className="text-center py-12 max-w-lg mx-auto space-y-6">
                  <div className="h-16 w-16 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto text-2xl animate-bounce">
                    <i className="ph-bold ph-exam"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Tes Ujian Masuk Online (CBT)</h3>
                    <p className="text-xs text-slate-400 mt-1">Ujian ini bersifat wajib untuk menyaring calon mahasiswa berdasarkan kompetensi dasar sains/teknologi.</p>
                  </div>
                  <div className="p-4 bg-slate-950/50 rounded-xl text-left text-xs text-slate-400 space-y-2">
                    <p>● Durasi Ujian: 10 Menit</p>
                    <p>● Jumlah Soal: 3 Soal Pilihan Ganda</p>
                    <p>● Pastikan koneksi internet stabil sebelum menekan tombol Mulai Ujian.</p>
                  </div>
                  <button
                    onClick={() => { setExamStarted(true); setTimeLeft(600); }}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
                  >
                    Mulai Ujian Sekarang
                  </button>
                </div>
              )}

              {examStarted && !examSubmitted && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <h3 className="font-bold text-white">Lembar Ujian CBT Pendaftar</h3>
                    <div className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-full font-mono font-bold">
                      Sisa Waktu: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                  </div>

                  {/* Question */}
                  <div className="space-y-4">
                    <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Soal Ke {currentQuestion + 1} dari {examQuestions.length}</span>
                    <p className="text-sm font-semibold text-white leading-relaxed">{examQuestions[currentQuestion].q}</p>
                    
                    {/* Options list */}
                    <div className="space-y-2 pt-2">
                      {examQuestions[currentQuestion].options.map((opt, optIdx) => {
                        const optChar = ['A', 'B', 'C', 'D'][optIdx];
                        const isSelected = answers[currentQuestion] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => handleAnswerSelect(opt)}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-3 ${
                              isSelected 
                                ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-md' 
                                : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <span className={`h-6 w-6 rounded-lg flex items-center justify-center font-bold font-mono text-[10px] ${
                              isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-900 border border-slate-800 text-slate-500'
                            }`}>{optChar}</span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom Navigation */}
                  <div className="flex justify-between items-center pt-6 border-t border-slate-850">
                    <button
                      disabled={currentQuestion === 0}
                      onClick={() => setCurrentQuestion(currentQuestion - 1)}
                      className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-850 text-slate-300 disabled:opacity-50"
                    >
                      Sebelumnya
                    </button>
                    {currentQuestion < examQuestions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestion(currentQuestion + 1)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500"
                      >
                        Berikutnya
                      </button>
                    ) : (
                      <button
                        onClick={handleFinishExam}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 shadow-md"
                      >
                        Selesaikan Ujian
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Score Page */}
              {(examSubmitted || applicants[0].examScore !== null) && (
                <div className="text-center py-12 max-w-lg mx-auto space-y-6">
                  <div className="h-20 w-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Hasil Ujian CBT Anda</h3>
                    <p className="text-xs text-slate-400 mt-1">Ujian Anda telah dikirim dan dinilai secara otomatis oleh sistem.</p>
                  </div>
                  <div className="p-6 bg-slate-950/40 border border-slate-850 rounded-2xl flex justify-around items-center max-w-xs mx-auto">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Skor Nilai</span>
                      <p className="text-3xl font-black text-white mt-1">{applicants[0].examScore ?? 0}</p>
                    </div>
                    <div className="h-8 w-px bg-slate-850"></div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Kelulusan</span>
                      <p className={`text-xs font-black mt-1.5 ${
                        (applicants[0].examScore ?? 0) >= 70 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {(applicants[0].examScore ?? 0) >= 70 ? 'LOLOS (PASS)' : 'TIDAK LOLOS'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Terima kasih atas partisipasi Anda. Berkas fisik Anda saat ini sedang diperiksa oleh tim Admin PMB.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
