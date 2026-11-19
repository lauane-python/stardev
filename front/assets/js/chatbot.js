(function iniciarDevMentor() {
  const RESPOSTAS_PLATAFORMA = [
    {
      chaves: ["bloco de nota", "anotac", "circulo", "sobrepor", "youtube", "tela cheia", "tela expandida", "expandir", "anotar"],
      resposta: "Durante as videoaulas na StarDev, você conta com um bloco de notas integrado ao vídeo:\n\n- Círculo com a logo StarDev: Fica flutuando sobre o vídeo enquanto você assiste.\n- Ao clicar no círculo: Ele se expande e vira um pequeno bloco de notas para você escrever sem pausar o vídeo.\n- Salvamento automático: Conforme você digita, tudo é salvo automaticamente com o nome da matéria e o nome da aula atual.\n- Sobreposição do YouTube em tela expandida: Se você colocar em tela cheia ou expandida pelo botão de expandir do player, o círculo e o bloco de notas continuam sobrepondo o YouTube normalmente para que você anote à vontade.\n\nPara rever suas anotações antigas, basta abrir o menu lateral e clicar na aba Anotações."
    },
    {
      chaves: ["minhas anotac", "antiga", "menu hamburguer", "menu lateral", "onde vejo minhas notas", "anotacoes"],
      resposta: "Para acessar suas anotações antigas:\n\n- Abra o menu lateral no topo da Área do Aluno.\n- Clique na aba Anotações.\n- Suas anotações aparecerão agrupadas pelo nome da matéria e aula onde foram feitas.\n- Você pode ler o texto, copiar, excluir ou clicar para ir direto para a aula correspondente."
    },
    {
      chaves: ["dashboard", "onde parou", "onde parei", "continue de onde", "continuar aula", "video especial", "exclusivo", "introducao", "minha conta", "inicio"],
      resposta: "Após fazer login na StarDev, a tela de Início traz recursos exclusivos para quem tem conta:\n\n- Continue de onde parou: Mostra a última matéria e aula que você assistiu, com um botão direto para você continuar seus estudos de onde parou com apenas um clique.\n- Vídeo especial para cadastrados: Área com um vídeo gravado pelas fundadoras da StarDev exclusivo para alunos cadastrados, trazendo orientações e boas-vindas.\n- Breve introdução: Uma mensagem acolhedora que explica o funcionamento das trilhas e da plataforma."
    },
    {
      chaves: ["+55", "telefone", "ddi", "prefixo", "brasil", "55", "celular"],
      resposta: "No cadastro e no perfil da StarDev, o prefixo +55 é fixo e visível na interface:\n\n- O +55 não pode ser apagado nem editado pelo usuário, garantindo uma melhor experiência de uso.\n- Você deve digitar apenas o DDD e o seu número (por exemplo: 18 99689-0559).\n- O campo aplica a formatação automaticamente à medida que você digita."
    },
    {
      chaves: ["lauane", "melissa", "fundador", "criou", "criadora", "autora", "quem fez", "historia"],
      resposta: "A StarDev foi criada por Lauane Pasquini Ribeiro e Melissa Vieira durante a formação em Desenvolvimento de Sistemas no SENAI:\n\n- Lauane Pasquini Ribeiro: Descobriu sua vocação em tecnologia durante o curso e especializou-se no desenvolvimento Front-end e criação de interfaces.\n- Melissa Vieira: Conquistou destaque na seleção do curso e dedica-se ao desenvolvimento Back-end e bancos de dados.\n- As duas desenvolveram a StarDev com o objetivo de apoiar estudantes iniciantes com trilhas guiadas e didáticas."
    },
    {
      chaves: ["cadastr", "criar conta", "registrar"],
      resposta: "Para criar sua conta gratuita:\n\n- Clique em Criar conta na página inicial.\n- Preencha nome completo, e-mail, telefone (com DDD, o +55 já é fixo) e uma senha segura com 8 ou mais caracteres.\n- Confirme a senha e finalize o cadastro. O acesso é liberado imediatamente."
    },
    {
      chaves: ["login", "entrar", "acessar"],
      resposta: "Para entrar na sua conta:\n\n- Clique em Entrar no menu superior.\n- Informe seu e-mail e sua senha cadastrados.\n- Clique em Entrar para acessar a Área do Aluno."
    },
    {
      chaves: ["esqueci", "recuperar", "redefinir", "trocar senha"],
      resposta: "Se você esqueceu sua senha:\n\n- Clique no link Esqueci minha senha na tela de login.\n- Digite o e-mail cadastrado e defina sua nova senha.\n- Confirme a alteração para voltar a acessar a plataforma normalmente."
    },
    {
      chaves: ["trilha", "materia", "disciplina", "curso", "aulas"],
      resposta: "A StarDev conta com 12 disciplinas completas do iniciante ao avançado:\n\n- Fundamentos da Programação, Lógica de Programação, Desenvolvimento Web\n- Front-end, Back-end, Banco de Dados\n- Projetos de Software, Segurança da Informação, Código Limpo\n- Desenvolvimento Mobile, Redes e IoT, Linguagem de Programação\n\nVocê pode acessar todas elas pela aba Trilhas na Área do Aluno."
    },
    {
      chaves: ["gratis", "gratuito", "pago", "preco", "valor", "pagar"],
      resposta: "A StarDev é 100% gratuita. Todas as videoaulas, ferramentas de anotação e as orientações da Dev Mentor estão disponíveis sem nenhum custo."
    },
    {
      chaves: ["certificado"],
      resposta: "A StarDev é uma plataforma educacional desenvolvida no âmbito do SENAI. A emissão de certificados está em fase de planejamento conforme a plataforma continua avançando."
    },
    {
      chaves: ["contato", "suporte", "falar com", "feedback"],
      resposta: "Você pode falar com a equipe da StarDev pela opção Falar com a StarDev no menu lateral ou pela seção de contato na página inicial. Sua mensagem é enviada diretamente às fundadoras."
    }
  ];

  function removerEmojis(txt = "") {
    return txt
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function normalizar(txt = "") {
    return txt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }

  function obterRespostaLocal(pergunta) {
    const q = normalizar(pergunta);
    for (const item of RESPOSTAS_PLATAFORMA) {
      if (item.chaves.some(k => q.includes(normalizar(k)))) {
        return removerEmojis(item.resposta);
      }
    }
    return (
      "Olá. Sou a Dev Mentor da StarDev. Posso te responder qualquer dúvida sobre a plataforma " +
      "(como o bloco de notas sobreposto ao vídeo, a tela de Início com onde você parou, a aba de Anotações no menu, " +
      "ou o telefone com +55 fixo) ou tirar dúvidas sobre programação. O que gostaria de saber?"
    );
  }

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
          <small>online · StarDev</small>
        </div>
        <button class="dm-fechar" id="dmFechar" aria-label="Fechar chat">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="dm-mensagens" id="dmMensagens"></div>
      <div class="dm-sugestoes" id="dmSugestoes">
        <button class="dm-sugestao">Como funciona o bloco de notas?</button>
        <button class="dm-sugestao">Onde vejo onde parei?</button>
        <button class="dm-sugestao">Quem são as fundadoras?</button>
        <button class="dm-sugestao">Onde vejo minhas anotações?</button>
      </div>
      <div class="dm-input-area">
        <textarea id="dmInput" rows="1" placeholder="Digite sua dúvida sobre a StarDev..." maxlength="500"></textarea>
        <button class="dm-enviar" id="dmEnviar" aria-label="Enviar mensagem">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7Z"/></svg>
        </button>
      </div>
    </div>
  `;

  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("devMentorWidget")) return;

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
          "Olá. Sou a Dev Mentor da StarDev. Pode enviar qualquer dúvida sobre a plataforma ou sobre programação que te ajudo agora mesmo."
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
      const textoLimpo = removerEmojis(texto || "");
      div.innerHTML = `<span class="dm-prompt">Dev Mentor:</span>${escaparHTML(textoLimpo).replace(/\n/g, "<br>")}`;
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
      d.textContent = str || "";
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

        if (!resp.ok) throw new Error("Status " + resp.status);
        const dados = await resp.json();
        esconderDigitando();
        adicionarMensagemBot(dados.reply || obterRespostaLocal(mensagem));
      } catch (erro) {
        esconderDigitando();
        adicionarMensagemBot(obterRespostaLocal(mensagem));
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
