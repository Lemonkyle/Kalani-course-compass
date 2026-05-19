// Static data split by responsibility for easier maintenance.

// Custom/HOC courses use string IDs not in COURSES — planner treats them as labels only.
export const COURSE_MATCH_TEMPLATES = [
  {
    id: "steady_grad",
    title: "Steady Graduation Path",
    emoji: "🎓",
    tag: "Official",
    tagColor: "#166534", tagBg: "#F0FDF4",
    pinned: true,
    desc: "A well-balanced 4-year plan that meets all 24 graduation credits with a manageable workload. Great starting point for any Kalani student.",
    suited: ["All students", "First-generation HS students", "Students who want a stress-free path to graduation"],
    highlights: ["All core requirements covered", "Space for 2 electives per year", "No AP pressure"],
    plan: {
      9:  ["ELA1","GEO","PID","MHH","ISCI","PE_LF","HEALTH"],
      10: ["ELA2","ALG2","USH","BIO1_10","PE_LA"],
      11: ["ELA3","TRIG","WH","CHEM","PTP"],
      12: ["ELA4","ECON","PSYCH","HCHEM"],
    }
  },
  {
    id: "counselor_rec",
    title: "Counselor Recommended",
    emoji: "🏫",
    tag: "Counselor Pick",
    tagColor: "#1D4ED8", tagBg: "#EFF6FF",
    pinned: true,
    desc: "The schedule our counseling team most commonly recommends for well-rounded college preparation. Balances core academics with elective exploration.",
    suited: ["Students planning to attend a 4-year university", "Students unsure of their major", "Students who want counselor-approved guidance"],
    highlights: ["University-ready course selection", "Includes recommended electives", "Counselor-verified sequence"],
    plan: {
      9:  ["ELA1","GEO","PID","MHH","ISCI","PE_LF","HEALTH","JPN1"],
      10: ["ELA2","ALG2","USH","BIO1_10","JPN2","PE_LA"],
      11: ["AP_ENG3","TRIG","WH","CHEM","JPN3","PTP"],
      12: ["AP_ENG4","CALC","ECON","PSYCH","HCHEM"],
    }
  },
  {
    id: "stem_track",
    title: "STEM Track",
    emoji: "🔬",
    tag: "STEM",
    tagColor: "#0F766E", tagBg: "#F0FDFA",
    pinned: true,
    desc: "Designed for students interested in science, technology, engineering, or mathematics. Heavy on lab sciences and advanced math, with CTE tech courses.",
    suited: ["Future engineers, doctors, or researchers", "Students interested in STEM careers", "Students targeting UH Mānoa STEM programs"],
    highlights: ["Full AP Science sequence", "Advanced math through Calculus", "CTE tech pathway included"],
    plan: {
      9:  ["ELA1","GEO","PID","MHH","ISCI","PE_LF","HEALTH","CS_FOUND"],
      10: ["ELA2","ALG2","AP_USH","AP_BIO","AP_CSP"],
      11: ["AP_ENG3","TRIG","AP_WH","AP_CHEM","PTP"],
      12: ["AP_ENG4","AP_CALC","ECON","AP_PHYS","AP_CSA"],
    }
  },
  {
    id: "honors_track",
    title: "Honors Recognition Track",
    emoji: "🏆",
    tag: "Honors",
    tagColor: "#92400E", tagBg: "#FFFBEB",
    pinned: false,
    desc: "Optimized to qualify for all three Kalani Honors Recognition Certificates: Academic, STEM, and CTE. Requires strong academic commitment across all four years.",
    suited: ["High-achieving students", "Students pursuing the Honors Recognition Certificate", "Students who enjoy academic challenge"],
    highlights: ["Targets all 3 Honors certificates", "Beyond-Alg2 math included", "AP courses in core subjects"],
    plan: {
      9:  ["ELA1","ALG2","PID","MHH","ISCI","PE_LF","HEALTH","CS_FOUND"],
      10: ["AP_ENG3","TRIG","AP_USH","AP_BIO","AP_CSP","JPN1"],
      11: ["AP_ENG4","AP_CALC","AP_WH","AP_CHEM","JPN2","PTP"],
      12: ["AP_CSA","AP_STATS","ECON","AP_PHYS","JPN3"],
    }
  },
  {
    id: "arts_path",
    title: "Fine Arts & Humanities",
    emoji: "🎨",
    tag: "Arts & Culture",
    tagColor: "#6D28D9", tagBg: "#F5F3FF",
    pinned: false,
    desc: "For students passionate about arts, languages, and humanities. Balances graduation requirements with a rich selection of visual arts, performing arts, and language courses.",
    suited: ["Students interested in arts, design, or communications", "Students targeting arts programs or liberal arts colleges", "Students who enjoy language learning"],
    highlights: ["Full Fine Arts sequence", "World language through level 3", "AP Humanities courses"],
    plan: {
      9:  ["ELA1","GEO","PID","MHH","ISCI","PE_LF","HEALTH","ART1"],
      10: ["AP_ENG3","ALG2","AP_USH","BIO1_10","ART2","JPN1"],
      11: ["AP_ENG4","TRIG","AP_WH","CHEM","ART3","JPN2","PTP"],
      12: ["ELA4","ECON","PSYCH","DANCE","DIR_ART","JPN3"],
    }
  },
  {
    id: "cte_path",
    title: "CTE Career Pathway",
    emoji: "🛠",
    tag: "Career & Technical",
    tagColor: "#0369A1", tagBg: "#EFF6FF",
    pinned: false,
    desc: "Built around Kalani's Career & Technical Education pathways. Earn your CTE Honors Recognition Certificate while building real-world skills in your chosen career field.",
    suited: ["Students interested in a specific career pathway", "Students who prefer hands-on learning", "Students targeting community college or technical training"],
    highlights: ["Full CTE pathway sequence", "CTE Honors certificate eligible", "Practical skill-building focus"],
    plan: {
      9:  ["ELA1","GEO","PID","MHH","ISCI","PE_LF","HEALTH","CS_FOUND"],
      10: ["ELA2","ALG2","USH","BIO1_10","AP_CSP","PE_LA"],
      11: ["ELA3","TRIG","WH","CHEM","AP_CSA","PTP"],
      12: ["ELA4","ECON","PSYCH","HCHEM"],
    }
  },
];
