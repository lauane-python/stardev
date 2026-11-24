export const API_CONFIG = {
  API_BASE: "http://10.0.2.2:3000",
  CHAVE_TOKEN: "stardev_token",
  CHAVE_USUARIO: "stardev_usuario",
  TIMEOUT_MS: 12000,
};

export function apiUrl(caminho) {
  if (/^https?:\/\//i.test(caminho)) return caminho;
  return `${API_CONFIG.API_BASE}${caminho.startsWith("/") ? "" : "/"}${caminho}`;
}

export async function fetchComTimeout(url, options = {}, timeout = API_CONFIG.TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const resp = await fetch(url, { ...options, signal: controller.signal });
    return resp;
  } finally {
    clearTimeout(id);
  }
}

export default API_CONFIG;
