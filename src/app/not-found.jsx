import Link from 'next/link';
import Marca from '@/components/Marca';

export default function NaoAchou() {
  return (
    <main className="parede parede-topo flex min-h-[100svh] flex-col items-center justify-center px-4 text-center">
      <Marca className="h-32 w-auto text-osso" titulo="" />
      <h1 className="titulo mt-6 text-[64px]">Página sumiu</h1>
      <p className="mt-3 text-[17px] text-osso-2">Esse endereço não existe mais, ou nunca existiu.</p>
      <Link href="/" className="botao mt-8">
        Voltar pro início
      </Link>
    </main>
  );
}
