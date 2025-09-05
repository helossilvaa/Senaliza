"use client";

import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

import styles from "@/app/admin/Dashboard/page.module.css";
import HeaderAdmin from "@/components/HeaderAdmin/headerAdmin";
import Relatorios from "@/components/Relatorios/page";
import CategoriasChamados from "@/components/Grafico/page";

export default function DashboardAdmin() {
    const [nomeUsuario, setNomeUsuario] = useState("");
    const [chamados, setChamados] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [relatoriosRecentes, setRelatoriosRecentes] = useState([]);
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
            console.error("Seu login expirou.");
            router.push("/login");
            return;
        }

        setNomeUsuario(decoded.nome || "Usuário não encontrado");

        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };


        const fetchChamados = async () => {
            try {
                const res = await fetch(`${API_URL}/chamados/todos`, config);
                if (!res.ok) throw new Error("Erro ao buscar chamados");
                const data = await res.json();
                setChamados(data);
            } catch (err) {
                console.error("Erro ao buscar chamados:", err);
            }
        };

        const fetchCategorias = async () => {
            try {
                const res = await fetch(`${API_URL}/chamados/categorias`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                });

                console.log("Resposta ao buscar categorias — status:", res.status);

                if (!res.ok) {
                    const text = await res.text();
                    console.error("Erro ao buscar categorias — corpo da resposta:", text);
                    setCategorias([]);
                    return;
                }

                const dados = await res.json();
                console.log("Dados de categorias recebidos:", dados);

                if (Array.isArray(dados)) {
                    setCategorias(dados);
                } else {
                    setCategorias([]);
                }
            } catch (err) {
                console.error("Erro ao buscar categorias:", err);
                setCategorias([]);
            }
        };

        const fetchRankingTecnicos = async () => {
            try {
                const res = await fetch(`${API_URL}/chamados/ranking-tecnicos`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                });

                if (!res.ok) throw new Error("Erro ao buscar ranking de técnicos");
                const dados = await res.json();

                if (Array.isArray(dados) && dados.length > 0) {
                    const total = dados.reduce((acc, item) => acc + item.chamadosConcluidos, 0);
                    const dadosComPorcentagem = dados.map(item => ({
                        ...item,
                        porcentagem: (item.chamadosConcluidos / total) * 100,
                    }));
                    setTecnicos(dadosComPorcentagem);
                } else {
                    setTecnicos([]);
                }
            } catch (err) {
                console.error("Erro ao buscar ranking de técnicos:", err);
                setTecnicos([]);
            }
        };

        const fetchRelatoriosRecentes = async () => {
            const limite = 5;
            try {
                const res = await fetch(`${API_URL}/relatorios/recentes?limite=${limite}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (res.status === 403) {
                    console.warn('Acesso negado aos relatórios recentes (requer admin).');
                    setRelatoriosRecentes([]);
                    return;
                }

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`(${res.status}) ${text || 'Erro ao buscar relatórios recentes'}`);
                }

                const data = await res.json();
                console.log('Relatórios recebidos:', data);
                setRelatoriosRecentes(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Erro ao buscar relatórios recentes:', err);
                setRelatoriosRecentes([]);
            }
        };

        fetchChamados();
        fetchCategorias();
        fetchRankingTecnicos();
        fetchRelatoriosRecentes();
    }, [router]);

    const totalChamados = chamados.length;
    const statusCounts = {
        "em andamento": chamados.filter((c) =>
            c.status?.toLowerCase().includes("andamento")
        ).length,
        pendente: chamados.filter((c) =>
            c.status?.toLowerCase().includes("pendente")
        ).length,
        "concluído": chamados.filter((c) =>
            c.status?.toLowerCase().includes("concluído")
        ).length,
    };

    return (
        <div className={styles.page}>
            <HeaderAdmin />
            <div className={styles.dashboardContainer}>
                <h2 className={styles.welcome}>Olá, {nomeUsuario}!</h2>

                <div className={styles.cardsContainer}>
                    <div className={styles.cardStatusChamados}>
                        <h3>Status de todos os chamados da rede:</h3>
                        <p className={styles.numeroChamados}>{totalChamados}</p>

                        <div className={styles.barraProgresso}>
                            {totalChamados > 0 && statusCounts["pendente"] > 0 && (
                                <div
                                    className={styles.progressoPendente}
                                    style={{
                                        width: `${(statusCounts["pendente"] / totalChamados) * 100}%`,
                                    }}
                                />
                            )}
                            {totalChamados > 0 && statusCounts["em andamento"] > 0 && (
                                <div
                                    className={styles.progressoEmAndamento}
                                    style={{
                                        width: `${(statusCounts["em andamento"] / totalChamados) * 100}%`,
                                    }}
                                />
                            )}
                            {totalChamados > 0 && statusCounts["concluído"] > 0 && (
                                <div
                                    className={styles.progressoConcluido}
                                    style={{
                                        width: `${(statusCounts["concluído"] / totalChamados) * 100}%`,
                                    }}
                                />
                            )}
                        </div>

                        <ul className={styles.legenda}>
                            <li>
                                <span className={styles.bolinhaAberto}></span>
                                Pendente ({statusCounts["pendente"]})
                            </li>
                            <li>
                                <span className={styles.bolinhaAndamento}></span>
                                Em andamento ({statusCounts["em andamento"]})
                            </li>
                            <li>
                                <span className={styles.bolinhaFinalizado}></span>
                                Concluído ({statusCounts["concluído"]})
                            </li>
                        </ul>
                    </div>

                    <div className={styles.cardRelatorios}>
                        <h3>Relatórios recentes</h3>
                        {relatoriosRecentes.length > 0 ? (
                            relatoriosRecentes.map((relatorio, index) => (
                                <Relatorios key={index} relatorio={relatorio} />
                            ))
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
    );

}