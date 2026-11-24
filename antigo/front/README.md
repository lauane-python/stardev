# StarDev — Front-end

Front-end completo da plataforma **StarDev**, feito em **HTML + CSS + JavaScript puro** (sem build/bundler), pronto para conversar com o back-end (Node/Express) que já está no `.zip` do projeto.

## O que tem aqui

| Página                  | Descrição                                                                 |
|-------------------------|----------------------------------------------------------------------------|
| `index.html`             | Home pública: apresentação, trilhas, "como funciona", equipe e contato    |
| `cadastro.html`          | Criar conta — com **máscara automática de telefone** e força de senha    |
| `login.html`             | Login com **olho de mostrar/ocultar senha**                              |
| `recuperar-senha.html`   | Fluxo "esqueci minha senha" em 2 etapas                                   |
| `area-aluno.html`        | **Intranet do aluno**: trilhas, videoaulas com player e perfil            |
| `admin.html`             | Painel administrativo (nível `A`): disciplinas, videoaulas e feedbacks   |

Um **chatbot flutuante ("Dev Mentor")** aparece em todas as páginas e conversa com o back-end, que por sua vez usa o **Ollama** para gerar as respostas.

## Como rodar

### 1) Banco de dados
Suba o MySQL e importe um dos arquivos em `banco/` (ex: `bancoAtualizadooo.sql`) no banco `stardev`.

### 2) Back-end
```bash
cd back
npm install
```
Confirme o arquivo `.env` (usuário/senha do banco) e rode:
```bash
npm run dev   # ou: node server.js
```
O servidor sobe em `https://stardev-d20v.onrender.com` (ou na porta definida em `PORT`).

### 3) Ollama (chatbot)
```bash
ollama serve
ollama pull llama3
```
O modelo e a URL usados ficam em `back/chatback/config/chatConfig.js`.

### 4) Front-end
Esta pasta é 100% estática — não precisa de build. Duas formas de abrir:

- **Mais simples:** clique duas vezes em `index.html`.
- **Recomendado** (evita eventuais bloqueios de CORS/cache do navegador): sirva com qualquer servidor estático, por exemplo:
  ```bash
  npx serve .
  # ou, com Python:
  python3 -m http.server 5500
  ```

Se o back-end estiver em outro endereço (ex: IP da intranet do laboratório, como `https://stardev-d20v.onrender.com`), ajuste em `assets/js/config.js`:
```js
API_BASE: "https://stardev-d20v.onrender.com",
```

## Recursos implementados

- **Paleta oficial da marca** aplicada via variáveis CSS em `assets/css/styles.css` (`--cor-primaria`, `--cor-secundaria`, `--cor-destaque`, `--cor-terciaria`, `--cor-reserva`, `--cor-botoes`).
- **Automação de telefone**: ao digitar, o campo formata sozinho como `+55 (18) 99689-0559`; por baixo, só os dígitos são enviados ao back-end (que exige exatamente isso).
- **"Olho" nas senhas**: em todo campo de senha do site (cadastro, login, recuperação, troca de senha) há um botão de mostrar/ocultar.
- **Checklist + barra de força de senha**, seguindo a mesma regra do back-end (8+ caracteres, maiúscula, minúscula, número e caractere especial).
- **Chatbot "Dev Mentor"**: janela estilo terminal, conectado a `POST /chatback/chat`, que já é a rota que fala com o Ollama.
- **Intranet protegida por JWT**: `area-aluno.html` e `admin.html` verificam o token salvo no navegador e redirecionam para o login se não houver sessão; `admin.html` também confere o nível (`A`).
- **Vídeo com fallback amigável** (RNF03): se o link do YouTube for inválido ou o player não carregar, aparece a mensagem "Vídeo temporariamente indisponível" em vez de erro quebrado.
- **Responsivo**: menu hambúrguer no site público e sidebar retrátil na intranet, para telas menores.
- Todo o JS está comentado, separado por responsabilidade (`auth.js`, `mask.js`, `chatbot.js`, `area-aluno.js`, `admin.js`...), facilitando manutenção por outros desenvolvedores (RNF05).

## Estrutura de pastas

```
stardev-frontend/
├── index.html
├── login.html
├── cadastro.html
├── recuperar-senha.html
├── area-aluno.html
├── admin.html
├── manifest.json
└── assets/
    ├── css/
    │   ├── styles.css      (design system + todas as páginas)
    │   └── chatbot.css     (widget da Dev Mentor)
    ├── js/
    │   ├── config.js       (URL do back-end)
    │   ├── ui.js            (toasts, loader, menu, scroll reveal)
    │   ├── mask.js           (máscara de telefone + olho/força de senha)
    │   ├── auth.js           (login, cadastro, sessão JWT)
    │   ├── main.js            (hero animado + contato — index.html)
    │   ├── cadastro.js, login.js, recuperar-senha.js
    │   ├── area-aluno.js      (intranet do aluno)
    │   ├── admin.js           (painel administrativo)
    │   └── chatbot.js         (widget Dev Mentor)
    └── icons/                 (ícones já existentes no projeto)
```

## Observação sobre segurança

Este projeto é um trabalho técnico/acadêmico. Antes de publicar em produção de verdade, vale revisar: trocar o `SECRET` do JWT (hoje fixo em `server.js`) por uma variável de ambiente, adicionar HTTPS e validar uploads de foto no back-end.
