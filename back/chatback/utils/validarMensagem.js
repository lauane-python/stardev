/*DEV MENTOR Validação de mensagens*/
function validarMensagem(mensagem) {
    // mensagem inexistente
    if (mensagem === undefined || mensagem === null) {
        return false;
    }
    // precisa ser string
    if (typeof mensagem !== "string") {
        return false;
    }
    // remove espaços do começo/fim
    mensagem = mensagem.trim();
    // mensagem vazia
    if (mensagem.length === 0) {
        return false;
    }
    // limite máximo
    if (mensagem.length > 500) {
        return false;
    }
    return true;
}
module.exports = validarMensagem;