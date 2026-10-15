import { urlFoto, instagramUrl, arroba } from '@/lib/formatos';

// retrato emoldurado, pendurado num prego da parede
export default function Quadro({ artista, giro = 0, placa = true, prioridade = false, className = '' }) {
  const { nome, funcao, instagram, foto } = artista;
  const conteudo = (
    <>
      <div className="quadro quadro-prego" style={{ transform: `rotate(${giro}deg)` }}>
        <div className="quadro-passe aspect-[3/4] overflow-hidden">
          <img
            src={urlFoto(foto)}
            alt={nome ? `Retrato de ${nome}` : 'Retrato de alguém da equipe do Fosco'}
            loading={prioridade ? 'eager' : 'lazy'}
            decoding="async"
            className="object-[50%_14%]"
          />
        </div>
      </div>
      {placa && (nome || funcao) && (
        <div className="placa mx-auto mt-5 w-fit max-w-full rounded-[3px] px-4 py-1.5 text-center">
          {nome && <div className="font-gotica text-[19px] font-bold leading-tight">{nome}</div>}
          <div className="font-mono text-[9.5px] uppercase tracking-[0.24em] opacity-80">
            {funcao}
            {instagram ? ` · ${arroba(instagram)}` : ''}
          </div>
        </div>
      )}
    </>
  );
  const classe = `grupo-quadro block pt-10 ${className}`;
  return instagram ? (
    <a href={instagramUrl(instagram)} target="_blank" rel="noopener noreferrer" className={classe}>
      {conteudo}
    </a>
  ) : (
    <div className={classe}>{conteudo}</div>
  );
}
