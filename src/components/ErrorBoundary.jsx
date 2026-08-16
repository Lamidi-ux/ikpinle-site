import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { erreur: null };
  }

  static getDerivedStateFromError(erreur) {
    return { erreur };
  }

  componentDidCatch(erreur, info) {
    console.error("Erreur capturée par ErrorBoundary:", erreur, info);
  }

  render() {
    if (this.state.erreur) {
      return (
        <div style={{ padding: "2rem", fontFamily: "monospace", background: "#F2EBDD", minHeight: "100vh" }}>
          <h1 style={{ color: "#B8542D", marginBottom: "1rem" }}>Une erreur est survenue</h1>
          <p style={{ marginBottom: "1rem" }}>
            Prends une capture de ce message et envoie-le pour correction :
          </p>
          <pre
            style={{
              background: "#FBF7EE",
              border: "1px solid #D9C9A8",
              padding: "1rem",
              borderRadius: "8px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: "0.85rem",
            }}
          >
            {this.state.erreur.message}
            {"\n\n"}
            {this.state.erreur.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "1rem",
              padding: "0.75rem 1.5rem",
              background: "#2F4A3C",
              color: "#F2EBDD",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Recharger la page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
