"use client";
 
import styles from './page.module.css';
import TarefasPage from '@/components/ListaTarefa/listaTarefa';
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import LayoutUser from '@/components/LayoutUser/layout';
import Loading from "@/app/loading";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
 
export default function DashboardUsuario() {
  const [chamados, setChamados] = useState([]);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [usuarioId, setUsuarioId] = useState(null);
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const API_URL = "http://localhost:8080";
 
  const normalizar = (s) =>
    s?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
 
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
 
    const fetchDados = async () => {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp < Date.now() / 1000) {
          localStorage.removeItem("token");
          toast.error("Seu login expirou. Faça login novamente.");
 
          setTimeout(() => {
            router.push("/login");
          }, 3000);
          return;
        }
 
        setNomeUsuario(decoded.nome || 'Usuário não encontrado');
        setUsuarioId(decoded.id);
 
        const config = { headers: { Authorization: `Bearer ${token}` } };
 
 
        const resUser = await fetch(`${API_URL}/chamados`, config);
        const chamadosDoUsuario = resUser.ok ? await resUser.json() : [];
 
        // 2. Chamados pendentes (gerais)
        const resPendentes = await fetch(`${API_URL}/chamados/pendentes`, config);
        const chamadosPendentesGerais = resPendentes.ok ? await resPendentes.json() : [];
 
        // Junta tudo
        setChamados([...chamadosDoUsuario, ...chamadosPendentesGerais]);
 
        // Notificações
        const resNotificacoes = await fetch(`${API_URL}/notificacoes`, config);
        if (!resNotificacoes.ok) {
          setNotificacoes([]);
        } else {
          let dadosNotificacoes = await resNotificacoes.json();
          let notificArray = Array.isArray(dadosNotificacoes)
            ? dadosNotificacoes
            : (dadosNotificacoes.notificacoes || dadosNotificacoes.data || dadosNotificacoes.result || []);
          const novas = notificArray.filter(n => n && Number(n.visualizado) === 0);
          setNotificacoes(novas);
        }
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false); // encerra o loading
      }
    };
 
    fetchDados();
  }, [router]);
 
  // Chamados recentes (pendentes)
  const chamadosRecentes = chamados
    .filter(c => normalizar(c.status) === "pendente")
    .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
    .slice(0, 3);
 
  const chamadosDoUsuario = usuarioId
    ? chamados.filter(c => c.tecnico_id === usuarioId)
    : [];
 
  const totalChamados = chamadosDoUsuario.length;
 
  const statusCounts = {
    "em andamento": chamadosDoUsuario.filter(c => normalizar(c.status) === "em andamento").length,
    "concluído": chamadosDoUsuario.filter(c =>
       ["concluído", "concluido"].includes(normalizar(c.status))
     ).length,
   };
 
 
 
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Loading />
      </div>
    );
  }
 
  return (
    <LayoutUser>
 
      <div className={styles.page}>
        <div className={styles.dashboardContainer}>
          <h2 className={styles.welcome}>Olá, {nomeUsuario}!</h2>
          <div className={styles.cardsContainer}>
            <div className={styles.cardStatusChamados}>
              <h3>Status dos seus chamados:</h3>
              <p className={styles.numeroChamados}>{totalChamados}</p>
              <div className={styles.barraProgresso}>
                {totalChamados > 0 && statusCounts["em andamento"] > 0 && (
                  <div
                    className={styles.progressoEmAndamento}
                    style={{
                      width: `${(statusCounts["em andamento"] / totalChamados) * 100}%`,
                    }}
                  />)}
                {totalChamados > 0 && statusCounts["concluido"] > 0 && (
                  <div
                    className={styles.progressoFinalizado}
                    style={{
                      width: `${(statusCounts["concluido"] / totalChamados) * 100}%`,
                    }}
                  />)}
              </div>
              <ul className={styles.legenda}>
                <li>
                  <span className={styles.bolinhaAndamento}></span>
                  Em andamento ({statusCounts["em andamento"]})
                </li>
                <li>
                  <span className={styles.bolinhaFinalizado}></span>
                  Concluído ({statusCounts["concluido"]})
                </li>
              </ul>
              {/* <div className={styles.barraProgresso}>
                {totalChamados > 0 && statusCounts["em andamento"] > 0 && (
                  <div
                    className={styles.progressoEmAndamento}
                    style={{ width: `${(statusCounts["em andamento"] / totalChamados) * 100}%` }}
                  />
                )}
                {totalChamados > 0 && statusCounts["concluído"] > 0 && (
                  <div
                    className={styles.progressoFinalizado}
                    style={{ width: `${(statusCounts["concluído"] / totalChamados) * 100}%` }}
                  />
                )}
              </div>
              <ul className={styles.legenda}>
                <li><span className={styles.bolinhaAndamento}></span> Em andamento ({statusCounts["em andamento"]})</li>
                <li><span className={styles.bolinhaFinalizado}></span> Concluído ({statusCounts["concluído"]})</li>
              </ul> */}
            </div>
            <div className={styles.cardNotificacoes}>
              <h3>Você tem</h3>
              <p className={styles.numeroNotificacoes}>{notificacoes.length}</p>
              <p className={styles.textoNotificacoes}>notificações novas</p>
            </div>
            <div className={styles.cardLarge}>
              <h3>Chamados pendentes mais recentes</h3>
              {chamadosRecentes.length === 0 ? (
                <p>Nenhum chamado pendente disponível</p>
              ) : (
                chamadosRecentes.map(c => (
                  <div key={c.id} className={styles.chamadoItem}>
                    <div>
                      <h4>{c.titulo}</h4>
                      <p>{`Sala ${c.sala_id}`}</p>
                    </div>
                    <button className={styles.btnVerMais}
                      onClick={() => router.push(`chamados/${c.id}`)}
                    >
                      Ver mais
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className={styles.cardSmallBottom}>
              <TarefasPage />
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} pauseOnHover={false} theme="light" />
    </LayoutUser>
  );
}