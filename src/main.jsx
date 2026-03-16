import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AdminApp from "./admin/AdminApp.jsx";
import KalaniPlanner from "../kalani-planner.jsx";

const root = createRoot(document.getElementById("root"));

// Route /admin to admin panel, everything else to the student planner
if (window.location.pathname.startsWith("/admin")) {
  root.render(<StrictMode><AdminApp /></StrictMode>);
} else {
  root.render(<StrictMode><KalaniPlanner /></StrictMode>);
}
