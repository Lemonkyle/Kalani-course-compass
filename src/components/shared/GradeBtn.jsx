import { getCourseSlots } from "../../lib/courseRules.js";
import { GRADE_MAX } from "../../lib/plannerRules.js";
export function GradeBtn({ grade, plan, selectedCourse, gradeSlots, onAdd, onRemove }) {
  const index = (plan[grade] || []).indexOf(selectedCourse.id);
  const added = index !== -1;
  const eligible = !selectedCourse.unavailable && (selectedCourse.gradeLevel || []).map(Number).includes(grade);
  const duplicate = !selectedCourse.repeatable && Object.values(plan).flat().includes(selectedCourse.id);
  const full = gradeSlots(plan, grade) + getCourseSlots(selectedCourse) > GRADE_MAX;
  const disabled = !added && (!eligible || duplicate || full);
  return <button type="button" disabled={disabled}
    onClick={() => added ? onRemove(grade, index) : onAdd(grade, selectedCourse.id)}
    title={!eligible && !added ? 'Not offered to Grade ' + grade : undefined}
    style={{fontSize:13,fontWeight:700,borderRadius:8,padding:"10px 14px",fontFamily:"inherit",
      border:"1.5px solid " + (added ? "#059669" : "var(--border)"),background:added ? "#F0FDF4" : "white",
      color:added ? "#166534" : "var(--text)",cursor:disabled ? "not-allowed" : "pointer",opacity:disabled ? .45 : 1}}>
    {added ? 'Remove · Grade ' + grade : !eligible ? 'Grade ' + grade + ' · unavailable' : full ? 'Grade ' + grade + ' · full' : 'Grade ' + grade}
  </button>;
}
