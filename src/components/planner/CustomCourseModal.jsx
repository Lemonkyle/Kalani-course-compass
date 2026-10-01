import { buildExternalCourse, EXTERNAL_CATEGORIES } from "../../lib/externalCourses.js";
import { GRADE_MAX, gradeSlots } from "../../lib/plannerRules.js";
import { CTE_PATHS } from "../../data/constants.js";

export function CustomCourseModal({ context }) {
  const {plan, getCourse, customCourses, setCustomCourses, showCustomModal, setShowCustomModal,
    customForm:f, setCustomForm, customGradeTarget, setCustomGradeTarget, editingExternalId,
    addCourseEntry, showToast} = context;
  if (!showCustomModal) return null;
  const change = (key, value) => setCustomForm(old => ({...old, [key]:value, ...(key !== 'confirmed' ? {confirmed:false} : {})}));
  function save(event) {
    event.preventDefault();
    try {
      const course = buildExternalCourse(f, editingExternalId || 'CUSTOM_' + crypto.randomUUID());
      if (editingExternalId) {
        for (const [grade, ids] of Object.entries(plan)) {
          if (ids.includes(editingExternalId) && gradeSlots(plan, grade, id => id === editingExternalId ? course : getCourse(id)) > GRADE_MAX)
            throw new Error(`Grade ${grade} does not have enough room for these confirmed credits.`);
        }
        setCustomCourses(old => old.map(c => c.id === editingExternalId ? {...course, legacyOriginal:c.legacyOriginal} : c));
      } else {
        if (plan[customGradeTarget].length >= 100) throw new Error('This grade has too many entries. Remove an unused entry first.');
        if (!addCourseEntry(customGradeTarget, course.id, course)) return;
        setCustomCourses(old => [...old, course]);
      }
      setShowCustomModal(false);
      showToast(course.verification === 'confirmed' ? 'Saved your credit confirmation' : 'Saved as unverified — credits not counted');
    } catch (error) { showToast(error.message); }
  }
  const field = (label,key,props={}) => <label style={{display:'grid',gap:5}}>{label}<input className="si" value={f[key] || ''} onChange={e=>change(key,e.target.value)} maxLength={200} {...props}/></label>;
  return <div className="overlay" onClick={()=>setShowCustomModal(false)}>
    <section role="dialog" aria-modal="true" aria-labelledby="external-title" className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:560,padding:24,maxHeight:'90vh',overflowY:'auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:20}}><h2 id="external-title">{editingExternalId ? 'Review' : 'Add'} External Course</h2><button aria-label="Close external course" onClick={()=>setShowCustomModal(false)}>✕</button></div>
      <p style={{fontSize:13,lineHeight:1.6,margin:'12px 0'}}>Record a course you are considering. You can save it before you know its high-school credits. This does not register you for a class.</p>
      {customCourses.find(c=>c.id===editingExternalId)?.legacyOriginal && <p style={{color:'#92400E'}}>Your previous custom entry was preserved. Please review its high-school credits before counting them.</p>}
      <form onSubmit={save} style={{display:'grid',gap:14,fontSize:13}}>
        <label>Program source<select className="si" style={{width:'100%'}} value={f.source} onChange={e=>change('source',e.target.value)}>{['HOC','Dual Credit','Other / Transfer'].map(s=><option key={s}>{s}</option>)}</select></label>
        {field('Course name','name',{required:true,maxLength:100})}
        {field('Program / college (optional)','program')}
        {field('Course code (optional)','code')}
        {field('Information link (optional)','url',{type:'url',maxLength:1000})}
        <label>Notes / questions for your counselor (optional)<textarea className="si" style={{width:'100%'}} maxLength={2000} value={f.notes} onChange={e=>change('notes',e.target.value)}/></label>
        {!editingExternalId && <label>Add to grade<select className="si" value={customGradeTarget} onChange={e=>setCustomGradeTarget(Number(e.target.value))}>{[9,10,11,12].map(g=><option key={g} value={g}>Grade {g}</option>)}</select></label>}
        <fieldset style={{border:'1px solid #CBD5E1',borderRadius:10,padding:14,display:'grid',gap:12}}>
          <legend>High-school credit confirmation</legend>
          <p>Leave these blank if unknown. Draft values do not count until you check the confirmation below. College credits are not automatically equivalent to high-school credits.</p>
          <label>High-school category<select className="si" style={{width:'100%'}} value={f.category} onChange={e=>change('category',e.target.value)}><option value="">Unknown / not confirmed</option>{Object.keys(EXTERNAL_CATEGORIES).map(k=><option key={k}>{k}</option>)}</select></label>
          {field('High-school credits','credits',{type:'number',min:0,max:14,step:'any',placeholder:'Unknown'})}
          {f.category==='World Language' && field('Confirmed language','language')}
          {f.category==='CTE' && <label>Confirmed pathway<select className="si" value={f.ctePath} onChange={e=>change('ctePath',e.target.value)}><option value="">Choose pathway</option>{CTE_PATHS.filter(p=>p!=='All CTE').map(p=><option key={p}>{p}</option>)}</select></label>}
          <label style={{display:'flex',alignItems:'start',gap:8}}><input type="checkbox" checked={f.confirmed} onChange={e=>change('confirmed',e.target.checked)}/>I confirmed this course’s high-school credits and category with my counselor or program coordinator.</label>
          <strong style={{color:f.confirmed?'#166534':'#92400E'}}>{f.confirmed?'Confirmed by you — a personal record, not approval issued by this website.':'Unverified — excluded from credit totals and graduation progress.'}</strong>
        </fieldset>
        <p>External courses do not automatically satisfy named prerequisites or Honors rules. Ask your counselor to review those separately. Pending entries also do not reserve schedule space.</p>
        <p>Saved only in this browser. Do not enter student IDs or private personal information.</p>
        <button className="dept-btn active" type="submit"><span>{editingExternalId?'Save changes':`Add to Grade ${customGradeTarget}`} {f.confirmed?'':'as unverified'}</span></button>
      </form>
    </section>
  </div>;
}
