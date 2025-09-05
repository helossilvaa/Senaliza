"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import LayoutAdmin from "@/components/LayoutAdmin/page";
import { Bar } from "react-chartjs-2";
import Relatorios from "@/components/Relatorios/page";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function RelatoriosPage() {
  const [activeTab, setActiveTab] = useState("chamados");
  const [lineStyle, setLineStyle] = useState({});
  const refs = { chamados: useRef(null), tecnicos: useRef(null), equipamentos: useRef(null) };

  const [chamadosConcluidos, setChamadosConcluidos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [equipamentosPorSala, setEquipamentosPorSala] = useState({});
  const [selectedChamado, setSelectedChamado] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfsGerados, setPdfsGerados] = useState([]);

  const API_URL = "http://localhost:8080";
  
  const router = useRouter();

  // Atualiza a linha ativa das abas
  useEffect(() => {
    const current = refs[activeTab]?.current;
    if (current) setLineStyle({ width: current.offsetWidth + "px", left: current.offsetLeft + "px" });
  }, [activeTab]);

  // Buscar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return router.push("/login");

        const decoded = jwtDecode(token);
        if (decoded.exp < Date.now() / 1000) {
          localStorage.removeItem("token");
          alert("Login expirou");
          return router.push("/login");
        }

        // Requisições simultâneas
        const [resChamados, resTecnicos, resEquip, resPdfs] = await Promise.all([
          fetch(`${API_URL}/chamados/historico`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/relatorios/tecnicos`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/relatorios/equipamentos`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/relatorios/pdfs`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (resChamados.ok) setChamadosConcluidos(await resChamados.json());
        if (resTecnicos.ok) setTecnicos(await resTecnicos.json());
        if (resEquip.ok) {
          const data = await resEquip.json();
          setEquipamentos(data.relatorio || []);
          setEquipamentosPorSala(data.porSala || {});
        }
        if (resPdfs.ok) setPdfsGerados(await resPdfs.json());

      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [router]);

  // Gerar PDF de um chamado selecionado
  const handleGerarPdf = async () => {
    if (!selectedChamado) return alert("Selecione um chamado");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/relatorios/pdf/${selectedChamado}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Erro ao gerar PDF");
      const data = await res.json();
      window.open(`${API_URL}/relatorios/pdfs/${data.arquivo}`, "_blank");

      // Atualiza lista de PDFs gerados
      setPdfsGerados(prev => [...prev, data]);
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar PDF");
    } finally {
      setLoading(false);
    }
  };

  // Dados para gráfico de técnicos
  const dataTecnicos = {
    labels: tecnicos.map(t => t.nome),
    datasets: [
      {
        label: "Chamados Resolvidos",
        data: tecnicos.map(t => t.totalChamadosResolvidos || 0),
        backgroundColor: "rgba(119, 0, 0, 0.6)"
      }
    ]
  };

  return (
    <LayoutAdmin>
      <div className={styles.page}>
        <div className="container-fluid p-4">
          <h1>Relatórios</h1>

          <div className={styles.tabs}>
            {["chamados", "tecnicos", "equipamentos"].map(tab => (
              <div key={tab} ref={refs[tab]} className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`} onClick={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
            <div className={styles.activeLine} style={lineStyle}></div>
          </div>

          <div className={styles.tabContent}>
            {/* Aba Chamados */}
            {activeTab === "chamados" && (
              <div>
                <select className={styles.chamadoSelect} value={selectedChamado} onChange={e => setSelectedChamado(e.target.value)}>
                  <option value="">Selecione um chamado</option>
                  {chamadosConcluidos.map(c => <option key={c.id} value={c.id}>{c.id} - {c.titulo}</option>)}
                </select>
                <button onClick={handleGerarPdf} disabled={loading}>{loading ? "Gerando..." : "Gerar PDF"}</button>

                <h4 className="mt-4">Relatórios que já foram gerados</h4>
                <div className={styles.relatoriosList}>
                  {pdfsGerados.length > 0 ? (
                    pdfsGerados.map(r => <Relatorios key={r.id} relatorio={r} />)
                  ) : (
                    <p>Nenhum relatório gerado ainda.</p>
                  )}
                </div>
              </div>
            )}

            {/* Aba Técnicos */}
            {activeTab === "tecnicos" && (
              <div>
                {tecnicos.length > 0 ? (
                  <Bar
                    data={dataTecnicos}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'Chamados Resolvidos por Técnico' }
                      }
                    }}
                  />
                ) : <p>Nenhum técnico registrado.</p>}
              </div>
            )}

            {/* Aba Equipamentos */}
            {activeTab === "equipamentos" && (
              <div>
                {equipamentos.length > 0 ? (
                  <div style={{ height: "400px" }}>
                    <Bar
                      data={{
                        labels: equipamentos
                          .sort((a, b) => b.totalChamados - a.totalChamados)
                          .slice(0, 5)
                          .map(eq => eq.nome || eq.patrimonio || "Sem nome"),
                        datasets: [{
                          label: "Chamados",
                          data: equipamentos
                            .sort((a, b) => b.totalChamados - a.totalChamados)
                            .slice(0, 5)
                            .map(eq => eq.totalChamados || 0),
                          backgroundColor: "rgba(181, 0, 39, 0.6)"
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: "y",
                        plugins: {
                          legend: { position: "top" },
                          title: { display: true, text: "Top 5 Equipamentos que Mais Quebram (Geral)" }
                        },
                        scales: {
                          x: { beginAtZero: true },
                          y: { ticks: { autoSkip: false } }
                        },
                        elements: { bar: { barThickness: 30, maxBarThickness: 50 } }
                      }}
                    />
                  </div>
                ) : <p>Nenhum equipamento registrado.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutAdmin>
  );
}
