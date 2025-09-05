import { criarTarefa, deletarTarefa, obterTarefaId, listarTarefas, atualizarTarefa } from "../models/tarefas.js";

const criarTarefasController = async (req, res) => {
    try {
        const {
            descricao,
            concluida = false
        } = req.body;

        const tarefaData = {
            descricao,
            concluida,
            usuario_id: req.usuarioId
        };

        const novaTarefa = await criarTarefa(tarefaData);
        res.status(201).json(novaTarefa);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar tarefa' });
    }
};
const listarTarefasController = async (req, res) => {
    try {
        const tarefas = await listarTarefas(req.usuarioId);
        res.status(200).json(tarefas);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar tarefas' });
    }
};
const obterTarefaIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const tarefa = await obterTarefaId(id);
        if (tarefa) {
            res.status(200).json(tarefa);
        } else {
            res.status(404).json({ error: 'Tarefa não encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao obter tarefa por ID' });
    }
};

const atualizarTarefaController = async (req, res) => {
    try {
        const { id } = req.params;
        const tarefaData = req.body;
        const tarefaAtualizada = await atualizarTarefa(id, tarefaData);
        if (tarefaAtualizada) {
            res.status(200).json(tarefaAtualizada);
        } else {
            res.status(404).json({ error: 'Tarefa não encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar tarefa' });
    }
};

const deletarTarefaController = async (req, res) => {
    try {
        const { id } = req.params;
        const tarefaDeletada = await deletarTarefa(id);
        if (tarefaDeletada) {
            res.status(200).json({ message: 'Tarefa deletada com sucesso' });
        } else {
            res.status(404).json({ error: 'Tarefa não encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar tarefa' });
    }
};

export { criarTarefasController, listarTarefasController, obterTarefaIdController, atualizarTarefaController, deletarTarefaController };