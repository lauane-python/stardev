const { MAX_HISTORY } = require("../config/chatConfig");

const MAX_SESSIONS = 200;
const sessoes = new Map();

function obterListaSessao(sessionId = "default") {
    const chave = String(sessionId || "default").slice(0, 120);
    if (!sessoes.has(chave)) {
        if (sessoes.size >= MAX_SESSIONS) {
            const primeiraChave = sessoes.keys().next().value;
            sessoes.delete(primeiraChave);
        }
        sessoes.set(chave, []);
    }
    return sessoes.get(chave);
}

function adicionarMensagem(remetente, mensagem, sessionId = "default") {
    const historico = obterListaSessao(sessionId);
    historico.push({ remetente, mensagem });
    if (historico.length > MAX_HISTORY) {
        historico.shift();
    }
}

function obterHistorico(sessionId = "default") {
    return obterListaSessao(sessionId).map(
        (item) => `${item.remetente}: ${item.mensagem}`
    );
}

function limparHistorico(sessionId = "default") {
    if (sessionId === "*") {
        sessoes.clear();
        return;
    }
    sessoes.delete(String(sessionId || "default").slice(0, 120));
}

function obterHistoricoCompleto(sessionId = "default") {
    return obterListaSessao(sessionId);
}

module.exports = {
    adicionarMensagem,
    obterHistorico,
    obterHistoricoCompleto,
    limparHistorico
};
