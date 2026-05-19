import { useEffect, useState } from "react";

import { supabase } from "../supabase.js";



const DEFAULT_PAGE_MAINTENANCE = {
  home: false,
  catalog: false,
  match: false,
  planner: false,
};



export function usePageMaintenance() {
  const [maintenance, setMaintenance] = useState(DEFAULT_PAGE_MAINTENANCE);

  useEffect(() => {
    async function fetchPageMaintenance() {
      if (!supabase) return;

      const { data, error } = await supabase
        .from("page_maintenance")
        .select("page_id, enabled");

      if (error) {
        console.error("[Kalani Compass] fetchPageMaintenance error:", error.message);
        return;
      }

      const next = { ...DEFAULT_PAGE_MAINTENANCE };
      (data || []).forEach(row => {
        if (Object.prototype.hasOwnProperty.call(next, row.page_id)) {
          next[row.page_id] = Boolean(row.enabled);
        }
      });
      setMaintenance(next);
    }

    fetchPageMaintenance();
  }, []);

  return { maintenance };
}
