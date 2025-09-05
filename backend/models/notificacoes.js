import { create, readAll, update, deleteRecord } from "../config/database.js";

const criarNotificacao = async (notificacoesData) => {

    try {
        return await create('notificacoes', notificacoesData);
        
    } catch (error) {
        console.error('Erro ao criar notificações: ', error);
        throw error;
        
    }
}

const listarNotificacoesPorTecnico = async (tecnico_id) => {

    try {
        return await readAll('notificacoes', `tecnico_id = ${tecnico_id} ORDER BY criado_em DESC`)
        
    } catch (error) {
        console.error('Erro ao listar notificações: ', error);
        throw error;
    }
}

const listarNotificacoesPorUsuario = async (usuario_id) => {

    try {
        return await readAll('notificacoes', `usuario_id = ${usuario_id} ORDER BY criado_em DESC`)
        
    } catch (error) {
        console.error('Erro ao listar notificaçõs por usuário', error);
        throw error;
    }
};

const marcarComoVista = async (id) => {

    try {
        return await update('notificacoes', { visualizado: 1}, `id = ${id}`)
    } catch (error) {
        console.error('Erro ao atualizar as notificações como vista: ', error);
        throw error;
    }
}

const deletarNotificacao = async (id) => {
    try {
        return await deleteRecord('notificacoes', `id = ${id}`);
        
    } catch (error) {
        console.error('Erro ao deletar notificação:', error);
        throw error;
    }
}


export {criarNotificacao, listarNotificacoesPorTecnico, listarNotificacoesPorUsuario, marcarComoVista, deletarNotificacao};