Auth.exigirLogin();

let TODAS_MATERIAS = [];
let TODAS_VIDEOAULAS = [];
let MATERIA_SELECIONADA = null;
let FOTO_ATUAL_URL = "";

window.STARDEV_CONTEXT = {
  pagina: "area-aluno.html",
  materiaId: null,
};

function trocarSecao(nome) {
  document.getElementById("secaoInicio").style.display = nome === "inicio" ? "block" : "none";
  document.getElementById("secaoTrilhas").style.display = nome === "trilhas" ? "block" : "none";
  document.getElementById("secaoPerfil").style.display = nome === "perfil" ? "block" : "none";
  document.getElementById("secaoAnotacoes").style.display = nome === "anotacoes" ? "block" : "none";
  document.querySelectorAll(".app-nav-link[data-secao]").forEach((a) => {
    a.classList.toggle("ativo", a.dataset.secao === nome);
  });

  if (nome === "inicio") {
    renderizarOndeParou();
  } else if (nome === "anotacoes") {
    renderizarAnotacoes(document.getElementById("filtroAnotacoes")?.value || "");
  }

  window.fecharMenuMobile?.();
}

function salvarProgresso(idAula, nomeMateria, nomeAula, linkVideo) {
  localStorage.setItem(
    "stardev_progresso",
    JSON.stringify({ idAula, nomeMateria, nomeAula, linkVideo, ts: Date.now() })
  );
}

function abrirUltimaAulaSalva() {
  const dados = JSON.parse(localStorage.getItem("stardev_progresso") || "null");
  if (!dados) return;

  trocarSecao("trilhas");
  setTimeout(() => {
    const materia =
      TODAS_MATERIAS.find((m) => m.id_aula === Number(dados.idAula)) ||
      TODAS_MATERIAS.find((m) =>
        TODAS_VIDEOAULAS.some((v) => v.id_aula === m.id_aula && v.nome_aulas === dados.nomeAula)
      ) ||
      TODAS_MATERIAS.find(
        (m) => (m.materia || "").toLowerCase() === (dados.nomeMateria || "").toLowerCase()
      );
    if (materia) abrirMateria(materia.id_aula, dados.nomeAula);
  }, 100);
}

function renderizarOndeParou() {
  const dados = JSON.parse(localStorage.getItem("stardev_progresso") || "null");
  const el = document.getElementById("ondeParouConteudo");
  if (!el) return;

  if (!dados || !dados.nomeAula) {
    el.innerHTML = `<p style="font-family:var(--fonte-mono);font-size:13px;color:#7a6b6e;">Você ainda não assistiu nenhuma aula. Explore as <a href="#" data-secao="trilhas" style="color:var(--cor-secundaria);text-decoration:underline;">trilhas</a>.</p>`;
    el.querySelector("[data-secao]")?.addEventListener("click", (e) => {
      e.preventDefault();
      trocarSecao("trilhas");
    });
    return;
  }

  const data = new Date(dados.ts).toLocaleDateString("pt-BR");
  el.innerHTML = `
    <div class="onde-parou-card">
      <div class="onde-parou-info">
        <span class="onde-parou-materia">${escapar(dados.nomeMateria)}</span>
        <strong class="onde-parou-aula">${escapar(dados.nomeAula)}</strong>
        <span class="onde-parou-data">Última vez: ${data}</span>
      </div>
      <button type="button" class="btn btn-primario btn-sm" id="btnContinuar">Continuar</button>
    </div>`;
  document.getElementById("btnContinuar")?.addEventListener("click", abrirUltimaAulaSalva);
}

document.querySelectorAll(".app-nav-link[data-secao]").forEach((link) => {
  link.addEventListener("click", (ev) => {
    ev.preventDefault();
    trocarSecao(link.dataset.secao);
  });
});

function iniciaisNome(nome = "") {
  return nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
}

