# RaceMetrics: configuração de autenticação

Este documento descreve a configuração externa necessária para ativar a autenticação real do RaceMetrics. O repositório contém a integração, mas não contém credenciais de projeto. Isso é intencional.

## 1. Criar o projeto Supabase

1. Crie um projeto no Supabase.
2. No painel do projeto, obtenha o Project URL e a Publishable key.
3. Localmente, crie `.env.local` a partir de `.env.example`:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

Nunca coloque `service_role`, chaves administrativas ou tokens privados nessas variáveis do frontend.

## 2. Configurar e-mail e senha

Em Authentication > Providers, habilite Email.

Recomendação para produção:
- exigir confirmação de e-mail;
- aplicar uma política de senha forte;
- manter proteção contra tentativas excessivas;
- não revelar se um e-mail existe durante recuperação de senha.

A interface do RaceMetrics já usa mensagens genéricas para evitar enumeração de contas.

## 3. Configurar Google

Em Authentication > Providers > Google:

1. crie/configure o OAuth Client no Google Cloud;
2. informe no Supabase as credenciais do provedor;
3. use exatamente a callback URL exibida pelo Supabase;
4. configure no provedor somente as URLs de redirecionamento necessárias.

No RaceMetrics, o `redirectTo` retorna para a origem atual da aplicação. Essa origem deve estar cadastrada na allowlist de Redirect URLs do Supabase.

## 4. Configurar Microsoft

Em Authentication > Providers > Azure:

1. registre a aplicação no Microsoft Entra ID;
2. configure o redirect URI fornecido pelo Supabase;
3. informe client ID e client secret no painel do Supabase;
4. restrinja os redirect URIs ao conjunto realmente utilizado.

O frontend usa o provider `azure` do Supabase.

## 5. URL da aplicação

Em Authentication > URL Configuration:

- defina o Site URL para a origem oficial do RaceMetrics;
- adicione apenas as origens necessárias em Redirect URLs;
- inclua a origem local usada no desenvolvimento, se necessário;
- não use curingas amplos em produção.

Exemplo local: `http://localhost:5173`

O domínio de produção deve ser o domínio real utilizado no deploy.

## 6. Banco de dados e RLS

A migration em `supabase/migrations/202609110001_private_user_data.sql` cria:

- `profiles`
- `preferences`
- `favorites`
- `saved_comparisons`

Todas possuem Row Level Security habilitado. As políticas usam `auth.uid()` para restringir leitura e escrita ao proprietário.

O bloqueio visual da aplicação não é a fronteira de segurança. A autorização real acontece no banco.

Antes de produção, executar testes de dois usuários independentes para:

- leitura cruzada;
- alteração cruzada;
- exclusão cruzada;
- manipulação de IDs;
- sessão expirada;
- usuário não autenticado.

## 7. Deploy

No provedor de deploy, configure somente:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Depois de configurar as variáveis, faça um novo build.

Não commitar `.env.local`, tokens OAuth ou qualquer segredo administrativo.

## 8. Checklist antes de liberar autenticação

- [ ] confirmação de e-mail validada;
- [ ] Google OAuth validado;
- [ ] Microsoft OAuth validado;
- [ ] URLs de callback restritas;
- [ ] recovery não revela existência de conta;
- [ ] logout invalida a sessão no fluxo esperado;
- [ ] migration aplicada;
- [ ] RLS testado com dois usuários;
- [ ] nenhum segredo administrativo no bundle;
- [ ] testes de segurança automatizados para os casos críticos.
