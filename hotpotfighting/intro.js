// ===== 開場劇情（側視 RPG 對話）=====
const Intro=(()=>{

const W=256,H=144;
const cv=document.getElementById('ic');cv.width=W;cv.height=H;
const g=cv.getContext('2d');
const pc=document.getElementById('iportrait').getContext('2d');
const K='#140f1c';

function R(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);}
function ell(c,cx,cy,rx,ry,col){c.fillStyle=col;for(let y=-ry;y<=ry;y++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-(y*y)/(ry*ry))));c.fillRect(cx-w,cy+y,w*2,1);}}

// ---------- characters ----------
const CH={
  taro:{name:'小紫妹妹',hair:'#8e6bbf',shirt:'#d9c4ef',x:86,y:50,style:'beret',pitch:880,off:0.3},
  meat:{name:'阿強哥哥',hair:'#4a2c1d',shirt:'#c0392b',x:128,y:41,style:'spiky',pitch:520,off:1.7},
  sacha:{name:'夢姊姊',hair:'#221c2c',shirt:'#e67e22',x:170,y:50,style:'bun',pitch:700,off:2.9},
  door:{name:'門外的聲音',hair:'#2f3b22',shirt:'#4b4f5c',skin:'#8fb37a',skinD:'#6d8f5a',eye:'#ff3b3b',style:'spiky',pitch:170},
};
const moods={taro:'normal',meat:'normal',sacha:'normal'};

function drawChar(c,cx,y,ch,mood,talk,t){
  const SK=ch.skin||'#f2c79b',SKD=ch.skinD||'#d9a577',E=ch.eye||K;
  // body
  R(c,cx-8,y+11,16,18,K);R(c,cx-7,y+12,14,17,ch.shirt);
  R(c,cx-10,y+14,3,11,K);R(c,cx+7,y+14,3,11,K);
  R(c,cx-9,y+15,2,9,ch.shirt);R(c,cx+7,y+15,2,9,ch.shirt);
  R(c,cx-2,y+10,4,2,SKD);
  // back hair (long)
  if(ch.style==='bun'){R(c,cx-8,y+1,16,14,K);R(c,cx-7,y+2,14,12,ch.hair);}
  // head
  R(c,cx-7,y-1,14,12,K);R(c,cx-6,y-2,12,1,K);
  R(c,cx-5,y+2,10,8,SK);
  R(c,cx-6,y-1,12,4,ch.hair);R(c,cx-6,y+2,2,6,ch.hair);R(c,cx+4,y+2,2,6,ch.hair);
  R(c,cx-4,y+2,4,1,ch.hair);R(c,cx+1,y+2,2,1,ch.hair);
  if(ch.style==='spiky'){R(c,cx-5,y-4,3,3,K);R(c,cx-4,y-3,1,2,ch.hair);R(c,cx-1,y-5,3,4,K);R(c,cx,y-4,1,3,ch.hair);R(c,cx+3,y-4,3,3,K);R(c,cx+4,y-3,1,2,ch.hair);}
  if(ch.style==='bun'){R(c,cx-3,y-6,6,5,K);R(c,cx-2,y-5,4,3,ch.hair);R(c,cx+2,y-3,3,1,'#e0b84a');}
  if(ch.style==='beret'){R(c,cx-8,y-4,14,4,K);R(c,cx-7,y-3,12,2,'#6a4c9c');R(c,cx-1,y-5,2,1,K);}
  // eyes
  const blinkOn=t&&(((t/1000+(ch.off||0))%3.7)<0.12);
  if(mood==='shock'){R(c,cx-4,y+4,3,3,'#fff');R(c,cx+1,y+4,3,3,'#fff');R(c,cx-3,y+5,1,1,K);R(c,cx+2,y+5,1,1,K);}
  else if(mood==='happy'){R(c,cx-4,y+6,1,1,K);R(c,cx-3,y+5,1,1,K);R(c,cx-2,y+6,1,1,K);R(c,cx+1,y+6,1,1,K);R(c,cx+2,y+5,1,1,K);R(c,cx+3,y+6,1,1,K);}
  else if(blinkOn){R(c,cx-4,y+6,2,1,E);R(c,cx+2,y+6,2,1,E);}
  else{R(c,cx-3,y+5,1,2,E);R(c,cx+2,y+5,1,2,E);}
  if(!ch.skin){R(c,cx-5,y+7,1,1,'#f08a8a');R(c,cx+4,y+7,1,1,'#f08a8a');}
  // mouth
  if(mood==='shock')R(c,cx-1,y+8,2,2,K);
  else if(talk)R(c,cx-1,y+8,2,2,'#7a2030');
  else if(mood==='happy')R(c,cx-1,y+8,3,1,'#7a2030');
  else R(c,cx-1,y+8,2,1,'#a0403a');
  if(ch.skin){R(c,cx-6,y+12,2,2,'#7a2030');R(c,cx+3,y+16,2,1,'#7a2030');}
}

