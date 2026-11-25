/**
 * ==========================================================================
 * RECUPERAR-SENHA.JS
 * Etapa 1: POST /verificarEmail  -> confere se o e-mail existe
 * Etapa 2: PUT  /recuperarSenha  -> grava a nova senha (com hash no back-end)
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  const formEmail = document.getElementById("formEmailRec");
  const formSenha = document.getElementById("formNovaSenha");
  const aviso = document.getElementById("recAviso");
  const btnVerificar = document.getElementById("btnVerificarEmail");
  const btnRedefinir = document.getElementById("btnRedefinir");

  document.querySelectorAll(".btn-olho").forEach(ativarOlhoSenha);

  let emailConfirmado = "";

  formEmail.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    aviso.className = "form-aviso";
    const email = document.getElementById("recEmail").value.trim();

    btnVerificar.disabled = true;
    btnVerificar.textContent = "Verificando...";

    try {
      const existe = await checarEmailExiste(email);
      if (existe) {
        emailConfirmado = email;
        formEmail.style.display = "none";
        formSenha.style.display = "block";
        aviso.textContent = "E-mail confirmado! Agora defina sua nova senha.";
        aviso.classList.add("mostrar", "ok");
      } else {
        aviso.textContent = "Não encontramos esse e-mail cadastrado na StarDev.";
        aviso.classList.add("mostrar", "erro");
      }
    } catch (erro) {
      aviso.textContent = "Não foi possível falar com o servidor da StarDev. Verifique se o back-end está rodando.";
      aviso.classList.add("mostrar", "erro");
    } finally {
      btnVerificar.disabled = false;
      btnVerificar.textContent = "Verificar e-mail";
    }
  });

  formSenha.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    aviso.className = "form-aviso";

    const novaSenha = document.getElementById("recNovaSenha").value;
    const confirma = document.getElementById("recNovaSenhaConfirma").value;

    if (novaSenha.length < 6) {
      aviso.textContent = "A nova senha deve ter pelo menos 6 caracteres.";
      aviso.classList.add("mostrar", "erro");
      return;
    }
    if (novaSenha !== confirma) {
      aviso.textContent = "As senhas não coincidem.";
      aviso.classList.add("mostrar", "erro");
      return;
    }

    btnRedefinir.disabled = true;
    btnRedefinir.textContent = "Salvando...";

    try {
      const dados = await enviarRecuperarSenha({ email: emailConfirmado, novaSenha });
      const sucesso = /sucesso/i.test(dados.resposta || "");
      aviso.textContent = dados.resposta || "Não foi possível redefinir a senha.";
      aviso.classList.add("mostrar", sucesso ? "ok" : "erro");

      if (sucesso) {
        mostrarToast("Senha redefinida! Faça login com a nova senha.", "ok");
        setTimeout(() => (window.location.href = "login.html"), 1500);
      }
    } catch (erro) {
      aviso.textContent = "Não foi possível falar com o servidor da StarDev.";
      aviso.classList.add("mostrar", "erro");
    } finally {
      btnRedefinir.disabled = false;
      btnRedefinir.textContent = "Redefinir senha";
    }
  });
});
