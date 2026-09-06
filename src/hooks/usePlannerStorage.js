import { useEffect, useState } from "react";
import { DEFAULT_PLAN } from "../data/requirements.js";

import { readSaved, validPlan, validCustomCourses } from "../lib/plannerStorage.js";

export function usePlannerStorage() {
  const [plan, setPlan] = useState(() => readSaved(localStorage, "kalani-compass-plan", DEFAULT_PLAN, validPlan));
  const [priorCredits, setPriorCredits] = useState(() => readSaved(localStorage, "kalani-prior-credits", [], value => Array.isArray(value) && value.every(id => typeof id === "string")));
  const [customCourses, setCustomCourses] = useState(() => readSaved(localStorage, "kalani-custom-courses", [], validCustomCourses));
  const [alg1Anim, setAlg1Anim] = useState("idle");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customGradeTarget, setCustomGradeTarget] = useState(9);
  const [customForm, setCustomForm] = useState({
    name: "",
    dept: "Mathematics",
    credits: 0.5,
    isAP: false,
    language: "",
  });

  useEffect(() => {
    try {
      localStorage.setItem("kalani-compass-plan", JSON.stringify(plan));
    } catch {}
  }, [plan]);

  useEffect(() => {
    try {
      localStorage.setItem("kalani-prior-credits", JSON.stringify(priorCredits));
    } catch {}
  }, [priorCredits]);

  useEffect(() => {
    try {
      localStorage.setItem("kalani-custom-courses", JSON.stringify(customCourses));
    } catch {}
  }, [customCourses]);

  return {
    plan,
    setPlan,
    priorCredits,
    setPriorCredits,
    alg1Anim,
    setAlg1Anim,
    customCourses,
    setCustomCourses,
    showCustomModal,
    setShowCustomModal,
    customGradeTarget,
    setCustomGradeTarget,
    customForm,
    setCustomForm,
  };
}
