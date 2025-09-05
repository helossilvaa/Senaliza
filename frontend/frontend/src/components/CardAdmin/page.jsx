import Link from "next/link";
import styles from "./Card.module.css";
import { useState } from "react"; 

export default function CardAdmin({ titulo, id, data, tecnicos, onAtribuir }) {
    const [tecnicoSelecionado, setTecnicoSelecionado] = useState('');
  
    const handleAtribuir = () => {
      if (tecnicoSelecionado) {
       
        const tecnicoIdNumerico = parseInt(tecnicoSelecionado, 10);
        
       
        if (!isNaN(tecnicoIdNumerico)) {
          onAtribuir(id, tecnicoIdNumerico);
        } else {
          alert("Erro: ID do técnico inválido.");
        }
      } else {
        alert("Por favor, selecione um técnico.");
      }
    };
  
    return (
      <div className={styles.card}>
        <div className={styles.conteiner}>
          <div className={styles.cabecalho}>
            <div className={styles.bola}></div>
            <div className={styles.titulo}><h5>{titulo}</h5></div>
          </div>
          <p className={styles.data}>{new Date(data).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</p>
          <div className={styles.botoes}>
            <Link href={`/admin/chamadas/${id}`} className={styles.botaoVeja}>
              Ver mais
            </Link>
            
            <div className={styles.atribuirForm}>
              <select
                value={tecnicoSelecionado}
                onChange={(e) => setTecnicoSelecionado(e.target.value)}
              >
                <option value="">Atribuir a...</option>
                {tecnicos.map(tecnico => (
                  <option key={tecnico.id} value={tecnico.id}>
                    {tecnico.nome}
                  </option>
                ))}
              </select>
              <button onClick={handleAtribuir}>Atribuir</button>
            </div>
          </div>
        </div>
      </div>
    );
  }