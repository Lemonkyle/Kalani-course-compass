const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`;

export function AppStyles() {
  return (
    <style>{`
        ${FONTS}
        @keyframes cardIn{from{opacity:0;transform:translateY(24px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}
        @keyframes annSlideDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        /* Planner card animations */
        @keyframes planCardIn{
          0%{opacity:0;transform:translateX(50px) scale(0.95);max-height:0;margin-bottom:0;}
          30%{opacity:1;}
          100%{opacity:1;transform:translateX(0) scale(1);max-height:120px;margin-bottom:4px;}
        }
        @keyframes planCardOut{
          0%{opacity:1;transform:translateX(0) scale(1);max-height:120px;margin-bottom:4px;}
          30%{opacity:0;transform:translateX(-60px) scale(0.95);}
          100%{opacity:0;transform:translateX(-60px) scale(0.95);max-height:0;margin-bottom:0;padding:0;}
        }
        @keyframes gradeShake{
          0%  {transform:translateX(0);}
          10% {transform:translateX(-8px);}
          20% {transform:translateX(8px);}
          30% {transform:translateX(-6px);}
          40% {transform:translateX(6px);}
          50% {transform:translateX(-3px);}
          65% {transform:translateX(3px);}
          80% {transform:translateX(-1.5px);}
          100%{transform:translateX(0);}
        }
        @keyframes reqBarFill{from{transform:scaleX(0);transform-origin:left;}to{transform:scaleX(1);}}
        @keyframes reqNumPop{
          0%  {transform:scale(1.65);color:#F59E0B;}
          55% {transform:scale(0.88);}
          80% {transform:scale(1.06);}
          100%{transform:scale(1);}
        }
        @keyframes shimmerSweep{
          from{left:-60%;}to{left:120%;}
        }
        @keyframes infiniteShimmer{
          0%  {left:-60%;}
          100%{left:160%;}
        }
        @keyframes barComplete{
          0%  {transform:scaleX(1);}
          25% {transform:scaleX(1.012);}
          55% {transform:scaleX(0.996);}
          100%{transform:scaleX(1);}
        }
        .plan-card-removing{
          animation:planCardOut 0.38s cubic-bezier(0.4,0,0.2,1) forwards !important;
          overflow:hidden;pointer-events:none;
        }
        .plan-card-new{
          animation:planCardIn 0.38s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .grade-shake{
          animation:gradeShake 0.4s ease-in-out !important;
        }
        /* GradeBtn: hover state controlled via React state, not CSS */
        @keyframes particle{
          0%{opacity:1;transform:translate(-50%,-50%) scale(0);}
          40%{opacity:1;transform:translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1.3);}
          100%{opacity:0;transform:translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0);}
        }
        *{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --red:#B00804; --red-dark:#950A07; --red-deep:#6B0503;
          --slate:#1C2B3A; --slate-mid:#2D3F52; --slate-light:#3D5166;
          --bg:#F7F8FA; --card:#fff; --text:#111827; --muted:#6B7280;
          --border:#E5E7EB; --light-red:#FFF1F0;
        }
        html,body,#root{width:100%;min-height:100%;overflow-x:hidden;}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);-webkit-text-size-adjust:100%;}
        button,input,select,textarea{font:inherit;}
        button,.c-card,.add-btn,.dept-btn,.prereq-chip,[role="button"]{
          -webkit-tap-highlight-color:transparent;
        }
        .fade-in{animation:fadeIn 0.3s ease;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .nav-link{cursor:pointer;padding:8px 15px;border-radius:8px;font-weight:600;font-size:14px;
          color:rgba(255,255,255,0.65);transition:all 0.2s;white-space:nowrap;}
        .nav-link:hover{color:#fff;background:rgba(255,255,255,0.14);}
        .nav-link.active{color:#fff;background:rgba(255,255,255,0.22);}
        .top-nav{overscroll-behavior-x:contain;}
        .nav-logo{flex:0 0 auto;}
        .logo-short,.nav-label-short{display:none;}
        .nav-item{position:relative;cursor:pointer;padding:8px 15px;border-radius:8px;
          min-height:42px;display:flex;align-items:center;justify-content:center;
          touch-action:manipulation;flex:0 0 auto;}
        .nav-item-label{position:relative;z-index:1;font-weight:600;font-size:14px;
          transition:color 0.2s;white-space:nowrap;}
        .c-card{background:white;border-radius:12px;padding:16px;border:1px solid var(--border);
          cursor:pointer;transition:all 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.06);
          display:flex;flex-direction:column;height:100%;}
        .c-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.1);border-color:var(--red);}
        .badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;
          font-weight:700;letter-spacing:0.03em;text-transform:uppercase;}
        .req-bar{height:6px;border-radius:3px;background:rgba(255,255,255,0.12);overflow:hidden;}
        .req-fill{height:100%;border-radius:3px;transition:width 0.6s cubic-bezier(.4,0,.2,1);}
        .plan-cell{background:white;border-radius:12px;padding:14px;border:1px solid var(--border);}
        .p-tag{display:flex;align-items:center;gap:7px;padding:6px 9px;border-radius:7px;
          margin:2px;font-size:12px;font-weight:600;flex:1 0 calc(50% - 4px);min-width:150px;}
        .rm-btn{margin-left:auto;cursor:pointer;color:#9CA3AF;font-size:16px;line-height:1;padding:0 2px;flex-shrink:0;}
        .rm-btn:hover{color:var(--red);}
        .dept-btn{padding:6px 12px;border-radius:7px;cursor:pointer;font-size:12px;font-weight:700;
          font-family:inherit;position:relative;overflow:hidden;border:1.5px solid var(--border);
          background:white;color:var(--muted);
          transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1),border-color 0.18s,color 0.18s;}
        .dept-btn::before{content:'';position:absolute;left:0;right:0;bottom:0;height:0;
          background:linear-gradient(to top,var(--red-dark),var(--red));
          transition:height 0.3s cubic-bezier(0.25,0.46,0.45,0.94);z-index:0;}
        .dept-btn span{position:relative;z-index:1;}
        .dept-btn:hover{transform:scale(1.06) translateY(-1px);border-color:var(--red);color:var(--red);}
        .dept-btn.active::before{height:100%;}
        .dept-btn.active{color:white!important;border-color:var(--red)!important;box-shadow:0 4px 14px rgba(176,8,4,0.3);}
        .dept-btn.active:hover{transform:scale(1.03);color:white!important;}
        .delete-reveal{transition:opacity 0.22s ease,transform 0.28s cubic-bezier(0.34,1.4,0.64,1);}
        .add-btn{border:1.5px dashed #D1D5DB;border-radius:7px;padding:7px;text-align:center;
          font-size:11px;color:#9CA3AF;cursor:pointer;margin-top:6px;transition:all 0.2s;touch-action:manipulation;}
        .add-btn:hover{border-color:var(--red);color:var(--red);background:var(--light-red);}
        .dept-btn{touch-action:manipulation;}
        .prereq-chip{touch-action:manipulation;}
        button{touch-action:manipulation;}
        .overlay{position:fixed;inset:0;background:rgba(17,24,39,0.65);display:flex;align-items:center;
          justify-content:center;z-index:1000;padding:20px;backdrop-filter:blur(5px);}
        .modal{background:white;border-radius:20px;max-width:620px;width:100%;max-height:90vh;
          overflow-y:auto;box-shadow:0 25px 60px rgba(0,0,0,0.22);}
        .si{width:100%;padding:11px 16px;border-radius:10px;border:2px solid var(--border);
          font-size:14px;font-family:'Plus Jakarta Sans',sans-serif;outline:none;transition:border 0.2s;background:#fff;}
        .si:focus{border-color:var(--red);}
        .tag-ap{background:#FEF3C7;color:#92400E;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:800;}
        .prereq-chip{padding:5px 11px;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.15s;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px;}
        .warn-banner{background:#FEF9C3;border:1.5px solid #EAB308;border-radius:10px;padding:12px 16px;margin:10px 0;font-size:13px;color:#78350F;}
        .honors-check{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);}
        .honors-check:last-child{border-bottom:none;}
        .match-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;}
        .course-meta-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;}
        .catalog-grade-filter-btn{flex:0 0 auto;white-space:nowrap;touch-action:manipulation;}
        @media(max-width:900px){
          .plan-grid{grid-template-columns:1fr 1fr !important;}
        }
        @media(max-width:768px){
          .planner-layout{flex-direction:column !important;}
          .planner-sidebar{width:100% !important;position:static !important;margin-top:28px;}
          .planner-sidebar > div{position:static !important;}
          .catalog-search-row{flex-direction:column !important;align-items:stretch !important;}
          .catalog-search-row .si{max-width:100% !important;}
          .catalog-grade-filter-row{flex-wrap:nowrap !important;overflow-x:auto;
            -webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:4px;
            margin-left:-24px;margin-right:-24px;padding-left:24px;padding-right:24px;}
          .catalog-grade-filter-row::-webkit-scrollbar{display:none;}
          .top-nav{height:auto !important;min-height:58px !important;overflow-x:auto;
            -webkit-overflow-scrolling:touch;scrollbar-width:none;padding:8px 12px !important;
            gap:6px !important;align-items:center !important;}
          .top-nav::-webkit-scrollbar{display:none;}
          .nav-item{padding:8px 12px !important;min-height:42px;}
          .si{font-size:16px;}
          .overlay{padding:12px;align-items:flex-end;}
          .modal{width:100% !important;max-height:calc(100dvh - 24px) !important;
            border-radius:16px !important;overscroll-behavior:contain;}
          .grade-toggle-btn{min-width:calc(50% - 4px) !important;flex:1 1 calc(50% - 4px);}
          .match-grid{grid-template-columns:1fr !important;}
          .course-meta-grid{grid-template-columns:1fr !important;}
        }
        @media(max-width:600px){
          .plan-grid{grid-template-columns:1fr !important;}
          .catalog-grid{grid-template-columns:1fr !important;}
          .stat-grid{grid-template-columns:1fr 1fr !important;}
          .grad-grid{grid-template-columns:1fr !important;}
          .nav-logo{font-size:16px !important;margin-right:2px !important;max-width:72px;
            overflow:hidden;white-space:nowrap;}
          .logo-full,.nav-label-full{display:none !important;}
          .logo-short,.nav-label-short{display:inline !important;}
          .nav-item{padding:8px 8px !important;}
          .nav-item-label{font-size:12px !important;}
          .nav-link{padding:6px 8px !important;font-size:11px !important;}
          .modal{border-radius:14px 14px 0 0 !important;margin:0 !important;padding:0 !important;}
          h1{font-size:24px !important;}
          .hero-btns{flex-direction:column !important;align-items:center !important;}
          .hero-btns button{width:100%;max-width:320px;min-height:46px;}
          .grade-btn-row{flex-wrap:wrap !important;}
          .p-tag{min-width:0;flex-basis:100%;}
          /* delete button always visible on touch */
          .delete-reveal{opacity:1 !important;transform:translateX(0) !important;}
          .planner-hint{display:none;}
        }
        @media(hover:hover) and (pointer:fine){
          /* restore hover-only delete on non-touch devices */
          .delete-reveal{opacity:0;transform:translateX(12px);}
          .card-hover-group:hover .delete-reveal{opacity:1;transform:translateX(0);}
          .planner-hint{display:block;}
        }
        @media(hover:none), (pointer:coarse){
          .c-card,.dept-btn,.add-btn,.prereq-chip,.delete-reveal{transition:none !important;}
          .c-card:hover{transform:none;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-color:var(--border);}
          .dept-btn:hover{transform:none;border-color:var(--border);color:var(--muted);}
          .dept-btn.active:hover{transform:none;color:white!important;}
          .add-btn:hover{border-color:#D1D5DB;color:#9CA3AF;background:transparent;}
          .rm-btn:hover{color:#9CA3AF;}
          .delete-reveal{opacity:1 !important;transform:translateX(0) !important;}
          .plan-card-new,.fade-in{animation:none !important;}
        }
        @media(prefers-reduced-motion:reduce){
          *,*::before,*::after{animation-duration:0.001ms !important;
            animation-iteration-count:1 !important;scroll-behavior:auto !important;
            transition-duration:0.001ms !important;}
        }

    `}</style>
  );
}
