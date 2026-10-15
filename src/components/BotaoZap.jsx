'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { IconeZap } from './Icones';
import { useVitrine } from '@/lib/vitrine';
import { linkOrcamento } from '@/lib/formatos';

// o WhatsApp à mão, discreto e na cor da casa; na página inicial só aparece depois
// da abertura, que já tem o seu (fora do painel, da /bio e do convite)
export default function BotaoZap() {
  const caminho = usePathname() || '';
  const { estudio } = useVitrine();
  const inicio = caminho === '/' || caminho === '';
  const [mostrar, setMostrar] = useState(!inicio);
  useEffect(() => {
    if (!inicio) return setMostrar(true);
    const f = () => setMostrar(window.scrollY > window.innerHeight * 0.8);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, [inicio]);
  if (/\/(painel|bio|convite)\/?$/.test(caminho)) return null;
  return (
    <a
      href={linkOrcamento(estudio)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com o Fosco no WhatsApp"
      className={`fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-ambar/50 bg-noite/90 text-ambar-claro shadow-[0_10px_24px_-8px_rgba(0,0,0,.9)] transition duration-300 hover:border-ambar hover:bg-ambar hover:text-noite ${
        mostrar ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <IconeZap width={22} height={22} />
    </a>
  );
}
