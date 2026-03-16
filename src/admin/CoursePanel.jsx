import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase.js";

const DEPTS = ["All","English","Mathematics","Social Studies","Science",
  "Health & PE","CTE","World Language","Fine Arts","Miscellaneous","Off Campus"];

const DEPT_COLORS = {
  "English":"#C84B31","Mathematics":"#059669","Social Studies":"#7C3AED",
  "Science":"#D97706","Health & PE":"#0891B2","CTE":"#B00804",
  "World Language":"#0284C7","Fine Arts":"#DB2777",
  "Miscellaneous":"#6B7280","Off Campus":"#475569",
};

const GRAD_CATEGORIES = ["english","ss","math","science","wlfa","pe","health","ptp","electives"];
const CTE_PATHS       = ["AFNR","Business","Arts & Media","Engineering","Health Services","Culinary Arts","Computer Science","JROTC"];
const FINE_ARTS_TYPES = ["Performing","Visual"];
const MISC_TYPES      = ["General","Journalism","ESOL"];

const EMPTY_FORM = {
  id:"", code:"", name:"", subtitle:"", dept:"English",
  cte_path:"", fine_arts_type:"", misc_type:"",
  credits:1.0, grade_level:[9,10,11,12],
  prereqs:[], concurrent_ok:[],
  grad_category:"electives", grad_credits:1.0,
  is_ap:false, repeatable:false, teacher_sig_required:false,
  is_off_campus:false, desc:"", tips:"", grade_reqs:{}, archived:false,
};

function Tag({ label, color, onRemove }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:"4px",
      background: color+"18", border:`1px solid ${color}40`,
      color, borderRadius:"5px", padding:"2px 8px", fontSize:"12px", fontWeight:600 }}>
      {label}
      {onRemove && (
        <span onClick={onRemove} style={{ cursor:"pointer", opacity:0.7,
          fontSize:"11px", lineHeight:1 }}>×</span>
      )}
    </span>
  );
}

function ArrayInput({ value, onChange, placeholder }) {
  const [input, setInput] = useState("");
  function add() {
    const v = input.trim();
    if (v && !value.includes(v)) { onChange([...value, v]); }
    setInput("");
  }
  return (
    <div>
      <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"6px" }}>
        {value.map(v => (
          <Tag key={v} label={v} color="#6B7280"
            onRemove={()=>onChange(value.filter(x=>x!==v))} />
        ))}
      </div>
      <div style={{ display:"flex", gap:"6px" }}>
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter"){ e.preventDefault(); add(); } }}
          placeholder={placeholder}
          style={{ flex:1, padding:"7px 10px", borderRadius:"7px",
            border:"1.5px solid #E5E7EB", fontSize:"12px", outline:"none",
            fontFamily:"inherit" }}
          onFocus={e=>e.target.style.borderColor="#B00804"}
          onBlur={e=>e.target.style.borderColor="#E5E7EB"}
        />
        <button onClick={add} type="button"
          style={{ padding:"7px 12px", background:"#F3F4F6", border:"1px solid #E5E7EB",
            borderRadius:"7px", fontSize:"12px", cursor:"pointer", fontFamily:"inherit" }}>
          Add
        </button>
      </div>
    </div>
  );
}

function GradeSelector({ value, onChange }) {
  return (
    <div style={{ display:"flex", gap:"6px" }}>
      {[9,10,11,12].map(g => (
        <div key={g} onClick={()=>{
          if(value.includes(g)) onChange(value.filter(x=>x!==g));
          else onChange([...value,g].sort());
        }}
        style={{ width:"40px", height:"36px", borderRadius:"7px", cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"13px", fontWeight:700, transition:"all 0.15s",
          background: value.includes(g) ? "#B00804" : "#F3F4F6",
          color: value.includes(g) ? "white" : "#6B7280",
          border: `1.5px solid ${value.includes(g) ? "#B00804" : "#E5E7EB"}` }}>
          {g}
        </div>
      ))}
    </div>
  );
}

