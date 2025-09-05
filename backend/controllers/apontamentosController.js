import { criarApontamento, listarApontamentos } from '../models/apontamentos.js';

const criarApontamentoController = async (req, res) => {
    try {
        const { chamado_id, apontamento } = req.body;

        const tipo = req.user.funcao === 'tecnico' ? 'tecnico' : 'usuario';

        const apontamentoData = {
            chamado_id,
            usuario_id: req.user.id,
            tipo,
            apontamento
        };

        const apontamentoId = await criarApontamento(chamado_id, apontamentoData);
        res.status(201).json({ mensagem: 'Apontamento criado com sucesso', apontamentoId });

    } catch (error) {
        console.error('Erro ao criar apontamento:', error);
        res.status(500).json({ mensagem: 'Erro ao criar apontamento.' });
    }
};

const listarApontamentosController = async (req, res) => {
    try {
        const chamadoId = req.params.chamadoId; 
        const usuario = req.user; 

        const apontamentos = await listarApontamentos(chamadoId, usuario);

        res.status(200).json(apontamentos);
    } catch (error) {
        console.error('Erro ao listar apontamentos:', error);
        res.status(500).json({ mensagem: 'Erro ao listar apontamentos.' });
    }
};

export { criarApontamentoController, listarApontamentosController };