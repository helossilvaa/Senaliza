import { criarAvaliacao } from '../models/avaliacoes.js';
import { obterChamadoPorId } from '../models/chamado.js';

const criarAvaliacaoController = async (req, res) => {
    try {
        const { pontuacao, comentario } = req.body;
        const { id: chamado_id } = req.params;
        const usuario_id = req.usuarioId;

       
        const chamado = await obterChamadoPorId(chamado_id);
        if (!chamado || chamado.usuario_id !== usuario_id) {
            return res.status(404).json({ mensagem: 'Chamado não encontrado ou você não tem permissão para avaliá-lo.' });
        }

        
        if (chamado.status !== 'concluido') {
            return res.status(400).json({ mensagem: 'Você só pode avaliar chamados concluídos.' });
        }

        const avaliacaoData = {
            usuario_id,
            chamado_id,
            tecnico_id: chamado.tecnico_id,
            pontuacao,
            comentario: comentario || '',
        };

        await criarAvaliacao(avaliacaoData);

        return res.status(201).json({ mensagem: 'Avaliação enviada com sucesso!' });
        
    } catch (error) {
        console.error('Erro ao criar avaliação:', error);
        return res.status(500).json({ mensagem: 'Erro interno ao processar a avaliação.' });
    }
};

export { criarAvaliacaoController };
