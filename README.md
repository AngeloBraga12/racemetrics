# RaceMetrics

Workspace de análise de automobilismo criado para transformar dados de corridas em comparações e insights estruturados.

O produto foi concebido para tratar automobilismo como domínio de negócio, e não como apenas mais um dashboard genérico. A interface considera classificação, gaps, voltas, setores, stints, qualifying e ritmo de corrida.

## Produto

Áreas principais:

- Dashboard
- Explore
- Compare
- Analytics

Evoluções planejadas:

- Perfis de pilotos e equipes
- Circuit Explorer
- Race Insights
- Favoritos e comparações salvas
- Race Replay
- What If?
- AI Race Analyst

## Arquitetura e segurança

- TypeScript strict.
- Componentes orientados ao domínio.
- Dados de automobilismo separados da apresentação.
- Autenticação isolada das regras de negócio.
- Autorização server-side para recursos privados.
- Validação de entrada.
- Testes de segurança para fluxos críticos.
- Acessibilidade e responsividade como requisitos de release.
- CI antes de merge.
- Nenhum dado fictício é apresentado como resultado oficial ou dado ao vivo.

## Direção visual

O projeto evita o padrão de dashboard genérico produzido por geradores: excesso de cards, gradientes decorativos, gráficos sem propósito e métricas inventadas não fazem parte do produto.

Consulte `docs/DESIGN.md` para as regras visuais.

## Documentação

- `docs/ARCHITECTURE.md` — limites e fluxo do sistema
- `docs/SECURITY.md` — autenticação e segurança
- `docs/DESIGN.md` — linguagem visual
- `docs/ROADMAP.md` — roadmap
- `docs/DEVELOPMENT_LOG.md` — histórico técnico
- `CONTRIBUTING.md` — padrões de contribuição

## Status

**v0.1 · Foundation**

A base atual estabelece a aplicação React + TypeScript + Vite, o shell do dashboard e a direção visual específica de automobilismo. Os valores exibidos nesta etapa são placeholders de interface e não representam resultados oficiais.

As etapas seguintes incluem autenticação, dados reais, backend, banco de dados e hardening de produção.

## Autor

**Angelo Braga**  
Desenvolvedor Web / Front-end · Técnico em Informática

- GitHub: https://github.com/AngeloBraga12
- Portfólio: https://portifolio-angelobraga.netlify.app/
- LinkedIn: https://www.linkedin.com/in/angelo-braga-5747b4192/
