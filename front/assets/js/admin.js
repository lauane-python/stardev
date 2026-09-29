/**
 * ==========================================================================
 * ADMIN.JS — painel administrativo (nível "A")
 * ==========================================================================
 * Endpoints:
 *   POST   /CadastroAulas     (protegido, nivel A)
 *   GET    /aulas
 *   GET    /videoaulas
 *   POST   /videoaulas        (protegido)
 *   PUT    /videoaulas/:id    (protegido)
 *   DELETE /videoaulas/:id    (protegido)
 *   GET    /feedbacks         (protegido, nivel A)
 *   PUT    /feedbacks/:id     (protegido, nivel A)
 *   DELETE /feedbacks/:id     (protegido, nivel A)
 * ==========================================================================
 */

Auth.exigirAdmin();

let AULAS_CACHE = [];
let EDITANDO_VIDEO_ID = null;

/* ------------------------------------------------------------------ */
/* NAVEGAÇÃO                                                            */
/* ------------------------------------------------------------------ */
function trocarSecaoAdmin(nome) {
  document.getElementById("secaoAulas").style.display = nome === "aulas" ? "block" : "none";
  document.getElementById("secaoVideoaulas").style.display = nome === "videoaulas" ? "block" : "none";
  document.getElementById("secaoFeedbacks").style.display = nome === "feedbacks" ? "block" : "none";
  document.querySelectorAll(".app-nav-link[data-secao]").forEach((a) => a.classList.toggle("ativo", a.dataset.secao === nome));
  window.fecharMenuMobile?.();

  if (nome === "videoaulas") carregarVideoaulas();
  if (nome === "feedbacks") carregarFeedbacks();
}
document.querySelectorAll(".app-nav-link[data-secao]").forEach((link) => {
  link.addEventListener("click", (ev) => {
    ev.preventDefault();
    trocarSecaoAdmin(link.dataset.secao);
  });
});

function escapar(str = "") {
  const d = document.createElement("div");
  d.textContent = str ?? "";
  return d.innerHTML;
}

