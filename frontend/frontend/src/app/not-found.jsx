// pages/404.jsx

export default function Custom404() {
    return (
      <div style={{
        height: "100vh", display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center", textAlign: "center",
        backgroundColor: "#f0f0f0"
      }}>
        <h1 style={{ fontSize: "8rem", margin: 0, color: "#c00000" }}>404</h1>
        <h2 style={{ fontSize: "2.5rem", margin: "0.5rem 0" }}>Página não encontrada</h2>
        <p style={{ fontSize: "1.2rem", color: "#333" }}>
          Ops! A página que você tentou acessar não existe.
        </p>
      </div>
    );
  }
  