'use client';

import React, { useState } from 'react';

export default function LmsDashboard() {
  const [forumPosts, setForumPosts] = useState([
    { id: 1, user: 'Dr. John Doe', role: 'LECTURER', time: '10 mins ago', message: 'Silakan pelajari materi sesi 3 tentang Drizzle ORM sebelum kuis dimulai.' },
    { id: 2, user: 'Siti Aminah', role: 'STUDENT', time: '1 hour ago', message: 'Apakah kuis sesi 3 memiliki batas waktu pengerjaan?' },
  ]);
  const [newPost, setNewPost] = useState('');

  const handlePostForum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setForumPosts([
      {
        id: forumPosts.length + 1,
        user: 'Mahasiswa Aktif',
        role: 'STUDENT',
        time: 'Just now',
        message: newPost,
      },
      ...forumPosts,
    ]);
    setNewPost('');
  };

  const sessions = [
    { title: 'Sesi 1: Perancangan Arsitektur Microservices', status: 'COMPLETED', date: '01 Juli 2026' },
    { title: 'Sesi 2: Konfigurasi Docker & database per modul', status: 'COMPLETED', date: '04 Juli 2026' },
    { title: 'Sesi 3: Implementasi Outbox & Event Broker', status: 'ACTIVE', date: 'Today' },
    { title: 'Sesi 4: Rekonsiliasi & Hardening Transaksi', status: 'UPCOMING', date: '10 Juli 2026' },
  ];

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          LMS & E-Learning Portal
        </h2>
        <p className="text-slate-400 mt-1">Access lecture modules, participate in discussions, and complete assessment quizzes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Sessions & Materials */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Daftar Sesi Perkuliahan</h3>
            <div className="space-y-4">
              {sessions.map((ses, idx) => (
                <div key={idx} className="p-4 bg-slate-950 border border-slate-900 rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-200">{ses.title}</h4>
                    <span className="text-xs text-slate-500">{ses.date}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    ses.status === 'ACTIVE'
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : ses.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {ses.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Discussion Forum (ICEMS Diskusi Mock) */}
        <div className="space-y-6">
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl backdrop-blur-sm flex flex-col h-[500px] justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-4">Forum Diskusi Kelas (ICEMS)</h3>
              <div className="space-y-4 overflow-y-auto max-h-[340px] pr-2">
                {forumPosts.map((post: any) => (
                  <div key={post.id} className="p-3 bg-slate-950/80 border border-slate-900 rounded-lg space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-indigo-400">{post.user} <span className="text-[10px] text-slate-500">({post.role})</span></span>
                      <span className="text-slate-500">{post.time}</span>
                    </div>
                    <p className="text-xs text-slate-300">{post.message}</p>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handlePostForum} className="mt-4 flex gap-2">
              <input
                type="text"
                value={newPost}
                onChange={(e: any) => setNewPost(e.target.value)}
                placeholder="Tulis diskusi baru..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded transition"
              >
                Kirim
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
