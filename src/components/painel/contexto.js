'use client';
import { createContext, useContext } from 'react';
import { linkIndicacao, numero, primeiroNome, reais, urlSite } from '@/lib/formatos';

export const PainelCtx = createContext(null);
export const usePainel = () => useContext(PainelCtx);

// contas que o painel faz com as regras do programa
export function contas(c, programa) {
  const ppp = Number(programa.percentual_por_ponto) || 1;
  const max = Number(programa.desconto_maximo) || 50;
  const n = Math.max(1, Number(programa.fidelidade_sessoes) || 6);
  const desconto = Math.max(0, Math.min(max, (c.pontos || 0) * ppp));
  const sf = c.sessoes_fidelidade || 0;
  const premios = Math.max(0, Math.floor(sf / n) - (c.premios_usados || 0));
  const noCartao = sf % n;
  return { desconto, premios, noCartao, faltam: n - noCartao, n };
}

// valores que entram nas {chaves} dos modelos de mensagem
export function variaveis(c, estudio, programa, extra = {}) {
  const k = contas(c, programa);
  return {
    nome: primeiroNome(c.nome),
    pontos: c.pontos ?? 0,
    desconto: numero(k.desconto),
    link: c.codigo ? linkIndicacao(c.codigo) : urlSite('/cadastro/'),
    site: urlSite('/'),
    link_entrar: urlSite('/entrar/'),
    link_cuidados: urlSite('/cuidados/'),
    faltam: `${k.faltam} ${k.faltam === 1 ? 'sessão' : 'sessões'}`,
    premio: numero(programa.fidelidade_premio),
    estudio: estudio.nome_curto || 'Fosco',
    pix: estudio.chave_pix || '(chave pix)',
    ...extra,
  };
}

export const reaisSemSimbolo = (v) => reais(v, true).replace(/^R\$\s?/, '');
