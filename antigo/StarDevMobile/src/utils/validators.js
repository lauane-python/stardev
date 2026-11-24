/**
 * Validações no cliente — espelham exatamente as regras do back-end
 * (back/server.js), pra dar feedback imediato antes de bater na API.
 * A validação "de verdade" continua sendo feita no servidor.
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SENHA_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/;

export const TELEFONE_REGEX = /^\d{10,11}$/;

export const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})(\?.*)?$/;

export function validarEmail(email = "") {
  return EMAIL_REGEX.test(email.trim());
}

export function validarSenha(senha = "") {
  return SENHA_REGEX.test(senha.trim());
}

export function mensagemRegraSenha() {
  return "A senha deve possuir no mínimo 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial.";
}

export function validarTelefoneDigitos(digitos = "") {
  return TELEFONE_REGEX.test(digitos);
}

export function validarNome(nome = "") {
  return nome.trim().length >= 6;
}

/** Extrai o ID de um link do YouTube (watch?v= ou youtu.be/) */
export function extrairIdYoutube(link = "") {
  const m = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
