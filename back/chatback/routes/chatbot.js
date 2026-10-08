/**
 * ==========================================
 * DEV MENTOR
 * ROTAS DO CHATBOT
 * ==========================================
 */
const express = require("express");
const router = express.Router();
const validarMensagem = require(
    "../utils/validarMensagem"
);
const {
    adicionarMensagem,
    obterHistorico
} = require(
    "../utils/memoria"
);
const {
    montarContexto
} = require(
    "../services/ragService"
);
const gerarResposta = require(
    "../services/ollamaService"
);
/**
 * ==========================================
 * CHAT
 * ==========================================
 */
router.post("/chat", async (req, res) => {
    try {
        const {
            message,
            pagina,
            materiaId
        } = req.body;
        // valida mensagem
        if (!validarMensagem(message)) {
            return res.status(400).json({
                reply: "Digite uma mensagem válida."
            });
        }
        // histórico
        const historico = obterHistorico();
        // contexto
        const contexto = await montarContexto({
            historico,
            pagina,
            materiaId
        });
        // gerar resposta
        const resposta = await gerarResposta({
            pergunta: message,
            contexto
        });
        // memória
        adicionarMensagem(
            "Aluno",
            message
        );
        adicionarMensagem(
            "Dev Mentor",
            resposta
        );
        // resposta
        return res.json({
            reply: resposta
        });
    }
    catch (erro) {
        console.error("\n===== CHATBOT =====");
        console.error(erro);
        console.error("===================\n");
        return res.status(500).json({
            reply: "Erro interno da Dev Mentor."
        });
    }
});
module.exports = router;