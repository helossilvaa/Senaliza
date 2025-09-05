import { create } from '../config/database.js';

const criarAvaliacao = async (avaliacaoData) => {
    try {
        return await create('avaliacoes', avaliacaoData);
    } catch (error) {
        console.error('Erro ao criar avaliação:', error);
        throw error;
    }
};

export { criarAvaliacao };