const chatbotModal = document.getElementById("chatbot_modal");
const chatbotButton = document.getElementById("chatbot_button");
const chatbotClose = document.getElementById("chatbot_close");
const chatbotSend = document.getElementById("chatbot_send");
const chatbotInput = document.getElementById("chatbot_input");
const chatbotMessages = document.getElementById("chatbot_messages");

const RESPOSTAS_PLATAFORMA_LEGACY = [
    {
        chaves: ["bloco de nota", "anotac", "circulo", "sobrepor", "youtube", "tela cheia", "tela expandida", "expandir", "anotar"],
        resposta: "Durante as videoaulas na StarDev, você conta com um bloco de notas integrado ao vídeo:\n\n- Círculo com a logo StarDev: Fica flutuando sobre o vídeo enquanto você assiste.\n- Ao clicar no círculo: Ele se expande e vira um pequeno bloco de notas para você escrever sem pausar o vídeo.\n- Salvamento automático: Conforme você digita, tudo é salvo automaticamente com o nome da matéria e o nome da aula atual.\n- Sobreposição do YouTube em tela expandida: Se você colocar em tela cheia ou expandida pelo botão do player, o círculo e o bloco de notas continuam sobrepondo o YouTube normalmente para que você anote à vontade.\n\nPara rever suas anotações antigas, basta abrir o menu lateral e clicar na aba Anotações."
    },
    {
        chaves: ["minhas anotac", "antiga", "menu hamburguer", "menu lateral", "onde vejo minhas notas", "anotacoes"],
        resposta: "Para acessar suas anotações antigas:\n\n- Abra o menu lateral no topo da Área do Aluno.\n- Clique na aba Anotações.\n- Suas anotações aparecerão agrupadas pelo nome da matéria e aula onde foram feitas.\n- Você pode ler o texto, copiar, excluir ou clicar para ir direto para a aula correspondente."
    },
    {
        chaves: ["dashboard", "onde parou", "onde parei", "continue de onde", "continuar aula", "video especial", "exclusivo", "introducao", "minha conta", "inicio"],
        resposta: "Após fazer login na StarDev, a tela de Início traz recursos exclusivos para quem tem conta:\n\n- Continue de onde parou: Mostra a última matéria e aula que você assistiu, com um botão direto para você continuar seus estudos com apenas um clique.\n- Vídeo especial para cadastrados: Área com um vídeo gravado pelas fundadoras da StarDev exclusivo para alunos cadastrados, trazendo orientações e boas-vindas.\n- Breve introdução: Uma mensagem que explica o funcionamento das trilhas e da plataforma."
    },
    {
        chaves: ["+55", "telefone", "ddi", "prefixo", "brasil", "55", "celular"],
        resposta: "No cadastro e no perfil da StarDev, o prefixo +55 é fixo e destacado na interface:\n\n- O +55 não pode ser apagado nem editado pelo usuário, garantindo uma melhor experiência de uso.\n- Você deve digitar apenas o DDD e o seu número (por exemplo: 18 99689-0559).\n- O campo aplica a formatação automaticamente à medida que você digita."
    },
    {
        chaves: ["lauane", "melissa", "fundador", "criou", "criadora", "autora", "quem fez", "historia"],
        resposta: "A StarDev foi criada por Lauane Pasquini Ribeiro e Melissa Vieira durante a formação em Desenvolvimento de Sistemas no SENAI. Lauane foca em Front-end e criação de interfaces, enquanto Melissa foca em Back-end e bancos de dados."
    },
    {
        chaves: ["trilha", "materia", "disciplina", "curso", "aulas"],
        resposta: "A StarDev oferece 12 disciplinas completas do iniciante ao avançado:\n\n- Fundamentos da Programação, Lógica de Programação, Desenvolvimento Web\n- Front-end, Back-end, Banco de Dados\n- Projetos de Software, Segurança da Informação, Código Limpo\n- Desenvolvimento Mobile, Redes e IoT, Linguagem de Programação\n\nVocê pode acessar todas elas pela aba Trilhas na Área do Aluno."
    },
    {
        chaves: ["gratis", "gratuito", "pago", "preco", "valor", "pagar"],
        resposta: "A StarDev é 100% gratuita. Todas as videoaulas, as ferramentas de anotação e o suporte da Dev Mentor estão disponíveis sem custo."
    }
];

function removerEmojis(txt = "") {
    return txt
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, "")
        .replace(/\s{2,}/g, " ")
        .trim();
}

function normalizar(txt = "") {
    return txt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function respostaFallback(msg) {
    const q = normalizar(msg);
    for (const item of RESPOSTAS_PLATAFORMA_LEGACY) {
        if (item.chaves.some(k => q.includes(normalizar(k)))) {
            return removerEmojis(item.resposta);
        }
    }
    return "Olá. Sou a Dev Mentor da StarDev. Como posso te ajudar com a plataforma ou com programação hoje?";
}

if (chatbotButton) {
    chatbotButton.addEventListener("click", () => {
        chatbotModal?.classList.remove("chat_hidden");
    });
}

if (chatbotClose) {
    chatbotClose.addEventListener("click", () => {
        chatbotModal?.classList.add("chat_hidden");
    });
}

function criarMensagem(texto, tipo) {
    if (!chatbotMessages) return;
    const div = document.createElement("div");
    div.classList.add(tipo);
    const textoLimpo = removerEmojis(texto || "");
    div.innerHTML = `<p>${textoLimpo.replace(/\n/g, "<br>")}</p>`;
    chatbotMessages.appendChild(div);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

async function enviarMensagem() {
    if (!chatbotInput) return;
    const mensagem = chatbotInput.value.trim();
    if (mensagem === "") return;

    criarMensagem(mensagem, "user_message");
    chatbotInput.value = "";

    const baseUrl = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
        ? "http://localhost:3000"
        : "https://stardev-d20v.onrender.com";

    try {
        const response = await fetch(`${baseUrl}/chatback/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: mensagem,
                pagina: window.STARDEV_CONTEXT?.pagina || window.location.pathname,
                materiaId: window.STARDEV_CONTEXT?.materiaId || null
            })
        });
        if (!response.ok) throw new Error("Status " + response.status);
        const data = await response.json();
        criarMensagem(data.reply || respostaFallback(mensagem), "bot_message");
    } catch (error) {
        criarMensagem(respostaFallback(mensagem), "bot_message");
    }
}

if (chatbotSend) chatbotSend.addEventListener("click", enviarMensagem);
if (chatbotInput) {
    chatbotInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") enviarMensagem();
    });
}
