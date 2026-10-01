import { useState } from 'react';
export function PlanningHint({messages = ['Credit not confirmed — not counted']}) {
  const [open,setOpen] = useState(false);
  return <button type="button" className={'external-credit-hint'+(open?' is-open':'')}
    aria-label={messages.join(". ")} aria-expanded={open}
    onClick={e=>{e.stopPropagation();setOpen(v=>!v);}}>
    <span aria-hidden="true">⚠</span><span className="external-credit-message">{messages.map(message=><span key={message} style={{display:"block"}}>{message}</span>)}</span>
  </button>;
}
