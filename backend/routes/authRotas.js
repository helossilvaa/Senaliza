import express from 'express';
import passport from '../config/ldap.js';
import { criarUsuarioController } from '../controllers/usuarioController.js';

const router = express.Router();

const fakeUsers = [
  {
    registro: '24166210',
    nome: 'HELOISE SOARES SILVA',
    senha: '12345',
    email: '12345678@educ123.sp.senai.br',
    funcao: 'usuario',
  },

  {
    registro: '11122233',
    nome: 'Viviane',
    senha: '12345',
    email: '11122233@educ123.sp.senai.br',
    funcao: 'tecnico',
    setor: 'externo'
  },
   {
    registro: '111111111',
    nome: 'Mariana',
    senha: '12345',
    email: '111111111@educ123.sp.senai.br',
    funcao: 'tecnico',
    setor: 'apoio_limpeza'
  },
  {
    registro: '87654321',
    nome: 'Rodrigo',
    senha: '12345',
    email: '87654321@educ123.sp.senai.br',
    funcao: 'tecnico',
    setor: 'manutencao'
  },
  {
    registro: '11223344',
    nome: 'Arioci',
    senha: '12345',
    email: '11223344@educ123.sp.senai.br',
    funcao: 'admin',
  },
];

const USE_FAKE_AUTH = true;

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  console.log('Login recebido:', req.body);

  if (USE_FAKE_AUTH) {
    const usuarioFake = fakeUsers.find(
      (u) => u.registro === username && u.senha === password
    );

    if (!usuarioFake) {
      return res
        .status(401)
        .json({ error: 'Credenciais inválidas (fake auth)' });
    }

    // Injeta dados fake no req.body para passar no controller
    req.body = {
      fake: true,
      registro: usuarioFake.registro,
      nome: usuarioFake.nome,
      email: usuarioFake.email,
      password: usuarioFake.senha,
      funcao: usuarioFake.funcao,
      setor: usuarioFake.setor,
    };

    return criarUsuarioController(req, res);
  }

  // Se não for fake auth, usa LDAP

  passport.authenticate('ldapauth', { session: true }, (err, user, info) => {
    if (err) {
      console.error('Erro na autenticação LDAP:', err);
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }

    if (!user) {
      console.warn('Falha na autenticação LDAP:', info?.message || 'Credenciais inválidas');
      return res.status(401).json({ error: info?.message || 'Autenticação falhou' });
    }

    req.logIn(user, async (loginErr) => {
      if (loginErr) {
        console.error('Erro ao criar sessão:', loginErr);
        return res.status(500).json({ error: 'Erro ao criar sessão' });
      }

      console.log('Usuário autenticado:', user.username);
      await criarUsuarioController(req, res);
    });
  })(req, res, next);
});


// Logout
router.post('/logout', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Nenhum usuário autenticado' });
  }

  console.log('Usuário deslogando:', req.user?.username);

  req.logout((err) => {
    if (err) {
      console.error('Erro no logout:', err);
      return res.status(500).json({ error: 'Erro ao realizar logout' });
    }

    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error('Erro ao destruir sessão:', destroyErr);
        return res.status(500).json({ error: 'Erro ao encerrar sessão' });
      }

      res.clearCookie('connect.sid');
      res.json({ message: 'Logout realizado com sucesso' });
    });
  });
});

// Verificação de autenticação
router.get('/check-auth', async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const userFromDB = await read('usuarios', `registro = '${req.user.username}'`);

      if (userFromDB) {
        return res.json({
          authenticated: true,
          user: {
            nome: userFromDB.nome,
            funcao: userFromDB.funcao,
          },
        });
      } else {
        req.logout(() => { });
        res.status(401).json({ authenticated: false });
      }
    } catch (error) {
      console.error('Erro ao buscar usuário no DB:', error);
      res.status(500).json({ error: 'Erro interno ao verificar autenticação' });
    }
  } else {
    res.status(401).json({ authenticated: false });
  }
});

export default router;


