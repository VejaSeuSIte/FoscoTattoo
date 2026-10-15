import Cabecalho from '@/components/Cabecalho';
import Rodape from '@/components/Rodape';
import Abertura from '@/components/inicio/Abertura';
import Vagas from '@/components/inicio/Vagas';
import Equipe from '@/components/inicio/Equipe';
import Trabalhos from '@/components/inicio/Trabalhos';
import { Indique, Fidelidade } from '@/components/inicio/Programa';
import { ChamadaOrcamento, Comunidade } from '@/components/inicio/Chamadas';

export default function Inicio() {
  return (
    <>
      <Cabecalho />
      <main>
        <Abertura />
        <Vagas />
        <Equipe />
        <Trabalhos />
        <Indique />
        <Fidelidade />
        <Comunidade />
        <ChamadaOrcamento />
      </main>
      <Rodape />
    </>
  );
}
