import express from "express";
import mysql from "mysql2/promise";
import cors from "cors"; // Importa o pacote CORS

const app = express();
app.use(express.json());
app.use(cors()); // Habilita o CORS para permitir requisições de diferentes origens (ex: frontend Next.js)

// Configuração do pool de conexão com o banco de dados MySQL
const db = await mysql.createPool({
    host: "localhost",
    user: "root",
    password: "senha",
    database: "sistema" // Certifique-se de que este é o nome correto do seu banco de dados
});

console.log("Conectado ao banco de dados MySQL! 🚀");

// --- ENDPOINTS DA API ---

// 1. Criar um novo chamado (usuário envia o problema)
// Status inicial: 'pendente'
app.post("/chamados", async (req, res) => {
    const { titulo, descricao, tipo_id, usuario_id, sala_id, equipamento_id } = req.body;
    try {
        const [result] = await db.query(
            `INSERT INTO chamados (titulo, descricao, tipo_id, usuario_id, sala_id, equipamento_id, status)
             VALUES (?, ?, ?, ?, ?, ?, 'pendente')`,
            [titulo, descricao, tipo_id, usuario_id, sala_id, equipamento_id]
        );
        res.status(201).json({ 
            id: result.insertId, 
            status: "pendente", 
            message: "Chamado criado com sucesso e enviado para os técnicos!" 
        });
    } catch (error) {
        console.error("Erro ao criar chamado:", error);
        res.status(500).json({ message: "Erro interno do servidor ao criar chamado." });
    }
});

// 2. Listar todos os chamados pendentes (para a página de técnicos)
// Os técnicos verão esses chamados para poderem aceitá-los
app.get("/chamados/pendentes", async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT 
                c.id, c.titulo, c.descricao, c.status, c.criado_em,
                u.nome AS usuario_nome, s.nome AS sala_nome, e.nome AS equipamento_nome,
                t.nome AS tipo_chamado_nome
             FROM chamados c
             LEFT JOIN usuarios u ON c.usuario_id = u.id
             LEFT JOIN salas s ON c.sala_id = s.id
             LEFT JOIN equipamentos e ON c.equipamento_id = e.patrimonio
             LEFT JOIN pool t ON c.tipo_id = t.id
             WHERE c.status = 'pendente' 
             ORDER BY c.criado_em DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error("Erro ao buscar chamados pendentes:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar chamados pendentes." });
    }
});

// 3. Aceitar um chamado (o técnico aceita o chamado)
// Muda o status para 'em andamento' e atribui o técnico
app.patch("/chamados/:id/aceitar", async (req, res) => {
    const { tecnico_id } = req.body; // ID do técnico que está aceitando
    const { id } = req.params; // ID do chamado a ser aceito

    if (!tecnico_id) {
        return res.status(400).json({ message: "ID do técnico é obrigatório para aceitar o chamado." });
    }

    try {
        const [result] = await db.query(
            `UPDATE chamados
             SET status = 'em andamento', tecnico_id = ?, atualizado_em = NOW()
             WHERE id = ? AND status = 'pendente'`, // Garante que só um chamado pendente seja aceito
            [tecnico_id, id]
        );

        if (result.affectedRows === 0) {
            // Se nenhum linha foi afetada, o chamado pode não existir ou não estar pendente
            return res.status(404).json({ message: "Chamado não encontrado, já aceito ou não está pendente." });
        }
        res.json({ message: "Chamado aceito com sucesso e agora está em andamento!" });
    } catch (error) {
        console.error("Erro ao aceitar chamado:", error);
        res.status(500).json({ message: "Erro interno do servidor ao aceitar chamado." });
    }
});

// 4. Listar os chamados de um técnico específico ('Meus Chamados')
// Mostra os chamados que o técnico aceitou e que estão 'em andamento'
app.get("/chamados/meus/:tecnico_id", async (req, res) => {
    const { tecnico_id } = req.params;
    try {
        const [rows] = await db.query(
            `SELECT 
                c.id, c.titulo, c.descricao, c.status, c.criado_em, c.atualizado_em,
                u.nome AS usuario_nome, s.nome AS sala_nome, e.nome AS equipamento_nome,
                t.nome AS tipo_chamado_nome
             FROM chamados c
             LEFT JOIN usuarios u ON c.usuario_id = u.id
             LEFT JOIN salas s ON c.sala_id = s.id
             LEFT JOIN equipamentos e ON c.equipamento_id = e.patrimonio
             LEFT JOIN pool t ON c.tipo_id = t.id
             WHERE c.status = 'em andamento' AND c.tecnico_id = ? 
             ORDER BY c.atualizado_em DESC`,
            [tecnico_id]
        );
        res.json(rows);
    } catch (error) {
        console.error("Erro ao buscar chamados do técnico:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar chamados do técnico." });
    }
});

// 5. Finalizar um chamado (o técnico conclui o trabalho)
// Muda o status para 'concluído'
app.patch("/chamados/:id/finalizar", async (req, res) => {
    const { id } = req.params; // ID do chamado a ser finalizado
    // Opcional: Você pode querer verificar o tecnico_id para garantir que apenas o técnico atribuído pode finalizar
    // const { tecnico_id } = req.body; 

    try {
        const [result] = await db.query(
            `UPDATE chamados
             SET status = 'concluído', atualizado_em = NOW()
             WHERE id = ? AND status = 'em andamento'`, // Garante que só um chamado 'em andamento' seja finalizado
            [id]
        );

        if (result.affectedRows === 0) {
            // Se nenhuma linha foi afetada, o chamado pode não existir, não estar em andamento
            // ou o tecnico_id não corresponde (se você adicionar essa verificação)
            return res.status(404).json({ message: "Chamado não encontrado ou não está em andamento." });
        }
        res.json({ message: "Chamado finalizado com sucesso!" });
    } catch (error) {
        console.error("Erro ao finalizar chamado:", error);
        res.status(500).json({ message: "Erro interno do servidor ao finalizar chamado." });
    }
});

// 6. Listar o histórico de chamados ('Histórico')
// Mostra todos os chamados com status 'concluído'
app.get("/chamados/historico", async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT 
                c.id, c.titulo, c.descricao, c.status, c.criado_em, c.atualizado_em,
                u.nome AS usuario_nome, t.nome AS tecnico_nome, s.nome AS sala_nome, e.nome AS equipamento_nome,
                tp.nome AS tipo_chamado_nome
             FROM chamados c
             LEFT JOIN usuarios u ON c.usuario_id = u.id
             LEFT JOIN usuarios t ON c.tecnico_id = t.id
             LEFT JOIN salas s ON c.sala_id = s.id
             LEFT JOIN equipamentos e ON c.equipamento_id = e.patrimonio
             LEFT JOIN pool tp ON c.tipo_id = tp.id
             WHERE c.status = 'concluído' 
             ORDER BY c.atualizado_em DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error("Erro ao buscar histórico de chamados:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar histórico de chamados." });
    }
});

// Iniciar o servidor na porta 3000
app.listen(3000, () => console.log("API de Chamados rodando na porta 3000 🚀"));
