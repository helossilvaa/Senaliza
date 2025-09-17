"use client";

import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

import styles from "@/app/admin/Dashboard/page.module.css";
import LayoutAdmin from "@/components/LayoutAdmin/layout";
import Relatorios from "@/components/Relatorios/page";
import CategoriasChamados from "@/components/Grafico/page";
import Loading from "@/app/loading";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


export default function DashboardAdmin() {
    const [nomeUsuario, setNomeUsuario] = useState("");
    const [chamados, setChamados] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [relatoriosRecentes, setRelatoriosRecentes] = useState([]);
    const [loading, setLoading] = useState(true);
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
            toast.warning("Seu login expirou.");
            setTimeout(() => router.push("/login"), 3000);
            return;
        }

        setNomeUsuario(decoded.nome || "Usuário não encontrado");

        const config = { headers: { Authorization: `Bearer ${token}` } };

        const fetchDadosDashboard = async () => {
            try {
                const [resChamados, resCategorias, resRanking, resRelatorios] = await Promise.all([
                    fetch(`${API_URL}/chamados/todos`, config),
                    fetch(`${API_URL}/chamados/categorias`, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }),
                    fetch(`${API_URL}/chamados/ranking-tecnicos`, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }),
                    fetch(`${API_URL}/relatorios/recentes?limite=5`, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }),
                ]);


                if (!resChamados.ok) throw new Error("Erro ao buscar chamados");
                const dataChamados = await resChamados.json();
                setChamados(dataChamados);


                const dataCategorias = resCategorias.ok ? await resCategorias.json() : [];
                setCategorias(Array.isArray(dataCategorias) ? dataCategorias : []);


                if (resRanking.ok) {
                    const dados = await resRanking.json();
                    if (Array.isArray(dados) && dados.length > 0) {
                        const total = dados.reduce((acc, item) => acc + item.chamadosConcluidos, 0);
                        const dadosComPorcentagem = dados.map(item => ({
                            ...item,
                            porcentagem: (item.chamadosConcluidos / total) * 100,
                        }));
                        setTecnicos(dadosComPorcentagem);
                    } else setTecnicos([]);
                } else setTecnicos([]);


                if (resRelatorios.ok) {
                    const dataRelatorios = await resRelatorios.json();
                    setRelatoriosRecentes(Array.isArray(dataRelatorios) ? dataRelatorios : []);
                } else setRelatoriosRecentes([]);
            } catch (err) {
                console.error("Erro ao buscar dados do dashboard:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDadosDashboard();
    }, [router]);

    const totalChamados = chamados.length;
    const statusCounts = {
        "em andamento": chamados.filter(c => c.status?.toLowerCase().includes("andamento")).length,
        pendente: chamados.filter(c => c.status?.toLowerCase().includes("pendente")).length,
        "concluído": chamados.filter(c => c.status?.toLowerCase().includes("concluído")).length,
    };

    if (loading) return <Loading />;

    return (
        <LayoutAdmin>
            <ToastContainer position="top-right" autoClose={3000} pauseOnHover={false} theme="light" />
            <div className={styles.page}>
                <div className={styles.dashboardContainer}>
                    <h2 className={styles.welcome}>Olá, {nomeUsuario}!</h2>
                    <div className={styles.cardsContainer}>

                        <div className={styles.cardStatusChamados}>
                            <h3>Status de todos os chamados da rede:</h3>
                            <p className={styles.numeroChamados}>{totalChamados}</p>
                            <div className={styles.barraProgresso}>
                                {totalChamados > 0 && statusCounts["pendente"] > 0 && (
                                    <div className={styles.progressoPendente} style={{ width: `${(statusCounts["pendente"] / totalChamados) * 100}%` }} />
                                )}
                                {totalChamados > 0 && statusCounts["em andamento"] > 0 && (
                                    <div className={styles.progressoEmAndamento} style={{ width: `${(statusCounts["em andamento"] / totalChamados) * 100}%` }} />
                                )}
                                {totalChamados > 0 && statusCounts["concluído"] > 0 && (
                                    <div className={styles.progressoConcluido} style={{ width: `${(statusCounts["concluído"] / totalChamados) * 100}%` }} />
                                )}
                            </div>
                            <ul className={styles.legenda}>
                                <li><span className={styles.bolinhaAberto}></span>Pendente ({statusCounts["pendente"]})</li>
                                <li><span className={styles.bolinhaAndamento}></span>Em andamento ({statusCounts["em andamento"]})</li>
                                <li><span className={styles.bolinhaFinalizado}></span>Concluído ({statusCounts["concluído"]})</li>
                            </ul>
                        </div>


                        <div className={styles.cardRelatorios}>
                            <h3>Relatórios recentes</h3>
                            {relatoriosRecentes.length > 0 ? (
                                <>
                                    {relatoriosRecentes.slice(0, 3).map((relatorio, index) => (
                                        <Relatorios key={index} relatorio={relatorio} />
                                    ))}
                                    {relatoriosRecentes.length > 3 && (
                                        <div className={styles.verTodosRelatorios} onClick={() => router.push("/admin/relatorios")}> Ver todos os relatórios </div>
                                    )}
                                </>
                            ) : (
                                <p>Nenhum relatório recente encontrado.</p>
                            )}
                        </div>



                        <div className={styles.cardLarge}>
                            <div className={styles.graficoTecnicos}>
                                <h4>Técnicos que mais resolvem chamados</h4>
                                {tecnicos.length > 0 ? (
                                    tecnicos.map((tecnico, index) => (
                                        <div key={index} className={styles.tecnicoBar}>
                                            <span className={styles.nomeTecnico}>{tecnico.nomeTecnico}</span>
                                            <div className={styles.preenchimento} style={{ width: `${tecnico.porcentagem}%` }}>
                                                {tecnico.porcentagem.toFixed(2)}%
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>Nenhum chamado concluído por técnico ainda.</p>
                                )}
                            </div>

                            <div className={styles.estatistica}>
                                <h4>Categorias mais recorrentes de chamados</h4>
                                <div className={styles.graficoObjetos}>
                                    <CategoriasChamados data={categorias} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LayoutAdmin>
    );
}
