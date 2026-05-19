import { useEffect, useState } from "react";
import { supabase } from "../supabase.js";
import { DEFAULT_DISCLAIMER_ITEMS } from "../data/disclaimerItems.js";

const EMPTY_FORM = {
  id:"",
  icon:"📋",
  label:"",
  body:"",
  sort_order:10,
  visible:true,
};

function normalizeRow(row) {
  return {
    id: row.id || "",
    icon: row.icon || "",
    label: row.label || "",
    body: row.body || "",
    sort_order: row.sort_order ?? 0,
    visible: row.visible ?? true,
  };
}

export default function DisclaimerPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  async function fetchAll() {
    setLoading(true);
    if (!supabase) {
      setItems(DEFAULT_DISCLAIMER_ITEMS.map(item => ({
        id: item.id,
        icon: item.icon,
        label: item.label,
        body: item.text,
        sort_order: item.sortOrder,
        visible: item.visible,
      })));
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("disclaimer_items")
      .select("id, icon, label, body, sort_order, visible, updated_at")
      .order("sort_order", { ascending:true });

    if (error) {
      setToast("Error: " + error.message);
    } else {
      setItems((data || []).map(normalizeRow));
    }
    setLoading(false);
  }

  function openNew() {
    setEditItem(null);
    setForm({ ...EMPTY_FORM, sort_order: (items.length + 1) * 10 });
    setShowForm(true);
  }

  function openEdit(item) {
    setEditItem(item);
    setForm(normalizeRow(item));
    setShowForm(true);
  }

  async function saveForm() {
    if (!form.id.trim() || !form.label.trim() || !form.body.trim()) return;
    if (!supabase) {
      setToast("Supabase is not configured in local fallback mode.");
      return;
    }

    setSaving(true);
    const payload = {
      id: form.id.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, ""),
      icon: form.icon.trim(),
      label: form.label.trim(),
      body: form.body.trim(),
      sort_order: Number(form.sort_order) || 0,
      visible: form.visible,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (editItem) {
      ({ error } = await supabase.from("disclaimer_items").update(payload).eq("id", editItem.id));
    } else {
      ({ error } = await supabase.from("disclaimer_items").insert(payload));
    }

    setSaving(false);
    if (error) {
      setToast("Error: " + error.message);
      return;
    }
    setToast(editItem ? "Updated" : "Created");
    setShowForm(false);
    fetchAll();
  }

  async function toggleVisible(item) {
    if (!supabase) return;
    const { error } = await supabase
      .from("disclaimer_items")
      .update({ visible: !item.visible, updated_at: new Date().toISOString() })
      .eq("id", item.id);
    if (error) setToast("Error: " + error.message);
    fetchAll();
  }

  async function deleteItem(item) {
    if (!window.confirm(`Delete "${item.label}"?`)) return;
    if (!supabase) return;
    const { error } = await supabase.from("disclaimer_items").delete().eq("id", item.id);
    if (error) {
      setToast("Error: " + error.message);
      return;
    }
    setToast("Deleted");
    fetchAll();
  }

  async function restoreDefaults() {
    if (!window.confirm("Restore the default disclaimer items? Existing matching IDs will be overwritten.")) return;
    if (!supabase) return;
    const payload = DEFAULT_DISCLAIMER_ITEMS.map(item => ({
      id: item.id,
      icon: item.icon,
      label: item.label,
      body: item.text,
      sort_order: item.sortOrder,
      visible: item.visible,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from("disclaimer_items").upsert(payload, { onConflict:"id" });
    if (error) {
      setToast("Error: " + error.message);
      return;
    }
    setToast("Defaults restored");
    fetchAll();
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"20px" }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", color:"#111827", marginBottom:"4px" }}>
            Data Sources & Disclaimer
          </h2>
          <p style={{ fontSize:"13px", color:"#6B7280", lineHeight:1.5 }}>
            These items appear in both the first-visit popup and the footer disclaimer modal.
          </p>
        </div>
        <div style={{ display:"flex", gap:"8px" }}>
          <button onClick={restoreDefaults}
            style={{ background:"white", color:"#6B7280", border:"1px solid #D1D5DB",
              borderRadius:"9px", padding:"9px 14px", fontSize:"13px", fontWeight:700,
              cursor:"pointer", fontFamily:"inherit" }}>
            Restore defaults
          </button>
          <button onClick={openNew}
            style={{ background:"#B00804", color:"white", border:"none", borderRadius:"9px",
              padding:"9px 18px", fontSize:"13px", fontWeight:700, cursor:"pointer",
              fontFamily:"inherit" }}>
            + New item
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:"40px", color:"#9CA3AF", fontSize:"14px" }}>Loading...</div>
      ) : (
        <div>
          {items.map(item => (
            <div key={item.id} style={{ background:"white", border:"1px solid #E5E7EB",
              borderRadius:"12px", padding:"16px 18px", marginBottom:"10px",
              opacity:item.visible ? 1 : 0.55 }}>
              <div style={{ display:"flex", gap:"13px", alignItems:"flex-start" }}>
                <span style={{ fontSize:"22px", width:"28px", textAlign:"center", flexShrink:0 }}>{item.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", gap:"8px", alignItems:"center", marginBottom:"4px", flexWrap:"wrap" }}>
                    <span style={{ fontSize:"13px", fontWeight:800, color:"#111827" }}>{item.label}</span>
                    <span style={{ fontSize:"10px", fontWeight:800, color:"#6B7280",
                      background:"#F3F4F6", borderRadius:"999px", padding:"2px 7px" }}>
                      Order {item.sort_order}
                    </span>
                  </div>
                  <p style={{ fontSize:"13px", color:"#6B7280", lineHeight:1.6, margin:0 }}>{item.body}</p>
                  <div style={{ fontSize:"11px", color:"#9CA3AF", marginTop:"7px" }}>{item.id}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", flexShrink:0 }}>
                  <div onClick={()=>toggleVisible(item)}
                    title={item.visible ? "Click to hide" : "Click to show"}
                    style={{ width:"36px", height:"20px", borderRadius:"999px",
                      background:item.visible ? "#22C55E" : "#D1D5DB",
                      cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
                    <div style={{ position:"absolute", width:"16px", height:"16px",
                      borderRadius:"50%", background:"white", top:"2px",
                      left:item.visible ? "18px" : "2px", transition:"left 0.2s" }} />
                  </div>
                  <button onClick={()=>openEdit(item)}
                    style={{ background:"#F3F4F6", border:"none", borderRadius:"7px",
                      padding:"6px 11px", fontSize:"12px", cursor:"pointer",
                      color:"#374151", fontFamily:"inherit" }}>
                    Edit
                  </button>
                  <button onClick={()=>deleteItem(item)}
                    style={{ background:"transparent", border:"none", borderRadius:"7px",
                      padding:"6px 8px", fontSize:"14px", cursor:"pointer",
                      color:"#9CA3AF", fontFamily:"inherit" }}
                    title="Delete">
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(17,24,39,0.55)",
          display:"flex", alignItems:"center", justifyContent:"center",
          zIndex:1000, padding:"20px", backdropFilter:"blur(4px)" }}
          onClick={()=>setShowForm(false)}>
          <div style={{ background:"white", borderRadius:"16px", padding:"28px",
            width:"100%", maxWidth:"620px", maxHeight:"90vh", overflowY:"auto",
            boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px", color:"#111827" }}>
                {editItem ? "Edit disclaimer item" : "New disclaimer item"}
              </h3>
              <button onClick={()=>setShowForm(false)}
                style={{ background:"none", border:"none", fontSize:"18px",
                  cursor:"pointer", color:"#9CA3AF", lineHeight:1 }}>×</button>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"80px 1fr 100px", gap:"10px", marginBottom:"12px" }}>
              <div>
                <label style={{ display:"block", fontSize:"12px", fontWeight:700, color:"#374151", marginBottom:"5px" }}>Icon</label>
                <input value={form.icon} onChange={e=>setForm(f=>({...f,icon:e.target.value}))}
                  style={{ width:"100%", padding:"9px 12px", borderRadius:"8px",
                    border:"1.5px solid #E5E7EB", fontSize:"18px", outline:"none" }} />
              </div>
              <div>
                <label style={{ display:"block", fontSize:"12px", fontWeight:700, color:"#374151", marginBottom:"5px" }}>Label</label>
                <input value={form.label} onChange={e=>setForm(f=>({...f,label:e.target.value}))}
                  placeholder="Primary Source"
                  style={{ width:"100%", padding:"9px 12px", borderRadius:"8px",
                    border:"1.5px solid #E5E7EB", fontSize:"13px", outline:"none" }} />
              </div>
              <div>
                <label style={{ display:"block", fontSize:"12px", fontWeight:700, color:"#374151", marginBottom:"5px" }}>Order</label>
                <input type="number" value={form.sort_order}
                  onChange={e=>setForm(f=>({...f,sort_order:e.target.value}))}
                  style={{ width:"100%", padding:"9px 12px", borderRadius:"8px",
                    border:"1.5px solid #E5E7EB", fontSize:"13px", outline:"none" }} />
              </div>
            </div>

            <div style={{ marginBottom:"12px" }}>
              <label style={{ display:"block", fontSize:"12px", fontWeight:700, color:"#374151", marginBottom:"5px" }}>ID</label>
              <input value={form.id} disabled={Boolean(editItem)}
                onChange={e=>setForm(f=>({...f,id:e.target.value}))}
                placeholder="primary-source"
                style={{ width:"100%", padding:"9px 12px", borderRadius:"8px",
                  border:"1.5px solid #E5E7EB", fontSize:"13px", outline:"none",
                  background:editItem ? "#F9FAFB" : "white", color:editItem ? "#9CA3AF" : "#111827" }} />
            </div>

            <div style={{ marginBottom:"16px" }}>
              <label style={{ display:"block", fontSize:"12px", fontWeight:700, color:"#374151", marginBottom:"5px" }}>Body text</label>
              <textarea value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))}
                rows={5}
                placeholder="Text shown in both disclaimer modals"
                style={{ width:"100%", padding:"9px 12px", borderRadius:"8px",
                  border:"1.5px solid #E5E7EB", fontSize:"13px", outline:"none",
                  resize:"vertical", lineHeight:1.5 }} />
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"20px" }}>
              <div onClick={()=>setForm(f=>({...f,visible:!f.visible}))}
                style={{ width:"36px", height:"20px", borderRadius:"999px",
                  background:form.visible ? "#22C55E" : "#D1D5DB",
                  cursor:"pointer", position:"relative", transition:"background 0.2s",
                  flexShrink:0 }}>
                <div style={{ position:"absolute", width:"16px", height:"16px",
                  borderRadius:"50%", background:"white", top:"2px",
                  left:form.visible ? "18px" : "2px", transition:"left 0.2s" }} />
              </div>
              <span style={{ fontSize:"13px", color:"#374151" }}>
                {form.visible ? "Visible to students" : "Hidden from students"}
              </span>
            </div>

            <div style={{ display:"flex", gap:"10px" }}>
              <button onClick={saveForm} disabled={saving || !form.id.trim() || !form.label.trim() || !form.body.trim()}
                style={{ flex:1, background:(saving || !form.id.trim() || !form.label.trim() || !form.body.trim()) ? "#D1D5DB" : "#B00804",
                  color:"white", border:"none", borderRadius:"9px", padding:"10px",
                  fontSize:"13px", fontWeight:700,
                  cursor:(saving || !form.id.trim() || !form.label.trim() || !form.body.trim()) ? "not-allowed" : "pointer",
                  fontFamily:"inherit" }}>
                {saving ? "Saving..." : editItem ? "Save changes" : "Create item"}
              </button>
              <button onClick={()=>setShowForm(false)}
                style={{ padding:"10px 18px", background:"white", color:"#6B7280",
                  border:"1.5px solid #E5E7EB", borderRadius:"9px", fontSize:"13px",
                  cursor:"pointer", fontFamily:"inherit" }}>
                Cancel
              </button>
            </div>
          </div>
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
