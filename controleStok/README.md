
  # Website para Controle de Estoque

  This is a code bundle for Website para Controle de Estoque. The original project is available at https://www.figma.com/design/c7KmutXQhGHvtG9h64qUU3/Website-para-Controle-de-Estoque.

  ## Running the code (local)

  1. Instale dependências:

     ```powershell
     npm i
     ```

  2. Rode o servidor de desenvolvimento:

     ```powershell
     npm run dev
     ```

  ## Preparar para GitHub & Vercel

  - Crie um repositório no GitHub e empurre o projeto:

    ```powershell
    git init
    git add .
    git commit -m "Initial import from Figma bundle"
    git branch -M main
    git remote add origin <URL-DO-REPO>
    git push -u origin main
    ```

  - Configure variáveis de ambiente na Vercel (Settings -> Environment Variables) com as chaves listadas em `.env.example`.

  - No painel da Vercel, aponte o repositório e use o comando de build padrão:

    Build Command: `npm run build`

    Output Directory: `build`

  ## Notas

  - Se o build falhar na Vercel por versões de dependências, ajuste `package.json` ou as versões em `devDependencies`.
  - Se você usar o workspace `src` como pacote (há outro `package.json` dentro de `src/`), verifique se precisa empurrar do root ou do `src` seguindo a estrutura do repositório.
