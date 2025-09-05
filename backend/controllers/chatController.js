import { criarChat, listarChats, obterChatPorId } from "../models/chat.js";

const criarChatController = async (req, res) => {
  try {
    const { usuario_id, tecnico_id } = req.body;

    const novoChat = await criarChat({ usuario_id, tecnico_id });
    res.status(201).json(novoChat);
  } catch (error) {
    console.error("Erro ao criar chat:", error);
    res.status(500).json({ error: "Erro ao criar chat" });
  }
};

const listarChatsController = async (req, res) => {
  try {
    const usuarioId = req.user.id; 
    const chats = await listarChats(usuarioId);
    console.log(chats);
    
    res.status(200).json(chats);
  } catch (error) {
    console.error("Erro ao listar chats:", error);
    res.status(500).json({ error: "Erro ao listar chats" });
  }
};

const obterChatPorIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await obterChatPorId(id);

    if (!chat) return res.status(404).json({ error: "Chat não encontrado" });

    res.status(200).json(chat);
  } catch (error) {
    console.error("Erro ao obter chat:", error);
    res.status(500).json({ error: "Erro ao obter chat" });
  }
};

export { criarChatController, listarChatsController, obterChatPorIdController };
