console.log("CHATBOT CARREGOU");
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
        }
    }
);