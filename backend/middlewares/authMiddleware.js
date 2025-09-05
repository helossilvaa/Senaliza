import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js'; 
import { read } from '../config/database.js'; 

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ mensagem: 'Não autorizado: Token não fornecido' });
  }

  const [ , token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await read('usuarios', `id = ${decoded.id}`);
    
    if (!user) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }
    
    req.user = user;
    req.usuarioId = decoded.id;
    req.usuarioNome = decoded.nome;
    req.usuarioFuncao = decoded.funcao;
    req.usuarioSetor = decoded.setor;
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(403).json({ mensagem: 'Não autorizado: Token inválido' });
  }
};

export default authMiddleware;