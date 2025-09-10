"use client";
 
import { useEffect, useState } from "react";
// O HeaderAdmin não é mais necessário aqui, pois será renderizado pelo layout
import CardAdmin from "@/components/CardAdmin/page";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import LayoutAdmin from "@/components/LayoutAdmin/layout"; // Importe o layout
 
export default function ChamadosAdmin() {
  const [activeTab, setActiveTab] = useState("chamados");
  const [chamados, setChamados] = useState([]);
  const [pools, setPools] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [selectedPool, setSelectedPool] = useState("");
  const [selectedTecnico, setSelectedTecnico] = useState("");
  const [loading, setLoading] = useState(true);
  const [salas, setSalas] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
 
 
 
  const router = useRouter();
  const API_URL = "http://localhost:8080";
 
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
     
 
    const fetchData = async () => {
      try {
        setLoading(true);
        const chamadosRes = await fetch(`${API_URL}/chamados/pendentes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
 
        const poolsRes = await fetch(`${API_URL}/pools`, {
          headers: { Authorization: `Bearer ${token}` },
        });
 
        const tecnicosRes = await fetch(`${API_URL}/usuarios/tecnicosPools`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const salasRes = await fetch(`${API_URL}/salas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
       
        const equipamentosRes = await fetch(`${API_URL}/equipamentos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
 
        if (!chamadosRes.ok || !poolsRes.ok || !tecnicosRes.ok) {
          throw new Error("Erro ao buscar dados.");
        }
 
        const chamadosData = await chamadosRes.json();
        const poolsData = await poolsRes.json();
        const tecnicosData = await tecnicosRes.json();
        const salasData = await salasRes.json();
        const equipamentosData = await equipamentosRes.json();
       
        setSalas(salasData);
        setEquipamentos(equipamentosData);
 
        setChamados(chamadosData);
        setPools(poolsData);
        setTecnicos(tecnicosData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
 
    fetchData();
  }, [router]);
 
  const atribuirChamado = async (chamadoId, tecnicoId) => {
    const token = localStorage.getItem("token");
 
    const tecnicoIdNumerico = parseInt(tecnicoId, 10);
    if (isNaN(tecnicoIdNumerico)) {
      alert("Erro: ID do técnico inválido.");
      return;
    }
 
    try {
      const res = await fetch(`${API_URL}/chamados/${chamadoId}/atribuir`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tecnicoId: tecnicoIdNumerico }),
      });
 
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.mensagem || "Erro desconhecido ao atribuir chamado.");
      }
 
      setChamados((prev) =>
        prev.map((c) =>
          c.id === chamadoId ? { ...c, tecnico_id: tecnicoIdNumerico, status: "em andamento" } : c
        )
      );
      alert("Chamado atribuído com sucesso!");
    } catch (err) {
      console.error(err);
      alert(`Falha ao atribuir chamado: ${err.message}`);
    }
  };
   const mudarStatusTecnico = async (id, novoStatus) => {
    const token = localStorage.getItem("token");
 
    try {
 
      setTecnicos((prev) =>
        prev.map((tec) => (tec.id === id ? { ...tec, status: novoStatus } : tec))
      );
     
     
      const res = await fetch(`${API_URL}/usuarios/tecnicos/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: novoStatus }),
      });
 
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.mensagem || "Erro desconhecido ao mudar status.");
      }
 
      alert(`Status do técnico alterado para "${novoStatus}" com sucesso!`);
    } catch (err) {
      console.error(err);
      alert(`Falha ao mudar o status: ${err.message}`);
    }
  };
 
 
  const chamadosFiltrados = selectedPool
    ? chamados.filter((chamado) => chamado.tipo_id === parseInt(selectedPool, 10))
    : chamados;
 
  if (loading) return <p>Carregando chamados...</p>;
 
  return (
 
    <LayoutAdmin>
      <div className={styles.page}>
        <div className="container-fluid p-4">
          <h1 className={styles.titulo}>Painel de Administração</h1>
 
         
          <div className={styles.tabs}>
            <button
              className={`${styles.tabButton} ${activeTab === "chamados" ? styles.active : ""}`}
              onClick={() => setActiveTab("chamados")}
            >
              Chamados Pendentes
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "tecnicos" ? styles.active : ""}`}
              onClick={() => setActiveTab("tecnicos")}
            >
              Técnicos
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "porTecnico" ? styles.active : ""}`}
              onClick={() => setActiveTab("porTecnico")}
            >
              Chamados por Técnico
            </button>
          </div>
 
         
          {activeTab === "chamados" && (
            <section className={styles.section}>
              <div className={styles.filterContainer}>
                <label htmlFor="pool-filter">Filtrar por Pool:</label>
                <select className="select"
                  id="pool-filter"
                  value={selectedPool}
                  onChange={(e) => setSelectedPool(e.target.value)}
                >
                  <option value="">Todos os Pools</option>
                  {pools.map((pool) => (
                    <option key={pool.id} value={pool.id}>
                      {pool.titulo}
                    </option>
                  ))}
                </select>
              </div>
 
              <div className={styles.cardList}>
                {chamadosFiltrados.length === 0 ? (
                  <p>Nenhum chamado encontrado.</p>
                ) : (
                  chamadosFiltrados.map((chamado) => {
                    const tecnicosDoPool = tecnicos.filter((tecnico) =>
                      tecnico.pools?.some((pool) => pool.id === chamado.tipo_id)
                    );
 
                    return (
                      <CardAdmin
                        key={chamado.id}
                        id={chamado.id}
                        titulo={chamado.titulo}
                        equipamentos={equipamentos}
                        salas = {salas}
                        data={chamado.criado_em}
                        tecnicos={tecnicosDoPool}
                        chamado={chamado}
                        pools={pools}
                        onAtribuir={atribuirChamado}
                      />
                    );
                  })
                )}
              </div>
            </section>
          )}
 
       
          {activeTab === "tecnicos" && (
            <section className={styles.section}>
              <div className={styles.cardsContainer}>
                {tecnicos.map((tec) => (
                  <div key={tec.id} className={styles.card}>
                    <div className={styles.cardContent}>
                      <h3>{tec.nome}</h3>
                      <p><strong>Email:</strong> {tec.email}</p>
                      <p><strong>Setor:</strong> {tec.setor || "Não informado"}</p>
                      <p>
                        <strong>Criado em:</strong>{" "}
                        {new Date(tec.criado_em).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <select
                      value={tec.status}
                      onChange={(e) => mudarStatusTecnico(tec.id, e.target.value)}
                      className={styles.botaoAtivo}
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>
                ))}
              </div>
            </section>
          )}
 
         
          {activeTab === "porTecnico" && (
            <section className={styles.section}>
              <h2>Chamados por Técnico</h2>
 
             
              <div className={styles.filterContainer}>
                <label htmlFor="tecnico-select">Selecione o Técnico:</label>
                <select
                  id="tecnico-select"
                  value={selectedTecnico}
                  onChange={(e) => setSelectedTecnico(e.target.value)}
                 
                >
                  <option value="">Selecione</option>
                  {tecnicos.map((tec) => (
                    <option key={tec.id} value={tec.id}>
                      {tec.nome}
                    </option>
                  ))}
                </select>
              </div>
 
              {selectedTecnico && (
                (() => {
                  const tecnico = tecnicos.find((t) => t.id === Number(selectedTecnico));
  if (!tecnico) return <p>Técnico não encontrado.</p>;
 
  const chamadosDoTecnico = chamados.filter(
    (c) => Number(c.tecnico_id) === Number(tecnico.id)
  );
  const emAndamento = chamadosDoTecnico.filter(
    (c) => c.status.toLowerCase() === "em andamento"
  );
 
                  return (
                    <div className={styles.tecnicoInfo}>
                      <h3>{tecnico.nome}</h3>
                      <p><strong>Total de Chamados:</strong> {chamadosDoTecnico.length}</p>
 
                      <h4>Chamados em Andamento</h4>
                      {emAndamento.length > 0 ? (
                        <div className={styles.cardList}>
                          {emAndamento.map((chamado) => (
                            <CardAdmin
                              key={chamado.id}
                              id={chamado.id}
                              titulo={chamado.titulo}
                              data={chamado.criado_em}
                              tecnicos={[]}
                              onAtribuir={atribuirChamado}
                            />
                          ))}
                        </div>
                      ) : (
                        <p>Nenhum chamado em andamento.</p>
                      )}
                    </div>
                  );
                })()
              )}
            </section>
          )}
        </div>
      </div>
    </LayoutAdmin>
  );
}