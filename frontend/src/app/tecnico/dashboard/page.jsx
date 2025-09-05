"use client";

import styles from '@/app/tecnico/Dashboard/page.module.css';
import TarefasPage from '@/components/ListaTarefa/listaTarefa'
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import Layout from '@/components/LayoutTecnico/page'; 

export default function DashboardTecnico() {
  const [chamados, setChamados] = useState([]);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [tecnicoId, setTecnicoId] = useState(null);
  const [notificacoes, setNotificacoes] = useState([]);
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
          alert("Seu login expirou.");
          router.push("/login");
          return;
        }

        setNomeUsuario(decoded.nome || 'Usuário não encontrado');
        setTecnicoId(decoded.id); // <<--- armazena o id do técnico logado

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Chamados do técnico
        const resTecnico = await fetch(`${API_URL}/chamados/chamadostecnico`, config);
        const chamadosDoTecnico = resTecnico.ok ? await resTecnico.json() : [];

        // 2. Chamados pendentes (gerais)
        const resPendentes = await fetch(`${API_URL}/chamados/pendentes`, config);
        const chamadosPendentesGerais = resPendentes.ok ? await resPendentes.json() : [];

        // Junta tudo
        setChamados([...chamadosDoTecnico, ...chamadosPendentesGerais]);

        // Notificações
        const resNotificacoes = await fetch(`${API_URL}/notificacoes`, config);
        if (!resNotificacoes.ok) {
          setNotificacoes([]);
          return;
        }
        let dadosNotificacoes = await resNotificacoes.json();
        let notificArray = Array.isArray(dadosNotificacoes)
          ? dadosNotificacoes
          : (dadosNotificacoes.notificacoes || dadosNotificacoes.data || dadosNotificacoes.result || []);
        const novas = notificArray.filter(n => n && Number(n.visualizado) === 0);
        setNotificacoes(novas);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      }
    };

    fetchDados();
  }, [router]);

  // Chamados recentes (pendentes)
  const chamadosRecentes = chamados
    .filter(c => normalizar(c.status) === "pendente")
    .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
    .slice(0, 3);

  // Chamados só do técnico logado
  const chamadosDoTecnico = tecnicoId
    ? chamados.filter(c => c.tecnico_id === tecnicoId)
    : [];

  const totalChamados = chamadosDoTecnico.length;

  const statusCounts = {
    "em andamento": chamadosDoTecnico.filter(c => normalizar(c.status) === "em andamento").length,
    "concluído": chamadosDoTecnico.filter(c =>
      ["concluído", "concluido"].includes(normalizar(c.status))
    ).length,
  };

  const aceitarChamado = async (idChamado) => {
    const token = localStorage.getItem("token");
    const config = {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    };
    try {
      const res = await fetch(`${API_URL}/chamados/assumir/${idChamado}`, config);
      if (!res.ok) throw new Error("Erro ao assumir chamado");

      setChamados(prev =>
        prev.map(c =>
          c.id === idChamado ? { ...c, status: "em andamento", tecnico_id: tecnicoId } : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
  <Layout>
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
            </ul>
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
                  <div>
                    <button className={styles.btnVerMais}>Ver mais</button>
                    <button
                      className={styles.btnAceitar}
                      onClick={() => aceitarChamado(c.id)}
                    >
                      Aceitar
                    </button>
                  </div>
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
    </Layout>
  );
}



       

