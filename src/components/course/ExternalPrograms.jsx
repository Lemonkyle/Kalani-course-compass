export const PROGRAM_LINKS = {
  HOC:'https://sites.google.com/k12.hi.us/hoc',
  'Dual Credit':'https://sites.google.com/k12.hi.us/kalanicounselorscorner/dual-credit',
};
const programs = {
  HOC:[{name:'Hawaiʻi Online Courses',description:'Teacher-led online learning that supplements school offerings for HIDOE secondary students. Registration is submitted through your School Site Facilitator.'}],
  'Dual Credit':[
    {name:'Early College',description:'College coursework offered at Kalani through a partnership with Kapiʻolani Community College.'},
    {name:'Running Start',description:'An opportunity for eligible high-school students to take college classes at Kapiʻolani Community College.'},
    {name:'UH Mānoa Early College Scholars',description:'Selected UH Mānoa Outreach College courses through Kalani’s dual-credit options.'},
  ],
};
export function ExternalPrograms({source,openExternalCourse}) {
  return <section>
    <h2 style={{marginBottom:10}}>{source === 'HOC' ? 'Hawaiʻi Online Courses (HOC)' : 'Dual Credit opportunities'}</h2>
    <p style={{lineHeight:1.7,marginBottom:12}}>{source === 'Dual Credit' ? 'Eligible students may earn both high-school and college credit. The high-school credit amount and graduation category must be confirmed with school staff.' : 'Online courses can expand your choices beyond the on-campus catalog. Ask your school which options fit your plan.'}</p>
    <p style={{lineHeight:1.7,marginBottom:20}}>These cards introduce programs, not a complete course catalog. Check the official site for current offerings, eligibility, costs and deadlines. Discuss registration and high-school credit with your counselor or program coordinator.</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16}}>
      {programs[source].map(p=><article key={p.name} className="c-card" style={{cursor:'default',gap:12}}>
        <span className="badge">Program overview · {source}</span><h3>{p.name}</h3>
        <p style={{fontSize:14,lineHeight:1.7}}>{p.description}</p>
        <a href={PROGRAM_LINKS[source]} target="_blank" rel="noopener noreferrer">For more information ↗</a>
        <button className="dept-btn" onClick={()=>openExternalCourse(source,p.name)}>Record a course in planner</button>
        <small>Find a specific course first. Save it as unverified if its high-school credit is unknown.</small>
      </article>)}
    </div>
  </section>;
}
