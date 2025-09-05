import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ConversationsList.css";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export default function ConversationsList({ onSelectConversation }) {
  const [conversations, setConversations] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const router = useRouter(); 

  const api_url = "http://localhost:8080";

  useEffect(() => {

    const fetchChats = async () => {
      try {

        const token = localStorage.getItem("token");

        const decoded = jwtDecode(token);


        if (!token) {
          router.push("/login");
          return;
        }

        if (decoded.exp < Date.now() / 1000) {
          localStorage.removeItem("token");
          alert("Seu login expirou");
          router.push("/login");
          return;
        }
        
        const response = await fetch (`${api_url}/chats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar dados");
        }

        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error("Erro ao buscar chat", error);
      }
    };

    fetchChats();
  }, [router]);

  const conversasFiltradas =
    activeTab === "unread"
      ? conversations.filter((c) => c.unread > 0)
      : conversations;

  return (
    <div className="conversations-list container-fluid">
     
      <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
        <h2 className="h5 m-0">Conversas</h2>
        <CloseIcon style={{ cursor: "pointer" }} />
      </div>

    
      <div className="d-flex gap-3 py-2 border-bottom">
        <span
          className={`cursor-pointer ${
            activeTab === "all" ? "fw-bold border-bottom border-dark" : ""
          }`}
          onClick={() => setActiveTab("all")}
        >
          Todas
        </span>
        <span
          className={`cursor-pointer ${
            activeTab === "unread" ? "fw-bold border-bottom border-dark" : ""
          }`}
          onClick={() => setActiveTab("unread")}
        >
          Não lidas
        </span>
      </div>

   
      <div className="list-group list-group-flush">
        {conversasFiltradas.map((conv) => (
          <div
            key={conv.id}
            className="list-group-item d-flex justify-content-between align-items-center"
            style={{ cursor: "pointer" }}
            onClick={() => onSelectConversation?.(conv)}
          >
            <div className="d-flex align-items-center">
          
              <div
                className="position-relative rounded-circle bg-secondary me-3"
                style={{ width: "40px", height: "40px" }}
              >
                {conv.unread > 0 && (
                  <span className="unread-badge">{conv.unread}</span>
                )}
              </div>

              
              <div>
                <h6 className="mb-0">{conv.name}</h6>
                <small className="text-muted">{conv.lastMessage}</small>
              </div>
            </div>

         
            <small className="text-muted">{conv.time}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
