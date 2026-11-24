# StarDev Mobile

Versão React Native (Expo) da plataforma StarDev — cursos de TI em vídeo, do
zero ao avançado. Este app é o front-end mobile; ele consome o **mesmo
back-end Node/Express** do projeto original (pasta `back/` do `.zip` enviado),
sem nenhuma alteração no servidor ou no banco de dados.

## Identidade visual preservada

| Uso | Cor |
|---|---|
| Primária (fundo) | `#f2e8e0` |
| Secundária (header/textos) | `#814456` |
| Destaque | `#eace76` |
| Terciária (superfícies) | `#db9c91` |
| Reserva (acentos) | `#a56b44` |
| Botões | `#707039` |
| Letras | `#000000` |

Fontes: **Josefin Sans** (títulos/corpo) e **JetBrains Mono** (labels/eyebrows),
carregadas via `@expo-google-fonts`, iguais ao CSS original.

## Estrutura do projeto

```
StarDevMobile/
├── App.js                     # entrypoint, carrega fontes e providers
├── app.json                   # config Expo/Android/iOS
├── src/
│   ├── theme/                 # cores e tipografia (identidade visual)
│   ├── config/api.js          # URL base da API (AJUSTAR conforme abaixo)
│   ├── services/               # chamadas HTTP, uma por domínio (auth, conteúdo, admin)
│   ├── context/AuthContext.js  # sessão JWT persistida (AsyncStorage)
│   ├── navigation/             # Auth Stack + Bottom Tabs + Trilhas Stack
│   ├── components/             # Button, Input, Card, VideoPlayer, etc.
│   ├── screens/                 # telas do app
│   └── utils/                  # validadores e máscaras (espelham o back-end)
```

## Funcionalidades implementadas

- **Boas-vindas** (equivalente ao `index.html`): apresentação da StarDev e das 3 trilhas.
- **Cadastro** (RF01, RF04): nome, email, telefone, senha — com as mesmas regras de senha do back-end.
- **Login** (RF02) com JWT persistido entre sessões.
- **Recuperar senha** (fluxo em 2 etapas: verificar email → nova senha).
- **Trilhas** (RF05, RF06): lista as 12 disciplinas com contagem de aulas.
- **Matéria + Player**: lista as aulas de uma disciplina e reproduz o vídeo do YouTube embutido.
- **Fallback amigável de vídeo (RNF03)**: se o link não tiver ID válido, ou o
  WebView falhar ao carregar (YouTube fora do ar / vídeo removido), o app
  mostra "Vídeo temporariamente indisponível" em vez de erro cru.
- **Perfil**: editar nome/email/telefone/bio, trocar foto (galeria), trocar senha, sair.
- **Painel administrativo** (visível só quando `nivel === "A"`): cadastrar
  disciplina, cadastrar videoaula, listar/excluir feedbacks recebidos pelo
  formulário de contato.

Todas as senhas continuam sendo criptografadas **no back-end** (RNF01) — o app
mobile nunca lida com hashing, só envia a senha em texto plano por HTTPS/HTTP
para o servidor, exatamente como o front-end web original fazia.

## Pré-requisitos

- Node.js 18 ou 20 LTS
- `npm install -g expo-cli` (opcional; `npx expo` já funciona sem instalar global)
- App **Expo Go** no celular (Android/iOS) **ou** Android Studio com um
  emulador configurado
- O back-end do projeto original rodando (`back/server.js`, `npm install && npm start`
  ou `node server.js`, normalmente na porta 3000)

## Passo a passo — Expo Go (celular físico)

1. Instale as dependências:
   ```bash
   cd StarDevMobile
   npm install
   ```
2. Descubra o IP local da sua máquina (Windows: `ipconfig`, Mac/Linux: `ifconfig`
   ou `ip a`), algo como `192.168.0.15`.
3. Abra `src/config/api.js` e troque:
   ```js
   API_BASE: "http://SEU_IP_AQUI:3000",
   ```
4. Garanta que o back-end (`back/server.js`) está rodando e que o firewall
   permite conexões na porta 3000.
5. Celular e computador precisam estar na **mesma rede Wi-Fi**.
6. Rode:
   ```bash
   npx expo start
   ```
7. Escaneie o QR code com o app Expo Go.

## Passo a passo — Android Studio (emulador)

1. Abra o Android Studio → **Device Manager** → crie/inicie um emulador (AVD).
2. Em `src/config/api.js`, use o endereço especial do emulador para acessar o
   `https://stardev-d20v.onrender.com` da sua máquina:
   ```js
   API_BASE: "http://10.0.2.2:3000",
   ```
3. Com o back-end rodando localmente, execute:
   ```bash
   npm install
   npx expo start --android
   ```
   Isso builda um development build e abre automaticamente no emulador ativo.

### Gerando um APK/AAB de verdade (build nativo)

Para compilar um instalável (fora do Expo Go), use o **EAS Build**:
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```
Isso gera um `.apk` (perfil `preview`) que pode ser instalado direto no
emulador do Android Studio ou em qualquer aparelho Android, sem depender do
Expo Go. Para produção, use o profile `production` (gera `.aab` para a Play Store).

## Dependências adicionadas (além do Expo padrão)

| Pacote | Motivo |
|---|---|
| `@react-navigation/native`, `native-stack`, `bottom-tabs` | Navegação (stack de auth, tabs do app, stack de trilhas) |
| `@react-native-async-storage/async-storage` | Persistir o token JWT entre sessões (equivalente ao `localStorage`) |
| `react-native-webview` | Embutir o player do YouTube nas telas de aula |
| `expo-image-picker` | Trocar foto de perfil a partir da galeria |
| `expo-font` + `@expo-google-fonts/josefin-sans` + `@expo-google-fonts/jetbrains-mono` | Fidelidade tipográfica com o site |
| `@expo/vector-icons` | Ícones (já incluso no Expo, sem custo extra) |

## O que NÃO foi alterado

- O back-end (`back/server.js`, rotas, JWT, bcrypt, multer) continua o mesmo.
- O banco de dados (`banco/bancoAtualizadooo.sql`) continua o mesmo.
- As regras de negócio (RF01–RF06, RNF01–RNF05) foram replicadas fielmente no
  cliente mobile, mas a validação definitiva continua no servidor.

## Próximos passos sugeridos (backlog)

- Exercícios com feedback automático dentro do app (mencionado no escopo original).
- Editor de código online / "complete o código" (Área de prática integrada).
- Notificações push quando uma nova videoaula for publicada.
- Modo offline com cache das listas de disciplinas/aulas.
