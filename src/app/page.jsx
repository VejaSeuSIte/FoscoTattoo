import Cabecalho from '@/components/Cabecalho';
import Rodape from '@/components/Rodape';
import Abertura from '@/components/inicio/Abertura';
import Equipe from '@/components/inicio/Equipe';
import Trabalhos from '@/components/inicio/Trabalhos';
import Estudio from '@/components/inicio/Estudio';
import Avaliacoes from '@/components/inicio/Avaliacoes';
import { Indique } from '@/components/inicio/Programa';
import { ChamadaCuidados, ChamadaOrcamento, Comunidade } from '@/components/inicio/Chamadas';

// ocultos por pedido dele (15/10), prontos para voltar: Quadrinhos («Do rascunho
// à pele») e Fidelidade, de components/inicio
export default function Inicio() {
  return (
    <>
      <Cabecalho logoSoAoRolar />
      <main>
        <Abertura />
        <Indique />
        <Equipe />
        <Estudio />
        <Avaliacoes />
        <ChamadaCuidados />
        <Trabalhos />
        <Comunidade />
        <ChamadaOrcamento />
      </main>
      <Rodape />
    </>
  );
}