// ---------- scene state ----------
let tvAlert=false,zTarget=0,zv=0,shake=0,doorShake=0;
const steam=[],bubbles=[];
const stars=Array.from({length:14},()=>[20+Math.random()*44|0,16+Math.random()*20|0]);
let speaker=null,typing=false;

function drawWindow(t){
  R(g,10,8,8,58,'#7a2e3a');R(g,66,8,8,58,'#7a2e3a');R(g,10,8,64,3,'#5a1e2a');
  R(g,16,12,52,48,'#1a1208');R(g,17,13,50,46,'#6b4a2f');R(g,19,15,46,42,'#0f1838');
  g.save();g.beginPath();g.rect(19,15,46,42);g.clip();
  stars.forEach(([x,y],i)=>{if(((t/400+i)|0)%5)R(g,x,y,1,1,'#cfd8ff');});
  ell(g,55,24,5,5,'#f5e6a8');ell(g,57,23,4,4,'#0f1838');
  R(g,19,44,10,14,'#0a0f22');R(g,30,40,9,18,'#0a0f22');R(g,40,46,12,12,'#0a0f22');R(g,53,38,12,20,'#0a0f22');
  [[22,47],[33,43],[56,42],[59,48],[44,50]].forEach(([x,y],i)=>{if(!(tvAlert&&((t/300+i)|0)%2))R(g,x,y,1,1,'#ffd36b');});
  if(zv>0.02){
    const zy=58-zv*24;
    R(g,24,zy,18,26,'#121c10');R(g,26,zy-2,14,3,'#121c10');R(g,25,zy-4,3,2,'#121c10');R(g,36,zy-3,2,2,'#121c10');
    if(((t/900)|0)%4){R(g,28,zy+7,3,2,'#b6ff3b');R(g,35,zy+7,3,2,'#b6ff3b');}
    R(g,44,zy+8,6,9,'#1d2b1a');R(g,44,zy+5,1,4,'#1d2b1a');R(g,46,zy+4,1,5,'#1d2b1a');R(g,48,zy+5,1,4,'#1d2b1a');
  }
  g.restore();
  R(g,41,15,2,42,'#6b4a2f');R(g,19,35,46,2,'#6b4a2f');
  R(g,14,58,56,3,'#8a6440');
}

function drawDoor(t){
  const dx=doorShake>0?(Math.random()*3-1.5|0):0;
  R(g,146,20,34,78,'#1a1208');
  R(g,148+dx,22,30,76,'#7a4e2c');
  R(g,151+dx,26,24,28,'#6a4224');R(g,151+dx,60,24,32,'#6a4224');
  R(g,152+dx,27,22,1,'#8a5e38');R(g,152+dx,61,22,1,'#8a5e38');
  R(g,172+dx,57,3,3,'#e0b84a');R(g,162+dx,38,2,2,'#111');
  R(g,146,96,34,2,'#0c0810');
  if(zv>0.5){const a=0.5+0.3*Math.sin(t/200);g.fillStyle=`rgba(182,255,59,${a*0.35})`;g.fillRect(148,97,30,1);R(g,153,97,6,1,'#05030a');R(g,166,97,6,1,'#05030a');}
}

function drawTV(t){
  R(g,192,70,54,26,'#3a2418');R(g,194,72,50,22,'#5e3d28');R(g,194,82,50,1,'#3a2418');R(g,217,72,1,22,'#3a2418');
  R(g,206,80,4,1,'#c9a26b');R(g,226,80,4,1,'#c9a26b');
  R(g,211,33,1,7,'#888');R(g,210,31,1,2,'#888');R(g,228,33,1,7,'#888');R(g,229,31,1,2,'#888');
  R(g,198,39,44,31,'#0a0a0a');R(g,199,40,42,29,'#2b2b2b');
  if(tvAlert){
    const on=((t/350)|0)%2;
    R(g,201,42,38,25,on?'#8a1010':'#5a0a0a');
    R(g,201,44,38,6,'#ffdd33');
    for(let i=0;i<6;i++)R(g,203+i*6,46,4,2,'#8a1010');
    R(g,204,54,30,2,'#fff');R(g,204,58,24,2,'#fff');R(g,204,62,28,2,'#fff');
  }else{
    R(g,201,42,38,25,'#2d5a8a');R(g,201,58,38,9,'#3d8a4a');
    ell(g,214,52,4,4,'#f2c79b');R(g,210,56,8,7,'#e74c3c');
    for(let i=0;i<20;i++)R(g,201+Math.random()*38,42+Math.random()*25,1,1,'rgba(255,255,255,.35)');
  }
  R(g,240,66,1,1,tvAlert?'#ff3b3b':'#3bff6b');
}

