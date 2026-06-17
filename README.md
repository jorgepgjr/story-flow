# Story Flow

Um aplicativo fullstack para geração e gestão de roteiros e histórias criativas, utilizando **React (Vite)** no frontend, **Gemini AI** para geração de conteúdo, **Supabase (PostgreSQL)** como banco de dados e **Vercel Serverless Functions** para o backend.

---

## 🛠 Pré-requisitos

Certifique-se de ter o [Node.js](https://nodejs.org/) instalado em sua máquina.

### Variáveis de Ambiente
Antes de rodar a aplicação, crie um arquivo chamado `.env` ou `.env.local` na raiz do projeto e configure as seguintes chaves obrigatórias:

```env
GEMINI_API_KEY="sua_chave_do_gemini"
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sua_chave_anon_do_supabase"
```

---

## 🚀 Como Rodar Localmente

Como o nosso projeto utiliza funções Serverless na pasta `/api`, não podemos rodar o comando padrão do Vite (`npm run dev`), pois ele não ligará o servidor backend. 

Para rodar o Frontend e o Backend localmente de forma integrada:

1. Instale todas as dependências do projeto:
   ```bash
   npm install
   ```
2. Inicialize o servidor de desenvolvimento utilizando a CLI oficial da Vercel:
   ```bash
   npx vercel dev
   ```
   *(Caso seja o seu primeiro uso, a Vercel pedirá para você fazer login pelo navegador e confirmar algumas perguntas rápidas com `Y`)*.

3. Acesse a aplicação no link local gerado no terminal (geralmente `http://localhost:3000`).

---

## ☁️ Como Fazer o Deploy (Colocar no Ar)

Você pode publicar a sua aplicação rapidamente nos servidores da Vercel pelo próprio terminal da sua máquina, sem precisar de configurações avançadas ou de versionamento via GitHub.

1. Pare o seu servidor local (`Ctrl + C`).
2. Digite o seguinte comando para gerar o *build* e empurrar sua aplicação para a Produção:
   ```bash
   npx vercel --prod
   ```
3. Aguarde o empacotamento finalizar. O terminal imprimirá a **URL pública** e oficial da sua aplicação.

**Atenção:** Como a nuvem da Vercel não tem acesso ao seu arquivo `.env` local, lembre-se de ir no painel do seu projeto no site da Vercel ([vercel.com/dashboard](https://vercel.com/dashboard)) e adicionar as variáveis `GEMINI_API_KEY`, `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` na aba **Settings > Environment Variables** para que a aplicação consiga acessar a IA e o Banco de Dados.
