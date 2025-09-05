'use client'
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from '@/components/Header/header';
import { SidebarProvider } from '@/components/Header/sidebarContext';
import "./notificacoes.css";

export default function Notificacoes() {
  const [selected, setSelected] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  const API_URL = "http://localhost:8080";

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { router.push("/"); return; }

        const res = await fetch(`${API_URL}/notificacoes`, {
          method: "GET",
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Erro ao buscar notificações');

        const data = await res.json();

        // **Aqui não filtramos nada**: o backend já retorna apenas notificações do usuário ou técnico
        setNotifications(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Erro:", err);
        setError("Erro ao carregar notificações.");
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [router]);

  const handleNotificationClick = async (notification) => {
    setSelected({ ...notification, visualizado: 1 });
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, visualizado: 1 } : n));

    if (notification.visualizado === 1) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/notificacoes/${notification.id}/marcarvista`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erro ao marcar notificação como vista');
    } catch (error) {
      console.error("Erro ao marcar notificação como vista:", error);
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, visualizado: 0 } : n));
      setSelected(notification);
    }
  };

  return (
    <SidebarProvider>
      <div className="container-fluid vh-100">
        <div className="row h-100">
          <Header />
          <main className="col p-4 d-flex flex-column flex-md-row gap-4">
            <div className="card">
              <div className="card-body">
                <h1 className="card-title mb-3">Notificações</h1>
                <ul className="list-group list-group-flush">
                  {isLoading ? <p className="text-muted text-center mt-3">Carregando...</p> :
                   notifications.length === 0 ? <p className="text-muted text-center mt-3">Nenhuma notificação.</p> :
                   notifications.map(n => (
                     <li key={n.id} className="list-group-item d-flex justify-content-between" onClick={() => handleNotificationClick(n)}>
                       <span>{n.mensagem}</span>
                       {n.visualizado === 0 && <span className="badge bg-danger rounded-circle p-2"></span>}
                     </li>
                   ))
                  }
                </ul>
              </div>
            </div>
            {selected && (
              <div className="card shadow-sm flex-grow-1 rounded-4 animate__animated animate__fadeInRight">
                <div className="card-header d-flex justify-content-between align-items-center text-white rounded-top-4" style={{ backgroundColor: '#b10000', height: '60px' }}>
                  <h6 className="mb-0">Detalhes da Notificação</h6>
                  <button className="btn-close btn-close-white" onClick={() => setSelected(null)}></button>
                </div>
                <div className="card-body">
                  <p><b>Mensagem:</b> {selected.mensagem}</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
