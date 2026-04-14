import { useMemo, useState } from "react";

const mockRules = [
  {
    school: "Kapiolani Community College",
    courseCode: "MATH 100",
    courseTitle: "College Algebra",
    kalaniEquivalent: "Algebra Requirement",
    transferable: true,
    applicable: true,
    transferredCredits: 1,
    notes: "Counts toward Kalani math requirement."
  },
  {
    school: "Honolulu Community College",
    courseCode: "ENG 100",
    courseTitle: "Composition I",
    kalaniEquivalent: "English Credit",
    transferable: true,
    applicable: true,
    transferredCredits: 1,
    notes: "Can be used toward English credit review."
  },
  {
    school: "International School",
    courseCode: "BIO101",
    courseTitle: "Biology",
    kalaniEquivalent: "Biology Elective",
    transferable: true,
    applicable: false,
    transferredCredits: 1,
    notes: "Transferable as elective credit, but may need manual review for requirement fit."
  }
];

function normalize(text) {
  return (text || "").trim().toLowerCase();
}

export default function TransferCreditModule() {
  const [studentType, setStudentType] = useState("domestic");
  const [school, setSchool] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [credits, setCredits] = useState("");
  const [result, setResult] = useState(null);

  const canSubmit = useMemo(() => {
    return school.trim() && courseCode.trim() && courseTitle.trim() && credits.trim();
  }, [school, courseCode, courseTitle, credits]);

  function handleEvaluate() {
    const matched = mockRules.find((item) => {
      return (
        normalize(item.school) === normalize(school) &&
        normalize(item.courseCode) === normalize(courseCode)
      );
    });

    if (matched) {
      setResult({
        status: matched.transferable ? "approved" : "denied",
        school,
        courseCode,
        courseTitle,
        credits,
        studentType,
        transferable: matched.transferable,
        applicable: matched.applicable,
        kalaniEquivalent: matched.kalaniEquivalent,
        transferredCredits: matched.transferredCredits,
        notes: matched.notes
      });
      return;
    }

    if (studentType === "international") {
      setResult({
        status: "manual_review",
        school,
        courseCode,
        courseTitle,
        credits,
        studentType,
        transferable: true,
        applicable: false,
        kalaniEquivalent: "Pending manual review",
        transferredCredits: Number(credits) || 0,
        notes:
          "International coursework usually needs syllabus and transcript review before final approval."
      });
      return;
    }

    setResult({
      status: "elective",
      school,
      courseCode,
      courseTitle,
      credits,
      studentType,
      transferable: true,
      applicable: false,
      kalaniEquivalent: "General Elective Credit",
      transferredCredits: Number(credits) || 0,
      notes:
        "No direct match found in the system. This course may transfer as elective credit only."
    });
  }

  function resetForm() {
    setSchool("");
    setCourseCode("");
    setCourseTitle("");
    setCredits("");
    setResult(null);
    setStudentType("domestic");
  }

  const cardStyle = {
    background: "white",
    border: "1px solid #E5E7EB",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 8px 30px rgba(15, 23, 42, 0.06)"
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1.5px solid #D1D5DB",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
    background: "#fff"
  };

  return (
    <div style={{ maxWidth: "980px", margin: "0 auto", padding: "32px 24px 60px" }}>
      <h1
        style={{
          fontSize: "30px",
          fontWeight: 800,
          color: "#7F1D1D",
          marginBottom: "10px"
        }}
      >
        Transfer Credit Checker
      </h1>

      <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.7, marginBottom: "24px" }}>
        Check whether domestic or international transfer courses may count toward Kalani credit,
        and whether they are applicable to Kalani requirements.
      </p>

      <div style={{ ...cardStyle, marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "18px" }}>
          <button
            onClick={() => setStudentType("domestic")}
            style={{
              border: "none",
              borderRadius: "999px",
              padding: "10px 16px",
              cursor: "pointer",
              fontWeight: 700,
              background: studentType === "domestic" ? "#B00804" : "#F3F4F6",
              color: studentType === "domestic" ? "white" : "#374151"
            }}
          >
            Domestic Transfer
          </button>

          <button
            onClick={() => setStudentType("international")}
            style={{
              border: "none",
              borderRadius: "999px",
              padding: "10px 16px",
              cursor: "pointer",
              fontWeight: 700,
              background: studentType === "international" ? "#B00804" : "#F3F4F6",
              color: studentType === "international" ? "white" : "#374151"
            }}
          >
            International Transfer
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px"
          }}
        >
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
              Previous School
            </label>
            <input
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="e.g. Kapiolani Community College"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
              Course Code
            </label>
            <input
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="e.g. MATH 100"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
              Course Title
            </label>
            <input
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="e.g. College Algebra"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
              Credits
            </label>
            <input
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              placeholder="e.g. 1"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "18px" }}>
          <button
            onClick={handleEvaluate}
            disabled={!canSubmit}
            style={{
              border: "none",
              borderRadius: "10px",
              padding: "12px 18px",
              cursor: canSubmit ? "pointer" : "not-allowed",
              fontWeight: 800,
              background: canSubmit ? "#B00804" : "#D1D5DB",
              color: "white"
            }}
          >
            Evaluate Transfer Credit
          </button>

          <button
            onClick={resetForm}
            style={{
              border: "1px solid #D1D5DB",
              borderRadius: "10px",
              padding: "12px 18px",
              cursor: "pointer",
              fontWeight: 700,
              background: "white",
              color: "#374151"
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {result && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111827", marginBottom: "14px" }}>
            Evaluation Result
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
              marginBottom: "16px"
            }}
          >
            <div>
              <div style={{ fontSize: "12px", color: "#6B7280" }}>Student Type</div>
              <div style={{ fontWeight: 700 }}>{result.studentType}</div>
            </div>

            <div>
              <div style={{ fontSize: "12px", color: "#6B7280" }}>Transferable</div>
              <div style={{ fontWeight: 700 }}>
                {result.transferable ? "Yes" : "No"}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "12px", color: "#6B7280" }}>Applicable at Kalani</div>
              <div style={{ fontWeight: 700 }}>
                {result.applicable ? "Yes" : "No / Needs Review"}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "12px", color: "#6B7280" }}>Transferred Credits</div>
              <div style={{ fontWeight: 700 }}>{result.transferredCredits}</div>
            </div>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", color: "#6B7280" }}>Kalani Equivalent</div>
            <div style={{ fontWeight: 700, color: "#111827" }}>{result.kalaniEquivalent}</div>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", color: "#6B7280" }}>Course Reviewed</div>
            <div style={{ fontWeight: 700, color: "#111827" }}>
              {result.school} · {result.courseCode} · {result.courseTitle}
            </div>
          </div>

          <div
            style={{
              background: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: "12px",
              padding: "14px"
            }}
          >
            <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "6px" }}>Notes</div>
            <div style={{ fontSize: "14px", color: "#374151", lineHeight: 1.7 }}>{result.notes}</div>
          </div>
        </div>
      )}
    </div>
  );
}