export default function CoursePanel() {
  const [courses, setCourses]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [showForm, setShowForm]     = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState("");
  const [showImport, setShowImport] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [importing, setImporting]   = useState(false);
  const fileRef = useRef();

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  async function fetchCourses() {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses").select("*").order("dept").order("name");
    if (!error && data) setCourses(data);
    setLoading(false);
  }

  const filtered = courses.filter(c => {
    if (c.archived) return false;
    if (filterDept !== "All" && c.dept !== filterDept) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) ||
        (c.id||"").toLowerCase().includes(q) ||
        (c.code||"").toLowerCase().includes(q);
    }
    return true;
  });

  function openNew() {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(course) {
    setEditItem(course);
    setForm({
      id:                  course.id || "",
      code:                course.code || "",
      name:                course.name || "",
      subtitle:            course.subtitle || "",
      dept:                course.dept || "English",
      cte_path:            course.cte_path || "",
      fine_arts_type:      course.fine_arts_type || "",
      misc_type:           course.misc_type || "",
      credits:             course.credits ?? 1.0,
      grade_level:         course.grade_level || [9,10,11,12],
      prereqs:             course.prereqs || [],
      concurrent_ok:       course.concurrent_ok || [],
      grad_category:       course.grad_category || "electives",
      grad_credits:        course.grad_credits ?? 1.0,
      is_ap:               course.is_ap || false,
      repeatable:          course.repeatable || false,
      teacher_sig_required:course.teacher_sig_required || false,
      is_off_campus:       course.is_off_campus || false,
      desc:                course.desc || "",
      tips:                course.tips || "",
      grade_reqs:          course.grade_reqs || {},
      archived:            course.archived || false,
    });
    setShowForm(true);
  }

  async function saveCourse() {
    if (!form.id.trim() || !form.name.trim()) return;
    setSaving(true);
    const payload = { ...form };

    let error;
    if (editItem) {
      ({ error } = await supabase.from("courses").update(payload).eq("id", editItem.id));
    } else {
      ({ error } = await supabase.from("courses").insert(payload));
    }
    setSaving(false);
    if (error) { setToast("❌ " + error.message); return; }
    setToast(editItem ? "✅ Course updated" : "✅ Course added");
    setShowForm(false);
    fetchCourses();
  }

  async function archiveCourse(course) {
    if (!window.confirm(`Archive "${course.name}"? It won't appear on the site.`)) return;
    await supabase.from("courses").update({ archived: true }).eq("id", course.id);
    setToast("🗄 Archived");
    fetchCourses();
  }

  // CSV Import
  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g,""));
      const rows = lines.slice(1).map(line => {
        const vals = line.match(/(".*?"|[^,]+)(?=,|$)/g) || [];
        const obj = {};
        headers.forEach((h,i) => {
          obj[h] = (vals[i]||"").trim().replace(/^"|"$/g,"");
        });
        return obj;
      }).filter(r => r.id && r.name);
      setImportPreview(rows.slice(0,5));
      setShowImport(true);
    };
    reader.readAsText(file);
  }

  async function confirmImport() {
    const file = fileRef.current.files[0];
    if (!file) return;
    setImporting(true);
    const text = await file.text();
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g,""));

    function parseArr(val) {
      if (!val) return [];
      const clean = val.replace(/^\{|\}$/g,"").trim();
      if (!clean) return [];
      return clean.split(",").map(s => {
        const t = s.trim().replace(/^"|"$/g,"");
        const n = parseInt(t);
        return isNaN(n) ? t : n;
      });
    }

    const rows = lines.slice(1).map(line => {
      const vals = line.match(/(".*?"|[^,\n]+)(?=,|$)/g) || [];
      const obj = {};
      headers.forEach((h,i) => { obj[h] = (vals[i]||"").trim().replace(/^"|"$/g,""); });
      return obj;
    }).filter(r => r.id && r.name).map(r => ({
      id: r.id, code: r.code||"", name: r.name, subtitle: r.subtitle||"",
      dept: r.dept, cte_path: r.cte_path||null, fine_arts_type: r.fine_arts_type||null,
      misc_type: r.misc_type||null, credits: parseFloat(r.credits)||1,
      grade_level: parseArr(r.grade_level),
      prereqs: parseArr(r.prereqs), concurrent_ok: parseArr(r.concurrent_ok),
      grad_category: r.grad_category||null, grad_credits: parseFloat(r.grad_credits)||null,
      is_ap: r.is_ap==="true", repeatable: r.repeatable==="true",
      teacher_sig_required: r.teacher_sig_required==="true",
      is_off_campus: r.is_off_campus==="true",
      desc: r.desc||"", tips: r.tips||"",
      grade_reqs: (() => { try { return JSON.parse(r.grade_reqs||"{}"); } catch { return {}; } })(),
      archived: false,
    }));

    const { error } = await supabase.from("courses").upsert(rows, { onConflict:"id" });
    setImporting(false);
    if (error) { setToast("❌ Import failed: " + error.message); return; }
    setToast(`✅ Imported ${rows.length} courses`);
    setShowImport(false);
    fileRef.current.value = "";
    fetchCourses();
  }

  function F({ k }) {
    return (
      <div style={{ marginBottom:"12px" }}>
        {/* label injected by parent */}
        {arguments[0].children}
      </div>
    );
  }

  function label(text, hint) {
    return (
      <div style={{ marginBottom:"5px" }}>
        <span style={{ fontSize:"12px", fontWeight:700, color:"#374151" }}>{text}</span>
        {hint && <span style={{ fontSize:"11px", color:"#9CA3AF", marginLeft:"6px" }}>{hint}</span>}
      </div>
    );
  }

  const inp = {
    style:{ width:"100%", padding:"8px 11px", borderRadius:"7px",
      border:"1.5px solid #E5E7EB", fontSize:"13px", outline:"none",
      fontFamily:"inherit", boxSizing:"border-box" },
    onFocus:e=>e.target.style.borderColor="#B00804",
    onBlur:e=>e.target.style.borderColor="#E5E7EB",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"flex-start", marginBottom:"20px" }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px",
            color:"#111827", marginBottom:"4px" }}>Courses</h2>
          <p style={{ fontSize:"13px", color:"#6B7280" }}>
            {courses.filter(c=>!c.archived).length} active courses · 2026–27 catalog
          </p>
        </div>
        <div style={{ display:"flex", gap:"8px" }}>
          <label style={{ background:"white", border:"1.5px solid #E5E7EB",
            borderRadius:"9px", padding:"8px 14px", fontSize:"13px", fontWeight:700,
            cursor:"pointer", color:"#374151", display:"flex", alignItems:"center", gap:"6px" }}>
            📥 Import CSV
            <input type="file" accept=".csv" ref={fileRef}
              onChange={handleFileChange} style={{ display:"none" }} />
          </label>
          <button onClick={openNew}
            style={{ background:"#B00804", color:"white", border:"none",
              borderRadius:"9px", padding:"9px 18px", fontSize:"13px",
              fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
            + Add course
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
        gap:"10px", marginBottom:"20px" }}>
        {[
          ["Total active", courses.filter(c=>!c.archived).length, "#B00804"],
          ["AP courses",   courses.filter(c=>c.is_ap&&!c.archived).length, "#7C3AED"],
          ["CTE courses",  courses.filter(c=>c.dept==="CTE"&&!c.archived).length, "#B00804"],
          ["Archived",     courses.filter(c=>c.archived).length, "#6B7280"],
        ].map(([label,val,color])=>(
          <div key={label} style={{ background:"white", border:"1px solid #E5E7EB",
            borderRadius:"10px", padding:"12px 14px" }}>
            <div style={{ fontSize:"24px", fontWeight:700, color }}>{val}</div>
            <div style={{ fontSize:"12px", color:"#6B7280", marginTop:"2px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:"10px", marginBottom:"16px", flexWrap:"wrap" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="🔍 Search by name, ID, or code…"
          style={{ flex:"1 1 200px", padding:"9px 13px", borderRadius:"8px",
            border:"1.5px solid #E5E7EB", fontSize:"13px", outline:"none",
            fontFamily:"inherit", minWidth:"200px" }}
          onFocus={e=>e.target.style.borderColor="#B00804"}
          onBlur={e=>e.target.style.borderColor="#E5E7EB"}
        />
        <select value={filterDept} onChange={e=>setFilterDept(e.target.value)}
          style={{ padding:"9px 13px", borderRadius:"8px",
            border:"1.5px solid #E5E7EB", fontSize:"13px", outline:"none",
            fontFamily:"inherit", background:"white", cursor:"pointer" }}>
          {DEPTS.map(d=><option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Course list */}
      <div style={{ background:"white", border:"1px solid #E5E7EB",
        borderRadius:"12px", overflow:"hidden" }}>
        {loading ? (
          <div style={{ padding:"40px", textAlign:"center", color:"#9CA3AF" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:"40px", textAlign:"center", color:"#9CA3AF" }}>
            No courses found
          </div>
        ) : (
          <>
            {/* Table header */}
            <div style={{ display:"grid", gridTemplateColumns:"3fr 1.5fr 80px 80px 80px 80px",
              padding:"10px 16px", background:"#F9FAFB",
              borderBottom:"1px solid #E5E7EB", fontSize:"11px",
              fontWeight:700, color:"#6B7280", letterSpacing:"0.04em" }}>
              <span>COURSE</span><span>DEPT</span><span>CREDITS</span>
              <span>GRADES</span><span>AP</span><span></span>
            </div>
            {filtered.map(c => {
              const col = DEPT_COLORS[c.dept] || "#6B7280";
              return (
                <div key={c.id}
                  style={{ display:"grid",
                    gridTemplateColumns:"3fr 1.5fr 80px 80px 80px 80px",
                    padding:"11px 16px", borderBottom:"1px solid #F3F4F6",
                    alignItems:"center", transition:"background 0.1s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="#FAFAFA"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div>
                    <div style={{ fontSize:"13px", fontWeight:600, color:"#111827",
                      display:"flex", alignItems:"center", gap:"6px" }}>
                      {c.name}
                      {c.is_ap && <span style={{ background:"#FEF3C7", color:"#92400E",
                        fontSize:"10px", fontWeight:800, padding:"1px 6px",
                        borderRadius:"4px" }}>AP</span>}
                    </div>
                    <div style={{ fontSize:"11px", color:"#9CA3AF", marginTop:"1px" }}>
                      {c.id} · {c.code||"—"}
                    </div>
                  </div>
                  <span style={{ background:col+"18", color:col,
                    borderRadius:"5px", padding:"2px 8px",
                    fontSize:"11px", fontWeight:700 }}>
                    {c.cte_path || c.fine_arts_type || c.misc_type || c.dept}
                  </span>
                  <span style={{ fontSize:"13px", color:"#374151" }}>{c.credits}cr</span>
                  <span style={{ fontSize:"12px", color:"#6B7280" }}>
                    {(c.grade_level||[]).join("/")}
                  </span>
                  <span style={{ fontSize:"13px" }}>{c.is_ap ? "✅" : "—"}</span>
                  <div style={{ display:"flex", gap:"6px", justifyContent:"flex-end" }}>
                    <button onClick={()=>openEdit(c)}
                      style={{ background:"#F3F4F6", border:"none", borderRadius:"6px",
                        padding:"5px 10px", fontSize:"12px", cursor:"pointer",
                        color:"#374151", fontFamily:"inherit" }}>
                      Edit
                    </button>
                    <button onClick={()=>archiveCourse(c)}
                      title="Archive"
                      style={{ background:"transparent", border:"none", borderRadius:"6px",
                        padding:"5px 7px", fontSize:"13px", cursor:"pointer",
                        color:"#9CA3AF", fontFamily:"inherit" }}>
                      🗄
                    </button>
                  </div>
                </div>
              );
            })}
            <div style={{ padding:"12px 16px", fontSize:"12px", color:"#9CA3AF",
              textAlign:"center", borderTop:"1px solid #F3F4F6" }}>
              Showing {filtered.length} of {courses.filter(c=>!c.archived).length} courses
            </div>
          </>
        )}
      </div>

      {/* CSV Import Preview Modal */}
      {showImport && (
        <div style={{ position:"fixed", inset:0, background:"rgba(17,24,39,0.55)",
          display:"flex", alignItems:"center", justifyContent:"center",
          zIndex:1000, padding:"20px", backdropFilter:"blur(4px)" }}
          onClick={()=>setShowImport(false)}>
          <div style={{ background:"white", borderRadius:"16px", padding:"28px",
            width:"100%", maxWidth:"560px", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={e=>e.stopPropagation()}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px",
              color:"#111827", marginBottom:"6px" }}>Import CSV preview</h3>
            <p style={{ fontSize:"13px", color:"#6B7280", marginBottom:"16px" }}>
              First 5 rows shown. Existing courses with matching IDs will be updated (upsert).
            </p>
            <div style={{ overflowX:"auto", marginBottom:"20px" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"12px" }}>
                <thead>
                  <tr style={{ background:"#F9FAFB" }}>
                    {["id","name","dept","credits","grade_level"].map(h=>(
                      <th key={h} style={{ padding:"8px 10px", textAlign:"left",
                        borderBottom:"1px solid #E5E7EB", color:"#6B7280",
                        fontWeight:700, whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {importPreview.map((row,i)=>(
                    <tr key={i} style={{ borderBottom:"1px solid #F3F4F6" }}>
                      {["id","name","dept","credits","grade_level"].map(h=>(
                        <td key={h} style={{ padding:"8px 10px", color:"#374151",
                          maxWidth:"140px", overflow:"hidden",
                          textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {row[h]||"—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display:"flex", gap:"10px" }}>
              <button onClick={confirmImport} disabled={importing}
                style={{ flex:1, background: importing?"#D1D5DB":"#B00804",
                  color:"white", border:"none", borderRadius:"9px", padding:"10px",
                  fontSize:"13px", fontWeight:700, cursor:importing?"not-allowed":"pointer",
                  fontFamily:"inherit" }}>
                {importing ? "Importing…" : "Confirm import"}
              </button>
              <button onClick={()=>setShowImport(false)}
                style={{ padding:"10px 18px", background:"white", color:"#6B7280",
                  border:"1.5px solid #E5E7EB", borderRadius:"9px", fontSize:"13px",
                  cursor:"pointer", fontFamily:"inherit" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Course Form Modal */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(17,24,39,0.55)",
          display:"flex", alignItems:"center", justifyContent:"center",
          zIndex:1000, padding:"20px", backdropFilter:"blur(4px)" }}
          onClick={()=>setShowForm(false)}>
          <div style={{ background:"white", borderRadius:"16px", padding:"28px",
            width:"100%", maxWidth:"620px", maxHeight:"90vh", overflowY:"auto",
            boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={e=>e.stopPropagation()}>

            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", marginBottom:"20px" }}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px",
                color:"#111827" }}>{editItem ? "Edit course" : "Add course"}</h3>
              <button onClick={()=>setShowForm(false)}
                style={{ background:"none", border:"none", fontSize:"18px",
                  cursor:"pointer", color:"#9CA3AF" }}>✕</button>
            </div>

            {/* ID + Code */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
              <div>
                {label("Course ID *", "e.g. AP_CALC")}
                <input value={form.id} onChange={e=>setForm(f=>({...f,id:e.target.value.toUpperCase()}))}
                  placeholder="AP_CALC" {...inp}
                  style={{...inp.style}} disabled={!!editItem}
                  onFocus={inp.onFocus} onBlur={inp.onBlur}
                />
              </div>
              <div>
                {label("Course code", "e.g. MCA1040")}
                <input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value}))}
                  placeholder="MCA1040" {...inp}
                  style={{...inp.style}} onFocus={inp.onFocus} onBlur={inp.onBlur}
                />
              </div>
            </div>

            {/* Name + Subtitle */}
            <div style={{ marginBottom:"12px" }}>
              {label("Course name *")}
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                placeholder="e.g. AP Calculus" {...inp}
                style={{...inp.style}} onFocus={inp.onFocus} onBlur={inp.onBlur}
              />
            </div>
            <div style={{ marginBottom:"12px" }}>
              {label("Subtitle", "for AP courses — shows below the name")}
              <input value={form.subtitle} onChange={e=>setForm(f=>({...f,subtitle:e.target.value}))}
                placeholder="e.g. AP Calculus AB" {...inp}
                style={{...inp.style}} onFocus={inp.onFocus} onBlur={inp.onBlur}
              />
            </div>

            {/* Dept + Credits */}
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:"12px", marginBottom:"12px" }}>
              <div>
                {label("Department *")}
                <select value={form.dept}
                  onChange={e=>setForm(f=>({...f,
                    dept:e.target.value,
                    cte_path:"", fine_arts_type:"", misc_type:""
                  }))}
                  style={{...inp.style, cursor:"pointer", background:"white"}}
                  onFocus={inp.onFocus} onBlur={inp.onBlur}>
                  {DEPTS.filter(d=>d!=="All").map(d=><option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                {label("Credits *")}
                <select value={form.credits} onChange={e=>setForm(f=>({...f,credits:parseFloat(e.target.value)}))}
                  style={{...inp.style, cursor:"pointer", background:"white"}}
                  onFocus={inp.onFocus} onBlur={inp.onBlur}>
                  <option value={0.5}>0.5 (semester)</option>
                  <option value={1.0}>1.0 (year)</option>
                </select>
              </div>
            </div>

            {/* Sub-type selector — shown only for CTE / Fine Arts / Miscellaneous */}
            {form.dept === "CTE" && (
              <div style={{ marginBottom:"12px" }}>
                {label("CTE Pathway *")}
                <select value={form.cte_path}
                  onChange={e=>setForm(f=>({...f,cte_path:e.target.value}))}
                  style={{...inp.style, cursor:"pointer", background:"white"}}
                  onFocus={inp.onFocus} onBlur={inp.onBlur}>
                  <option value="">— Select pathway —</option>
                  {CTE_PATHS.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            )}
            {form.dept === "Fine Arts" && (
              <div style={{ marginBottom:"12px" }}>
                {label("Fine Arts Type *")}
                <div style={{ display:"flex", gap:"8px" }}>
                  {FINE_ARTS_TYPES.map(t=>(
                    <div key={t} onClick={()=>setForm(f=>({...f,fine_arts_type:t}))}
                      style={{ flex:1, padding:"9px", borderRadius:"8px", cursor:"pointer",
                        textAlign:"center", fontSize:"13px", fontWeight:600,
                        transition:"all 0.15s", userSelect:"none",
                        border:`1.5px solid ${form.fine_arts_type===t?"#DB2777":"#E5E7EB"}`,
                        background:form.fine_arts_type===t?"#FDF2F8":"white",
                        color:form.fine_arts_type===t?"#DB2777":"#6B7280" }}>
                      {t === "Performing" ? "🎭 Performing" : "🎨 Visual"}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {form.dept === "Miscellaneous" && (
              <div style={{ marginBottom:"12px" }}>
                {label("Miscellaneous Type *")}
                <div style={{ display:"flex", gap:"8px" }}>
                  {MISC_TYPES.map(t=>(
                    <div key={t} onClick={()=>setForm(f=>({...f,misc_type:t}))}
                      style={{ flex:1, padding:"9px", borderRadius:"8px", cursor:"pointer",
                        textAlign:"center", fontSize:"13px", fontWeight:600,
                        transition:"all 0.15s", userSelect:"none",
                        border:`1.5px solid ${form.misc_type===t?"#6B7280":"#E5E7EB"}`,
                        background:form.misc_type===t?"#F9FAFB":"white",
                        color:form.misc_type===t?"#374151":"#6B7280" }}>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grade levels */}
            <div style={{ marginBottom:"12px" }}>
              {label("Grade levels *")}
              <GradeSelector value={form.grade_level}
                onChange={v=>setForm(f=>({...f,grade_level:v}))} />
            </div>

            {/* Prereqs + Concurrent */}
            <div style={{ marginBottom:"12px" }}>
              {label("Prerequisites", "course IDs — press Enter to add each")}
              <ArrayInput value={form.prereqs}
                onChange={v=>setForm(f=>({...f,prereqs:v}))}
                placeholder="e.g. ALG2" />
            </div>
            <div style={{ marginBottom:"12px" }}>
              {label("Concurrent OK", "can be taken same year")}
              <ArrayInput value={form.concurrent_ok}
                onChange={v=>setForm(f=>({...f,concurrent_ok:v}))}
                placeholder="e.g. TRIG" />
            </div>

            {/* Grad category */}
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:"12px", marginBottom:"12px" }}>
              <div>
                {label("Graduation category")}
                <select value={form.grad_category||""}
                  onChange={e=>setForm(f=>({...f,grad_category:e.target.value||null}))}
                  style={{...inp.style, cursor:"pointer", background:"white"}}
                  onFocus={inp.onFocus} onBlur={inp.onBlur}>
                  <option value="">None</option>
                  {GRAD_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                {label("Grad credits")}
                <input type="number" step="0.5" min="0" max="2"
                  value={form.grad_credits||""}
                  onChange={e=>setForm(f=>({...f,grad_credits:parseFloat(e.target.value)||null}))}
                  {...inp} style={{...inp.style}}
                  onFocus={inp.onFocus} onBlur={inp.onBlur}
                />
              </div>
            </div>

            {/* Flags */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"10px", marginBottom:"16px" }}>
              {[
                ["is_ap","AP course"],
                ["repeatable","Repeatable"],
                ["teacher_sig_required","Teacher sig. required"],
                ["is_off_campus","Off campus"],
              ].map(([key,lbl])=>(
                <div key={key} onClick={()=>setForm(f=>({...f,[key]:!f[key]}))}
                  style={{ display:"flex", alignItems:"center", gap:"7px",
                    padding:"7px 12px", borderRadius:"8px", cursor:"pointer",
                    border:`1.5px solid ${form[key]?"#B00804":"#E5E7EB"}`,
                    background: form[key]?"#FFF1F0":"white",
                    color: form[key]?"#B00804":"#6B7280",
                    fontSize:"12px", fontWeight:600, userSelect:"none",
                    transition:"all 0.15s" }}>
                  <span style={{ width:"14px", height:"14px", borderRadius:"3px",
                    background: form[key]?"#B00804":"transparent",
                    border:`1.5px solid ${form[key]?"#B00804":"#D1D5DB"}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"10px", color:"white", flexShrink:0 }}>
                    {form[key]?"✓":""}
                  </span>
                  {lbl}
                </div>
              ))}
            </div>

            {/* Description + Tips */}
            <div style={{ marginBottom:"12px" }}>
              {label("Description")}
              <textarea value={form.desc} rows={3}
                onChange={e=>setForm(f=>({...f,desc:e.target.value}))}
                placeholder="Full course description shown in the modal…"
                style={{...inp.style, resize:"vertical"}}
                onFocus={inp.onFocus} onBlur={inp.onBlur}
              />
            </div>
            <div style={{ marginBottom:"20px" }}>
              {label("Tips")}
              <textarea value={form.tips} rows={2}
                onChange={e=>setForm(f=>({...f,tips:e.target.value}))}
                placeholder="Helpful tip shown in the blue tip box…"
                style={{...inp.style, resize:"vertical"}}
                onFocus={inp.onFocus} onBlur={inp.onBlur}
              />
            </div>

            {/* Save */}
            <div style={{ display:"flex", gap:"10px" }}>
              <button onClick={saveCourse}
                disabled={saving||!form.id.trim()||!form.name.trim()}
                style={{ flex:1,
                  background:(saving||!form.id.trim()||!form.name.trim())?"#D1D5DB":"#B00804",
                  color:"white", border:"none", borderRadius:"9px", padding:"10px",
                  fontSize:"13px", fontWeight:700,
                  cursor:(saving||!form.id.trim()||!form.name.trim())?"not-allowed":"pointer",
                  fontFamily:"inherit" }}>
                {saving?"Saving…":editItem?"Save changes":"Add course"}
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
