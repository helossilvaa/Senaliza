"use client";
import styles from "./page.module.css";

export default function CardDashboardTecnico({ chamado }) {
    async function handleAceitar() {
        try {
            const res = await fetch(`http://localhost:8080/api/chamados/assumirChamado/${chamado.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ status: "em andamento" })
            });

            if (!res.ok) throw new Error("Erro ao assumir chamado");
            alert("Chamado assumido!");
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div>
            <div>
                <h4>{chamado.titulo}</h4>
                <p>{chamado.sala}</p>
            </div>
            <div>
                <a href="/tecnico/Historico">
                    <button className={styles.btnVerMais}>Ver mais</button>
                </a>
                <button onClick={handleAceitar} className={styles.btnAceitar}>
                    Aceitar
                </button>
            </div>
        </div>
    );
}
