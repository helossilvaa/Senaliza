import { listarRelatorios, buscarRelatorios } from '../models/relatorio.js';
import { readAll, read } from '../config/database.js';
import fs from 'fs';


const listarRelatoriosController = async (req, res) => {
  try {
   
    if (req.usuarioFuncao !== 'admin') {
      return res.status(403).json({ mensagem: 'Acesso negado' });
    }

    const relatorios = await listarRelatorios();

    const relatoriosComDados = await Promise.all(
      relatorios.map(async (r) => {
        const chamado = await read('chamados', `id = ${r.chamado_id}`);
        const tecnico = await read('usuarios', `id = ${r.tecnico_id}`);
        return {
          ...r,
          chamado,
          tecnico: tecnico ? { id: tecnico.id, nome: tecnico.nome, email: tecnico.email } : null
        };
      })
    );

    res.status(200).json(relatoriosComDados);
  } catch (error) {
    console.error('Erro ao listar relatórios:', error);
    res.status(500).json({ mensagem: 'Erro ao listar relatórios' });
  }
};


const buscarRelatoriosController = async (req, res) => {
  try {
    if (req.user.funcao !== 'admin') {
      return res.status(403).json({ mensagem: 'Acesso negado' });
    }

    const filtro = {};
    if (req.query.tecnico_id) filtro.tecnico_id = Number(req.query.tecnico_id);
    if (req.query.chamado_id) filtro.chamado_id = Number(req.query.chamado_id);

    const relatorios = await buscarRelatorios(filtro);

    const relatoriosComDados = await Promise.all(
      relatorios.map(async (r) => {
        const chamado = await read('chamados', `id = ${r.chamado_id}`);
        const tecnico = await read('usuarios', `id = ${r.tecnico_id}`);
        return {
          ...r,
          chamado,
          tecnico: tecnico ? { id: tecnico.id, nome: tecnico.nome, email: tecnico.email } : null
        };
      })
    );

    res.status(200).json(relatoriosComDados);
  } catch (error) {
    console.error('Erro ao buscar relatórios:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar relatórios' });
  }
};

const listarPdfsGeradosController = (req, res) => {
  try {
    const caminhoDaPasta = 'pdfs_gerados';
    if (!fs.existsSync(caminhoDaPasta)) {
      return res.status(200).json([]);
    }
    const arquivos = fs.readdirSync(caminhoDaPasta);
    res.status(200).json(arquivos);
  } catch (error) {
    console.error('Erro ao listar PDFs:', error);
    res.status(500).json({ mensagem: 'Erro ao listar PDFs' });
  }
};

const listarRelatoriosRecentesController = async (req, res) => {
  try {
    if (req.usuarioFuncao !== 'admin') {
      return res.status(403).json({ mensagem: 'Acesso negado' });
    }

    const limite = parseInt(req.query.limite) || 4;

    let relatorios = await listarRelatorios();

    relatorios.sort((a, b) => new Date(b.fim) - new Date(a.fim));

    const ultimosRelatorios = relatorios.slice(0, limite);

    console.log("Relatórios mais recentes:", ultimosRelatorios);

    const relatoriosCompletos = await Promise.all(
      ultimosRelatorios.map(async (r) => {
        const chamado = await read('chamados', `id = ${r.chamado_id}`);
        const tecnico = await read('usuarios', `id = ${r.tecnico_id}`);
        
        console.log("Relatório completo:", {
          ...r,
          chamado,
          tecnico: tecnico ? { id: tecnico.id, nome: tecnico.nome, email: tecnico.email } : null,
        });

        return {
          ...r,
          chamado,
          tecnico: tecnico ? { id: tecnico.id, nome: tecnico.nome, email: tecnico.email } : null,
        };
      })
    );

    return res.status(200).json(relatoriosCompletos);
  } catch (error) {
    console.error('Erro ao listar relatórios recentes:', error);
    res.status(500).json({ mensagem: 'Erro ao listar relatórios recentes' });
  }
};

const relatorioTecnicosController = async (req, res) => {
  try {
    if (req.usuarioFuncao !== 'admin') return res.status(403).json({ mensagem: 'Acesso negado' });

    const chamados = await readAll('chamados');
    const tecnicos = await readAll('usuarios', `funcao = 'tecnico'`);

    const relatorio = tecnicos.map(t => {
      const resolvidos = chamados.filter(c => c.tecnico_id === t.id && ['concluído','concluido'].includes(c.status.toLowerCase().trim()));
      return {
        tecnico_id: t.id,
        nome: t.nome,
        email: t.email,
        totalChamadosResolvidos: resolvidos.length
      };
    });

    res.status(200).json(relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório de técnicos:', error);
    res.status(500).json({ mensagem: 'Erro ao gerar relatório de técnicos' });
  }
};


const relatorioEquipamentosController = async (req, res) => {
  try {
    if (req.usuarioFuncao !== 'admin') {
      return res.status(403).json({ mensagem: 'Acesso negado' });
    }

    const chamados = await readAll('chamados');
    const equipamentos = await readAll('equipamentos');
    const salas = await readAll('salas'); 

    
    const relatorio = equipamentos.map(eq => {
      const chamadosEq = chamados.filter(c => c.equipamento_id === eq.patrimonio);
      const salaObj = salas.find(s => s.id === eq.sala_id);

      return {
        equipamento_id: eq.patrimonio,
        nome: eq.equipamento || eq.patrimonio || 'Sem nome', 
        sala_id: eq.sala_id, 
        sala: salaObj ? salaObj.nome_sala : 'Sem sala',
        totalChamados: chamadosEq.length
      };
    });

    const porSala = {};
    relatorio.forEach(eq => {
      if (!porSala[eq.sala]) porSala[eq.sala] = []; 
      porSala[eq.sala].push(eq);
    });

    for (const sala in porSala) {
      porSala[sala].sort((a, b) => b.totalChamados - a.totalChamados);
    }

    res.status(200).json({ relatorio, porSala });
  } catch (error) {
    console.error('Erro ao gerar relatório de equipamentos:', error);
    res.status(500).json({ mensagem: 'Erro ao gerar relatório de equipamentos' });
  }
};




export { listarRelatoriosController, buscarRelatoriosController, listarPdfsGeradosController, listarRelatoriosRecentesController, relatorioTecnicosController, relatorioEquipamentosController};

