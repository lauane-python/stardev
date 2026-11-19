const express = require("express");
const router = express.Router();
const validarMensagem = require("../utils/validarMensagem");
const { adicionarMensagem, obterHistorico } = require("../utils/memoria");
const { montarContexto } = require("../services/ragService");
const gerarResposta = require("../services/ollamaService");

router.post("/chat", async (req, res) => {
    try {
        const { message, pagina, materiaId } = req.body;
        if (!validarMensagem(message)) {
            return res.status(400).json({
                reply: "Digite uma mensagem válida."
            });
        }
        const historico = obterHistorico();
        const contexto = await montarContexto({
            historico,
            pagina,
            materiaId
        });
        const resposta = await gerarResposta({
            pergunta: message,
            contexto
        });
        adicionarMensagem("Aluno", message);
        adicionarMensagem("Dev Mentor", resposta);
        return res.json({
            reply: resposta
        });
    } catch (erro) {
        return res.status(500).json({
            reply: "Erro interno da Dev Mentor."
        });
    }
});

module.exports = router;
