import { useEffect, useState } from "react";

import { DEFAULT_DISCLAIMER_ITEMS } from "../data/disclaimerItems.js";

import { supabase } from "../supabase.js";



function normalizeDisclaimerItem(row) {
  return {
    id: row.id,
    icon: row.icon || "",
    label: row.label || "",
    text: row.body || row.text || "",
    sortOrder: row.sort_order ?? row.sortOrder ?? 0,
    visible: row.visible ?? true,
  };
}



export function useDisclaimerItems() {
  const [items, setItems] = useState(DEFAULT_DISCLAIMER_ITEMS.filter(item => item.visible));

  useEffect(() => {
    async function fetchDisclaimerItems() {
      if (!supabase) return;

      const { data, error } = await supabase
        .from("disclaimer_items")
        .select("id, icon, label, body, sort_order, visible")
        .eq("visible", true)
        .order("sort_order", { ascending:true });

      if (!error && data && data.length > 0) {
        setItems(data.map(normalizeDisclaimerItem));
      } else if (error) {
        console.error("[Kalani Compass] fetchDisclaimerItems error:", error.message);
      }
    }
    fetchDisclaimerItems();
  }, []);

  return { items };
}
