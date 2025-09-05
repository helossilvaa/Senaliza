import { read, readAll, create, deleteRecord, update } from '../config/database.js';

const listarPools = async () => {
    try {
        return await readAll('pool');

    } catch (error) {
        console.error('Erro ao listar todos os pools: ', error);
        throw error;
    }
};

const obterPoolId = async (id) => {
    try {
        return await read('pool', `id = ${id}`)
    } catch (error) {
        console.error('Erro ao listar pool por id: ', error);
        throw error;
    }
};

const criarPool = async (poolData) => {
    try {
        return await create('pool', poolData);
        
    } catch (error) {
        console.error('Erro ao criar pool: ', error);
        throw error;
    }
};

const deletarPool = async (id) => {
    try {
        return await deleteRecord('pool', `id = ${id}`);
    } catch (error) {
        console.error('Erro ao deletar pool: ', error);
        throw error;
    }
};

const atualizarPool = async (id, poolData) => {
    try {
        return await update('pool', poolData, `id = ${id}`);

    } catch (error) {
        console.error('Erro ao atualizar pool: ', error);
        throw error;
    }
}

export {listarPools, obterPoolId, criarPool, deletarPool, atualizarPool};