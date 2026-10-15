// DEV MENTOR
const {
    MAX_HISTORY
} = require("../config/chatConfig");
let historico = [];
// Adiciona uma mensagem ao histórico
function adicionarMensagem(remetente, mensagem) {
    historico.push({
        remetente,
        mensagem
    });
    // mantém somente as últimas mensagens
    if (historico.length > MAX_HISTORY) {
        historico.shift();
    }
}
//Retorna o histórico formatado para a IA
function obterHistorico() {
    return historico.map(item => {
        return `${item.remetente}: ${item.mensagem}`;
    });
}
// Limpa todo o histórico
function limparHistorico() {
    historico = [];
}
// Retorna o histórico bruto
function obterHistoricoCompleto() {
    return historico;
}
module.exports = {
    adicionarMensagem,
    obterHistorico,
    obterHistoricoCompleto,
    limparHistorico
};