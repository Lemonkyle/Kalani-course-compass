import { useState, useEffect } from "react";
import { supabase } from "../supabase.js";

const TYPE_CONFIG = {
  new:     { label:"🆕 New",     bg:"#F0FDF4", border:"#86EFAC", text:"#166534" },
  warning: { label:"⚠️ Warning", bg:"#FFFBEB", border:"#FDE68A", text:"#92400E" },
  info:    { label:"📢 Info",    bg:"#EFF6FF", border:"#BFDBFE", text:"#1D4ED8" },
};

const EMPTY_FORM = {
  title:"", body:"", type:"info", link_url:"",
  starts_at:"", ends_at:"", visible:true
};

export default function AnnPanel() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showForm, setShowForm]           = useState(false);
  const [editItem, setEditItem]           = useState(null); // null = new, object = editing
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [saving, setSaving]               = useState(false);
  const [toast, setToast]                 = useState("");

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  async function fetchAll() {
    setLoading(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setAnnouncements(data);
    setLoading(false);
  }

  function openNew() {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(item) {
    setEditItem(item);
    setForm({
      title:     item.title || "",
      body:      item.body  || "",
      type:      item.type  || "info",
      link_url:  item.link_url || "",
      starts_at: item.starts_at ? item.starts_at.slice(0,16) : "",
      ends_at:   item.ends_at   ? item.ends_at.slice(0,16)   : "",
      visible:   item.visible ?? true,
    });
    setShowForm(true);
  }

  async function saveForm() {
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = {
      title:     form.title.trim(),
      body:      form.body.trim()     || null,
      type:      form.type,
      link_url:  form.link_url.trim() || null,
      visible:   form.visible,
      starts_at: form.starts_at || null,
      ends_at:   form.ends_at   || null,
    };

    let error;
    if (editItem) {
      ({ error } = await supabase.from("announcements").update(payload).eq("id", editItem.id));
    } else {
      ({ error } = await supabase.from("announcements").insert(payload));
    }

    setSaving(false);
    if (error) { setToast("❌ Error: " + error.message); return; }
    setToast(editItem ? "✅ Updated" : "✅ Published");
    setShowForm(false);
    fetchAll();
  }

  async function toggleVisible(item) {
    await supabase.from("announcements").update({ visible: !item.visible }).eq("id", item.id);
    fetchAll();
  }

  async function archiveItem(item) {
    if (!window.confirm(`Archive "${item.title}"? It will be hidden but not deleted.`)) return;
    await supabase.from("announcements").update({ visible: false, ends_at: new Date().toISOString() }).eq("id", item.id);
    setToast("🗄 Archived");
    fetchAll();
  }

  const active   = announcements.filter(a => a.visible);
  const inactive = announcements.filter(a => !a.visible);

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"20px" }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", color:"#111827", marginBottom:"4px" }}>
            Announcements
          </h2>
          <p style={{ fontSize:"13px", color:"#6B7280" }}>
            Banners shown to all students on every page
          </p>
        </div>
        <button onClick={openNew}
          style={{ background:"#B00804", color:"white", border:"none", borderRadius:"9px",
            padding:"9px 18px", fontSize:"13px", fontWeight:700, cursor:"pointer",
            fontFamily:"inherit" }}>
          + New announcement
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px", marginBottom:"24px" }}>
        {[
          ["Active now",    active.filter(a=>!a.ends_at||new Date(a.ends_at)>new Date()).length, "#B00804"],
          ["Hidden",        inactive.length,   "#6B7280"],
          ["Total created", announcements.length, "#1D4ED8"],
        ].map(([label,val,color])=>(
          <div key={label} style={{ background:"white", border:"1px solid #E5E7EB",
            borderRadius:"10px", padding:"14px 16px" }}>
            <div style={{ fontSize:"26px", fontWeight:700, color }}>{val}</div>
            <div style={{ fontSize:"12px", color:"#6B7280", marginTop:"2px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign:"center", padding:"40px", color:"#9CA3AF", fontSize:"14px" }}>Loading…</div>
      ) : (
        <>
          {announcements.length === 0 && (
            <div style={{ textAlign:"center", padding:"48px", color:"#9CA3AF",
              background:"white", borderRadius:"12px", border:"1px solid #E5E7EB" }}>
              <div style={{ fontSize:"32px", marginBottom:"10px" }}>📢</div>
              No announcements yet. Create one to get started.
            </div>
          )}

          {announcements.map(a => {
            const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.info;
            const now = new Date();
            const expired = a.ends_at && new Date(a.ends_at) < now;
            const scheduled = a.starts_at && new Date(a.starts_at) > now;

            return (
              <div key={a.id} style={{ background:"white", border:"1px solid #E5E7EB",
                borderRadius:"12px", padding:"16px 18px", marginBottom:"10px",
                opacity: (!a.visible || expired) ? 0.55 : 1,
                transition:"opacity 0.2s" }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:"12px" }}>
                  {/* Type badge */}
                  <span style={{ background:cfg.bg, border:`1px solid ${cfg.border}`,
                    color:cfg.text, borderRadius:"6px", padding:"3px 9px",
                    fontSize:"11px", fontWeight:700, flexShrink:0, marginTop:"1px" }}>
                    {cfg.label}
                  </span>

                  {/* Content */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:"14px", color:"#111827",
                      marginBottom:"3px" }}>{a.title}</div>
                    {a.body && <div style={{ fontSize:"13px", color:"#6B7280",
                      marginBottom:"5px" }}>{a.body}</div>}
                    <div style={{ display:"flex", gap:"12px", flexWrap:"wrap",
                      fontSize:"11px", color:"#9CA3AF" }}>
                      {a.link_url && <span>🔗 Has link</span>}
                      {a.starts_at && <span>▶ Starts {new Date(a.starts_at).toLocaleDateString()}</span>}
                      {a.ends_at   && <span>⏱ Expires {new Date(a.ends_at).toLocaleDateString()}</span>}
                      {!a.ends_at  && <span>∞ No expiry</span>}
                      {expired     && <span style={{ color:"#EF4444", fontWeight:700 }}>Expired</span>}
                      {scheduled   && <span style={{ color:"#F59E0B", fontWeight:700 }}>Scheduled</span>}
                    </div>
                  </div>

                  {/* Controls */}
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", flexShrink:0 }}>
                    {/* Toggle */}
                    <div onClick={()=>toggleVisible(a)}
                      title={a.visible?"Click to hide":"Click to show"}
                      style={{ width:"36px", height:"20px", borderRadius:"999px",
                        background: a.visible ? "#22C55E" : "#D1D5DB",
                        cursor:"pointer", position:"relative", transition:"background 0.2s",
                        flexShrink:0 }}>
                      <div style={{ position:"absolute", width:"16px", height:"16px",
                        borderRadius:"50%", background:"white", top:"2px",
                        left: a.visible ? "18px" : "2px", transition:"left 0.2s" }}/>
                    </div>

                    <button onClick={()=>openEdit(a)}
                      style={{ background:"#F3F4F6", border:"none", borderRadius:"7px",
                        padding:"6px 11px", fontSize:"12px", cursor:"pointer",
                        color:"#374151", fontFamily:"inherit" }}>
                      Edit
                    </button>
                    <button onClick={()=>archiveItem(a)}
                      style={{ background:"transparent", border:"none", borderRadius:"7px",
                        padding:"6px 8px", fontSize:"13px", cursor:"pointer",
                        color:"#9CA3AF", fontFamily:"inherit" }}
                      title="Archive">
                      🗄
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Form modal */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(17,24,39,0.55)",
          display:"flex", alignItems:"center", justifyContent:"center",
          zIndex:1000, padding:"20px", backdropFilter:"blur(4px)" }}
          onClick={()=>setShowForm(false)}>
          <div style={{ background:"white", borderRadius:"16px", padding:"28px",
            width:"100%", maxWidth:"520px", maxHeight:"90vh", overflowY:"auto",
            boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={e=>e.stopPropagation()}>

            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", marginBottom:"20px" }}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px",
                color:"#111827" }}>{editItem ? "Edit announcement" : "New announcement"}</h3>
              <button onClick={()=>setShowForm(false)}
                style={{ background:"none", border:"none", fontSize:"18px",
                  cursor:"pointer", color:"#9CA3AF", lineHeight:1 }}>✕</button>
            </div>

            {/* Type selector */}
            <div style={{ marginBottom:"16px" }}>
              <label style={{ display:"block", fontSize:"12px", fontWeight:700,
                color:"#374151", marginBottom:"7px" }}>Type</label>
              <div style={{ display:"flex", gap:"8px" }}>
                {Object.entries(TYPE_CONFIG).map(([key,cfg])=>(
                  <button key={key} onClick={()=>setForm(f=>({...f,type:key}))}
                    style={{ flex:1, padding:"8px", borderRadius:"8px", cursor:"pointer",
                      border:`1.5px solid ${form.type===key ? cfg.border : "#E5E7EB"}`,
                      background: form.type===key ? cfg.bg : "white",
                      color: form.type===key ? cfg.text : "#6B7280",
                      fontSize:"12px", fontWeight:700, fontFamily:"inherit",
                      transition:"all 0.15s" }}>
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom:"12px" }}>
              <label style={{ display:"block", fontSize:"12px", fontWeight:700,
                color:"#374151", marginBottom:"5px" }}>
                Title <span style={{ color:"#B00804" }}>*</span>
              </label>
              <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
                placeholder="e.g. Registration opens Dec 1"
                style={{ width:"100%", padding:"9px 12px", borderRadius:"8px",
                  border:"1.5px solid #E5E7EB", fontSize:"13px", outline:"none",
                  fontFamily:"inherit", boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor="#B00804"}
                onBlur={e=>e.target.style.borderColor="#E5E7EB"}
              />
            </div>

            {/* Body */}
            <div style={{ marginBottom:"12px" }}>
              <label style={{ display:"block", fontSize:"12px", fontWeight:700,
                color:"#374151", marginBottom:"5px" }}>Body text
                <span style={{ fontSize:"11px", color:"#9CA3AF", fontWeight:400,
                  marginLeft:"6px" }}>optional</span>
              </label>
              <textarea value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))}
                placeholder="Short description shown after the title"
                rows={2}
                style={{ width:"100%", padding:"9px 12px", borderRadius:"8px",
                  border:"1.5px solid #E5E7EB", fontSize:"13px", outline:"none",
                  fontFamily:"inherit", resize:"vertical", boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor="#B00804"}
                onBlur={e=>e.target.style.borderColor="#E5E7EB"}
              />
            </div>

            {/* Link URL */}
            <div style={{ marginBottom:"12px" }}>
              <label style={{ display:"block", fontSize:"12px", fontWeight:700,
                color:"#374151", marginBottom:"5px" }}>Link URL
                <span style={{ fontSize:"11px", color:"#9CA3AF", fontWeight:400,
                  marginLeft:"6px" }}>shows a button on the banner if filled</span>
              </label>
              <input value={form.link_url} onChange={e=>setForm(f=>({...f,link_url:e.target.value}))}
                placeholder="https://forms.gle/..."
                style={{ width:"100%", padding:"9px 12px", borderRadius:"8px",
                  border:"1.5px solid #E5E7EB", fontSize:"13px", outline:"none",
                  fontFamily:"inherit", boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor="#B00804"}
                onBlur={e=>e.target.style.borderColor="#E5E7EB"}
              />
            </div>

            {/* Dates */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"16px" }}>
              <div>
                <label style={{ display:"block", fontSize:"12px", fontWeight:700,
                  color:"#374151", marginBottom:"5px" }}>Start date
                  <span style={{ fontSize:"11px", color:"#9CA3AF", fontWeight:400,
                    marginLeft:"4px" }}>(blank = now)</span>
                </label>
                <input type="datetime-local" value={form.starts_at}
                  onChange={e=>setForm(f=>({...f,starts_at:e.target.value}))}
                  style={{ width:"100%", padding:"9px 12px", borderRadius:"8px",
                    border:"1.5px solid #E5E7EB", fontSize:"12px", outline:"none",
                    fontFamily:"inherit", boxSizing:"border-box" }}
                />
              </div>
              <div>
                <label style={{ display:"block", fontSize:"12px", fontWeight:700,
                  color:"#374151", marginBottom:"5px" }}>Expiry date
                  <span style={{ fontSize:"11px", color:"#9CA3AF", fontWeight:400,
                    marginLeft:"4px" }}>(blank = forever)</span>
                </label>
                <input type="datetime-local" value={form.ends_at}
                  onChange={e=>setForm(f=>({...f,ends_at:e.target.value}))}
                  style={{ width:"100%", padding:"9px 12px", borderRadius:"8px",
                    border:"1.5px solid #E5E7EB", fontSize:"12px", outline:"none",
                    fontFamily:"inherit", boxSizing:"border-box" }}
                />
              </div>
            </div>

            {/* Visible toggle */}
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"20px" }}>
              <div onClick={()=>setForm(f=>({...f,visible:!f.visible}))}
                style={{ width:"36px", height:"20px", borderRadius:"999px",
                  background: form.visible ? "#22C55E" : "#D1D5DB",
                  cursor:"pointer", position:"relative", transition:"background 0.2s",
                  flexShrink:0 }}>
                <div style={{ position:"absolute", width:"16px", height:"16px",
                  borderRadius:"50%", background:"white", top:"2px",
                  left: form.visible ? "18px" : "2px", transition:"left 0.2s" }}/>
              </div>
              <span style={{ fontSize:"13px", color:"#374151" }}>
                {form.visible ? "Visible to students" : "Hidden from students"}
              </span>
            </div>

            {/* Actions */}
            <div style={{ display:"flex", gap:"10px" }}>
              <button onClick={saveForm} disabled={saving||!form.title.trim()}
                style={{ flex:1, background: (saving||!form.title.trim())?"#D1D5DB":"#B00804",
                  color:"white", border:"none", borderRadius:"9px", padding:"10px",
                  fontSize:"13px", fontWeight:700, cursor:(saving||!form.title.trim())?"not-allowed":"pointer",
                  fontFamily:"inherit" }}>
                {saving ? "Saving…" : editItem ? "Save changes" : "Publish"}
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

      {/* Toast */}
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
