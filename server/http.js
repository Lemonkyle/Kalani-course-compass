export function respond(res,status,body) {
  res.setHeader("Cache-Control","no-store");res.setHeader("Content-Type","application/json");
  res.statusCode=status;res.end(JSON.stringify(body));
}
export async function readJson(req) {
  if (Number(req.headers["content-length"]||0)>1000000) throw Object.assign(new Error("Request too large"),{status:413});
  if(req.body!==undefined) {
    const value=typeof req.body==="string"?parseJson(req.body):req.body;
    if (!value || typeof value!=="object" || Array.isArray(value)) throw Object.assign(new Error("Invalid JSON request"),{status:400});
    if(JSON.stringify(value).length>1000000) throw Object.assign(new Error("Request too large"),{status:413});
    return value;
  }
  let text="";for await(const chunk of req) {text+=chunk;if(text.length>1000000) throw Object.assign(new Error("Request too large"),{status:413});}
  return parseJson(text || "{}");
}

function parseJson(text) { try { const result=JSON.parse(text); if (!result || typeof result!=="object" || Array.isArray(result)) throw new Error(); return result; } catch { throw Object.assign(new Error("Invalid JSON request"),{status:400}); } }
