export function PlanningNotice({ courseName, grade, warnings, onConfirm, onCancel }) {
  if (!warnings?.length) return null;
  return (
    <div role="status" style={{background:"#FFFBEB",border:"1.5px solid #FCD34D",borderRadius:10,padding:"12px 14px",marginBottom:10,color:"#78350F",fontSize:12,lineHeight:1.5}}>
      <div style={{fontWeight:800,marginBottom:6}}>⚠ Planning reminder · Grade {grade}</div>
      {courseName && <div style={{fontWeight:700,marginBottom:6}}>{courseName}</div>}
      {warnings.map((warning, index) => <p key={`${warning.code}-${index}`} style={{margin:"0 0 6px"}}>{warning.message}</p>)}
      <p style={{margin:"0 0 8px"}}>Exceptions are allowed in this planner. You can add the course and review your plan with your counselor.</p>
      {onConfirm && <div style={{display:"flex",gap:8}}>
        <button type="button" onClick={onConfirm} style={{flex:1,background:"#B45309",color:"white",border:"none",borderRadius:7,padding:9,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Add Anyway</button>
        <button type="button" onClick={onCancel} style={{flex:1,background:"white",color:"#374151",border:"1px solid #D1D5DB",borderRadius:7,padding:9,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
      </div>}
    </div>
  );
}
