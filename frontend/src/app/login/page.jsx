"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "@/app/login/page.module.css";
import Loading from "@/app/loading";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [loginParams, setLoginParams] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const API_URL = "http://localhost:8080";


  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/auth/validate`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          return;
        }

        const data = await res.json();
        const funcao = data?.usuario?.funcao;

        if (funcao === "usuario") {
          router.push("/usuario/dashboard");
        } else if (funcao === "tecnico") {
          router.push("/tecnico/dashboard");
        } else if (funcao === "admin") {
          router.push("/admin/dashboard");
        }
      } catch (err) {
        console.error("Erro ao validar token:", err);
        localStorage.removeItem("token");
      }
    };

    checkToken();
  }, [router]);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginParams),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        toast.success("Login realizado com sucesso!");

       
        setTimeout(() => {
          const funcao = data.usuario.funcao;
          if (funcao === "usuario") router.push("/usuario/dashboard");
          else if (funcao === "tecnico") router.push("/tecnico/dashboard");
          else router.push("/admin/dashboard");
        }, 1000);
      } else {
        toast.error(data.error || "Credenciais inválidas");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast.error("Erro na requisição. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
     
      <ToastContainer position="top-right" autoClose={3000} pauseOnHover={false} theme="light" />

      <div className={styles.imagem}>
        <img src="Senaliza.png" alt="Logo Senalisa" />
      </div>

      <div className={styles.formulario}>
        {loading ? (
          <Loading />
        ) : (
          <form onSubmit={login}>
            <h1>Entrar</h1>

            <div className={styles.camposPreenchimento}>
              <label htmlFor="floatingInput">Usuário</label>
              <input
                type="text"
                className="form-control"
                id="floatingInput"
                value={loginParams.username}
                onChange={(e) =>
                  setLoginParams({ ...loginParams, username: e.target.value })
                }
              />
            </div>

            <div className={styles.camposPreenchimento}>
              <label htmlFor="floatingPassword">Senha</label>
              <input
                type="password"
                className="form-control"
                id="floatingPassword"
                value={loginParams.password}
                onChange={(e) =>
                  setLoginParams({ ...loginParams, password: e.target.value })
                }
              />
            </div>

            <button type="submit" disabled={loading} className={styles.botao}>
              Entrar
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
