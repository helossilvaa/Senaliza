'use client';

import { useEffect, useState } from "react";
import Card from "@/components/Card/Card";
import styles from "@/app/tecnico/Chamadas/page.module.css";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import LayoutTecnico from '@/components/LayoutTecnico/layout'; 
import Loading from "@/app/loading";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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
      toast.warning("Seu login expirou.");
      setTimeout(() => router.push("/login"), 3000);
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
        toast.error("Erro ao carregar chamados.");
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
      toast.warn("Você não pode assumir chamados porque seu status está inativo.");
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

      toast.success("Chamado assumido com sucesso!");
      setChamados((prev) => prev.filter((c) => c.id !== chamadoId));
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Erro ao assumir chamado.");
    }
  };

  if (loading) return <Loading />;

  return (
    <LayoutTecnico>
      <ToastContainer position="top-right" autoClose={3000} pauseOnHover={false} theme="light" />
      <div className={styles.container}>
        <div className={styles.chamadas}>
          <h1>Chamados Pendentes</h1>
          <div className={styles.cardsContainer}>
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
    </LayoutTecnico>
  );
}
