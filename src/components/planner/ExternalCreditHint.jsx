import { useState } from 'react';
export function ExternalCreditHint() {
  const [open,setOpen] = useState(false);
  return <button type="button" className={'external-credit-hint'+(open?' is-open':'')}
    aria-label="Credit not confirmed — not counted" aria-expanded={open}
    onClick={e=>{e.stopPropagation();setOpen(v=>!v);}}>
    <span aria-hidden="true">⚠</span><span className="external-credit-message">Credit not confirmed — not counted</span>
  </button>;
}
