import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';

export function PlanningHint({messages = ['Credit not confirmed — not counted']}) {
  const [open,setOpen] = useState(false);
  const [position,setPosition] = useState(null);
  const trigger = useRef(null);
  const popup = useRef(null);
  const timer = useRef(null);
  const id = useId();
  const reducedMotion = useReducedMotion();
  const cancelClose = () => clearTimeout(timer.current);
  const show = () => { cancelClose(); setOpen(true); };
  const close = () => { cancelClose(); setOpen(false); setPosition(null); };
  const delayClose = () => { cancelClose(); timer.current = setTimeout(close,140); };

  useEffect(() => {
    const card = trigger.current?.closest('.card-hover-group');
    if (!card) return;
    const enter = event => { if (event.pointerType !== 'touch') show(); };
    const leave = event => { if (event.pointerType !== 'touch') delayClose(); };
    card.addEventListener('pointerenter',enter);
    card.addEventListener('pointerleave',leave);
    return () => {
      cancelClose();
      card.removeEventListener('pointerenter',enter);
      card.removeEventListener('pointerleave',leave);
    };
  },[]);

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      if (!trigger.current || !popup.current) return;
      const anchor = trigger.current.getBoundingClientRect();
      if (anchor.bottom < 0 || anchor.top > window.innerHeight || anchor.right < 0 || anchor.left > window.innerWidth) { close(); return; }
      const box = popup.current.getBoundingClientRect();
      const margin = 12;
      const right = anchor.right + 10;
      const left = right + box.width <= window.innerWidth - margin ? right : Math.max(margin,anchor.left - box.width - 10);
      const top = Math.max(margin,Math.min(anchor.top - 8,window.innerHeight - box.height - margin));
      setPosition({left,top});
    };
    place();
    window.addEventListener('resize',place);
    window.addEventListener('scroll',place,true);
    const observer = new ResizeObserver(place);
    observer.observe(popup.current);
    return () => {
      window.removeEventListener('resize',place);
      window.removeEventListener('scroll',place,true);
      observer.disconnect();
    };
  },[open,messages.join('\n')]);

  useEffect(() => {
    if (!open) return;
    const dismiss = event => {
      if (!trigger.current?.contains(event.target) && !popup.current?.contains(event.target)) close();
    };
    const escape = event => { if (event.key === 'Escape') close(); };
    document.addEventListener('pointerdown',dismiss);
    document.addEventListener('keydown',escape);
    return () => {
      document.removeEventListener('pointerdown',dismiss);
      document.removeEventListener('keydown',escape);
    };
  },[open]);

  return <>
    <button ref={trigger} type="button" className="planning-hint-trigger"
      aria-label={messages.join('. ')} aria-expanded={open} aria-controls={open?id:undefined}
      aria-describedby={open?id:undefined}
      onFocus={show} onBlur={delayClose}
      onClick={e=>{e.stopPropagation(); show();}}>
      <span aria-hidden="true">⚠</span>
    </button>
    {open && createPortal(
      <div ref={popup} id={id} role="tooltip" className="planning-hint-popup"
        style={{left:position?.left ?? 0,top:position?.top ?? 0,visibility:position?'visible':'hidden'}}
        onPointerEnter={cancelClose} onPointerLeave={delayClose} onClick={e=>e.stopPropagation()}>
        <motion.div className="planning-hint-surface" initial={{opacity:0,x:reducedMotion?0:-5}}
          animate={{opacity:1,x:0}} transition={{duration:reducedMotion?0:0.16,ease:'easeOut'}}>
          <strong>Planning reminder</strong>
          {messages.map(message=><p key={message}>{message}</p>)}
        </motion.div>
      </div>,document.body
    )}
  </>;
}