function drawTableAndPot(t){
  ell(g,128,102,66,3,'rgba(0,0,0,.35)');
  R(g,60,78,136,7,'#a06a42');R(g,60,78,136,1,'#c48a5a');
  R(g,60,85,136,4,'#6e4428');R(g,60,89,136,1,K);
  R(g,66,89,5,12,'#5a3720');R(g,185,89,5,12,'#5a3720');
  // bowls & chopsticks
  [[86,'#8a4a20'],[170,'#8a4a20']].forEach(([x,s])=>{ell(g,x,81,6,2,'#f3efe6');ell(g,x,81,4,1,s);R(g,x+7,77,1,1,'#d9b47a');R(g,x+8,78,1,1,'#d9b47a');R(g,x+9,79,1,1,'#d9b47a');R(g,x+8,77,1,1,'#d9b47a');R(g,x+9,78,1,1,'#d9b47a');R(g,x+10,79,1,1,'#d9b47a');});
  // plates of ingredients
  ell(g,104,82,7,2,'#e8e8f0');R(g,99,81,4,1,'#e05a6a');R(g,103,81,4,1,'#f08a9a');R(g,101,80,4,1,'#e05a6a');
  ell(g,152,82,7,2,'#e8e8f0');R(g,148,80,2,2,'#d9c9a8');R(g,151,80,2,2,'#d9c9a8');R(g,154,81,3,1,'#f2c94c');R(g,149,82,4,1,'#3fa34d');
  // burner
  R(g,112,75,32,4,'#2b2b2b');R(g,112,75,32,1,'#444');
  for(let i=0;i<7;i++){const h=1+((t/80+i*3)|0)%2;R(g,114+i*4,75-h,2,h,i%2?'#4aa3ff':'#8fd0ff');}
  // pot
  R(g,105,66,6,3,K);R(g,106,67,4,1,'#555');R(g,145,66,6,3,K);R(g,146,67,4,1,'#555');
  R(g,109,63,38,12,K);R(g,110,63,36,11,'#9aa0aa');R(g,110,69,36,5,'#7a808a');R(g,111,64,2,7,'#c8ced8');
  ell(g,128,63,18,4,K);ell(g,128,63,17,3,'#b8bec8');ell(g,128,63,15,2,'#b8281c');ell(g,128,63,13,1,'#d0392b');
  const bob=Math.sin(t/300);
  R(g,119,62+(bob>0?0:1),2,2,'#d9c9a8');R(g,134,63+(bob>0?1:0),2,2,'#d9c9a8');
  R(g,124,63,3,1,'#f2c94c');R(g,130,62,2,1,'#3fa34d');R(g,138,63,2,1,'#3fa34d');R(g,116,63,2,1,'#f5f0e0');
  if(Math.random()<0.3)bubbles.push({x:115+Math.random()*26|0,y:62+Math.random()*3|0,l:8});
  for(let i=bubbles.length-1;i>=0;i--){const b=bubbles[i];R(g,b.x,b.y,1,1,b.l>4?'#ff7a5a':'#ffb09a');if(--b.l<=0)bubbles.splice(i,1);}
}

function drawSteam(){
  if(Math.random()<0.6)steam.push({x:116+Math.random()*24,y:60,l:1,s:Math.random()*6});
  for(let i=steam.length-1;i>=0;i--){
    const p=steam[i];p.y-=0.35;p.x+=Math.sin((p.y+p.s)/5)*0.25;p.l-=0.012;
    if(p.l<=0){steam.splice(i,1);continue;}
    g.fillStyle=`rgba(245,240,235,${p.l*0.45})`;
    const sz=p.l<0.5?2:1;g.fillRect(Math.round(p.x),Math.round(p.y),sz,sz);
  }
}

