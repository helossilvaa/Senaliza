import {create, readAll, read } from '../config/database.js';

const criarMensagens = async (mensagemData) => {
  try {
    return await create('chatMensagens', mensagemData);
  } catch (error) {
    console.error('Erro ao criar mensagem:', error);
    throw error;
  }
};

const listarMensagens = async (chatId) => {
  try {
    return await readAll('chat_mensagens', 'chat_id = ? ORDER BY criado_em ASC', [chatId]);
  } catch (error) {
    console.error('Erro ao listar mensagens: ', error);
    throw error;
  }
};

const obterMensagemPorId = async (id) => {
  try {
    return await read('chat_mensagens', `id = ${id}`);
  } catch (error) {
    console.error('Erro ao obter mensagem por ID: ', error);
    throw error;
  }
};

const obterParticipantesDoChat = async (id) => {
  try {
      // Suponha que você tenha uma tabela 'chats' que conecta chamados aos usuários
      const chat = await read('chats', `id = ${id}`);
      if (!chat) return null;
      // Retorne o ID do usuário e do técnico do chamado
      return [chat.usuario_id, chat.tecnico_id]; 
  } catch (error) {
      console.error('Erro ao obter participantes do chat:', error);
      throw error;
  }
};

export { criarMensagens, listarMensagens, obterMensagemPorId, obterParticipantesDoChat };