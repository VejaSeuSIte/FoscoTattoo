# Fosco Tattoo Studio

Site do estúdio Fosco (Recife): vitrine (equipe, vagas do mês, trabalhos), pedido de orçamento,
cadastro com link de indicação, cartão fidelidade, área do cliente e painel do estúdio.

- Site estático (Next.js exportado), publicado no GitHub Pages a cada push na `main`.
- Banco, login e arquivos no Supabase (projeto «Kitsune», tabelas com prefixo `fosco_`).
- `supabase/migrations/` tem o esquema; `supabase/functions/` tem as duas funções do servidor
  (`fosco-cadastro` cria a conta do cliente; `fosco-admin` faz o que precisa da chave de serviço).

## Páginas

| Endereço | O que é |
|---|---|
| `/` | página inicial |
| `/bio/` | página de links para a bio do Instagram |
| `/orcamento/` | pedido de orçamento com fotos de referência |
| `/cadastro/?i=codigo` | cadastro pelo link de indicação |
| `/entrar/`, `/minha-area/` | login (CPF + senha) e área do cliente |
| `/painel/` | painel do estúdio (e-mail + senha de quem está em `fosco_admins`) |

## Domínio próprio

1. Em «Settings → Secrets and variables → Actions → Variables», crie `DOMINIO` com o domínio (ex.: `foscotattoo.com.br`).
2. Acrescente `https://<domínio>` na lista `ORIGENS` de `supabase/functions/_shared/comum.ts` e publique as duas funções de novo.
3. Aponte o DNS para o GitHub Pages e rode o fluxo «Publicar no GitHub Pages».

## Rodar local

```
npm install
npx next build && node scripts/servir.mjs 3000
```

Scripts de apoio: `scripts/tijolos.mjs` (parede em vetor), `scripts/og.cjs` (imagens de prévia de link),
`scripts/fotos-varias.cjs` (fotos de tela para conferir o visual), `scripts/teste-api.mjs` (teste da API).
