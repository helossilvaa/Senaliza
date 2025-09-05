import { create, readAll, read } from '../config/database.js';


const criarRelatorio = async (relatorioData) => {
  try {
    return await create('relatorios', relatorioData);
  } catch (error) {
    console.error('Erro ao criar relatório:', error);
    throw error;
  }
};

const listarRelatorios = async () => {
  try {
    return await readAll('relatorios');
  } catch (error) {
    console.error('Erro ao listar relatórios:', error);
    throw error;
  }
};


const obterRelatorioPorId = async (id) => {
  try {
    return await read('relatorios', `id = ${id}`);
  } catch (error) {
    console.error('Erro ao obter relatório por ID:', error);
    throw error;
  }
};

const buscarRelatorios = async (filtro) => {
    try {
        const keys = Object.keys(filtro);
        const values = Object.values(filtro);
        
        const conditions = keys.map(key => `${key} = ?`).join(' AND ');
        
        return await readAll('relatorios', conditions, values);

    } catch (error) {
        console.error('Erro ao buscar relatórios:', error);
        throw error;
    }
};

export {criarRelatorio, listarRelatorios, obterRelatorioPorId, buscarRelatorios};
