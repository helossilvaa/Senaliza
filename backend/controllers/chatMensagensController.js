import { criarMensagens, listarMensagens } from "../models/chatMensagens.js";

const criarMensagemController = async (req, res) => {
  try {
    const { chat_id, remetente_id, mensagem } = req.body;
    const novaMensagem = await criarMensagens({ chat_id, remetente_id, mensagem });
    res.status(201).json(novaMensagem);
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar mensagem" });
  }
};

const listarMensagensController = async (req, res) => {
  try {
    const { chatId } = req.params;
    const mensagens = await listarMensagens(chatId);
    res.json(mensagens);
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar mensagens" });
  }
};

export { criarMensagemController, listarMensagensController };
