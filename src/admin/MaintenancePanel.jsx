import { useEffect, useState } from "react";
import { adminData } from "./adminApi.js";

const PAGES = [
  { id:"home", label:"Home", desc:"Landing page, search, department links, and graduation overview" },
  { id:"catalog", label:"Courses", desc:"Course catalog, filters, search, and course detail modal" },
  { id:"match", label:"Course Match", desc:"Curated 4-year plan templates and apply-to-planner flow" },
  { id:"planner", label:"4-Year Planner", desc:"Student saved plan, course additions, and honors progress" },
];

function Toggle({ enabled, onClick }) {
  return (
    <div onClick={onClick}
      title={enabled ? "Click to make this page available" : "Click to put this page under maintenance"}
      style={{ width:"42px", height:"24px", borderRadius:"999px",
        background: enabled ? "#F97316" : "#22C55E",
        cursor:"pointer", position:"relative", transition:"background 0.2s",
        flexShrink:0 }}>
      <div style={{ position:"absolute", width:"20px", height:"20px",
        borderRadius:"50%", background:"white", top:"2px",
        left: enabled ? "20px" : "2px", transition:"left 0.2s",
        boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }} />
    </div>
  );
}

export default function MaintenancePanel() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => { fetchSettings(); }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  async function fetchSettings() {
    setLoading(true);

    const { data, error } = await adminData
      .from("page_maintenance")
      .select("page_id, enabled, updated_at")
      .order("page_id", { ascending:true });

    if (error) {
      setToast("Error: " + error.message);
      setSettings(Object.fromEntries(PAGES.map(page => [page.id, false])));
    } else {
      const next = Object.fromEntries(PAGES.map(page => [page.id, false]));
      (data || []).forEach(row => {
        if (Object.prototype.hasOwnProperty.call(next, row.page_id)) {
          next[row.page_id] = Boolean(row.enabled);
        }
      });
      setSettings(next);
    }
    setLoading(false);
  }

  async function togglePage(page) {

    const enabled = !settings[page.id];
    setSavingId(page.id);
    setSettings(prev => ({ ...prev, [page.id]: enabled }));

    const { error } = await adminData
      .from("page_maintenance")
      .upsert({
        page_id: page.id,
        enabled,
        updated_at: new Date().toISOString(),
      }, { onConflict:"page_id" });

    setSavingId("");
    if (error) {
      setToast("Error: " + error.message);
      setSettings(prev => ({ ...prev, [page.id]: !enabled }));
      return;
    }
    setToast(enabled ? `${page.label} is under maintenance` : `${page.label} is available`);
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"20px" }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", color:"#111827", marginBottom:"4px" }}>
            Maintenance
          </h2>
          <p style={{ fontSize:"13px", color:"#6B7280", lineHeight:1.5 }}>
            Temporarily replace student pages with a maintenance message.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:"40px", color:"#9CA3AF", fontSize:"14px" }}>Loading...</div>
      ) : (
        <div style={{ display:"grid", gap:"12px" }}>
          {PAGES.map(page => {
            const enabled = Boolean(settings[page.id]);
            return (
              <div key={page.id}
                style={{ background:"white", border:"1px solid #E5E7EB",
                  borderRadius:"12px", padding:"17px 18px",
                  display:"flex", alignItems:"center", gap:"16px" }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"4px", flexWrap:"wrap" }}>
                    <span style={{ fontSize:"14px", fontWeight:800, color:"#111827" }}>{page.label}</span>
                    <span style={{ fontSize:"10px", fontWeight:800,
                      color: enabled ? "#C2410C" : "#166534",
                      background: enabled ? "#FFF7ED" : "#F0FDF4",
                      border:`1px solid ${enabled ? "#FDBA74" : "#86EFAC"}`,
                      borderRadius:"999px", padding:"2px 8px" }}>
                      {enabled ? "Under maintenance" : "Available"}
                    </span>
                    {savingId === page.id && (
                      <span style={{ fontSize:"11px", color:"#9CA3AF" }}>Saving...</span>
                    )}
                  </div>
                  <p style={{ fontSize:"13px", color:"#6B7280", lineHeight:1.5, margin:0 }}>{page.desc}</p>
                </div>
                <Toggle enabled={enabled} onClick={() => togglePage(page)} />
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <div style={{ position:"fixed", bottom:"28px", left:"50%",
          transform:"translateX(-50%)", background:"#1C2B3A", color:"white",
          padding:"10px 22px", borderRadius:"10px", fontSize:"13px",
          fontWeight:600, zIndex:2000, pointerEvents:"none" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
