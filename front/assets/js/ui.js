/**
 * ==========================================================================
 * UI — UTILITÁRIOS COMPARTILHADOS (toasts, loader, menu, scroll reveal)
 * ==========================================================================
 */

/** Mostra uma notificação flutuante (toast) no canto da tela */
function mostrarToast(mensagem, tipo = "ok", duracao = 4200) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.textContent = mensagem;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 250);
  }, duracao);
}

/** Esconde o loader de página assim que o DOM estiver pronto */
function esconderLoaderPagina() {
  const loader = document.querySelector(".loader-pagina");
  if (loader) setTimeout(() => loader.classList.add("escondido"), 350);
}

/** Liga o botão hambúrguer do header público (com estado para leitores de tela) */
function ativarMenuMobile() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav-desktop");
  if (!toggle || !nav) return;

  const definir = (aberto) => {
    nav.classList.toggle("aberto", aberto);
    toggle.setAttribute("aria-expanded", String(aberto));
    toggle.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  };

  toggle.addEventListener("click", () => definir(!nav.classList.contains("aberto")));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => definir(false)));
  // clicar na logo oculta o menu aberto (ideia dos professores)
  document.querySelector(".header .logo")?.addEventListener("click", () => definir(false));
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && nav.classList.contains("aberto")) { definir(false); toggle.focus(); }
  });
  document.addEventListener("click", (ev) => {
    if (nav.classList.contains("aberto") && !nav.contains(ev.target) && !toggle.contains(ev.target)) definir(false);
  });
}

/**
 * Menu lateral da intranet (área do aluno / admin).
 * - Botão hambúrguer OU clique na logo mostram/ocultam o menu.
 * - No desktop o menu recolhe e o conteúdo ocupa a tela toda (preferência salva).
 * - No celular o menu abre como gaveta, com fundo escurecido; Esc ou toque fora fecha.
 */
function ativarMenuIntranet() {
  const shell = document.querySelector(".app-shell");
  const sidebar = document.querySelector(".app-sidebar");
  const botoes = document.querySelectorAll(".mobile-topbar .topbar-menu, .mobile-topbar .topbar-logo");
  if (!shell || !sidebar || botoes.length === 0) return;

  const CHAVE = "stardev_menu_oculto";
  const mq = window.matchMedia("(max-width: 980px)");
  const overlay = document.createElement("div");
  overlay.className = "app-overlay";
  document.body.appendChild(overlay);

  const estaAberto = () => (mq.matches ? sidebar.classList.contains("aberta") : !shell.classList.contains("menu-oculto"));

  function definir(abrir, salvar = true) {
    if (mq.matches) {
      sidebar.classList.toggle("aberta", abrir);
      document.body.classList.toggle("menu-aberto", abrir);
    } else {
      shell.classList.toggle("menu-oculto", !abrir);
      if (salvar) { try { localStorage.setItem(CHAVE, abrir ? "0" : "1"); } catch (e) {} }
    }
    botoes.forEach((b) => {
      b.setAttribute("aria-expanded", String(abrir));
      if (b.classList.contains("topbar-menu")) b.setAttribute("aria-label", abrir ? "Ocultar menu" : "Mostrar menu");
    });
  }

  function sincronizar() {
    sidebar.classList.remove("aberta");
    document.body.classList.remove("menu-aberto");
    let oculto = false;
    try { oculto = localStorage.getItem(CHAVE) === "1"; } catch (e) {}
    if (mq.matches) { shell.classList.remove("menu-oculto"); definir(false, false); }
    else { definir(!oculto, false); }
  }

  botoes.forEach((b) => b.addEventListener("click", () => definir(!estaAberto())));
  overlay.addEventListener("click", () => definir(false));
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && mq.matches && estaAberto()) { definir(false); botoes[0].focus(); }
  });
  mq.addEventListener("change", sincronizar);
  window.fecharMenuMobile = () => { if (mq.matches) definir(false); };
  sincronizar();
}

/** Observa elementos .reveal e adiciona .visivel quando entram na tela */
function ativarScrollReveal() {
  const alvos = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || alvos.length === 0) {
    alvos.forEach((el) => el.classList.add("visivel"));
    return;
  }
  const obs = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visivel");
          obs.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  alvos.forEach((el) => obs.observe(el));
}

/** Marca o link de navegação ativo com base no arquivo atual da URL */
function marcarNavAtiva() {
  const paginaAtual = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link, .app-nav-link").forEach((link) => {
    const href = link.getAttribute("href")?.split("#")[0];
    if (href === paginaAtual) { link.classList.add("ativo"); link.setAttribute("aria-current", "page"); }
  });
}

/** Liga cada mensagem de erro ao seu campo, para leitores de tela anunciarem o problema */
function ligarErrosAosCampos() {
  document.querySelectorAll("[data-erro-de]").forEach((msg) => {
    const campo = document.getElementById(msg.dataset.erroDe);
    if (!campo) return;
    if (!msg.id) msg.id = `erro-${msg.dataset.erroDe}`;
    campo.setAttribute("aria-describedby", msg.id);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  esconderLoaderPagina();
  ativarMenuMobile();
  ativarMenuIntranet();
  ativarScrollReveal();
  marcarNavAtiva();
  ligarErrosAosCampos();
});