function scene(t){
  zv+=(zTarget-zv)*0.04;
  g.save();
  if(shake>0)g.translate(Math.random()*4-2|0,Math.random()*2-1|0);
  R(g,-4,-4,W+8,104,'#2a2140');
  for(let x=0;x<W;x+=10)R(g,x,0,1,96,'#30264a');
  for(let x=5;x<W;x+=10)for(let y=6;y<96;y+=12)R(g,x,y,1,1,'#3a2e58');
  R(g,-4,96,W+8,3,'#1c1530');
  R(g,-4,99,W+8,50,'#5b3a28');
  for(let y=104,r=0;y<H;y+=8,r++){R(g,0,y,W,1,'#4a2e1f');for(let x=(r%2)*20;x<W;x+=40)R(g,x,y-7,1,7,'#4a2e1f');}
  // lamp
  R(g,127,0,2,10,'#111');R(g,120,10,16,4,'#e0b84a');R(g,122,14,12,1,'#ffe9a8');
  drawWindow(t);drawDoor(t);drawTV(t);
  ['taro','meat','sacha'].forEach(k=>{const c=CH[k];drawChar(g,c.x,c.y+Math.round(Math.sin(t/600+c.off)*0.6),c,moods[k],speaker===k&&typing&&((t/90)|0)%2,t);});
  drawTableAndPot(t);drawSteam();
  const gr=g.createRadialGradient(128,62,8,128,62,150);
  gr.addColorStop(0,'rgba(255,170,80,0.20)');gr.addColorStop(0.5,'rgba(40,20,60,0.10)');gr.addColorStop(1,'rgba(8,4,20,0.55)');
  g.fillStyle=gr;g.fillRect(0,0,W,H);
  if(tvAlert&&((t/350)|0)%2){g.fillStyle='rgba(255,40,40,0.06)';g.fillRect(0,0,W,H);}
  g.restore();
}

// ---------- audio ----------
let ac=null;
function AC(){if(!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}return ac;}
function blip(f){const a=AC();if(!a||muted)return;try{const o=a.createOscillator(),v=a.createGain();o.type='square';o.frequency.value=f*(0.95+Math.random()*0.1);v.gain.setValueAtTime(0.035,a.currentTime);v.gain.exponentialRampToValueAtTime(0.0001,a.currentTime+0.05);o.connect(v);v.connect(a.destination);o.start();o.stop(a.currentTime+0.06);}catch(e){}}
function thud(){const a=AC();if(!a||muted)return;try{const o=a.createOscillator(),v=a.createGain();o.type='sine';o.frequency.setValueAtTime(110,a.currentTime);o.frequency.exponentialRampToValueAtTime(40,a.currentTime+0.15);v.gain.setValueAtTime(0.6,a.currentTime);v.gain.exponentialRampToValueAtTime(0.0001,a.currentTime+0.2);o.connect(v);v.connect(a.destination);o.start();o.stop(a.currentTime+0.22);}catch(e){}}

// ---------- script ----------
const MAIN=[
  {who:null,t:'寒流來襲的夜晚。\n台北某間老公寓裡，{name}和三個室友圍著一鍋剛滾的麻辣鍋。'},
  {who:'tv',fx:'tv',t:'「插播緊急快報——不明病毒正在全台擴散，感染者會陷入極度飢餓……請民眾立刻緊閉門窗！」'},
  {who:'taro',t:'……欸，湯滾了耶。'},
  {who:'meat',t:'我排了一個小時才買到這盒霜降肉片欸。'},
  {who:'sacha',t:'沙茶醬我也調好了。蒜泥、蔥花、蛋黃，一樣都沒少。'},
  {who:null,fx:'knock',moods:{taro:'shock',meat:'shock',sacha:'shock'},t:'叩、叩、叩——'},
  {who:'door',fx:'zombie',t:'「……好……香……好……餓……」'},
  {who:'taro',t:'…………'},
  {who:'meat',moods:{meat:'happy'},t:'……那，先吃完再說？'},
  {who:'meat',t:'{name}，你說呢？'},
  {choice:[{t:'先下肉片！',go:'A'},{t:'去門口看看',go:'B'}]},
];
const BR={
  A:[
    {who:'sacha',moods:{sacha:'happy',taro:'normal'},t:'好耶！肉片涮三秒就好，誰煮老我就扣他的蛋餃！'},
    {who:'taro',moods:{taro:'happy'},t:'芋頭先下！芋頭要煮最久！'},
    {who:null,end:true,t:'就這樣，{name}和室友們漫長的「火鍋之夜」開始了……'},
  ],
  B:[
    {who:'taro',moods:{taro:'shock'},t:'（從貓眼往外看）……是外送員？\n他手上拿著……空的便當盒……'},
    {who:'meat',moods:{meat:'normal'},t:'回來回來！你的肉片要老了啦！'},
    {who:null,end:true,t:'{name}默默把門鎖上。\n就這樣，漫長的「火鍋之夜」開始了……'},
  ],
};

