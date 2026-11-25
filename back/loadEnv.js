const fs = require("fs");
const path = require("path");

/**
 * Carrega variáveis do arquivo back/.env para process.env sem sobrescrever
 * variáveis já definidas no ambiente (ex: Render/produção).
 */
function carregarEnv() {
    const envPath = path.join(__dirname, ".env");
    if (!fs.existsSync(envPath)) return;

    try {
        const conteudo = fs.readFileSync(envPath, "utf8");
        for (const linhaBruta of conteudo.split(/\r?\n/)) {
            const linha = linhaBruta.trim();
            if (!linha || linha.startsWith("#")) continue;

            const idx = linha.indexOf("=");
            if (idx === -1) continue;

            const chave = linha.slice(0, idx).trim();
            let valor = linha.slice(idx + 1).trim();

            if (
                (valor.startsWith('"') && valor.endsWith('"')) ||
                (valor.startsWith("'") && valor.endsWith("'"))
            ) {
                valor = valor.slice(1, -1);
            }

            if (chave && !(chave in process.env)) {
                process.env[chave] = valor;
            }
        }
    } catch (erro) {
        console.warn("Aviso ao ler .env:", erro.message);
    }
}

carregarEnv();

module.exports = carregarEnv;
