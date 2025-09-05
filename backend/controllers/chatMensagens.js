import { criarMensagens, listarMensagens, obterMensagemPorId } from "../models/chatMensagens.js";

const criarMensagemController = async (req, res) => {
  try {
    const { chat_id, remetente_id, mensagem } = req.body;

    const mensagemData = { chat_id, remetente_id, mensagem };

    const novaMensagem = await criarMensagens(mensagemData);
    res.status(201).json(novaMensagem);
  } catch (error) {
    console.error("Erro ao criar mensagem:", error);
    res.status(500).json({ error: "Erro ao criar mensagem" });
  }
};

const listarMensagensController = async (req, res) => {
  const { chatId } = req.params;

  try {
    const mensagens = await listarMensagens(chatId);
    res.status(200).json(mensagens);
  } catch (error) {
    console.error("Erro ao listar mensagens:", error);
    res.status(500).json({ error: "Erro ao listar mensagens" });
  }
};

const obterMensagemPorIdController = async (req, res) => {
  const { id } = req.params;

  try {
    const mensagem = await obterMensagemPorId(id);
    if (!mensagem) {
      return res.status(404).json({ error: "Mensagem não encontrada" });
    }
    res.status(200).json(mensagem);
  } catch (error) {
    console.error("Erro ao obter mensagem por ID:", error);
    res.status(500).json({ error: "Erro ao obter mensagem" });
  }
};

export {
  criarMensagemController,
  listarMensagensController,
  obterMensagemPorIdController,
};

