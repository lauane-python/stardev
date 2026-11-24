/**
 * ==========================================================================
 * LOGIN.JS — envio para POST /login e redirecionamento por nível
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formLogin");
  if (!form) return;

  const aviso = document.getElementById("loginAviso");
  const botao = document.getElementById("btnEntrar");

  if (typeof Auth !== "undefined" && Auth.logado()) {
    window.location.href = Auth.nivel() === "A" ? "admin.html" : "area-aluno.html";
    return;
  }

  document.querySelectorAll(".btn-olho").forEach(ativarOlhoSenha);

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    aviso.className = "form-aviso";

    const email = form.email.value.trim();
    const senha = form.senha.value;

    botao.disabled = true;
    botao.textContent = "Entrando...";

    try {
      const dados = await enviarLogin({ email, senha });

      if (dados.token) {
        mostrarToast("Login realizado! Bem-vindo(a) de volta 👋", "ok");
        setTimeout(() => {
          window.location.href = dados.nivel === "A" ? "admin.html" : "area-aluno.html";
        }, 700);
      } else {
        aviso.textContent = dados.resposta || "E-mail ou senha incorretos.";
        aviso.classList.add("mostrar", "erro");
      }
    } catch (erro) {
      aviso.textContent = "Não foi possível falar com o servidor da StarDev. Verifique se o back-end está rodando.";
      aviso.classList.add("mostrar", "erro");
    } finally {
      botao.disabled = false;
      botao.textContent = "Entrar";
    }
  });
});