function avatarSVGPlaceholder(iniciais) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="#eace76"/><text x="50%" y="54%" font-family="JetBrains Mono" font-size="22" fill="#000" text-anchor="middle">${iniciais}</text></svg>`;
  return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
}

function atualizarBotaoRemoverFoto(temFotoCustomizada) {
  const btn = document.getElementById("btnRemoverFoto");
  if (btn) {
    btn.style.display = temFotoCustomizada ? "inline-flex" : "none";
  }
}

async function carregarUsuario() {
  const usuario = await buscarUsuarioLogado();
  if (!usuario) return null;

  document.getElementById("sidebarNome").textContent = usuario.nome || "Aluno(a)";
  document.getElementById("sidebarNivel").textContent =
    (usuario.nivel || Auth.nivel()) === "A" ? "administrador" : "estudante";

  if (document.getElementById("saudacaoNome")) {
    const primeiroNome = (usuario.nome || "").trim().split(/\s+/)[0];
    document.getElementById("saudacaoNome").textContent = primeiroNome ? `Olá, ${primeiroNome}` : "Olá";
  }

  const iniciais = iniciaisNome(usuario.nome);
  const placeholder = avatarSVGPlaceholder(iniciais);
  const foto = usuario.foto ? apiUrl(usuario.foto) : placeholder;
  FOTO_ATUAL_URL = foto;

  const sidebarAvatar = document.getElementById("sidebarAvatar");
  const fotoPreview = document.getElementById("fotoPreview");
  sidebarAvatar.src = foto;
  fotoPreview.src = foto;
  sidebarAvatar.onerror = () => {
    sidebarAvatar.src = placeholder;
  };
  fotoPreview.onerror = () => {
    fotoPreview.src = placeholder;
  };
  atualizarBotaoRemoverFoto(Boolean(usuario.foto));

  document.getElementById("perfilNome").value = usuario.nome || "";
  document.getElementById("perfilEmail").value = usuario.email || "";
  document.getElementById("perfilBio").value = usuario.bio || "";

  const campoTelefonePerfil = document.getElementById("perfilTelefone");
  ativarMascaraTelefone(campoTelefonePerfil);
  if (usuario.telefone) {
    campoTelefonePerfil.dataset.digitos = usuario.telefone;
    campoTelefonePerfil.value =
      typeof formatarApenasNumeroBR === "function"
        ? formatarApenasNumeroBR(usuario.telefone)
        : formatarTelefoneBR(usuario.telefone);
  }

  if ((usuario.nivel || Auth.nivel()) === "A") {
    const nav = document.querySelector(".app-nav");
    if (!nav.querySelector('a[href="admin.html"]')) {
      const link = document.createElement("a");
      link.href = "admin.html";
      link.className = "app-nav-link";
      link.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg> Painel administrativo`;
      nav.appendChild(link);
    }
  }

  return usuario;
}

