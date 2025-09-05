import {
  criarUsuario,
  listarUsuarios,
  obterUsuario,
  obterUsuarioId,
  obterUsuarioPorEmail,
  listarTecnicos,
  listarTecnicosComPools,
  mudarStatusTecnico
} from '../models/usuario.js';

import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';
import generateHashedPassword from '../hashPassword.js';

const criarUsuarioController = async (req, res) => {

  try {
    const isFake = req.body.fake === true;

    // Se for fake, pega tudo do req.body
    // Se for real, pega do req.user (LDAP)
    const email = isFake ? req.body.email : req.user?.userPrincipalName;
    const nome = isFake ? req.body.nome : req.user?.displayName;
    const registro = isFake ? req.body.registro : req.user?.sAMAccountName;
    const password = req.body.password;
    const funcao = isFake ? (req.body.funcao || 'usuario') : (req.user?.funcao || 'usuario');
    const setor = isFake ? req.body.setor : (req.user?.setor || null);

    if (!password || !email || !nome || !registro) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes!' });
    }

    let usuario = await obterUsuario(registro);
    if (!usuario) {
      usuario = await obterUsuarioPorEmail(email);
    }

    // Se a função obterUsuario retorna array, garanta pegar o primeiro:
    if (Array.isArray(usuario)) {
      usuario = usuario[0];
    }

    if (!usuario) {
      console.log(`Usuário não encontrado no banco! Criando novo usuário: ${nome}`);

      const senha = await generateHashedPassword(password);

      const usuarioData = {
        nome,
        email,
        senha,
        registro,
        funcao: funcao,
        setor: setor || null
      };

      await criarUsuario(usuarioData);

      usuario = await obterUsuario(registro);

      if (Array.isArray(usuario)) {
        usuario = usuario[0];
      }
    }

    if (!usuario || !usuario.id) {
      console.error('Erro: usuário ainda é null após criação.');
      return res.status(500).json({ error: 'Falha ao recuperar usuário após criação' });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        numeroRegistro: usuario.registro,
        funcao: usuario.funcao,
        setor: usuario.setor || null
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      message: 'Autenticado com sucesso',
      token,
      usuario: {
        id: usuario.id,
        numeroRegistro: usuario.registro,
        displayName: usuario.nome,
        email: usuario.email,
        funcao: usuario.funcao,
        setor: usuario.setor  || null
      },
    });
  } catch (error) {
    console.error('Erro ao criar usuário no banco:', error);
    return res.status(500).json({ error: 'Erro interno ao salvar usuário' });
  }
};


const listarUsuariosController = async (req, res) => {
  try {
    const usuarios = await listarUsuarios();
    res.status(200).json(usuarios);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ mensagem: 'Erro ao listar usuários', error });
  }
};

const obterUsuarioIdController = async (req, res) => {
  try {
    const usuario = await obterUsuarioId(req.params.id);
    res.status(200).json(usuario);
  } catch (error) {
    console.error('Erro ao obter usuário por id:', error);
    res
      .status(500)
      .json({ mensagem: 'Erro ao obter usuário por id', error });
  }
};

const listarTecnicosController = async (req, res) => {
  try {
    const tecnicos = await listarTecnicos();
    res.status(200).json(tecnicos);
  } catch (error) {
    console.error('Erro ao listar técnicos:', error);
    res.status(500).json({ mensagem: 'Erro ao listar técnicos.', error });
  }
};

const obterUsuarioLogadoController = async (req, res) => {
  try {
    const usuario = await obterUsuario(req.usuarioId); 
    if (!usuario) return res.status(404).json(null);
    res.status(200).json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao obter usuário' });
  }
};

const listarTecnicosComPoolsController = async (req, res) => {
  try {
    const tecnicos = await listarTecnicosComPools();
    res.status(200).json(tecnicos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao listar técnicos com pools.', error });
  }
};

const mudarStatusTecnicoController = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const usuarioFuncao = req.usuarioFuncao;

        
        if (usuarioFuncao !== 'admin') {
            return res.status(403).json({ mensagem: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
        }

        if (status !== 'ativo' && status !== 'inativo') {
            return res.status(400).json({ mensagem: 'Status inválido. Use "ativo" ou "inativo".' });
        }

        await mudarStatusTecnico(id, status);
        res.status(200).json({ mensagem: `Status do técnico alterado para ${status} com sucesso!` });
    } catch (error) {
        console.error('Erro ao mudar o status do técnico:', error);
        res.status(500).json({ mensagem: 'Erro ao mudar o status do técnico.', error });
    }
};


export {
  criarUsuarioController,
  listarUsuariosController,
  obterUsuarioIdController,
  obterUsuarioLogadoController,
  listarTecnicosController,
  listarTecnicosComPoolsController,
  mudarStatusTecnicoController
};
