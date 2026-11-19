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

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/generate";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";

function removerEmojis(texto = "") {
    return texto
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, "")
        .replace(/\s{2,}/g, " ")
        .trim();
}

function normalizarTexto(txt = "") {
    return txt
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function responderPelaBaseConhecimento(pergunta, contexto) {
    const q = normalizarTexto(pergunta);
    const materiaNome = contexto.contextoPagina?.materia?.nome || "";

    if (
        q.includes("antiga") ||
        (q.includes("onde") && (q.includes("anotac") || q.includes("nota"))) ||
        (q.includes("menu") && (q.includes("hamburguer") || q.includes("anotac") || q.includes("lateral") || q.includes("aba")))
    ) {
        return (
            "Para acessar suas anotações antigas na StarDev:\n\n" +
            "- Abra o menu lateral no topo da Área do Aluno.\n" +
            "- Clique na aba Anotações.\n" +
            "- Suas anotações aparecerão organizadas pelo nome de cada matéria e aula onde você fez as anotações.\n" +
            "- Você pode ler o conteúdo completo, copiar o texto, excluir notas, exportar tudo em arquivo .txt ou clicar em 'Ir para aula' para voltar diretamente à aula correspondente."
        );
    }

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
            "- Sobreposição do YouTube em tela expandida: Ao utilizar o botão de expandir tela, o círculo e o bloco de notas continuam sobrepondo o YouTube normalmente para que você faça anotações sem sair da aula.\n\n" +
            "Para rever suas anotações antigas depois, basta abrir o menu lateral e clicar na aba Anotações."
        );
    }

    if (
        q.includes("dashboard") ||
        q.includes("onde parou") ||
        q.includes("onde parei") ||
        q.includes("continue de onde") ||
        q.includes("continuar aula") ||
        q.includes("video especial") ||
        q.includes("exclusivo") ||
        q.includes("introducao") ||
        q.includes("minha conta") ||
        q.includes("inicio")
    ) {
        return (
            "Após fazer login na StarDev, a tela de Início traz recursos exclusivos para estudantes cadastrados:\n\n" +
            "- Continue de onde parou: Mostra exatamente qual foi a última aula e matéria que você estava assistindo, com um botão direto para você continuar os estudos com apenas um clique.\n" +
            "- Vídeo especial para cadastrados: Área exclusiva com um vídeo gravado pelas fundadoras da StarDev para quem tem cadastro na plataforma, trazendo orientações para acelerar seu aprendizado.\n" +
            "- Breve introdução: Uma mensagem acolhedora que explica o funcionamento das trilhas e das ferramentas de estudo."
        );
    }

    if (
        q.includes("+55") ||
        q.includes("55") ||
        q.includes("telefone") ||
        q.includes("ddi") ||
        (q.includes("celular") && q.includes("cadastro"))
    ) {
        return (
            "No formulário de cadastro e na edição de perfil, o prefixo +55 é fixo e destacado na interface:\n\n" +
            "- O +55 não pode ser apagado nem alterado pelo usuário, garantindo maior clareza e uma melhor experiência de uso.\n" +
            "- Você deve digitar apenas o DDD e o número do seu telefone (por exemplo: 18 99689-0559).\n" +
            "- A formatação com parênteses e hífen é aplicada automaticamente enquanto você digita.\n" +
            "- Se você colar um número que já contenha o 55 no início, o sistema trata a duplicidade automaticamente."
        );
    }

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
            "- Lauane Pasquini Ribeiro: Descobriu interesse pela área durante a formação, especializando-se em desenvolvimento Front-end e design de interfaces.\n" +
            "- Melissa Vieira: Teve destaque no processo seletivo do SENAI e dedica-se à lógica de servidores e Back-end.\n" +
            "- As duas uniram seus conhecimentos para criar uma plataforma acolhedora e didática voltada a estudantes iniciantes em tecnologia."
        );
    }

    if (q.includes("cadastr") || q.includes("criar conta") || (q.includes("como") && q.includes("entrar"))) {
        if (q.includes("entrar") || q.includes("login")) {
            return (
                "Para fazer login na StarDev:\n\n" +
                "- Clique no botão Entrar no canto superior da página inicial.\n" +
                "- Digite o e-mail e a senha cadastrados.\n" +
                "- Clique em Entrar para acessar a Área do Aluno."
            );
        }
        return (
            "Para criar sua conta gratuita na StarDev:\n\n" +
            "- Clique no botão Criar conta na página inicial.\n" +
            "- Digite seu nome completo (pelo menos 6 caracteres).\n" +
            "- Digite seu e-mail.\n" +
            "- Digite seu telefone com DDD (o prefixo +55 já é fixo e não precisa ser digitado).\n" +
            "- Crie uma senha com pelo menos 8 caracteres (contendo letra maiúscula, minúscula, número e caractere especial).\n" +
            "- Confirme a senha e finalize o cadastro. O acesso é liberado imediatamente."
        );
    }

    if (q.includes("esqueci") || q.includes("recuperar") || q.includes("trocar senha") || q.includes("redefinir")) {
        return (
            "Se você esqueceu sua senha na StarDev:\n\n" +
            "- Acesse a tela de login e clique no link Esqueci minha senha.\n" +
            "- Digite o e-mail cadastrado na plataforma e defina uma nova senha segura.\n" +
            "- Após confirmar, sua senha será atualizada para novos acessos."
        );
    }

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
            "Você pode acessar todas elas pela aba Trilhas na Área do Aluno."
        );
    }

    if (q.includes("quem e voce") || q.includes("o que e voce") || q.includes("dev mentor") || q.includes("seu nome")) {
        return (
            "Sou a Dev Mentor, assistente oficial da plataforma StarDev.\n\n" +
            "Estou aqui para apoiar sua rotina de estudos. Você pode me perguntar sobre:\n" +
            "- O funcionamento da plataforma, bloco de notas, anotações e trilhas.\n" +
            "- Dúvidas sobre conceitos de código em HTML, CSS, JavaScript, lógica e bancos de dados.\n" +
            "- Conteúdos das aulas disponíveis na plataforma."
        );
    }

    if (q.includes("pago") || q.includes("gratis") || q.includes("gratuit") || q.includes("preco") || q.includes("valor") || q.includes("custa") || q.includes("custo")) {
        return "A StarDev é uma plataforma educacional totalmente gratuita. Todas as videoaulas, as ferramentas de anotação e as orientações da Dev Mentor estão disponíveis sem custo.";
    }

    if (q.includes("certificado")) {
        return "A StarDev nasceu no âmbito do curso técnico do SENAI. A emissão de certificados está em fase de planejamento para os próximos passos da plataforma.";
    }

    if (q.includes("contato") || q.includes("suporte") || q.includes("falar com")) {
        return "Você pode entrar em contato com a equipe pela opção Falar com a StarDev no menu lateral ou pela seção de contato na página inicial. Sua mensagem é recebida diretamente pelas fundadoras.";
    }

    if (q.includes("front-end") || q.includes("frontend")) {
        return (
            "Front-end é a camada de interface visível com a qual o usuário interage diretamente no navegador ou aplicativo.\n\n" +
            "Seus pilares são:\n" +
            "- HTML: Estrutura semântica do conteúdo.\n" +
            "- CSS: Estilização visual, cores, tipografia e responsividade.\n" +
            "- JavaScript: Interatividade, comportamentos dinâmicos e comunicação com serviços externos."
        );
    }

    if (q.includes("back-end") || q.includes("backend")) {
        return (
            "Back-end é a estrutura que opera no servidor, nos bastidores da aplicação.\n\n" +
            "Ele é responsável por:\n" +
            "- Processamento de regras de negócio e validação de dados.\n" +
            "- Comunicação segura com o Banco de Dados.\n" +
            "- Criação e fornecimento de APIs para o Front-end e o aplicativo mobile."
        );
    }

    if (q.includes("banco de dados") || q.includes("sql")) {
        return (
            "Banco de dados é o sistema que armazena, organiza e protege as informações de forma persistente.\n\n" +
            "Na StarDev, o banco guarda os dados de cadastro dos alunos, o catálogo de matérias e o registro das aulas assistidas."
        );
    }

    if (q.includes("logica") || q.includes("algoritmo")) {
        return (
            "Lógica de programação é o conjunto de regras e raciocínios encadeados para orientar o computador a resolver uma tarefa.\n\n" +
            "Seus fundamentos essenciais envolvem:\n" +
            "- Variáveis: Espaços para guardar e manipular dados.\n" +
            "- Estruturas condicionais (if/else): Tomada de decisões com base em condições.\n" +
            "- Estruturas de repetição (loops): Execução repetitiva de instruções enquanto uma condição for verdadeira."
        );
    }

    if (materiaNome) {
        return (
            `Você está estudando a disciplina ${materiaNome}. ` +
            "Pode fazer perguntas sobre os temas dessa aula ou sobre as funcionalidades da StarDev, como o bloco de notas e o salvamento de anotações."
        );
    }

    return (
        "Olá. Sou a Dev Mentor da StarDev. Posso te orientar sobre o uso da plataforma " +
        "(como o bloco de notas sobreposto ao vídeo, a tela de Início com onde você parou, a aba de Anotações no menu e o telefone com +55 fixo) " +
        "ou esclarecer dúvidas sobre os conteúdos de programação das trilhas. Como posso te ajudar?"
    );
}

