(function NotasStarDev() {
  const LOGO_SVG = `<svg viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 3L10 10L2 17" stroke="#F2E8E0" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="12" y1="17" x2="20" y2="17" stroke="#F2E8E0" stroke-width="2.6" stroke-linecap="round"/>
  </svg>`;

  let contextoAtual = { materia: "", aula: "" };
  let fabEl = null;
  let blocoEl = null;
  let botaoExpandirEl = null;
  let textareaEl = null;
  let playerWrapEl = null;
  let saveTimeout = null;

  function normalizarChave(materia, aula) {
    return `stardev_nota__${materia}__${aula}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "_");
  }

  function carregarTodasAnotacoes() {
    try {
      return JSON.parse(localStorage.getItem("stardev_anotacoes") || "{}");
    } catch {
      return {};
    }
  }

  function salvarNota() {
    if (!contextoAtual.aula || !textareaEl) return;
    const texto = textareaEl.value;
    const chave = normalizarChave(contextoAtual.materia, contextoAtual.aula);
    const todas = carregarTodasAnotacoes();

    const notaExistente = todas[chave] || {};
    todas[chave] = {
      id: chave,
      materia: contextoAtual.materia || "Geral",
      aula: contextoAtual.aula,
      texto: texto,
      criadoEm: notaExistente.criadoEm || new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    localStorage.setItem("stardev_anotacoes", JSON.stringify(todas));

    const statusEl = blocoEl?.querySelector(".nota-salvo-status");
    if (statusEl) {
      statusEl.textContent = "Salvo";
      statusEl.classList.add("visivel");
      clearTimeout(statusEl._timer);
      statusEl._timer = setTimeout(() => {
        statusEl.textContent = "";
        statusEl.classList.remove("visivel");
      }, 2000);
    }

    if (typeof window.renderizarAnotacoes === "function") {
      window.renderizarAnotacoes();
    }
  }

  function carregarNotaAtual() {
    if (!contextoAtual.aula || !textareaEl) return;
    const chave = normalizarChave(contextoAtual.materia, contextoAtual.aula);
    const todas = carregarTodasAnotacoes();
    const nota = todas[chave];
    textareaEl.value = nota?.texto || "";
  }

  function criarFAB() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nota-fab";
    btn.setAttribute("aria-label", "Abrir bloco de notas StarDev");
    btn.setAttribute("title", "Clique para abrir o bloco de notas da StarDev");
    btn.innerHTML = `
      <div class="nota-fab-inner">
        ${LOGO_SVG}
      </div>
      <span class="nota-fab-dica">Anotar</span>
    `;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      mostrarBloco();
    });

    return btn;
  }

  function criarBloco() {
    const div = document.createElement("div");
    div.className = "nota-bloco";
    div.style.display = "none";
    div.innerHTML = `
      <div class="nota-bloco-header">
        <div class="nota-logo">
          ${LOGO_SVG}
          <span>StarDev</span>
        </div>
        <div class="nota-bloco-contexto">
          <span class="nota-materia" id="notaMateriaTitulo">${escaparHTML(contextoAtual.materia || "Matéria")}</span>
          <span class="nota-separador">·</span>
          <span class="nota-aula" id="notaAulaTitulo">${escaparHTML(contextoAtual.aula || "Aula")}</span>
        </div>
        <div class="nota-header-acoes">
          <button type="button" class="nota-bloco-fechar" id="notaBtnFechar" title="Recolher para o círculo StarDev" aria-label="Recolher notas">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
      <div class="nota-bloco-body">
        <textarea class="nota-textarea" id="notaTextarea" placeholder="Digite suas anotações aqui enquanto assiste ao vídeo. Suas notas são salvas automaticamente com o nome da matéria e aula."></textarea>
      </div>
      <div class="nota-bloco-footer">
        <div class="nota-footer-esquerda">
          <span class="nota-tag-auto">Salvamento automático</span>
          <span class="nota-salvo-status"></span>
        </div>
        <div class="nota-footer-acoes">
          <button type="button" class="nota-btn-copiar" id="notaBtnCopiar" title="Copiar anotações">Copiar</button>
        </div>
      </div>
    `;

    div.querySelector("#notaBtnFechar").addEventListener("click", (e) => {
      e.stopPropagation();
      ocultarBloco();
    });

    div.querySelector("#notaBtnCopiar").addEventListener("click", (e) => {
      e.stopPropagation();
      const txt = textareaEl?.value || "";
      if (!txt.trim()) return;
      navigator.clipboard.writeText(txt).then(() => {
        const btn = div.querySelector("#notaBtnCopiar");
        btn.textContent = "Copiado";
        setTimeout(() => (btn.textContent = "Copiar"), 2000);
      });
    });

    textareaEl = div.querySelector("#notaTextarea");
    textareaEl.addEventListener("input", () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(salvarNota, 600);
    });

    textareaEl.addEventListener("blur", salvarNota);

    return div;
  }

  function mostrarBloco() {
    if (!blocoEl) return;
    if (fabEl) fabEl.style.display = "none";
    blocoEl.style.display = "flex";
    carregarNotaAtual();
    setTimeout(() => textareaEl?.focus(), 50);
  }

  function ocultarBloco() {
    if (!blocoEl) return;
    salvarNota();
    blocoEl.style.display = "none";
    if (fabEl) fabEl.style.display = "flex";
  }

  function criarBotaoExpandir() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn-expandir-player";
    btn.setAttribute("title", "Expandir tela");
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
      </svg>
      <span>Expandir tela</span>
    `;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      alternarTelaExpandida();
    });

    return btn;
  }

  function alternarTelaExpandida() {
    if (!playerWrapEl) return;

    const estaExpandido = playerWrapEl.classList.contains("modo-expandido") ||
      document.fullscreenElement === playerWrapEl;

    if (estaExpandido) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      playerWrapEl.classList.remove("modo-expandido");
      document.body.classList.remove("player-expandido-ativo");
      atualizarBotaoExpandir(false);
    } else {
      playerWrapEl.classList.add("modo-expandido");
      document.body.classList.add("player-expandido-ativo");
      atualizarBotaoExpandir(true);

      if (playerWrapEl.requestFullscreen) {
        playerWrapEl.requestFullscreen().catch(() => {});
      }
    }
  }

  function atualizarBotaoExpandir(expandido) {
    if (!botaoExpandirEl) return;
    if (expandido) {
      botaoExpandirEl.classList.add("ativa");
      botaoExpandirEl.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"/>
        </svg>
        <span>Reduzir tela</span>
      `;
    } else {
      botaoExpandirEl.classList.remove("ativa");
      botaoExpandirEl.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
        </svg>
        <span>Expandir tela</span>
      `;
    }
  }

  function sincronizarFullscreen() {
    const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
    if (fsEl && fsEl === playerWrapEl) {
      playerWrapEl.classList.add("modo-expandido");
      document.body.classList.add("player-expandido-ativo");
      atualizarBotaoExpandir(true);
    } else if (!fsEl && !playerWrapEl?.classList.contains("modo-expandido")) {
      document.body.classList.remove("player-expandido-ativo");
      atualizarBotaoExpandir(false);
    }
  }

  function escaparHTML(str) {
    const d = document.createElement("div");
    d.textContent = str || "";
    return d.innerHTML;
  }

  function montarNoPlayer(container, materia, aula) {
    if (!container) return;

    document.querySelectorAll(".nota-fab, .nota-bloco, .btn-expandir-player").forEach((el) => el.remove());

    contextoAtual = { materia: materia || "Geral", aula: aula || "Aula" };
    playerWrapEl = container;

    const estilo = window.getComputedStyle(container);
    if (estilo.position === "static") {
      container.style.position = "relative";
    }

    fabEl = criarFAB();
    blocoEl = criarBloco();
    botaoExpandirEl = criarBotaoExpandir();

    container.appendChild(botaoExpandirEl);
    container.appendChild(fabEl);
    container.appendChild(blocoEl);

    carregarNotaAtual();

    document.removeEventListener("keydown", lidarComTeclas);
    document.addEventListener("keydown", lidarComTeclas);

    document.removeEventListener("fullscreenchange", sincronizarFullscreen);
    document.addEventListener("fullscreenchange", sincronizarFullscreen);
  }

  function lidarComTeclas(ev) {
    if (ev.key === "Escape") {
      if (playerWrapEl?.classList.contains("modo-expandido")) {
        alternarTelaExpandida();
      }
    }
  }

  window.addEventListener("beforeunload", () => {
    salvarNota();
  });

  window.NotasStarDev = {
    montarNoPlayer,
    salvarNota,
    carregarTodasAnotacoes,
    alternarTelaExpandida
  };
})();
