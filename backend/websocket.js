import { Server } from "socket.io";

let io;

export const initWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // frontend
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Usuário conectado ao Socket.IO");

    // 🔹 Entrar em uma sala de chat
    socket.on("join_room", ({ chatId, userId }) => {
      if (!chatId || !userId) return;

      // Sala do chat
      socket.join(`chat_${chatId}`);

      // Sala do usuário (para notificações privadas)
      socket.join(`user_${userId}`);

      console.log(`Usuário ${userId} entrou na sala do chat ${chatId}`);
    });

    // 🔹 Recebe mensagem do frontend
    socket.on("message", (data) => {
      const { chat_id } = data;
      if (!chat_id) return;

      // Envia para todos na sala do chat, incluindo o remetente
      io.to(`chat_${chat_id}`).emit("receive_message", data);

      console.log("Mensagem enviada em tempo real:", data);
    });

    socket.on("disconnect", () => {
      console.log("Usuário desconectou");
    });
  });
};

// 🔹 Função auxiliar para enviar para um usuário específico (ex.: notificações)
export const emitirParaUsuario = (usuarioId, evento, data) => {
  if (!io) return;
  io.to(`user_${usuarioId}`).emit(evento, data);
};
