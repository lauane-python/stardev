const STARDEV_CONFIG = {
  API_BASE: "https://stardev-d20v.onrender.com",
  CHAVE_TOKEN: "stardev_token",
  CHAVE_USUARIO: "stardev_usuario",
};

/*Monta a URL completa de um endpoint do back*/
function apiUrl(caminho) {
  return `${STARDEV_CONFIG.API_BASE}${caminho.startsWith("/") ? "" : "/"}${caminho}`;
}
