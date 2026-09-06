export async function adminRequest(path, body, method="POST") {
  try {
    const response=await fetch(`/api/admin/${path}`,{method,credentials:"same-origin",headers:{"Content-Type":"application/json"},...(body===undefined?{}:{body:JSON.stringify(body)})});
    const result=await response.json();
    if(!response.ok) {
      if(response.status===401 && path!=="session") window.dispatchEvent(new Event("kalani-admin-expired"));
      return {data:null,error:{message:result.error || "Request failed"}};
    }
    return {data:result,error:null};
  } catch {return {data:null,error:{message:"Could not reach the server. Please try again."}};}
}

// Small adapter for the panels; only allowlisted operations are exposed by the server.
export const adminData = {from(table) {
  const request={table,action:"select"};
  const query={
    select(){return query;},order(column,{ascending=true}={}){request.order={column,ascending};return query;},
    eq(column,value){request.filter={column,value};return query;},
    insert(payload){request.action="insert";request.payload=payload;return query;},
    update(payload){request.action="update";request.payload=payload;return query;},
    upsert(payload){request.action="upsert";request.payload=payload;return query;},
    delete(){request.action="delete";return query;},
    then(resolve,reject){return adminRequest("data",request).then(result=>result.error?result:{data:result.data.data,error:null}).then(resolve,reject);},
  };return query;
}};
