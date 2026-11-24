console.log("CHATBOT CARREGOU");
<<<<<<< HEAD
const chatbotModal =
    document.getElementById("chatbot_modal");
const chatbotButton =
    document.getElementById("chatbot_button");
const chatbotClose =
    document.getElementById("chatbot_close");
const chatbotSend =
    document.getElementById("chatbot_send");
const chatbotInput =
    document.getElementById("chatbot_input");
const chatbotMessages =
    document.getElementById("chatbot_messages");
chatbotButton.addEventListener(
    "click",
    () => {
        chatbotModal.classList.remove(
            "chat_hidden"
        );
    }
);
chatbotClose.addEventListener(
    "click",
    () => {
        chatbotModal.classList.add(
            "chat_hidden"
        );
    }
);
function criarMensagem(texto, tipo) {
    const div =
        document.createElement("div");
    div.classList.add(tipo);
    div.innerHTML = `
        <p>${texto}</p>
    `;
    chatbotMessages.appendChild(div);
    chatbotMessages.scrollTop =
        chatbotMessages.scrollHeight;
}
async function enviarMensagem() {
    const mensagem =
        chatbotInput.value.trim();
    if (mensagem === "") {
        return;
    }
    criarMensagem(
        mensagem,
        "user_message"
    );
    chatbotInput.value = "";
    try {
        const response =
            await fetch(
                "https://stardev-d20v.onrender.com/chatback/chat",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        message: mensagem,
                        pagina: window.STARDEV_CONTEXT?.pagina || window.location.pathname,
                        materiaId: window.STARDEV_CONTEXT?.materiaId || null
                    })
                }
            );
        const data =
            await response.json();
        criarMensagem(
            data.reply,
            "bot_message"
        );
    } catch (error) {
        console.log(error);
        criarMensagem(
            "Erro ao conectar com a Dev Mentor.",
            "bot_message"
        );
    }
}
chatbotSend.addEventListener(
    "click",
    enviarMensagem
);
chatbotInput.addEventListener(
    "keypress",
    (e) => {
        if (e.key === "Enter") {
            enviarMensagem();
=======
const chatbotModal = document.getElementById("chatbot_modal");
const chatbotButton = document.getElementById("chatbot_button");
const chatbotClose = document.getElementById("chatbot_close");
const chatbotSend = document.getElementById("chatbot_send");
const chatbotInput = document.getElementById("chatbot_input");
const chatbotMessages = document.getElementById("chatbot_messages");

const RESPOSTAS_PLATAFORMA_LEGACY = [
    {
        chaves: ["bloco de nota", "anotac", "circulo", "sobrepor", "youtube", "tela cheia", "tela expandida", "expandir", "anotar"],
        resposta: "Durante as videoaulas na StarDev, você tem um bloco de notas integrado ao player:\n\n- Círculo com a logo StarDev: Fica flutuando sobre o vídeo enquanto você assiste.\n- Ao clicar no círculo: Ele se expande e vira um pequeno bloco de notas para você escrever sem pausar o vídeo.\n- Salvamento automático: Conforme você digita, tudo é salvo automaticamente com o nome da matéria e o nome da aula atual.\n- Sobreposição do YouTube em tela expandida: Se você colocar em tela cheia/expandida pelo botão de expandir do player, o círculo e o bloco de notas continuam sobrepondo o YouTube normalmente para que você anote à vontade.\n\nPara rever suas anotações antigas, basta abrir o menu hambúrguer e clicar na aba Minhas anotações!"
    },
    {
        chaves: ["minhas anotac", "antiga", "menu hamburguer", "menu lateral", "onde vejo minhas notas"],
        resposta: "Para acessar suas anotações antigas:\n\n- Abra o menu hambúrguer / menu lateral no topo da Área do Aluno.\n- Clique na aba Minhas anotações.\n- Suas anotações aparecerão agrupadas pelo nome da matéria e aula onde foram feitas.\n- Você pode lê-las, copiar o texto, excluí-las ou clicar para ir direto para a aula correspondente!"
    },
    {
        chaves: ["dashboard", "onde parou", "onde parei", "continue de onde", "continuar aula", "video especial", "exclusivo", "introducao"],
        resposta: "Após fazer login na StarDev, você é recebido na Dashboard inicial da Área do Aluno com recursos exclusivos:\n\n- Continue de onde parou: Mostra a última matéria e aula que você assistiu, com um botão direto para você continuar seus estudos de onde parou com 1 clique.\n- Vídeo especial para cadastrados: Área com um vídeo exclusivo gravado pelas fundadoras da StarDev para alunos cadastrados, trazendo dicas e boas-vindas.\n- Breve introdução: Uma mensagem acolhedora que explica o funcionamento das trilhas e da plataforma."
    },
    {
        chaves: ["+55", "telefone", "ddi", "prefixo", "brasil", "55"],
        resposta: "No cadastro e no perfil da StarDev, o prefixo +55 é fixo e visível com a bandeira do Brasil:\n\n- O +55 não pode ser apagado nem editado pelo usuário, garantindo uma melhor experiência (UX).\n- Você deve digitar apenas o DDD e o seu número (por exemplo: 18 99689-0559).\n- O campo aplica a máscara automaticamente à medida que você digita."
    },
    {
        chaves: ["lauane", "melissa", "fundador", "criou", "criadora", "autora", "quem fez", "historia"],
        resposta: "A StarDev foi criada por Lauane Pasquini Ribeiro e Melissa Vieira durante a formação em Desenvolvimento de Sistemas no SENAI. Lauane foca em Front-end e criação de interfaces, enquanto Melissa foca em Back-end e bancos de dados."
    }
];

function normalizar(txt = "") {
    return txt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function respostaFallback(msg) {
    const q = normalizar(msg);
    for (const item of RESPOSTAS_PLATAFORMA_LEGACY) {
        if (item.chaves.some(k => q.includes(normalizar(k)))) {
            return item.resposta;
>>>>>>> fb4945d557d50c899ec0f4c7619a0e4b41fee34b
        }
    }
    return "Olá! Sou a Dev Mentor da StarDev. Como posso te ajudar com a plataforma ou com programação hoje?";
}

/* ABRIR CHAT */
if (chatbotButton) {
    chatbotButton.addEventListener("click", () => {
        chatbotModal?.classList.remove("chat_hidden");
    });
}
/* FECHAR CHAT */
if (chatbotClose) {
    chatbotClose.addEventListener("click", () => {
        chatbotModal?.classList.add("chat_hidden");
    });
}

/* CRIAR MENSAGEM */
function criarMensagem(texto, tipo) {
    if (!chatbotMessages) return;
    const div = document.createElement("div");
    div.classList.add(tipo);
    div.innerHTML = `<p>${(texto || "").replace(/\n/g, "<br>")}</p>`;
    chatbotMessages.appendChild(div);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

/* ENVIAR MENSAGEM */
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
