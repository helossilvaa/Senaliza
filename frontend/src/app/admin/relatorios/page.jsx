"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import  { jwtDecode } from "jwt-decode";
import LayoutAdmin from "@/components/LayoutAdmin/page";
import { Bar } from "react-chartjs-2";
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
  const [selectedChamado, setSelectedChamado] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:8080";
  const router = useRouter();

  // Linha da aba ativa
  useEffect(() => {
    const current = refs[activeTab]?.current;
    if (current) {
      setLineStyle({
        width: current.offsetWidth + "px",
        left: current.offsetLeft + "px",
      });
    }
  }, [activeTab]);

  // Fetch de dados
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

        // Chamados concluídos
        const resChamados = await fetch(`${API_URL}/chamados/historico`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resChamados.ok) setChamadosConcluidos(await resChamados.json());

        // Técnicos
        const resTecnicos = await fetch(`${API_URL}/relatorios/tecnicos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resTecnicos.ok) setTecnicos(await resTecnicos.json());

        // Equipamentos
        const resEquip = await fetch(`${API_URL}/relatorios/equipamentos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resEquip.ok) {
          const data = await resEquip.json();
          setEquipamentos(data.relatorio);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [router]);

  // Gerar PDF de chamado
  const handleGerarPdf = async () => {
    if (!selectedChamado) return alert("Selecione um chamado");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/relatorios/pdf/${selectedChamado}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao gerar PDF");
      const data = await res.json();
      window.open(`${API_URL}/relatorios/pdfs/${data.arquivo}`, "_blank");
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar PDF");
    } finally {
      setLoading(false);
    }
  };

  // Dados para gráficos
  const dataTecnicos = {
    labels: tecnicos.map(t => t.nome),
    datasets: [
      {
        label: "Chamados Resolvidos",
        data: tecnicos.map(t => t.totalChamadosResolvidos || 0),
        backgroundColor: "rgba(54, 162, 235, 0.6)"
      }
    ]
  };

  const dataEquipamentos = {
    labels: equipamentos.map(e => e.nome || e.patrimonio),
    datasets: [
      {
        label: "Total de Chamados",
        data: equipamentos.map(e => e.totalChamados || 0),
        backgroundColor: "rgba(255, 99, 132, 0.6)"
      }
    ]
  };

  return (
    <LayoutAdmin>
      <div className={styles.page}>
        <div className="container-fluid p-4">
          <h1>Relatórios</h1>

          {/* Abas */}
          <div className={styles.tabs}>
            {["chamados", "tecnicos", "equipamentos"].map(tab => (
              <div
                key={tab}
                ref={refs[tab]}
                className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
            <div className={styles.activeLine} style={lineStyle}></div>
          </div>

          <div className={styles.tabContent}>
            {/* Chamados */}
            {activeTab === "chamados" && (
              <div>
                <h3>Chamados Concluídos</h3>
                <select value={selectedChamado} onChange={e => setSelectedChamado(e.target.value)}>
                  <option value="">Selecione um chamado</option>
                  {chamadosConcluidos.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.id} - {c.titulo}
                    </option>
                  ))}
                </select>
                <button onClick={handleGerarPdf} disabled={loading}>
                  {loading ? "Gerando..." : "Gerar PDF"}
                </button>
              </div>
            )}

            {/* Técnicos */}
            {activeTab === "tecnicos" && (
              <div>
                <h3>Gráfico de Técnicos</h3>
                <Bar data={dataTecnicos} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
              </div>
            )}

            {/* Equipamentos */}
            {activeTab === "equipamentos" && (
              <div>
                <h3>Gráfico de Equipamentos</h3>
                <Bar data={dataEquipamentos} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutAdmin>
  );
}
