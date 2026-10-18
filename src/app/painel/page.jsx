import Redireciona from './Redireciona';

export const metadata = { title: 'Painel do estúdio', robots: { index: false, follow: false } };

// o painel mudou para /admin; links antigos continuam funcionando
export default function PaginaPainel() {
  return <Redireciona />;
}
