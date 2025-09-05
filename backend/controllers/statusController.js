import { readAll } from '../bd/db.js';

/**
 * Busca todos os chamados em andamento para o técnico específico.
 * @param {number} tecnicoId
 */
export async function getChamadosDoTecnico(tecnicoId) {
    if (!tecnicoId) {
        throw new Error('ID do técnico é obrigatório.');
    }

    const chamados = await readAll(
        'chamados',
        `status = 'em andamento' AND tecnico_id = ${tecnicoId}`
    );

    return chamados;
}
