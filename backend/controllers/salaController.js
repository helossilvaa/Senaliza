import { criarSala, obterSalaId, deletarSala, listarSalas, atualizarSala } from "../models/sala.js";

const criarSalaController = async (req, res) => {
    try {
        const {
            sala_id,
            nome_sala
        } = req.body;

        const salaData = {
            sala_id: sala_id,
            nome_sala: nome_sala
        };

        const salaId = await criarSala(salaData);
        res.status(201).json({mensagem: 'Sala criada com sucesso!'});
        
    } catch (error) {
        console.error('Erro ao criar sala: ', error);
        res.status(500).json({mensagem: 'Erro ao criar sala'});
        
    }
};

const listarSalasController = async (req, res) => {
    try {
        const salas = await listarSalas();
        res.status(200).json(salas);
        
    } catch (error) {
        console.error('Erro ao listar salas: ', error);
        res.status(500).json({mensagem: 'Erro ao listar salas'})
    }
};

const obterSalaIdController = async (req, res) => {
    try {
        const sala = await obterSalaId(req.params.id);

        if(!sala) {
            return res.status(404).json({mensagem: 'Sala não encontrada. '})
        }

        res.status(201).json(sala);

    } catch (error) {
        console.error('Erro ao obter sala por id: ', error);
        res.status(500).json({mensagem: 'Erro ao obter sala por id'})
    }
};

const atualizarSalaController = async (req, res) => {
    try {
        const salaId = await obterSalaId(req.params.id);
        const {
            sala_id,
            nome_sala
        } = req.body;

        const salaData = {
            sala_id: sala_id,
            nome_sala: nome_sala
        };

        await atualizarSala(salaId, salaData);
        res.status(200).json({mensagem: 'Sala atualizada com sucesso!'})

    } catch (error) {
        console.error('Erro ao atualizar vaga: ', error);
        res.stats(500).json({mensagem: 'Erro ao atualizar vaga'})
    }
};

const deletarSalaController = async (req, res) => {
    try {
        const salaId = req.params.id;
        const sala = await obterSalaId(req.params.id);

        if(!sala) {
            return res.status(404).json({mensagem: 'Sala não encontrada'});
        }

        await deletarSala(salaId);
        res.status(200).json({mensagem: 'Sala excluída com sucesso'});
        
        
    } catch (error) {
        console.error('Erro ao deletar vaga: ', error);
        res.status(500).json({mensagem: 'Erro ao deletar vaga'});
    }
}
export {obterSalaIdController, criarSalaController, deletarSalaController, atualizarSalaController, listarSalasController};