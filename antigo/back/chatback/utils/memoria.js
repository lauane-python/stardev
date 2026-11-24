const {
    MAX_HISTORY
} = require("../config/chatConfig");
let historico = [];
function adicionarMensagem(remetente, mensagem) {
    historico.push({
        remetente,
        mensagem
    });
    if (historico.length > MAX_HISTORY) {
        historico.shift();
    }
}
function obterHistorico() {
    return historico.map(item => {
        return `${item.remetente}: ${item.mensagem}`;
    });
}
function limparHistorico() {
    historico = [];
}
function obterHistoricoCompleto() {
    return historico;
}
module.exports = {
    adicionarMensagem,
    obterHistorico,
    obterHistoricoCompleto,
    limparHistorico
};