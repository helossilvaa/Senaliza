import styles from "@/components/Relatorios/page.module.css"

export default function Relatorios({ relatorio }) {
    if (!relatorio) return null;

    return (
        <div className={styles.documentos}>
            <div className={styles.icon}>
                <i className="bi bi-file-earmark-richtext"></i>
            </div>
            <div className={styles.info}>
                <div className={styles.titulo}>
                    <p>{relatorio.chamado?.titulo || 'Chamado não encontrado'}</p>
                </div>
                <div className={styles.link}>
                    <p>Resolvido por: {relatorio.tecnico?.nome || 'N/A'}</p>
                </div>
            </div>
            <div className={styles.download}>
                <div className={styles.baixar}>
                    <i className="bi bi-arrow-down-circle-fill" />
                </div>
            </div>
        </div>
    )
}