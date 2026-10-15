import Pagina from '@/components/Pagina';
import Cuidados from './Cuidados';

export const metadata = {
  title: 'Como cuidar da sua tattoo',
  description: 'Como cuidar da sua tattoo: o que fazer e o que evitar nos primeiros dias.',
  openGraph: {
    title: 'Como cuidar da sua tattoo · Fosco',
    description: 'O que fazer e o que evitar nos primeiros dias.',
    images: [{ url: 'og/cuidados.jpg', width: 1200, height: 630, alt: 'Como cuidar da sua tattoo' }],
  },
};

export default function PaginaCuidados() {
  return (
    <Pagina estilo={{ '--luz-x': '75%', '--luz-y': '12%' }}>
      <Cuidados />
    </Pagina>
  );
}
