'use client';
import { useEffect } from 'react';
import { guardarIndicacao } from '@/lib/vitrine';

// quem chega por um link de indicação (?i=codigo) fica com o código guardado,
// mesmo que passeie pelo site antes de se cadastrar
export default function CapturaIndicacao() {
  useEffect(() => {
    const i = new URLSearchParams(window.location.search).get('i');
    if (i) guardarIndicacao(i);
  }, []);
  return null;
}
