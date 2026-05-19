import { motion } from "framer-motion";



export const cardVariants = {
  hidden: { height:0, opacity:0, marginBottom:0 },
  show: {
    height:"auto", opacity:1, marginBottom:8,
    transition:{ height:{ type:"spring", stiffness:400, damping:30 } }
  },
  exit: {
    height:0, opacity:0, marginBottom:0,
    transition:{
      delay:0.15,
      height:{ type:"spring", stiffness:400, damping:30 },
      opacity:{ delay:0.15 },
      marginBottom:{ delay:0.15 },
    }
  }
};

export const contentVariants = {
  hidden: { x:50, opacity:0, scale:0.95 },
  show:  { x:0, opacity:1, scale:1, transition:{ type:"spring", stiffness:350, damping:25, delay:0.05 } },
  exit:  { x:-60, opacity:0, scale:0.95, transition:{ type:"spring", stiffness:400, damping:25 } }
};

export const shakeAnim = { x:[0,-8,8,-6,6,-3,3,0], transition:{ duration:0.4, ease:"easeInOut" } };

const pageVariants = {
  initial: { opacity:0, y:12, scale:0.99 },
  animate: { opacity:1, y:0, scale:1,
    transition:{ type:"spring", stiffness:300, damping:25, mass:0.8 } },
  exit:    { opacity:0, y:-10, scale:0.99,
    transition:{ duration:0.2, ease:"easeIn" } },
};

export function renderPage(condition, pageKey, children) {
  if (!condition) return null;
  return (
    <motion.div key={pageKey} variants={pageVariants}
      initial="initial" animate="animate" exit="exit"
      style={{ width:"100%" }}>
      {children}
    </motion.div>
  );
}
