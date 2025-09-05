"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import styles from "@/components/Relatorios/page.module.css";

export default function Relatorios({ relatorio }) {
  const router = useRouter();
  const API_URL = "http://localhost:8080";

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
        // Aqui você pode usar decoded, se necessário
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      }
    };

    fetchDados();
  }, [router]);

  if (!relatorio) return null;

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await fetch(
        `${API_URL}/relatorios/pdf/${relatorio.chamado?.id}`,
        config
      );

      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");
      const errorBody = isJson ? await response.json() : await response.text();

      console.log("Resposta da API:", response.status, errorBody);

      if (!response.ok) throw new Error(errorBody.mensagem || "Erro ao gerar PDF");

      const data = errorBody;
      const arquivo = data.arquivo;

      window.open(`${API_URL}/relatorios/download/${arquivo}`, "_blank");
    } catch (error) {
      console.error("Erro ao gerar e baixar o PDF:", error.message || error);
    }
  };

  return (
    <div className={styles.documentos}>
      <div className={styles.icon}>
        <i className="bi bi-file-earmark-richtext"></i>
      </div>
      <div className={styles.info}>
        <div className={styles.titulo}>
          <p>{relatorio.chamado?.titulo || "Chamado não encontrado"}</p>
        </div>
        <div className={styles.link}>
          <p>Resolvido por: {relatorio.tecnico?.nome || "N/A"}</p>
        </div>
      </div>
      <div className={styles.download}>
        <button onClick={handleDownload} className={styles.baixar}>
          <i className="bi bi-arrow-down-circle-fill" />
        </button>
      </div>
    </div>
  );
}