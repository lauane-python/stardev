function apenasDigitos(valor) {
  return (valor || "").replace(/\D/g, "");
}

function formatarTelefoneBR(digitosCompletos) {
  let d = digitosCompletos;

  if (d.startsWith("55") && d.length > 11) {
    d = d.slice(2);
  }

  const ddd = d.slice(0, 2);
  const resto = d.slice(2);

  let saida = "+55";
  if (ddd) saida += ` (${ddd}`;
  if (ddd.length === 2) saida += ")";

  if (resto.length <= 4) {
    if (resto) saida += ` ${resto}`;
  } else if (resto.length <= 8) {
    saida += ` ${resto.slice(0, resto.length - 4)}-${resto.slice(-4)}`;
  } else {
    saida += ` ${resto.slice(0, 5)}-${resto.slice(5, 9)}`;
  }
  return saida.trim();
}
function ativarMascaraTelefone(input) {
  if (!input) return;
  input.placeholder = "+55 (18) 99689-0559";
  input.setAttribute("inputmode", "numeric");
  input.setAttribute("maxlength", "19");

  input.addEventListener("input", () => {
    let digitos = apenasDigitos(input.value);
    if (digitos.startsWith("55")) digitos = digitos.slice(2);
    digitos = digitos.slice(0, 11); // DDD + até 9 dígitos
    input.dataset.digitos = digitos;
    input.value = digitos ? formatarTelefoneBR(digitos) : "";
  });

  input.addEventListener("blur", () => {
    if (input.value === "+55") input.value = "";
  });
}

/** Retorna somente os dígitos válidos (para enviar ao back-end) de um input mascarado */
function digitosTelefone(input) {
  return input?.dataset?.digitos || apenasDigitos(input?.value || "");
}

function ativarOlhoSenha(botao) {
  const alvoId = botao.dataset.olhoDe;
  const input = document.getElementById(alvoId);
  if (!input) return;

  botao.addEventListener("click", () => {
    const visivel = input.type === "text";
    input.type = visivel ? "password" : "text";
    botao.innerHTML = visivel ? svgOlhoAberto() : svgOlhoFechado();
    botao.setAttribute("aria-label", visivel ? "Mostrar senha" : "Ocultar senha");
    input.focus({ preventScroll: true });
  });

  botao.innerHTML = svgOlhoAberto();
}

function svgOlhoAberto() {
  return `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"/><circle cx="12" cy="12" r="3"/></svg>`;
}
function svgOlhoFechado() {
  return `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3l18 18"/><path d="M10.6 5.2A10.9 10.9 0 0 1 12 5c7 0 10.5 7 10.5 7a13.6 13.6 0 0 1-3.1 4.1M6.6 6.6C3.5 8.5 1.5 12 1.5 12s3.5 7 10.5 7a10.7 10.7 0 0 0 4.4-.9"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>`;
}


function avaliarForcaSenha(senha, elementoBarra, elementoChecklist) {
  const regras = {
    tamanho: senha.length >= 8,
    minuscula: /[a-z]/.test(senha),
    maiuscula: /[A-Z]/.test(senha),
    numero: /\d/.test(senha),
    especial: /[@$!%*?&.#_-]/.test(senha),
  };
  const pontos = Object.values(regras).filter(Boolean).length;

  if (elementoBarra) {
    const barras = elementoBarra.querySelectorAll(".forca-barra");
    const cores = ["#a5333a", "#a5333a", "#eace76", "#eace76", "#707039"];
    barras.forEach((b, i) => {
      b.style.background = i < pontos ? cores[pontos - 1] : "rgba(129,68,86,.12)";
    });
  }

  if (elementoChecklist) {
    elementoChecklist.querySelectorAll("li").forEach((li) => {
      const regra = li.dataset.regra;
      li.classList.toggle("ok", !!regras[regra]);
    });
  }

  return pontos === 5;
}
