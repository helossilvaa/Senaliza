"use client";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import LayoutTecnico from "@/components/LayoutTecnico/layout";

export default function PerfilUsuario() {
  const [dadosUsuario, setDadosUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:8080";
  const router = useRouter();

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const decoded = jwtDecode(token);
        if (!["admin", "tecnico", "usuario"].includes(decoded.funcao)) {
          router.push("/");
          return;
        }
        

        if (decoded.exp < Date.now() / 1000) {
          localStorage.removeItem("token");
          alert("Seu Login Expirou.");
          router.push("/login");
          return;
        }

        const id = decoded.id;

        const res = await fetch(`${API_URL}/usuarios/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Usuário não encontrado");

        const data = await res.json(); // aguarda a resposta JSON

        setDadosUsuario({
          nome: data.nome || "",
          funcao: data.funcao || "",
          status: data.status || "",
          senha: "********",
          email: data.email || "",
          criado: data.criado_em
            ? new Date(data.criado_em).toLocaleDateString()
            : "",
          atualizado: data.atualizado_em
            ? new Date(data.atualizado_em).toLocaleDateString()
            : "",
        });

        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUsuario();
  }, []);

  if (loading) return <p className={styles.loading}>Carregando perfil...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!dadosUsuario) return null;

  return (
    <LayoutTecnico>
    <main className={styles.main}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.avatar}></div>
          <div className={styles.infoPrincipal}>
            <h2>{dadosUsuario.nome}</h2>
            <p>
              <strong>Atualizado:</strong> {dadosUsuario.atualizado}
            </p>
            <p>
              <strong>Criado:</strong> {dadosUsuario.criado}
            </p>
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div>
            <label className={styles.label}>Função</label>
            <div className={styles.inputLike}>{dadosUsuario.funcao}</div>
          </div>
          <div>
            <label className={styles.label}>Status</label>
            <div className={styles.inputLike}>{dadosUsuario.status}</div>
          </div>
          <div>
            <label className={styles.label}>Senha</label>
            <div className={styles.inputLike}>{dadosUsuario.senha}</div>
          </div>
        </div>

        <div className={styles.emailBox}>
          <label className={styles.label}>E-mail</label>
          <div className={styles.inputLike}>{dadosUsuario.email}</div>
        </div>
      </div>
    </main>
    </LayoutTecnico>
  );
}
