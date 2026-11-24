/**
 * ==========================================================================
 * MASK.JS — MÁSCARAS DE ENTRADA E UTILITÁRIOS DE UX
 * ==========================================================================
 * Inclui:
 *   - Prefixo fixo +55 com bandeira do Brasil (🇧🇷 +55) e UX aprimorada
 *   - Máscara dinâmica de telefone brasileiro: (XX) XXXXX-XXXX
 *   - Tratamento automático de cola/digitação de 55 duplicado
 *   - Toggle de visualização de senha (olho aberto / fechado)
 *   - Checklist e medidor de força de senha
 * ==========================================================================
 */

function apenasDigitos(valor) {
  return (valor || "").replace(/\D/g, "");
}

/** Formata apenas o DDD + número para o input que já possui o prefixo +55 fixo */
function formatarApenasNumeroBR(digitos) {
  let d = apenasDigitos(digitos);
  // Se veio com 55 na frente (ex: 5518996890559), remove o 55
  if (d.startsWith("55") && d.length > 11) {
    d = d.slice(2);
  }
  d = d.slice(0, 11);

  if (!d) return "";

  const ddd = d.slice(0, 2);
  const resto = d.slice(2);

  let saida = "";
  if (ddd) saida += `(${ddd}`;
  if (ddd.length === 2) saida += ")";

  if (resto.length > 0 && ddd.length === 2) {
    saida += " ";
    if (resto.length <= 4) {
      saida += resto;
    } else if (resto.length <= 8) {
      saida += `${resto.slice(0, resto.length - 4)}-${resto.slice(-4)}`;
    } else {
      saida += `${resto.slice(0, 5)}-${resto.slice(5, 9)}`;
    }
  }
  return saida;
}

/** Formata telefone com +55 completo para exibição textual */
function formatarTelefoneBR(digitosCompletos) {
  let d = apenasDigitos(digitosCompletos);
  if (d.startsWith("55") && d.length > 11) {
    d = d.slice(2);
  }
  const numeroFormatado = formatarApenasNumeroBR(d);
  return numeroFormatado ? `+55 ${numeroFormatado}` : "";
}

/**
 * Cria o wrapper com o prefixo fixo "+55" visível e destacado (com bandeira do Brasil)
 * O span .tel-pais exibe o prefixo de forma não editável para uma melhor UX.
 */
function criarCampoTelefoneComPrefixo(input) {
  if (!input) return;

  // Atributos de usabilidade
  input.placeholder = "(18) 99689-0559";
  input.setAttribute("inputmode", "numeric");
  input.setAttribute("maxlength", "15");
  input.setAttribute("autocomplete", "tel-national");

  function aplicarMascara() {
    let digitos = apenasDigitos(input.value);

    // Se o usuário digitou ou colou o 55 no início junto com o DDD
    if (digitos.startsWith("55") && digitos.length > 11) {
      digitos = digitos.slice(2);
    }
    digitos = digitos.slice(0, 11);
    input.dataset.digitos = digitos;

    input.value = formatarApenasNumeroBR(digitos);
  }

  input.addEventListener("input", aplicarMascara);
  input.addEventListener("paste", () => setTimeout(aplicarMascara, 10));

  // Limpa se apenas DDD incompleto foi digitado ao sair do campo
  input.addEventListener("blur", () => {
    const d = apenasDigitos(input.value);
    if (d.length > 0 && d.length < 10) {
      input.dataset.digitos = "";
    }
  });

  // Se já possui o wrapper, não monta de novo
  if (input.parentElement?.classList.contains("telefone-prefixo-wrap")) {
    // Apenas garante o valor formatado
    if (input.dataset.digitos) {
      input.value = formatarApenasNumeroBR(input.dataset.digitos);
    }
    return;
  }

  const wrap = document.createElement("div");
  wrap.className = "telefone-prefixo-wrap";

  const span = document.createElement("span");
  span.className = "tel-pais";
  span.setAttribute("title", "Código do Brasil (+55) fixo");
  span.setAttribute("aria-label", "Código do país +55 Brasil fixo");
  span.innerHTML = `<span class="tel-pais-flag">🇧🇷</span> +55`;

  // Clicar no prefixo foca o campo de entrada
  span.addEventListener("click", () => input.focus());

  input.parentNode.insertBefore(wrap, input);
  wrap.appendChild(span);
  wrap.appendChild(input);

  // Formata valor inicial se houver
  if (input.value) {
    aplicarMascara();
  }
}

/** Ativa máscara de telefone — mantém compatibilidade */
function ativarMascaraTelefone(input) {
  criarCampoTelefoneComPrefixo(input);
}

/** Retorna somente os 10 ou 11 dígitos válidos para envio ao back-end */
function digitosTelefone(input) {
  let digitos = input?.dataset?.digitos || apenasDigitos(input?.value || "");
  if (digitos.startsWith("55") && digitos.length > 11) {
    digitos = digitos.slice(2);
  }
  return digitos.slice(0, 11);
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
