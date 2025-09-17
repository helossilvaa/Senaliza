import { read, create, update, deleteRecord, query} from "../config/database.js";


const listarPoolsTecnico = async (tecnicoId) => {
    try {
        const sql = `SELECT id_pool FROM pool_tecnico WHERE tecnico_id = ?`;
        const rows = await query(sql, [tecnicoId]);
        return rows.map(row => row.id_pool);
    } catch (error) {
        console.error('Erro ao listar pools do técnico:', error);
        throw error;
    }
};


const obterPoolTecnicoId = async (id, user, usuarioFuncao) => {
    try {
        const pool = await read('pool', `id = ${id}`);
        if (!pool) return null;

        
        if (usuarioFuncao === 'admin' || pool.tecnico_id === user.id) {
            return pool;
        } else {
            throw new Error('Acesso negado');
        }
    } catch (error) {
        console.error('Erro ao obter pool por id: ', error);
        throw error;
    }
};


const criarPoolTecnico = async (poolTecnicoData, usuarioFuncao) => {
    try {
        if (usuarioFuncao !== 'admin') throw new Error('Apenas admin pode criar pools');
        return await create('pool', poolTecnicoData);
    } catch (error) {
        console.error('Erro ao criar pool: ', error);
        throw error;
    }
};


const atualizarPoolTecnico = async (id, poolTecnicoData, usuarioFuncao) => {
    try {
        const pool = await read('pool', `id = ${id}`);
        if (!pool) throw new Error('Pool não encontrado');

        
        if (usuarioFuncao === 'admin') {
            return await update('pool', poolTecnicoData, `id = ${id}`);
        } else {
            throw new Error('Acesso negado');
        }
    } catch (error) {
        console.error('Erro ao atualizar pool: ', error);
        throw error;
    }
};


const deletarPoolTecnico = async (id, usuarioFuncao) => {
    try {
        if (usuarioFuncao !== 'admin') throw new Error('Apenas admin pode deletar pools');
        return await deleteRecord('pool', `id = ${id}`);
    } catch (error) {
        console.error('Erro ao deletar pool: ', error);
        throw error;
    }
};

export { listarPoolsTecnico, obterPoolTecnicoId, criarPoolTecnico, atualizarPoolTecnico, deletarPoolTecnico };