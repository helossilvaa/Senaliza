import React, { useRef, useState, useEffect } from "react";
import { Input } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import style from "./Conversas.module.css";

export default function Chat({ socket, selectedChat, currentUser }) {
  const bottomRef = useRef();
  const messageRef = useRef();
  const [messageList, setMessageList] = useState([]);

  // Buscar mensagens ao trocar de chat
  useEffect(() => {
    const fetchMensagens = async () => {
      if (!selectedChat) return;

      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:8080/mensagem/${selectedChat.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Erro ao buscar mensagens");

        const data = await response.json();
        setMessageList(data);

        if (socket) {
          const handleReceiveMessage = (msg) => {
            if (msg.Chat_id === selectedChat.id) {
              setMessageList((current) => [...current, msg]);
            }
          };

          socket.on("receive_message", handleReceiveMessage);

          return () => {
            socket.off("receive_message", handleReceiveMessage);
          };
        }
      } catch (error) {
        console.error("Erro ao buscar mensagens", error);
      }
    };

    fetchMensagens();
  }, [socket, selectedChat]);

  // Sempre rolar para a última mensagem
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messageList]);

  // Enviar mensagem
  const handleSubmit = async () => {
    const message = messageRef.current.value;
    if (!message.trim() || !socket || !selectedChat || !currentUser) return;

    const mensageData = {
      Chat_id: selectedChat.id,
      remetente_id: currentUser.id,
      mensagem: message,
    };

    try {
      const token = localStorage.getItem("token");
const response = await fetch(`http://localhost:8080/mensagem/${selectedChat.id}`, {
  headers: { Authorization: `Bearer ${token}` }
});
       
      if (!response.ok) {
        throw new Error("Erro ao salvar mensagem");
      }

      socket.emit("message", {
        text: message,
        authorId: socket.id,
        author: currentUser.username,
      });

      clearInput();
      focusInput();
    } catch (error) {
      console.error("Erro ao enviar a mensagem", error);
    }
  };

  const clearInput = () => {
    messageRef.current.value = "";
  };

  const focusInput = () => {
    messageRef.current.focus();
  };

  const getEnterKey = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className={style["chat-container"]}>
      {/* HEADER */}
      <div className={style["chat-header"]}>
        <div className={style["chat-header-left"]}>
          <img
            src="https://i.pravatar.cc/40"
            alt="avatar"
            className={style["chat-avatar"]}
          />
          <div>
            <h1>{currentUser?.username || "Usuário"}</h1>
            <span className={style["chat-status"]}>Online</span>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className={style["chat-body"]}>
        {messageList.map((message) => (
          <div
            className={`${style["message-container"]} ${
              message.remetente_id === currentUser.id && style["message-mine"]
            }`}
            key={message.id}
          >
            <div className={style["message-author"]}>
              <strong>{message.author}</strong>
            </div>
            <div className={style["message-text"]}>{message.mensagem}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* FOOTER */}
      <div className={style["chat-footer"]}>
        <Input
          inputRef={messageRef}
          placeholder="Digite algo..."
          onKeyDown={getEnterKey}
          fullWidth
        />
        <SendIcon sx={{ m: 1, cursor: "pointer" }} onClick={handleSubmit} />
      </div>
    </div>
  );
}
