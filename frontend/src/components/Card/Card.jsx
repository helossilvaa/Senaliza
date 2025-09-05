import Link from "next/link";
import styles from "./Card.module.css";

export default function Card({ titulo, id, data, mostrarBotaoAceitar = true, onAceitar, disabled = false }) {
  return (
    <div className={styles.card}>
      <div className={styles.conteiner}>
        <div className={styles.cabecalho}>
          <div className={styles.bola}></div>
          <div className={styles.titulo}><h5>{titulo}</h5></div>
        </div>
        <div className={styles.data}><p>{data}</p></div>
        <div className={styles.botoes}>
          <Link href={`/tecnico/chamadas/${id}`} className={styles.botaoVeja}>
            Ver mais
          </Link>
          {mostrarBotaoAceitar && (
            <div className={styles.botaoAceitar}>
              <button 
                onClick={() => !disabled && onAceitar && onAceitar(id)}
                disabled={disabled} 
              >
                <p>{disabled ? "Bloqueado" : "Aceitar"}</p>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
