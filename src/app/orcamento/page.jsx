import Pagina from '@/components/Pagina';
import FormOrcamento from './FormOrcamento';

export const metadata = {
  title: 'Pedir orçamento',
  description: 'Conte a sua ideia de tattoo: onde vai ser, o tamanho e uma referência. O Fosco responde pelo WhatsApp com o valor.',
};

export default function Orcamento() {
  return (
    <Pagina estilo={{ '--luz-x': '15%', '--luz-y': '10%' }}>
      <FormOrcamento />
    </Pagina>
  );
}
