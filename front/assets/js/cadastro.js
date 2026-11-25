document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formCadastro");
  if (!form) return;

  const aviso = document.getElementById("cadastroAviso");
  const botao = document.getElementById("btnCadastrar");
  const campoTelefone = document.getElementById("cadTelefone");
  const campoSenha = document.getElementById("cadSenha");
  const campoConfirma = document.getElementById("cadSenhaConfirma");
  const barraForca = document.getElementById("cadForcaBarra");
  const checklist = document.getElementById("cadChecklist");

  if (typeof Auth !== "undefined" && Auth.logado()) {
    window.location.href = "area-aluno.html";
  }

  ativarMascaraTelefone(campoTelefone);

  document.querySelectorAll(".btn-olho").forEach(ativarOlhoSenha);

  let senhaValida = false;
  campoSenha.addEventListener("input", () => {
    senhaValida = avaliarForcaSenha(campoSenha.value, barraForca, checklist);
  });

  function mostrarErroCampo(id, mensagem) {
    const el = document.querySelector(`[data-erro-de="${id}"]`);
    const input = document.getElementById(id);
    if (el) el.textContent = mensagem || "";
    if (input) input.classList.toggle("campo-erro", !!mensagem);
  }

  function limparErros() {
    form.querySelectorAll(".msg-campo").forEach((el) => (el.textContent = ""));
    form.querySelectorAll("input").forEach((el) => el.classList.remove("campo-erro"));
  }

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    limparErros();
    aviso.className = "form-aviso";

    const nome = form.nome.value.trim();
    const email = form.email.value.trim();
    const telefone = digitosTelefone(campoTelefone);
    const senha = campoSenha.value;
    const senhaConfirma = campoConfirma.value;

    let temErro = false;
    if (nome.length < 6) { mostrarErroCampo("cadNome", "Digite seu nome completo."); temErro = true; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { mostrarErroCampo("cadEmail", "Digite um e-mail válido."); temErro = true; }
    if (!/^\d{10,11}$/.test(telefone)) { mostrarErroCampo("cadTelefone", "Telefone incompleto — inclua o DDD."); temErro = true; }
    if (!senhaValida) { mostrarErroCampo("cadSenha", " "); temErro = true; }
    if (senha !== senhaConfirma) { mostrarErroCampo("cadSenhaConfirma", "As senhas não coincidem."); temErro = true; }

    if (temErro) {
      aviso.textContent = "Revise os campos destacados abaixo.";
      aviso.classList.add("mostrar", "erro");
      return;
    }

    botao.disabled = true;
    botao.textContent = "Criando conta...";

    try {
      const dados = await enviarCadastro({ nome, email, senha, telefone });
      const sucesso = /sucesso/i.test(dados.resposta || "");

      aviso.textContent = dados.resposta || "Não foi possível concluir o cadastro.";
      aviso.classList.add("mostrar", sucesso ? "ok" : "erro");

      if (sucesso) {
        mostrarToast("Conta criada! Redirecionando para o login...", "ok");
        setTimeout(() => (window.location.href = "login.html"), 1500);
      }
    } catch (erro) {
      aviso.textContent = "Não foi possível falar com o servidor da StarDev. Verifique se o back-end está rodando.";
      aviso.classList.add("mostrar", "erro");
    } finally {
      botao.disabled = false;
      botao.textContent = "Criar minha conta";
    }
  });
});
