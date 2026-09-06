import fs from "node:fs";
import { randomBytes } from "node:crypto";
import { hashPassword } from "../server/auth.js";

const username=process.argv[2] || "kalani-admin";
if(!/^[A-Za-z0-9_-]{3,60}$/.test(username))throw new Error("Use 3–60 letters, numbers, - or _ for the username.");
const credentialsFile=new URL("../.admin-credentials.txt",import.meta.url);
if(fs.existsSync(credentialsFile))throw new Error("Credentials already exist. Move the existing .admin-credentials.txt to a safe place before intentionally rotating the password.");
const password=randomBytes(24).toString("base64url");
const settings={ADMIN_USERNAME:username,ADMIN_PASSWORD_HASH:hashPassword(password),ADMIN_SESSION_SECRET:randomBytes(48).toString("base64url")};
const envFile=new URL("../.env.local",import.meta.url);
let env=fs.existsSync(envFile)?fs.readFileSync(envFile,"utf8"):"";
env=env.split(/\r?\n/).filter(line=>!Object.keys(settings).some(key=>line.startsWith(key+"="))).join("\n").trimEnd();
fs.writeFileSync(credentialsFile,`Kalani Course Compass — administrator login\n\nURL: https://kalani-course-compass.vercel.app/admin\nUsername: ${username}\nPassword: ${password}\n\nKeep this file private. No email or registration is required.\n`,{mode:0o600,flag:"wx"});
fs.writeFileSync(envFile,env+"\n"+Object.entries(settings).map(([key,value])=>`${key}=${value}`).join("\n")+"\n",{mode:0o600});
console.log("Administrator credentials saved privately in .admin-credentials.txt. Server settings updated in .env.local.");
