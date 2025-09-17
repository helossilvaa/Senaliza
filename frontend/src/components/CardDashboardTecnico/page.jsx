"use client";
import styles from "./page.module.css";

export default function CardDashboardTecnico({ chamado = {} }) {
  const tituloRaw =
    typeof chamado?.titulo === "string"
      ? chamado.titulo
      : (chamado?.assunto ?? chamado?.titulo_descricao ?? "");

  const MAX_CHARS = 40;
  const tituloCurto =
    typeof tituloRaw === "string" && tituloRaw.length > MAX_CHARS
      ? `${tituloRaw.slice(0, MAX_CHARS)}…`
      : tituloRaw;

  async function handleAceitar() {
    try {
      const res = await fetch(
        `http://localhost:8080/api/chamados/assumir/${chamado.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) throw new Error("Erro ao assumir chamado");
      alert("Chamado assumido!");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.info}>
        <h4 className={styles.titulo} title={tituloRaw}>
          {tituloCurto}
        </h4>
        <p className={styles.sala}>{chamado?.nome_sala ?? ""}</p>
      </div>

      <div className={styles.acoes}>
        <a href="/tecnico/chamadas">
          <button className={styles.btnVerMais}>Ver mais</button>
        </a>
        <button onClick={handleAceitar} className={styles.btnAceitar}>
          Aceitar
        </button>
      </div>
    </div>
  );
}
