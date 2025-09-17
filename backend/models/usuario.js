import {create, readAll, read, query, update} from '../config/database.js';

const criarUsuario = async (usuarioData) => {
    try {
        return await create('usuarios', usuarioData)
    } catch(error) {
        console.error('Erro ao criar usuario: ', error);
        throw error;
    }
}

const listarUsuarios = async () => {
    try {
        return await readAll('usuarios');
    } catch (error) {
       console.error('Erro ao listar usuarios: ', error);
        throw error;
    }
}

const obterUsuario = async (registro)=> {
    try {
        return await read('usuarios', `registro = ${registro}`)
    } catch (error) {
        console.error('Erro ao obter usuario por registro: ', error);
        throw error;
    }
};

const obterUsuarioId = async (id) => {
  try {
    return await read('usuarios', `id = ${id}`);
  } catch (error) {
    console.error('Erro ao obter usuário por id:', error);
    throw error;
  }
};


const obterUsuarioPorEmail = async (email) => {

    try {
        return await read('usuarios', `email = '${email}'`);
    } catch (error) {
        console.error('Erro ao obter usuario por email: ', error);
        throw error;
    }
    
  };

const verificarPrimeiroLogin = async (id) => {
    const usuario = await read('usuarios', `id = ${id}`);
    return usuario.primeiro_login === 1; // 1 = true, 0 = false
};

const marcarLoginFeito = async (id) => {
    await update('usuarios', { primeiro_login: 0 }, `id = ${id}`);
};

const listarTecnicos = async () => {
    try {
      return await readAll('usuarios', `funcao = 'tecnico'`);
    } catch (error) {
      console.error('Erro ao listar técnicos: ', error);
      throw error;
    }
};

const listarTecnicosComPools = async () => {
    const sql = `
      SELECT
        u.id,
        u.nome,
        u.setor,
        u.status,
        u.email,
        p.id AS pool_id,
        p.titulo AS pool_nome
      FROM usuarios u
      LEFT JOIN pool_tecnico tp ON u.id = tp.tecnico_id
      LEFT JOIN pool p ON tp.id_pool = p.id
      WHERE u.funcao = 'tecnico';
    `;
    const rows = await query(sql);

    const tecnicosMap = {};
    rows.forEach(row => {
        if (!tecnicosMap[row.id]) {
            tecnicosMap[row.id] = { id: row.id, nome: row.nome, setor: row.setor, status: row.status, pools: [], email: row.email };
        }
        if (row.pool_id) {
            tecnicosMap[row.id].pools.push({ id: row.pool_id, nome: row.pool_nome });
        }
    });

    return Object.values(tecnicosMap);
}

const mudarStatusTecnico = async (id, novoStatus) => {
    try {
        const dadosParaAtualizar = { status: novoStatus };
        const condicao = `id = ${id}`;
        return await update('usuarios', dadosParaAtualizar, condicao);
    } catch (error) {
        console.error('Erro ao mudar status do técnico:', error);
        throw error;
    }
};

const obterStatusUsuario = async (id) => {
    try {
        const usuario = await read('usuarios', `id = ${id}`);
        return { status: usuario.status, funcao: usuario.funcao };
    } catch (error) {
        console.error('Erro ao obter status do usuário:', error);
        throw error;
    }
};


export {criarUsuario, listarUsuarios, obterUsuario, obterUsuarioPorEmail, obterUsuarioId, verificarPrimeiroLogin, marcarLoginFeito, listarTecnicos, listarTecnicosComPools, mudarStatusTecnico, obterStatusUsuario};
