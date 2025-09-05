'use client';

import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { Input } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import "./chat.css";

// Socket.IO connection
const socket = io("http://localhost:8080", { transports: ["websocket"] });

const ChatPage = ({ currentUser }) => {
  const [chats, setChats] = useState([]);
  const [chatSelecionado, setChatSelecionado] = useState(null);
  const [carregandoChats, setCarregandoChats] = useState(true);
  const [mensagens, setMensagens] = useState([]);

  const messageRef = useRef();
  const bottomRef = useRef();

  // 🔹 Fetch user's chats
  const listarChatsDoUsuario = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setCarregandoChats(true);
    try {
      const response = await fetch("http://localhost:8080/chats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erro ao listar chats");
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error("Erro de rede:", error);
    } finally {
      setCarregandoChats(false);
    }
  };

  useEffect(() => {
    listarChatsDoUsuario();
  }, []);

  // 🔹 Fetch messages when a chat is selected
  useEffect(() => {
    const fetchMensagens = async () => {
      if (!chatSelecionado) return;
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:8080/mensagem/${chatSelecionado.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error("Erro ao buscar mensagens");
        const data = await response.json();
        setMensagens(data);

        // 🔹 Join the chat room on the socket
        socket.emit("join_room", { chatId: chatSelecionado.id, userId: currentUser.id });
      } catch (err) {
        console.error("Erro ao buscar mensagens:", err);
      }
    };
    fetchMensagens();
  }, [chatSelecionado]);

  // 🔹 Receive messages in real-time
  useEffect(() => {
    if (!chatSelecionado?.id) return;

    const handleReceiveMessage = (data) => {
      if (data.chat_id === chatSelecionado.id) {
        setMensagens((prev) => [...prev, data]);
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    return () => socket.off("receive_message", handleReceiveMessage);
  }, [chatSelecionado?.id]);

  // 🔹 Automatic scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  // 🔹 Send message
  const handleSubmit = async () => {
    if (!messageRef.current || !chatSelecionado || !currentUser) return;
    const message = messageRef.current.value.trim();
    if (!message) return;

    const mensageData = {
      chat_id: chatSelecionado.id,
      remetente_id: currentUser.id,
      mensagem: message,
    };

    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:8080/mensagem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(mensageData),
      });

      // Send via socket
      socket.emit("message", mensageData);

      // Clear input
      messageRef.current.value = "";
    } catch (err) {
      console.error("Erro ao enviar mensagem", err);
    }
  };

  // 🔹 Get the other participant's name
  const getNomeDoOutro = (chat) => {
    if (chat.tecnico_id === currentUser?.id) {
      return chat.usuario_nome || `Usuário ${chat.usuario_id}`;
    } else {
      return chat.tecnico_nome || `Técnico ${chat.tecnico_id}`;
    }
  };

  return (
    <div className="pagina-chat-completa">
      {/* Sidebar */}
      <aside className="lista-de-chats">
        <h2>Conversas</h2>
        {carregandoChats ? (
          <p className="loading-lista">Carregando chats...</p>
        ) : (
          <ul>
            {chats.length === 0 ? (
              <p className="loading-lista">Nenhum chat encontrado.</p>
            ) : (
              chats.map((chat) => (
                <li
                  key={chat.id}
                  onClick={() => setChatSelecionado(chat)}
                  className={chatSelecionado?.id === chat.id ? "chat-ativo" : ""}
                >
                  {getNomeDoOutro(chat)}
                </li>
              ))
            )}
          </ul>
        )}
      </aside>

      {/* Main chat area */}
      <main className="chat-principal">
        {chatSelecionado ? (
          <div className="chat-container">
            <div className="chat-body">
              {mensagens.map((msg, i) => {
                const isCurrentUser = msg.remetente_id === currentUser?.id;
                const remetenteNome = isCurrentUser
                  ? "Você"
                  : getNomeDoOutro(chatSelecionado);

                return (
                  <div
                    key={i}
                    className={`message-container ${isCurrentUser ? "message-mine" : ""
                      }`}
                  >
                    <div className="sender-name">{remetenteNome}</div>
                    <div className="message-text">{msg.mensagem}</div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="chat-footer d-flex align-items-center p-2 border-top">
              <input
                ref={messageRef}
                type="text"
                className="form-control"
                placeholder={`Mensagem para ${getNomeDoOutro(chatSelecionado)}...`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-primary ms-2"
                onClick={() => handleSubmit()}
              >
                Enviar
              </button>
            </div>

          </div>
        ) : (
          <div className="nenhum-chat-selecionado">
            Selecione um chat na barra lateral para começar a conversar.
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatPage;