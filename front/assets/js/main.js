/**
 * ==========================================================================
 * MAIN.JS — PÁGINA INICIAL (index.html)
 * ==========================================================================
 */

/** Anima o "console" da hero digitando linhas de comando */
function iniciarTerminalHero() {
  const alvo = document.getElementById("terminalHero");
  if (!alvo) return;

  const linhas = [
    { prompt: "aluno@stardev", texto: "iniciar --trilha=front-end" },
    { resposta: "carregando módulos: html, css, javascript ✔" },
    { prompt: "aluno@stardev", texto: "nivel --escolher" },
    { resposta: "iniciante · intermediário · avançado" },
    { prompt: "aluno@stardev", texto: "abrir dev-mentor" },
    { resposta: "Dev Mentor pronta para te ajudar 24h ✔" },
  ];

  let indice = 0;
  function proximaLinha() {
    if (indice >= linhas.length) return;
    const linha = linhas[indice];
    const div = document.createElement("div");
    div.className = "terminal-linha";
    if (linha.prompt) {
      div.innerHTML = `<span class="terminal-prompt">${linha.prompt} $</span> ${linha.texto}`;
    } else {
      div.innerHTML = `<div class="terminal-resposta">${linha.resposta}</div>`;
    }
    alvo.appendChild(div);
    indice++;
    setTimeout(proximaLinha, linha.prompt ? 650 : 450);
  }
  setTimeout(proximaLinha, 500);

  // cursor piscando ao final
  setTimeout(() => {
    const cursor = document.createElement("span");
    cursor.className = "cursor-piscante";
    alvo.appendChild(cursor);
  }, 500 + linhas.length * 650);
}

/** Liga a validação e o envio do formulário de contato (POST /contato) */
function iniciarFormContato() {
  const form = document.getElementById("formContato");
  if (!form) return;
  const aviso = document.getElementById("contatoAviso");
  const botao = document.getElementById("btnEnviarContato");

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    aviso.className = "form-aviso";

    const nome = form.nome.value.trim();
    const email = form.email.value.trim();
    const comentario = form.comentario.value.trim();

    if (nome.length < 6 || email.length < 6 || comentario.length < 10) {
      aviso.textContent = "Confira os campos: nome completo, e-mail válido e uma mensagem com pelo menos 10 caracteres.";
      aviso.classList.add("mostrar", "erro");
      return;
    }

    botao.disabled = true;
    botao.textContent = "Enviando...";

    try {
      const resp = await fetch(apiUrl("/contato"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, comentario }),
      });
      const dados = await resp.json();
      const sucesso = /sucesso/i.test(dados.resposta || "");

      aviso.textContent = dados.resposta || "Não foi possível enviar sua mensagem.";
      aviso.classList.add("mostrar", sucesso ? "ok" : "erro");
      if (sucesso) {
        mostrarToast("Mensagem enviada com sucesso!", "ok");
        form.reset();
      }
    } catch (erro) {
      aviso.textContent = "Não foi possível falar com o servidor da StarDev. Verifique se o back-end está rodando.";
      aviso.classList.add("mostrar", "erro");
    } finally {
      botao.disabled = false;
      botao.textContent = "Enviar mensagem";
    }
  });
}

/**
 * Carrossel de capas (thumbnails) das videoaulas — loop infinito, semitransparente
 * e não clicável. Toda videoaula cadastrada no painel entra sozinha aqui, porque a
 * lista vem de GET /videoaulas e a capa é a miniatura do próprio vídeo no YouTube.
 */
function idYoutube(link = "") {
  const m = String(link).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

async function iniciarCarrosselAulas() {
  const secao = document.getElementById("aulas-carrossel");
  const trilho = document.getElementById("carrosselTrilho");
  const caixa = document.getElementById("carrossel");
  const botaoPausa = document.getElementById("carrosselPausa");
  if (!secao || !trilho) return;

  let ids = [];
  try {
    const resp = await fetch(apiUrl("/videoaulas"));
    const dados = await resp.json();
    ids = [...new Set((Array.isArray(dados) ? dados : []).map((v) => idYoutube(v.link)).filter(Boolean))];
  } catch (e) { return; }
  if (ids.length === 0) return;

  const larguraItem = Math.min(320, Math.max(200, window.innerWidth * 0.21)) + 16;
  const porGrupo = Math.max(ids.length, Math.ceil(window.innerWidth / larguraItem) + 2);
  const grupo = () => {
    const g = document.createElement("div");
    g.className = "carrossel-grupo";
    for (let i = 0; i < porGrupo; i++) {
      const item = document.createElement("div");
      item.className = "carrossel-item";
      const img = document.createElement("img");
      img.src = `https://img.youtube.com/vi/${ids[i % ids.length]}/hqdefault.jpg`;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", () => item.remove());
      item.appendChild(img);
      g.appendChild(item);
    }
    return g;
  };
  trilho.append(grupo(), grupo()); // dois grupos iguais = volta perfeita
  trilho.style.setProperty("--duracao", `${Math.max(30, porGrupo * 6)}s`);
  secao.hidden = false;

  if (botaoPausa) {
    botaoPausa.addEventListener("click", () => {
      const pausado = caixa.classList.toggle("pausado");
      botaoPausa.setAttribute("aria-pressed", String(pausado));
      botaoPausa.textContent = pausado ? "Retomar animação" : "Pausar animação";
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarTerminalHero();
  iniciarFormContato();
  iniciarCarrosselAulas();
});