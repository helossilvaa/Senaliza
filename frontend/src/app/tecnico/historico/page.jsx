"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card/Card";
import LayoutTecnico from "@/components/LayoutTecnico/layout";
import styles from "@/app/tecnico/Chamadas/page.module.css";
import { useRouter } from "next/navigation";
import {jwtDecode}  from "jwt-decode";
import Loading from "@/app/loading"; 

export default function Chamadas() {
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const API_URL = "http://localhost:8080";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchChamados = async () => {
      try {
        const decoded = jwtDecode(token);

        if (decoded.exp < Date.now() / 1000) {
          localStorage.removeItem("token");
          alert("Seu login expirou.");
          router.push("/login");
          return;
        }

        const res = await fetch(`${API_URL}/chamados/historico`, {
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

  if (loading) return <Loading />;

  return (
    <LayoutTecnico>
      <div className={styles.container}>
        <div className={styles.chamadas}>
          <h1>Histórico</h1>
          <div className={styles.cardsContainer}>
            {chamados.length === 0 ? (
              <p>Sem chamados concluídos.</p>
            ) : (
              chamados.map((chamado) => (
                <Card
                  key={chamado.id}
                  id={chamado.id}
                  titulo={chamado.titulo}
                  data={new Date(chamado.criado_em).toLocaleDateString()}
                  mostrarBotaoAceitar={false} 
                />
              ))
            )}
          </div>
        </div>
      </div>
    </LayoutTecnico>
  );
}
