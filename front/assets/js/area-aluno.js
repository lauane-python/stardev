/**
 * ==========================================================================
 * AREA-ALUNO.JS — intranet do aluno
 * ==========================================================================
 * Endpoints usados:
 *   GET /usuario              (dados do usuário logado)
 *   GET /aulas                (lista de disciplinas/matérias)
 *   GET /videoaulas           (lista de vídeos, já com o nome da matéria)
 *   PUT /usuario              (atualizar nome/email/telefone/bio)
 *   POST /usuario/foto        (upload de foto de perfil)
 *   PUT /trocarSenha          (logado, troca a própria senha)
 * ==========================================================================
 */

Auth.exigirLogin();

let TODAS_MATERIAS = [];
let TODAS_VIDEOAULAS = [];
let MATERIA_SELECIONADA = null;

/* ------------------------------------------------------------------ */
/* NAVEGAÇÃO ENTRE SEÇÕES                                              */
/* ------------------------------------------------------------------ */
function trocarSecao(nome) {
  document.getElementById("secaoTrilhas").style.display = nome === "trilhas" ? "block" : "none";
  document.getElementById("secaoPerfil").style.display = nome === "perfil" ? "block" : "none";
  document.querySelectorAll(".app-nav-link[data-secao]").forEach((a) => {
    a.classList.toggle("ativo", a.dataset.secao === nome);
  });
  window.fecharMenuMobile?.();
}

document.querySelectorAll(".app-nav-link[data-secao]").forEach((link) => {
  link.addEventListener("click", (ev) => {
    ev.preventDefault();
    trocarSecao(link.dataset.secao);
  });
});

/* ------------------------------------------------------------------ */
/* SIDEBAR — dados do usuário logado                                   */
/* ------------------------------------------------------------------ */
function iniciaisNome(nome = "") {
  return nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
}

function avatarSVGPlaceholder(iniciais) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="#eace76"/><text x="50%" y="54%" font-family="JetBrains Mono" font-size="22" fill="#000" text-anchor="middle">${iniciais}</text></svg>`;
  return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
}

async function carregarUsuario() {
  const usuario = await buscarUsuarioLogado();
  if (!usuario) return null;

  document.getElementById("sidebarNome").textContent = usuario.nome || "Aluno(a)";
  document.getElementById("sidebarNivel").textContent = Auth.nivel() === "A" ? "administrador" : "estudante";

  const iniciais = iniciaisNome(usuario.nome);
  const foto = usuario.foto ? apiUrl(usuario.foto) : avatarSVGPlaceholder(iniciais);
  document.getElementById("sidebarAvatar").src = foto;

  // preenche o formulário de perfil
  document.getElementById("perfilNome").value = usuario.nome || "";
  document.getElementById("perfilEmail").value = usuario.email || "";
  document.getElementById("perfilBio").value = usuario.bio || "";
  document.getElementById("fotoPreview").src = foto;

  const campoTelefonePerfil = document.getElementById("perfilTelefone");
  ativarMascaraTelefone(campoTelefonePerfil);
  if (usuario.telefone) {
    campoTelefonePerfil.dataset.digitos = usuario.telefone;
    campoTelefonePerfil.value = formatarTelefoneBR(usuario.telefone);
  }

  // link do painel admin, se for nível A
  if (Auth.nivel() === "A") {
    const nav = document.querySelector(".app-nav");
    const link = document.createElement("a");
    link.href = "admin.html";
    link.className = "app-nav-link";
    link.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg> Painel administrativo`;
    nav.appendChild(link);
  }

  return usuario;
}

/* ------------------------------------------------------------------ */
/* TRILHAS / MATÉRIAS / VIDEOAULAS                                     */
/* ------------------------------------------------------------------ */
async function carregarTrilhas() {
  try {
    const [aulas, videoaulas] = await Promise.all([
      fetch(apiUrl("/aulas")).then((r) => r.json()),
      fetch(apiUrl("/videoaulas")).then((r) => r.json()),
    ]);
    TODAS_MATERIAS = Array.isArray(aulas) ? aulas : [];
    TODAS_VIDEOAULAS = Array.isArray(videoaulas) ? videoaulas : [];
    renderizarEstatisticas();
    renderizarMaterias();
  } catch (erro) {
    document.getElementById("listaMaterias").innerHTML =
      `<p style="font-family:var(--fonte-mono); font-size:13px; color:var(--erro);">Não foi possível carregar as disciplinas. Verifique se o back-end está rodando.</p>`;
  }
}

function renderizarEstatisticas() {
  const grid = document.getElementById("statGrid");
  const totalAulas = TODAS_VIDEOAULAS.length;
  grid.innerHTML = `
    <div class="stat-card"><div class="valor">${TODAS_MATERIAS.length}</div><div class="rotulo">disciplinas disponíveis</div></div>
    <div class="stat-card"><div class="valor">${totalAulas}</div><div class="rotulo">videoaulas publicadas</div></div>
    <div class="stat-card"><div class="valor">3</div><div class="rotulo">níveis · iniciante ao avançado</div></div>
  `;
}

