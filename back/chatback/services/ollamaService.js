/**
 * ==========================================
 * DEV MENTOR
 * GROQ SERVICE (substitui o Ollama local)
 * ==========================================
 */
const axios = require("axios");
const {
    BOT_NAME,
    PLATFORM_NAME,
    TEMPERATURE,
    MAX_TOKENS
} = require("../config/chatConfig");

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

// Gera uma resposta utilizando a Groq
async function gerarResposta({
    pergunta,
    contexto
}) {
    const systemPrompt = `
Você é a ${BOT_NAME}.
Você é a inteligência artificial oficial da plataforma ${PLATFORM_NAME}.
Seu objetivo é ensinar programação para estudantes iniciantes e intermediários.
Nunca diga que é o ChatGPT.
Nunca diga que é uma IA da OpenAI.
Nunca invente funcionalidades da plataforma.
Sempre responda em português do Brasil.
Explique de forma simples.
Quando possível, utilize exemplos.
Se o aluno pedir ajuda em programação, ensine passo a passo.
Se a pergunta não tiver relação com programação ou com a plataforma StarDev, responda educadamente que seu foco é auxiliar nos estudos de tecnologia.
==============================
BASE DE CONHECIMENTO
==============================
${contexto.baseConhecimento}
==============================
CONTEXTO DA PÁGINA
==============================
${contexto.contextoPagina}
`.trim();

    const mensagens = [
        { role: "system", content: systemPrompt },
        ...contexto.historico.map((linha) => {
            const ehAluno = linha.startsWith("Aluno:");
            return {
                role: ehAluno ? "user" : "assistant",
                content: linha.replace(/^(Aluno|Dev Mentor):\s*/, "")
            };
        }),
        { role: "user", content: pergunta }
    ];

    try {
        const response = await axios.post(
            GROQ_URL,
            {
                model: GROQ_MODEL,
                messages: mensagens,
                temperature: TEMPERATURE,
                max_tokens: MAX_TOKENS
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return response.data.choices[0].message.content.trim();
    } catch (erro) {
        console.error("\n========== GROQ ==========");
        console.error(erro.message);
        if (erro.response) {
            console.error(erro.response.data);
        }
        console.error("===========================\n");
        return "Desculpe, não consegui responder agora. Tente novamente em alguns instantes.";
    }
}

module.exports = gerarResposta;
