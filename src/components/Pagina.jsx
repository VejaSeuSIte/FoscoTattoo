import Cabecalho from './Cabecalho';
import Rodape from './Rodape';

// moldura das páginas internas: cabeçalho fixo, parede ao fundo e rodapé
export default function Pagina({ children, parede = true, rodape = true, estilo }) {
  return (
    <>
      <Cabecalho solido />
      <main className={`${parede ? 'parede parede-topo' : 'bg-noite'} min-h-[100svh] pb-20 pt-[100px]`} style={estilo}>
        {children}
      </main>
      {rodape && <Rodape />}
    </>
  );
}
