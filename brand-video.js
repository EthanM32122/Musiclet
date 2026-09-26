window.MUSICLET_BRAND=Object.assign(window.MUSICLET_BRAND||{},{});
(function(){
  function useWordmark(v){
    if(v.dataset.done) return;
    var mini=v.classList.contains("brand-video-mini");
    var s=document.createElement("span");
    s.className="musiclet-wordmark"+(mini?" musiclet-wordmark-mini":"");
    s.setAttribute("aria-label","Musiclet");
    s.innerHTML='<span class="mw-m">M</span><span class="mw-rest">usiclet</span>';
    v.replaceWith(s);
    v.dataset.done="1";
  }
  function go(){
    document.querySelectorAll("video.brand-video,video.brand-video-mini").forEach(function(v){
      var tried=false;
      function fail(){ if(!tried){ tried=true; useWordmark(v); } }
      v.addEventListener("error", fail);
      if(!v.getAttribute("src") || v.getAttribute("src").indexOf("musiclet-logo")===-1){
        fail();
        return;
      }
      setTimeout(function(){
        if(v.readyState<2) fail();
      }, 2500);
      var p=v.play(); if(p&&p.catch) p.catch(fail);
    });
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",go); else go();
})();
