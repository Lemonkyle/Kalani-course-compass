import { useState, useMemo, useEffect } from "react";

// ─── BACKEND ADAPTER ──────────────────────────────────────────────────────────
// V2: data is hardcoded below (COURSES, GRAD_REQUIREMENTS arrays).
// V3: swap this hook to fetch from Supabase. No other code changes needed.
//
// To connect Supabase later, replace useCourseData() with:
//   const { data: courses } = await supabase.from('courses').select('*').eq('archived',false)
//   const { data: announcements } = await supabase.from('announcements').select('*').eq('visible',true)
//
// DATA_SOURCE flag: "local" | "supabase"
const DATA_SOURCE = "local"; // ← change to "supabase" when backend is ready

function useCourseData() {
  // V3: replace this with a useEffect that fetches from Supabase
  // For now returns the hardcoded arrays defined below
  return { courses: COURSES, gradReqs: GRAD_REQUIREMENTS, loading: false, error: null };
}

function useAnnouncements() {
  // V3: fetch from Supabase announcements table
  // { id, title, body, type: "new"|"removed"|"updated", effective_date, visible }
  return { announcements: [], loading: false };
}
// ─────────────────────────────────────────────────────────────────────────────

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');`;

const GRAD_REQUIREMENTS = [
  { id:"english",  label:"English",           required:4.0, color:"#C84B31",
    breakdown:["ELA 1 (1.0)","ELA 2 (1.0)","Expository Writing (0.5)","ELA electives (1.5)"] },
  { id:"ss",       label:"Social Studies",    required:4.0, color:"#7C3AED",
    breakdown:["US History/Gov (1.0)","World History (1.0)","Modern Hawaiʻi (0.5)","Participation in Democracy (0.5)","SS elective (1.0)"] },
  { id:"math",     label:"Mathematics",       required:3.0, color:"#059669",
    breakdown:["Algebra 1 (1.0)","Geometry (1.0)","Math elective (1.0)"] },
  { id:"science",  label:"Science",           required:3.0, color:"#D97706",
    breakdown:["Biology 1 (1.0)","Science electives (2.0)"] },
  { id:"wlfa",     label:"World Lang / Fine Arts / CTE", required:2.0, color:"#0891B2",
    breakdown:["2 credits in one: World Language, Fine Arts, or CTE pathway"] },
  { id:"pe",       label:"Physical Education",required:1.0, color:"#10B981",
    breakdown:["PE Lifetime Fitness (0.5)","PE elective (0.5)"] },
  { id:"health",   label:"Health",            required:0.5, color:"#EC4899",
    breakdown:["Health Today & Tomorrow (0.5)"] },
  { id:"ptp",      label:"Personal Transition Plan",required:0.5, color:"#84CC16",
    breakdown:["PTP (0.5)"] },
  { id:"electives",label:"Electives",         required:6.0, color:"#F97316",
    breakdown:["Any subject area (6.0 credits)"] },
];

