import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById("root"));
const pathname = window.location.pathname;
const App = pathname.startsWith("/admin")
  ? lazy(() => import("./admin/AdminApp.jsx"))
  : lazy(() => import("../kalani-planner.jsx"));

root.render(
  <StrictMode>
    <Suspense fallback={(
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background: "#F7F8FA",
        color: "#1C2B3A",
        fontWeight: 700,
      }}>
        Loading Kalani Compass…
      </div>
    )}>
      <App />
    </Suspense>
  </StrictMode>
);
