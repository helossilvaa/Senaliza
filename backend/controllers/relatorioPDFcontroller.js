import PDFDocument from 'pdfkit';
import { read } from '../config/database.js';
import path from 'path';
import fs from 'fs';

// ---------- PDF RELATÓRIO DE UM CHAMADO ----------
const gerarRelatorioPdfPorIdController = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.usuarioFuncao !== 'admin') return res.status(403).json({ mensagem: 'Acesso negado' });

    const relatorio = await read('relatorios', `chamado_id = ${id}`);
    if (!relatorio) return res.status(404).json({ mensagem: 'Relatório não encontrado.' });

    const chamado = await read('chamados', `id = ${relatorio.chamado_id}`);
    const tecnico = await read('usuarios', `id = ${relatorio.tecnico_id}`);

    const relatorioComDados = {
      ...relatorio,
      chamado,
      tecnico: tecnico ? { id: tecnico.id, nome: tecnico.nome, email: tecnico.email } : null
    };

    const formatarDataHora = (dataISO) => {
      if (!dataISO) return 'N/A';
      return new Date(dataISO).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const calcularDuracao = (inicio, fim) => {
      if (!inicio || !fim) return 'N/A';
      const duracaoEmSegundos = (new Date(fim).getTime() - new Date(inicio).getTime()) / 1000;
      const dias = Math.floor(duracaoEmSegundos / 86400);
      const horas = Math.floor((duracaoEmSegundos % 86400) / 3600);
      const minutos = Math.floor((duracaoEmSegundos % 3600) / 60);
      let duracaoFormatada = '';
      if (dias > 0) duracaoFormatada += `${dias} dia${dias > 1 ? 's' : ''} `;
      if (horas > 0) duracaoFormatada += `${horas}h `;
      if (minutos > 0) duracaoFormatada += `${minutos}min`;
      if (!duracaoFormatada.trim()) duracaoFormatada = 'Menos de 1 min';
      return duracaoFormatada.trim();
    };

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const nomeDoArquivo = `relatorio-chamado-${id}.pdf`;
    const caminhoDoArquivo = path.join('pdfs_gerados', nomeDoArquivo);
    if (!fs.existsSync('pdfs_gerados')) fs.mkdirSync('pdfs_gerados');

    doc.pipe(fs.createWriteStream(caminhoDoArquivo));

    doc.font('Helvetica-Bold').fontSize(20).text(`Relatório do Chamado`, { align: 'center', underline: true });
    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(16).text(`${chamado?.titulo || 'Sem título'} - ${chamado?.id || ''}`, { align: 'center' });
    doc.moveDown(2);

    doc.font('Helvetica-Bold').fontSize(14).text('Técnico Responsável');
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(12).text(`Nome: ${tecnico?.nome || 'N/A'}`);
    doc.text(`Email: ${tecnico?.email || 'N/A'}`);
    doc.moveDown(1);
    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke('#AAAAAA');
    doc.moveDown(1);

    doc.font('Helvetica-Bold').fontSize(14).text('Detalhes do Chamado');
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(12).text(`Descrição do Problema:\n${chamado?.descricao || 'N/A'}`);
    doc.moveDown(1);
    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke('#AAAAAA');
    doc.moveDown(1);

    doc.font('Helvetica-Bold').fontSize(14).text('Solução Adotada');
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(12).text(relatorio?.solucao || 'N/A', { align: 'justify' });
    doc.moveDown(1);
    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke('#AAAAAA');
    doc.moveDown(1);

    doc.font('Helvetica-Bold').fontSize(14).text('Tempo de Atendimento');
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(12).text(`Início: ${formatarDataHora(relatorio?.comeco)}`);
    doc.text(`Fim: ${formatarDataHora(relatorio?.fim)}`);
    doc.text(`Duração: ${calcularDuracao(relatorio?.comeco, relatorio?.fim)}`);

    doc.end();

    res.status(200).json({ mensagem: 'PDF gerado com sucesso!', arquivo: nomeDoArquivo });

  } catch (error) {
    console.error('Erro ao gerar PDF de relatório:', error);
    res.status(500).json({ mensagem: 'Erro ao gerar PDF de relatório' });
  }
};

