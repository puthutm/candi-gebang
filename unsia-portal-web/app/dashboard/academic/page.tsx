'use client';

import React, { useState, useEffect } from 'react';

interface Course {
  id: string;
  code: string;
  name: string;
  sks: number;
  lecturer: string;
  schedule: string;
  quota: number;
  enrolled: number;
}

interface Student {
  id: string;
  nim: string;
  name: string;
  program: string;
  gpa: number;
  krsStatus: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
  advisor: string;
  selectedCourses: string[]; // Course IDs
}

export default function AcademicDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'student'>('admin');
  const [activeSubTab, setActiveSubTab] = useState<'krs' | 'offerings' | 'onboarding'>('krs');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Student specific states
  const [currentStudent, setCurrentStudent] = useState<Student>({
    id: 'ST-2026-001',
    nim: '2601012003',
    name: 'Rian Hidayat',
    program: 'PJJ Informatika',
    gpa: 3.82,
    krsStatus: 'DRAFT',
    advisor: 'Dr. Eri Prasetyo',
    selectedCourses: ['CS-101', 'CS-102'],
  });

  // Mock Courses database
  const courses: Course[] = [
    { id: 'CS-101', code: 'INF101', name: 'Pemrograman Web Lanjut (Next.js)', sks: 3, lecturer: 'Diana Sari, M.T.', schedule: 'Senin, 09:00 - 11:30', quota: 40, enrolled: 32 },
    { id: 'CS-102', code: 'INF102', name: 'Desain Arsitektur Microservices', sks: 4, lecturer: 'Ahmad Faisal, Ph.D.', schedule: 'Selasa, 13:00 - 16:20', quota: 35, enrolled: 30 },
    { id: 'CS-103', code: 'INF103', name: 'Sistem Terdistribusi & Messaging', sks: 3, lecturer: 'Dr. Eng. Heru Bowo', schedule: 'Rabu, 10:00 - 12:30', quota: 40, enrolled: 25 },
    { id: 'CS-104', code: 'INF104', name: 'Rekayasa Perangkat Lunak Cloud', sks: 3, lecturer: 'Lukman Hakim, M.Kom.', schedule: 'Kamis, 09:00 - 11:30', quota: 50, enrolled: 45 },
    { id: 'CS-105', code: 'INF105', name: 'Keamanan Data & Enkripsi', sks: 3, lecturer: 'Prof. Budi Rahardjo', schedule: 'Jumat, 14:00 - 16:30', quota: 30, enrolled: 12 },
  ];

  // Mock Students database (for Admin/Lecturer PA view)
  const [students, setStudents] = useState<Student[]>([
    { id: 'ST-2026-001', nim: '2601012003', name: 'Rian Hidayat', program: 'PJJ Informatika', gpa: 3.82, krsStatus: 'SUBMITTED', advisor: 'Dr. Eri Prasetyo', selectedCourses: ['CS-101', 'CS-102', 'CS-103'] },
    { id: 'ST-2026-002', nim: '2601012004', name: 'Sherly Angelina', program: 'PJJ Informatika', gpa: 3.90, krsStatus: 'APPROVED', advisor: 'Dr. Eri Prasetyo', selectedCourses: ['CS-101', 'CS-102', 'CS-104'] },
    { id: 'ST-2026-003', nim: '2601012005', name: 'Dimas Prabowo', program: 'PJJ Sistem Informasi', gpa: 2.45, krsStatus: 'DRAFT', advisor: 'Rosalia, M.MSI', selectedCourses: ['CS-101'] },
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
          if (parsed.role === 'super_admin' || parsed.role === 'admin') {
            setUserRole('admin');
          } else {
            setUserRole('student');
          }
        } catch (e) {}
      }
    }
  }, []);

  useEffect(() => {
    if (students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0]);
    }
  }, [students, selectedStudent]);

  // Enforced credits rule based on GPA
  const getMaxCredits = (gpa: number) => {
    if (gpa >= 3.0) return 24;
    if (gpa >= 2.0) return 20;
    return 18;
  };

  const handleToggleCourse = (courseId: string) => {
    const isSelected = currentStudent.selectedCourses.includes(courseId);
    let updated: string[];

    if (isSelected) {
      updated = currentStudent.selectedCourses.filter(id => id !== courseId);
    } else {
      const courseToAdd = courses.find(c => c.id === courseId);
      const currentCredits = currentStudent.selectedCourses.reduce((sum, id) => {
        const c = courses.find(item => item.id === id);
        return sum + (c ? c.sks : 0);
      }, 0);

      const maxCredits = getMaxCredits(currentStudent.gpa);
      const additionalCredits = courseToAdd ? courseToAdd.sks : 0;

      if (currentCredits + additionalCredits > maxCredits) {
        alert(`Batas SKS Terlampaui! Dengan IPK ${currentStudent.gpa}, Anda hanya diperbolehkan mengambil maksimal ${maxCredits} SKS.`);
        return;
      }
      updated = [...currentStudent.selectedCourses, courseId];
    }

    setCurrentStudent({
      ...currentStudent,
      selectedCourses: updated,
    });
  };

  const handleSubmitKrs = () => {
    setCurrentStudent({
      ...currentStudent,
      krsStatus: 'SUBMITTED',
    });
    alert('KRS berhasil dikirimkan kepada Dosen Pembimbing Akademik (PA) Anda.');
  };

  const handleApproveKrs = (studentId: string) => {
    const updated = students.map(st => {
      if (st.id === studentId) {
        return { ...st, krsStatus: 'APPROVED' as const };
      }
      return st;
    });
    setStudents(updated);
    if (selectedStudent?.id === studentId) {
      setSelectedStudent({ ...selectedStudent, krsStatus: 'APPROVED' });
    }
    alert(`KRS mahasiswa ${studentId} disetujui. Kelas disinkronisasi ke LMS.`);
  };

  const studentCurrentCredits = currentStudent.selectedCourses.reduce((sum, id) => {
    const c = courses.find(item => item.id === id);
    return sum + (c ? c.sks : 0);
  }, 0);

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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="h-6 bg-slate-900 rounded-lg sk-shimmer w-1/3"></div>
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
                  <div className="h-3 bg-slate-900 rounded sk-shimmer w-1/4"></div>
                  <div className="h-4 bg-slate-900 rounded sk-shimmer w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="xl:col-span-2 bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="h-6 bg-slate-900 rounded-lg sk-shimmer w-1/2"></div>
            <div className="h-40 bg-slate-900 rounded-xl sk-shimmer w-full"></div>
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
            SIAKAD & Rencana Studi (KRS)
          </h2>
          <p className="text-slate-400 mt-1">
            {userRole === 'admin'
              ? 'Tinjau lembar KRS mahasiswa bimbingan, kelola kelas kuliah, dan sinkronisasikan kelas akademik.'
              : 'Isi Kartu Rencana Studi (KRS) semester berjalan, lihat info kelas, dan pantau status bimbingan akademik.'}
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
      {/* ADMIN / KAPRODI VIEW                       */}
      {/* ========================================== */}
      {userRole === 'admin' && (
        <div className="space-y-8">
          
          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Mahasiswa Aktif</span>
              <p className="text-2xl font-black text-white mt-1">294</p>
            </div>
            <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">KRS Diajukan</span>
              <p className="text-2xl font-black text-white mt-1">{students.filter(s => s.krsStatus === 'SUBMITTED').length}</p>
            </div>
            <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">KRS Disetujui</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{students.filter(s => s.krsStatus === 'APPROVED').length}</p>
            </div>
            <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Matakuliah</span>
              <p className="text-2xl font-black text-indigo-400 mt-1">26 Kelas</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left Queue: Pending KRS Approvals */}
            <div className="xl:col-span-1 bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-6">
              <h3 className="font-bold text-lg text-white">Lembar KRS Masuk</h3>
              <div className="space-y-3">
                {students.map(st => (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStudent(st)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${
                      selectedStudent?.id === st.id
                        ? 'bg-indigo-600/10 border-indigo-500 shadow-md'
                        : 'bg-slate-950/40 border-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-500 font-mono">{st.nim}</span>
                      <span className={`px-2 py-0.5 rounded ${
                        st.krsStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                        st.krsStatus === 'SUBMITTED' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'
                      }`}>{st.krsStatus}</span>
                    </div>
                    <h4 className="font-bold text-sm text-white mt-2">{st.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{st.program} • IPK: {st.gpa}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel: KRS details & Approve actions */}
            <div className="xl:col-span-2 bg-slate-900/20 border border-slate-800 rounded-2xl p-6">
              {selectedStudent ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedStudent.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">NIM: {selectedStudent.nim} • Prodi: {selectedStudent.program}</p>
                    </div>
                    {selectedStudent.krsStatus === 'SUBMITTED' && (
                      <button
                        onClick={() => handleApproveKrs(selectedStudent.id)}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all"
                      >
                        Setujui KRS Mahasiswa
                      </button>
                    )}
                  </div>

                  {/* Chosen courses details */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matakuliah Yang Diajukan</h4>
                    <div className="space-y-2">
                      {selectedStudent.selectedCourses.map(id => {
                        const c = courses.find(item => item.id === id);
                        if (!c) return null;
                        return (
                          <div key={c.id} className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-white">{c.name}</span>
                              <p className="text-slate-500 mt-0.5">{c.lecturer} • {c.schedule}</p>
                            </div>
                            <span className="px-2 py-1 bg-slate-900 text-slate-400 border border-slate-850 rounded font-mono font-bold">
                              {c.sks} SKS
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center text-slate-500 text-sm py-12">Pilih mahasiswa dari list antrean untuk melakukan validasi KRS.</div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* STUDENT VIEW LAYOUT                        */}
      {/* ========================================== */}
      {userRole === 'student' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* KRS Form & credit rules */}
            <div className="xl:col-span-2 bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <h3 className="font-bold text-lg text-white">Lembar Pengisian KRS</h3>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Maksimal Beban SKS:</span>
                  <p className="text-xs font-bold text-white">Maks {getMaxCredits(currentStudent.gpa)} SKS (IPK: {currentStudent.gpa})</p>
                </div>
              </div>

              {currentStudent.krsStatus === 'DRAFT' ? (
                <div className="space-y-4">
                  {courses.map(course => {
                    const isChecked = currentStudent.selectedCourses.includes(course.id);
                    return (
                      <div
                        key={course.id}
                        onClick={() => handleToggleCourse(course.id)}
                        className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                          isChecked 
                            ? 'bg-indigo-600/10 border-indigo-500' 
                            : 'bg-slate-950/40 border-slate-850 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-900 text-slate-500 border border-slate-800 rounded font-mono text-[9px] font-bold">
                              {course.code}
                            </span>
                            <span className="font-bold text-sm text-white">{course.name}</span>
                          </div>
                          <p className="text-xs text-slate-400">{course.lecturer} • {course.schedule}</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono font-bold text-indigo-400">{course.sks} SKS</span>
                          <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                            isChecked ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-800 bg-slate-900'
                          }`}>
                            {isChecked && '✓'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-400">
                    KRS Anda telah dikirimkan ke pembimbing akademik. Saat ini status KRS Anda adalah: <span className="font-bold text-amber-400 uppercase">{currentStudent.krsStatus}</span>. Anda tidak dapat mengubah pilihan matakuliah.
                  </div>
                  
                  {/* Readonly courses */}
                  {currentStudent.selectedCourses.map(id => {
                    const c = courses.find(item => item.id === id);
                    if (!c) return null;
                    return (
                      <div key={c.id} className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-slate-200">{c.name}</span>
                          <p className="text-slate-500 mt-1">{c.lecturer} • {c.schedule}</p>
                        </div>
                        <span className="text-indigo-400 font-bold font-mono">{c.sks} SKS</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* KRS Status summary & submit */}
            <div className="xl:col-span-1 bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-6">
              <h3 className="font-bold text-lg text-white">Ringkasan Pilihan</h3>
              
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-850">
                  <span className="text-slate-500">Jumlah SKS Terpilih</span>
                  <span className="font-bold text-white font-mono text-sm">{studentCurrentCredits} SKS</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-850">
                  <span className="text-slate-500">Dosen Pembimbing PA</span>
                  <span className="font-bold text-slate-200">{currentStudent.advisor}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-850">
                  <span className="text-slate-500">Status Validasi PA</span>
                  <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                    currentStudent.krsStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                    currentStudent.krsStatus === 'SUBMITTED' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-500'
                  }`}>{currentStudent.krsStatus}</span>
                </div>

                {currentStudent.krsStatus === 'DRAFT' && (
                  <button
                    onClick={handleSubmitKrs}
                    disabled={studentCurrentCredits === 0}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md disabled:opacity-50 mt-4"
                  >
                    Ajukan KRS ke Dosen PA
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
