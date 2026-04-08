import { StrictMode, Suspense, lazy, Component } from "react";
import { createRoot } from "react-dom/client";

const isAdmin = window.location.pathname.startsWith("/admin");
const App = lazy(() => isAdmin ? import("./admin/AdminApp.jsx") : import("./App.jsx"));

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || "Unknown error",
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[Kalani Compass] Runtime render error:", error, errorInfo);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F7F8FA",
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        padding: "24px",
      }}>
        <div style={{
          width: "min(680px, 94vw)",
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "14px",
          padding: "22px 20px",
          boxShadow: "0 10px 30px rgba(2,6,23,0.08)",
          color: "#0F172A",
        }}>
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>
            页面加载失败（已拦截错误）
          </h1>
          <p style={{ marginTop: "10px", marginBottom: "12px", fontSize: "14px", color: "#334155", lineHeight: 1.6 }}>
            应用遇到运行时错误。你可以先清理本地计划缓存再重试。
          </p>
          <pre style={{
            margin: 0,
            padding: "10px 12px",
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            fontSize: "12px",
            overflowX: "auto",
            color: "#B91C1C",
          }}>
            {this.state.errorMessage}
          </pre>
          <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                localStorage.removeItem("kalani-compass-plan");
                window.location.reload();
              }}
              style={{
                border: "none",
                background: "#B00804",
                color: "white",
                borderRadius: "8px",
                padding: "9px 12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              清除计划缓存并重载
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                border: "1px solid #CBD5E1",
                background: "white",
                color: "#334155",
                borderRadius: "8px",
                padding: "9px 12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              仅重载页面
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
        minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"'Plus Jakarta Sans',sans-serif", background:"#F7F8FA",
        color:"#1C2B3A", fontWeight:700, fontSize:"15px"
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
