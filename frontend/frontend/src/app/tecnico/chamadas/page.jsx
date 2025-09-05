"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card/Card";
import styles from "@/app/tecnico/Chamadas/page.module.css";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Layout from '@/components/LayoutTecnico/page'; 

export default function Chamadas() {
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUsuario, setStatusUsuario] = useState(""); 
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

    setStatusUsuario(decoded.status); 

    const fetchChamados = async () => {
      try {
        const res = await fetch(`${API_URL}/chamados/pendentes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Erro ao buscar chamados");

        const data = await res.json();
        setChamados(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChamados();
  }, [router]);

  const aceitarChamado = async (chamadoId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (statusUsuario === "inativo") {
      alert("Você não pode assumir chamados porque seu status está inativo.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/chamados/assumir/${chamadoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.mensagem || "Erro ao assumir chamado");
      }

      setChamados((prev) => prev.filter((c) => c.id !== chamadoId));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (loading) return <p>Carregando chamados...</p>;

  return (
    <Layout>
    <div className={styles.container}>
      <div className={styles.chamadas}>
        <h1>Chamados Pendentes</h1>
        <div className={styles.card}>
          {chamados.map((chamado) => (
            <Card
              key={chamado.id}
              id={chamado.id}
              titulo={chamado.titulo}
              data={new Date(chamado.criado_em).toLocaleDateString()}
              onAceitar={aceitarChamado}
              disabled={statusUsuario === "inativo"} 
            />
          ))}
          {chamados.length === 0 && <p>Sem chamados pendentes</p>}
        </div>
      </div>
    </div>
    </Layout>
  );
}
