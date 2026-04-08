import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";

const isAdmin = window.location.pathname.startsWith("/admin");
const App = lazy(() => isAdmin ? import("./admin/AdminApp.jsx") : import("./App.jsx"));

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
      <App />
    </Suspense>
  </StrictMode>
);