const root=document.getElementById('intro'),dlg=document.getElementById('idlg'),nameEl=document.getElementById('iname'),textEl=document.getElementById('itext'),
      nextEl=document.getElementById('inext'),chEl=document.getElementById('ichoices'),portEl=document.getElementById('iportrait');
let running=false,onDone=null;
const pname=()=>{try{return localStorage.getItem('hotpot_name')||'你';}catch(e){return'你';}};
let script=MAIN,li=0,cur=null,full='',shown=0,acc=0,started=false,choiceOpen=false;

function drawPortrait(who,t){
  pc.fillStyle='#2a1f3d';pc.fillRect(0,0,24,24);
  if(who==='tv'){R(pc,3,6,18,13,'#0a0a0a');R(pc,4,7,16,11,((t/350)|0)%2?'#8a1010':'#5a0a0a');R(pc,4,8,16,3,'#ffdd33');R(pc,6,13,10,1,'#fff');R(pc,6,15,7,1,'#fff');R(pc,8,3,1,3,'#888');R(pc,15,3,1,3,'#888');return;}
  const c=CH[who];if(!c)return;
  drawChar(pc,12,7,c,who==='door'?'normal':moods[who],typing&&((t/90)|0)%2,t);
}

function fx(f){
  if(f==='tv')tvAlert=true;
  if(f==='knock'){[0,380,760].forEach(d=>setTimeout(()=>{thud();shake=10;doorShake=12;},d));}
  if(f==='zombie')zTarget=1;
}

function show(L){
  chEl.style.display='none';chEl.innerHTML='';choiceOpen=false;
  if(L.choice){
    choiceOpen=true;nextEl.style.display='none';chEl.style.display='flex';
    L.choice.forEach((c,i)=>{const b=document.createElement('button');b.textContent=c.t;
      b.onclick=e=>{e.stopPropagation();blip(660);script=BR[c.go];li=0;show(script[0]);};chEl.appendChild(b);if(i===0)setTimeout(()=>b.focus(),0);});
    return;
  }
  cur=L;speaker=L.who;
  if(L.moods)Object.assign(moods,L.moods);
  if(L.fx)fx(L.fx);
  const c=L.who&&(CH[L.who]||(L.who==='tv'?{name:'電視'}:null));
  if(c){nameEl.textContent=c.name;nameEl.style.display='block';portEl.style.display='block';nameEl.style.background=L.who==='door'?'#3d6b2a':L.who==='tv'?'#555':'#c0392b';}
  else{nameEl.style.display='none';portEl.style.display='none';}
  full=L.t.replace(/\{name\}/g,pname());shown=0;acc=0;typing=true;textEl.textContent='';nextEl.style.display='none';
}

function advance(){
  AC();
  if(choiceOpen)return;
  if(typing){shown=full.length;textEl.textContent=full;typing=false;nextEl.style.display='block';return;}
  if(cur&&cur.end){finish();return;}
  li++;if(li<script.length)show(script[li]);
}
function restart(){
  tvAlert=false;zTarget=0;zv=0;Object.assign(moods,{taro:'normal',meat:'normal',sacha:'normal'});
  script=MAIN;li=0;show(MAIN[0]);
}
root.addEventListener('click',advance);
window.addEventListener('keydown',e=>{if(!running)return;if(e.code==='Space'||e.code==='Enter'){if(choiceOpen)return;e.preventDefault();e.stopPropagation();advance();}},true);
document.getElementById('iskip').addEventListener('click',e=>{e.stopPropagation();finish();});
function finish(){if(!running)return;running=false;root.hidden=true;const cb=onDone;onDone=null;if(cb)cb();}

let last=performance.now();
function loop(t){
  if(!running)return;
  const dt=Math.min(100,t-last);last=t;
  if(shake>0)shake--;if(doorShake>0)doorShake--;
  if(typing){acc+=dt;while(acc>38&&shown<full.length){acc-=38;shown++;const ch=full[shown-1];
      if(shown%2&&!/[\s，。…、「」——！？（）]/.test(ch))blip(speaker&&CH[speaker]?CH[speaker].pitch:speaker==='tv'?400:600);}
    textEl.textContent=full.slice(0,shown);
    if(shown>=full.length){typing=false;nextEl.style.display='block';}}
  scene(t);
  if(speaker)drawPortrait(speaker,t);
  requestAnimationFrame(loop);
}
function start(cb){onDone=cb;running=true;root.hidden=false;dlg.style.display='flex';started=true;restart();last=performance.now();requestAnimationFrame(loop);}
return {start,get running(){return running;}};
})();
