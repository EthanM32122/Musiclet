/* Banner UI auto-inject (works with banners.js) */
(function(){
  function css(){
    if(document.getElementById("banner-styles-inject"))return;
    var s=document.createElement("style");s.id="banner-styles-inject";
    s.textContent=".blacket-name-box{position:relative;display:inline-flex;flex-direction:column;align-items:flex-start;min-width:140px;min-height:52px;padding:8px 14px 8px 48px;background:rgba(0,0,0,.22);border-radius:12px;cursor:pointer;overflow:hidden;color:#fff}.banner-behind{position:absolute;left:6px;top:50%;transform:translateY(-50%);width:40px;height:40px;display:grid;place-items:center;pointer-events:none;z-index:0}.banner-behind svg{width:36px;height:36px;filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))}.blacket-name-box .blacket-username,.blacket-name-box .blacket-sub{position:relative;z-index:1}.banners-modal{max-width:420px;width:92%;background:linear-gradient(180deg,#3b1a7a,#2a1060);border:3px solid #c084fc;border-radius:20px;box-shadow:0 0 0 4px #7c3aed,0 12px 40px rgba(0,0,0,.45);padding:16px 18px}.banners-modal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.banners-title{margin:0;font-size:28px;font-weight:900;background:linear-gradient(180deg,#fde68a,#f472b6 60%,#c084fc);-webkit-background-clip:text;background-clip:text;color:transparent;font-style:italic}.banners-close{background:rgba(255,255,255,.12);border:none;color:#fff;font-size:24px;width:36px;height:36px;border-radius:10px;cursor:pointer}.banners-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-height:min(52vh,360px);overflow-y:auto;padding:4px 2px 8px}.banner-slot{aspect-ratio:1;border-radius:14px;border:3px solid transparent;background:rgba(255,255,255,.08);cursor:pointer;display:grid;place-items:center;padding:8px;position:relative}.banner-slot:hover{background:rgba(255,255,255,.14);border-color:rgba(192,132,252,.5)}.banner-slot.selected{border-color:#fbbf24;background:rgba(251,191,36,.18)}.banner-slot svg{width:100%;height:100%;max-width:72px;max-height:72px}.banner-slot .eq-tag{position:absolute;bottom:4px;right:4px;background:#fbbf24;color:#1a1a2e;font-size:10px;font-weight:800;padding:2px 5px;border-radius:6px}";
    document.head.appendChild(s);
  }
  function ui(){
    if(!document.getElementById("bannersModal")){
      var m=document.createElement("div");m.className="modal-bg";m.id="bannersModal";
      m.innerHTML='<div class="modal banners-modal"><div class="banners-modal-header"><h2 class="banners-title">BANNERS</h2><button type="button" class="banners-close" onclick="closeBannersModal()">×</button></div><div class="banners-grid" id="bannersGrid"></div><button class="btn btn-sm btn-ghost full" style="margin-top:12px" onclick="unequipBanner()">Remove banner</button><button class="btn btn-sm btn-ghost full" style="margin-top:8px" onclick="closeBannersModal()">Close</button></div>';
      document.body.appendChild(m);
      m.addEventListener("click",function(e){if(e.target===m)closeBannersModal();});
    }
    var box=document.querySelector(".blacket-name-box");
    if(box&&!box.dataset.bannerWired){
      box.dataset.bannerWired="1";
      if(!document.getElementById("statsBannerBehind")){
        var b=document.createElement("div");b.className="banner-behind";b.id="statsBannerBehind";
        box.insertBefore(b,box.firstChild);
      }
      box.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();if(typeof openBannersModal==="function")openBannersModal();});
    }
    try{if(typeof updateBannerDisplay==="function")updateBannerDisplay();}catch(e){}
  }
  function run(){css();ui();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
  setTimeout(run,400);setTimeout(run,1200);
  var _r=window.refreshUI;
  if(typeof _r==="function"){window.refreshUI=function(){_r.apply(this,arguments);try{updateBannerDisplay();}catch(e){}};}
})();
