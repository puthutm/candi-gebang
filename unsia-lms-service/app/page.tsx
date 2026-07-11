'use client';

import React, { useState, useEffect } from 'react';

interface LMSClass {
  id: string;
  name: string;
  code: string;
  lecturer: string;
}

interface Session {
  id: string;
  week: number;
  title: string;
  date: string;
  agenda: string;
  slideUrl: string;
  meetUrl: string;
  attendanceDone: boolean;
}

interface ForumPost {
  id: string;
  author: string;
  role: 'LECTURER' | 'STUDENT';
  time: string;
  message: string;
  score?: number; // Graded by lecturer
  replies: {
    id: string;
    author: string;
    role: 'LECTURER' | 'STUDENT';
    time: string;
    message: string;
    score?: number;
  }[];
}

interface Submission {
  studentName: string;
  fileName: string;
  submittedAt: string;
  score: number | null;
  feedback: string;
}

export default function LmsDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'lecturer' | 'student'>('lecturer');
  const [selectedClass, setSelectedClass] = useState<LMSClass>({ id: '1', name: 'Pemrograman Web Lanjut', code: 'INF301', lecturer: 'Diana Sari, M.T.' });
  const [selectedSession, setSelectedSession] = useState<Session>({
    id: 'S3',
    week: 3,
    title: 'Implementasi Event Outbox & Inbox Pattern',
    date: '11 Juli 2026',
    agenda: 'Mempelajari cara kerja outbox pattern untuk reliabilitas pengiriman event antar microservices.',
    slideUrl: 'https://slides.unsia.ac.id/inf301-sesi3.pdf',
    meetUrl: 'https://zoom.us/j/98800122026',
    attendanceDone: true,
  });

  const [forumPosts, setForumPosts] = useState<ForumPost[]>([
    {
      id: 'F-001',
      author: 'Diana Sari, M.T.',
      role: 'LECTURER',
      time: '10:15 WIB',
      message: 'Silakan pelajari slide sesi 3 terlebih dahulu sebelum berdiskusi tentang penerapan Drizzle transaction.',
      replies: [
        { id: 'R-001', author: 'Rian Hidayat', role: 'STUDENT', time: '10:45 WIB', message: 'Izin bertanya Bu, apakah Outbox table wajib ditaruh di dalam skema database yang sama dengan bisnis model?', score: 85 },
        { id: 'R-002', author: 'Sherly Angelina', role: 'STUDENT', time: '11:02 WIB', message: 'Betul Rian, karena agar transaction ACID-nya berjalan sempurna untuk write data bisnis dan event sekaligus.', score: 95 },
      ]
    }
  ]);

  // Form states
  const [forumReplyMsg, setForumReplyMsg] = useState('');
  const [newTopicMsg, setNewTopicMsg] = useState('');
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);

  // Lecturer grading states
  const [submissions, setSubmissions] = useState<Submission[]>([
    { studentName: 'Rian Hidayat', fileName: 'rian_hidayat_outbox_assign.zip', submittedAt: '10 Juli 2026 18:32', score: null, feedback: '' },
    { studentName: 'Sherly Angelina', fileName: 'sherly_ang_outbox_design.pdf', submittedAt: '10 Juli 2026 21:05', score: 95, feedback: 'Arsitektur diagram outbox/inbox digambar dengan sangat rapi dan lengkap!' },
  ]);
  const [gradingScore, setGradingScore] = useState('85');
  const [gradingFeedback, setGradingFeedback] = useState('');

  // Fetch LMS classes with fallback
  const fetchLmsClasses = async () => {
    try {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const response = await fetch(`http://${hostname}:3008/api/v1/lms/classes`);
      const result = await response.json();
      if (response.ok && result.data && result.data.length > 0) {
        // Map database fields to UI
        const mappedClass = {
          id: result.data[0].id,
          name: result.data[0].className || 'Pemrograman Web Lanjut',
          code: result.data[0].classCode || 'INF301',
          lecturer: 'Diana Sari, M.T.'
        };
        setSelectedClass(mappedClass);
        console.log('LMS active: loaded real data from lms_db.');
      }
    } catch (err) {
      console.warn('LMS operating in degraded fallback mode (service offline).');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLmsClasses();
  }, []);

  // Load user role from session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.role === 'super_admin' || parsed.role === 'admin' || parsed.role === 'lecturer') {
            setUserRole('lecturer');
          } else {
            setUserRole('student');
          }
        } catch (e) {}
      }
    }
  }, []);

  const handlePostReply = (postId: string) => {
    if (!forumReplyMsg.trim()) return;

    const newReply = {
      id: `R-${Date.now()}`,
      author: userRole === 'lecturer' ? 'Diana Sari, M.T.' : 'Rian Hidayat',
      role: userRole === 'lecturer' ? 'LECTURER' as const : 'STUDENT' as const,
      time: 'Baru saja',
      message: forumReplyMsg,
    };

    const updated = forumPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          replies: [...post.replies, newReply],
        };
      }
      return post;
    });

    setForumPosts(updated);
    setForumReplyMsg('');
  };

  const handleGradeReply = (postId: string, replyId: string, score: number) => {
    const updated = forumPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          replies: post.replies.map(r => r.id === replyId ? { ...r, score } : r),
        };
      }
      return post;
    });
    setForumPosts(updated);
    alert(`Nilai partisipasi diskusi berhasil disimpan: ${score} poin.`);
  };

  const handleGradeSubmission = (studentName: string) => {
    const updated = submissions.map(sub => {
      if (sub.studentName === studentName) {
        return {
          ...sub,
          score: parseInt(gradingScore),
          feedback: gradingFeedback || 'Tugas telah diverifikasi.',
        };
      }
      return sub;
    });
    setSubmissions(updated);
    setGradingFeedback('');
    alert(`Nilai tugas ${studentName} berhasil di-submit: ${gradingScore} poin.`);
  };

  const sessionsList: Session[] = [
    { id: 'S1', week: 1, title: 'Pengenalan Arsitektur distributed ERP', date: '01 Juli 2026', agenda: 'Overview topologi ERP Pendidikan UNSIA dan batasan modul boundary.', slideUrl: '#', meetUrl: '#', attendanceDone: true },
    { id: 'S2', week: 2, title: 'Desain Database PostgreSQL per Modul', date: '04 Juli 2026', agenda: 'Mempelajari relasi external reference (*_ref_id) tanpa cross-DB FK constraints.', slideUrl: '#', meetUrl: '#', attendanceDone: true },
    { id: 'S3', week: 3, title: 'Implementasi Event Outbox & Inbox Pattern', date: '11 Juli 2026', agenda: 'Mempelajari cara kerja outbox pattern untuk reliabilitas pengiriman event antar microservices.', slideUrl: '#', meetUrl: '#', attendanceDone: true },
    { id: 'S4', week: 4, title: 'Integrasi Messaging Asinkron dengan RabbitMQ', date: '18 Juli 2026', agenda: 'Setup queue, routing exchange, binding, dan recovery mechanism.', slideUrl: '#', meetUrl: '#', attendanceDone: false },
  ];

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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="h-6 bg-slate-900 rounded-lg sk-shimmer w-1/3"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
                  <div className="h-3 bg-slate-900 rounded sk-shimmer w-1/4"></div>
                  <div className="h-4 bg-slate-900 rounded sk-shimmer w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="xl:col-span-2 space-y-6">
            <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-3">
              <div className="h-4 bg-slate-900 rounded sk-shimmer w-1/4"></div>
              <div className="h-6 bg-slate-900 rounded-lg sk-shimmer w-2/3"></div>
              <div className="h-20 bg-slate-900 rounded-xl sk-shimmer w-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="p-6 bg-slate-900/20 border border-slate-800 rounded-2xl space-y-4 min-h-[200px]">
                  <div className="h-4 bg-slate-900 rounded sk-shimmer w-1/3"></div>
                  <div className="h-20 bg-slate-900 rounded-xl sk-shimmer w-full"></div>
                </div>
              ))}
            </div>
          </div>
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
            LMS E-Learning Portal (ICEMS)
          </h2>
          <p className="text-slate-400 mt-1">
            {userRole === 'lecturer'
              ? 'Kelola materi pembelajaran, unggah tugas, berikan nilai forum diskusi, dan evaluasi hasil belajar.'
              : 'Akses materi perkuliahan online, hadiri pertemuan video conference, serta ikuti diskusi kelas.'}
          </p>
        </div>

        {/* Development View Switcher */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1.5 shadow-lg shadow-black/20">
          <button
            onClick={() => setUserRole('lecturer')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              userRole === 'lecturer' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dosen View
          </button>
          <button
            onClick={() => setUserRole('student')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              userRole === 'student' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mahasiswa View
          </button>
        </div>
      </header>

      {/* Main LMS Dashboard Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Course outline / Weeks stream */}
        <div className="xl:col-span-1 bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="pb-4 border-b border-slate-850">
            <span className="text-[10px] font-mono text-indigo-400 font-bold">{selectedClass.code}</span>
            <h3 className="font-bold text-lg text-white mt-1">{selectedClass.name}</h3>
            <p className="text-xs text-slate-500 mt-1">Dosen: {selectedClass.lecturer}</p>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {sessionsList.map(ses => (
              <div
                key={ses.id}
                onClick={() => setSelectedSession(ses)}
                className={`p-4 border rounded-xl cursor-pointer transition-all flex justify-between items-center ${
                  selectedSession.id === ses.id
                    ? 'bg-indigo-600/10 border-indigo-500 shadow-md'
                    : 'bg-slate-950/40 border-slate-850 hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="text-[10px] text-slate-500 font-bold">Minggu ke {ses.week}</span>
                  <h4 className="font-bold text-xs text-slate-200 mt-1">{ses.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">{ses.date}</p>
                </div>
                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ml-4 ${
                  ses.attendanceDone ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-700'
                }`}></span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Workspaces (Forum and Assignments) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Workspace Header Info */}
          <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-4">
            <span className="px-2.5 py-1 bg-indigo-500/15 border border-indigo-500/20 rounded-lg text-xs font-mono text-indigo-400 font-bold">
              SESI {selectedSession.week} AGENDA
            </span>
            <h3 className="text-xl font-bold text-white mt-1">{selectedSession.title}</h3>
            <p className="text-xs text-slate-350 leading-relaxed">{selectedSession.agenda}</p>

            <div className="flex gap-3 pt-3 border-t border-slate-850">
              <a
                href={selectedSession.meetUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                Ikuti Video Conf (Zoom)
              </a>
              <a
                href={selectedSession.slideUrl}
                className="px-4 py-2 bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all"
              >
                Unduh Slide Materi
              </a>
            </div>
          </div>

          {/* Tab Split: Forum Discussion & Assignment submission */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Interactive Forum */}
            <section className="p-6 bg-slate-900/20 border border-slate-800 rounded-2xl space-y-6 flex flex-col justify-between min-h-[420px]">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2 pb-3 border-b border-slate-850">
                  <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                  Forum Diskusi Sesi
                </h4>
                
                {/* Forum Thread */}
                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1 mt-4">
                  {forumPosts.map(post => (
                    <div key={post.id} className="space-y-3 text-xs">
                      <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-indigo-400">{post.author} ({post.role})</span>
                          <span className="text-[10px] text-slate-500">{post.time}</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{post.message}</p>
                      </div>

                      {/* Replies */}
                      <div className="pl-6 space-y-3 border-l-2 border-slate-850">
                        {post.replies.map(rep => (
                          <div key={rep.id} className="p-3 bg-slate-900/30 border border-slate-850 rounded-xl space-y-1 relative">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-300">{rep.author} ({rep.role})</span>
                              <span className="text-[10px] text-slate-500">{rep.time}</span>
                            </div>
                            <p className="text-slate-400 leading-relaxed">{rep.message}</p>
                            
                            {/* Score Display / Grading tools */}
                            <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-850/50">
                              <span className="text-[9px] text-slate-500 font-mono">Partisipasi Forum</span>
                              {userRole === 'lecturer' ? (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    defaultValue={rep.score || 80}
                                    onChange={(e) => handleGradeReply(post.id, rep.id, parseInt(e.target.value))}
                                    placeholder="Nilai"
                                    className="w-12 bg-slate-950 border border-slate-800 text-center rounded py-0.5 text-[10px] text-white focus:outline-none"
                                  />
                                  <span className="text-[10px] text-slate-400">Poin</span>
                                </div>
                              ) : (
                                <span className="text-[10px] font-bold text-indigo-400">{rep.score ? `${rep.score} Poin` : 'Belum dinilai'}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Form */}
              <div className="pt-4 border-t border-slate-850 flex gap-2">
                <input
                  type="text"
                  value={forumReplyMsg}
                  onChange={(e) => setForumReplyMsg(e.target.value)}
                  placeholder="Tulis tanggapan diskusi..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handlePostReply('F-001')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                >
                  Balas
                </button>
              </div>
            </section>

            {/* Assignments Panel */}
            <section className="p-6 bg-slate-900/20 border border-slate-800 rounded-2xl space-y-6 min-h-[420px]">
              <h4 className="font-bold text-sm text-white flex items-center gap-2 pb-3 border-b border-slate-850">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                Tugas Mingguan Sesi
              </h4>

              {userRole === 'student' ? (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                    <p className="font-bold text-slate-200">Tugas: Perancangan Skema Outbox</p>
                    <p className="text-slate-400">Buatlah rancangan Drizzle schema untuk database `pmb_db` beserta rancangan outbox polling worker.</p>
                    <p className="text-[10px] text-slate-500 font-mono">Batas Akhir: 18 Juli 2026, 23:59 WIB</p>
                  </div>

                  {!assignmentSubmitted ? (
                    <div className="space-y-3">
                      <div className="border-2 border-dashed border-slate-800 rounded-xl p-6 text-center hover:border-slate-700 transition cursor-pointer">
                        <span className="text-[10px] text-slate-500 block mb-2">Seret & taruh file lampiran (.zip/.pdf)</span>
                        <input
                          type="file"
                          onChange={(e) => setAssignmentFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="px-3 py-1.5 bg-slate-900 border border-slate-850 rounded text-[10px] text-slate-300 font-semibold cursor-pointer">
                          {assignmentFile ? assignmentFile.name : 'Pilih File'}
                        </label>
                      </div>

                      <button
                        onClick={() => setAssignmentSubmitted(true)}
                        disabled={!assignmentFile}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition disabled:opacity-50"
                      >
                        Submit Tugas
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl space-y-2">
                      <p className="font-bold">✓ Tugas berhasil dikirim!</p>
                      <p className="text-[10px]">Menunggu koreksi nilai dan umpan balik dari Dosen pengampu.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6 text-xs">
                  <h5 className="font-bold text-slate-400 uppercase tracking-wider">Submisi Tugas Mahasiswa</h5>
                  
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {submissions.map(sub => (
                      <div key={sub.studentName} className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-slate-200">{sub.studentName}</p>
                            <span className="text-[10px] text-indigo-400 hover:underline cursor-pointer block mt-1">{sub.fileName}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sub.score !== null ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {sub.score !== null ? `${sub.score} Poin` : 'Belum Dinilai'}
                          </span>
                        </div>

                        {/* Grading Form for Dosen */}
                        <div className="pt-3 border-t border-slate-850/60 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-bold block shrink-0">Input Nilai:</span>
                            <input
                              type="number"
                              defaultValue={sub.score || 85}
                              onChange={(e) => setGradingScore(e.target.value)}
                              className="w-16 bg-slate-900 border border-slate-800 text-center rounded py-1 text-xs text-white"
                            />
                            <span className="text-[10px] text-slate-500">Poin (KKM: 70)</span>
                          </div>
                          <input
                            type="text"
                            value={gradingFeedback}
                            onChange={(e) => setGradingFeedback(e.target.value)}
                            placeholder="Tulis catatan feedback..."
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-[10px] text-white focus:outline-none"
                          />
                          <button
                            onClick={() => handleGradeSubmission(sub.studentName)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold rounded-lg text-white transition"
                          >
                            Kirim Nilai & Feedback
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

          </div>
        </div>

      </div>
    </div>
  );
}
