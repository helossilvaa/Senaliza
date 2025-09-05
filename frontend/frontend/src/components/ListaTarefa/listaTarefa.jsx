"use client";
import { useState, useEffect } from "react";
import styles from "./listaTarefa.module.css";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ListaTarefa() {
  const [tarefas, setTarefas] = useState([]);
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const API_URL = "http://localhost:8080/tarefas";

  // Load tasks when the component mounts
  useEffect(() => {
    // 🔹 The token is now retrieved inside this useEffect hook
    const token = localStorage.getItem('token'); 
    
    // If no token is found, redirect to login page
    if (!token) {
      router.push("/login");
      return;
    }
    
    // If token exists, fetch tasks
    carregarTarefas(token);
  }, []);

  const carregarTarefas = async (token) => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTarefas(res.data);
    } catch (err) {
      console.error("Erro ao carregar tarefas:", err);
      // Optional: if the token is invalid, you can also redirect to login
      if (err.response && err.response.status === 401) {
        router.push("/login");
      }
    }
  };

  // 🔹 Create a new task
  const criarTarefa = async (e) => {
    e.preventDefault();
    if (!descricao.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      await axios.post(API_URL, { descricao }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDescricao("");
      await carregarTarefas(token);
    } catch (err) {
      console.error("Erro ao criar tarefa:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Mark task as complete or incomplete
  const toggleConcluida = async (id, concluida) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      await axios.put(`${API_URL}/${id}`, { concluida: !concluida }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await carregarTarefas(token);
    } catch (err) {
      console.error("Erro ao atualizar tarefa:", err);
    }
  };

  // 🔹 Delete a task
  const deletarTarefa = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await carregarTarefas(token);
    } catch (err) {
      console.error("Erro ao deletar tarefa:", err);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.h3}>Lista de tarefas</h3>
      <form className={styles.form} onSubmit={criarTarefa}>
        <input
          type="text"
          placeholder="Adicione sua tarefa"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Adicionando..." : "Adicionar"}
        </button>
      </form>
      <ul>
        {tarefas.map((t) => (
          <li key={t.id} className={styles.li}>
            <div>
              <input
                type="checkbox"
                checked={t.concluida}
                onChange={() => toggleConcluida(t.id, t.concluida)}
                className={styles.check}
              />
              <span>{t.descricao}</span>
            </div>
            <span
              className={`${styles.delete} bi bi-trash`}
              onClick={() => deletarTarefa(t.id)}
            ></span>
          </li>
        ))}
      </ul>
    </div>
  );
}