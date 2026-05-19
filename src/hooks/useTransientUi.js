import { useEffect, useState } from "react";

export function useTransientUi() {
  const [toast, setToast] = useState(null);
  const [shakeGrade, setShakeGrade] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    if (!shakeGrade) return;
    const timeoutId = setTimeout(() => setShakeGrade(null), 450);
    return () => clearTimeout(timeoutId);
  }, [shakeGrade]);

  function showToast(message) {
    setToast(message);
  }

  return {
    toast,
    showToast,
    shakeGrade,
    setShakeGrade,
  };
}
