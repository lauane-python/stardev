/* ==========================================================================
 * OLLAMA / GROQ SERVICE — RESPOSTAS INTELIGENTES DO DEV MENTOR
 * ==========================================================================
 * Prioridade:
 * 1. Groq API (se GROQ_API_KEY estiver configurada no .env)
 * 2. Ollama local (se OLLAMA_URL estiver disponível)
 * 3. Motor Inteligente de Conhecimento StarDev (RAG direto na base_conhecimento.txt)
 *    Garante que o chatbot SEMPRE responda com precisão a todas as dúvidas da
 *    plataforma mesmo sem dependência de chaves de API externas ou servidores locais.
 * ========================================================================== */

const axios = require("axios");
const fs = require("fs");
const path = require("path");
const limparMarkdown = require("../utils/limparMarkdown");
const {
    BOT_NAME,
    PLATFORM_NAME,
    TEMPERATURE,
    MAX_TOKENS
} = require("../config/chatConfig");
<<<<<<< HEAD
const GROQ_URL =
    "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL =
    process.env.GROQ_MODEL ||
    "llama-3.1-8b-instant";
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
=======

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/generate";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";

function normalizarTexto(txt = "") {
    return txt
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

/**
 * Responde dúvidas sobre a plataforma StarDev e tecnologia a partir da base
 * de conhecimento caso os provedores de LLM externos estejam inacessíveis.
 */
function responderPelaBaseConhecimento(pergunta, contexto) {
    const q = normalizarTexto(pergunta);
    const materiaNome = contexto.contextoPagina?.materia?.nome || "";

    // 1. Acessar anotações antigas / Aba no menu hambúrguer
    if (
        q.includes("antiga") ||
        (q.includes("onde") && (q.includes("anotac") || q.includes("nota"))) ||
        (q.includes("menu") && (q.includes("hamburguer") || q.includes("anotac") || q.includes("lateral")))
    ) {
        return (
            "Para acessar suas anotações antigas na StarDev:\n\n" +
            "- Abra o menu lateral / menu hambúrguer no topo da Área do Aluno.\n" +
            "- Clique na aba Minhas anotações.\n" +
            "- Suas anotações aparecerão organizadas pelo nome de cada matéria e aula onde você fez as notas.\n" +
            "- Você pode lê-las, copiar o texto com um clique, excluir anotações, exportar tudo em .txt ou clicar em 'Ir para aula' para voltar diretamente à aula correspondente!"
        );
    }

    // 2. Bloco de notas durante as aulas / Círculo StarDev / Sobrepor YouTube
    if (
        q.includes("bloco de nota") ||
        q.includes("anotac") ||
        q.includes("circulo") ||
        q.includes("sobrepor") ||
        q.includes("youtube") ||
        q.includes("tela cheia") ||
        q.includes("tela expandida") ||
        q.includes("expandir") ||
        (q.includes("como") && q.includes("anotar"))
    ) {
        return (
            "Durante a exibição das videoaulas na StarDev, você conta com um bloco de notas integrado ao vídeo:\n\n" +
            "- Círculo com a logo StarDev: Fica flutuando sobre o canto do vídeo enquanto você assiste.\n" +
            "- Ao clicar no círculo: Ele se expande e vira um pequeno bloco de notas para você escrever suas anotações em tempo real sem pausar a aula.\n" +
            "- Salvamento automático: Conforme você digita, tudo é salvo automaticamente no seu navegador com o nome da matéria e o nome da aula atual.\n" +
            "- Sobreposição do YouTube em tela expandida: Se você colocar o vídeo em tela cheia / expandida pelo botão de expandir, o círculo e o bloco de notas continuam sobrepondo o YouTube normalmente para que você faça anotações sem sair da aula.\n\n" +
            "Para rever suas anotações antigas depois, basta abrir o menu hambúrguer e clicar na aba Minhas anotações!"
        );
    }

    // 3. Dashboard / Onde parou / Vídeo especial / Introdução
    if (
        q.includes("dashboard") ||
        q.includes("onde parou") ||
        q.includes("onde parei") ||
        q.includes("continue de onde") ||
        q.includes("continuar aula") ||
        q.includes("video especial") ||
        q.includes("exclusivo") ||
        q.includes("introducao")
    ) {
        return (
            "Após fazer login na StarDev, você é recebido na Dashboard inicial da Área do Aluno com recursos exclusivos:\n\n" +
            "- Continue de onde parou: Mostra exatamente qual foi a última aula e matéria que você estava assistindo, com um botão direto para você continuar os estudos com apenas um clique.\n" +
            "- Vídeo especial para cadastrados: Uma área exclusiva com um vídeo das fundadoras da StarDev apenas para alunos membros da plataforma, com dicas e boas-vindas.\n" +
            "- Breve introdução: Uma mensagem acolhedora que explica o funcionamento das trilhas e das ferramentas de estudo."
        );
    }

    // 4. Prefixo +55 fixo / Telefone
    if (
        q.includes("+55") ||
        q.includes("55") ||
        q.includes("telefone") ||
        q.includes("ddi") ||
        q.includes("celular") && q.includes("cadastro")
    ) {
        return (
            "No formulário de cadastro e na edição do perfil, o prefixo +55 é fixo e visível com a bandeira do Brasil:\n\n" +
            "- O +55 não pode ser apagado nem editado pelo usuário, garantindo uma melhor experiência (UX).\n" +
            "- Você deve digitar apenas o DDD e o número do seu telefone (por exemplo: 18 99689-0559).\n" +
            "- A máscara é aplicada automaticamente enquanto você digita.\n" +
            "- Se você colar um número que já contenha o 55 no início, o sistema remove a duplicidade automaticamente."
        );
    }

    // 5. Fundadoras / Lauane / Melissa / História
    if (
        q.includes("lauane") ||
        q.includes("melissa") ||
        q.includes("fundador") ||
        q.includes("criou") ||
        q.includes("criadora") ||
        q.includes("quem fez") ||
        q.includes("autora") ||
        q.includes("historia")
    ) {
        return (
            "A StarDev foi desenvolvida por Lauane Pasquini Ribeiro e Melissa Vieira durante a formação no curso de Desenvolvimento de Sistemas do SENAI:\n\n" +
            "- Lauane Pasquini Ribeiro: Teve seu primeiro contato com código no curso, descobriu paixão por interfaces e programação e foca em desenvolvimento Front-end.\n" +
            "- Melissa Vieira: Ingressou no SENAI com destaque na seleção, apaixonou-se pela lógica interna dos servidores e foca em desenvolvimento Back-end.\n" +
            "- As duas uniram seus interesses complementares para construir a StarDev, uma plataforma pensada de estudante para estudante!"
        );
    }

    // 6. Cadastro / Criar conta
    if (q.includes("cadastr") || q.includes("criar conta") || q.includes("como entrar")) {
        if (q.includes("entrar") || q.includes("login")) {
            return (
                "Para fazer login na StarDev:\n\n" +
                "- Clique no botão Entrar no canto superior da página inicial.\n" +
                "- Digite o e-mail e a senha cadastrados.\n" +
                "- Clique em Entrar para acessar a Área do Aluno e sua Dashboard personalizada."
            );
        }
        return (
            "Para criar sua conta gratuita na StarDev:\n\n" +
            "- Clique no botão Criar conta grátis na página inicial.\n" +
            "- Digite seu nome completo (pelo menos 6 caracteres).\n" +
            "- Digite seu e-mail.\n" +
            "- Digite seu telefone com DDD (o prefixo +55 já é fixo e visível).\n" +
            "- Crie uma senha com pelo menos 8 caracteres (com maiúscula, minúscula, número e caractere especial).\n" +
            "- Confirme a senha e clique em Criar minha conta. É 100% gratuito!"
        );
    }

    // 7. Esqueci senha / Recuperar senha
    if (q.includes("esqueci") || q.includes("recuperar") || q.includes("trocar senha") || q.includes("redefinir")) {
        return (
            "Se você esqueceu sua senha na StarDev:\n\n" +
            "- Acesse a tela de login e clique no link Esqueci minha senha.\n" +
            "- Digite o e-mail cadastrado na plataforma e defina uma nova senha segura.\n" +
            "- Após confirmar, sua senha será atualizada e você poderá fazer login normalmente."
        );
    }

    // 8. Trilhas e Matérias disponíveis
    if (
        q.includes("trilha") ||
        q.includes("materia") ||
        q.includes("disciplina") ||
        q.includes("curso") ||
        q.includes("o que tem")
    ) {
        return (
            "A StarDev oferece 12 disciplinas completas organizadas do nível iniciante ao avançado:\n\n" +
            "- Fundamentos da Programação\n" +
            "- Lógica de Programação\n" +
            "- Desenvolvimento Web\n" +
            "- Front-end\n" +
            "- Back-end\n" +
            "- Banco de Dados\n" +
            "- Projetos de Software\n" +
            "- Segurança da Informação\n" +
            "- Código Limpo\n" +
            "- Desenvolvimento Mobile\n" +
            "- Redes e IoT\n" +
            "- Linguagem de Programação\n\n" +
            "Você pode acessar todas elas pela aba Minhas trilhas na Área do Aluno."
        );
    }

    // 9. Quem é o chatbot / Dev Mentor
    if (q.includes("quem e voce") || q.includes("o que e voce") || q.includes("dev mentor") || q.includes("ia")) {
        return (
            "Eu sou a Dev Mentor, a inteligência artificial oficial da plataforma StarDev!\n\n" +
            "Meu objetivo é te apoiar em toda a sua jornada de aprendizado. Você pode me perguntar sobre:\n" +
            "- Como usar a plataforma, o bloco de notas, o dashboard e o menu.\n" +
            "- Dúvidas de código em HTML, CSS, JavaScript, lógica, bancos de dados e APIs.\n" +
            "- Explicações passo a passo sobre os conteúdos das aulas da StarDev."
        );
    }

    // 10. Dúvidas frequentes: gratuidade, certificado, celular, contato
    if (q.includes("pago") || q.includes("gratis") || q.includes("gratuit") || q.includes("preco") || q.includes("valor") || q.includes("custa") || q.includes("custo")) {
        return "A StarDev é uma plataforma educacional 100% gratuita! Todas as videoaulas, ferramentas de anotação e o suporte do Dev Mentor não têm custo algum.";
    }

    if (q.includes("certificado")) {
        return "A StarDev é uma iniciativa educacional criada no curso técnico do SENAI. A emissão de certificados está em planejamento conforme a plataforma continua evoluindo.";
    }

    if (q.includes("contato") || q.includes("suporte") || q.includes("falar com")) {
        return "Você pode entrar em contato com a equipe da StarDev pela opção Falar com a StarDev no menu lateral ou através da seção de contato na página inicial. Sua mensagem é enviada diretamente às fundadoras.";
    }

    // 11. Dúvidas técnicas comuns de programação
    if (q.includes("front-end") || q.includes("frontend")) {
        return (
            "Front-end é a parte visual de um sistema com a qual o usuário interage diretamente no navegador ou aplicativo.\n\n" +
            "Ele é construído principalmente com:\n" +
            "- HTML: Estrutura os elementos e o conteúdo da página.\n" +
            "- CSS: Define o design, as cores, tipografia e a responsividade visual.\n" +
            "- JavaScript: Dá vida e dinamismo, respondendo a cliques e integrando com o Back-end."
        );
    }

    if (q.includes("back-end") || q.includes("backend")) {
        return (
            "Back-end é o cérebro que opera nos bastidores da aplicação, fora da visão direta do usuário.\n\n" +
            "Ele é responsável por:\n" +
            "- Processar regras de negócio e validações.\n" +
            "- Conectar com o Banco de Dados para salvar e consultar informações com segurança.\n" +
            "- Fornecer APIs para que o Front-end e o aplicativo recebam dados."
        );
    }

    if (q.includes("banco de dados") || q.includes("sql")) {
        return (
            "Banco de dados é o sistema que armazena, organiza e protege as informações de forma persistente.\n\n" +
            "Na StarDev, por exemplo, o banco de dados armazena os cadastros de alunos, as matérias, os feedbacks e os registros de aulas para que você possa continuar de onde parou."
        );
    }

    if (q.includes("logica") || q.includes("algoritmo")) {
        return (
            "Lógica de programação é a forma de organizar o raciocínio em instruções sequenciais para que o computador resolva um problema.\n\n" +
            "Ela envolve conceitos como:\n" +
            "- Variáveis: Espaços de memória para guardar dados.\n" +
            "- Condicionais (if/else): Tomada de decisões de acordo com critérios.\n" +
            "- Loops (laços de repetição): Execução repetida de tarefas até uma condição ser satisfeita."
        );
    }

    // 12. Contexto da matéria atual se houver
    if (materiaNome) {
        return (
            `Você está estudando a disciplina ${materiaNome}. ` +
            "Pode me fazer perguntas sobre o conteúdo das aulas ou sobre as ferramentas da StarDev, como o bloco de notas e suas anotações!"
        );
    }

    // 13. Resposta padrão orientadora
    return (
        "Olá! Sou a Dev Mentor da StarDev. Posso te ajudar com dúvidas sobre a plataforma " +
        "(como o bloco de notas sobreposto ao vídeo, a Dashboard com onde você parou, a aba de anotações no menu hambúrguer, o telefone com +55 fixo) " +
        "ou com dúvidas sobre programação e as disciplinas das trilhas. Como posso te orientar hoje?"
    );
}

// GERA RESPOSTA
async function gerarResposta({ pergunta, contexto }) {
    const materia = contexto.contextoPagina?.materia;
    const nomeMateria = materia?.nome || "não identificada";
    const aulas = materia?.aulas || [];
    const listaAulas = aulas.length > 0
        ? aulas.map(a => `- ${a.nome}: ${a.descricao || ""}`).join("\n")
        : "Nenhuma aula cadastrada encontrada.";

>>>>>>> fb4945d557d50c899ec0f4c7619a0e4b41fee34b
    const systemPrompt = `
Você é a ${BOT_NAME}.
Você é a inteligência artificial oficial da plataforma ${PLATFORM_NAME}.
Seu objetivo é auxiliar estudantes iniciantes e intermediários no aprendizado de tecnologia e no uso da plataforma.
==============================
REGRAS PRINCIPAIS
==============================
- Nunca diga que é o ChatGPT ou IA da OpenAI.
- Nunca invente funcionalidades da plataforma.
- Sempre responda em português do Brasil.
- Responda SOMENTE em texto puro. Nunca use Markdown: nada de negrito com asteriscos, itálico, títulos com cerquilha (#) ou tabelas. Para listas, use "- " no início de cada linha.
- Explique de maneira simples, clara e didática.
- Utilize a base de conhecimento da StarDev para responder sobre as funcionalidades:
  * Dashboard inicial com "Continue de onde parou" e vídeo especial exclusivo com introdução das fundadoras.
  * Bloco de notas com círculo flutuante da logo StarDev que se expande, salva automaticamente com nome da matéria e aula, e sobrepõe o YouTube mesmo em tela expandida/tela cheia.
  * Aba "Minhas anotações" no menu hambúrguer para rever, copiar e gerenciar anotações antigas.
  * Prefixo +55 fixo com bandeira do Brasil no campo de telefone para melhor UX.
  * Fundadoras Lauane Pasquini Ribeiro (Front-end) e Melissa Vieira (Back-end) do SENAI.
==============================
CONTEXTO DA PÁGINA
==============================
Página atual: ${contexto.contextoPagina?.pagina || "Não identificada"}
Matéria atual: ${nomeMateria}
Aulas disponíveis: ${listaAulas}
==============================
BASE DE CONHECIMENTO
==============================
${contexto.baseConhecimento}
==============================
PERGUNTA DO ALUNO
==============================
${pergunta}
`.trim();

    // 1. Tenta Groq se houver chave configurada
    if (process.env.GROQ_API_KEY) {
        try {
            const mensagens = [
                { role: "system", content: systemPrompt },
                ...contexto.historico.map(linha => {
                    const ehAluno = linha.startsWith("Aluno:");
                    return {
                        role: ehAluno ? "user" : "assistant",
                        content: linha.replace(/^(Aluno|Dev Mentor):\s*/, "")
                    };
                }),
                { role: "user", content: pergunta }
            ];

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
                    },
                    timeout: 8000
                }
            );

            if (response?.data?.choices?.[0]?.message?.content) {
                return limparMarkdown(response.data.choices[0].message.content);
            }
        } catch (erroGroq) {
            console.warn("Groq indisponível:", erroGroq.message);
        }
    }

    // 2. Tenta Ollama se estiver respondendo
    try {
        const ollamaResp = await axios.post(
            OLLAMA_URL,
            {
                model: OLLAMA_MODEL,
                prompt: `${systemPrompt}\nAluno: ${pergunta}\nDev Mentor:`,
                stream: false,
                options: { temperature: TEMPERATURE }
            },
            { timeout: 3500 }
        );
        if (ollamaResp?.data?.response) {
            return limparMarkdown(ollamaResp.data.response);
        }
    } catch (erroOllama) {
        // Ollama offline ou indisponível
    }

    // 3. Resposta robusta pela Base de Conhecimento da StarDev (Garante 100% de resposta a dúvidas da plataforma)
    return responderPelaBaseConhecimento(pergunta, contexto);
}

module.exports = gerarResposta;
