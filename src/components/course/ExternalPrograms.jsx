import { useState } from 'react';
import { motion } from 'framer-motion';
import { isPendingExternal } from '../../lib/externalCourses.js';
import { PlanningHint } from '../planner/PlanningHint.jsx';
const PROGRAM_LINKS = {
  HOC:'https://sites.google.com/k12.hi.us/hoc',
  'Dual Credit':'https://sites.google.com/k12.hi.us/kalanicounselorscorner/dual-credit',
};
export function ExternalPrograms({source,context}) {
  const {openExternalCourse,customCourses,plan,deleteExternalCourse} = context;
  const [deleting,setDeleting] = useState(null);
  const courses = customCourses.filter(c=>c.source===source);
  return <section>
    <motion.article key={source} className="external-program" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}>
      <span className="badge" style={{background:'#B008040D',color:'var(--red)'}}>Explore beyond Kalani</span>
      <h2>{source==='HOC'?'Hawaiʻi Online Courses':'Dual Credit'}</h2>
      <p>{source==='HOC'?'Teacher-led online courses. Register through your School Site Facilitator.':'Earn high-school and college credit through Early College, Running Start, or UH Mānoa Early College Scholars.'}</p>
      <p style={{marginTop:12}}>Course availability, eligibility, and high-school credit equivalency vary. Review the official information and confirm your plan with your counselor or {source==='HOC'?'HOC coordinator':'Dual Credit Coordinator'} before adding a course.</p>
      <div className="external-actions">
        <a className="dept-btn" href={PROGRAM_LINKS[source]} target="_blank" rel="noopener noreferrer"><span>For more information ↗</span></a>
        <motion.button className="dept-btn active" whileTap={{scale:0.94}} onClick={()=>openExternalCourse(source)}><span>＋ Record a course</span></motion.button>
      </div>
    </motion.article>
    <h3 style={{fontSize:17,margin:'28px 0 14px'}}>Your {source} courses</h3>
    {courses.length===0 ? <p style={{fontSize:13,color:'var(--muted)'}}>Courses you add will appear here.</p> :
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,270px),1fr))',gap:14}}>
        {courses.map(c=>{
          const grades=Object.entries(plan).filter(([,ids])=>ids.includes(c.id)).map(([g])=>g);
          return <motion.article key={c.id} className="c-card card-hover-group" style={{cursor:'default'}} initial={{opacity:0,y:15}} animate={{opacity:1,y:0}}>
            <div style={{display:'flex',justifyContent:'space-between',gap:8}}><span className="badge" style={{background:'#EFF6FF',color:'#1D4ED8'}}>{source}</span><span style={{fontSize:12,color:'var(--muted)'}}>{isPendingExternal(c)?'Pending':`${c.credits} HS cr`}</span></div>
            <h4 style={{fontSize:15,margin:'12px 0 6px',overflowWrap:'anywhere'}}>{c.name}</h4>
            <p style={{fontSize:12,color:'var(--muted)'}}>{grades.length?`Grade ${grades.join(' / ')}`:'Not in planner'}{!isPendingExternal(c)?` · ${c.dept}`:''}</p>
            {isPendingExternal(c) && <PlanningHint/>}
            <div style={{display:'flex',gap:8,marginTop:16}}>
              <motion.button className="dept-btn" whileTap={{scale:0.94}} onClick={()=>openExternalCourse(c.source,'',c,Number(grades[0]||9))}><span>{isPendingExternal(c)?'Review / confirm':'Edit course'}</span></motion.button>
              <button className="dept-btn" aria-label={`Delete ${c.name}`} onClick={()=>setDeleting(c.id)}><span>Delete</span></button>
            </div>
            {deleting===c.id && <div style={{marginTop:12,fontSize:12}}><p>Delete this course from your saved courses and planner?</p><div style={{display:'flex',gap:8,marginTop:8}}><button className="dept-btn" onClick={()=>{deleteExternalCourse(c.id);setDeleting(null);}}><span>Delete course</span></button><button className="dept-btn" onClick={()=>setDeleting(null)}><span>Cancel</span></button></div></div>}
          </motion.article>;
        })}
      </div>}
  </section>;
}
