import { read, create, readAll, update, deleteRecord } from '../config/database.js';

const listarTarefas = async (usuario_id) => {
    try {
        return await readAll('tarefas', `usuario_id = ${usuario_id}`);
    } catch (error) {
        console.error('Erro ao listar tarefas: ', error);
        throw error;
    }
};

const obterTarefaId = async (id) => {
    try {
        return await read('tarefas', `id = ${id}`);
    } catch (error) {
        console.error('Erro ao obter tarefa por id: ', error);
        throw error;
    }
};

const criarTarefa = async (tarefaData) => {
    try {
        return await create('tarefas', tarefaData);
    } catch (error) {
        console.error('Erro ao criar tarefa: ', error);
        throw error;
    }
};

const atualizarTarefa = async (id, tarefaData) => {
    try {
        return await update('tarefas', tarefaData, `id = ${id}`);
    } catch (error) {
        console.error('Erro ao atualizar tarefa: ', error);
        throw error;
    }
};   
const deletarTarefa = async (id) => {
    try {
        return await deleteRecord('tarefas', `id = ${id}`);
    } catch (error) {
        console.error('Erro ao deletar tarefa: ', error);
        throw error;
    }
};

export { listarTarefas, obterTarefaId, criarTarefa, atualizarTarefa, deletarTarefa };