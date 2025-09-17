import Link from "next/link";
import styles from "./Card.module.css";
import { useState } from "react";
import { toast } from "react-toastify";

export default function CardAdmin({ pools, equipamentos, salas, titulo, id, data, tecnicos, onAtribuir, chamado }) {
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleAtribuir = () => {
    if (tecnicoSelecionado) {
      const tecnicoIdNumerico = parseInt(tecnicoSelecionado, 10);
      if (!isNaN(tecnicoIdNumerico)) {
        onAtribuir(id, tecnicoIdNumerico);
      } else {
        toast.error("Erro: ID do técnico inválido.");
      }
    } else {
      toast.error("Por favor, selecione um técnico.");
    }
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.conteiner}>
          <div className={styles.cabecalho}>
            <div className={styles.bola}></div>
            <div className={styles.titulo}><h5>{titulo}</h5></div>
          </div>

          <p className={styles.data}>
            {new Date(data).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
          </p>

          <div className={styles.botoes}>
            
            <div
              type="button"
              className={styles.botaoVeja}
              onClick={() => setShowModal(true)}
            >
              Ver mais
            </div>

            
            {!chamado.tecnico_id && (
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
            )}
          </div>
        </div>
      </div>


      {showModal && (
        <div className="modal-backdrop">
          <div className="modal show d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{titulo}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <p>
                    <strong>Tipo de assistência: </strong>
                    {pools?.find(p => Number(p.id) === Number(chamado.tipo_id))?.titulo || "Não encontrado"}
                  </p>

                  <p>
                    <strong>Sala: </strong>
                    {salas?.find(s => Number(s.id) === Number(chamado.sala_id))?.nome_sala || "Não encontrado"}
                  </p>

                  <p>
                    <strong>Equipamento: </strong>
                    {equipamentos?.find(eq => Number(eq.patrimonio) === Number(chamado.equipamento_id))?.equipamento || "Não encontrado"}
                  </p>

                  <p>
                    <strong>Descrição: </strong>{chamado.descricao}
                  </p>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => setShowModal(false)}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowModal(false)}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
          />
        </div>
      )}
    </>
  );
}
