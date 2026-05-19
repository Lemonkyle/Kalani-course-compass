import { useEffect, useState } from "react";

import { supabase } from "../supabase.js";



export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    async function fetchAnnouncements() {
      if (!supabase) return;

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("visible", true)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order("created_at", { ascending: false });
      if (!error && data) setAnnouncements(data);
    }
    fetchAnnouncements();
  }, []);

  return { announcements };
}
