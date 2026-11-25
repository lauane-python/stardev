module.exports = {
  TEMPERATURE: Number(process.env.OLLAMA_TEMPERATURE) || 0.7,
  MAX_TOKENS: Number(process.env.OLLAMA_MAX_TOKENS) || 2048,
  MAX_HISTORY: Number(process.env.CHAT_MAX_HISTORY) || 10,
  BOT_NAME: process.env.CHAT_BOT_NAME || "Dev Mentor",
  PLATFORM_NAME: process.env.CHAT_PLATFORM_NAME || "StarDev",
  LANGUAGE: process.env.CHAT_LANGUAGE || "pt-BR"
};
