import Cabecalho from '@/components/Cabecalho';
import Rodape from '@/components/Rodape';
import Abertura from '@/components/inicio/Abertura';
import Equipe from '@/components/inicio/Equipe';
import Trabalhos from '@/components/inicio/Trabalhos';
import { Indique, Fidelidade } from '@/components/inicio/Programa';
import { ChamadaCuidados, ChamadaOrcamento, Comunidade } from '@/components/inicio/Chamadas';

export default function Inicio() {
  return (
    <>
      <Cabecalho />
      <main>
        <Abertura />
        <Equipe />
        <Trabalhos />
        <Indique />
        <Fidelidade />
        <ChamadaCuidados />
        <Comunidade />
        <ChamadaOrcamento />
      </main>
      <Rodape />
    </>
  );
}
