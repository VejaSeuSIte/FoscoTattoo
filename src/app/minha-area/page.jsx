import Pagina from '@/components/Pagina';
import Area from './Area';

export const metadata = { title: 'Minha área', robots: { index: false } };

export default function MinhaArea() {
  return (
    <Pagina estilo={{ '--luz-x': '80%', '--luz-y': '8%' }}>
      <Area />
    </Pagina>
  );
}