// ---------- PDF RELATÓRIO DE TÉCNICOS ----------
const gerarRelatorioPdfTecnicosController = async (req, res) => {
  try {
    if (req.usuarioFuncao !== 'admin') return res.status(403).json({ mensagem: 'Acesso negado' });

    const chamados = await read('chamados');
    const tecnicos = await read('usuarios', `funcao = 'tecnico'`);

    const relatorio = tecnicos.map(t => {
      const resolvidos = chamados.filter(c => c.tecnico_id === t.id && ['concluído','concluido'].includes(c.status.toLowerCase().trim()));
      return {
        id: t.id,
        nome: t.nome,
        email: t.email,
        totalChamadosResolvidos: resolvidos.length
      };
    });

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const nomeDoArquivo = `relatorio-tecnicos.pdf`;
    const caminhoDoArquivo = path.join('pdfs_gerados', nomeDoArquivo);
    if (!fs.existsSync('pdfs_gerados')) fs.mkdirSync('pdfs_gerados');

    doc.pipe(fs.createWriteStream(caminhoDoArquivo));

    doc.font('Helvetica-Bold').fontSize(20).text('Relatório de Técnicos', { align: 'center', underline: true });
    doc.moveDown(2);

    relatorio.forEach(t => {
      doc.font('Helvetica-Bold').fontSize(14).text(`Técnico: ${t.nome}`);
      doc.font('Helvetica').fontSize(12).text(`Email: ${t.email}`);
      doc.text(`Total de Chamados Resolvidos: ${t.totalChamadosResolvidos}`);
      doc.moveDown(1);
      doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke('#AAAAAA');
      doc.moveDown(1);
    });

    doc.end();

    res.status(200).json({ mensagem: 'PDF de técnicos gerado com sucesso!', arquivo: nomeDoArquivo });

  } catch (error) {
    console.error('Erro ao gerar PDF de técnicos:', error);
    res.status(500).json({ mensagem: 'Erro ao gerar PDF de técnicos' });
  }
};

// ---------- PDF RELATÓRIO DE EQUIPAMENTOS ----------
const gerarRelatorioPdfEquipamentosController = async (req, res) => {
  try {
    if (req.usuarioFuncao !== 'admin') return res.status(403).json({ mensagem: 'Acesso negado' });

    const chamados = await read('chamados');
    const equipamentos = await read('equipamentos');

    const relatorio = equipamentos.map(eq => {
      const chamadosEq = chamados.filter(c => c.equipamento_id === eq.id);
      return {
        id: eq.id,
        nome: eq.nome || eq.patrimonio || 'Sem nome',
        totalChamados: chamadosEq.length
      };
    });

    const maisOcorrencias = relatorio.reduce((max, eq) => eq.totalChamados > max.totalChamados ? eq : max, { totalChamados: 0 });

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const nomeDoArquivo = `relatorio-equipamentos.pdf`;
    const caminhoDoArquivo = path.join('pdfs_gerados', nomeDoArquivo);
    if (!fs.existsSync('pdfs_gerados')) fs.mkdirSync('pdfs_gerados');

    doc.pipe(fs.createWriteStream(caminhoDoArquivo));

    doc.font('Helvetica-Bold').fontSize(20).text('Relatório de Equipamentos', { align: 'center', underline: true });
    doc.moveDown(2);

    relatorio.forEach(eq => {
      doc.font('Helvetica-Bold').fontSize(14).text(`Equipamento: ${eq.nome}`);
      doc.font('Helvetica').fontSize(12).text(`Total de Chamados: ${eq.totalChamados}`);
      doc.moveDown(1);
      doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke('#AAAAAA');
      doc.moveDown(1);
    });

    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(14).text(`Equipamento com mais ocorrências: ${maisOcorrencias.nome} (${maisOcorrencias.totalChamados} chamados)`);

    doc.end();

    res.status(200).json({ mensagem: 'PDF de equipamentos gerado com sucesso!', arquivo: nomeDoArquivo });

  } catch (error) {
    console.error('Erro ao gerar PDF de equipamentos:', error);
    res.status(500).json({ mensagem: 'Erro ao gerar PDF de equipamentos' });
  }
};

export {
  gerarRelatorioPdfPorIdController,
  gerarRelatorioPdfTecnicosController,
  gerarRelatorioPdfEquipamentosController
};