const COURSES = [
  // ── ENGLISH ──
  { id:"EXP_W",   code:"",        name:"Expository Writing",                    dept:"English",      credits:0.5, gradeLevel:[9,10,11,12], prereqs:[],                    gradCategory:"english",  gradCredits:0.5,
    desc:"Required graduation course (0.5 credit). Focused expository and analytical writing skills. Often taken alongside ELA 1 or 2.",
    tips:"Required for graduation. Usually taken in 9th or 10th grade." },
  { id:"ELA1",    code:"LCY1010", name:"English Language Arts 1",              dept:"English",      credits:1.0, gradeLevel:[9],           prereqs:[],                    gradCategory:"english",  gradCredits:1.0,
    desc:"Year course. Foundation program of reading, writing, oral communication, literature, and language study. All high school content standards addressed.",
    tips:"All 9th graders take this. Your English foundation — sets up everything that follows." },
  { id:"ELA2",    code:"LCY2010", name:"English Language Arts 2",              dept:"English",      credits:1.0, gradeLevel:[10],          prereqs:["ELA1"],              gradCategory:"english",  gradCredits:1.0,
    desc:"Year course. Balanced reading, writing, oral communication. World literature focus. All Hawaiʻi state standards addressed.",
    tips:"World literature focus. Great chance to explore diverse writing styles and voices." },
  { id:"ELA3",    code:"LCY3010", name:"English Language Arts 3",              dept:"English",      credits:1.0, gradeLevel:[11],          prereqs:["ELA2"],              gradCategory:"english",  gradCredits:1.0,
    desc:"Year course. Strategic language use; research with informational and literary texts. Critical reading, writing, and conducting research.",
    tips:"Heavy research component. Start strong note-taking habits early in the year." },
  { id:"ELA4",    code:"LCY4010", name:"English Language Arts 4",              dept:"English",      credits:1.0, gradeLevel:[12],          prereqs:["ELA3"],              gradCategory:"english",  gradCredits:1.0,
    desc:"Year course. Precision in written and spoken language, argumentation, and debate. British, European, African, and local works.",
    tips:"Argumentation skills transfer directly to college essays. Great senior year course." },
  { id:"AP_ENG3", code:"LAY6010", name:"AP English Language & Composition",    dept:"English",      credits:1.0, gradeLevel:[11],          prereqs:["ELA2"],              gradCategory:"english",  gradCredits:1.0, isAP:true,
    desc:"Year course. College-level writing and rhetoric. AP Language & Composition Exam in May. Parent/guardian sign-off session required. Essay submission during sign-up.",
    tips:"Excellent for college admissions. AP exam ~$96, signed contract required." },
  { id:"AP_ENG4", code:"LAY6100", name:"AP English Literature & Composition",  dept:"English",      credits:1.0, gradeLevel:[12],          prereqs:["ELA3"],              gradCategory:"english",  gradCredits:1.0, isAP:true,
    desc:"Year course. College-level literature. Emphasis on world and British literature. AP Lit & Comp Exam required in May. Open to any willing senior.",
    tips:"Great pairing if you took AP Lang junior year." },
  { id:"AP_SEM",  code:"XAP1000", name:"AP Seminar",                           dept:"English",      credits:1.0, gradeLevel:[10,11],       prereqs:[],                    gradCategory:"electives",gradCredits:1.0, isAP:true,
    desc:"Year course. Critical thinking, research, problem-solving, argumentation, and multimedia communication. Part of AP Capstone program. Leads to AP Research.",
    tips:"Take this before AP Research. Strong foundation for any research-intensive college major." },
  { id:"AP_RES",  code:"XAP1100", name:"AP Research",                          dept:"English",      credits:1.0, gradeLevel:[11,12],       prereqs:["AP_SEM"],            gradCategory:"electives",gradCredits:1.0, isAP:true,
    desc:"Year course. Design and conduct a year-long independent research investigation on a topic of individual interest. Three performance tasks. AP Capstone program.",
    tips:"Requires AP Seminar as prerequisite. Strong independent work ethic needed." },

  // ── SOCIAL STUDIES ──
  { id:"PID",       code:"CGU1100",        name:"Participation in Democracy",          dept:"Social Studies", credits:0.5, gradeLevel:[9],    prereqs:[],             gradCategory:"ss",       gradCredits:0.5,
    desc:"Semester course. Required for graduation. Democratic government, federal/state/local structures, rights and responsibilities of citizens. Taken in semester 1 of 9th grade.",
    tips:"Taken semester 1, paired with Modern History of Hawaiʻi." },
  { id:"MHH",       code:"CHR1100",        name:"Modern History of Hawaiʻi",           dept:"Social Studies", credits:0.5, gradeLevel:[9],    prereqs:[],             gradCategory:"ss",       gradCredits:0.5,
    desc:"Semester course. Required for graduation. Hawaiʻi history since 1898: monarchy, annexation, statehood, and current events. Taken in semester 2 of 9th grade.",
    tips:"Taken semester 2, paired with Participation in Democracy." },
  { id:"USH",       code:"CHU1100",        name:"United States History & Government",  dept:"Social Studies", credits:1.0, gradeLevel:[10],   prereqs:["PID","MHH"],  gradCategory:"ss",       gradCredits:1.0,
    desc:"Year course. Chronological survey of American history from 1877 to present. Major events, geography, and ideas of American heritage.",
    tips:"10th grade core social studies. Builds on 9th grade civic foundation." },
  { id:"AP_USH",    code:"CHA6100",        name:"AP United States History",            dept:"Social Studies", credits:1.0, gradeLevel:[10],   prereqs:["PID","MHH"],  gradCategory:"ss",       gradCredits:1.0, isAP:true,
    desc:"Year course. Rigorous college-level survey of American history. AP exam required in May. Essay submission required during sign-up process.",
    tips:"Strong writing skills essential. One of the most essay-intensive AP courses offered." },
  { id:"WH",        code:"CHW1100",        name:"World History & Culture",             dept:"Social Studies", credits:1.0, gradeLevel:[11],   prereqs:["USH"],        gradCategory:"ss",       gradCredits:1.0,
    desc:"Year course. Political, economic, geographic, and social events shaping world history from ancient civilizations to current events.",
    tips:"11th grade core. Critical reading and writing of primary/secondary sources." },
  { id:"AP_WH",     code:"CHA6300",        name:"AP World History",                    dept:"Social Studies", credits:1.0, gradeLevel:[11],   prereqs:["USH"],        gradCategory:"ss",       gradCredits:1.0, isAP:true,
    desc:"Year course. College-level world history from 8000 BCE to present. AP exam required in May.",
    tips:"Writing-intensive. Great if you enjoy history and can manage heavy reading." },
  { id:"ECON_PSYCH",code:"CSD2500/2200",   name:"Economics / Psychology",              dept:"Social Studies", credits:1.0, gradeLevel:[12],   prereqs:["WH"],         gradCategory:"ss",       gradCredits:1.0,
    desc:"Year course. Economics (semester 1): concepts to understand major economic problems. Psychology (semester 2): why humans behave as they do. Paired and taken together.",
    tips:"Many students' favorite social studies class. Taken as a pair — both count toward SS requirement." },
  { id:"AP_MACRO",  code:"CSA6200",        name:"AP Macroeconomics / Economics",       dept:"Social Studies", credits:1.0, gradeLevel:[12],   prereqs:["WH"],         gradCategory:"ss",       gradCredits:1.0, isAP:true,
    desc:"Year course. AP Macroeconomics (sem 1) paired with Economics. College-level economics. AP exam in May (~$96). Must be paired with 12th Grade Economics.",
    tips:"Strong quantitative reasoning needed. AP Macro is manageable if you stay on top of material." },
  { id:"AP_PSYCH",  code:"CSA2500",        name:"AP Psychology",                       dept:"Social Studies", credits:1.0, gradeLevel:[12],   prereqs:["WH"],         gradCategory:"ss",       gradCredits:1.0, isAP:true,
    desc:"Year course. Equivalent to introductory college psychology. Biological, behavioral, cognitive, humanistic, and socio-cultural perspectives. AP exam in May.",
    tips:"One of the most popular AP courses. Great for medicine, social work, or education majors." },

  // ── MATHEMATICS ──
  { id:"GEO",    code:"MGX1150",    name:"Geometry",                            dept:"Mathematics", credits:1.0, gradeLevel:[9],      prereqs:[],             gradCategory:"math", gradCredits:1.0,
    desc:"Year course. All incoming freshmen begin here (SY 2022-23+). Plane and solid Euclidean geometry. Compass and straightedge required.",
    tips:"Bring a compass and straightedge — you'll need them from day one." },
  { id:"ALG1",   code:"MAX1155",    name:"Algebra 1",                           dept:"Mathematics", credits:1.0, gradeLevel:[10],     prereqs:["GEO"],        gradCategory:"math", gradCredits:1.0,
    desc:"Year course. Basic structure of algebra and mathematical problem solving. Foundation for all subsequent math courses. Algebra 1 Workshop is mandatory concurrently.",
    tips:"All Algebra 1 students concurrently attend Algebra 1 Workshop on alternating days for extra support." },
  { id:"ALG1W",  code:"MSW1009",    name:"Algebra 1 Workshop",                 dept:"Mathematics", credits:1.0, gradeLevel:[10],     prereqs:["GEO"],        gradCategory:"math", gradCredits:1.0,
    desc:"Mandatory concurrent course for all Algebra 1 students (or Geometry students with C or below). Support, remediation, and reinforcement on alternating days.",
    tips:"You don't separately choose this — it's automatically assigned with Algebra 1." },
  { id:"ALG2",   code:"MAX1200",    name:"Algebra 2",                           dept:"Mathematics", credits:1.0, gradeLevel:[11],     prereqs:["ALG1","GEO"], gradCategory:"math", gradCredits:1.0,
    desc:"Year course. Builds upon and extends Algebra 1 concepts. Required for UH Mānoa and most 4-year college admissions.",
    tips:"Need C or better to progress. Critical for university admissions — do not skip." },
  { id:"TRIG",   code:"MCX1010",    name:"Trigonometry / Pre-Calculus",        dept:"Mathematics", credits:1.0, gradeLevel:[11,12],  prereqs:["ALG2"],       gradCategory:"math", gradCredits:1.0,
    desc:"Two-semester year course (0.5 cr each). Trigonometry first semester, Pre-Calculus second semester. For students highly proficient in algebra and geometry.",
    tips:"Need B or better in Algebra 2. Recommended for students planning STEM majors or pre-med." },
  { id:"ALG3",   code:"MAX1310",    name:"Algebra 3 / Statistics",             dept:"Mathematics", credits:1.0, gradeLevel:[11,12],  prereqs:["ALG2"],       gradCategory:"math", gradCredits:1.0,
    desc:"Two-semester year course (0.5 cr each). Advanced algebra of real/complex numbers (sem 1), then descriptive and inferential statistics (sem 2).",
    tips:"Good alternative to Trig/PreCal for non-STEM paths. Need C or better in Algebra 2." },
  { id:"CALC",   code:"MCX1040",    name:"Calculus",                            dept:"Mathematics", credits:1.0, gradeLevel:[12],     prereqs:["TRIG"],       gradCategory:"math", gradCredits:1.0,
    desc:"Year course. Limits as the foundation of calculus, differentiation, and integration.",
    tips:"Need C or better in Trig/PreCal (or A in Algebra 3). Strong math foundation essential." },
  { id:"AP_CALC",code:"MCA1040",    name:"AP Calculus",                         dept:"Mathematics", credits:1.0, gradeLevel:[12],     prereqs:["TRIG"],       gradCategory:"math", gradCredits:1.0, isAP:true,
    desc:"Year course. College-level calculus. AP Mathematics Exam required in May (~$96). Placement test may be required.",
    tips:"Need B or better in Trig/PreCal. One of the most valued AP courses for STEM college applications." },
  { id:"ICMATH", code:"MIC1200",    name:"Introduction to College Mathematics", dept:"Mathematics", credits:1.0, gradeLevel:[12],     prereqs:["ALG2"],       gradCategory:"math", gradCredits:1.0,
    desc:"Year course. Prepares seniors for non-STEM college math. Mathematical modeling and quantitative reasoning. Can earn UH placement credit based on grades + SBAC score.",
    tips:"For seniors on non-STEM paths. Only for seniors with Geometry and Algebra 2 credit." },

  // ── SCIENCE ──
  { id:"ISCI",      code:"SAH2003",  name:"Integrated Science",            dept:"Science", credits:1.0, gradeLevel:[9],       prereqs:[],                    gradCategory:"science", gradCredits:1.0,
    desc:"Year course for 9th graders. Integrates Scientific Method, Biology, and Chemistry. Energy transformations, elements, cellular structure, and photosynthesis.",
    tips:"Take this if you don't yet have Algebra 1. Biology 1 (Gr 9) is an option if you already have Algebra 1." },
  { id:"BIO1_9",    code:"SLH22039", name:"Biology 1 (Grade 9 track)",     dept:"Science", credits:1.0, gradeLevel:[9],       prereqs:["ALG1"],               gradCategory:"science", gradCredits:1.0,
    desc:"Year course for 9th graders with Algebra 1 credit. Life processes, genetics, evolution, and ecology. Fulfills the required Biology 1 graduation credit.",
    tips:"Start here if you already have Algebra 1. Fulfills the Biology 1 graduation requirement early." },
  { id:"BIO1_10",   code:"SLH2203",  name:"Biology 1",                     dept:"Science", credits:1.0, gradeLevel:[10],      prereqs:[],                    gradCategory:"science", gradCredits:1.0,
    desc:"Year course. Fundamental life processes, genetics, evolution, and ecology. Required for graduation. End-of-course exam administered.",
    tips:"If you took Integrated Science in 9th grade, this is your Biology 1. End-of-course exam counts." },
  { id:"CHEM",      code:"SPH3503",  name:"Chemistry",                     dept:"Science", credits:1.0, gradeLevel:[10,11],   prereqs:["BIO1_10"],            gradCategory:"science", gradCredits:1.0,
    desc:"Year course. College-preparatory introduction to chemistry for non-science-major paths. Requires Algebra 1.",
    tips:"Good for students not planning science careers. Opens path to AP Environmental Science." },
  { id:"HCHEM",     code:"SPH3503H", name:"Honors Chemistry",              dept:"Science", credits:1.0, gradeLevel:[10,11],   prereqs:["BIO1_10","ALG1"],     gradCategory:"science", gradCredits:1.0,
    desc:"Year course. Rigorous college-prep chemistry for students planning science careers. Emphasis on math and lab. B or better in Algebra 1; concurrent Algebra 2 required.",
    tips:"Highly recommended before AP Biology or AP Chemistry. Harder than regular Chemistry." },
  { id:"AP_BIO",    code:"SLH8003",  name:"AP Biology",                    dept:"Science", credits:1.0, gradeLevel:[11,12],   prereqs:["BIO1_10","CHEM"],     gradCategory:"science", gradCredits:1.0, isAP:true,
    desc:"Year course. First-year college biology with extensive lab work. AP exam required in May.",
    tips:"One of the most demanding AP courses. Honors Chemistry strongly recommended as preparation." },
  { id:"AP_CHEM",   code:"SPH5003",  name:"AP Chemistry",                  dept:"Science", credits:1.0, gradeLevel:[11,12],   prereqs:["HCHEM","ALG2"],       gradCategory:"science", gradCredits:1.0, isAP:true,
    desc:"Year course. First-year college chemistry. Atomic theory, bonding, kinetics, thermodynamics. AP exam required.",
    tips:"Need B or better in Honors Chemistry. One of the most rigorous AP sciences at Kalani." },
  { id:"PHYS",      code:"SPH5603",  name:"Physics",                       dept:"Science", credits:1.0, gradeLevel:[11,12],   prereqs:["GEO","ALG1","ALG2"],  gradCategory:"science", gradCredits:1.0,
    desc:"Year course. College-prep physics: force, motion, energy, sound, light, electricity, magnetism.",
    tips:"Need Geometry, Algebra 1, and Algebra 2. Good for engineering interest without full AP rigor." },
  { id:"AP_PHYS",   code:"SPH7505",  name:"AP Physics 1",                  dept:"Science", credits:1.0, gradeLevel:[11,12],   prereqs:["TRIG"],               gradCategory:"science", gradCredits:1.0, isAP:true,
    desc:"Year course. Algebra-based first-semester college physics. AP exam required. For medicine or engineering. Enrollment or completion of Trig/PreCal required.",
    tips:"Very math and reasoning intensive. Strong self-discipline is key." },
  { id:"AP_ENVSCI", code:"SIH3903",  name:"AP Environmental Science",      dept:"Science", credits:1.0, gradeLevel:[11,12],   prereqs:["BIO1_10","CHEM"],     gradCategory:"science", gradCredits:1.0, isAP:true,
    desc:"Year course. Earth's systems and human-environment interactions. AP exam required in May.",
    tips:"Popular AP choice. Less math-heavy than AP Chem or Physics. Great for environmentally-minded students." },
  { id:"HPHYS",     code:"SLH7503",  name:"Human Physiology 1",            dept:"Science", credits:1.0, gradeLevel:[11,12],   prereqs:["BIO1_10"],            gradCategory:"science", gradCredits:1.0,
    desc:"Year course. Second-year biology. In-depth human anatomy: blood, circulation, respiration, nervous system, reproduction.",
    tips:"Great for students interested in health, nursing, or medicine careers." },
  { id:"MARINE",    code:"SEH2503",  name:"Marine Science",                dept:"Science", credits:1.0, gradeLevel:[10,11,12],prereqs:["BIO1_10"],            gradCategory:"science", gradCredits:1.0,
    desc:"Year course. Physical and biological aspects of marine environments. Highly relevant to Hawaiʻi's ecosystem. College-preparatory.",
    tips:"Very popular Hawaii-relevant elective science credit." },
  { id:"STEM_CAP",  code:"XAT1000",  name:"STEM Capstone",                 dept:"Science", credits:1.0, gradeLevel:[11,12],   prereqs:[],                    gradCategory:"electives",gradCredits:1.0,
    desc:"Year course. Self-directed, project-based. Research, design, and deliver a solution to a community need. Required for STEM Honors Recognition Certificate.",
    tips:"Required if pursuing STEM Honors. Demands strong self-direction and time management." },

  // ── HEALTH & PE ──
  { id:"HEALTH",     code:"HLE1000", name:"Health Today and Tomorrow",    dept:"Health & PE", credits:0.5, gradeLevel:[9,10,11,12], prereqs:[], gradCategory:"health", gradCredits:0.5,
    desc:"Semester course. Safety, mental/emotional health, nutrition, tobacco/alcohol prevention, sexual health. Required 0.5 credit.",
    tips:"Required for graduation. Usually taken 9th or 10th grade." },
  { id:"PE_LF",      code:"PEP1005", name:"PE Lifetime Fitness",          dept:"Health & PE", credits:0.5, gradeLevel:[9,10,11,12], prereqs:[], gradCategory:"pe",     gradCredits:0.5,
    desc:"Semester course. Aquatics, aerobics, spinning, circuit training, weight training. Required 0.5 credit for graduation.",
    tips:"Required graduation credit. Usually taken 9th or 10th grade." },
  { id:"PE_LA",      code:"PEP1010", name:"PE Lifetime Activities",       dept:"Health & PE", credits:0.5, gradeLevel:[9,10,11,12], prereqs:[], gradCategory:"pe",     gradCredits:0.5,
    desc:"Semester course. Life-long recreational activities: Frisbee, soccer, water explorations, team handball. Biathlon assessment (2-mile run + 600-yd swim).",
    tips:"Pairs with PE Lifetime Fitness to fulfill the 1.0 PE graduation requirement." },
  { id:"TEAM_SPORTS",code:"PTP1640", name:"Team Sports 1/2",              dept:"Health & PE", credits:0.5, gradeLevel:[9,10,11,12], prereqs:[], gradCategory:"pe",     gradCredits:0.5,
    desc:"Semester course. Basketball, volleyball, soccer, softball, water polo, flag football. Rules, strategy, teamwork, and safety.",
    tips:"Great PE elective if you enjoy competitive team sports." },
  { id:"WT",         code:"PWP1210", name:"Weight Training 1 & 2",        dept:"Health & PE", credits:0.5, gradeLevel:[9,10,11,12], prereqs:[], gradCategory:"pe",     gradCredits:0.5,
    desc:"Semester course (repeatable for Years 1 and 2). Weight training techniques, safety, and physical fitness. Running for cardiac health included.",
    tips:"Popular PE elective. Can be taken across multiple years." },
  { id:"BODY_COND",  code:"PBP1110", name:"Body Conditioning",            dept:"Health & PE", credits:0.5, gradeLevel:[11,12],       prereqs:["WT"], gradCategory:"pe",gradCredits:0.5,
    desc:"Semester course. Year 3 of weight training sequence. Isometric, isotonic, aerobic, anaerobic, plyometric training. Nutrition and body composition.",
    tips:"For students who have completed Weight Training 1 and 2." },

  // ── PTP ──
  { id:"PTP", code:"TGG1105", name:"Personal Transition Plan", dept:"Miscellaneous", credits:0.5, gradeLevel:[9,10,11,12], prereqs:[], gradCategory:"ptp", gradCredits:0.5,
    desc:"Semester course. Career planning, life goals, and educational planning. Required 0.5 credit for graduation. Must document meeting CTE Career Planning standards.",
    tips:"Required for graduation. Best taken early so you can plan the rest of high school around your goals." },

  // ── CTE — AGRICULTURE ──
  { id:"AFNR1", code:"TAO1000", name:"Foundations of Agriculture, Food & Natural Resources", dept:"CTE", credits:1.0, gradeLevel:[9,10,11], prereqs:[], gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year 1. Introduction to agriculture careers, ecosystems, plant and animal systems. Foundation course for the AFNR pathway.",
    tips:"Year 1 of AFNR pathway. Leads to Small and Large Animal Systems." },
  { id:"SAS",   code:"TAS2000", name:"Small Animal Systems",              dept:"CTE", credits:1.0, gradeLevel:[10,11,12], prereqs:["AFNR1"],         gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year 2. Anatomy and care of small and specialty animals. For students interested in veterinary or animal-related professions.",
    tips:"Together with AFNR Foundations, completes the 2-credit CTE graduation requirement." },
  { id:"LAS",   code:"TAS3000", name:"Large Animal Systems",              dept:"CTE", credits:1.0, gradeLevel:[11,12],    prereqs:["AFNR1"],         gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year 3. Anatomy and care of large animals. Prerequisite: Foundations of AFNR or Small Animal Systems.",
    tips:"Can follow either AFNR Foundations or Small Animal Systems." },

  // ── CTE — BUSINESS ──
  { id:"BIZ1", code:"TBB1000", name:"Foundations of Business & Marketing", dept:"CTE", credits:1.0, gradeLevel:[9,10,11],  prereqs:[],       gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year 1. Introduction to business careers, sectors, and basic business concepts. Foundation for the Entrepreneurship pathway.",
    tips:"Year 1 of Business pathway. Good for students interested in starting their own business." },
  { id:"ENT1", code:"TBE2000", name:"Entrepreneurship 1",                 dept:"CTE", credits:1.0, gradeLevel:[10,11,12], prereqs:["BIZ1"],  gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year 2. Management, finance, and marketing in an entrepreneurship context. Prepares students for the business world.",
    tips:"Completes 2-credit CTE requirement with Foundations of Business." },

  // ── CTE — DIGITAL MEDIA ──
  { id:"DIGPHOTO1",  code:"TCC1000", name:"Foundations of Creative Media (Digital Photography 1)", dept:"CTE", credits:1.0, gradeLevel:[9,10,11],  prereqs:[],              gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year 1. Visual arts and communication through photography. History, copyright, composition, lighting. Own digital camera required.",
    tips:"Must have your own digital camera. Year 1 of Creative Media pathway." },
  { id:"DIGDESIGN1", code:"TCD2000", name:"Digital Design 1 (Photography 2)",                      dept:"CTE", credits:1.0, gradeLevel:[10,11,12], prereqs:["DIGPHOTO1"],   gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year 2. Digital media production, communicative content creation, production process, and legal concerns. Completes 2-credit CTE requirement.",
    tips:"Completes 2-credit CTE requirement. Great for students interested in media careers." },
  { id:"DIGDESIGN2", code:"TCD3000", name:"Digital Design 2 (Directed Studies)",                   dept:"CTE", credits:1.0, gradeLevel:[11,12],    prereqs:["DIGDESIGN1"],  gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year 3. Advanced arts and communication. Investigate, design, construct, and evaluate digital media solutions.",
    tips:"For students wanting deeper digital media skills beyond the core 2-course sequence." },

  // ── CTE — ENGINEERING ──
  { id:"ENG_FOUND", code:"TAE1000", name:"Foundations of Engineering Tech",  dept:"CTE", credits:1.0, gradeLevel:[9,10,11],  prereqs:[],                          gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year 1. Teamwork, ethics, introductory engineering. 3D printing, laser cutting, and CAD modeling in the rapid prototyping lab.",
    tips:"Year 1 of Engineering pathway. Hands-on tech lab — great for aspiring engineers." },
  { id:"ENG1",      code:"TAE2000", name:"Engineering Tech 1",              dept:"CTE", credits:1.0, gradeLevel:[10,11,12], prereqs:["ENG_FOUND"],               gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year 2. Drafting technology: design, spatial visualization, multi-view projection, computer-aided drafting. Completes 2-credit CTE requirement.",
    tips:"Completes 2-credit CTE requirement. CAD skills are highly valued in engineering fields." },
  { id:"ENG2",      code:"TAE3000", name:"Engineering Tech 2",              dept:"CTE", credits:1.0, gradeLevel:[11,12],    prereqs:["ENG_FOUND","ENG1"],         gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year 3. Computer-aided design, mechanical/architectural drawings, electronics schematics. Real-world problem solving with industry-standard tools.",
    tips:"Requires both Foundations and Engineering Tech 1. Great preparation for engineering college programs." },
  { id:"ENG3",      code:"TAE4000", name:"Engineering Tech 3",              dept:"CTE", credits:1.0, gradeLevel:[12],       prereqs:["ENG_FOUND","ENG1","ENG2"],  gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year 4. Civil, mechanical, and electrical engineering processes using hands-on real-world projects. Technical reading/writing, math, and science integrated.",
    tips:"Capstone engineering course. Requires all three prior courses in sequence." },

  // ── CTE — HEALTH SERVICES ──
  { id:"HLTH_FOUND", code:"THF1000", name:"Foundations of Health Services",      dept:"CTE", credits:1.0, gradeLevel:[9,10,11],  prereqs:[],                       gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year 1. Introduction to health careers, basic medical skills, terminology, and ethics. Includes traditional Hawaiian health care philosophy.",
    tips:"Year 1 of Health Services pathway. Great starting point for medicine or nursing interest." },
  { id:"ADV_HLTH",   code:"THA2000", name:"Advanced Health Services",            dept:"CTE", credits:1.0, gradeLevel:[10,11,12], prereqs:["HLTH_FOUND"],           gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year 2. Human body structures and functions. Digital portfolio development. Completes 2-credit CTE requirement.",
    tips:"Completes 2-credit CTE requirement. Strong foundation for nursing or pre-med tracks." },
  { id:"THERAPEUTIC",code:"THP3000", name:"Principles of Therapeutic Services",  dept:"CTE", credits:1.0, gradeLevel:[11,12],    prereqs:["HLTH_FOUND","ADV_HLTH"],gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year 3. Capstone course. Work-based learning in therapeutic services. Internship/logged hours in a medical setting or pharmacy. Portfolio finalization.",
    tips:"Includes an internship component in a medical or pharmacy setting. Capstone for Health Services." },

  // ── CTE — IT / CS ──
  { id:"CS_FOUND", code:"TIF1000", name:"Foundations of Computer Systems & Technology", dept:"CTE", credits:1.0, gradeLevel:[9,10,11],  prereqs:["ALG1"],       gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year 1. Computer programming languages, flowcharts, problem-solving, global issues in CS, and CS as a career exploration. Prerequisite: Algebra 1.",
    tips:"Algebra 1 required. Great stepping stone to AP Computer Science courses." },
  { id:"AP_CSA",   code:"ECS9500", name:"AP Computer Science A",                         dept:"CTE", credits:1.0, gradeLevel:[10,11,12], prereqs:["CS_FOUND"],   gradCategory:"wlfa", gradCredits:1.0, isAP:true,
    desc:"Year 2/3 (alternating years). Java programming, algorithms, data structures. AP exam required. Completes 2-credit CTE requirement.",
    tips:"Offered alternating years with AP CSP. Need B+ in Foundations + teacher recommendation." },
  { id:"AP_CSP",   code:"ECS9800", name:"AP Computer Science Principles",                dept:"CTE", credits:1.0, gradeLevel:[10,11,12], prereqs:["CS_FOUND"],   gradCategory:"wlfa", gradCredits:1.0, isAP:true,
    desc:"Year 2/3 (alternating years). Foundations of computing, data analysis, and societal impact of CS. AP exam required.",
    tips:"More accessible than AP CS A. Great for students interested in technology and society." },

  // ── CTE — JROTC ──
  { id:"JROTC1", code:"", name:"Coast Guard JROTC Maritime Science 1", dept:"CTE", credits:1.0, gradeLevel:[9,10,11,12], prereqs:[],         gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year 1. Citizenship, leadership, physical fitness, Coast Guard history, drill. Community service and extracurricular competitions (marksmanship, Color Guard). No military obligation.",
    tips:"Two consecutive JROTC courses fulfill the 2-credit CTE graduation requirement." },
  { id:"JROTC2", code:"", name:"Coast Guard JROTC Maritime Science 2", dept:"CTE", credits:1.0, gradeLevel:[9,10,11,12], prereqs:["JROTC1"],gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year 2. Leadership roles, maritime history, oceanography, atmospheric science. Selected cadets assist in unit instruction. Positive SMSI/MSI recommendation required.",
    tips:"Completes the 2-credit CTE requirement for graduation. No military obligation." },

  // ── WORLD LANGUAGE ──
  { id:"JPN1",  code:"WAJ1000",  name:"Japanese 1",          dept:"World Language", credits:1.0, gradeLevel:[9,10,11,12], prereqs:[],       gradCategory:"wlfa", gradCredits:1.0,
    desc:"Introductory Japanese. Basic vocabulary, grammar, social situations of daily life. K-3 benchmarks. No prior experience needed.", tips:"Year 1. No experience required." },
  { id:"JPN2",  code:"WAJ2000",  name:"Japanese 2",          dept:"World Language", credits:1.0, gradeLevel:[9,10,11,12], prereqs:["JPN1"], gradCategory:"wlfa", gradCredits:1.0,
    desc:"Reinforces Japanese 1. Simple conversations, routine situations, cultural topics. Grade 4-5 benchmarks.", tips:"Completes 2-credit World Language requirement with Japanese 1." },
  { id:"JPN2H", code:"WAJ2000H", name:"Japanese 2 Honors",   dept:"World Language", credits:1.0, gradeLevel:[9,10,11,12], prereqs:["JPN1"], gradCategory:"wlfa", gradCredits:1.0,
    desc:"Accelerated second-year Japanese. Faster pace, grade 4-8 benchmarks. Leads to Japanese 3 Honors for the AP track. Teacher/counselor approval required.",
    tips:"Choose this over Japanese 2 if you plan to take AP Japanese. Leads to Japanese 3 Honors." },
  { id:"JPN3",  code:"WAJ3000",  name:"Japanese 3",          dept:"World Language", credits:1.0, gradeLevel:[10,11,12],   prereqs:["JPN2"], gradCategory:"wlfa", gradCredits:1.0,
    desc:"Expands listening, speaking, reading, and writing. Students create with language and understand cultural nuances. Teacher signature required.", tips:"Standard track after Japanese 2." },
  { id:"JPN3H", code:"WAJ3000H", name:"Japanese 3 Honors",   dept:"World Language", credits:1.0, gradeLevel:[10,11,12],   prereqs:["JPN2H"],gradCategory:"wlfa", gradCredits:1.0,
    desc:"Accelerated third-year Japanese. Oral, written, and extended conversation. Prepares students for AP Japanese. Level 2 teacher recommendation required.",
    tips:"AP track course. Leads directly to AP Japanese." },
  { id:"JPN4",  code:"WAJ4000",  name:"Japanese 4",          dept:"World Language", credits:1.0, gradeLevel:[11,12],       prereqs:["JPN3"], gradCategory:"wlfa", gradCredits:1.0,
    desc:"Advanced Japanese. Extended conversation, narration, description on varied topics. Stage II proficiencies. Teacher signature required.", tips:"Standard track. Highest non-AP level." },
  { id:"AP_JPN",code:"WAJ6000",  name:"AP Japanese",         dept:"World Language", credits:1.0, gradeLevel:[11,12],       prereqs:["JPN3H"],gradCategory:"wlfa", gradCredits:1.0, isAP:true,
    desc:"College-level Japanese. Active communication in all four skills. Emphasizes expository and persuasive writing. AP exam required in May.",
    tips:"Requires Japanese 3 Honors. Strong grammar and vocabulary command needed." },
  { id:"SPN1",  code:"WES1000",  name:"Spanish 1",           dept:"World Language", credits:1.0, gradeLevel:[9,10,11,12], prereqs:[],       gradCategory:"wlfa", gradCredits:1.0,
    desc:"Introductory Spanish. Basic vocabulary, grammar, social situations. K-3 benchmarks. No prior experience needed.", tips:"Year 1 of Spanish sequence." },
  { id:"SPN2",  code:"WES2000",  name:"Spanish 2",           dept:"World Language", credits:1.0, gradeLevel:[9,10,11,12], prereqs:["SPN1"], gradCategory:"wlfa", gradCredits:1.0,
    desc:"Continues Spanish. More complex grammar and conversation. Grade 4-5 benchmarks. Teacher signature required.", tips:"Completes 2-credit World Language requirement with Spanish 1." },
  { id:"SPN3",  code:"WES3000",  name:"Spanish 3",           dept:"World Language", credits:1.0, gradeLevel:[10,11,12],   prereqs:["SPN2"], gradCategory:"wlfa", gradCredits:1.0,
    desc:"Expands Spanish proficiency in all four skills. Stage II Standards and grade 4-8 benchmarks. Teacher signature required.", tips:"Good for students continuing to Spanish 4." },
  { id:"SPN4",  code:"WES4000",  name:"Spanish 4",           dept:"World Language", credits:1.0, gradeLevel:[11,12],       prereqs:["SPN3"], gradCategory:"wlfa", gradCredits:1.0,
    desc:"Advanced Spanish. Extended conversation, narration, and description. Grade 6-8 benchmarks. Teacher signature required.", tips:"Highest level of Spanish at Kalani." },
  { id:"CHN1",  code:"WAC1000",  name:"Chinese 1",           dept:"World Language", credits:1.0, gradeLevel:[9,10,11,12], prereqs:[],       gradCategory:"wlfa", gradCredits:1.0,
    desc:"Introductory Mandarin Chinese. Basic vocabulary, grammar, social situations. K-3 benchmarks.", tips:"Year 1. No experience needed." },
  { id:"CHN2",  code:"WAC2000",  name:"Chinese 2",           dept:"World Language", credits:1.0, gradeLevel:[9,10,11,12], prereqs:["CHN1"], gradCategory:"wlfa", gradCredits:1.0,
    desc:"Continues Mandarin. Simple conversations, cultural topics. Grade 4-5 benchmarks. Teacher signature required.", tips:"Completes 2-credit World Language requirement with Chinese 1." },
  { id:"GER1",  code:"WEG1000",  name:"German 1",            dept:"World Language", credits:1.0, gradeLevel:[9,10,11,12], prereqs:[],       gradCategory:"wlfa", gradCredits:1.0,
    desc:"Introductory German. Basic vocabulary, grammar, social situations. K-3 benchmarks. No prior experience needed.", tips:"Year 1. No experience required." },
  { id:"GER2",  code:"WEG2000",  name:"German 2",            dept:"World Language", credits:1.0, gradeLevel:[9,10,11,12], prereqs:["GER1"], gradCategory:"wlfa", gradCredits:1.0,
    desc:"Continues German. Simple conversations, cultural topics. Grade 4-5 benchmarks. Teacher signature required.", tips:"Completes 2-credit World Language requirement with German 1." },
  { id:"GER3",  code:"WEG3000",  name:"German 3",            dept:"World Language", credits:1.0, gradeLevel:[10,11,12],   prereqs:["GER2"], gradCategory:"wlfa", gradCredits:1.0,
    desc:"Expands German proficiency in all four skills. Stage II Standards and grade 4-8 benchmarks. Teacher signature required.", tips:"Continue to German 4 for strongest proficiency." },
  { id:"GER4",  code:"WEG4000",  name:"German 4",            dept:"World Language", credits:1.0, gradeLevel:[11,12],       prereqs:["GER3"], gradCategory:"wlfa", gradCredits:1.0,
    desc:"Advanced German. Extended conversation, narration, description. Grade 6-8 benchmarks. Teacher signature required.", tips:"Highest level of German at Kalani." },

  // ── FINE ARTS — VISUAL ART ──
  { id:"ART1",   code:"FVB1000", name:"General Art 1",            dept:"Fine Arts", credits:1.0, gradeLevel:[9,10,11,12], prereqs:[],          gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year course. Foundation: Elements and Principles of Design. Drawing, painting, printmaking, sculpture. Open to all grade levels. Recommended foundation for other art courses.",
    tips:"Foundation for all other art courses. Open to all grade levels." },
  { id:"ART2",   code:"FVB2000", name:"General Art 2",            dept:"Fine Arts", credits:1.0, gradeLevel:[9,10,11,12], prereqs:["ART1"],    gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year course. Advanced skill refinement. Self-directed projects and portfolio development. Teacher signature required, C or better in Art 1.",
    tips:"Completes 2-credit Fine Arts requirement. C or better in Art 1 + teacher signature." },
  { id:"ART3",   code:"FVB3000", name:"General Art 3",            dept:"Fine Arts", credits:1.0, gradeLevel:[10,11,12],   prereqs:["ART2"],    gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year course. Further refinement of skills. Emphasis on self-directed learning and expanding portfolio.", tips:"Teacher signature required. C or better in General Art 2." },
  { id:"DESIGN1",code:"FVK1000", name:"Design 1",                 dept:"Fine Arts", credits:1.0, gradeLevel:[9,10,11,12], prereqs:["ART1"],    gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year course. Graphic design, poster design, printmaking, fashion design. Explores Procreate and other digital design programs. Teacher signature required.",
    tips:"Great for digital creatives. C or better in General Art 1 required." },
  { id:"DP1",    code:"FVQ1000", name:"Drawing & Painting 1",     dept:"Fine Arts", credits:1.0, gradeLevel:[9,10,11,12], prereqs:[],          gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year course. Introductory drawing and painting. Art materials, techniques, and creative processes. Emphasizes technical drawing skill development.",
    tips:"Alternative foundation to General Art 1. Great for students specifically interested in drawing/painting." },
  { id:"DP2",    code:"FVQ2000", name:"Drawing & Painting 2",     dept:"Fine Arts", credits:1.0, gradeLevel:[9,10,11,12], prereqs:["DP1"],     gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year course. Continuation of Drawing & Painting 1 at an advanced level. Teacher signature required, C or better in Drawing & Painting 1.",
    tips:"Completes 2-credit Fine Arts requirement with Drawing & Painting 1." },
  { id:"DP3",    code:"FVQ3000", name:"Drawing & Painting 3",     dept:"Fine Arts", credits:1.0, gradeLevel:[10,11,12],   prereqs:["DP2"],     gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year course. Advanced realism techniques. For serious and/or college-bound art majors only. B or better in Drawing & Painting 2. Teacher signature required.",
    tips:"College-bound art majors only. Prerequisite for AP 2D Art & Design." },
  { id:"AP_2D",  code:"FVA3000", name:"AP 2D Art & Design",       dept:"Fine Arts", credits:1.0, gradeLevel:[11,12],       prereqs:["DP1","DP2","DP3"], gradCategory:"wlfa", gradCredits:1.0, isAP:true,
    desc:"Year course. Highly advanced college-level 2D art and design. Portfolio submission for AP exam. Can be taken concurrently with Drawing & Painting 3. Teacher signature required.",
    tips:"Can be taken concurrently with Drawing & Painting 3." },
  { id:"CER1",   code:"FVL1000", name:"Ceramics 1",               dept:"Fine Arts", credits:1.0, gradeLevel:[9,10,11,12], prereqs:[],          gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year course. Hand-building techniques: pinch pots, coils, slabs. Glazing and surface decoration. Students must supply some tools.", tips:"No prior experience needed." },
  { id:"CER2",   code:"FVL2000", name:"Ceramics 2",               dept:"Fine Arts", credits:1.0, gradeLevel:[9,10,11,12], prereqs:["CER1"],    gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year course. Refining ceramics skills and techniques. More independent work, dynamic pieces. Teacher signature required, C or better in Ceramics 1.",
    tips:"Completes 2-credit Fine Arts requirement with Ceramics 1." },
  { id:"CER3",   code:"FVL3000", name:"Ceramics 3",               dept:"Fine Arts", credits:1.0, gradeLevel:[10,11,12],   prereqs:["CER2"],    gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year course. Exploring advanced techniques. Build art portfolio and participate in art exhibitions. Teacher signature required, C or better in Ceramics 2.",
    tips:"Portfolio-building course. Great for students pursuing art seriously." },

  // ── FINE ARTS — MUSIC ──
  { id:"BAND",       code:"FMB2000", name:"Band 1–4",                     dept:"Fine Arts", credits:1.0, gradeLevel:[9,10,11,12], prereqs:[], gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year course (repeatable through 4 years). Open to students with two consecutive years of middle school band or 18 months private instruction. NOT introductory. Three major performances per year.",
    tips:"Must have prior band experience. Signature from current band director required." },
  { id:"ORCH",       code:"FMV2000", name:"Orchestra 1–4",                dept:"Fine Arts", credits:1.0, gradeLevel:[9,10,11,12], prereqs:[], gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year course (repeatable). Two years of orchestra or 18 months private instruction required. Advanced techniques and orchestral literature. After-school rehearsals required.",
    tips:"Must have prior orchestra experience. After-school performances and rehearsals required." },
  { id:"CHORUS1",    code:"FMC1000", name:"Chorus 1",                     dept:"Fine Arts", credits:1.0, gradeLevel:[9,10,11,12], prereqs:[], gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year course. Beginning vocal techniques, tone quality, music theory. Wide range of musical styles. Open to all students. No prerequisites.",
    tips:"No experience needed. Must perform in formal concerts. Great for fulfilling Fine Arts credit." },
  { id:"CHORUS2",    code:"FMC2000", name:"Chorus 2–4",                   dept:"Fine Arts", credits:1.0, gradeLevel:[9,10,11,12], prereqs:["CHORUS1"], gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year course (repeatable). Continues vocal development. More advanced techniques and expanded performance opportunities.", tips:"Continue each year to build Fine Arts credits and performance experience." },
  { id:"DANCE",      code:"FDC1000", name:"Creative Dance 1–3",           dept:"Fine Arts", credits:1.0, gradeLevel:[9,10,11,12], prereqs:[], gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year course (repeatable for 3 years). Choreography, ballet, street dance, partner dancing. Two recitals per year required. Individual body awareness, strength, flexibility.",
    tips:"Open to all students. Must participate in all styles and perform in two recitals per year." },
  { id:"GUITAR1",    code:"FMF1000", name:"Guitar 1",                     dept:"Fine Arts", credits:1.0, gradeLevel:[9,10,11,12], prereqs:[], gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year course. Introductory guitar: picking, strumming, ensemble performance. Addresses DOE music standards. No prior experience needed.",
    tips:"No experience needed. Fulfills Fine Arts requirement. Very popular elective." },
  { id:"PIANO1",     code:"FMK1000", name:"Piano 1",                      dept:"Fine Arts", credits:1.0, gradeLevel:[9,10,11,12], prereqs:[], gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year course. Basic piano knowledge and skills. Reading, performing, evaluating piano music. Public performance required at year end. Class size limited.",
    tips:"Teacher approval required. Public performance at year end. Limited class size." },
  { id:"PIANO2",     code:"FMK2000", name:"Piano 2–4",                    dept:"Fine Arts", credits:1.0, gradeLevel:[9,10,11,12], prereqs:["PIANO1"], gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year course (repeatable). Continues Piano 1 with advanced music theory and performance. Concert performances required. Class size limited.",
    tips:"Open to students who completed Piano 1 or have prior private piano study." },
  { id:"POLY_MUSIC", code:"FDP1000", name:"Polynesian Music & Dance 1–4", dept:"Fine Arts", credits:1.0, gradeLevel:[9,10,11,12], prereqs:[], gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year course (repeatable). Music and dances of the Polynesian archipelago. Cultural, social, historical significance. Emphasis on authentic movement, costume.",
    tips:"Open to all students. Unique Hawaiian cultural experience. Excellent Fine Arts elective." },
  { id:"UKULELE1",   code:"FML1000", name:"Ukulele 1",                    dept:"Fine Arts", credits:1.0, gradeLevel:[9,10,11,12], prereqs:[], gradCategory:"wlfa", gradCredits:1.0,
    desc:"Year course. Introductory ukulele: performing, listening to, and evaluating ukulele music. Distinctly Hawaiian cultural experience.",
    tips:"No prior experience needed. Great way to connect with Hawaiian culture through music." },

  // ── ELECTIVES ──
  { id:"CULINARY",     code:"TPN7229", name:"Culinary and Nutrition", dept:"Miscellaneous", credits:1.0, gradeLevel:[9,10,11,12], prereqs:[], gradCategory:"electives", gradCredits:1.0,
    desc:"Year course. Relationship of food to culinary careers. Hands-on food labs, nutrition, food safety, Hawaiʻi's regional cuisine, cultural food impacts.",
    tips:"One of the most popular electives at Kalani. Hands-on cooking labs throughout the year." },

  { id:"NEWSWRITE1",  code:"LJY8210", name:"Newswriting 1", dept:"Miscellaneous", credits:1.0, gradeLevel:[9,10,11,12], prereqs:[], gradCategory:"electives", gradCredits:1.0,
    desc:"Year course. Intro to school newspaper staff. Study of newspaper structure, functions, and production roles. Students write, interview, and publish.",
    tips:"Great for students interested in journalism, writing, or media." },
  { id:"NEWSWRITE2",  code:"LJY8300", name:"Newswriting 2", dept:"Miscellaneous", credits:1.0, gradeLevel:[9,10,11,12], prereqs:["NEWSWRITE1"], gradCategory:"electives", gradCredits:1.0,
    desc:"Year course. Continues Newswriting 1 with more advanced writing, production, and editorial responsibilities.",
    tips:"Earns elective credit each year. Build toward senior editorial roles." },
  { id:"NEWSWRITE3",  code:"LJY8400", name:"Newswriting 3", dept:"Miscellaneous", credits:1.0, gradeLevel:[9,10,11,12], prereqs:["NEWSWRITE2"], gradCategory:"electives", gradCredits:1.0,
    desc:"Year course. Advanced journalism: in-depth reporting, layout, and leadership within the newspaper staff.",
    tips:"Students begin taking on staff leadership and editorial direction." },
  { id:"NEWSWRITE4",  code:"LJY8500", name:"Newswriting 4", dept:"Miscellaneous", credits:1.0, gradeLevel:[9,10,11,12], prereqs:["NEWSWRITE3"], gradCategory:"electives", gradCredits:1.0,
    desc:"Year course. Senior-level journalism. Students lead production and mentor younger staff members.",
    tips:"Top tier of the newspaper program. Strong college application value for journalism/communication majors." },

  { id:"VIDPROD1",    code:"XMT10201A", name:"Video Production Television 1", dept:"Miscellaneous", credits:1.0, gradeLevel:[9,10,11,12], prereqs:[], gradCategory:"electives", gradCredits:1.0,
    desc:"Year course. Tools, techniques, and terminology of TV/video production. Filming, recording, and editing hands-on. Must take both XMT10201A and B.",
    tips:"Hands-on media production. Great for students interested in film or content creation." },
  { id:"VIDPROD2",    code:"XMT10252A", name:"Video Production Television 2", dept:"Miscellaneous", credits:1.0, gradeLevel:[10,11,12], prereqs:["VIDPROD1"], gradCategory:"electives", gradCredits:1.0,
    desc:"Year course. Longer, more complex productions: script writing, storyboarding, taping, editing, and critical analysis.",
    tips:"Builds on VP1 with more independent, complex projects." },

  { id:"YEARBOOK1",   code:"XYY8610", name:"Yearbook 1", dept:"Miscellaneous", credits:1.0, gradeLevel:[9,10,11,12], prereqs:[], gradCategory:"electives", gradCredits:1.0,
    desc:"Year course. Layout design, interviewing, caption writing, photography, and meeting deadlines. Independent thinking required. Teacher signature required.",
    tips:"After-school work may be required to meet deadlines. Great design and writing experience." },
  { id:"YEARBOOK2",   code:"XYY8630", name:"Yearbook 2", dept:"Miscellaneous", credits:1.0, gradeLevel:[9,10,11,12], prereqs:["YEARBOOK1"], gradCategory:"electives", gradCredits:1.0,
    desc:"Year course. Increased production responsibilities, more complex design and photography roles. Teacher signature required.",
    tips:"Returning staff take on section editor and design lead roles." },
  { id:"YEARBOOK3",   code:"XYY8650", name:"Yearbook 3", dept:"Miscellaneous", credits:1.0, gradeLevel:[9,10,11,12], prereqs:["YEARBOOK2"], gradCategory:"electives", gradCredits:1.0,
    desc:"Year course. Senior-level yearbook production. Students lead the book's design, photography, and editorial direction. Teacher signature required.",
    tips:"Leadership role in the yearbook. Strong portfolio piece for design and communications." },

  { id:"LEADERSHIP",  code:"XLP2000", name:"Leadership Training (Gr 10–12)", dept:"Miscellaneous", credits:1.0, gradeLevel:[10,11,12], prereqs:[], gradCategory:"electives", gradCredits:1.0,
    desc:"Year course (repeatable Gr 10/11/12/KAS). Group processes, leadership skills, planning and coordinating class and committee projects.",
    tips:"Required for class officers and KAS officers. Strongly recommended for all student leaders." },

  { id:"PATHWAY_EXP1", code:"TGG1101", name:"Pathway Exploration 1", dept:"Miscellaneous", credits:0.5, gradeLevel:[11,12], prereqs:[], gradCategory:"electives", gradCredits:0.5,
    desc:"Semester course (Sem 1). Based on Project Wayfinder. Introspective work: discover personal purpose, core values, and meaning. Must be taken with Pathway Exploration 2 in the same year.",
    tips:"Recommended for juniors and seniors. Both semesters (TGG1101 + TGG1102) must be taken together." },
  { id:"PATHWAY_EXP2", code:"TGG1102", name:"Pathway Exploration 2", dept:"Miscellaneous", credits:0.5, gradeLevel:[11,12], prereqs:["PATHWAY_EXP1"], gradCategory:"electives", gradCredits:0.5,
    desc:"Semester course (Sem 2). Students go into the community to implement a passion project tied to their identified purpose from Sem 1.",
    tips:"Community engagement and passion project required. Sem 2 of the Pathway Exploration year." },

  { id:"TRANS_HS",    code:"TGG1103", name:"Transitions to High School", dept:"Miscellaneous", credits:0.5, gradeLevel:[9], prereqs:[], gradCategory:"electives", gradCredits:0.5,
    desc:"Semester course. Assists 9th graders' transition to high school. Study habits, self-image, reading, writing, and computer literacy. Counts as elective credit only — NOT toward CTE requirement.",
    tips:"Only for incoming 9th graders. Counts as elective credit, not CTE." },
  { id:"COMMUNITY_SVC", code:"XLH2001", name:"Community Service", dept:"Miscellaneous", credits:0.5, gradeLevel:[9,10,11,12], prereqs:[], gradCategory:"electives", gradCredits:0.5,
    desc:"Semester credit for supervised volunteer work outside of school. 60+ hours earns 0.5 credit. No letter grades. May be repeated twice, but only 1.0 credit total counts toward graduation. See your counselor.",
    tips:"Great for college applications. Max 1.0 credit total counts toward graduation." },
  { id:"TEACHER_ASST", code:"TIK5930", name:"Teacher Assistant for Technology Integration", dept:"Miscellaneous", credits:1.0, gradeLevel:[10,11,12], prereqs:[], gradCategory:"electives", gradCredits:1.0,
    desc:"Year course. Students assist teacher with classroom technology integration. Teacher signature required.",
    tips:"Good way to develop tech and communication skills. Teacher signature required." },
  // ── OFF CAMPUS ──
  { id:"OFF_CAMPUS", code:"", name:"Off Campus Period", dept:"Off Campus", credits:0, gradeLevel:[12], prereqs:[],
    gradCategory:null, gradCredits:0, repeatable:true, isOffCampus:true,
    eligibility:[
      "Met ALL grad requirements (except ELA 12 & Social Studies)",
      "Completed the Personal Transition Plan (PTP)",
      "Have a qualifying reason (see below)",
    ],
    reasons:[
      { label:"Job / Internship / Volunteer / Dual Credit", limit:"Unlimited off-campus periods (on top of required courses)" },
      { label:"Job Searching", limit:"Max 2 off-campus periods (must still take 5 classes)" },
    ],
    submissions:[
      "Parent/Guardian Off Campus Agreement Forms (2 pages)",
      "Verification Documents (job offer letter, enrollment confirmation, etc.)",
      "Personal Transition Plan (PTP)",
    ],
    deadline:"5/15/26 → 2027 Google Classroom",
    warning:"If forms are not submitted by the deadline, Off Campus is revoked: 7 classes restored + mandatory in-person Counselor Advisory added.",
    desc:"",
    tips:"Eligibility is not automatic — administrative approval required. See your counselor early." },
];

// ─── SUPPORTING DATA ──────────────────────────────────────────────────────────

const DEPTS = ["All","English","Mathematics","Social Studies","Science","Health & PE","CTE","World Language","Fine Arts","Miscellaneous","Off Campus"];
const DEPT_COLORS = {
  "English":"#C84B31","Mathematics":"#059669","Social Studies":"#7C3AED","Science":"#D97706",
  "Health & PE":"#0891B2","CTE":"#B00804","World Language":"#0284C7","Fine Arts":"#DB2777",
  "Miscellaneous":"#6B7280","Off Campus":"#475569"
};

const DEFAULT_PLAN = {
  9:  ["GEO","ELA1","PID","MHH","ISCI","PE_LF","HEALTH","PTP"],
  10: ["ALG1","ELA2","USH","BIO1_10","PE_LA","JPN1"],
  11: ["ALG2","ELA3","WH","HCHEM","JPN2"],
  12: ["TRIG","ELA4","ECON_PSYCH","MARINE"],
};

function getCourse(id) { return COURSES.find(c => c.id === id); }
function getCourseName(id) { const c = getCourse(id); return c ? c.name : id; }

// Courses that are treated as equivalent for prereq purposes.
// Key = the prereq ID listed in a course definition.
// Value = other IDs that ALSO satisfy that prereq.
// Relationships are DIRECTIONAL — only add where the substitute is a superset/equivalent.
const PREREQ_EQUIV = {
  // Biology 1: grade-9 track and grade-10 track are the same course (mutual)
  "BIO1_10": ["BIO1_9"],
  "BIO1_9":  ["BIO1_10"],

  // Chemistry: Honors Chem covers everything in standard Chem and more.
  // → HCHEM satisfies a "CHEM" prereq (e.g. AP Bio, AP EnvSci).
  // → CHEM does NOT satisfy a "HCHEM" prereq (AP Chemistry requires Honors specifically).
  "CHEM": ["HCHEM"],

  // Social Studies: AP versions satisfy the same prereq as standard versions.
  // AP_USH satisfies the "USH" prereq for World History / AP World History.
  "USH": ["AP_USH"],
  // AP_WH satisfies the "WH" prereq for 12th-grade SS courses.
  "WH":  ["AP_WH"],

  // English: AP English Language & Composition (Grade 11) is taken INSTEAD of ELA 3.
  // → AP_ENG3 satisfies the "ELA3" prereq for ELA 4 and AP English 4.
  // ELA3 already satisfies its own "ELA3" prereq directly; no reverse equiv needed.
  "ELA3": ["AP_ENG3"],

  // Japanese: Honors levels are a superset of standard levels.
  // → JPN2H satisfies the "JPN2" prereq for Japanese 3 (standard track).
  // → JPN2 does NOT satisfy JPN3H's "JPN2H" prereq (honors track requires honors).
  "JPN2": ["JPN2H"],
  // → JPN3H satisfies the "JPN3" prereq for Japanese 4 (standard track).
  // → JPN3 does NOT satisfy AP_JPN's "JPN3H" prereq.
  "JPN3": ["JPN3H"],
};

// Check if a prereq ID is satisfied by the set of completed course IDs
function isPrereqSatisfied(prereqId, completedIds) {
  if (completedIds.includes(prereqId)) return true;
  const equivs = PREREQ_EQUIV[prereqId] || [];
  return equivs.some(eq => completedIds.includes(eq));
}

// Get all courses in grades strictly before targetGrade
function getCoursesBeforeGrade(plan, targetGrade) {
  return Object.entries(plan)
    .filter(([g]) => Number(g) < targetGrade)
    .flatMap(([, ids]) => ids);
}

// Get all courses in plan up to and including targetGrade
function getAllCoursesUpTo(plan, targetGrade) {
  return Object.entries(plan)
    .filter(([g]) => Number(g) <= targetGrade)
    .flatMap(([, ids]) => ids);
}

// Returns array of unmet prereq names for a course given what's been completed
function getUnmetPrereqs(courseId, completedIds) {
  const course = getCourse(courseId);
  if (!course) return [];
  return course.prereqs.filter(pid => !isPrereqSatisfied(pid, completedIds));
}

// ── HONORS REQUIREMENTS ───────────────────────────────────────────────────────
const HONORS_DEFS = [
  {
    id: "academic",
    label: "Academic Honors",
    color: "#7C3AED",
    icon: "🎖",
    description: "GPA 3.0+ required",
    checks: [
      { id:"math4", label:"4 credits Math (incl. Algebra 2 + one beyond)", desc:"Algebra 2 + one of: Trig/PreCal, Alg3/Stats, Calculus, AP Calculus, AP CS A, AP CS Principles, Intro to College Math" },
      { id:"sci4",  label:"4 credits Science (incl. Biology 1)",             desc:"Biology 1 + 3 other science credits" },
      { id:"ap2",   label:"2+ AP/IB/Running Start credits",                  desc:"At least 2 credits from AP courses" },
    ],
  },
  {
    id: "stem",
    label: "STEM Honors",
    color: "#0891B2",
    icon: "🔬",
    description: "GPA 3.0+ required",
    checks: [
      { id:"math4", label:"4 credits Math (incl. Algebra 2 + one beyond)", desc:"Same math requirement as Academic Honors" },
      { id:"sci4",  label:"4 credits Science (incl. Biology 1)",             desc:"Same science requirement as Academic Honors" },
      { id:"stem_cap", label:"STEM Capstone Project",                        desc:"Successful completion of STEM Capstone (XAT1000)" },
    ],
  },
  {
    id: "cte",
    label: "CTE Honors",
    color: "#B00804",
    icon: "🛠",
    description: "GPA 3.0+ required",
    checks: [
      { id:"cte_seq", label:"Complete 2-course CTE pathway sequence",         desc:"2 courses in the same CTE pathway with B or better" },
      { id:"cte_perf",label:"Meet/exceed proficiency on performance assessment", desc:"Assessed per program of study" },
    ],
  },
];

// IDs that count as "beyond Algebra 2" for Academic/STEM Honors
const BEYOND_ALG2_IDS = ["TRIG","ALG3","CALC","AP_CALC","AP_CSA","AP_CSP","ICMATH"];

function computeHonorsProgress(plan) {
  const allIds = Object.values(plan).flat();
  const allCourses = allIds.map(id => getCourse(id)).filter(Boolean);

  const mathCredits = allCourses.filter(c=>c.dept==="Mathematics").reduce((s,c)=>s+c.credits,0);
  const sciCredits  = allCourses.filter(c=>c.dept==="Science").reduce((s,c)=>s+c.credits,0);
  const hasAlg2     = allIds.some(id=>id==="ALG2");
  const hasBeyondAlg2 = allIds.some(id=>BEYOND_ALG2_IDS.includes(id));
  const hasBio1     = allIds.some(id=>["BIO1_9","BIO1_10"].includes(id));
  const apCredits   = allCourses.filter(c=>c.isAP).reduce((s,c)=>s+c.credits,0);
  const hasStemCap  = allIds.includes("STEM_CAP");

  const CTE_PATHWAYS = {
    "Agriculture":    ["AFNR1","SAS2","LAS3"],
    "Business":       ["BIZ1","ENT1"],
    "Digital Media":  ["DIGPHOTO1","DIGDESIGN1","DIGDESIGN2"],
    "Engineering":    ["ENG_FOUND","ENG_T1","ENG_T2","ENG_T3"],
    "Health Services":["HLTH_FOUND","ADV_HLTH","THERAPEUTIC"],
    "IT/CS":          ["CS_FOUND","AP_CSA","AP_CSP"],
    "JROTC":          ["JROTC1","JROTC2"],
  };
  const ctePathwayCounts = {};
  Object.entries(CTE_PATHWAYS).forEach(([pathway, ids]) => {
    const credits = ids.filter(id => allIds.includes(id))
      .reduce((s, id) => { const c = getCourse(id); return s + (c?.credits||0); }, 0);
    if (credits > 0) ctePathwayCounts[pathway] = credits;
  });
  const hasCTESeq = Object.values(ctePathwayCounts).some(v=>v>=2);

  const math4Met = mathCredits >= 4 && hasAlg2 && hasBeyondAlg2;
  const sci4Met  = sciCredits >= 4 && hasBio1;

  return {
    academic: {
      math4:   { met: math4Met,    detail: `${mathCredits.toFixed(1)}/4.0 math credits${hasAlg2?"":", needs Algebra 2"}${hasBeyondAlg2?"":", needs one course beyond Algebra 2"}` },
      sci4:    { met: sci4Met,     detail: `${sciCredits.toFixed(1)}/4.0 science credits${hasBio1?"":", needs Biology 1"}` },
      ap2:     { met: apCredits>=2, detail: `${apCredits.toFixed(1)}/2.0 AP credits` },
    },
    stem: {
      math4:    { met: math4Met,    detail: `${mathCredits.toFixed(1)}/4.0 math credits${hasAlg2?"":", needs Algebra 2"}${hasBeyondAlg2?"":", needs one course beyond Algebra 2"}` },
      sci4:     { met: sci4Met,     detail: `${sciCredits.toFixed(1)}/4.0 science credits${hasBio1?"":", needs Biology 1"}` },
      stem_cap: { met: hasStemCap,  detail: hasStemCap ? "STEM Capstone added ✓" : "Add STEM Capstone to your plan" },
    },
    cte: {
      cte_seq:  { met: hasCTESeq,  detail: hasCTESeq ? "2+ credits in one CTE pathway ✓" : "Add 2 courses in the same CTE pathway" },
      cte_perf: { met: false,       detail: "Assessed by teacher — cannot be tracked here" },
    },
  };
}

function deptColor(dept) { return DEPT_COLORS[dept] || "#6B7280"; }

function calcPlannerCredits(plan) {
  // Raw accumulated credits per category, uncapped
  const raw = {};
  GRAD_REQUIREMENTS.forEach(r => { raw[r.id] = 0; });

  let total = 0;
  Object.values(plan).forEach(courses => {
    courses.forEach(cid => {
      const c = getCourse(cid);
      if (!c) return;
      total += c.credits;
      if (!c.gradCategory || c.gradCredits == null) return;

      if (c.gradCategory === 'electives') {
        // Courses that are always free electives (Misc, AP Sem/Res, etc.)
        raw.electives += c.gradCredits;
        return;
      }

      const req = GRAD_REQUIREMENTS.find(r => r.id === c.gradCategory);
      if (!req) return;

      // Credits up to the minimum go into the subject bucket; overflow → electives
      const space = Math.max(0, req.required - raw[c.gradCategory]);
      const used = Math.min(c.gradCredits, space);
      const overflow = c.gradCredits - used;
      raw[c.gradCategory] += used;
      raw.electives += overflow;
    });
  });

  // Cap each bucket at the requirement for display
  const cats = {};
  GRAD_REQUIREMENTS.forEach(r => { cats[r.id] = Math.min(raw[r.id] || 0, r.required); });
  return { cats, total };
}

export default function KalaniPlanner() {
  // V3: courses & gradReqs will come from Supabase via useCourseData()
  // For now they resolve instantly from local hardcoded data
  const { courses: liveCourses, gradReqs: liveGradReqs, loading: dataLoading } = useCourseData();
  const { announcements } = useAnnouncements();

  const [page, setPage] = useState("home");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [plan, setPlan] = useState(() => {
    try {
      const saved = localStorage.getItem('kalani-compass-plan');
      if (saved) return JSON.parse(saved);
    } catch {}
    return JSON.parse(JSON.stringify(DEFAULT_PLAN));
  });
  const [addTarget, setAddTarget] = useState(null);
  const [addSearch, setAddSearch] = useState("");
  const [honorsOpen, setHonorsOpen] = useState({academic:false,stem:false,cte:false});
  const [prereqWarn, setPrereqWarn] = useState(null); // {courseId, grade, unmet:[]}
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    try { localStorage.setItem('kalani-compass-plan', JSON.stringify(plan)); } catch {}
  }, [plan]);

  const { cats, total } = useMemo(() => calcPlannerCredits(plan), [plan]);

  const filteredCourses = useMemo(() => {
    let list = COURSES;
    if (filterDept !== "All") list = list.filter(c => c.dept === filterDept);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dept.toLowerCase().includes(q) ||
        (c.desc||"").toLowerCase().includes(q)
      );
    }
    return list;
  }, [filterDept, searchQuery]);

  const addSearchResults = useMemo(() => {
    if (!addSearch.trim()) return COURSES.slice(0, 14);
    const q = addSearch.toLowerCase();
    return COURSES.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.dept.toLowerCase().includes(q)
    ).slice(0, 16);
  }, [addSearch]);

  const honorsProgress = useMemo(() => computeHonorsProgress(plan), [plan]);

  function removeCourse(grade, idx) {
    setPlan(p => { const n = JSON.parse(JSON.stringify(p)); n[grade].splice(idx, 1); return n; });
  }
  const GRADE_MAX = 9; // 7 in-school + 2 online (future)

  function addCourseToPlan(courseId) {
    if (!addTarget) return;
    const course = getCourse(courseId);
    if (plan[addTarget].length >= GRADE_MAX) return; // cap enforced silently (button disabled)
    const completedBefore = getCoursesBeforeGrade(plan, addTarget);
    const unmet = getUnmetPrereqs(courseId, completedBefore);
    if (unmet.length > 0) {
      setPrereqWarn({ courseId, grade: addTarget, unmet });
      return;
    }
    setPlan(p => {
      const n = JSON.parse(JSON.stringify(p));
      if (!course?.repeatable && n[addTarget].includes(courseId)) return p;
      n[addTarget].push(courseId);
      return n;
    });
    setAddTarget(null); setAddSearch("");
  }
  function forceAddCourse(courseId) {
    if (!addTarget) return;
    const course = getCourse(courseId);
    if (plan[addTarget].length >= GRADE_MAX) return;
    setPlan(p => {
      const n = JSON.parse(JSON.stringify(p));
      if (!course?.repeatable && n[addTarget].includes(courseId)) return p;
      n[addTarget].push(courseId);
      return n;
    });
    setAddTarget(null); setAddSearch(""); setPrereqWarn(null);
  }

  return (
    <>
      <style>{`
        ${FONTS}
        *{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --red:#B00804; --red-dark:#950A07; --red-deep:#6B0503;
          --slate:#1C2B3A; --slate-mid:#2D3F52; --slate-light:#3D5166;
          --bg:#F7F8FA; --card:#fff; --text:#111827; --muted:#6B7280;
          --border:#E5E7EB; --light-red:#FFF1F0;
        }
        body{font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);}
        .fade-in{animation:fadeIn 0.3s ease;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .nav-link{cursor:pointer;padding:8px 15px;border-radius:8px;font-weight:600;font-size:14px;
          color:rgba(255,255,255,0.65);transition:all 0.2s;white-space:nowrap;}
        .nav-link:hover{color:#fff;background:rgba(255,255,255,0.14);}
        .nav-link.active{color:#fff;background:rgba(255,255,255,0.22);}
        .c-card{background:white;border-radius:12px;padding:16px;border:1px solid var(--border);
          cursor:pointer;transition:all 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.06);}
        .c-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.1);border-color:var(--red);}
        .badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;
          font-weight:700;letter-spacing:0.03em;text-transform:uppercase;}
        .req-bar{height:6px;border-radius:3px;background:rgba(255,255,255,0.12);overflow:hidden;}
        .req-fill{height:100%;border-radius:3px;transition:width 0.6s cubic-bezier(.4,0,.2,1);}
        .plan-cell{background:white;border-radius:12px;padding:14px;border:1px solid var(--border);}
        .p-tag{display:flex;align-items:center;gap:7px;padding:6px 9px;border-radius:7px;
          margin:2px;font-size:12px;font-weight:600;flex:1 0 calc(50% - 4px);min-width:150px;}
        .rm-btn{margin-left:auto;cursor:pointer;color:#9CA3AF;font-size:16px;line-height:1;padding:0 2px;flex-shrink:0;}
        .rm-btn:hover{color:var(--red);}
        .add-btn{border:1.5px dashed #D1D5DB;border-radius:7px;padding:7px;text-align:center;
          font-size:11px;color:#9CA3AF;cursor:pointer;margin-top:6px;transition:all 0.2s;}
        .add-btn:hover{border-color:var(--red);color:var(--red);background:var(--light-red);}
        .overlay{position:fixed;inset:0;background:rgba(17,24,39,0.65);display:flex;align-items:center;
          justify-content:center;z-index:1000;padding:20px;backdrop-filter:blur(5px);}
        .modal{background:white;border-radius:20px;max-width:620px;width:100%;max-height:90vh;
          overflow-y:auto;box-shadow:0 25px 60px rgba(0,0,0,0.22);}
        .si{width:100%;padding:11px 16px;border-radius:10px;border:2px solid var(--border);
          font-size:14px;font-family:'Plus Jakarta Sans',sans-serif;outline:none;transition:border 0.2s;background:#fff;}
        .si:focus{border-color:var(--red);}
        .tag-ap{background:#FEF3C7;color:#92400E;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:800;}
        .prereq-chip{padding:5px 11px;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.15s;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px;}
        .warn-banner{background:#FEF9C3;border:1.5px solid #EAB308;border-radius:10px;padding:12px 16px;margin:10px 0;font-size:13px;color:#78350F;}
        .honors-check{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);}
        .honors-check:last-child{border-bottom:none;}
        @media(max-width:900px){
          .plan-grid{grid-template-columns:1fr 1fr !important;}
        }
        @media(max-width:768px){
          .planner-layout{flex-direction:column !important;}
          .planner-sidebar{width:100% !important;position:static !important;margin-top:28px;}
          .planner-sidebar > div{position:static !important;}
        }
        @media(max-width:600px){
          .plan-grid{grid-template-columns:1fr !important;}
          .catalog-grid{grid-template-columns:1fr !important;}
          .stat-grid{grid-template-columns:1fr 1fr !important;}
          .grad-grid{grid-template-columns:1fr !important;}
          nav{gap:0 !important;padding:0 12px !important;}
          .nav-link{padding:8px 10px !important;font-size:12px !important;}
          .modal{border-radius:14px !important;margin:10px !important;}
          h1{font-size:28px !important;}
          .hero-btns{flex-direction:column !important;align-items:center !important;}
        }
      `}</style>

      <div style={{ minHeight:"100vh" }}>

        {/* NAV */}
        <nav style={{ background:`linear-gradient(90deg,var(--red-deep),var(--red-dark) 50%,var(--red))`,
          padding:"0 24px", display:"flex", alignItems:"center", gap:"2px", height:"58px",
          position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 20px rgba(107,5,3,0.4)" }}>
          <div onClick={()=>setPage("home")}
            style={{ fontFamily:"'Playfair Display',serif", color:"white", fontSize:"20px", fontWeight:700,
              marginRight:"20px", cursor:"pointer", textShadow:"0 1px 4px rgba(0,0,0,0.3)" }}>
            🦅 Kalani Compass
          </div>
          {[["home","Home"],["catalog","Courses"],["planner","4-Year Planner"]].map(([id,label])=>(
            <div key={id} className={`nav-link${page===id?" active":""}`} onClick={()=>setPage(id)}>{label}</div>
          ))}
          <div style={{ marginLeft:"auto" }} />
        </nav>

        {/* ── HOME ── */}
        {page==="home" && (
          <div className="fade-in">
            <div style={{ background:`linear-gradient(135deg,var(--red-deep) 0%,var(--red-dark) 55%,var(--red) 100%)`,
              padding:"64px 24px 72px", textAlign:"center", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", inset:0, opacity:0.04,
                backgroundImage:"radial-gradient(circle, white 1.5px, transparent 1.5px)", backgroundSize:"28px 28px" }} />
              <div style={{ position:"relative", zIndex:1 }}>
                <p style={{ color:"rgba(255,255,255,0.65)", fontSize:"12px", fontWeight:800,
                  letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:"14px" }}>
                  Kalani High School — Honolulu, Hawaiʻi
                </p>
                <h1 style={{ fontFamily:"'Playfair Display',serif", color:"white",
                  fontSize:"clamp(30px,5.5vw,58px)", fontWeight:700, lineHeight:1.15, marginBottom:"18px",
                  textShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>
                  Plan your 4 years<br/>at Kalani
                </h1>
                <p style={{ color:"rgba(255,255,255,0.72)", fontSize:"16px", maxWidth:"460px",
                  margin:"0 auto 36px", lineHeight:1.7 }}>
                  Explore every course, understand prerequisites, and build a graduation plan before you register.
                </p>
                <div className="hero-btns" style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
                  <button onClick={()=>setPage("catalog")}
                    style={{ background:"white", color:"var(--red)", border:"none", borderRadius:"10px",
                      padding:"13px 26px", fontSize:"14px", fontWeight:800, cursor:"pointer",
                      boxShadow:"0 4px 20px rgba(0,0,0,0.2)", fontFamily:"inherit" }}>
                    Browse All Courses →
                  </button>
                  <button onClick={()=>setPage("planner")}
                    style={{ background:"rgba(255,255,255,0.1)", color:"white",
                      border:"1.5px solid rgba(255,255,255,0.35)", borderRadius:"10px",
                      padding:"13px 26px", fontSize:"14px", fontWeight:800, cursor:"pointer",
                      fontFamily:"inherit" }}>
                    Open 4-Year Planner
                  </button>
                </div>
              </div>
            </div>

            {/* Search */}
            <div style={{ maxWidth:"580px", margin:"-26px auto 0", padding:"0 24px", position:"relative", zIndex:10 }}>
              <input className="si" placeholder="🔍  Search — try 'AP Calculus', 'Computer Science', 'Marine Science'…"
                value={searchQuery}
                onChange={e=>{ setSearchQuery(e.target.value); if(e.target.value) setPage("catalog"); }}
                style={{ boxShadow:"0 8px 32px rgba(176,8,4,0.15)", fontSize:"15px", padding:"16px 20px" }} />
            </div>

            {/* Stats */}
            <div className="stat-grid" style={{ maxWidth:"840px", margin:"44px auto 0", padding:"0 24px",
              display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"14px" }}>
              {[{n:"24",l:"Credits to graduate",i:"🎓",c:"#B00804"},{n:"130+",l:"Courses in catalog",i:"📚",c:"#0369A1"},
                {n:"18",l:"AP courses offered",i:"⭐",c:"#7C3AED"},{n:"7",l:"CTE career pathways",i:"🛠",c:"#0F766E"}].map(s=>(
                <div key={s.n} style={{ background:"white", borderRadius:"14px", padding:"22px",
                  textAlign:"center", border:"1px solid var(--border)", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize:"28px", marginBottom:"8px" }}>{s.i}</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"34px", fontWeight:700,
                    color:s.c }}>{s.n}</div>
                  <div style={{ fontSize:"12px", color:"var(--muted)", lineHeight:1.4 }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Dept links */}
            <div style={{ maxWidth:"840px", margin:"32px auto 0", padding:"0 24px" }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", color:"var(--text)",
                marginBottom:"14px" }}>Browse by Department</h2>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                {DEPTS.filter(d=>d!=="All").map(d=>(
                  <div key={d} onClick={()=>{ setFilterDept(d); setPage("catalog"); }}
                    style={{ padding:"7px 15px", borderRadius:"8px", cursor:"pointer",
                      background:deptColor(d)+"14", border:`1.5px solid ${deptColor(d)}35`,
                      color:deptColor(d), fontWeight:700, fontSize:"13px", transition:"all 0.2s" }}
                    onMouseEnter={e=>e.currentTarget.style.background=deptColor(d)+"28"}
                    onMouseLeave={e=>e.currentTarget.style.background=deptColor(d)+"14"}>
                    {d}
                  </div>
                ))}
              </div>
            </div>

            {/* Grad requirements */}
            <div style={{ maxWidth:"840px", margin:"36px auto 64px", padding:"0 24px" }}>
              <div style={{ background:`linear-gradient(135deg,var(--slate) 0%,var(--slate-mid) 100%)`,
                borderRadius:"18px", padding:"28px" }}>
                <h2 style={{ fontFamily:"'Playfair Display',serif", color:"white", fontSize:"22px",
                  marginBottom:"6px" }}>🎓 Graduation Requirements</h2>
                <p style={{ color:"rgba(255,255,255,0.55)", fontSize:"13px", marginBottom:"22px" }}>
                  24 total credits required for a Hawaiʻi High School Diploma
                </p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"12px" }}>
                  {GRAD_REQUIREMENTS.map(r=>(
                    <div key={r.id} style={{ background:"rgba(255,255,255,0.07)", borderRadius:"10px", padding:"14px",
                      borderLeft:`3px solid ${r.color}` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px",
                        fontSize:"13px", fontWeight:700 }}>
                        <span style={{ color:"rgba(255,255,255,0.92)" }}>{r.label}</span>
                        <span style={{ color:r.color, fontVariantNumeric:"tabular-nums" }}>{r.required} cr</span>
                      </div>
                      <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.48)", lineHeight:1.55 }}>
                        {r.breakdown.join(" • ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CATALOG ── */}
        {page==="catalog" && (
          <div className="fade-in" style={{ maxWidth:"1200px", margin:"0 auto", padding:"32px 24px" }}>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"30px", color:"var(--red-dark)",
              marginBottom:"22px" }}>Course Catalog</h1>
            <div style={{ display:"flex", gap:"12px", marginBottom:"20px", flexWrap:"wrap", alignItems:"center" }}>
              <input className="si" placeholder="🔍 Search courses…" value={searchQuery}
                onChange={e=>setSearchQuery(e.target.value)}
                style={{ flex:"1", minWidth:"200px", maxWidth:"320px" }} />
              <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
                {DEPTS.map(d=>(
                  <div key={d} onClick={()=>setFilterDept(d)}
                    style={{ padding:"6px 12px", borderRadius:"7px", cursor:"pointer", fontSize:"12px",
                      fontWeight:700, transition:"all 0.15s",
                      background:filterDept===d?"var(--red)":"white",
                      color:filterDept===d?"white":"var(--muted)",
                      border:`1.5px solid ${filterDept===d?"var(--red)":"var(--border)"}` }}>
                    {d}
                  </div>
                ))}
              </div>
            </div>
            <p style={{ fontSize:"13px", color:"var(--muted)", marginBottom:"18px" }}>
              Showing {filteredCourses.length} course{filteredCourses.length!==1?"s":""}
            </p>
            <div className="catalog-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(295px,1fr))", gap:"14px" }}>
              {filteredCourses.map(c=>(
                <div key={c.id} className="c-card" onClick={()=>setSelectedCourse(c)}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
                    <span className="badge" style={{ background:deptColor(c.dept)+"1A", color:deptColor(c.dept) }}>{c.dept}</span>
                    <div style={{ display:"flex", gap:"5px", alignItems:"center" }}>
                      {c.isAP&&<span className="tag-ap">AP</span>}
                      <span style={{ fontSize:"12px", fontWeight:700, color:"var(--muted)" }}>{c.credits}cr</span>
                    </div>
                  </div>
                  <h3 style={{ fontSize:"14px", fontWeight:700, color:"var(--text)", lineHeight:1.35, marginBottom:"4px" }}>{c.name}</h3>
                  {c.code&&<p style={{ fontSize:"11px", color:"#A08080", marginBottom:"6px" }}>{c.code}</p>}
                  <p style={{ fontSize:"12px", color:"var(--muted)", lineHeight:1.5,
                    display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{c.desc}</p>
                  {c.prereqs.length>0&&(
                    <div style={{ marginTop:"9px", fontSize:"11px", color:"var(--red)", fontWeight:700 }}>
                      Prereqs: {c.prereqs.map(getCourseName).join(", ")}
                    </div>
                  )}
                  <div style={{ marginTop:"8px", fontSize:"11px", color:"var(--muted)" }}>
                    Grade {c.gradeLevel.join("/")} · {c.credits===0.5?"Semester":"Year"}
                  </div>
                </div>
              ))}
              {filteredCourses.length===0&&(
                <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"60px", color:"var(--muted)" }}>
                  <div style={{ fontSize:"44px", marginBottom:"16px" }}>🔍</div>
                  <p style={{ fontSize:"16px", fontWeight:700 }}>No courses found</p>
                  <p style={{ fontSize:"13px" }}>Try a different search term or department filter</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PLANNER ── */}
        {page==="planner" && (
          <div className="fade-in" style={{ maxWidth:"1180px", margin:"0 auto", padding:"32px 24px" }}>
            <div className="planner-layout" style={{ display:"flex", gap:"28px", alignItems:"flex-start", flexWrap:"wrap" }}>
              <div style={{ flex:"1", minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", flexWrap:"wrap", gap:"10px", marginBottom:"6px" }}>
                  <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"28px", color:"var(--red-dark)" }}>4-Year Course Planner</h1>
                  {showResetConfirm ? (
                    <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
                      <span style={{ fontSize:"12px", color:"var(--muted)", fontWeight:600 }}>
                        Reset all 4 grades?
                      </span>
                      <button onClick={()=>{ setPlan(JSON.parse(JSON.stringify(DEFAULT_PLAN))); setShowResetConfirm(false); }}
                        style={{ background:"var(--red)", color:"white", border:"none",
                          borderRadius:"7px", padding:"5px 12px", fontSize:"12px", fontWeight:700,
                          cursor:"pointer", fontFamily:"inherit" }}>
                        Yes, reset
                      </button>
                      <button onClick={()=>setShowResetConfirm(false)}
                        style={{ background:"white", color:"var(--muted)", border:"1.5px solid var(--border)",
                          borderRadius:"7px", padding:"5px 12px", fontSize:"12px", fontWeight:600,
                          cursor:"pointer", fontFamily:"inherit" }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                  <button onClick={()=>setShowResetConfirm(true)}
                    style={{ background:"white", color:"var(--muted)", border:"1.5px solid var(--border)",
                      borderRadius:"8px", padding:"6px 13px", fontSize:"12px", fontWeight:600,
                      cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                    ↺ Reset Plan
                  </button>
                  )}
                </div>
                <p style={{ fontSize:"13px", color:"var(--muted)", marginBottom:"22px" }}>
                  Click a course name to view details · ⚠️ = missing prereq · Click × to remove
                </p>

                {[9,10,11,12].map(grade=>{
                  const gradeCredits = plan[grade].reduce((s,cid)=>{ const c=getCourse(cid); return s+(c?.credits||0); },0);
                  const atCap = plan[grade].length >= GRADE_MAX;
                  return (
                    <div key={grade} style={{ marginBottom:"22px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"9px" }}>
                        <div style={{ background:`linear-gradient(90deg,var(--red-dark),var(--red))`,
                          color:"white", borderRadius:"8px", padding:"5px 14px",
                          fontSize:"13px", fontWeight:800, boxShadow:"0 2px 8px rgba(176,8,4,0.25)" }}>
                          Grade {grade}
                        </div>
                        <div style={{ fontSize:"12px", color: atCap?"#B45309":"var(--muted)", fontWeight: atCap?700:400 }}>
                          {plan[grade].length}/{GRADE_MAX} · {gradeCredits.toFixed(1)} credits
                          {atCap && " · max reached"}
                        </div>
                      </div>
                      <div className="plan-cell">
                        <div style={{ display:"flex", flexWrap:"wrap" }}>
                          {plan[grade].map((cid,idx)=>{
                            const c=getCourse(cid);
                            if(!c) return null;
                            const col=deptColor(c.dept);
                            const isOffCampus = cid==="OFF_CAMPUS";
                            const before = getCoursesBeforeGrade(plan, grade);
                            const unmet = isOffCampus ? [] : getUnmetPrereqs(cid, before);
                            return (
                              <div key={`${cid}-${idx}`} className="p-tag"
                                style={{ background: isOffCampus?"#F1F5F9":col+"16",
                                  border:`1px solid ${isOffCampus?"#CBD5E1":col+"28"}`,
                                  maxWidth:"calc(50% - 4px)" }}>
                                <div style={{ width:"7px",height:"7px",borderRadius:"50%",
                                  background: isOffCampus?"#475569":col, flexShrink:0 }}/>
                                <span style={{ color: isOffCampus?"#475569":col, flex:1, lineHeight:1.3, cursor:"pointer" }}
                                  onClick={()=>setSelectedCourse(c)}>
                                  {isOffCampus ? "🚗 Off Campus" : c.name}
                                </span>
                                {c.isAP&&<span className="tag-ap">AP</span>}
                                {unmet.length>0 && (
                                  <span title={`Missing prereqs: ${unmet.map(getCourseName).join(", ")}`}
                                    style={{ fontSize:"13px", cursor:"help" }}>⚠️</span>
                                )}
                                <span className="rm-btn" onClick={()=>removeCourse(grade,idx)}>×</span>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ display:"flex", gap:"8px", marginTop:"6px" }}>
                          <div className="add-btn" style={{ flex:1, opacity: atCap?0.4:1, cursor: atCap?"not-allowed":"pointer",
                            pointerEvents: atCap?"none":"auto" }}
                            onClick={()=>{ if(!atCap) setAddTarget(grade); }}>
                            {atCap ? `✋ Max ${GRADE_MAX} courses` : "+ Add a Course"}
                          </div>
                          {grade===12&&(
                            <div className="add-btn"
                              style={{ flex:"0 0 auto", borderColor:"#64748B", color:"#64748B",
                                opacity: atCap?0.4:1, cursor: atCap?"not-allowed":"pointer",
                                pointerEvents: atCap?"none":"auto" }}
                              onClick={()=>{ if(!atCap) setPlan(p=>{ const n=JSON.parse(JSON.stringify(p)); n[12].push("OFF_CAMPUS"); return n; }); }}>
                              🚗 Off Campus
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── SIDEBAR ── */}
              <div className="planner-sidebar" style={{ width:"265px", flexShrink:0 }}>
                <div style={{ background:`linear-gradient(170deg,var(--slate) 0%,var(--slate-mid) 100%)`,
                  borderRadius:"16px", padding:"22px", position:"sticky", top:"72px",
                  boxShadow:"0 8px 32px rgba(0,0,0,0.22)" }}>

                  <h2 style={{ fontFamily:"'Playfair Display',serif", color:"white", fontSize:"18px",
                    marginBottom:"4px" }}>Graduation Progress</h2>
                  <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)", marginBottom:"14px" }}>
                    {total.toFixed(1)} / 24.0 credits planned
                  </div>
                  <div style={{ height:"10px", borderRadius:"5px", background:"rgba(255,255,255,0.1)",
                    overflow:"hidden", marginBottom:"20px" }}>
                    <div style={{ height:"100%", borderRadius:"5px", transition:"width 0.6s cubic-bezier(.4,0,.2,1)",
                      width:`${Math.min(100,(total/24)*100)}%`,
                      background:"linear-gradient(90deg,var(--red),#E53E3E)" }} />
                  </div>
                  {GRAD_REQUIREMENTS.map(r=>{
                    const earned=cats[r.id]||0;
                    const pct=Math.min(100,(earned/r.required)*100);
                    const done=earned>=r.required;
                    return (
                      <div key={r.id} style={{ marginBottom:"12px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between",
                          fontSize:"11px", fontWeight:700, marginBottom:"5px" }}>
                          <span style={{ color: done ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.65)",
                            display:"flex", alignItems:"center", gap:"4px" }}>
                            {done && <span style={{ color:r.color, fontSize:"10px" }}>✓</span>}
                            {r.label}
                          </span>
                          <span style={{ color:done?r.color:"rgba(255,255,255,0.4)",
                            fontVariantNumeric:"tabular-nums" }}>
                            {earned.toFixed(1)}/{r.required}
                          </span>
                        </div>
                        <div className="req-bar">
                          <div className="req-fill"
                            style={{ width:`${pct}%`, background: r.color,
                              opacity: done ? 1 : 0.75 }} />
                        </div>
                      </div>
                    );
                  })}

                  <div style={{ borderTop:"1px solid rgba(255,255,255,0.12)", margin:"18px 0 14px" }} />
                  <div style={{ fontSize:"11px", fontWeight:800, letterSpacing:"0.1em",
                    textTransform:"uppercase", color:"rgba(255,255,255,0.4)", marginBottom:"10px" }}>
                    Honors Certificates
                  </div>
                  <p style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)", marginBottom:"12px", lineHeight:1.5 }}>
                    All require GPA 3.0+. Tap to track progress.
                  </p>

                  {HONORS_DEFS.map(hdef=>{
                    const prog = honorsProgress[hdef.id];
                    const metCount = Object.values(prog).filter(v=>v.met).length;
                    const total_chks = hdef.checks.length;
                    const isOpen = honorsOpen[hdef.id];
                    const allMet = metCount === total_chks;
                    return (
                      <div key={hdef.id} style={{ marginBottom:"8px" }}>
                        <div onClick={()=>setHonorsOpen(o=>({...o,[hdef.id]:!o[hdef.id]}))}
                          style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                            padding:"8px 10px", borderRadius:"8px", cursor:"pointer",
                            background: allMet?"rgba(22,163,74,0.18)":"rgba(255,255,255,0.07)",
                            border:`1px solid ${allMet?"rgba(22,163,74,0.4)":"rgba(255,255,255,0.1)"}`,
                            transition:"all 0.15s" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
                            <span style={{ fontSize:"14px" }}>{hdef.icon}</span>
                            <span style={{ fontSize:"12px", fontWeight:700, color:"white" }}>{hdef.label}</span>
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                            <span style={{ fontSize:"11px", fontWeight:700,
                              color: allMet?"#4ADE80":"rgba(255,255,255,0.45)" }}>
                              {metCount}/{total_chks}
                            </span>
                            <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.4)" }}>
                              {isOpen?"▲":"▼"}
                            </span>
                          </div>
                        </div>
                        {isOpen && (
                          <div style={{ background:"rgba(0,0,0,0.2)", borderRadius:"0 0 8px 8px",
                            padding:"10px", marginTop:"-4px", border:"1px solid rgba(255,255,255,0.08)",
                            borderTop:"none" }}>
                            {hdef.checks.map(chk=>{
                              const result = prog[chk.id];
                              return (
                                <div key={chk.id} style={{ display:"flex", gap:"8px", padding:"6px 0",
                                  borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                                  <span style={{ fontSize:"13px", flexShrink:0, marginTop:"1px" }}>
                                    {result?.met ? "✅" : "⬜"}
                                  </span>
                                  <div>
                                    <div style={{ fontSize:"11px", fontWeight:600, color:"rgba(255,255,255,0.85)", lineHeight:1.3 }}>
                                      {chk.label}
                                    </div>
                                    <div style={{ fontSize:"10px", marginTop:"2px",
                                      color: result?.met?"#4ADE80":"#FCD34D", lineHeight:1.4 }}>
                                      {result?.detail}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            <p style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", marginTop:"8px", lineHeight:1.4 }}>
                              ⚠️ GPA &amp; performance assessments cannot be tracked here.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div style={{ marginTop:"16px", padding:"11px", background:"rgba(255,255,255,0.06)",
                    borderRadius:"9px", fontSize:"11px", color:"rgba(255,255,255,0.45)", lineHeight:1.6,
                    borderLeft:"2px solid rgba(255,255,255,0.15)" }}>
                    Always confirm your schedule with your counselor before submitting your registration card.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

                {/* ── COURSE DETAIL MODAL ── */}
        {selectedCourse&&(
          <div className="overlay" onClick={()=>setSelectedCourse(null)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <div style={{ padding:"24px 26px", borderBottom:"1px solid var(--border)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ flex:1, paddingRight:"12px" }}>
                    <span className="badge" style={{ background:deptColor(selectedCourse.dept)+"1A",
                      color:deptColor(selectedCourse.dept), marginBottom:"10px", display:"inline-block" }}>
                      {selectedCourse.dept}
                    </span>
                    <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", color:"var(--text)",
                      lineHeight:1.3, marginBottom:"4px" }}>{selectedCourse.name}</h2>
                    {selectedCourse.code&&<p style={{ fontSize:"12px",color:"var(--muted)" }}>{selectedCourse.code}</p>}
                  </div>
                  <button onClick={()=>setSelectedCourse(null)}
                    style={{ background:"var(--light-red)", border:"none", borderRadius:"50%", width:"34px",
                      height:"34px", cursor:"pointer", fontSize:"20px", color:"var(--red)",
                      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>×</button>
                </div>
              </div>
              <div style={{ padding:"22px 26px" }}>
                {selectedCourse.isOffCampus ? (
                  /* ── OFF CAMPUS STRUCTURED CARD ── */
                  <div>
                    <div style={{ background:"#F8FAFC", border:"1.5px solid #CBD5E1", borderRadius:"12px",
                      padding:"16px", marginBottom:"14px" }}>
                      <div style={{ fontSize:"11px", fontWeight:800, textTransform:"uppercase",
                        letterSpacing:"0.09em", color:"#64748B", marginBottom:"10px" }}>✅ Eligibility (all 3 required)</div>
                      {selectedCourse.eligibility.map((e,i)=>(
                        <div key={i} style={{ display:"flex", gap:"9px", alignItems:"flex-start",
                          padding:"6px 0", borderBottom: i<selectedCourse.eligibility.length-1?"1px solid #E2E8F0":"none" }}>
                          <span style={{ background:"#0F172A", color:"white", borderRadius:"50%",
                            width:"18px", height:"18px", display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:"10px", fontWeight:700, flexShrink:0, marginTop:"1px" }}>{i+1}</span>
                          <span style={{ fontSize:"13px", color:"#1E293B", lineHeight:1.5 }}>{e}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginBottom:"14px" }}>
                      <div style={{ fontSize:"11px", fontWeight:800, textTransform:"uppercase",
                        letterSpacing:"0.09em", color:"#64748B", marginBottom:"8px" }}>🗓 Qualifying Reasons & Limits</div>
                      {selectedCourse.reasons.map((r,i)=>(
                        <div key={i} style={{ background: i===0?"#F0FDF4":"#FFF7ED",
                          border:`1.5px solid ${i===0?"#BBF7D0":"#FED7AA"}`,
                          borderRadius:"9px", padding:"11px 14px", marginBottom:"8px" }}>
                          <div style={{ fontSize:"13px", fontWeight:700, color: i===0?"#15803D":"#9A3412", marginBottom:"3px" }}>
                            {r.label}
                          </div>
                          <div style={{ fontSize:"12px", color: i===0?"#166534":"#7C2D12" }}>{r.limit}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ background:"#FFFBEB", border:"1.5px solid #FDE68A",
                      borderRadius:"10px", padding:"13px 15px", marginBottom:"14px" }}>
                      <div style={{ fontSize:"11px", fontWeight:800, textTransform:"uppercase",
                        letterSpacing:"0.09em", color:"#92400E", marginBottom:"8px" }}>
                        📋 Required Submissions · Due {selectedCourse.deadline}
                      </div>
                      {selectedCourse.submissions.map((s,i)=>(
                        <div key={i} style={{ display:"flex", gap:"8px", fontSize:"12px", color:"#78350F",
                          padding:"5px 0", borderBottom: i<selectedCourse.submissions.length-1?"1px solid #FDE68A":"none" }}>
                          <span style={{ fontWeight:800, flexShrink:0, color:"#92400E" }}>{String.fromCharCode(65+i)}.</span>
                          <span style={{ lineHeight:1.5 }}>{s}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ background:"#FEF2F2", border:"1.5px solid #FECACA",
                      borderRadius:"9px", padding:"11px 14px", marginBottom:"12px" }}>
                      <div style={{ fontSize:"12px", fontWeight:700, color:"#991B1B", lineHeight:1.5 }}>
                        ⚠️ {selectedCourse.warning}
                      </div>
                    </div>

                    {selectedCourse.tips&&(
                      <div style={{ background:"#EFF6FF", border:"1.5px solid #BFDBFE",
                        borderRadius:"9px", padding:"11px 14px",
                        fontSize:"12px", color:"#1E40AF", lineHeight:1.65 }}>
                        <strong>💡 </strong>{selectedCourse.tips}
                      </div>
                    )}
                  </div>
                ) : (
                  /* ── REGULAR COURSE BODY ── */
                  <div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px", marginBottom:"16px" }}>
                      {[["Credits",selectedCourse.credits+" cr"],
                        ["Grade",selectedCourse.gradeLevel.join("/")],
                        ["Duration",selectedCourse.credits===0.5?"Semester":"Year"]].map(([k,v])=>(
                        <div key={k} style={{ background:"#F9FAFB", borderRadius:"9px", padding:"11px", textAlign:"center",
                          border:"1px solid var(--border)" }}>
                          <div style={{ fontSize:"10px",color:"var(--muted)",fontWeight:800,textTransform:"uppercase",
                            letterSpacing:"0.06em",marginBottom:"4px" }}>{k}</div>
                          <div style={{ fontSize:"15px",fontWeight:800,color:"var(--slate)" }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {selectedCourse.isAP&&(
                      <div style={{ background:"#FFFBEB", border:"1.5px solid #F59E0B", borderRadius:"9px",
                        padding:"11px 14px", marginBottom:"14px", fontSize:"12px", color:"#78350F", fontWeight:600 }}>
                        ⭐ AP Course — Weighted on 5.0 scale. AP exam required in May (~$96). Signed contract + parent info session required.
                      </div>
                    )}
                    <div style={{ marginBottom:"14px" }}>
                      <h3 style={{ fontSize:"11px",fontWeight:800,color:"var(--muted)",textTransform:"uppercase",
                        letterSpacing:"0.08em",marginBottom:"7px" }}>Description</h3>
                      <p style={{ fontSize:"13px",color:"var(--text)",lineHeight:1.7 }}>{selectedCourse.desc}</p>
                    </div>
                  </div>
                )}
                {!selectedCourse.isOffCampus && selectedCourse.prereqs.length>0&&(
                  <div style={{ marginBottom:"14px" }}>
                    <h3 style={{ fontSize:"11px",fontWeight:800,color:"var(--muted)",textTransform:"uppercase",
                      letterSpacing:"0.08em",marginBottom:"7px" }}>Prerequisites</h3>
                    <div style={{ display:"flex", gap:"7px", flexWrap:"wrap" }}>
                      {selectedCourse.prereqs.map(pid=>{
                        const pc=getCourse(pid);
                        return (
                          <div key={pid} className="prereq-chip" onClick={()=>setSelectedCourse(pc)}
                            style={{ background:"#FEF2F2", border:"1px solid #FCA5A5", color:"#B91C1C" }}>
                            {getCourseName(pid)} →
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {!selectedCourse.isOffCampus && (()=>{
                  const unlocks=COURSES.filter(c=>c.prereqs.includes(selectedCourse.id));
                  return unlocks.length>0?(
                    <div style={{ marginBottom:"14px" }}>
                      <h3 style={{ fontSize:"11px",fontWeight:800,color:"var(--muted)",textTransform:"uppercase",
                        letterSpacing:"0.08em",marginBottom:"7px" }}>Leads To</h3>
                      <div style={{ display:"flex", gap:"7px", flexWrap:"wrap" }}>
                        {unlocks.map(c=>(
                          <div key={c.id} className="prereq-chip" onClick={()=>setSelectedCourse(c)}
                            style={{ background:deptColor(c.dept)+"14",
                              border:`1px solid ${deptColor(c.dept)}35`, color:deptColor(c.dept) }}>
                            {c.name}{c.isAP&&" ⭐"}
                          </div>
                        ))}
                      </div>
                    </div>
                  ):null;
                })()}
                {!selectedCourse.isOffCampus && selectedCourse.tips&&(
                  <div style={{ background:"#EFF6FF", border:"1.5px solid #BFDBFE",
                    borderRadius:"9px", padding:"12px 14px", fontSize:"13px", color:"#1E40AF",
                    lineHeight:1.65, marginBottom:"16px" }}>
                    <strong>💡 Tip: </strong>{selectedCourse.tips}
                  </div>
                )}
                {!selectedCourse.isOffCampus && <div style={{ borderTop:"1px solid var(--border)", paddingTop:"16px" }}>
                  <p style={{ fontSize:"12px",color:"var(--muted)",marginBottom:"9px",fontWeight:600 }}>
                    Add to 4-Year Plan:
                  </p>
                  <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                    {[9,10,11,12].map(g=>(
                      <button key={g}
                        onClick={()=>{ setPlan(p=>{const n=JSON.parse(JSON.stringify(p));if(!n[g].includes(selectedCourse.id))n[g].push(selectedCourse.id);return n;});setSelectedCourse(null);setPage("planner"); }}
                        style={{ padding:"8px 16px",fontSize:"13px",fontWeight:700,cursor:"pointer",
                          borderRadius:"8px",border:"1.5px solid var(--border)",background:"white",
                          color:"var(--text)",transition:"all 0.15s",fontFamily:"inherit" }}
                        onMouseEnter={e=>{e.currentTarget.style.background="var(--red)";e.currentTarget.style.color="white";e.currentTarget.style.borderColor="var(--red)";}}
                        onMouseLeave={e=>{e.currentTarget.style.background="white";e.currentTarget.style.color="var(--text)";e.currentTarget.style.borderColor="var(--border)";}}>
                        Grade {g}
                      </button>
                    ))}
                  </div>
                </div>}
              </div>
            </div>
          </div>
        )}

        {/* ── ADD COURSE MODAL ── */}
        {addTarget!==null&&(
          <div className="overlay" onClick={()=>{ setAddTarget(null); setAddSearch(""); setPrereqWarn(null); }}>
            <div className="modal" style={{ maxWidth:"450px" }} onClick={e=>e.stopPropagation()}>
              <div style={{ padding:"20px 22px", borderBottom:"1px solid var(--border)" }}>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"19px", color:"var(--red-dark)", marginBottom:"3px" }}>
                  Add Course to Grade {addTarget}
                </h2>
                <p style={{ fontSize:"13px",color:"var(--muted)" }}>Search by name, code, or department · ⚠️ = missing prereqs</p>
              </div>
              <div style={{ padding:"14px 18px" }}>
                <input className="si" placeholder="e.g. Chemistry, AP, Japanese, Engineering…"
                  autoFocus value={addSearch} onChange={e=>setAddSearch(e.target.value)}
                  style={{ marginBottom:"10px" }} />

                {/* Prereq warning dialog */}
                {prereqWarn && (
                  <div style={{ background:"#FEF9C3", border:"1.5px solid #EAB308", borderRadius:"10px",
                    padding:"12px 14px", marginBottom:"10px" }}>
                    <div style={{ fontWeight:700, fontSize:"13px", color:"#78350F", marginBottom:"6px" }}>
                      ⚠️ Missing Prerequisites
                    </div>
                    <div style={{ fontSize:"12px", color:"#78350F", marginBottom:"10px" }}>
                      <strong>{getCourse(prereqWarn.courseId)?.name}</strong> requires:
                      <ul style={{ marginTop:"4px", paddingLeft:"18px" }}>
                        {prereqWarn.unmet.map(pid=>(
                          <li key={pid}>{getCourseName(pid)}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ display:"flex", gap:"8px" }}>
                      <button onClick={()=>forceAddCourse(prereqWarn.courseId)}
                        style={{ flex:1, background:"#B45309", color:"white", border:"none", borderRadius:"7px",
                          padding:"8px", fontSize:"12px", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                        Add Anyway
                      </button>
                      <button onClick={()=>setPrereqWarn(null)}
                        style={{ flex:1, background:"white", color:"#374151", border:"1.5px solid #D1D5DB",
                          borderRadius:"7px", padding:"8px", fontSize:"12px", fontWeight:600,
                          cursor:"pointer", fontFamily:"inherit" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {addTarget && plan[addTarget].length >= GRADE_MAX && (
                  <div style={{ background:"#FEF3C7", border:"1.5px solid #F59E0B", borderRadius:"9px",
                    padding:"10px 14px", marginBottom:"12px", fontSize:"12px", color:"#78350F", fontWeight:600 }}>
                    ✋ Grade {addTarget} is at the {GRADE_MAX}-course limit (7 in-school + 2 online). Remove a course first.
                  </div>
                )}
                <div style={{ maxHeight:"320px", overflowY:"auto" }}>
                  {addSearchResults.map(c=>{
                    const already = !c.repeatable && plan[addTarget].includes(c.id);
                    const atCap = plan[addTarget].length >= GRADE_MAX;
                    const blocked = already || atCap;
                    const completedBefore = getCoursesBeforeGrade(plan, addTarget);
                    const unmet = c.id==="OFF_CAMPUS" ? [] : getUnmetPrereqs(c.id, completedBefore);
                    const hasWarn = unmet.length > 0;
                    return (
                      <div key={c.id} onClick={()=>{ if(!blocked) addCourseToPlan(c.id); }}
                        style={{ display:"flex",alignItems:"center",gap:"10px",padding:"9px 10px",
                          borderRadius:"8px",cursor:blocked?"default":"pointer",transition:"background 0.12s",
                          background:already?"#FFF0F0":"transparent",opacity:blocked?0.45:1 }}
                        onMouseEnter={e=>{ if(!blocked) e.currentTarget.style.background="var(--light-red)"; }}
                        onMouseLeave={e=>{ e.currentTarget.style.background=already?"#FFF0F0":"transparent"; }}>
                        <div style={{ width:"8px",height:"8px",borderRadius:"50%",flexShrink:0,background:deptColor(c.dept) }}/>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:"13px",fontWeight:700,color:"var(--text)",
                            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>
                            {c.id==="OFF_CAMPUS"?"🚗 "+c.name:c.name}{c.isAP&&" ⭐"}
                          </div>
                          <div style={{ fontSize:"11px",color: hasWarn?"#D97706":"var(--muted)" }}>
                            {c.dept} · {c.credits>0?c.credits+"cr":"free period"} · Gr {c.gradeLevel.join("/")}
                            {c.repeatable&&" · can add multiple times"}
                            {hasWarn && ` · ⚠️ needs: ${unmet.map(getCourseName).join(", ")}`}
                          </div>
                        </div>
                        {already
                          ?<span style={{ fontSize:"11px",color:"var(--red)",fontWeight:700,flexShrink:0 }}>Added</span>
                          :<span style={{ fontSize:"20px",color: hasWarn?"#D97706":"var(--red)",flexShrink:0 }}>{hasWarn?"⚠️":"+"}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── DATA CITATION FOOTER ── */}
      <DataCitationFooter />
    </>
  );
}

function DataCitationFooter() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <footer style={{ background:"#F1F5F9", borderTop:"1px solid #E2E8F0", padding:"14px 24px",
        display:"flex", alignItems:"center", justifyContent:"center", gap:"16px", flexWrap:"wrap" }}>
        <span style={{ fontSize:"12px", color:"#64748B", lineHeight:1.5 }}>
          📋 Course data sourced from{" "}
          <em>Kalani High School 2024–25 Manual of Studies</em>{" "}
          and{" "}
          <em>Hawaii DOE Graduation Requirements (July 2023)</em>.
          For planning reference only — confirm your schedule with your counselor.
        </span>
        <button onClick={()=>setOpen(true)}
          style={{ fontSize:"11px", color:"#475569", background:"white", border:"1px solid #CBD5E1",
            borderRadius:"6px", padding:"4px 10px", cursor:"pointer", whiteSpace:"nowrap",
            fontFamily:"inherit" }}>
          Data Sources &amp; Disclaimer ›
        </button>
      </footer>

      {open && (
        <div className="overlay" onClick={()=>setOpen(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}
            style={{ maxWidth:"520px", width:"92vw" }}>
            <div style={{ padding:"24px 26px", borderBottom:"1px solid #E5E7EB",
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h2 style={{ fontSize:"17px", fontWeight:700, color:"#1C2B3A",
                fontFamily:"'Playfair Display',serif" }}>Data Sources &amp; Disclaimer</h2>
              <button onClick={()=>setOpen(false)}
                style={{ background:"#FFF1F0", border:"none", borderRadius:"50%", width:"32px",
                  height:"32px", cursor:"pointer", fontSize:"16px", color:"#B00804" }}>✕</button>
            </div>
            <div style={{ padding:"22px 26px", display:"flex", flexDirection:"column", gap:"16px" }}>
              {[
                { icon:"📖", label:"Primary Source", text:"Kalani High School 2024–2025 Manual of Studies. All course names, codes, credit values, grade levels, and prerequisite chains are derived from this document." },
                { icon:"🎓", label:"Graduation Requirements", text:"Hawaii Department of Education Graduation Requirements, effective July 2023. Credit minimums and subject-area breakdowns follow this policy document." },
                { icon:"⚠️", label:"Planning Reference Only", text:"Kalani Compass is an unofficial planning tool built by a student volunteer. It is not affiliated with Kalani High School or the Hawaii DOE. Course availability, prerequisites, and requirements may change. Always confirm your 4-year plan with your school counselor before submitting your registration card." },
                { icon:"🔄", label:"Last Data Update", text:"Course catalog last reviewed: March 2026. Covers the 2024–2025 academic year. Updates for 2025–2026 will be applied when the new Manual of Studies is released." },
              ].map(({icon,label,text})=>(
                <div key={label} style={{ display:"flex", gap:"13px", alignItems:"flex-start" }}>
                  <span style={{ fontSize:"20px", flexShrink:0, marginTop:"2px" }}>{icon}</span>
                  <div>
                    <div style={{ fontSize:"12px", fontWeight:700, color:"#475569",
                      textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:"4px" }}>{label}</div>
                    <div style={{ fontSize:"13px", color:"#374151", lineHeight:1.6 }}>{text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
