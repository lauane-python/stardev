const express = require("express");
const router = express.Router();
const validarMensagem = require("../utils/validarMensagem");
const { adicionarMensagem, obterHistorico } = require("../utils/memoria");
const { montarContexto } = require("../services/ragService");
const gerarResposta = require("../services/ollamaService");
const { BOT_NAME } = require("../config/chatConfig");

router.post("/chat", async (req, res) => {
    try {
        const { message, pagina, materiaId, sessionId } = req.body || {};
        if (!validarMensagem(message)) {
            return res.status(400).json({
                reply: "Digite uma mensagem válida."
            });
        }

        const chaveSessao = sessionId || req.ip || "default";
        const historico = obterHistorico(chaveSessao);
        const contexto = await montarContexto({
            pergunta: message,
            historico,
            pagina,
            materiaId
        });
        const resposta = await gerarResposta({
            pergunta: message,
            contexto
        });

        adicionarMensagem("Aluno", message.trim(), chaveSessao);
        adicionarMensagem(BOT_NAME, resposta, chaveSessao);

        return res.json({ reply: resposta });
    } catch (erro) {
        console.error("Erro no chatbot:", erro);
        return res.status(500).json({
            reply: `Erro interno da ${BOT_NAME}.`
        });
    }
});

module.exports = router;
