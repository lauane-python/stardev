/**
 * ==========================================================================
 * DEV MENTOR — WIDGET DE CHATBOT (front-end)
 * ==========================================================================
 * Conversa com POST {API_BASE}/chatback/chat -> { message, pagina }
 * O back-end (chatback/routes/chatbot.js) repassa a pergunta para o Ollama
 * (modelo configurado em chatback/config/chatConfig.js) e devolve { reply }.
 *
 * "pagina" é usada pelo ragService.js do back-end para saber em qual trilha
 * o aluno está (afront, aback, adb, alogica, aux, ia) e ajustar o contexto.
 * ==========================================================================
 */

(function iniciarDevMentor() {
  const HTML_WIDGET = `
    <button class="dm-launcher" id="dmLauncher" aria-label="Abrir chat com a Dev Mentor" aria-expanded="false">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/></svg>
      <span class="dm-ponto"></span>
    </button>

    <div class="dm-janela" id="dmJanela" role="dialog" aria-label="Chat com a Dev Mentor">
      <div class="dm-topbar">
        <div class="dm-dots"><span></span><span></span><span></span></div>
        <div class="dm-topbar-info">
          <strong>Dev Mentor</strong>
          <small>online · DevMentor</small>
        </div>
        <button class="dm-fechar" id="dmFechar" aria-label="Fechar chat">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="dm-mensagens" id="dmMensagens"></div>
      <div class="dm-sugestoes" id="dmSugestoes">
        <button class="dm-sugestao">Como funciona a StarDev?</button>
        <button class="dm-sugestao">Por onde eu começo?</button>
        <button class="dm-sugestao">Quem são as Desenvolvedoras?</button>
        <button class="dm-sugestao">Quem é Lauane?</button>
        <button class="dm-sugestao">Quem é Melissa?</button>
      </div>
      <div class="dm-input-area">
        <textarea id="dmInput" rows="1" placeholder="Digite sua dúvida..." maxlength="500"></textarea>
        <button class="dm-enviar" id="dmEnviar" aria-label="Enviar mensagem">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7Z"/></svg>
        </button>
      </div>
    </div>
  `;

  document.addEventListener("DOMContentLoaded", () => {
    const host = document.createElement("div");
    host.id = "devMentorWidget";
    host.innerHTML = HTML_WIDGET;
    document.body.appendChild(host);

    const launcher = document.getElementById("dmLauncher");
    const janela = document.getElementById("dmJanela");
    const fechar = document.getElementById("dmFechar");
    const mensagensEl = document.getElementById("dmMensagens");
    const input = document.getElementById("dmInput");
    const enviarBtn = document.getElementById("dmEnviar");
    const sugestoesEl = document.getElementById("dmSugestoes");

    let jaAbriu = false;

    function abrir() {
      janela.classList.add("aberta");
      launcher.setAttribute("aria-expanded", "true");
      if (!jaAbriu) {
        adicionarMensagemBot(
          "Oi! Eu sou a Dev Mentor, a IA da StarDev 👾. Pode mandar sua dúvida sobre programação ou sobre a plataforma que eu te ajudo."
        );
        jaAbriu = true;
      }
      input.focus();
    }
    function fecharJanela() {
      janela.classList.remove("aberta");
      launcher.setAttribute("aria-expanded", "false");
    }

    launcher.addEventListener("click", () => {
      janela.classList.contains("aberta") ? fecharJanela() : abrir();
    });
    fechar.addEventListener("click", fecharJanela);

    function paginaAtual() {
      return location.pathname.split("/").pop() || "index.html";
    }

    function adicionarMensagemBot(texto) {
      const div = document.createElement("div");
      div.className = "dm-msg bot";
      div.innerHTML = `<span class="dm-prompt">Dev Mentor $</span>${escaparHTML(texto)}`;
      mensagensEl.appendChild(div);
      rolarParaFinal();
    }
    function adicionarMensagemUsuario(texto) {
      const div = document.createElement("div");
      div.className = "dm-msg user";
      div.textContent = texto;
      mensagensEl.appendChild(div);
      rolarParaFinal();
    }
    function mostrarDigitando() {
      const div = document.createElement("div");
      div.className = "dm-digitando";
      div.id = "dmDigitando";
      div.innerHTML = "<span></span><span></span><span></span>";
      mensagensEl.appendChild(div);
      rolarParaFinal();
    }
    function esconderDigitando() {
      document.getElementById("dmDigitando")?.remove();
    }
    function rolarParaFinal() {
      mensagensEl.scrollTop = mensagensEl.scrollHeight;
    }
    function escaparHTML(str) {
      const d = document.createElement("div");
      d.textContent = str;
      return d.innerHTML;
    }

    async function enviarMensagem(texto) {
      const mensagem = texto.trim();
      if (!mensagem) return;
      adicionarMensagemUsuario(mensagem);
      input.value = "";
      input.style.height = "auto";
      enviarBtn.disabled = true;
      sugestoesEl.style.display = "none";
      mostrarDigitando();

      try {
        const resp = await fetch(apiUrl("/chatback/chat"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: mensagem, pagina: paginaAtual() }),
        });
        const dados = await resp.json();
        esconderDigitando();
        adicionarMensagemBot(dados.reply || "Não consegui responder agora, tenta de novo em instantes.");
      } catch (erro) {
        esconderDigitando();
        adicionarMensagemBot(
          "Não consegui falar com o servidor da StarDev agora. Confirme se o back-end e o Ollama estão rodando e tente novamente."
        );
      } finally {
        enviarBtn.disabled = false;
      }
    }

    enviarBtn.addEventListener("click", () => enviarMensagem(input.value));
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" && !ev.shiftKey) {
        ev.preventDefault();
        enviarMensagem(input.value);
      }
    });
    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 90) + "px";
    });
    sugestoesEl.querySelectorAll(".dm-sugestao").forEach((btn) => {
      btn.addEventListener("click", () => enviarMensagem(btn.textContent));
    });
  });
})();
