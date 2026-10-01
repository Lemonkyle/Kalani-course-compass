import { AnimatePresence, motion } from "framer-motion";
import { buildExternalCourse, EXTERNAL_CATEGORIES } from "../../lib/externalCourses.js";
import { GRADE_MAX, gradeSlots } from "../../lib/plannerRules.js";
import { CTE_PATHS } from "../../data/constants.js";

export function CustomCourseModal({ context }) {
  const {plan, getCourse, setCustomCourses, showCustomModal, setShowCustomModal,
    customForm:f, setCustomForm, customGradeTarget, setCustomGradeTarget, editingExternalId,
    addCourseEntry, showToast} = context;

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
  return <AnimatePresence>{showCustomModal && <div className="overlay" onClick={()=>setShowCustomModal(false)}>
    <motion.section role="dialog" aria-modal="true" aria-labelledby="external-title" className="modal"
      initial={{opacity:0,scale:0.88,y:24}} animate={{opacity:1,scale:1,y:0,transition:{type:'spring',stiffness:350,damping:22}}}
      exit={{opacity:0,scale:0.92,y:16,transition:{duration:0.18}}}
      onClick={e=>e.stopPropagation()} style={{maxWidth:460,padding:24}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:20,marginBottom:16}}>
        <h2 id="external-title" style={{fontFamily:"'Playfair Display',serif",fontSize:21,color:'var(--red-dark)'}}>{editingExternalId ? 'Edit' : 'Add'} External Course</h2>
        <motion.button whileTap={{scale:0.9}} aria-label="Close external course" onClick={()=>setShowCustomModal(false)} style={{border:0,borderRadius:'50%',width:32,height:32,background:'#FFF1F0',color:'var(--red)',cursor:'pointer'}}>×</motion.button>
      </div>
      <form className="external-form" onSubmit={save} style={{display:'grid',gap:12}}>
        {field('Course name','name',{required:true,maxLength:100,autoFocus:true,placeholder:'Enter course name'})}
        <label>Course source<select className="si" value={f.source} onChange={e=>change('source',e.target.value)}>{['HOC','Dual Credit','Other / Transfer'].map(s=><option key={s}>{s}</option>)}</select></label>
        {!editingExternalId && <label>Add to grade<select className="si" value={customGradeTarget} onChange={e=>setCustomGradeTarget(Number(e.target.value))}>{[9,10,11,12].map(g=><option key={g} value={g}>Grade {g}</option>)}</select></label>}
        <fieldset>
          <legend>High-school credit confirmation</legend>
          <p style={{fontSize:12,color:'var(--muted)'}}>Not sure yet? Leave blank and confirm later.</p>
          <label>High-school category<select className="si" value={f.category} onChange={e=>change('category',e.target.value)}><option value="">Not confirmed</option>{Object.keys(EXTERNAL_CATEGORIES).map(k=><option key={k}>{k}</option>)}</select></label>
          {field('High-school credits','credits',{type:'number',min:0,max:14,step:'any',placeholder:'Not college credits'})}
          {f.category==='World Language' && field('Language','language')}
          {f.category==='CTE' && <label>CTE pathway<select className="si" value={f.ctePath} onChange={e=>change('ctePath',e.target.value)}><option value="">Choose pathway</option>{CTE_PATHS.filter(p=>p!=='All CTE').map(p=><option key={p}>{p}</option>)}</select></label>}
          <label style={{display:'flex',alignItems:'start',gap:8,fontWeight:500,lineHeight:1.5}}><input type="checkbox" checked={f.confirmed} onChange={e=>change('confirmed',e.target.checked)} style={{marginTop:3,accentColor:'var(--red)'}}/>I confirmed these credits and category with my counselor or coordinator.</label>
          <small style={{color:f.confirmed?'#166534':'#92400E'}}>{f.confirmed?'Confirmed by you':'Unverified — not counted yet'}</small>
        </fieldset>
        <motion.button className="dept-btn active" style={{padding:12,fontSize:13}} whileTap={{scale:0.96}} type="submit"><span>{editingExternalId?'Save changes':`Add to Grade ${customGradeTarget}`}</span></motion.button>
      </form>
    </motion.section>
  </div>}</AnimatePresence>;
}
