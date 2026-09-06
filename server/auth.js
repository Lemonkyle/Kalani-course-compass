import { createHmac, timingSafeEqual, scryptSync, randomBytes } from "node:crypto";

export const SESSION_SECONDS = 8 * 60 * 60;
export function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
export function equal(a,b) {
  const left=Buffer.from(String(a)), right=Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left,right);
}
export function verifyPassword(password, hash) {
  const [salt, expected] = String(hash).split(":");
  return Boolean(/^[a-f0-9]{32}$/.test(salt) && /^[a-f0-9]{128}$/.test(expected) && typeof password === "string" && password.length <= 512 && equal(hashPassword(password,salt),hash));
}
function sign(value, config) { return createHmac("sha256",config.sessionSecret).update(value).digest("base64url"); }
export function createSession(config, now=Date.now()) {
  const payload=Buffer.from(JSON.stringify({user:config.username,exp:Math.floor(now/1000)+SESSION_SECONDS,version:sign(config.passwordHash,config)})).toString("base64url");
  return `${payload}.${sign(payload,config)}`;
}
export function verifySession(token,config,now=Date.now()) {
  try {
    const [payload,signature,...extra]=String(token).split(".");
    if(extra.length || !signature || !equal(signature,sign(payload,config))) return false;
    const data=JSON.parse(Buffer.from(payload,"base64url").toString());
    return data.user===config.username && Number.isFinite(data.exp) && data.exp>now/1000 && data.exp<=now/1000+SESSION_SECONDS+60 && equal(data.version,sign(config.passwordHash,config));
  } catch { return false; }
}
export function readAdminConfig(env=process.env) {
  if(!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD_HASH || !env.ADMIN_SESSION_SECRET || env.ADMIN_SESSION_SECRET.length<32) throw new Error("Administrator login is not configured");
  return {username:env.ADMIN_USERNAME,passwordHash:env.ADMIN_PASSWORD_HASH,sessionSecret:env.ADMIN_SESSION_SECRET};
}
export function cookieName(req) { return process.env.VERCEL || req.headers["x-forwarded-proto"] === "https" ? "__Host-kalani-admin" : "kalani-admin-local"; }
export function readSession(req, config) {
  const cookie=(req.headers.cookie || "").split(";").map(s=>s.trim()).find(s=>s.startsWith(`${cookieName(req)}=`));
  return cookie && verifySession(cookie.slice(cookie.indexOf("=")+1),config);
}
export function sessionCookie(req, token, maxAge=SESSION_SECONDS) {
  return `${cookieName(req)}=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${maxAge}${cookieName(req).startsWith("__Host-")?"; Secure":""}`;
}
export function requireSameOrigin(req) {
  const origin=req.headers.origin;
  const expected=`${process.env.VERCEL || req.headers["x-forwarded-proto"]==="https"?"https":"http"}://${req.headers.host}`;
  if(origin!==expected || !String(req.headers["content-type"]||"").startsWith("application/json")) throw Object.assign(new Error("Request origin is not allowed"),{status:403});
}
