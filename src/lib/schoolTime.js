// Honolulu does not observe daylight saving time: UTC-10 throughout the year.
export function toSchoolInput(value) {
  if(!value) return "";
  const time=Date.parse(value);
  return Number.isFinite(time)?new Date(time-10*60*60*1000).toISOString().slice(0,16):"";
}
export function fromSchoolInput(value) {
  if(!value) return null;
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error("Invalid school date/time");
  const date=new Date(`${value}:00-10:00`);
  if(!Number.isFinite(date.getTime()) || toSchoolInput(date.toISOString())!==value) throw new Error("Invalid school date/time");
  return date.toISOString();
}
