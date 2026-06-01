const PRICE_PER_CLIP=20;
const clips=[
 {id:1,title:"ELIMINAÇÃO DUPLA",tag:"elim",time:"02:14",timeS:134,dur:8,map:"FLORESTA"},
 {id:2,title:"FLANQUEAMENTO PERFEITO",tag:"move",time:"05:42",timeS:342,dur:12,map:"BUNKER"},
 {id:3,title:"DEFESA DO PONTO",tag:"team",time:"08:31",timeS:511,dur:15,map:"VILA"},
 {id:4,title:"TIRO LONGO CERTEIRO",tag:"shot",time:"11:07",timeS:667,dur:6,map:"CAMPO ABERTO"},
 {id:5,title:"TRÊS DE UMA VEZ",tag:"elim",time:"14:55",timeS:895,dur:10,map:"BUNKER"},
 {id:6,title:"CORRIDA EVASIVA",tag:"move",time:"17:20",timeS:1040,dur:9,map:"FLORESTA"},
 {id:7,title:"CAPTURA DA BANDEIRA",tag:"team",time:"19:44",timeS:1184,dur:18,map:"CENTRO"},
 {id:8,title:"HEADSHOT DE PRECISÃO",tag:"shot",time:"22:03",timeS:1323,dur:5,map:"VILA"},
 {id:9,title:"EMBOSCADA EM GRUPO",tag:"team",time:"25:17",timeS:1517,dur:13,map:"FLORESTA"},
 {id:10,title:"ELIMINAÇÃO FINAL",tag:"elim",time:"28:49",timeS:1729,dur:7,map:"CENTRO"},
];
const TOTAL_SECS=1934;
const tagLabel={elim:"ELIMINAÇÃO",move:"MOVIMENTO",team:"EQUIPE",shot:"TIRO"};
const tagClass={elim:"tag-elim",move:"tag-move",team:"tag-team",shot:"tag-shot"};
const tagAccent={elim:"#FF2D78",move:"#00F5FF",team:"#9B00FF",shot:"#FFE600"};
const tagBg={elim:"#1A0010",move:"#001020",team:"#0D0018",shot:"#1A1000"};
const tagIcon={elim:"✕",move:"→",team:"◈",shot:"◎"};
const igPath=`M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z`;
let igHandle='',cart=new Set(),posted=new Set(),payMethod='pix',currentPage='login-page';
const PLAYERS=[
 {id:'p1',name:'VOCÊ',color:'#00F5FF',team:0},{id:'p2',name:'ALIADO 1',color:'#00FF88',team:0},
 {id:'p3',name:'ALIADO 2',color:'#88FF00',team:0},{id:'p4',name:'INIMIGO 1',color:'#FF2D78',team:1},
 {id:'p5',name:'INIMIGO 2',color:'#FF6600',team:1},{id:'p6',name:'INIMIGO 3',color:'#FF0044',team:1},
];
function seededRand(seed){let s=seed;return()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff;};}
function generatePath(pId,teamId){
 const r=seededRand(pId*13337+teamId*9999);const pts=[];
 let x=teamId===0?60+r()*80:560+r()*80,y=50+r()*350;
 for(let t=0;t<=TOTAL_SECS;t+=5){x+=(r()-0.5)*18;y+=(r()-0.5)*14;x=Math.max(20,Math.min(700,x));y=Math.max(20,Math.min(430,y));pts.push({t,x,y});}
 return pts;
}
const playerPaths=PLAYERS.map((p,i)=>generatePath(i+1,p.team));
function getPlayerPos(idx,t){
 const pts=playerPaths[idx];
 for(let i=0;i<pts.length-1;i++){if(t>=pts[i].t&&t<=pts[i+1].t){const f=(t-pts[i].t)/(pts[i+1].t-pts[i].t);return{x:pts[i].x+(pts[i+1].x-pts[i].x)*f,y:pts[i].y+(pts[i+1].y-pts[i].y)*f};}}
 return pts[pts.length-1];
}
let mapTime=0,mapPlaying=false,mapSpeed=1,mapRaf=null,lastTs=null;
const SPEEDS=[0.5,1,2,4];let speedIdx=1;
function hexToRgba(hex,a){hex=hex.replace('#','');const r=parseInt(hex.substring(0,2),16),g=parseInt(hex.substring(2,4),16),b=parseInt(hex.substring(4,6),16);return`rgba(${r},${g},${b},${a})`;}
function drawMap(){
 const canvas=document.getElementById('battle-canvas');if(!canvas)return;
 const ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height;
 ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a160a';ctx.fillRect(0,0,W,H);
 ctx.strokeStyle='rgba(0,245,255,0.05)';ctx.lineWidth=1;
 for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
 for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
 const feats=[
  {type:'rect',x:80,y:60,w:160,h:120,color:'rgba(0,30,0,0.8)',stroke:'rgba(0,100,0,0.4)',label:'FLORESTA'},
  {type:'rect',x:480,y:60,w:160,h:120,color:'rgba(0,30,0,0.8)',stroke:'rgba(0,100,0,0.4)',label:'FLORESTA'},
  {type:'rect',x:280,y:170,w:160,h:110,color:'rgba(20,0,30,0.8)',stroke:'rgba(80,0,120,0.4)',label:'BUNKER'},
  {type:'rect',x:60,y:280,w:120,h:130,color:'rgba(20,15,0,0.8)',stroke:'rgba(80,60,0,0.4)',label:'VILA'},
  {type:'rect',x:540,y:280,w:120,h:130,color:'rgba(20,15,0,0.8)',stroke:'rgba(80,60,0,0.4)',label:'VILA'},
  {type:'circle',x:360,y:360,r:55,color:'rgba(255,45,120,0.08)',stroke:'rgba(255,45,120,0.35)',label:'CENTRO'},
  {type:'rect',x:200,y:60,w:240,h:60,color:'rgba(10,10,20,0.9)',stroke:'rgba(0,245,255,0.25)',label:'CAMPO'},
 ];
 feats.forEach(f=>{
  ctx.save();
  if(f.type==='rect'){ctx.fillStyle=f.color;ctx.fillRect(f.x,f.y,f.w,f.h);ctx.strokeStyle=f.stroke;ctx.lineWidth=1.5;ctx.strokeRect(f.x,f.y,f.w,f.h);ctx.font='bold 9px "Share Tech Mono"';ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillText(f.label,f.x+4,f.y+12);}
  else{ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,Math.PI*2);ctx.fillStyle=f.color;ctx.fill();ctx.strokeStyle=f.stroke;ctx.lineWidth=1.5;ctx.stroke();ctx.font='bold 9px "Share Tech Mono"';ctx.fillStyle='rgba(255,45,120,0.4)';ctx.textAlign='center';ctx.fillText(f.label,f.x,f.y+f.r+12);}
  ctx.restore();
 });
 clips.forEach(c=>{const a=c.timeS/TOTAL_SECS,mx=30+a*(W-60);ctx.save();ctx.globalAlpha=mapTime>=c.timeS&&mapTime<c.timeS+c.dur?1:0.3;ctx.fillStyle=tagAccent[c.tag];ctx.font='10px "Share Tech Mono"';ctx.textAlign='center';ctx.fillText('▼',mx,H-6);ctx.restore();});
 ctx.fillStyle='rgba(255,45,120,0.15)';ctx.fillRect(30,H-22,W-60,14);
 ctx.fillStyle='#FF2D78';ctx.fillRect(30,H-22,(mapTime/TOTAL_SECS)*(W-60),14);
 const ac=clips.find(c=>mapTime>=c.timeS&&mapTime<c.timeS+c.dur);
 if(ac){ctx.save();ctx.strokeStyle=tagAccent[ac.tag];ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.strokeRect(4,4,W-8,H-32);ctx.setLineDash([]);ctx.font='bold 11px "Bebas Neue"';ctx.fillStyle=tagAccent[ac.tag];ctx.textAlign='left';ctx.fillText('⚡ '+ac.title,10,20);ctx.restore();}
 PLAYERS.forEach((p,i)=>{
  const trailLen=40;ctx.save();ctx.lineWidth=1.5;ctx.setLineDash([2,3]);
  for(let dt=trailLen;dt>0;dt-=5){const t0=Math.max(0,mapTime-dt),t1=Math.max(0,mapTime-dt+5),p0=getPlayerPos(i,t0),p1=getPlayerPos(i,t1),alpha=(trailLen-dt)/trailLen*0.3;ctx.strokeStyle=hexToRgba(p.color,alpha);ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.lineTo(p1.x,p1.y);ctx.stroke();}
  ctx.setLineDash([]);ctx.restore();
 });
 PLAYERS.forEach((p,i)=>{
  const pos=getPlayerPos(i,mapTime);ctx.save();ctx.shadowBlur=12;ctx.shadowColor=p.color;
  ctx.beginPath();ctx.arc(pos.x,pos.y,7,0,Math.PI*2);ctx.fillStyle=p.color;ctx.fill();ctx.strokeStyle='#000';ctx.lineWidth=1.5;ctx.stroke();
  const pts=playerPaths[i],tidx=Math.floor(mapTime/5);
  if(tidx<pts.length-1){const dx=pts[Math.min(tidx+1,pts.length-1)].x-pts[tidx].x,dy=pts[Math.min(tidx+1,pts.length-1)].y-pts[tidx].y,ang=Math.atan2(dy,dx);ctx.beginPath();ctx.moveTo(pos.x+Math.cos(ang)*9,pos.y+Math.sin(ang)*9);ctx.lineTo(pos.x+Math.cos(ang+2.5)*5,pos.y+Math.sin(ang+2.5)*5);ctx.lineTo(pos.x+Math.cos(ang-2.5)*5,pos.y+Math.sin(ang-2.5)*5);ctx.closePath();ctx.fillStyle=p.color;ctx.fill();}
  ctx.shadowBlur=0;ctx.font='bold 10px "Share Tech Mono"';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText(p.id==='p1'?'★':p.name.split(' ')[0].substring(0,3),pos.x,pos.y-9);ctx.restore();
 });
 const mm=Math.floor(mapTime/60).toString().padStart(2,'0'),ss=(mapTime%60).toString().padStart(2,'0');
 document.getElementById('map-time-disp').textContent=mm+':'+ss;
 document.getElementById('map-scrub').value=mapTime;
 updateClipTimelineHL();
}
function mapLoop(ts){if(!mapPlaying){lastTs=null;return;}if(lastTs===null)lastTs=ts;const dt=(ts-lastTs)/1000*mapSpeed;lastTs=ts;mapTime=Math.min(TOTAL_SECS,mapTime+dt);drawMap();if(mapTime>=TOTAL_SECS){mapPlaying=false;document.getElementById('btn-play').textContent='▶ PLAY';return;}mapRaf=requestAnimationFrame(mapLoop);}
function togglePlay(){mapPlaying=!mapPlaying;document.getElementById('btn-play').textContent=mapPlaying?'⏸ PAUSE':'▶ PLAY';if(mapPlaying){lastTs=null;mapRaf=requestAnimationFrame(mapLoop);}}
function scrubTo(val){mapTime=parseInt(val);if(!mapPlaying)drawMap();}
function cycleSpeed(){speedIdx=(speedIdx+1)%SPEEDS.length;mapSpeed=SPEEDS[speedIdx];document.getElementById('speed-label').textContent=mapSpeed+'×';}
function buildClipTimeline(){
 const list=document.getElementById('ct-list');
 list.innerHTML=clips.map(c=>`<div class="ct-item" id="cti-${c.id}" onclick="jumpToClip(${c.timeS})"><div class="ct-time">${c.time} · ${c.dur}S</div><div class="ct-name">${c.title}</div><span class="ct-tag-pill" style="background:${tagAccent[c.tag]}22;color:${tagAccent[c.tag]};border:1px solid ${tagAccent[c.tag]}44">${tagLabel[c.tag]}</span></div>`).join('');
 document.getElementById('legend-items').innerHTML=PLAYERS.map(p=>`<div class="legend-item"><div class="legend-dot" style="background:${p.color}"></div>${p.name}</div>`).join('');
}
function jumpToClip(t){mapTime=t;drawMap();document.getElementById('map-scrub').value=t;}
function updateClipTimelineHL(){clips.forEach(c=>{const el=document.getElementById('cti-'+c.id);if(el)el.classList.toggle('ct-active',mapTime>=c.timeS&&mapTime<c.timeS+c.dur);});}
function addToCart(id){if(cart.has(id)){cart.delete(id);}else{cart.add(id);}renderGrid();renderSidebar();const c=clips.find(x=>x.id===id);showToast(cart.has(id)?'// ADICIONADO: '+c.title:'// REMOVIDO: '+c.title,false);}
function addAllToCart(){clips.forEach(c=>cart.add(c.id));renderGrid();renderSidebar();showToast('// TODOS OS CLIPES ADICIONADOS',true);}
function svgPat(tag,acc){
 if(tag==="elim")return`<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0"><line x1="0" y1="0" x2="100%" y2="100%" stroke="${acc}" stroke-width="1" opacity="0.25"/><line x1="100%" y1="0" x2="0" y2="100%" stroke="${acc}" stroke-width="1" opacity="0.25"/><circle cx="50%" cy="50%" r="18" fill="none" stroke="${acc}" stroke-width="1.5" opacity="0.4"/></svg>`;
 if(tag==="move")return`<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0"><line x1="0" y1="50%" x2="100%" y2="50%" stroke="${acc}" stroke-width="1" opacity="0.4"/><line x1="0" y1="30%" x2="100%" y2="30%" stroke="${acc}" stroke-width="0.5" opacity="0.18"/><line x1="0" y1="70%" x2="100%" y2="70%" stroke="${acc}" stroke-width="0.5" opacity="0.18"/></svg>`;
 if(tag==="team")return`<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0"><rect x="28%" y="18%" width="44%" height="64%" fill="none" stroke="${acc}" stroke-width="1" opacity="0.35"/><circle cx="50%" cy="50%" r="9" fill="${acc}" opacity="0.25"/></svg>`;
 return`<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0"><circle cx="50%" cy="50%" r="20" fill="none" stroke="${acc}" stroke-width="1.5" opacity="0.45"/><line x1="50%" y1="0" x2="50%" y2="100%" stroke="${acc}" stroke-width="0.8" opacity="0.25"/><line x1="0" y1="50%" x2="100%" y2="50%" stroke="${acc}" stroke-width="0.8" opacity="0.25"/></svg>`;
}
function buildCard(c,delay){
 const inCart=cart.has(c.id),isPosted=posted.has(c.id),acc=tagAccent[c.tag];
 const btnLabel=isPosted?'POSTADO ✓':inCart?'✓ NO CARRINHO':'ADICIONAR — R$20';
 const btnStyle=inCart&&!isPosted?'border-color:var(--cyan);color:var(--cyan);background:rgba(0,245,255,0.07)':'';
 return`<div class="clip-card${isPosted?' is-posted':''}" style="animation-delay:${delay}ms"><div class="clip-thumb"><div class="clip-thumb-bg" style="background:${tagBg[c.tag]}"></div>${svgPat(c.tag,acc)}<div class="clip-thumb-scanlines"></div><div class="clip-thumb-overlay"></div><span class="clip-tag ${tagClass[c.tag]}">${tagLabel[c.tag]}</span><span class="clip-price-badge">R$20</span><span class="clip-duration">${c.dur}S</span><div class="clip-play-icon" onclick="jumpToClipOnMap(${c.timeS})" title="Ver no mapa">${tagIcon[c.tag]}</div></div><div class="clip-info"><div class="clip-title">${c.title}</div><div class="clip-meta"><span>${c.time}</span><span class="meta-sep">//</span><span>${c.map}</span></div><button class="post-btn${isPosted?' posted':''}" onclick="addToCart(${c.id})" ${isPosted?'disabled':''} style="${btnStyle}"><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="${igPath}"/></svg>${btnLabel}</button></div></div>`;
}
function jumpToClipOnMap(t){showPage('map-page');setTimeout(()=>{mapTime=t;drawMap();document.getElementById('map-scrub').value=t;},200);}
function renderGrid(){document.getElementById('clips-grid').innerHTML=clips.map((c,i)=>buildCard(c,i*35)).join('');}
function renderSidebar(){
 const cc=clips.filter(c=>cart.has(c.id)),total=cc.length*PRICE_PER_CLIP,fmt=v=>'R$ '+v.toFixed(2).replace('.',',');
 document.getElementById('stat-posted').textContent=String(posted.size).padStart(2,'0');
 document.getElementById('stat-value-total').textContent=cart.size>0?fmt(total):'R$0';
 document.getElementById('posted-count').textContent=String(cart.size).padStart(2,'0');
 document.getElementById('summary-remaining').textContent=cart.size+' / '+clips.length;
 document.getElementById('summary-total').textContent=fmt(total);
 document.getElementById('unposted-count').textContent=clips.length-cart.size;
 document.getElementById('btn-total-val').textContent=fmt(clips.length*PRICE_PER_CLIP);
 document.getElementById('post-all-btn').disabled=cart.size===clips.length;
 const cb=document.getElementById('checkout-btn');
 if(cart.size>0){cb.style.display='block';cb.textContent='✓ PAGAR & POSTAR — '+fmt(total);}else{cb.style.display='none';}
 if(!cc.length){document.getElementById('posted-list').innerHTML='<span class="posted-empty">_ NENHUM CLIPE SELECIONADO</span>';return;}
 document.getElementById('posted-list').innerHTML=cc.map(c=>`<div class="posted-item"><div class="posted-dot"></div><span class="posted-name">${c.title}</span><span class="posted-time">R$${PRICE_PER_CLIP}</span></div>`).join('');
}
function goToPayment(){
 if(cart.size===0){showToast('// ADICIONE CLIPES AO CARRINHO',false);return;}
 const cc=clips.filter(c=>cart.has(c.id)),total=cc.length*PRICE_PER_CLIP,fmt=v=>'R$ '+v.toFixed(2).replace('.',',');
 document.getElementById('pay-order-items').innerHTML=cc.map(c=>`<div class="pay-order-item"><span class="pay-order-name">${c.title} <span style="color:${tagAccent[c.tag]};font-size:11px">${tagLabel[c.tag]}</span></span><span class="pay-order-price">R$ 20,00</span></div>`).join('');
 document.getElementById('pay-total-display').textContent=fmt(total);
 document.getElementById('pix-val-show').textContent=fmt(total);
 document.getElementById('pay-ig-handle').textContent=igHandle||'—';
 const sel=document.getElementById('installments');sel.innerHTML='';
 for(let i=1;i<=12;i++){sel.innerHTML+=`<option value="${i}">${i}x de R$ ${(total/i).toFixed(2).replace('.',',')}${i>1?' (sem juros)':''}</option>`;}
 drawPixQR(total);selectMethod('pix');showPage('payment-page');
}
function drawPixQR(total){
 const canvas=document.getElementById('pix-canvas');if(!canvas)return;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,130,130);ctx.fillStyle='#000';
 const r=seededRand(Math.floor(total)*7+42),mod=25,cs=Math.floor(130/mod);
 for(let row=0;row<mod;row++)for(let col=0;col<mod;col++){const iC=(row<7&&col<7)||(row<7&&col>mod-8)||(row>mod-8&&col<7),oB=iC&&((row===0||row===6||col===0||col===6)||(row>0&&row<6&&col>0&&col<6));if(iC){ctx.fillStyle=oB?'#000':'#fff';ctx.fillRect(col*cs,row*cs,cs,cs);}else if(r()>0.5){ctx.fillStyle='#000';ctx.fillRect(col*cs,row*cs,cs,cs);}}
}
function selectMethod(m){payMethod=m;['pix','card','boleto'].forEach(id=>{document.getElementById('pm-'+id).classList.toggle('pm-active',id===m);document.getElementById('panel-'+id).style.display=id===m?'block':'none';});}
function formatCard(inp){let v=inp.value.replace(/\D/g,'').substring(0,16);inp.value=v.replace(/(.{4})/g,'$1 ').trim();const d=document.getElementById('card-num-disp');d.textContent=(v+'').padEnd(16,'•').match(/.{1,4}/g).join(' ');}
function formatExpiry(inp){let v=inp.value.replace(/\D/g,'');if(v.length>=3)v=v.substring(0,2)+'/'+v.substring(2,4);inp.value=v;}
function copyPixKey(){navigator.clipboard.writeText('hotline.highlights@pix.com.br').catch(()=>{});showToast('// CHAVE PIX COPIADA!',false);}
function copyBoleto(){navigator.clipboard.writeText(document.getElementById('boleto-code').textContent).catch(()=>{});showToast('// CÓDIGO COPIADO!',false);}
function confirmPayment(){
 const cc=clips.filter(c=>cart.has(c.id)),total=cc.length*PRICE_PER_CLIP,fmt=v=>'R$ '+v.toFixed(2).replace('.',',');
 document.getElementById('suc-handle').textContent=igHandle||'@—';
 document.getElementById('suc-total').textContent=fmt(total);
 document.getElementById('suc-clips').textContent=cc.length+' clipes selecionados';
 cart.forEach(id=>posted.add(id));cart.clear();renderGrid();renderSidebar();
 showPage('success-page');showToast('// PAGAMENTO CONFIRMADO!',true);
}
function finishSuccess(){showPage('main-page');}
function showPage(id){
 document.querySelectorAll('.page').forEach(p=>{p.classList.remove('active');p.style.display='none';});
 const pg=document.getElementById(id);pg.style.display=id==='login-page'?'flex':'block';
 requestAnimationFrame(()=>pg.classList.add('active'));currentPage=id;
 if(id==='map-page'){const b=document.getElementById('map-clips-btn');if(b)b.style.display=igHandle?'block':'none';buildClipTimeline();setTimeout(()=>{const c=document.getElementById('battle-canvas');if(c){c.width=Math.min(720,c.parentElement.offsetWidth||720);}drawMap();},100);}
 window.scrollTo(0,0);
}
function doLogin(){
 let val=document.getElementById('inp-ig').value.trim().replace(/^@+/,'');
 const e=document.getElementById('error-line');
 if(!val){e.textContent='⚠ INFORME SEU @ DO INSTAGRAM';return;}
 e.textContent='';igHandle='@'+val.toLowerCase();
 ['nav-ig-handle','banner-handle','sidebar-handle','pay-ig-handle','map-ig-handle'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=igHandle;});
 document.getElementById('nav-sess-label').style.display='';showPage('main-page');showToast('// BEM-VINDO, '+igHandle,false);
}
function doLogout(){igHandle='';cart.clear();posted.clear();renderGrid();renderSidebar();document.getElementById('inp-ig').value='';showPage('login-page');showToast('// SESSÃO ENCERRADA',false);}
function goToMapPreview(){showPage('map-page');}
let toastTimer;
function showToast(msg,ig=false){const t=document.getElementById('toast');t.textContent=msg;t.className='toast'+(ig?' ig':'')+(msg.includes('CONFIRMADO')?' green':'')+' show';clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2400);}
document.getElementById('inp-ig').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
renderGrid();renderSidebar();
document.querySelectorAll('.page').forEach(p=>{if(p.id!=='login-page')p.style.display='none';});