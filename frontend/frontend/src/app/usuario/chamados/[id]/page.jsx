"use client";

import * as React from "react";
import styles from "@/app/usuario/chamados/[id]/page.module.css";
import HeaderTecnico from "@/components/HeaderTecnico/headerTecnico";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

export default function InfoPage({ params }) {

    const { id } = params;
    const [chamado, setChamado] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const API_URL = "http://localhost:8080";
    const [timelineItems, setTimelineItems] = useState([]);
    const [comentarios, setComentarios] = useState([]);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [comentarioModal, setComentarioModal] = useState("");

    useEffect(() => {
        if (id && typeof window !== 'undefined') {
            const savedItems = localStorage.getItem(`timelineData_${id}`);
            if (savedItems) setTimelineItems(JSON.parse(savedItems));
        }
    }, [id]);

    useEffect(() => {
        if (id && typeof window !== 'undefined' && timelineItems.length > 0) {
            localStorage.setItem(`timelineData_${id}`, JSON.stringify(timelineItems));
        }
    }, [timelineItems, id]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        const decoded = jwtDecode(token);
        if (decoded.exp < Date.now() / 1000) {
            localStorage.removeItem("token");
            alert("Seu login expirou.");
            router.push("/login");
            return;
        }

        const fetchChamado = async () => {
            try {
                const res = await fetch(`${API_URL}/chamados/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Erro ao buscar chamado");
                const data = await res.json();
                setChamado(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchChamado();
    }, [id, router]);

    const handleEnviarComentario = () => {
        if (!comentarioModal.trim()) return;

        const novoComentario = {
            titulo: comentarioModal,
            data: new Date().toLocaleString()
        };

        setComentarios([...comentarios, novoComentario]);
        setComentarioModal("");
        setShowModal(false);
    };

    if (loading) return <p>Carregando...</p>;
    if (!chamado) return <p>Chamado não encontrado.</p>;

    return (
        <div className={styles.page}>
            <HeaderTecnico />
            <div className="container-fluid p-4">
                <div className={styles.conteudoPrincipal}>
                    <div className={styles.infos}>
                        <h3 className={styles.titulo}>Informações</h3>
                        <div className={styles.card}>
                            <h2 className={styles.tituloCard}>{chamado.titulo}</h2>
                            <div className={styles.subInfo}>
                                <p className={styles.autor}>{chamado.usuario}</p>
                                <p className={styles.data}>{chamado.criado_em}</p>
                            </div>
                            <p className={styles.descricao}>{chamado.descricao}</p>
                            <div className={styles.botao}>
                                <button onClick={() => setShowModal(true)}>Adicionar Comentário</button> 
                            </div>
                        </div>

                        {/* Comentários enviados via modal */}
                        {comentarios.map((item, index) => (
                            <div key={index} className={styles.card} style={{ marginTop: "1rem" }}>
                                <p className={styles.descricao}>{item.titulo}</p>
                                <p className={styles.dataLinhaTempo}>{item.data}</p>
                            </div>
                        ))}
                    </div>

                    {/* Timeline */}
                    <div className={styles.timelineContainer}>
                        <div className={styles.linhaTempo}>
                            <div className={styles.tituloLinhaTempo}>
                                <p>Acompanhe a resolução do problema</p>
                            </div>

                            <div className={styles.infosLinhaTempo}>
                                {timelineItems.length > 0 ? (
                                    timelineItems.map((item, index) => (
                                        <div key={index} className={styles.informacoesLinhaTempo}>
                                            <span className={styles.ponto}></span>
                                            <div>
                                                <h4>{item.titulo}</h4>
                                                <p className={styles.dataLinhaTempo}>{item.data}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.placeholder}>
                                        Nenhum item na linha do tempo. O técnico ainda não adicionou informações.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <h3>Adicionar Comentário</h3>
                            <textarea
                                value={comentarioModal}
                                onChange={(e) => setComentarioModal(e.target.value)}
                                placeholder="Escreva seu comentário..."
                                rows={4}
                            />
                            <div className={styles.modalButtons}>
                                <button onClick={handleEnviarComentario}>Enviar</button>
                                <button onClick={() => setShowModal(false)}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
