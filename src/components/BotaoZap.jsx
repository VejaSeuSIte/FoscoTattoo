'use client';
import { usePathname } from 'next/navigation';
import { IconeZap } from './Icones';
import { useVitrine } from '@/lib/vitrine';
import { linkOrcamento } from '@/lib/formatos';

// o botão do WhatsApp sempre à mão (fora do painel e da /bio, que já têm o seu)
export default function BotaoZap() {
  const caminho = usePathname() || '';
  const { estudio } = useVitrine();
  if (/\/(painel|bio)\/?$/.test(caminho)) return null;
  return (
    <a
      href={linkOrcamento(estudio)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com o Fosco no WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_10px_24px_-8px_rgba(0,0,0,.8)] transition-transform hover:scale-105"
    >
      <IconeZap width={28} height={28} />
    </a>
  );
}
