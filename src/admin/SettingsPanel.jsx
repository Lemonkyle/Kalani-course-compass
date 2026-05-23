import { useEffect, useState } from "react";
import { DEFAULT_SITE_SETTINGS, normalizeSiteSettings } from "../data/siteSettings.js";
import { supabase } from "../supabase.js";

const SETTINGS_FIELDS = [
  { key:"catalog_year_label", label:"Catalog year label", hint:"Example: 2026-2027" },
  { key:"catalog_source_title", label:"Catalog source title", hint:"Shown in the site footer" },
  { key:"catalog_source_url", label:"Catalog source URL", hint:"Official registration/catalog link" },
  { key:"catalog_last_reviewed", label:"Last reviewed", hint:"Example: March 2026" },
];

export default function SettingsPanel() {
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => { fetchSettings(); }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  async function fetchSettings() {
    setLoading(true);
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value");

    if (error) {
      setToast("Error: " + error.message);
    } else {
      setSettings(normalizeSiteSettings(data || []));
    }
    setLoading(false);
  }

  async function saveSettings() {
    if (!supabase) {
      setToast("Supabase is not configured in local fallback mode.");
      return;
    }

    const sourceUrl = settings.catalog_source_url.trim();
    if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) {
      setToast("Catalog source URL must start with http:// or https://");
      return;
    }

    setSaving(true);
    const rows = SETTINGS_FIELDS.map(({ key }) => ({
      key,
      value: String(settings[key] || "").trim(),
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from("site_settings").upsert(rows, { onConflict:"key" });
    setSaving(false);

    if (error) {
      setToast("Error: " + error.message);
      return;
    }
    setToast("Settings saved");
    fetchSettings();
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"20px" }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", color:"#111827", marginBottom:"4px" }}>
            Site Settings
          </h2>
          <p style={{ fontSize:"13px", color:"#6B7280", lineHeight:1.5 }}>
            Update catalog source text without changing code each school year.
          </p>
        </div>
        <button onClick={saveSettings} disabled={saving || loading}
          style={{ background:(saving || loading) ? "#D1D5DB" : "#B00804",
            color:"white", border:"none", borderRadius:"9px", padding:"9px 18px",
            fontSize:"13px", fontWeight:700, cursor:(saving || loading) ? "not-allowed" : "pointer",
            fontFamily:"inherit" }}>
          {saving ? "Saving..." : "Save settings"}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:"40px", color:"#9CA3AF", fontSize:"14px" }}>Loading...</div>
      ) : (
        <div style={{ background:"white", border:"1px solid #E5E7EB", borderRadius:"12px", padding:"18px" }}>
          {SETTINGS_FIELDS.map(field => (
            <div key={field.key} style={{ marginBottom:"14px" }}>
              <div style={{ marginBottom:"5px" }}>
                <span style={{ fontSize:"12px", fontWeight:700, color:"#374151" }}>{field.label}</span>
                <span style={{ fontSize:"11px", color:"#9CA3AF", marginLeft:"6px" }}>{field.hint}</span>
              </div>
              <input value={settings[field.key] || ""}
                onChange={e=>setSettings(s=>({ ...s, [field.key]: e.target.value }))}
                style={{ width:"100%", padding:"9px 12px", borderRadius:"8px",
                  border:"1.5px solid #E5E7EB", fontSize:"13px", outline:"none",
                  fontFamily:"inherit" }}
                onFocus={e=>e.target.style.borderColor="#B00804"}
                onBlur={e=>e.target.style.borderColor="#E5E7EB"}
              />
            </div>
          ))}
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