/* ------------------------------------------------------------------ */
/* SIDEBAR                                                              */
/* ------------------------------------------------------------------ */
async function carregarUsuarioAdmin() {
  const usuario = await buscarUsuarioLogado();
  if (!usuario) return;
  document.getElementById("sidebarNomeAdmin").textContent = usuario.nome || "Administrador(a)";
  const iniciais = (usuario.nome || "?").trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="#eace76"/><text x="50%" y="54%" font-family="JetBrains Mono" font-size="22" fill="#000" text-anchor="middle">${iniciais}</text></svg>`;
  document.getElementById("sidebarAvatarAdmin").src = usuario.foto
    ? apiUrl(usuario.foto)
    : "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
}
document.getElementById("btnSairAdmin").addEventListener("click", () => Auth.sair());

/* ------------------------------------------------------------------ */
/* DISCIPLINAS (AULAS)                                                  */
/* ------------------------------------------------------------------ */
async function carregarAulas() {
  try {
    const dados = await fetch(apiUrl("/aulas")).then((r) => r.json());
    AULAS_CACHE = Array.isArray(dados) ? dados : [];
    renderizarTabelaAulas();
    preencherSelectMaterias();
  } catch {
    document.getElementById("tabelaAulas").innerHTML = `<tr><td colspan="4">Não foi possível carregar as disciplinas.</td></tr>`;
  }
}

function renderizarTabelaAulas() {
  const corpo = document.getElementById("tabelaAulas");
  if (AULAS_CACHE.length === 0) {
    corpo.innerHTML = `<tr><td colspan="4">Nenhuma disciplina cadastrada.</td></tr>`;
    return;
  }
  corpo.innerHTML = AULAS_CACHE.map((a) => `
    <tr><td>${a.id_aula}</td><td>${escapar(a.materia)}</td><td>${escapar(a.duracao || "-")}</td><td>${a.qtd_aulas ?? "-"}</td></tr>
  `).join("");
}

function preencherSelectMaterias() {
  const select = document.getElementById("videoMateria");
  select.innerHTML = AULAS_CACHE.map((a) => `<option value="${a.id_aula}">${escapar(a.materia)}</option>`).join("");
}

document.getElementById("formAula").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const aviso = document.getElementById("aulaAviso");
  aviso.className = "form-aviso";

  const materia = document.getElementById("aulaMateria").value.trim();
  const duracao = document.getElementById("aulaDuracao").value.trim();
  const qtd_aulas = document.getElementById("aulaQtd").value || null;

  try {
    const resp = await fetch(apiUrl("/CadastroAulas"), {
      method: "POST",
      headers: await Auth.cabecalhos(),
      body: JSON.stringify({ materia, duracao, qtd_aulas }),
    });
    const dados = await resp.json();
    const sucesso = /sucesso/i.test(dados.resposta || "");
    aviso.textContent = dados.resposta || "Não foi possível cadastrar a disciplina.";
    aviso.classList.add("mostrar", sucesso ? "ok" : "erro");
    if (sucesso) {
      mostrarToast("Disciplina cadastrada!", "ok");
      ev.target.reset();
      carregarAulas();
    }
  } catch {
    aviso.textContent = "Não foi possível falar com o servidor da StarDev.";
    aviso.classList.add("mostrar", "erro");
  }
});

/* ------------------------------------------------------------------ */
/* VIDEOAULAS (CRUD)                                                    */
/* ------------------------------------------------------------------ */
async function carregarVideoaulas() {
  try {
    const dados = await fetch(apiUrl("/videoaulas")).then((r) => r.json());
    renderizarTabelaVideoaulas(Array.isArray(dados) ? dados : []);
  } catch {
    document.getElementById("tabelaVideoaulas").innerHTML = `<tr><td colspan="5">Não foi possível carregar as videoaulas.</td></tr>`;
  }
}

/** Miniatura (capa) do vídeo no YouTube — a mesma que aparece no carrossel da home */
function capaVideo(link = "") {
  const m = String(link).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (!m) return `<span class="sr-only">sem capa</span>`;
  return `<img class="thumb-mini" src="https://img.youtube.com/vi/${m[1]}/mqdefault.jpg" alt="" loading="lazy" />`;
}

function renderizarTabelaVideoaulas(lista) {
  const corpo = document.getElementById("tabelaVideoaulas");
  if (lista.length === 0) {
    corpo.innerHTML = `<tr><td colspan="5">Nenhuma videoaula cadastrada.</td></tr>`;
    return;
  }
  corpo.innerHTML = lista.map((v) => `
    <tr>
      <td>${capaVideo(v.link)}</td>
      <td>${escapar(v.materia || "-")}</td>
      <td>${escapar(v.nome_aulas)}</td>
      <td><a href="${escapar(v.link)}" target="_blank" rel="noopener" style="color:var(--cor-secundaria); text-decoration:underline;">assistir<span class="sr-only"> (abre em nova aba)</span> ↗</a></td>
      <td>
        <div class="acoes-tabela">
          <button type="button" data-editar="${v.id_materias}" title="Editar" aria-label="Editar ${escapar(v.nome_aulas)}">✎</button>
          <button type="button" data-excluir="${v.id_materias}" class="excluir" title="Excluir" aria-label="Excluir ${escapar(v.nome_aulas)}">🗑</button>
        </div>
      </td>
    </tr>`).join("");

  corpo.querySelectorAll("[data-editar]").forEach((btn) => {
    const video = lista.find((v) => v.id_materias === Number(btn.dataset.editar));
    btn.addEventListener("click", () => editarVideoaula(video));
  });
  corpo.querySelectorAll("[data-excluir]").forEach((btn) => {
    btn.addEventListener("click", () => excluirVideoaula(Number(btn.dataset.excluir)));
  });
}

function editarVideoaula(video) {
  EDITANDO_VIDEO_ID = video.id_materias;
  document.getElementById("tituloFormVideo").textContent = "Editar videoaula";
  document.getElementById("videoMateria").value = video.id_aula;
  document.getElementById("videoNome").value = video.nome_aulas;
  document.getElementById("videoDescricao").value = video.descricao;
  document.getElementById("videoLink").value = video.link;
  document.getElementById("btnSalvarVideo").textContent = "Salvar alterações";
  document.getElementById("btnCancelarEdicaoVideo").style.display = "inline-flex";
  document.getElementById("videoNome").focus();
  document.getElementById("formVideo").scrollIntoView({ block: "nearest" });
}

document.getElementById("btnCancelarEdicaoVideo").addEventListener("click", () => resetarFormVideo());

function resetarFormVideo() {
  EDITANDO_VIDEO_ID = null;
  document.getElementById("formVideo").reset();
  document.getElementById("tituloFormVideo").textContent = "Nova videoaula";
  document.getElementById("btnSalvarVideo").textContent = "Cadastrar videoaula";
  document.getElementById("btnCancelarEdicaoVideo").style.display = "none";
}

async function excluirVideoaula(id) {
  if (!confirm("Tem certeza que deseja excluir essa videoaula?")) return;
  try {
    const resp = await fetch(apiUrl(`/videoaulas/${id}`), { method: "DELETE", headers: await Auth.cabecalhos() });
    const dados = await resp.json();
    mostrarToast(dados.message || "Videoaula removida.", "ok");
    carregarVideoaulas();
  } catch {
    mostrarToast("Não foi possível excluir a videoaula.", "erro");
  }
}

document.getElementById("formVideo").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const aviso = document.getElementById("videoAviso");
  aviso.className = "form-aviso";

  const corpo = {
    id_aula: Number(document.getElementById("videoMateria").value),
    nome_aulas: document.getElementById("videoNome").value.trim(),
    descricao: document.getElementById("videoDescricao").value.trim(),
    link: document.getElementById("videoLink").value.trim(),
  };

  const url = EDITANDO_VIDEO_ID ? apiUrl(`/videoaulas/${EDITANDO_VIDEO_ID}`) : apiUrl("/videoaulas");
  const metodo = EDITANDO_VIDEO_ID ? "PUT" : "POST";

  try {
    const resp = await fetch(url, { method: metodo, headers: await Auth.cabecalhos(), body: JSON.stringify(corpo) });
    const dados = await resp.json();
    const sucesso = resp.ok;
    aviso.textContent = dados.message || (sucesso ? "Salvo com sucesso." : "Não foi possível salvar.");
    aviso.classList.add("mostrar", sucesso ? "ok" : "erro");
    if (sucesso) {
      mostrarToast("Videoaula salva com sucesso!", "ok");
      resetarFormVideo();
      carregarVideoaulas();
    }
  } catch {
    aviso.textContent = "Não foi possível falar com o servidor da StarDev.";
    aviso.classList.add("mostrar", "erro");
  }
});

/* ------------------------------------------------------------------ */
/* FEEDBACKS                                                            */
/* ------------------------------------------------------------------ */
async function carregarFeedbacks() {
  try {
    const resp = await fetch(apiUrl("/feedbacks"), { headers: await Auth.cabecalhos() });
    const dados = await resp.json();
    renderizarFeedbacks(Array.isArray(dados) ? dados : []);
  } catch {
    document.getElementById("tabelaFeedbacks").innerHTML = `<tr><td colspan="4">Não foi possível carregar os feedbacks.</td></tr>`;
  }
}

function renderizarFeedbacks(lista) {
  const corpo = document.getElementById("tabelaFeedbacks");
  if (lista.length === 0) {
    corpo.innerHTML = `<tr><td colspan="4">Nenhuma mensagem recebida ainda.</td></tr>`;
    return;
  }
  corpo.innerHTML = lista.map((f) => `
    <tr>
      <td>${escapar(f.nome)}</td>
      <td>${escapar(f.email)}</td>
      <td style="max-width:320px;">${escapar(f.comentario)}</td>
      <td><div class="acoes-tabela"><button class="excluir" data-excluir-feedback="${f.id_contato}" title="Excluir">🗑</button></div></td>
    </tr>`).join("");

  corpo.querySelectorAll("[data-excluir-feedback]").forEach((btn) => {
    btn.addEventListener("click", () => excluirFeedback(Number(btn.dataset.excluirFeedback)));
  });
}

async function excluirFeedback(id) {
  if (!confirm("Excluir esse feedback?")) return;
  try {
    const resp = await fetch(apiUrl(`/feedbacks/${id}`), { method: "DELETE", headers: await Auth.cabecalhos() });
    const dados = await resp.json();
    mostrarToast(dados.resposta || "Feedback removido.", "ok");
    carregarFeedbacks();
  } catch {
    mostrarToast("Não foi possível excluir o feedback.", "erro");
  }
}

/* ------------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", async () => {
  await carregarUsuarioAdmin();
  await carregarAulas();
});
