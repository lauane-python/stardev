/** Mantém só dígitos, limitado a 11 (DDD + número) */
export function apenasDigitosTelefone(valor = "") {
  return valor.replace(/\D/g, "").slice(0, 11);
}

/** Formata dígitos em (XX) XXXXX-XXXX ou (XX) XXXX-XXXX conforme a quantidade */
export function formatarTelefoneBR(digitos = "") {
  const d = apenasDigitosTelefone(digitos);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Iniciais do nome para o avatar-placeholder, ex: "Lauane Pasquini" -> "LP" */
export function iniciaisNome(nome = "") {
  return (
    nome
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"
  );
}
