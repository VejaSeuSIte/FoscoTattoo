import Cabecalho from '@/components/Cabecalho';
import Rodape from '@/components/Rodape';
import Abertura from '@/components/inicio/Abertura';
import Equipe from '@/components/inicio/Equipe';
import Trabalhos from '@/components/inicio/Trabalhos';
import Quadrinhos from '@/components/inicio/Quadrinhos';
import Estudio from '@/components/inicio/Estudio';
import { Indique, Fidelidade } from '@/components/inicio/Programa';
import { ChamadaCuidados, ChamadaOrcamento, Comunidade, Dicionario } from '@/components/inicio/Chamadas';

export default function Inicio() {
  return (
    <>
      <Cabecalho />
      <main>
        <Abertura />
        <Equipe />
        <Trabalhos />
        <Quadrinhos />
        <Indique />
        <Fidelidade />
        <Estudio />
        <ChamadaCuidados />
        <Dicionario />
        <Comunidade />
        <ChamadaOrcamento />
      </main>
      <Rodape />
    </>
  );
}
