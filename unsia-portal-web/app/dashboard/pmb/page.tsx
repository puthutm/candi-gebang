'use client';

import { useEffect } from 'react';

export default function RedirectPage() {
  useEffect(() => {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    window.location.href = `http://${hostname}:3004/`;
  }, []);

  return (
    <div className="p-8 text-center text-slate-400 font-sans">
      <p>Redirecting to PMB Admission Module...</p>
    </div>
  );
}
