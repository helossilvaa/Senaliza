import { create, readAll, read } from '../config/database.js';

/**
 * Criar um apontamento
 * @param {Object} apontamentoData
 */
const criarApontamento = async (apontamentoData) => {
    try {
        return await create('apontamentos', apontamentoData);
    } catch (error) {
        console.error('Erro ao criar apontamento:', error);
        throw error;
    }
};

/**
 * Listar apontamentos de um chamado filtrando por visibilidade
 * @param {number} chamadoId
 * @param {Object} usuario - req.user { id, funcao }
 */
const listarApontamentos = async (chamadoId, usuario) => {
    try {
        let condition = `chamado_id = ${chamadoId}`;

        if (usuario.funcao === 'tecnico') {
            // Técnico vê todos os apontamentos de usuários + seus próprios
            condition += ` AND (tipo = 'usuario' OR (tipo = 'tecnico' AND usuario_id = ${usuario.id}))`;
        } else if (usuario.funcao === 'usuario_comum') {
            // Usuário vê apenas os seus próprios apontamentos
            condition += ` AND usuario_id = ${usuario.id}`;
        } else if (usuario.funcao === 'administrador') {

        }

        return await readAll('apontamentos', condition + ' ORDER BY criado_em ASC');
    } catch (error) {
        console.error('Erro ao listar apontamentos:', error);
        throw error;
    }
};

const obterApontamentoPorId = async (id) => {
    try {
        return await read('apontamentos', `id = ${id}`);
    } catch (error) {
        console.error('Erro ao obter apontamento por ID:', error);
        throw error;
    }
};

export { criarApontamento, listarApontamentos, obterApontamentoPorId };
