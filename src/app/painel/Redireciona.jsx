'use client';
import { useEffect } from 'react';
import { BASE } from '@/lib/config';

export default function Redireciona() {
  useEffect(() => {
    window.location.replace(`${BASE}/admin/${window.location.hash}`);
  }, []);
  return <main className="min-h-[100svh] bg-noite" />;
}
