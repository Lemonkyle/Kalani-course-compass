import { useEffect, useRef, useState } from "react";
import { DEFAULT_PLAN } from "../data/requirements.js";

export function usePlannerStorage() {
  const [plan, setPlan] = useState(() => {
    try {
      const saved = localStorage.getItem("kalani-compass-plan");
      if (saved) return JSON.parse(saved);
    } catch {}
    return JSON.parse(JSON.stringify(DEFAULT_PLAN));
  });
  const [priorCredits, setPriorCredits] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("kalani-prior-credits") || "[]");
    } catch {
      return [];
    }
  });
  const [customCourses, setCustomCourses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("kalani-custom-courses") || "[]");
    } catch {
      return [];
    }
  });
  const [alg1Anim, setAlg1Anim] = useState("idle");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customGradeTarget, setCustomGradeTarget] = useState(9);
  const [customForm, setCustomForm] = useState({
    name: "",
    dept: "Mathematics",
    credits: 0.5,
    isAP: false,
  });

  const planUids = useRef({ 9: [], 10: [], 11: [], 12: [] });

  function ensureUids(grade) {
    const arr = planUids.current[grade];
    const needed = (plan[grade] || []).length;
    while (arr.length < needed) arr.push(Math.random().toString(36).slice(2));
    return arr;
  }

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

  useEffect(() => {
    const allPlanIds = new Set(Object.values(plan).flat());
    setCustomCourses(prev => prev.filter(course => allPlanIds.has(course.id)));
  }, [plan]);

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
    planUids,
    ensureUids,
  };
}
