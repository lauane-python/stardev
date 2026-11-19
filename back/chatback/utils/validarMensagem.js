function validarMensagem(mensagem) {
    if (mensagem === undefined || mensagem === null) {
        return false;
    }
    if (typeof mensagem !== "string") {
        return false;
    }
    mensagem = mensagem.trim();
    if (mensagem.length === 0) {
        return false;
    }
    if (mensagem.length > 500) {
        return false;
    }
    return true;
}
module.exports = validarMensagem;