"use client";
import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import CalendarPage from "@/components/Calendario/page";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Layout from "@/components/LayoutTecnico/layout";
import Loading from "@/app/loading";

function getDiasAtePrazo(prazo) {
  if (!prazo) return [];
  const hoje = new Date();
  const fim = new Date(prazo);
  const dias = [];
  let d = new Date(hoje);

  while (d <= fim) {
    dias.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }

  return dias;
}

export default function InfoPage({ params }) {
  const { id } = React.use(params);  
  const [chamado, setChamado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prazoSelecionado, setPrazoSelecionado] = useState(null);
  const [apontamentoTexto, setApontamentoTexto] = useState("");
  const [isEnviandoApontamento, setIsEnviandoApontamento] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [usuarioNome, setUsuarioNome] = useState("");
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [showConfirmarModal, setShowConfirmarModal] = useState(false);
  const [showSolucaoModal, setShowSolucaoModal] = useState(false);
  const [solucaoTexto, setSolucaoTexto] = useState("");
  const [isFinalizando, setIsFinalizando] = useState(false);

  const API_URL = "http://localhost:8080";
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const decoded = jwtDecode(token);
    setUsuarioLogado(decoded);
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

        if (!data.apontamentos) {
          const apontRes = await fetch(`${API_URL}/chamados/${id}/apontamentos`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          data.apontamentos = apontRes.ok ? await apontRes.json() : [];
        }

        setChamado(data);

        if (data.status === "em andamento" && data.tecnico_id === decoded.id) {
          setMostrarCalendario(true);
          setPrazoSelecionado(data.prazo); // <- pega do banco
        }
      } catch (err) {
        console.error(err);
        alert("Erro ao carregar chamado.");
      } finally {
        setLoading(false);
      }
    };

    fetchChamado();
  }, [id, router]);

  useEffect(() => {
    if (chamado?.usuario_id) {
      const token = localStorage.getItem("token");
      fetch(`${API_URL}/usuarios/${chamado.usuario_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject("Erro ao buscar usuário")))
        .then((data) => setUsuarioNome(data.nome))
        .catch(console.error);
    }
  }, [chamado]);

  const handleCriarApontamento = async () => {
    if (!apontamentoTexto.trim()) {
      alert("Preencha o apontamento.");
      return;
    }
    setIsEnviandoApontamento(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/chamados/${id}/apontamentos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ apontamento: apontamentoTexto }),
      });
      if (!res.ok) throw new Error("Erro ao criar apontamento");
      const novoApontamento = await res.json();
      setChamado((prev) => ({
        ...prev,
        apontamentos: [...(prev.apontamentos || []), novoApontamento],
      }));
      setApontamentoTexto("");
      setMostrarForm(false);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsEnviandoApontamento(false);
    }
  };

  
  const handleAssumirChamado = async () => {
    if (!prazoSelecionado) {
      alert("Selecione um prazo.");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/chamados/assumir/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prazo: prazoSelecionado }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Erro ao assumir chamado");
      }

      const data = await res.json(); // <- chamado atualizado
      setChamado(data);
      alert("Chamado assumido com prazo salvo!");
      setMostrarCalendario(true);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleEnviarSolucao = async () => {
    if (!solucaoTexto.trim()) {
      alert("Descreva a solução.");
      return;
    }
    const token = localStorage.getItem("token");
    setIsFinalizando(true);
    try {
      const res = await fetch(`${API_URL}/chamados/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "concluido", solucao: solucaoTexto }),
      });
      if (!res.ok) throw new Error("Erro ao finalizar chamado.");
      router.push("/tecnico/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsFinalizando(false);
      setShowSolucaoModal(false);
    }
  };

  const isChamadoPendente = chamado?.status === "pendente";
  const isChamadoAssumido = chamado?.status === "em andamento" && chamado.tecnico_id === usuarioLogado?.id;

  if (loading) return <Loading />;
  if (!chamado) return <p>Chamado não encontrado.</p>;

  // Função que gera array de datas de hoje até o prazo
  const getDiasAtePrazo = (prazo) => {
    if (!prazo) return [];
    const hoje = new Date();
    const fim = new Date(prazo);
    const dias = [];
    let d = new Date(hoje);
    d.setHours(0,0,0,0);
    fim.setHours(0,0,0,0);

    while (d <= fim) {
      dias.push(d.toISOString().split("T")[0]);
      d.setDate(d.getDate() + 1);
    }
    return dias;
  };

  return (
    <div className={styles.mainContent}>
      <Layout>
        <div className={styles.page}>
          <div className={styles.conteudoPrincipal}>
            <div className={styles.colunaEsquerda}>
              <div className={styles.infos}>
                <h3>Informações</h3>
                <div className={styles.card}>
                  <h2>{chamado.titulo}</h2>
                  <p>{usuarioNome}</p>
                  <p>{chamado.descricao}</p>
                  {isChamadoPendente && <button onClick={() => setMostrarCalendario(true)}>Aceitar</button>}
                  {isChamadoAssumido && (
                    <div className={styles.botao}>
                      <button
                        className={styles.concluido}
                        onClick={() => setShowConfirmarModal(true)}
                        disabled={isFinalizando}
                      >
                        {isFinalizando ? "Finalizando..." : "Finalizar"}
                      </button>
                    </div>
                  )}
                </div>

                {(isChamadoAssumido || chamado.apontamentos?.length > 0) && (
                  <div className={styles.tituloLinhaTempo}>
                    <p>Acompanhe a resolução do problema</p>
                    <i
                      className="bi bi-plus-circle"
                      style={{ cursor: "pointer", marginBottom: "8px" }}
                      onClick={() => setMostrarForm(!mostrarForm)}
                    />
                  </div>
                )}

                {mostrarForm && (
                  <div className={styles.formTimeline}>
                    <label>Apontamento</label>
                    <textarea
                      value={apontamentoTexto}
                      onChange={e => setApontamentoTexto(e.target.value)}
                      placeholder="Descreva brevemente o apontamento"
                      rows={3}
                      className={styles.labelApontamento}
                    />
                    <button
                      className={styles.btnEnviar}
                      onClick={handleCriarApontamento}
                      disabled={isEnviandoApontamento}
                    >
                      {isEnviandoApontamento ? "Enviando..." : "Enviar"}
                    </button>
                  </div>
                )}

                {/* Apontamentos */}
                {["tecnico", "usuario"].map(tipo => {
                  const filtered = chamado.apontamentos?.filter(a => a.tipo === tipo);
                  if (!filtered?.length) return null;
                  return (
                    <div key={tipo}>
                      <h4 style={{ marginTop: "20px" }}>{tipo === "tecnico" ? "Apontamentos do Técnico" : "Apontamentos do Usuário"}</h4>
                      <div className={styles.linhaTempo}>
                        <div className={styles.infosLinhaTempo}>
                          {filtered.map((apont, idx) => (
                            <div key={apont.id ?? `${tipo}-${idx}`} className={styles.informacoesLinhaTempo}>
                              <span className={styles.ponto}></span>
                              <div>
                                <h4>{apont.apontamento}</h4>
                                <p className={styles.dataLinhaTempo}>
                                  {new Date(apont.criado_em).toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {mostrarCalendario && (
              <div className={styles.colunaDireita}>
                <h3>Estipular Prazo</h3>
                <CalendarPage
                  onDateSelect={setPrazoSelecionado}
                  markedDates={getDiasAtePrazo(prazoSelecionado)}
                />
                {prazoSelecionado && isChamadoPendente && (
                  <button onClick={handleAssumirChamado}>Confirmar</button>
                )}
              </div>
            )}
          </div>

          {/* Modais */}
          {showConfirmarModal && (
            <div className="modal show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirmar Finalização</h5>
                    <button type="button" className="btn-close" onClick={() => setShowConfirmarModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <p>Deseja realmente finalizar o chamado?</p>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setShowConfirmarModal(false)} disabled={isFinalizando}>Cancelar</button>
                    <button className="btn btn-danger" onClick={() => { setShowConfirmarModal(false); setShowSolucaoModal(true); }} disabled={isFinalizando}>Confirmar</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showSolucaoModal && (
            <div className="modal show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Descreva a Solução</h5>
                    <button type="button" className="btn-close" onClick={() => setShowSolucaoModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <textarea
                      rows={5}
                      className="form-control"
                      value={solucaoTexto}
                      onChange={e => setSolucaoTexto(e.target.value)}
                      placeholder="Descreva a solução implementada"
                    />
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setShowSolucaoModal(false)} disabled={isFinalizando}>Cancelar</button>
                    <button className="btn btn-danger" onClick={handleEnviarSolucao} disabled={isFinalizando}>{isFinalizando ? "Finalizando..." : "Finalizar Chamado"}</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </div>
  );
}