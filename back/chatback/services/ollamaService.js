/**
 * ==========================================
 * DEV MENTOR
 * GROQ SERVICE
 * ==========================================
 */
const axios = require("axios");
const limparMarkdown = require("../utils/limparMarkdown");
const {
    BOT_NAME,
    PLATFORM_NAME,
    TEMPERATURE,
    MAX_TOKENS
} = require("../config/chatConfig");
const GROQ_URL =
    "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL =
    process.env.GROQ_MODEL ||
    "llama-3.1-8b-instant";
// ==========================================
// GERA RESPOSTA
// ==========================================
async function gerarResposta({
    pergunta,
    contexto
}) {
    const materia =
        contexto.contextoPagina?.materia;
    const nomeMateria =
        materia?.nome ||
        "não identificada";
    const aulas =
        materia?.aulas || [];
    const listaAulas =
        aulas.length > 0
            ? aulas
                .map(
                    aula =>
                        `- ${aula.nome}: ${aula.descricao || ""}`
                )
                .join("\n")
            : "Nenhuma aula cadastrada encontrada.";
    const systemPrompt = `
Você é a ${BOT_NAME}.
Você é a inteligência artificial oficial da plataforma ${PLATFORM_NAME}.
Seu objetivo é auxiliar estudantes iniciantes e intermediários no aprendizado de tecnologia e programação.
==============================
REGRAS PRINCIPAIS
==============================
- Nunca diga que é o ChatGPT.
- Nunca diga que é uma IA da OpenAI.
- Nunca invente funcionalidades da plataforma.
- Nunca invente informações sobre a StarDev, suas fundadoras ou suas aulas.
- Sempre responda em português do Brasil.
- Responda SOMENTE em texto puro. Nunca use Markdown: nada de **negrito**, *itálico*, # títulos, blocos de código ou tabelas. Para listas, use "- " no início de cada linha e separe os parágrafos com uma linha em branco.
- Explique de maneira simples, clara e didática.
- Considere que o aluno pode ser iniciante.
- Quando necessário, utilize exemplos.
- Quando o aluno pedir ajuda com programação, explique passo a passo.
- Não responda algo genérico quando existir contexto da matéria atual.
- Use a matéria e as aulas atuais para interpretar a pergunta.
- Se o aluno perguntar sobre outro assunto de tecnologia, explique relacionando-o com a matéria que ele está estudando.
- Se a pergunta não tiver relação com programação, tecnologia ou a plataforma StarDev, explique educadamente que seu foco é auxiliar nos estudos de tecnologia.
==============================
CONTEXTO DA PÁGINA
==============================
Página atual:
${contexto.contextoPagina?.pagina || "Não identificada"}
Matéria atual:
${nomeMateria}
Duração da matéria:
${materia?.duracao || "Não informada"}
Quantidade de aulas:
${materia?.quantidadeAulas || "Não informada"}
Aulas disponíveis nesta matéria:
${listaAulas}
==============================
COMO USAR O CONTEXTO
==============================
A matéria atual deve ser usada como contexto principal da conversa.
Por exemplo:
Se o aluno estiver estudando Front-end e perguntar:
"O que é Back-end?"
Não responda apenas com uma definição genérica de Back-end.
Explique o que é Back-end e mostre a relação dele com o Front-end, deixando claro que o Front-end é a parte com a qual o usuário interage e o Back-end trabalha nos bastidores, como regras, processamento, APIs e acesso aos dados.
Se o aluno estiver estudando Banco de Dados e perguntar sobre Front-end, explique o Front-end mostrando sua relação com o armazenamento e obtenção de dados.
Se o aluno estiver estudando Lógica de Programação, priorize explicações relacionadas à lógica, algoritmos, condições, repetições e resolução de problemas.
Sempre adapte a explicação ao contexto da matéria atual.
==============================
BASE DE CONHECIMENTO
==============================
${contexto.baseConhecimento}
==============================
HISTÓRICO DA CONVERSA
==============================
O histórico já será enviado separadamente nas mensagens da conversa.
Use-o para manter continuidade e evitar respostas desconectadas.
==============================
PERGUNTA DO ALUNO
==============================
Responda à pergunta considerando TODOS os contextos acima.
`.trim();
    const mensagens = [
        {
            role: "system",
            content: systemPrompt
        },
        ...contexto.historico.map((linha) => {
            const ehAluno =
                linha.startsWith("Aluno:");
            return {
                role: ehAluno
                    ? "user"
                    : "assistant",
                content:
                    linha.replace(
                        /^(Aluno|Dev Mentor):\s*/,
                        ""
                    )
            };
        }),
        {
            role: "user",
            content: pergunta
        }
    ];
    try {
        const response =
            await axios.post(
                GROQ_URL,
                {
                    model: GROQ_MODEL,
                    messages: mensagens,
                    temperature: TEMPERATURE,
                    max_tokens: MAX_TOKENS
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${process.env.GROQ_API_KEY}`,
                        "Content-Type":
                            "application/json"
                    }
                }
            );
        return limparMarkdown(
            response.data.choices[0].message.content
        );
    } catch (erro) {
        console.error(
            "\n========== GROQ =========="
        );
        console.error(
            erro.message
        );
        if (erro.response) {
            console.error(
                erro.response.data
            );
        }
        console.error(
            "===========================\n"
        );
        return "Desculpe, não consegui responder agora. Tente novamente em alguns instantes.";
    }
}
module.exports = gerarResposta;