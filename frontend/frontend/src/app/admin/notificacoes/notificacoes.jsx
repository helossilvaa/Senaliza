'use client'
import { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import HeaderAdmin from '@/components/HeaderAdmin/headerAdmin';
import "./notificacoes.css";

export default function App() {
    const [selected, setSelected] = useState(null);

    const notifications = [
        {
            id: 1,
            title: "Chamada 12345 aberta",
            time: "10:55",
            date: "10 de setembro",
            details: "A chamada número 12345 foi aberta para o setor de TI."
        },
        {
            id: 2,
            title: "Junior enviou uma mensagem!",
            time: "10:55",
            date: "10 de setembro",
            details: "O técnico Junior respondeu sua solicitação. Verifique a conversa."
        },
        {
            id: 3,
            title: "Avalie o atendimento!",
            time: "10:55",
            date: "10 de setembro",
            details: "Por favor, avalie a qualidade do atendimento prestado."
        },
        {
            id: 4,
            title: "Chamada 12345 aberta",
            time: "10:55",
            date: "10 de setembro",
            details: "A chamada número 12345 continua em aberto aguardando solução."
        }
    ];

    return (
        <div className="container-fluid vh-100">
            <div className="row h-100">
                <HeaderAdmin />


                <main className="col p-4 d-flex flex-column flex-md-row gap-4" >


                <div className="card" >
                    <div className="card-body" >
                        <h1 className="card-title mb-3"> Notificações</h1>
                        <ul className="list-group list-group-flush">
                            {notifications.map((n) => (
                                <li
                                    key={n.id}
                                    className="list-group-item d-flex align-items-center justify-content-between notification-item" style={{ marginTop: '10px' }}
                                    onClick={() => setSelected(n)}
                                >
                                    <div>
                                        <p className="mb-1 fw-semibold">{n.title}</p>
                                        <small className="text-muted">{n.time} | {n.date}</small>
                                    </div>
                                    <span className="badge bg-danger rounded-circle p-2"></span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>


                {selected && (
                    <div className="card shadow-sm flex-grow-1 rounded-4 animate__animated animate__fadeInRight drawer-card" >
                        <div className="card-header d-flex justify-content-between align-items-center text-white rounded-top-4"
                            style={{ backgroundColor: '#b10000', height: '60px' }}>
                            <h6 className="mb-0">{selected.title}</h6>
                            <button
                                className="btn-close btn-close-white"
                                onClick={() => setSelected(null)}>
                            </button>
                        </div>
                        <div className="card-body">
                            <p><b>Data:</b> {selected.date} às {selected.time}</p>
                            <p>{selected.details}</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    </div >
  );
}