async function carregarTrilhas() {
  try {
    const headers = await Auth.cabecalhos();
    const [respAulas, respVideoaulas] = await Promise.all([
      fetch(apiUrl("/aulas"), { headers }),
      fetch(apiUrl("/videoaulas")),
    ]);

    if (respAulas.status === 401 || respAulas.status === 403) {
      Auth.sair();
      return;
    }
    if (!respAulas.ok || !respVideoaulas.ok) {
      throw new Error("Erro ao carregar trilhas");
    }

    const [aulas, videoaulas] = await Promise.all([
      respAulas.json(),
      respVideoaulas.json(),
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

function abrirMateria(idAula, nomeAulaDesejada = null) {
  MATERIA_SELECIONADA = idAula;
  window.STARDEV_CONTEXT = {
    pagina: "area-aluno.html",
    materiaId: idAula,
  };

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
    lista.innerHTML = aulasDaMateria
      .map((aula, i) => {
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
      })
      .join("");

    lista.querySelectorAll(".item-aula").forEach((el) => {
      el.addEventListener("click", () =>
        tocarVideo(el.dataset.link, el.dataset.nome, el.dataset.descricao)
      );
    });

    const aulaAlvo =
      (nomeAulaDesejada && aulasDaMateria.find((a) => a.nome_aulas === nomeAulaDesejada)) ||
      aulasDaMateria[0];
    tocarVideo(aulaAlvo.link, aulaAlvo.nome_aulas, aulaAlvo.descricao);
  }

  document.getElementById("painelAulas").scrollIntoView({ behavior: "smooth", block: "start" });
}

function extrairIdYoutube(link = "") {
  const m = String(link).match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

function tocarVideo(link, nome, descricao = "") {
  const id = extrairIdYoutube(link);
  const container = document.getElementById("playerAtivo");

  const materiaAtual = TODAS_MATERIAS.find((m) => m.id_aula === MATERIA_SELECIONADA);
  if (materiaAtual) {
    salvarProgresso(materiaAtual.id_aula, materiaAtual.materia, nome, link);
  }

  document.querySelectorAll(".item-aula").forEach((el) => {
    if (el.dataset.link === link && el.dataset.nome === nome) {
      el.setAttribute("aria-current", "true");
    } else {
      el.removeAttribute("aria-current");
    }
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
    <div class="player-wrap" id="playerWrap">
      <iframe id="iframeAula" src="https://www.youtube.com/embed/${id}?enablejsapi=1&wmode=transparent&rel=0" title="${escapar(nome)}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
      <div class="player-erro" id="playerErro">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#eace76" stroke-width="1.6" aria-hidden="true"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>
        <p>Vídeo temporariamente indisponível. Tente novamente mais tarde.</p>
      </div>
    </div>${legenda}`;

  const iframe = document.getElementById("iframeAula");
  const erroEl = document.getElementById("playerErro");
  iframe.addEventListener("error", () => erroEl.classList.add("mostrar"));

  setTimeout(() => {
    const playerWrap = container.querySelector(".player-wrap");
    if (playerWrap && window.NotasStarDev) {
      window.NotasStarDev.montarNoPlayer(playerWrap, materiaAtual?.materia || "Aula", nome);
    }
  }, 100);
}

function escapar(str = "") {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

document.getElementById("btnVoltarMaterias")?.addEventListener("click", () => {
  MATERIA_SELECIONADA = null;
  window.STARDEV_CONTEXT = { pagina: "area-aluno.html", materiaId: null };
  document.getElementById("painelAulas").style.display = "none";
  document.querySelectorAll(".item-materia").forEach((el) => el.setAttribute("aria-pressed", "false"));
  document.getElementById("listaMaterias").scrollIntoView({ block: "nearest" });
});

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
      const nomeAtualizado = document.getElementById("perfilNome").value.trim();
      document.getElementById("sidebarNome").textContent = nomeAtualizado;
      const primeiro = nomeAtualizado.split(/\s+/)[0];
      if (document.getElementById("saudacaoNome") && primeiro) {
        document.getElementById("saudacaoNome").textContent = `Olá, ${primeiro}`;
      }
    }
  } catch {
    aviso.textContent = "Não foi possível falar com o servidor da StarDev.";
    aviso.classList.add("mostrar", "erro");
  } finally {
    botao.disabled = false;
    botao.textContent = "Salvar alterações";
  }
});

document.getElementById("btnTrocarFoto").addEventListener("click", () => {
  document.getElementById("inputFoto").click();
});

document.getElementById("inputFoto").addEventListener("change", async (ev) => {
  const arquivo = ev.target.files[0];
  if (!arquivo) return;

  if (!arquivo.type.startsWith("image/")) {
    mostrarToast("Selecione um arquivo de imagem válido (JPG, PNG, WEBP ou GIF).", "erro");
    ev.target.value = "";
    return;
  }
  if (arquivo.size > 5 * 1024 * 1024) {
    mostrarToast("A imagem deve ter no máximo 5 MB.", "erro");
    ev.target.value = "";
    return;
  }

  const previewUrl = URL.createObjectURL(arquivo);
  document.getElementById("fotoPreview").src = previewUrl;

  const formData = new FormData();
  formData.append("foto", arquivo);

  try {
    const resp = await fetch(apiUrl("/usuario/foto"), {
      method: "POST",
      headers: { Authorization: `Bearer ${Auth.token()}` },
      body: formData,
    });
    const dados = await resp.json();
    if (resp.ok && dados.foto) {
      const novaUrl = apiUrl(dados.foto) + "?t=" + Date.now();
      FOTO_ATUAL_URL = novaUrl;
      document.getElementById("sidebarAvatar").src = novaUrl;
      document.getElementById("fotoPreview").src = novaUrl;
      atualizarBotaoRemoverFoto(true);
      mostrarToast("Foto atualizada com sucesso!", "ok");
    } else {
      document.getElementById("fotoPreview").src = FOTO_ATUAL_URL;
      mostrarToast(dados.resposta || "Não foi possível atualizar a foto.", "erro");
    }
  } catch {
    document.getElementById("fotoPreview").src = FOTO_ATUAL_URL;
    mostrarToast("Não foi possível enviar a foto agora.", "erro");
  } finally {
    URL.revokeObjectURL(previewUrl);
  }
});

document.getElementById("btnRemoverFoto")?.addEventListener("click", async () => {
  if (!confirm("Deseja remover sua foto de perfil?")) return;
  try {
    const resp = await fetch(apiUrl("/usuario/foto"), {
      method: "DELETE",
      headers: await Auth.cabecalhos(),
    });
    const dados = await resp.json();
    if (resp.ok) {
      const placeholder = avatarSVGPlaceholder(
        iniciaisNome(document.getElementById("perfilNome").value)
      );
      FOTO_ATUAL_URL = placeholder;
      document.getElementById("fotoPreview").src = placeholder;
      document.getElementById("sidebarAvatar").src = placeholder;
      document.getElementById("inputFoto").value = "";
      atualizarBotaoRemoverFoto(false);
      mostrarToast(dados.resposta || "Foto removida com sucesso!", "ok");
    } else {
      mostrarToast(dados.resposta || "Não foi possível remover a foto.", "erro");
    }
  } catch {
    mostrarToast("Não foi possível remover a foto agora.", "erro");
  }
});

document.querySelectorAll(".btn-olho").forEach(ativarOlhoSenha);

document.getElementById("formTrocarSenha").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const aviso = document.getElementById("senhaAviso");
  aviso.className = "form-aviso";

  const novaSenha = document.getElementById("novaSenhaPerfil").value;
  const confirma = document.getElementById("confirmaSenhaPerfil").value;

  if (novaSenha.trim().length < 6) {
    aviso.textContent = "A nova senha deve ter pelo menos 6 caracteres.";
    aviso.classList.add("mostrar", "erro");
    return;
  }
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
      body: JSON.stringify({ novaSenha: novaSenha.trim() }),
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

function copiarParaClipboard(texto) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(texto);
  }
  const aux = document.createElement("textarea");
  aux.value = texto;
  aux.style.position = "fixed";
  aux.style.opacity = "0";
  document.body.appendChild(aux);
  aux.select();
  try {
    document.execCommand("copy");
  } finally {
    aux.remove();
  }
  return Promise.resolve();
}

function renderizarAnotacoes(termoFiltro = "") {
  const container = document.getElementById("listaAnotacoes");
  if (!container) return;

  const anotacoes = JSON.parse(localStorage.getItem("stardev_anotacoes") || "{}");
  let entradas = Object.entries(anotacoes).filter(([, a]) => a && a.texto?.trim());

  if (termoFiltro.trim()) {
    const q = termoFiltro.toLowerCase().trim();
    entradas = entradas.filter(
      ([, a]) =>
        (a.materia && a.materia.toLowerCase().includes(q)) ||
        (a.aula && a.aula.toLowerCase().includes(q)) ||
        (a.texto && a.texto.toLowerCase().includes(q))
    );
  }

  if (entradas.length === 0) {
    container.innerHTML = `
      <div class="painel">
        <div class="vazio-estado" style="text-align:center;padding:40px 20px;">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="rgba(129,68,86,.35)" stroke-width="1.3" style="margin:0 auto 16px;display:block"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <p style="font-family:var(--fonte-mono);font-size:13px;color:#7a6b6e;">
            ${termoFiltro ? "Nenhuma anotação corresponde ao seu filtro." : "Você ainda não tem anotações.<br>Abra qualquer videoaula e clique no círculo da StarDev para anotar em tempo real."}
          </p>
        </div>
      </div>`;
    return;
  }

  const grupos = {};
  entradas.forEach(([chave, nota]) => {
    const mat = nota.materia || "Geral";
    if (!grupos[mat]) grupos[mat] = [];
    grupos[mat].push({ chave, ...nota });
  });

  container.innerHTML = Object.entries(grupos)
    .map(
      ([materia, notas]) => `
    <div class="painel anotacao-grupo">
      <div class="painel-titulo"><h2>${escapar(materia)}</h2></div>
      ${notas
        .sort((a, b) => new Date(b.atualizadoEm) - new Date(a.atualizadoEm))
        .map((nota) => {
          const data = new Date(nota.atualizadoEm).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          return `
          <div class="anotacao-item" data-nota-chave="${escapar(nota.chave)}">
            <div class="anotacao-meta">
              <strong class="anotacao-aula">${escapar(nota.aula)}</strong>
              <span class="anotacao-data">Última edição: ${data}</span>
            </div>
            <pre class="anotacao-texto">${escapar(nota.texto)}</pre>
            <div class="anotacao-acoes">
              <button type="button" class="btn btn-primario btn-sm js-ir-aula" data-materia="${escapar(materia)}" data-aula="${escapar(nota.aula)}">Ir para aula</button>
              <button type="button" class="btn btn-ghost btn-sm js-copiar-nota">Copiar</button>
              <button type="button" class="btn btn-ghost btn-sm anotacao-deletar js-deletar-nota" data-chave="${escapar(nota.chave)}" data-aula="${escapar(nota.aula)}">Excluir</button>
            </div>
          </div>`;
        })
        .join("")}
    </div>`
    )
    .join("");

  container.querySelectorAll(".js-ir-aula").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.irParaAulaAnotada(btn.dataset.materia, btn.dataset.aula);
    });
  });

  container.querySelectorAll(".js-copiar-nota").forEach((btn) => {
    btn.addEventListener("click", () => {
      const texto = btn.closest(".anotacao-item")?.querySelector(".anotacao-texto")?.textContent || "";
      copiarParaClipboard(texto).then(() => {
        btn.textContent = "Copiado";
        setTimeout(() => {
          btn.textContent = "Copiar";
        }, 2000);
      });
    });
  });

  container.querySelectorAll(".js-deletar-nota").forEach((btn) => {
    btn.addEventListener("click", () => {
      deletarAnotacaoPorChave(btn.dataset.chave, btn.dataset.aula);
    });
  });
}

window.renderizarAnotacoes = renderizarAnotacoes;

window.irParaAulaAnotada = function (materiaNome, aulaNome) {
  trocarSecao("trilhas");
  setTimeout(() => {
    const materia = TODAS_MATERIAS.find(
      (m) => (m.materia || "").toLowerCase() === (materiaNome || "").toLowerCase()
    );
    if (materia) {
      abrirMateria(materia.id_aula, aulaNome);
    } else {
      const aulaObj = TODAS_VIDEOAULAS.find((v) => v.nome_aulas === aulaNome);
      if (aulaObj) {
        abrirMateria(aulaObj.id_aula, aulaNome);
      }
    }
  }, 120);
};

function deletarAnotacaoPorChave(chave, aula) {
  if (!confirm(`Excluir anotação de "${aula}"?`)) return;
  const anotacoes = JSON.parse(localStorage.getItem("stardev_anotacoes") || "{}");
  delete anotacoes[chave];
  localStorage.setItem("stardev_anotacoes", JSON.stringify(anotacoes));
  renderizarAnotacoes(document.getElementById("filtroAnotacoes")?.value || "");
}

window.exportarAnotacoes = function () {
  const anotacoes = JSON.parse(localStorage.getItem("stardev_anotacoes") || "{}");
  const lista = Object.values(anotacoes).filter((a) => a.texto?.trim());
  if (lista.length === 0) {
    mostrarToast("Você ainda não possui anotações para exportar.", "erro");
    return;
  }
  let conteudo = "============================================================\n";
  conteudo += "STARDEV — ANOTAÇÕES DE ESTUDO\n";
  conteudo += `Data de exportação: ${new Date().toLocaleString("pt-BR")}\n`;
  conteudo += "============================================================\n\n";

  lista.forEach((nota) => {
    conteudo += "------------------------------------------------------------\n";
    conteudo += `MATÉRIA: ${nota.materia || "Geral"}\n`;
    conteudo += `AULA:    ${nota.aula}\n`;
    conteudo += `DATA:    ${new Date(nota.atualizadoEm).toLocaleString("pt-BR")}\n`;
    conteudo += "------------------------------------------------------------\n";
    conteudo += `${nota.texto}\n\n`;
  });

  const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `stardev_anotacoes_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 500);
  mostrarToast("Anotações exportadas com sucesso!", "ok");
};

document.addEventListener("DOMContentLoaded", async () => {
  await carregarUsuario();
  await carregarTrilhas();

  const filtroInput = document.getElementById("filtroAnotacoes");
  if (filtroInput) {
    filtroInput.addEventListener("input", (e) => {
      renderizarAnotacoes(e.target.value);
    });
  }

  const btnExportar = document.getElementById("btnExportarAnotacoes");
  if (btnExportar) {
    btnExportar.addEventListener("click", () => window.exportarAnotacoes());
  }

  const hash = window.location.hash;
  if (hash === "#anotacoes") {
    trocarSecao("anotacoes");
  } else if (hash === "#trilhas") {
    trocarSecao("trilhas");
  } else if (hash === "#perfil") {
    trocarSecao("perfil");
  } else if (hash === "#continuar") {
    abrirUltimaAulaSalva();
  } else {
    trocarSecao("inicio");
  }
});
