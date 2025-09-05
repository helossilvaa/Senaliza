import { create, readAll, read, deleteRecord, update } from '../config/database.js';

const criarSala = async (salaData) => {
    try {
        return await create('salas', salaData);
    } catch (error) {
        console.error('Erro ao criar sala: ', error);
        throw error;
        
    }
};

const listarSalas = async () => {
    try {
        return await readAll('salas');
    } catch (error) {
        console.error('Erro ao ler todas as salas: ', error);
        throw error;
    }
};

const obterSalaId = async (id) => {
    try {
        return await read('salas', `id = ${id} `)
    } catch (error) {
        console.error('Erro ao obter sala por id: ', error);
        throw error;
    }
};

const deletarSala = async (id) => {
    try {
        return await deleteRecord('salas', `id = ${id}`)
    } catch (error) {
        console.error('Erro ao deletar sala: ', error);
        throw error;
    }
};

const atualizarSala = async (id, salaData) => {
    try {
        return await update('salas', salaData, `id = ${id}`);
        
    } catch (error) {
        console.error('Erro ao atualizar sala: ', error);
        throw error;
    }
};

export {listarSalas, obterSalaId, deletarSala, atualizarSala, criarSala};



