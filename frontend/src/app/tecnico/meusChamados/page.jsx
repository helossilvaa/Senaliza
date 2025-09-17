'use client';
import { useEffect, useState } from 'react';
import Card from '@/components/Card/Card';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Layout from '@/components/LayoutTecnico/layout';
import Loading from '@/app/loading'; 
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function MeusChamadosPage() {
  const [chamados, setChamados] = useState([]);
  const [chamadosFiltrados, setChamadosFiltrados] = useState([]);
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
      setLoading(true);
      try {
        const decoded = jwtDecode(token);

        if (decoded.exp < Date.now() / 1000) {
          localStorage.removeItem("token");
          toast.warning("Seu login expirou.");
          setTimeout(() => router.push("/login"), 3000);
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
  }, [router]);

  useEffect(() => {
    const filtrados = chamados.filter(chamado => chamado.status === 'em andamento');
    setChamadosFiltrados(filtrados);
  }, [chamados]);

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} pauseOnHover={false} theme="light" />
      <div className={styles.container}>
        <div className={styles.chamadas}>
          <div className={styles.titulo}>
            <h1>Meus Chamados</h1>
          </div>

          <div className={styles.cardsContainer}>
            {loading ? (
              <Loading /> 
            ) : chamadosFiltrados.length === 0 ? (
              <p>Nenhum chamado em andamento.</p>
            ) : (
              chamadosFiltrados.map((chamada) => (
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
