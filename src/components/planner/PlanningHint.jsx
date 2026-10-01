import { useEffect, useId, useRef, useState } from 'react';

export function PlanningHint({messages = ['Credit not confirmed — not counted']}) {
  const [open,setOpen] = useState(false);
  const trigger = useRef(null);
  const hovering = useRef(false);
  const id = useId();

  useEffect(() => {
    const card = trigger.current?.closest('.card-hover-group');
    if (!card) return;
    // Listen only at the card boundary. Moving between its children does not
    // restart the reveal, and the panel never mounts outside this boundary.
    const enter = event => {
      if (event.pointerType === 'touch') return;
      hovering.current = true;
      setOpen(true);
    };
    const leave = event => {
      if (event.pointerType === 'touch') return;
      hovering.current = false;
      setOpen(false);
    };
    const outside = event => { if (!card.contains(event.target)) setOpen(false); };
    const escape = event => { if (event.key === 'Escape') setOpen(false); };
    card.addEventListener('pointerenter',enter);
    card.addEventListener('pointerleave',leave);
    document.addEventListener('pointerdown',outside);
    document.addEventListener('keydown',escape);
    return () => {
      card.removeEventListener('pointerenter',enter);
      card.removeEventListener('pointerleave',leave);
      document.removeEventListener('pointerdown',outside);
      document.removeEventListener('keydown',escape);
    };
  },[]);

  return <div className={'planning-hint-row'+(open?' is-open':'')}>
    <button ref={trigger} type="button" className="planning-hint-trigger"
      aria-label={messages.join('. ')} aria-expanded={open} aria-controls={id}
      onFocus={()=>setOpen(true)} onBlur={()=>{if (!hovering.current) setOpen(false);}}
      onClick={e=>{e.stopPropagation();setOpen(true);}}>
      <span aria-hidden="true">⚠</span>
    </button>
    <div id={id} className="planning-hint-panel" aria-hidden={!open}>
      {messages.map(message=><p key={message}>{message}</p>)}
    </div>
  </div>;
}
