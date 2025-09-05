"use client";
import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import CalendarPage from "@/components/Calendario/page";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Layout from '@/components/LayoutTecnico/page';
import { v4 as uuidv4 } from "uuid";

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
    if (!token) { router.push("/login"); return; }

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
            headers: { Authorization: `Bearer ${token}` }
          });
          data.apontamentos = apontRes.ok ? await apontRes.json() : [];
        }

        setChamado(data);

        if (data.status === "em andamento" && data.tecnico_id === decoded.id) {
          setMostrarCalendario(true);
          setPrazoSelecionado(data.prazo || null);
        }

      } catch (err) {
        console.error(err);
        alert("Erro ao carregar chamado.");
      } finally { setLoading(false); }
    };

    fetchChamado();
  }, [id, router]);

  useEffect(() => {
    if (chamado?.usuario_id) {
      const token = localStorage.getItem("token");
      fetch(`${API_URL}/usuarios/${chamado.usuario_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject("Erro ao buscar usuário"))
        .then(data => setUsuarioNome(data.nome))
        .catch(console.error);
    }
  }, [chamado]);

  const handleAssumirChamado = async () => {
    if (!prazoSelecionado) { alert("Selecione um prazo."); return; }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/chamados/assumir/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prazo: prazoSelecionado }),
      });
      if (!res.ok) throw new Error("Erro ao assumir chamado");
      alert("Chamado assumido!");
      setMostrarCalendario(true);
      setChamado(prev => ({ ...prev, status: "em andamento", tecnico_id: usuarioLogado.id }));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleCriarApontamento = async () => {
    if (!apontamentoTexto.trim()) { alert("Preencha o apontamento."); return; }

    setIsEnviandoApontamento(true);
    const token = localStorage.getItem("token");

    const tempApontamento = {
      id: uuidv4(),
      apontamento: apontamentoTexto,
      criado_em: new Date().toISOString()
    };

    setChamado(prev => ({
      ...prev,
      apontamentos: [...(prev.apontamentos || []), tempApontamento]
    }));

    setApontamentoTexto("");

    try {
      const res = await fetch(`${API_URL}/chamados/${id}/apontamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ apontamento: tempApontamento.apontamento }),
      });
      if (!res.ok) throw new Error("Erro ao criar apontamento");
      const novoApontamento = await res.json();

      setChamado(prev => ({
        ...prev,
        apontamentos: prev.apontamentos.map(apont =>
          apont.id === tempApontamento.id ? novoApontamento : apont
        )
      }));
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsEnviandoApontamento(false);
    }
  };

  const handleEnviarSolucao = async () => {
    if (solucaoTexto.trim() === "") {
      alert("Por favor, descreva a solução.");
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
  

  if (loading) return <p>Carregando...</p>;
  if (!chamado) return <p>Chamado não encontrado.</p>;

  const isChamadoPendente = chamado.status === 'pendente';
  const isChamadoAssumido = chamado.status === 'em andamento' && chamado.tecnico_id === usuarioLogado.id;

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.conteudoPrincipal}>

          {/* COLUNA ESQUERDA */}
          <div className={styles.colunaEsquerda}>
            <div className={styles.infos}>
              <h3>Informações</h3>
              <div className={styles.card}>
                <h2>{chamado.titulo}</h2>
                <p>{usuarioNome}</p>
                <p>{chamado.descricao}</p>
                {isChamadoPendente && (
                  <button onClick={() => setMostrarCalendario(true)}>Aceitar</button>
                )}

                {/* BOTÃO FINALIZAR */}
                {isChamadoAssumido && (
                  <button
                  className={styles.concluido}
                  onClick={() => setShowConfirmarModal(true)}
                  disabled={isFinalizando}
                >
                  {isFinalizando ? "Finalizando..." : "Finalizar"}
                </button>
                
                )}
              </div>

              {/* TÍTULO + ÍCONE PARA ABRIR FORM */}
              {(isChamadoAssumido || chamado.apontamentos?.length) && (
                <div className={styles.tituloLinhaTempo}>
                  <p>Acompanhe a resolução do problema</p>
                  <i
                    className="bi bi-plus-circle"
                    style={{ cursor: 'pointer', marginBottom: '8px' }}
                    onClick={() => setMostrarForm(!mostrarForm)}
                  />
                </div>
              )}

              {/* FORMULARIO DE APONTAMENTO */}
              {mostrarForm && (
                <div className={styles.formTimeline}>
                  <label>Apontamento</label>
                  <textarea
                    value={apontamentoTexto}
                    onChange={(e) => setApontamentoTexto(e.target.value)}
                    placeholder="Descreva brevemente o apontamento"
                    rows={3}
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

              {/* TIMELINE DOS APONTAMENTOS */}
              {(chamado.apontamentos?.length) && (
                <div className={styles.linhaTempo}>
                  <div className={styles.infosLinhaTempo}>
                    {chamado.apontamentos.map((apontamento, idx) => (
                      <div
                        key={apontamento.id || `temp-${idx}-${Date.now()}`}
                        className={styles.informacoesLinhaTempo}
                      >
                        <span className={styles.ponto}></span>
                        <div>
                          <h4>{apontamento.apontamento}</h4>
                          <p className={styles.dataLinhaTempo}>
                            {new Date(apontamento.criado_em).toLocaleDateString('pt-BR', {
                              day: 'numeric',
                              month: 'long'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* COLUNA DIREITA */}
          {mostrarCalendario && (
            <div className={styles.colunaDireita}>
              <h3>Estipular Prazo</h3>
              <CalendarPage onDateSelect={setPrazoSelecionado} markedDate={prazoSelecionado} />
              {prazoSelecionado && isChamadoPendente && (
                <button onClick={handleAssumirChamado}>Confirmar</button>
              )}
            </div>
          )}

        </div>

        {/* MODAL 1 - Confirmar Finalização */}
<div
  className={`modal fade ${showConfirmarModal ? "show" : ""}`}
  style={{ display: showConfirmarModal ? "block" : "none" }}
>
  <div className="modal-dialog modal-dialog-centered">
    <div className="modal-content">
      <div className="modal-header">
        <h1 className="modal-title fs-5">Confirmar Finalização</h1>
        <button
          type="button"
          className="btn-close"
          onClick={() => setShowConfirmarModal(false)}
        ></button>
      </div>
      <div className="modal-body">
        Tem certeza que deseja finalizar este chamado?
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setShowConfirmarModal(false)}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setShowConfirmarModal(false);
            setShowSolucaoModal(true);
          }}
        >
          Continuar
        </button>
      </div>
    </div>
  </div>
</div>
{showConfirmarModal && <div className="modal-backdrop fade show"></div>}

{/* MODAL 2 - Descrever Solução */}
<div
  className={`modal fade ${showSolucaoModal ? "show" : ""}`}
  style={{ display: showSolucaoModal ? "block" : "none" }}
>
  <div className="modal-dialog modal-dialog-centered">
    <div className="modal-content">
      <div className="modal-header">
        <h1 className="modal-title fs-5">Descrever Solução</h1>
        <button
          type="button"
          className="btn-close"
          onClick={() => setShowSolucaoModal(false)}
        ></button>
      </div>
      <div className="modal-body">
        <textarea
          className="form-control"
          value={solucaoTexto}
          onChange={(e) => setSolucaoTexto(e.target.value)}
          placeholder="Ex: O problema foi resolvido com a substituição do teclado..."
          rows="5"
        ></textarea>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setShowSolucaoModal(false);
            setShowConfirmarModal(true);
          }}
          disabled={isFinalizando}
        >
          Voltar
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleEnviarSolucao}
          disabled={isFinalizando}
        >
          {isFinalizando ? "Finalizando..." : "Confirmar"}
        </button>
      </div>
    </div>
  </div>
</div>
{showSolucaoModal && <div className="modal-backdrop fade show"></div>}

      </div>
    </Layout>
  );
}