async function gerarResposta({ pergunta, contexto }) {
    const materia = contexto.contextoPagina?.materia;
    const nomeMateria = materia?.nome || "não identificada";
    const aulas = materia?.aulas || [];
    const listaAulas = aulas.length > 0
        ? aulas.map(a => `- ${a.nome}: ${a.descricao || ""}`).join("\n")
        : "Nenhuma aula cadastrada encontrada.";

    const systemPrompt = `
Você é a Dev Mentor, assistente oficial da plataforma educacional StarDev.
Seu objetivo é orientar estudantes iniciantes e intermediários sobre o uso da plataforma e sobre programação.

DIRETRIZES FUNDAMENTAIS:
- Nunca use nenhum tipo de emoji. Nem no início, nem no meio, nem no fim da mensagem.
- Não use linguagem robotizada ou artificial, como "sou uma inteligência artificial", "como modelo de linguagem", "olá humano" ou similares. Seja natural, profissional, cordial e didática.
- Responda em português do Brasil com clareza e precisão.
- Sempre responda por completo, sem cortar frases e sem deixar pensamentos pela metade.
- Nunca use Markdown complexo como tabelas ou títulos com cerquilha (#). Use texto corrido e, quando necessário listar itens, use "- " no início da linha.
- Quando a pergunta for sobre a StarDev, siga rigorosamente as funcionalidades reais da plataforma:
  * Tela de Início: possui o "Continue de onde parou" com atalho para a última aula, um vídeo especial gravado pelas fundadoras exclusivo para cadastrados, e uma mensagem de introdução aos estudos.
  * Bloco de notas durante o vídeo: há um círculo com a logo da StarDev flutuando sobre o vídeo. Ao clicar, expande em um bloco de notas compacto. As anotações são salvas automaticamente com o nome da matéria e o nome da aula. Ao usar o botão de expandir tela, o círculo e as anotações continuam sobrepondo o YouTube normalmente.
  * Menu lateral: possui a aba Anotações para consultar todas as anotações antigas, organizadas por matéria e aula, com opções de copiar, excluir, baixar em .txt e botão para ir direto até a aula correspondente. As outras abas são Início, Trilhas e Perfil.
  * Telefone no cadastro e perfil: o prefixo +55 é fixo e visível, não pode ser apagado nem editado pelo usuário, garantindo uma melhor experiência (UX). O aluno só digita o DDD e o número.
  * Fundadoras: Lauane Pasquini Ribeiro (foco em Front-end) e Melissa Vieira (foco em Back-end), alunas do SENAI que desenvolveram a plataforma.
  * Trilhas: 12 disciplinas do iniciante ao avançado, gratuitas.

Página atual: ${contexto.contextoPagina?.pagina || "Não identificada"}
Matéria atual: ${nomeMateria}
Aulas da matéria: ${listaAulas}

Base de conhecimento:
${contexto.baseConhecimento || ""}
`.trim();

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
                    timeout: 10000
                }
            );

            if (response?.data?.choices?.[0]?.message?.content) {
                const limpo = limparMarkdown(response.data.choices[0].message.content);
                return removerEmojis(limpo);
            }
        } catch (erroGroq) {}
    }

    try {
        const ollamaResp = await axios.post(
            OLLAMA_URL,
            {
                model: OLLAMA_MODEL,
                prompt: `${systemPrompt}\nAluno: ${pergunta}\nDev Mentor:`,
                stream: false,
                options: {
                    temperature: TEMPERATURE,
                    num_predict: MAX_TOKENS
                }
            },
            { timeout: 4000 }
        );
        if (ollamaResp?.data?.response) {
            const limpo = limparMarkdown(ollamaResp.data.response);
            return removerEmojis(limpo);
        }
    } catch (erroOllama) {}

    return removerEmojis(responderPelaBaseConhecimento(pergunta, contexto));
}

module.exports = gerarResposta;
