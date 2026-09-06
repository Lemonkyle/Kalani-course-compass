import { DEFAULT_DISCLAIMER_ITEMS } from "../data/disclaimerItems.js";
import { usePublicQuery } from "./usePublicQuery.js";
async function fetchItems(db) {
  const {data,error}=await db.from("disclaimer_items").select("id,icon,label,body,sort_order,visible").eq("visible",true).order("sort_order",{ascending:true});
  if(error) throw error;
  return data.map(row=>({id:row.id,icon:row.icon||"",label:row.label||"",text:row.body||"",sortOrder:row.sort_order??0,visible:true}));
}
export function useDisclaimerItems(){const {data:items}=usePublicQuery(fetchItems,()=>DEFAULT_DISCLAIMER_ITEMS.filter(i=>i.visible));return {items};}