function renderizarMaterias() {
  const container = document.getElementById("listaMaterias");
  if (TODAS_MATERIAS.length === 0) {
    container.innerHTML = `<div class="vazio-estado"><p>Nenhuma disciplina cadastrada ainda.</p></div>`;
    return;
  }
  container.innerHTML = TODAS_MATERIAS.map((materia) => {
    const qtd = TODAS_VIDEOAULAS.filter((v) => v.id_aula === materia.id_aula).length;
    return `
      <button type="button" class="item-materia" data-id-aula="${materia.id_aula}" aria-pressed="false">
        <strong>${escapar(materia.materia)}</strong>
        <span class="meta">${escapar(materia.duracao || "-")} · ${qtd} aula(s)</span>
      </button>`;
  }).join("");

  container.querySelectorAll(".item-materia").forEach((el) => {
    el.addEventListener("click", () => abrirMateria(Number(el.dataset.idAula)));
  });
}

function abrirMateria(idAula) {
  MATERIA_SELECIONADA = idAula;
  document.querySelectorAll(".item-materia").forEach((el) => {
    el.setAttribute("aria-pressed", String(Number(el.dataset.idAula) === idAula));
  });
  const materia = TODAS_MATERIAS.find((m) => m.id_aula === idAula);
  document.getElementById("tituloMateriaSelecionada").textContent = materia ? materia.materia : "Aulas";
  document.getElementById("painelAulas").style.display = "block";
  document.getElementById("playerAtivo").innerHTML = "";

  const aulasDaMateria = TODAS_VIDEOAULAS.filter((v) => v.id_aula === idAula);
  const lista = document.getElementById("listaAulas");

  if (aulasDaMateria.length === 0) {
    lista.innerHTML = `<div class="vazio-estado"><p>Ainda não há videoaulas publicadas para essa disciplina.</p></div>`;
  } else {
    lista.innerHTML = aulasDaMateria.map((aula, i) => {
      const idVideo = extrairIdYoutube(aula.link);
      const capa = idVideo
        ? `<img src="https://img.youtube.com/vi/${idVideo}/mqdefault.jpg" alt="" loading="lazy" />`
        : "";
      return `
      <button type="button" class="item-aula" data-link="${escapar(aula.link)}" data-nome="${escapar(aula.nome_aulas)}" data-descricao="${escapar(aula.descricao)}">
        <span class="aula-thumb">${capa}<span class="num">${String(i + 1).padStart(2, "0")}</span></span>
        <span class="info">
          <strong class="aula-titulo">${escapar(aula.nome_aulas)}</strong>
          <span class="aula-desc">${escapar(aula.descricao)}</span>
        </span>
      </button>`;
    }).join("");

    lista.querySelectorAll(".item-aula").forEach((el) => {
      el.addEventListener("click", () => tocarVideo(el.dataset.link, el.dataset.nome, el.dataset.descricao));
    });

    // toca a primeira aula automaticamente
    tocarVideo(aulasDaMateria[0].link, aulasDaMateria[0].nome_aulas, aulasDaMateria[0].descricao);
  }

  document.getElementById("painelAulas").scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Extrai o ID de um link do YouTube (watch?v= ou youtu.be/) */
function extrairIdYoutube(link = "") {
  const m = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

/** Monta o player, com mensagem amigável caso o vídeo não seja carregado (RNF03) */
function tocarVideo(link, nome, descricao = "") {
  const id = extrairIdYoutube(link);
  const container = document.getElementById("playerAtivo");

  // destaca o card da aula que está tocando
  document.querySelectorAll(".item-aula").forEach((el) => {
    if (el.dataset.link === link) el.setAttribute("aria-current", "true");
    else el.removeAttribute("aria-current");
  });

  const legenda = `<div class="aula-atual"><h3>${escapar(nome)}</h3>${descricao ? `<p>${escapar(descricao)}</p>` : ""}</div>`;

  if (!id) {
    container.innerHTML = `
      <div class="player-wrap"><div class="player-erro mostrar" role="alert">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#eace76" stroke-width="1.6" aria-hidden="true"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>
        <p>Vídeo temporariamente indisponível.</p>
      </div></div>${legenda}`;
    return;
  }

  container.innerHTML = `
    <div class="player-wrap">
      <iframe id="iframeAula" src="https://www.youtube.com/embed/${id}" title="${escapar(nome)}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      <div class="player-erro" id="playerErro">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#eace76" stroke-width="1.6" aria-hidden="true"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>
        <p>Vídeo temporariamente indisponível. Tente novamente mais tarde.</p>
      </div>
    </div>${legenda}`;

  // fallback amigável caso o iframe do YouTube não carregue (servidor fora do ar / vídeo removido)
  const iframe = document.getElementById("iframeAula");
  const erroEl = document.getElementById("playerErro");
  iframe.addEventListener("error", () => erroEl.classList.add("mostrar"));
}

function escapar(str = "") {
  const d = document.createElement("div");
  d.textContent = str ?? "";
  return d.innerHTML;
}

document.getElementById("btnVoltarMaterias")?.addEventListener("click", () => {
  document.getElementById("painelAulas").style.display = "none";
  document.querySelectorAll(".item-materia").forEach((el) => el.setAttribute("aria-pressed", "false"));
  document.getElementById("listaMaterias").scrollIntoView({ block: "nearest" });
});

/* ------------------------------------------------------------------ */
/* PERFIL — atualizar dados                                            */
/* ------------------------------------------------------------------ */
document.querySelectorAll(".tab-btn[data-tab-perfil]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn[data-tab-perfil]").forEach((b) => b.classList.remove("ativa"));
    btn.classList.add("ativa");
    document.querySelectorAll("[data-conteudo-perfil]").forEach((p) => p.classList.remove("ativa"));
    document.querySelector(`[data-conteudo-perfil="${btn.dataset.tabPerfil}"]`).classList.add("ativa");
  });
});

