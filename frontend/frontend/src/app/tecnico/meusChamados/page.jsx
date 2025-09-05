"use client";
import { useEffect, useState } from 'react';
import Card from '@/components/Card/Card';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Layout from '@/components/LayoutTecnico/page'; 


export default function MeusChamadosPage() {
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

console.log("Token encontrado:", token);

    const fetchChamados = async () => {
      setLoading(true); 
      try {
        const decoded = jwtDecode(token);

        if (decoded.exp < Date.now() / 1000) {
          localStorage.removeItem("token");
          alert("Seu login expirou.");
          router.push("/login");
          return;
        }

        const res = await fetch(`${API_URL}/chamados/chamadostecnico`, {
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

  }, []);
  

  return (
    <Layout>
    <div className={styles.container}>
     
      <div className={styles.chamadas}>
        <div className={styles.titulo}>
          <h1>Meus Chamados</h1>
        </div>

        <div className={styles.card}>
          {chamados.length === 0 ? (
            <p>Nenhum chamado aceito ainda.</p>
          ) : (
            chamados.map((chamada) => (
              <Card
                key={chamada.id}
                titulo={chamada.titulo}
                data={new Date(chamada.atualizado_em).toLocaleDateString()}
                id={chamada.id}
                mostrarBotaoAceitar={false}
              />
            ))
          )}
        </div>
      </div>
    </div>
    </Layout>
  );
}
