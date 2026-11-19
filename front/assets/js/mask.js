function apenasDigitos(valor) {
  return (valor || "").replace(/\D/g, "");
}

function formatarApenasNumeroBR(digitos) {
  let d = apenasDigitos(digitos);
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

function formatarTelefoneBR(digitosCompletos) {
  let d = apenasDigitos(digitosCompletos);
  if (d.startsWith("55") && d.length > 11) {
    d = d.slice(2);
  }
  const numeroFormatado = formatarApenasNumeroBR(d);
  return numeroFormatado ? `+55 ${numeroFormatado}` : "";
}

function criarCampoTelefoneComPrefixo(input) {
  if (!input) return;

  input.placeholder = "(18) 99689-0559";
  input.setAttribute("inputmode", "numeric");
  input.setAttribute("maxlength", "15");
  input.setAttribute("autocomplete", "tel-national");

  function aplicarMascara() {
    let digitos = apenasDigitos(input.value);

    if (digitos.startsWith("55") && digitos.length > 11) {
      digitos = digitos.slice(2);
    }
    digitos = digitos.slice(0, 11);
    input.dataset.digitos = digitos;
    input.value = formatarApenasNumeroBR(digitos);
  }

  input.addEventListener("input", aplicarMascara);
  input.addEventListener("paste", () => setTimeout(aplicarMascara, 10));

  input.addEventListener("blur", () => {
    const d = apenasDigitos(input.value);
    if (d.length > 0 && d.length < 10) {
      input.dataset.digitos = "";
    }
  });

  if (input.parentElement?.classList.contains("telefone-prefixo-wrap")) {
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
  span.innerHTML = `<span class="tel-pais-badge">BR</span> +55`;

  span.addEventListener("click", () => input.focus());

  input.parentNode.insertBefore(wrap, input);
  wrap.appendChild(span);
  wrap.appendChild(input);

  if (input.value) {
    aplicarMascara();
  }
}

function ativarMascaraTelefone(input) {
  criarCampoTelefoneComPrefixo(input);
}

function digitosTelefone(input) {
  let digitos = input?.dataset?.digitos || apenasDigitos(input?.value || "");
  if (digitos.startsWith("55") && digitos.length > 11) {
    digitos = digitos.slice(2);
  }
  return digitos.slice(0, 11);
}

function ativarOlhoSenha(btn) {
  const alvoId = btn.getAttribute("data-olho-de");
  const input = document.getElementById(alvoId);
  if (!input) return;

  function renderIcone(aberto) {
    btn.innerHTML = aberto
      ? `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
      : `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  }

  renderIcone(false);
  btn.addEventListener("click", () => {
    const atual = input.type === "text";
    input.type = atual ? "password" : "text";
    renderIcone(!atual);
    btn.setAttribute("aria-label", atual ? "Mostrar senha" : "Ocultar senha");
  });
}

function avaliarForcaSenha(senha, elBarra, elChecklist) {
  const regras = {
    tamanho: senha.length >= 8,
    maiuscula: /[A-Z]/.test(senha),
    minuscula: /[a-z]/.test(senha),
    numero: /[0-9]/.test(senha),
    especial: /[@$!%*?&.#_-]/.test(senha),
  };

  let pontos = 0;
  Object.entries(regras).forEach(([regra, ok]) => {
    if (ok) pontos++;
    if (elChecklist) {
      const li = elChecklist.querySelector(`[data-regra="${regra}"]`);
      if (li) li.classList.toggle("ok", ok);
    }
  });

  if (elBarra) {
    elBarra.className = "forca-senha";
    if (pontos === 0) {
    } else if (pontos <= 2) {
      elBarra.classList.add("fraca");
    } else if (pontos <= 4) {
      elBarra.classList.add("media");
    } else {
      elBarra.classList.add("forte");
    }
  }

  return pontos === 5;
}

function inicializarMascarasGlobais() {
  document.querySelectorAll('input[type="tel"]').forEach((input) => {
    criarCampoTelefoneComPrefixo(input);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarMascarasGlobais);
} else {
  inicializarMascarasGlobais();
}
