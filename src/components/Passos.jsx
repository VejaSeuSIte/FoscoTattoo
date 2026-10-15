// Passos lado a lado (no celular também): ícone num círculo com o número, título curto
// e uma linha de texto. Uma linha tracejada liga os círculos.
export default function Passos({ itens, className = '' }) {
  return (
    <ol className={`relative grid grid-cols-3 gap-3 sm:gap-6 ${className}`}>
      <span aria-hidden="true" className="absolute left-[16.7%] right-[16.7%] top-[26px] border-t border-dashed border-ambar/45 sm:top-[32px]" />
      {itens.map(({ Icone, titulo, texto }, i) => (
        <li key={titulo} className="relative flex flex-col items-center text-center">
          <span className="relative flex h-[52px] w-[52px] items-center justify-center rounded-full border border-ambar/55 bg-noite text-ambar sm:h-16 sm:w-16">
            <Icone width={22} height={22} />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ambar text-[11px] font-bold text-noite">{i + 1}</span>
          </span>
          <h3 className="mt-3 font-corpo text-[13px] font-extrabold uppercase leading-tight tracking-[0.04em] text-osso sm:text-[15px]">{titulo}</h3>
          <p className="mt-1.5 text-[12.5px] leading-snug text-osso-2 sm:text-[14.5px]">{texto}</p>
        </li>
      ))}
    </ol>
  );
}
