"use client";
 
import * as React from "react";
import styles from "@/app/usuario/chamados/[id]/page.module.css";
import LayoutUser from '@/components/LayoutUser/layout';
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import Loading from "@/app/loading";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
 
export default function InfoPage({ params }) {
  const { id } = React.use(params);
  const [chamado, setChamado] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const API_URL = "http://localhost:8080";
  const [timelineItems, setTimelineItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [comentarioModal, setComentarioModal] = useState("");
 
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
 
    const decoded = jwtDecode(token);
    if (decoded.exp < Date.now() / 1000) {
      localStorage.removeItem("token");
      toast.error("Seu login expirou.");
      setTimeout(() => router.push("/login"), 3000);
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
 
        const apontRes = await fetch(`${API_URL}/chamados/${id}/apontamentos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const apontData = apontRes.ok ? await apontRes.json() : [];
        setTimelineItems(apontData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
 
    fetchChamado();
  }, [id, router]);
 
  const handleEnviarComentario = async () => {
    if (!comentarioModal.trim() || chamado.status === "finalizado") return;
 
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Você precisa estar logado.");
      router.push("/login");
      return;
    }
 
    try {
      const res = await fetch(`${API_URL}/chamados/${id}/apontamentos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          apontamento: comentarioModal.trim(),
          tipo: "usuario",
        }),
      });
 
      if (!res.ok) throw new Error("Erro ao salvar comentário");
 
      const novoApontamento = await res.json();
 
      setTimelineItems((prev) => [...prev, novoApontamento]);
      setComentarioModal("");
      setShowModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar comentário. Tente novamente.");
    }
  };
 
  if (loading) return <Loading />;
  if (!chamado) return <p>Chamado não encontrado.</p>;
 
  return (
    <LayoutUser>
      <ToastContainer position="top-right" autoClose={3000} pauseOnHover={false} theme="light" />

      <div className={styles.page}>
        <div className="container-fluid p-4">
          <div className={styles.conteudoPrincipal}>
            <div className={styles.infos}>
              <h3 className={styles.titulo}>Informações</h3>
              <div className={styles.card}>
                <h2 className={styles.tituloCard}>{chamado.titulo}</h2>
                <div className={styles.subInfo}>
                  <p className={styles.autor}>{chamado.usuario}</p>
                  <p className={styles.data}>
                    {new Date(chamado.criado_em).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <p className={styles.descricao}>{chamado.descricao}</p>
 
                {/* Aqui colocamos o texto do prazo e o botão lado a lado */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                  <p style={{ margin: 0, fontWeight: "bold" }}>
                    {chamado.prazo
                      ? `Prazo : ${new Date(chamado.prazo).toLocaleDateString("pt-BR")}`
                      : "Prazo não estipulado"}
                  </p>
                  <button
                    onClick={() => chamado.status !== "concluído" ? setShowModal(true) : null}
                    disabled={chamado.status === "concluído"}
                    title={chamado.status === "concluído" ? "Chamado finalizado — não é possível adicionar comentários" : ""}
                    style={{
                      backgroundColor: chamado.status === "concluído" ? "#c0c0c0" : "#640d14",
                      cursor: chamado.status === "concluído" ? "not-allowed" : "pointer",
                      color: "#fff",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                    }}
                  >
                    Adicionar Comentário
                  </button>
                </div>
              </div>
 
              {timelineItems
                .filter((item) => item.tipo === "usuario")
                .map((item) => (
                  <div
                    key={item.id}
                    className={styles.card}
                    style={{ marginTop: "1rem" }}
                  >
                    <p className={styles.descricao}>{item.apontamento}</p>
                    <p className={styles.dataLinhaTempo}>
                      {new Date(item.criado_em).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                ))}
            </div>
 
            <div className={styles.timelineContainer}>
              <div className={styles.linhaTempo}>
                <div className={styles.tituloLinhaTempo}>
                  <p>Acompanhe a resolução do problema</p>
                </div>
 
                <div className={styles.infosLinhaTempo}>
                  {timelineItems.filter(item => item.tipo === "tecnico").length > 0 ? (
                    timelineItems
                      .filter((item) => item.tipo === "tecnico")
                      .map((item) => (
                        <div
                          key={item.id}
                          className={styles.informacoesLinhaTempo}
                        >
                          <span className={styles.ponto}></span>
                          <div>
                            <h4>{item.apontamento}</h4>
                            <p className={styles.dataLinhaTempo}>
                              {new Date(item.criado_em).toLocaleDateString(
                                "pt-BR",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}{" "}
                              — <b>Técnico</b>
                            </p>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className={styles.placeholder}>
                      Nenhum apontamento ainda. O técnico ainda não adicionou
                      informações.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
 
          {showModal && chamado.status !== "finalizado" && (
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
    </LayoutUser>
  );
}