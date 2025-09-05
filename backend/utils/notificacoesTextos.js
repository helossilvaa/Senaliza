const notificacaoTextos = {
    // Mensagens para Chamados
    CHAMADO_EM_ANDAMENTO: (id, nomeTecnico) => `O chamado ${id} foi assumido por ${nomeTecnico} e agora está em andamento.`,
    CHAMADO_CONCLUIDO: (id) => `O chamado ${id} foi concluído.`,
    NOVO_CHAMADO: (id) => `Um novo chamado (${id}) foi criado. Verifique se você pode atendê-lo.`,
    NOVO_APONTAMENTO_TECNICO: (id, apontamento) => `O técnico adicionou um novo apontamento ao chamado ${id}, ${apontamento}.`,
    PRAZO_ESTIPULADO: (id, prazo) => `O prazo para a resolução do chamado ${id} foi estipulado para ${prazo}.`,
    NOVO_APONTAMENTO_USUARIO: (id, apontamento, nomeUsuario) => `${nomeUsuario} adicionou um novo apontamento ao chamado ${id}, "${apontamento}".`

    
};

export default notificacaoTextos;
