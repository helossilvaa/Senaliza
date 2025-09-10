import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';

import authRotas from './routes/authRotas.js';
import passport from './config/ldap.js';
import usuarioRotas from './routes/usuarioRotas.js';
import chamadoRotas from './routes/chamadoRotas.js';
import salasRotas from './routes/salasRotas.js';
import EquipamentoRotas from './routes/equipamento.js';
import PoolRotas from './routes/poolRotas.js';
import notificacoesRotas from './routes/notificacoesRotas.js';
import tarefasRotas from './routes/tarefasRotas.js';
import relatoriosRotas from './routes/relatoriosRotas.js';

dotenv.config();

const app = express();
const porta = process.env.PORT || 8080;

try {
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }));
  app.use(express.json());

  app.use(session({
    secret: 'sJYMmuCB2Z187XneUuaOVYTVUlxEOb2K94tFZy370HjOY7T7aiCKvwhNQpQBYL9e',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));

  if (!passport) {
    throw new Error('Passport não foi importado corretamente');
  }
  app.use(passport.initialize());
  app.use(passport.session());

} catch (err) {
  console.error('Erro na configuração inicial:', err);
  process.exit(1);
}

app.use('/auth', authRotas);
app.use('/usuarios', usuarioRotas);
app.use('/chamados', chamadoRotas);
app.use('/salas', salasRotas);
app.use('/equipamentos', EquipamentoRotas);
app.use('/pools', PoolRotas);
app.use('/notificacoes', notificacoesRotas);
app.use('/tarefas', tarefasRotas);
app.use('/relatorios', relatoriosRotas);


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'online' });
});

app.use("/api/chamados", chamadoRotas);

process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejeição não tratada em:', promise, 'motivo:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Exceção não capturada:', err);
  process.exit(1);
});

const server = app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
}).on('error', (err) => {
  console.error('Erro ao iniciar:', err);
});


process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Servidor encerrado');
  });
});

app.get('/', (req, res) => {
  res.send('Backend funcionando!');
});
