import {
    listarEquipamentos,
    obterEquipamentoPorPatrimonio,
    atualizarEquipamento,
    deletarEquipamento,
    criarEquipamento
} from "../models/equipamento.js";

const criarEquipamentoController = async (req, res) => {
    try {
        const { patrimonio, sala_id, equipamento } = req.body;

        const equipamentoData = { patrimonio, sala_id, equipamento };

        await criarEquipamento(equipamentoData);

        res.status(201).json({ mensagem: 'Equipamento criado com sucesso!' });

    } catch (error) {
        console.error('Erro ao criar equipamento: ', error);
        res.status(500).json({ mensagem: 'Erro ao criar equipamento' });
    }
};

const listarEquipamentosController = async (req, res) => {
    try {
        const equipamentos = await listarEquipamentos();
        res.status(200).json(equipamentos);
    } catch (error) {
        console.error('Erro ao listar equipamentos: ', error);
        res.status(500).json({ mensagem: 'Erro ao listar equipamentos' });
    }
};

const obterEquipamentoPorPatrimonioController = async (req, res) => {
    try {
        const { patrimonio } = req.params;
        const equipamento = await obterEquipamentoPorPatrimonio(patrimonio);

        if (!equipamento) {
            return res.status(404).json({ mensagem: 'Equipamento não encontrado' });
        }

        res.status(200).json(equipamento);

    } catch (error) {
        console.error('Erro ao obter equipamento por patrimônio: ', error);
        res.status(500).json({ mensagem: 'Erro ao obter equipamento' });
    }
};

const deletarEquipamentoController = async (req, res) => {
    try {
        const { patrimonio } = req.params;

        const equipamento = await obterEquipamentoPorPatrimonio(patrimonio);

        if (!equipamento) {
            return res.status(404).json({ mensagem: 'Equipamento não encontrado' });
        }

        await deletarEquipamento(patrimonio);
        res.status(200).json({ mensagem: 'Equipamento deletado com sucesso!' });

    } catch (error) {
        console.error('Erro ao deletar equipamento: ', error);
        res.status(500).json({ mensagem: 'Erro ao deletar equipamento' });
    }
};

const atualizarEquipamentoController = async (req, res) => {
    try {
        const { patrimonio } = req.params;
        const { sala_id, equipamento } = req.body;

        const equipamentoExistente = await obterEquipamentoPorPatrimonio(patrimonio);

        if (!equipamentoExistente) {
            return res.status(404).json({ mensagem: 'Equipamento não encontrado' });
        }

        const equipamentoData = { patrimonio, sala_id, equipamento };

        await atualizarEquipamento(patrimonio, equipamentoData);
        res.status(200).json({ mensagem: 'Equipamento atualizado com sucesso' });

    } catch (error) {
        console.error('Erro ao atualizar equipamento: ', error);
        res.status(500).json({ mensagem: 'Erro ao atualizar equipamento' });
    }
};

export {
    criarEquipamentoController,
    listarEquipamentosController,
    obterEquipamentoPorPatrimonioController,
    deletarEquipamentoController,
    atualizarEquipamentoController
};
