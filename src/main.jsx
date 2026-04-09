import { StrictMode, Suspense, lazy, Component } from "react";
import { createRoot } from "react-dom/client";

const isAdmin = window.location.pathname.startsWith("/admin");
const App = lazy(() =>
  isAdmin ? import("./admin/AdminApp.jsx") : import("./App.jsx")
);

// Error boundary — catches runtime render errors and shows a clean recovery UI
class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || "Unknown error" };
  }
  componentDidCatch(error, errorInfo) {
    console.error("[Kalani Compass] Runtime render error:", error, errorInfo);
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#F7F8FA",
        fontFamily: "'Plus Jakarta Sans',sans-serif", padding: "24px",
      }}>
        <div style={{
          width: "min(600px, 94vw)", background: "white",
          border: "1px solid #E5E7EB", borderRadius: "14px",
          padding: "28px 24px", boxShadow: "0 10px 30px rgba(2,6,23,0.08)",
        }}>
          <h1 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", marginBottom: "10px" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: "14px", color: "#334155", lineHeight: 1.6, marginBottom: "14px" }}>
            Kalani Compass encountered a runtime error. If the issue persists,
            clearing your saved plan usually fixes it.
          </p>
          <pre style={{
            padding: "10px 12px", background: "#F8FAFC", border: "1px solid #E2E8F0",
            borderRadius: "8px", fontSize: "12px", overflowX: "auto",
            color: "#B91C1C", marginBottom: "16px",
          }}>
            {this.state.errorMessage}
          </pre>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => { localStorage.removeItem("kalani-compass-plan"); window.location.reload(); }}
              style={{
                background: "#B00804", color: "white", border: "none",
                borderRadius: "8px", padding: "9px 16px", fontSize: "13px",
                fontWeight: 700, cursor: "pointer",
              }}>
              Clear plan & reload
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "white", color: "#334155", border: "1px solid #CBD5E1",
                borderRadius: "8px", padding: "9px 16px", fontSize: "13px",
                fontWeight: 700, cursor: "pointer",
              }}>
              Reload page
            </button>
          </div>
        </div>
      </div>
    );
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense fallback={
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", fontFamily: "'Plus Jakarta Sans',sans-serif",
        background: "#F7F8FA", color: "#1C2B3A", fontWeight: 700, fontSize: "15px",
      }}>
        Loading Kalani Compass…
      </div>
    }>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </Suspense>
  </StrictMode>
);
