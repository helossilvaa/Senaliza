import { create, readAll, read } from '../config/database.js';

const criarChat = async (chatData) => {
    try {
         return await create('chats', chatData);
    } catch (error) {
        console.error('Erro ao criar chat:', error);
        throw error;
        
    }
 
};

const listarChats = async (usuarioId) => {
    try {
        return await readAll('chats', `usuario_id = ${usuarioId} OR tecnico_id = ${usuarioId}`);
    } catch (error) {
        console.error('Erro ao listar chats:', error);
        throw error;
        
    }
  
};

const obterChatPorId = async (id) => {
    try {
        return await read('chats', `id = ${id}`);
    } catch (error) {
        console.error('Erro ao obter chat por ID:', error);
        throw error;
        
    }
 
};

export { criarChat, listarChats, obterChatPorId };
