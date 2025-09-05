const notificacaoTextos = {
    // Mensagens para Chamados
    CHAMADO_EM_ANDAMENTO: (id, nomeTecnico) => `O chamado ${id} foi assumido por ${nomeTecnico} e agora está em andamento.`,
    CHAMADO_CONCLUIDO: (id) => `O chamado ${id} foi concluído. Por favor, deixe uma avaliação!`,
    NOVO_CHAMADO: (id) => `Um novo chamado (${id}) foi criado. Verifique se você pode atendê-lo.`,
    NOVO_APONTAMENTO_TECNICO: (id, apontamento) => `O técnico adicionou um novo apontamento ao chamado ${id}, ${apontamento}.`,
    PRAZO_ESTIPULADO: (id, prazo) => `O prazo para a resolução do chamado ${id} foi estipulado para ${prazo}.`,

    // Mensagens de Boas-Vindas
    BEM_VINDO: (nome) => `Bem-vindo(a), ${nome}! Estamos felizes em ter você aqui.`,

    // Mensagens de Chat
    NOVA_MENSAGEM: (remetente) => `Você recebeu uma nova mensagem de ${remetente}!`,

    // Das avaliações
    AVALIACAO_RECEBIDA: (id) => `Sua avaliação do chamado ${id} foi recebida com sucesso.`,
};

export default notificacaoTextos;
