(function(){
  function apply(){
    var B=window.MUSICLET_BRAND; if(!B) return;
    if(B.favicon){
      var icon=document.querySelector('link[rel="icon"]');
      if(icon) icon.href=B.favicon;
      else { var l=document.createElement('link'); l.rel='icon'; l.type='image/png'; l.href=B.favicon; document.head.appendChild(l); }
      var a=document.querySelector('link[rel="apple-touch-icon"]'); if(a) a.href=B.favicon;
    }
    if(B.logo96) document.querySelectorAll('img.site-logo-lg').forEach(function(el){ el.src=B.logo96; });
    if(B.logo40) document.querySelectorAll('img.site-logo-sm').forEach(function(el){ el.src=B.logo40; });
    if(B.wordmarkVideo) document.querySelectorAll('video.brand-video,video.brand-video-mini').forEach(function(v){
      if(v.dataset.branded==='1') return;
      v.src=B.wordmarkVideo; v.dataset.branded='1'; v.muted=true; v.loop=true; v.playsInline=true;
      var p=v.play(); if(p&&p.catch) p.catch(function(){});
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', apply); else apply();
})();
