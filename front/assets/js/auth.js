/**
 * ==========================================================================
 * AUTH — CADASTRO, LOGIN, SESSÃO (JWT) — STARDEV
 * ==========================================================================
 * Consome os endpoints do back-end (server.js):
 *   POST /cadastro         { nome, email, senha, telefone }
 *   POST /login            { email, senha } -> { token, nivel }
 *   POST /verificarEmail   { email } -> { existe }
 *   PUT  /recuperarSenha   { email, novaSenha }
 *   GET  /usuario          (protegido) -> dados do usuário logado
 * ==========================================================================
 */

function decodificarPayloadJwt(token) {
  try {
    const partes = String(token || "").split(".");
    if (partes.length !== 3) return null;
    const base64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const Auth = {
  salvarSessao(token, nivel) {
    localStorage.setItem(STARDEV_CONFIG.CHAVE_TOKEN, token);
    localStorage.setItem(STARDEV_CONFIG.CHAVE_USUARIO, JSON.stringify({ nivel }));
  },
  token() {
    return localStorage.getItem(STARDEV_CONFIG.CHAVE_TOKEN);
  },
  limparSessao() {
    localStorage.removeItem(STARDEV_CONFIG.CHAVE_TOKEN);
    localStorage.removeItem(STARDEV_CONFIG.CHAVE_USUARIO);
  },
  nivel() {
    try {
      return JSON.parse(localStorage.getItem(STARDEV_CONFIG.CHAVE_USUARIO))?.nivel || "U";
    } catch {
      return "U";
    }
  },
  logado() {
    const token = this.token();
    if (!token) return false;
    const payload = decodificarPayloadJwt(token);
    if (payload && typeof payload.exp === "number" && Date.now() >= payload.exp * 1000) {
      this.limparSessao();
      return false;
    }
    return true;
  },
  sair() {
    this.limparSessao();
    window.location.href = "login.html";
  },
  /** Protege páginas da intranet: redireciona para o login se não houver sessão */
  exigirLogin() {
    if (!this.logado()) {
      window.location.href = "login.html";
    }
  },
  /** Protege páginas exclusivas do nível Administrador ("A") */
  exigirAdmin() {
    this.exigirLogin();
    if (this.nivel() !== "A") {
      window.location.href = "area-aluno.html";
    }
  },
  async cabecalhos() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token()}`,
    };
  },
};

/** Envia o formulário de cadastro para o back-end */
async function enviarCadastro({ nome, email, senha, telefone }) {
  const resp = await fetch(apiUrl("/cadastro"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha, telefone }),
  });
  return resp.json();
}

/** Envia o formulário de login e guarda o token retornado */
async function enviarLogin({ email, senha }) {
  const resp = await fetch(apiUrl("/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
  const dados = await resp.json();
  if (dados.token) {
    Auth.salvarSessao(dados.token, dados.nivel);
  }
  return dados;
}

/** Confere no back-end se um e-mail já possui cadastro */
async function checarEmailExiste(email) {
  const resp = await fetch(apiUrl("/verificarEmail"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const dados = await resp.json();
  return !!dados.existe;
}

/** Redefine a senha de um e-mail existente (fluxo "esqueci minha senha") */
async function enviarRecuperarSenha({ email, novaSenha }) {
  const resp = await fetch(apiUrl("/recuperarSenha"), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, novaSenha }),
  });
  return resp.json();
}

/** Busca os dados do usuário logado */
async function buscarUsuarioLogado() {
  const resp = await fetch(apiUrl("/usuario"), {
    headers: await Auth.cabecalhos(),
  });
  if (resp.status === 401 || resp.status === 403 || resp.status === 404) {
    Auth.sair();
    return null;
  }
  if (!resp.ok) {
    return null;
  }
  return resp.json();
}
