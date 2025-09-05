import { listarPools, obterPoolId, deletarPool, criarPool, atualizarPool } from "../models/pool.js";

const listarPoolsController = async (req,res) => {
    try {
        const pools = await listarPools();
        res.status(201).json(pools);
        
    } catch (error) {
        console.error('Erro ao listar pools: ', error);
        res.status(500).json({mensagem: 'Erro ao listar pools'});
    }
};

const obterPoolIdController = async (req, res) => {
    try {
        const pool = await obterPoolId(req.params.id);

        if (!pool) {
            return res.status(404).json({mensagem: 'Pool não encontrado.'})
        }

        res.status(500).json(pool);
    } catch (error) {

        console.error('Erro ao obter pools por id: ', error);
        res.status(500).json({mensagem: 'Erro ao obter pools por id'});
    }
}

const criarPoolController = async (req, res) => {
    try {
        const userId = req.user.id; 

        const { titulo, descricao } = req.body;

        const poolData = {
            titulo,
            descricao,
            created_by: userId,
            updated_by: userId
        };

        const poolId = await criarPool(poolData);

        res.status(201).json({
            mensagem: 'Pool criado com sucesso!',
            poolId
        });

    } catch (error) {
        console.error('Erro ao criar pool: ', error);
        res.status(500).json({ mensagem: 'Erro ao criar pool' });
    }
};

const deletarPoolController = async (req, res) => {
    try {

        const poolId = req.params.id;
        const pool = await obterPoolId(req.params.id);

        if(!pool) {
            return res.status(404).json({mensagem: 'Pool não encontrado'});
        }

        await deletarPool(poolId);
        res.status(200).json({mensagem: 'Pool deletado com sucesso'});
        
    } catch (error) {
        console.error('Erro ao deletar pool: ', error);
        res.status(500).json({mensagem: 'Erro ao deletar o pool'})
    }
};

const atualizarPoolController = async (req, res) => {
    try {
        const poolId = req.params.id;
        const pool = await obterPoolId(req.params.id);

        const { titulo, descricao } = req.body;

        const poolData = {
            titulo,
            descricao,
            created_by: userId,
            updated_by: userId
        };

        await atualizarPool(poolId, poolData);
        res.status(200).json({mensagem: 'Pool atualizado com sucesso!'})

        
    } catch (error) {
        console.error('Erro ao atualizar pool: ', error);
        res.status(500).json({mensagem: 'Erro ao atualizar pool'})
    }
}

export {obterPoolIdController, listarPoolsController, criarPoolController, atualizarPoolController, deletarPoolController};