document.getElementById("formPerfil").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const aviso = document.getElementById("perfilAviso");
  aviso.className = "form-aviso";
  const botao = document.getElementById("btnSalvarPerfil");
  botao.disabled = true;
  botao.textContent = "Salvando...";

  try {
    const resp = await fetch(apiUrl("/usuario"), {
      method: "PUT",
      headers: await Auth.cabecalhos(),
      body: JSON.stringify({
        nome: document.getElementById("perfilNome").value.trim(),
        email: document.getElementById("perfilEmail").value.trim(),
        telefone: digitosTelefone(document.getElementById("perfilTelefone")),
        bio: document.getElementById("perfilBio").value.trim(),
      }),
    });
    const dados = await resp.json();
    const sucesso = /sucesso/i.test(dados.resposta || "");
    aviso.textContent = dados.resposta || "Não foi possível salvar as alterações.";
    aviso.classList.add("mostrar", sucesso ? "ok" : "erro");
    if (sucesso) {
      mostrarToast("Perfil atualizado com sucesso!", "ok");
      document.getElementById("sidebarNome").textContent = document.getElementById("perfilNome").value.trim();
    }
  } catch {
    aviso.textContent = "Não foi possível falar com o servidor da StarDev.";
    aviso.classList.add("mostrar", "erro");
  } finally {
    botao.disabled = false;
    botao.textContent = "Salvar alterações";
  }
});

/* ------------------------------------------------------------------ */
/* PERFIL — foto                                                       */
/* ------------------------------------------------------------------ */
document.getElementById("btnTrocarFoto").addEventListener("click", () => document.getElementById("inputFoto").click());
document.getElementById("inputFoto").addEventListener("change", async (ev) => {
  const arquivo = ev.target.files[0];
  if (!arquivo) return;

  document.getElementById("fotoPreview").src = URL.createObjectURL(arquivo);

  const formData = new FormData();
  formData.append("foto", arquivo);

  try {
    const resp = await fetch(apiUrl("/usuario/foto"), {
      method: "POST",
      headers: { Authorization: `Bearer ${Auth.token()}` },
      body: formData,
    });
    const dados = await resp.json();
    if (dados.foto) {
      mostrarToast("Foto atualizada com sucesso!", "ok");
      document.getElementById("sidebarAvatar").src = apiUrl(dados.foto);
    } else {
      mostrarToast(dados.resposta || "Não foi possível atualizar a foto.", "erro");
    }
  } catch {
    mostrarToast("Não foi possível enviar a foto agora.", "erro");
  }
});

/* ------------------------------------------------------------------ */
/* PERFIL — trocar senha                                               */
/* ------------------------------------------------------------------ */
document.querySelectorAll(".btn-olho").forEach(ativarOlhoSenha);

document.getElementById("formTrocarSenha").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const aviso = document.getElementById("senhaAviso");
  aviso.className = "form-aviso";

  const novaSenha = document.getElementById("novaSenhaPerfil").value;
  const confirma = document.getElementById("confirmaSenhaPerfil").value;

  if (novaSenha !== confirma) {
    aviso.textContent = "As senhas não coincidem.";
    aviso.classList.add("mostrar", "erro");
    return;
  }

  const botao = document.getElementById("btnTrocarSenha");
  botao.disabled = true;
  botao.textContent = "Atualizando...";

  try {
    const resp = await fetch(apiUrl("/trocarSenha"), {
      method: "PUT",
      headers: await Auth.cabecalhos(),
      body: JSON.stringify({ novaSenha }),
    });
    const dados = await resp.json();
    const sucesso = /sucesso/i.test(dados.resposta || "");
    aviso.textContent = dados.resposta || "Não foi possível atualizar a senha.";
    aviso.classList.add("mostrar", sucesso ? "ok" : "erro");
    if (sucesso) {
      mostrarToast("Senha atualizada com sucesso!", "ok");
      ev.target.reset();
    }
  } catch {
    aviso.textContent = "Não foi possível falar com o servidor da StarDev.";
    aviso.classList.add("mostrar", "erro");
  } finally {
    botao.disabled = false;
    botao.textContent = "Atualizar senha";
  }
});

document.getElementById("btnSair").addEventListener("click", () => Auth.sair());

/* ------------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", async () => {
  await carregarUsuario();
  await carregarTrilhas();
});
