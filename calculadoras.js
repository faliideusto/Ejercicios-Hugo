/* Inicio, rutina + volumen semanal, seguimiento de pesos y calorías/macros.
   Todo se guarda en localStorage bajo una sola clave. */
(function(){
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fold=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const uid=()=>Math.random().toString(36).slice(2,10);
const fmt=(n,d=1)=>(Math.round(n*10**d)/10**d).toLocaleString('es-ES');
const today=()=>{const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)};
const fdate=s=>new Date(s+'T12:00').toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'});
const MG=window.MUSCLE_GROUPS, MGK=Object.fromEntries(MG.map(g=>[g.k,g])), DB=window.EJERCICIOS;
const BYN=Object.fromEntries(DB.map(e=>[e.n,e]));
// Sinónimos (también en inglés) para que la búsqueda encuentre lo que la gente escribe en el gym
const ALIAS=[['cruces','aperturas crossover fly'],['aperturas','fly'],['jalon','lat pulldown polea'],['sentadilla','squat'],
  ['press de banca','bench press'],['peso muerto','deadlift'],['rumano','rdl'],['dominadas','pull up chin up'],['zancada','lunge'],
  ['remo','row'],['talones','gemelos calf'],['curl femoral','leg curl'],['extension de cuadriceps','leg extension'],
  ['prensa','leg press'],['press militar','ohp overhead press'],['fondos','dips'],['elevaciones laterales','lateral raise'],
  ['hip thrust','empuje de cadera'],['mancuerna','dumbbell'],['barra','barbell'],['polea','cable'],['maquina','machine'],
  ['multipower','smith'],['encogimientos','shrug'],['pajaros','vuelos posteriores rear delt'],['press frances','skull crusher rompecraneos'],
  ['patada','kickback'],['abduccion','abductores'],['aduccion','adductor'],['plancha','plank'],['crunch','abdominales'],['face pull','facepull']];
DB.forEach(e=>{const base=fold(e.n+' '+Object.keys(e.m).map(k=>MGK[k].n).join(' '));
  e.s=base+' '+ALIAS.filter(([a])=>base.includes(a)).map(([,b])=>b).join(' ')});

/* ---------- almacenamiento ---------- */
const KEY='hugo-entreno-v1', SES_KEY='hugo-sesion', PEND_KEY='hugo-pendiente';
const DEF=()=>({routines:[],active:null,day:0,logs:[],sec:.5,drafts:{},kcal:{sex:'h',age:25,w:75,h:178,bf:'',act:1.55,def:15,sur:10}});
let S;
try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
S=Object.assign(DEF(),S||{});
const saveLocal=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const persist=()=>{saveLocal();cloudQueue()};
let toastT;
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),2200)}

const R=()=>S.routines.find(r=>r.id===S.active);
function newRoutine(name,days){
  const r={id:uid(),name,days:days||[1,2,3].map(i=>({name:'Día '+i,items:[]}))};
  S.routines.push(r);S.active=r.id;S.day=0;persist();return r;
}
const EXAMPLE=[
 ['Torso A',[['Press de banca con barra',3],['Remo con barra',3],['Press de hombro con mancuernas',3],['Jalón al pecho agarre ancho',3],['Elevaciones laterales con mancuernas',3],['Curl con barra EZ',3],['Extensión de tríceps en polea (cuerda)',3]]],
 ['Pierna A',[['Sentadilla con barra (barra alta)',4],['Peso muerto rumano con barra',3],['Prensa de piernas',3],['Curl femoral sentado',3],['Elevación de talones de pie',4],['Crunch en polea (de rodillas)',3]]],
 ['Torso B',[['Press inclinado con mancuernas',3],['Dominadas pronas',3],['Remo en polea baja (gironda)',3],['Fondos en paralelas (tronco inclinado)',3],['Elevaciones laterales en polea',3],['Curl martillo',3],['Press francés con barra EZ',3]]],
 ['Pierna B',[['Hip thrust con barra',3],['Sentadilla búlgara',3],['Extensión de cuádriceps',3],['Curl femoral tumbado',3],['Elevación de talones sentado',4],['Elevación de piernas colgado',3]]],
];
function ensureRoutine(){
  if(!S.routines.length){const r={id:uid(),name:'Torso / Pierna',days:EXAMPLE.map(([name,it])=>({name,items:it.map(([n,s])=>({n,s}))}))};S.routines.push(r);S.active=r.id;S.day=0}
  if(!R())S.active=S.routines[0].id;
}
ensureRoutine();

const musOf=it=>(BYN[it.n]&&BYN[it.n].m)||it.m||{};
const tagsHTML=m=>Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([k,f])=>
  `<span class="tag" style="--c:${MGK[k].c}">${MGK[k].n}${f<1?' ×'+fmt(f,2):''}</span>`).join('');

/* ---------- pestañas ---------- */
const TABS={home:'inicio',sim:'simulador',vol:'rutina',log:'seguimiento',kcal:'calorias'};
function showTab(t){
  for(const k in TABS)$('tab-'+k).hidden=k!==t;
  document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===t));
  if(t==='sim'){resize();history.replaceState(null,'','#'+st.ex.id)}
  else history.replaceState(null,'','#'+TABS[t]);
  ({home:renderHome,vol:renderVol,log:renderLog,kcal:renderKcal}[t]||(()=>{}))();
  scrollTo({top:0,behavior:'smooth'});
}
$('tabs').onclick=e=>{const b=e.target.closest('[data-tab]');if(b)showTab(b.dataset.tab)};
document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)showTab(b.dataset.go)});

/* ---------- inicio ---------- */
function weekVolume(r){
  const v={};for(const g of MG)v[g.k]={d:0,i:0,days:new Set()};
  r.days.forEach((d,di)=>d.items.forEach(it=>{for(const[k,f]of Object.entries(musOf(it))){
    if(f>=1)v[k].d+=it.s*f;else v[k].i+=it.s*f*(S.sec/.5);
    if(f>=1&&it.s>0)v[k].days.add(di)}}));
  return v;
}
function kcalCalc(){
  const k=S.kcal, w=+k.w, bf=+k.bf;
  const lbm=bf?w*(1-bf/100):null;
  const bmr=lbm?370+21.6*lbm:10*w+6.25*(+k.h)-5*(+k.age)+(k.sex==='h'?5:-161);
  return{bmr,tdee:bmr*(+k.act),lbm};
}
function renderHome(){
  const r=R(), sets=r.days.reduce((a,d)=>a+d.items.reduce((b,it)=>b+it.s,0),0);
  const logs=[...S.logs].sort((a,b)=>b.date.localeCompare(a.date));
  const last=logs[0];
  const wk=logs.filter(l=>(Date.now()-new Date(l.date+'T12:00'))/864e5<7).length;
  const {tdee}=kcalCalc();
  const stat=(lbl,val,sub,go)=>`<button class="hstat" data-go="${go}"><small>${lbl}</small><b>${val}</b><span>${sub}</span></button>`;
  $('homeStats').innerHTML=
    stat('Rutina activa',esc(r.name),`${r.days.length} días · ${sets} series/semana`,'vol')+
    stat('Entrenos esta semana',wk,last?`Último: ${fdate(last.date)}`:'Aún no hay registros','log')+
    stat('Entrenos totales',S.logs.length,last?esc(last.dayName):'Empieza hoy','log')+
    stat('Mantenimiento',Math.round(tdee/10)*10+' kcal',`${fmt(+S.kcal.w)} kg · actividad ×${S.kcal.act}`,'kcal');
}

/* ---------- rutina y volumen ---------- */
let filt='all';
$('vFilter').innerHTML=`<button class="chip on" data-f="all">Todos</button>`+MG.map(g=>`<button class="chip" data-f="${g.k}">${g.n}</button>`).join('');
$('vFilter').onclick=e=>{const b=e.target.closest('[data-f]');if(!b)return;filt=b.dataset.f;
  [...$('vFilter').children].forEach(c=>c.classList.toggle('on',c===b));renderSearch()};
$('vSearch').oninput=renderSearch;
$('vCount').textContent=DB.length+' ejercicios';

let found=[];
function renderSearch(){
  const q=fold($('vSearch').value.trim()), toks=q.split(/\s+/).filter(Boolean);
  found=DB.filter(e=>(filt==='all'||e.m[filt]>=1)&&toks.every(t=>e.s.includes(t)));
  let h=found.slice(0,120).map((e,i)=>`<button class="vitem" data-i="${i}"><div class="g1">${esc(e.n)}<div class="tags">${tagsHTML(e.m)}</div></div><span class="plus">+</span></button>`).join('');
  if(q&&!found.some(e=>fold(e.n)===q))h+=`<button class="vitem" data-custom="1"><div class="g1">Añadir «${esc($('vSearch').value.trim())}» como ejercicio propio<div class="tags">${filt!=='all'?tagsHTML({[filt]:1}):'<span class="tag" style="--c:#8b919b">Elige un músculo arriba para que cuente</span>'}</div></div><span class="plus">+</span></button>`;
  $('vRes').innerHTML=h||'<div class="empty">No hay resultados.</div>';
}
$('vRes').onclick=e=>{
  const b=e.target.closest('.vitem');if(!b)return;
  const day=R().days[S.day];
  let it;
  if(b.dataset.custom){const n=$('vSearch').value.trim();it={n,s:3,m:filt!=='all'?{[filt]:1}:{}}}
  else it={n:found[+b.dataset.i].n,s:3};
  const ex=day.items.find(x=>x.n===it.n);
  if(ex)ex.s+=1;else day.items.push(it);
  persist();renderVol(false);toast(`Añadido a ${day.name}`);
};

function renderVol(full=true){
  const r=R();
  if(S.day>=r.days.length)S.day=0;
  $('rSel').innerHTML=S.routines.map(x=>`<option value="${x.id}"${x.id===r.id?' selected':''}>${esc(x.name)}</option>`).join('');
  if(document.activeElement!==$('rName'))$('rName').value=r.name;
  $('dVal').textContent=r.days.length;
  $('dTabs').innerHTML=r.days.map((d,i)=>`<button class="dtab${i===S.day?' on':''}" data-d="${i}"><b>${esc(d.name)}</b><small>${d.items.length} ejercicios · ${d.items.reduce((a,x)=>a+x.s,0)} series</small></button>`).join('');
  const day=r.days[S.day];
  if(document.activeElement!==$('dName'))$('dName').value=day.name;
  $('dList').innerHTML=day.items.length?day.items.map((it,i)=>`<div class="vrow" data-i="${i}">
      <div class="g1">${esc(it.n)}<div class="tags">${tagsHTML(musOf(it))}</div></div>
      <div class="num sm"><button data-a="dec">−</button><input data-a="set" value="${it.s}" inputmode="numeric"><button data-a="inc">+</button></div>
      <div style="display:flex;flex-direction:column"><button class="x" data-a="up" title="Subir">↑</button><button class="x" data-a="del" title="Quitar">×</button></div></div>`).join('')
    :'<div class="empty">Este día está vacío.<br>Busca ejercicios a la izquierda y pulsa <b>+</b>.</div>';
  $('vSec').value=String(S.sec);
  const v=weekVolume(r);
  const tot=Object.values(v).reduce((a,x)=>a+x.d+x.i,0);
  $('vTotal').textContent=`${fmt(tot)} series efectivas`;
  const scale=Math.max(25,...Object.values(v).map(x=>x.d+x.i));
  $('vBars').innerHTML=MG.map(g=>{const x=v[g.k], t=x.d+x.i;
    const [zl,zc]=t===0?['—','#5a606a']:t<10?['Bajo','#8b919b']:t<=20?['Óptimo','#3ddc84']:['Alto','#ffb020'];
    return `<div class="vbar"${t===0?' style="opacity:.45"':''}><div class="top"><b style="color:${g.c}">${g.n}<span class="zone" style="color:${zc};background:${zc}22">${zl}</span></b>
      <span>${fmt(t)} series${x.days.size?` · ${x.days.size}×/sem`:''}</span></div>
      <div class="vtrack"><div class="z" style="left:${1000/scale}%;width:${1000/scale}%"></div>
      <i style="width:${100*t/scale}%;background:${g.c};opacity:.45"></i><i style="width:${100*x.d/scale}%;background:${g.c}"></i></div></div>`}).join('');
  if(full)renderSearch();
}
$('dTabs').onclick=e=>{const b=e.target.closest('[data-d]');if(!b)return;S.day=+b.dataset.d;persist();renderVol(false)};
$('rSel').onchange=e=>{S.active=e.target.value;S.day=0;persist();renderVol(false)};
$('rName').oninput=e=>{R().name=e.target.value||'Sin nombre';persist();renderVol(false)};
$('dName').oninput=e=>{R().days[S.day].name=e.target.value||'Día';persist();renderVol(false)};
$('dInc').onclick=()=>{const r=R();if(r.days.length<7){r.days.push({name:'Día '+(r.days.length+1),items:[]});persist();renderVol(false)}};
$('dDec').onclick=()=>{const r=R();if(r.days.length<2)return;const d=r.days[r.days.length-1];
  if(d.items.length&&!confirm(`¿Quitar «${d.name}» con sus ${d.items.length} ejercicios?`))return;
  r.days.pop();persist();renderVol(false)};
$('rNew').onclick=()=>{newRoutine('Nueva rutina');renderVol(false);$('rName').focus();$('rName').select()};
$('rEx').onclick=()=>{newRoutine('Torso / Pierna (ejemplo)',EXAMPLE.map(([name,it])=>({name,items:it.map(([n,s])=>({n,s}))})));renderVol(false);toast('Rutina de ejemplo cargada')};
$('rDel').onclick=()=>{const r=R();if(!confirm(`¿Eliminar la rutina «${r.name}»? Los entrenos ya registrados se conservan.`))return;
  S.routines=S.routines.filter(x=>x!==r);if(!S.routines.length)newRoutine('Mi rutina');S.active=S.routines[0].id;persist();renderVol(false)};
$('vSec').onchange=e=>{S.sec=+e.target.value;persist();renderVol(false)};
$('dList').addEventListener('click',e=>{
  const b=e.target.closest('[data-a]'), row=e.target.closest('.vrow');if(!b||!row||b.dataset.a==='set')return;
  const items=R().days[S.day].items, i=+row.dataset.i;
  if(b.dataset.a==='inc')items[i].s=Math.min(20,items[i].s+1);
  if(b.dataset.a==='dec')items[i].s=Math.max(1,items[i].s-1);
  if(b.dataset.a==='del')items.splice(i,1);
  if(b.dataset.a==='up'&&i>0)[items[i-1],items[i]]=[items[i],items[i-1]];
  persist();renderVol(false);
});
$('dList').addEventListener('change',e=>{
  if(e.target.dataset.a!=='set')return;const i=+e.target.closest('.vrow').dataset.i;
  R().days[S.day].items[i].s=Math.max(1,Math.min(20,parseInt(e.target.value)||1));persist();renderVol(false);
});
$('dTrain').onclick=()=>{logSel={r:S.active,d:S.day};showTab('log')};

/* ---------- seguimiento ---------- */
let logSel={r:S.active,d:S.day};
const e1rm=(kg,reps)=>kg*(1+reps/30);
function lastFor(n){
  const l=[...S.logs].sort((a,b)=>b.date.localeCompare(a.date)).find(l=>l.entries.some(x=>x.n===n));
  return l?{date:l.date,sets:l.entries.find(x=>x.n===n).sets}:null;
}
function draftKey(){return logSel.r+'|'+logSel.d}
function getDraft(){
  const r=S.routines.find(x=>x.id===logSel.r), day=r&&r.days[logSel.d];if(!day)return null;
  let d=S.drafts[draftKey()];
  const names=day.items.map(i=>i.n);
  if(!d||d.names.join('|')!==names.join('|'))
    d=S.drafts[draftKey()]={names,date:today(),entries:day.items.map(it=>({n:it.n,sets:Array.from({length:it.s},()=>({kg:'',reps:''}))}))};
  return d;
}
function renderLog(){
  if(!S.routines.find(x=>x.id===logSel.r))logSel={r:S.active,d:0};
  const r=S.routines.find(x=>x.id===logSel.r);
  if(logSel.d>=r.days.length)logSel.d=0;
  $('lR').innerHTML=S.routines.map(x=>`<option value="${x.id}"${x.id===r.id?' selected':''}>${esc(x.name)}</option>`).join('');
  $('lD').innerHTML=r.days.map((d,i)=>`<option value="${i}"${i===logSel.d?' selected':''}>${esc(d.name)}</option>`).join('');
  const d=getDraft();
  $('lDate').value=d.date;
  $('lForm').innerHTML=d.entries.length?d.entries.map((en,ei)=>{
    const last=lastFor(en.n);
    const lastTxt=last?`Última vez (${fdate(last.date)}): ${last.sets.map(s=>`${fmt(s.kg)}×${s.reps}`).join(' · ')}`:'Primera vez con este ejercicio';
    return `<div class="lex" data-e="${ei}"><h4>${esc(en.n)}</h4><div class="last">${lastTxt}</div>
      <div class="sets">${en.sets.map((s,si)=>{const p=last&&(last.sets[si]||last.sets[last.sets.length-1]);
        return `<span>Serie ${si+1}</span><input data-s="${si}" data-k="kg" type="number" step="0.5" min="0" inputmode="decimal" placeholder="${p?fmt(p.kg)+' kg':'kg'}" value="${s.kg}">
        <input data-s="${si}" data-k="reps" type="number" min="0" inputmode="numeric" placeholder="${p?p.reps+' reps':'reps'}" value="${s.reps}">
        <button class="x" data-rm="${si}" title="Quitar serie">×</button>`}).join('')}</div>
      <button class="mini" data-add="1">+ Añadir serie</button></div>`}).join('')
    :'<div class="empty">Este día no tiene ejercicios. Añádelos en «Rutina y volumen».</div>';
  renderHistory();renderProgress();
}
$('lR').onchange=e=>{logSel={r:e.target.value,d:0};renderLog()};
$('lD').onchange=e=>{logSel.d=+e.target.value;renderLog()};
$('lDate').onchange=e=>{getDraft().date=e.target.value;persist()};
$('lForm').addEventListener('input',e=>{const t=e.target;if(!t.dataset.k)return;
  const d=getDraft(), ei=+t.closest('.lex').dataset.e;d.entries[ei].sets[+t.dataset.s][t.dataset.k]=t.value;persist()});
$('lForm').addEventListener('click',e=>{const box=e.target.closest('.lex');if(!box)return;const en=getDraft().entries[+box.dataset.e];
  if(e.target.dataset.add){en.sets.push({kg:'',reps:''});persist();renderLog()}
  if(e.target.dataset.rm!=null){en.sets.splice(+e.target.dataset.rm,1);persist();renderLog()}});
$('lSave').onclick=()=>{
  const r=S.routines.find(x=>x.id===logSel.r), d=getDraft();
  const entries=d.entries.map(en=>({n:en.n,sets:en.sets.filter(s=>s.kg!==''||s.reps!=='').map(s=>({kg:+s.kg||0,reps:+s.reps||0}))})).filter(en=>en.sets.length);
  if(!entries.length){toast('Apunta al menos una serie');return}
  S.logs.push({id:uid(),date:$('lDate').value||today(),rName:r.name,dayName:r.days[logSel.d].name,entries});
  delete S.drafts[draftKey()];persist();
  pSel=entries[0].n;renderLog();toast('Entreno guardado 💪');
};
function renderHistory(){
  const logs=[...S.logs].sort((a,b)=>b.date.localeCompare(a.date));
  $('hCount').textContent=logs.length?logs.length+' entrenos':'';
  $('hist').innerHTML=logs.length?logs.slice(0,40).map(l=>{const vol=l.entries.reduce((a,en)=>a+en.sets.reduce((b,s)=>b+s.kg*s.reps,0),0);
    return `<details class="hitem"><summary><div><b>${esc(l.dayName)}</b> <span>· ${esc(l.rName)}</span><br><span>${fdate(l.date)} · ${l.entries.length} ejercicios · ${fmt(vol,0)} kg movidos</span></div>
      <button class="x" data-del="${l.id}" title="Borrar">×</button></summary>
      <ul>${l.entries.map(en=>`<li>${esc(en.n)}: ${en.sets.map(s=>`${fmt(s.kg)}×${s.reps}`).join(' · ')}</li>`).join('')}</ul></details>`}).join('')
    :'<div class="empty">Cuando guardes tu primer entreno aparecerá aquí.</div>';
}
$('hist').onclick=e=>{const id=e.target.dataset.del;if(!id)return;e.preventDefault();
  if(!confirm('¿Borrar este entreno del historial?'))return;S.logs=S.logs.filter(l=>l.id!==id);persist();renderLog()};

let pSel=null;
function renderProgress(){
  const names=[...new Set(S.logs.flatMap(l=>l.entries.map(e=>e.n)))].sort((a,b)=>a.localeCompare(b,'es'));
  if(!names.includes(pSel))pSel=names[0]||null;
  $('pEx').innerHTML=names.length?names.map(n=>`<option${n===pSel?' selected':''}>${esc(n)}</option>`).join(''):'<option>Sin datos todavía</option>';
  const c=$('pChart'), g=c.getContext('2d'), dpr=devicePixelRatio||1, W=c.clientWidth, H=c.clientHeight;
  c.width=W*dpr;c.height=H*dpr;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);
  if(!pSel){$('pTable').innerHTML='<div class="empty">Registra entrenos para ver tu progreso: peso máximo y 1RM estimado de cada ejercicio.</div>';return}
  const pts=S.logs.filter(l=>l.entries.some(e=>e.n===pSel)).sort((a,b)=>a.date.localeCompare(b.date)).map(l=>{
    const sets=l.entries.find(e=>e.n===pSel).sets;
    const best=sets.reduce((a,s)=>e1rm(s.kg,s.reps)>e1rm(a.kg,a.reps)?s:a,sets[0]);
    return{date:l.date,top:Math.max(...sets.map(s=>s.kg)),e1:e1rm(best.kg,best.reps),best,vol:sets.reduce((a,s)=>a+s.kg*s.reps,0)}});
  const vals=pts.flatMap(p=>[p.top,p.e1]), lo=Math.min(...vals)*.92, hi=Math.max(...vals)*1.05||1;
  const pl=34,pr=10,pt=10,pb=22, X=i=>pts.length<2?(W+pl-pr)/2:pl+i*(W-pl-pr)/(pts.length-1), Y=v=>H-pb-(v-lo)/(hi-lo||1)*(H-pt-pb);
  g.font='10.5px Inter';g.fillStyle='#8b919b';g.strokeStyle='#2c3037';
  for(let i=0;i<=3;i++){const v=lo+(hi-lo)*i/3,y=Y(v);g.beginPath();g.moveTo(pl,y);g.lineTo(W-pr,y);g.stroke();g.textAlign='right';g.fillText(Math.round(v),pl-6,y+3)}
  g.textAlign='left';g.fillText(fdate(pts[0].date),pl,H-4);if(pts.length>1){g.textAlign='right';g.fillText(fdate(pts[pts.length-1].date),W-pr,H-4)}
  for(const[key,col]of[['e1','#ff6a2b'],['top','#4da3ff']]){
    g.strokeStyle=col;g.lineWidth=2.5;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(X(i),Y(p[key])):g.moveTo(X(i),Y(p[key])));g.stroke();
    pts.forEach((p,i)=>{g.beginPath();g.arc(X(i),Y(p[key]),3.5,0,7);g.fillStyle=col;g.fill()})}
  const pr1=Math.max(...pts.map(p=>p.e1));
  $('pTable').innerHTML=`<div class="vleg" style="margin:10px 0 0"><span><i class="sw" style="background:#ff6a2b"></i>1RM estimado (Epley)</span><span><i class="sw" style="background:#4da3ff"></i>Peso máximo</span><span>Récord: <b style="color:var(--txt)">${fmt(pr1)} kg</b></span></div>
    <table class="t"><tr><th>Fecha</th><th>Mejor serie</th><th>1RM est.</th><th>Volumen</th></tr>${pts.slice(-8).reverse().map(p=>
    `<tr><td>${fdate(p.date)}</td><td>${fmt(p.best.kg)} kg × ${p.best.reps}</td><td>${fmt(p.e1)} kg${p.e1===pr1?' 🏆':''}</td><td>${fmt(p.vol,0)} kg</td></tr>`).join('')}</table>`;
}
$('pEx').onchange=e=>{pSel=e.target.value;renderProgress()};
addEventListener('resize',()=>{if(!$('tab-log').hidden)renderProgress()});
$('bExp').onclick=()=>{
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,1)],{type:'application/json'}));
  a.download=`entrenos-hugo-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
};
$('bImp').onchange=async e=>{
  const f=e.target.files[0];if(!f)return;
  try{const d=JSON.parse(await f.text());if(!Array.isArray(d.routines)||!Array.isArray(d.logs))throw 0;
    if(!confirm('Esto sustituirá tus rutinas y entrenos actuales por los de la copia. ¿Seguir?'))return;
    S=Object.assign(S,d);persist();logSel={r:S.active,d:0};renderLog();toast('Copia importada')}
  catch(err){alert('El archivo no es una copia válida.')}
  e.target.value='';
};

/* ---------- calorías y macros ---------- */
const MAC=[['p','Proteína','#4da3ff',4],['c','Carbohidratos','#ffb020',4],['f','Grasas','#ff4fa3',9]];
function renderKcal(){
  const k=S.kcal;
  [...$('kSex').children].forEach(b=>b.classList.toggle('on',b.dataset.v===k.sex));
  for(const[id,f]of[['kAge','age'],['kW','w'],['kH','h'],['kBf','bf'],['kAct','act'],['kDef','def'],['kSur','sur']])
    if(document.activeElement!==$(id))$(id).value=k[f];
  const w=+k.w;
  if(!(w>0&&+k.h>0&&+k.age>0)){$('kCards').innerHTML='<div class="empty">Rellena edad, peso y altura.</div>';return}
  const {bmr,tdee,lbm}=kcalCalc();
  const pBase=lbm?Math.min(w,lbm/.85):w;
  $('kStats').innerHTML=[
    ['Metabolismo basal',Math.round(bmr)+' kcal'],['Mantenimiento',Math.round(tdee)+' kcal'],
    ['Agua aprox.',fmt(w*.035,1)+' L/día'],[lbm?'Masa magra':'IMC',lbm?fmt(lbm)+' kg':fmt(w/((k.h/100)**2))]
  ].map(([a,b])=>`<div class="kstat"><small>${a}</small><b>${b}</b></div>`).join('');
  const plans=[
    {lbl:'Déficit · perder grasa',kc:'#4da3ff',kcal:tdee*(1-k.def/100),pk:2.2},
    {lbl:'Mantenimiento',kc:'#c9cdd4',kcal:tdee,pk:1.8},
    {lbl:'Volumen · ganar músculo',kc:'#3ddc84',kcal:tdee*(1+k.sur/100),pk:2.0},
  ];
  $('kCards').innerHTML=plans.map(pl=>{
    const kcal=Math.round(pl.kcal/10)*10, p=pl.pk*pBase, f=Math.max(.25*kcal/9,.6*w), c=Math.max(0,(kcal-p*4-f*9)/4);
    const g={p,c,f}, kg=(kcal-tdee)*7/7700;
    const rate=Math.abs(kg)<.01?'Peso estable':`${kg>0?'+':'−'}${fmt(Math.abs(kg),2)} kg/semana aprox.`;
    return `<div class="card kc" style="--kc:${pl.kc}"><div class="lbl">${pl.lbl}</div>
      <div class="big">${kcal.toLocaleString('es-ES')} <small>kcal/día</small></div><div class="sub">${rate}</div>
      <div class="stack">${MAC.map(([id,,col,kc])=>`<i style="width:${100*g[id]*kc/kcal}%;background:${col}"></i>`).join('')}</div>
      ${MAC.map(([id,n,col,kc])=>`<div class="mac"><div><i style="background:${col}"></i>${n}<br><span>${Math.round(100*g[id]*kc/kcal)}% · ${fmt(g[id]/w,1)} g/kg</span></div><b>${Math.round(g[id])} g</b></div>`).join('')}
      <div class="mac"><div><i style="background:#9ad97a"></i>Fibra<br><span>14 g por cada 1.000 kcal</span></div><b>${Math.round(kcal*14/1000)} g</b></div>
      ${pl.kcal<bmr?'<div class="kwarn">⚠ Por debajo de tu metabolismo basal: no conviene mantenerlo mucho tiempo.</div>':''}</div>`}).join('');
}
$('kSex').onclick=e=>{const b=e.target.closest('[data-v]');if(!b)return;S.kcal.sex=b.dataset.v;persist();renderKcal()};
for(const[id,f]of[['kAge','age'],['kW','w'],['kH','h'],['kBf','bf'],['kAct','act'],['kDef','def'],['kSur','sur']])
  $(id).addEventListener('input',e=>{S.kcal[f]=e.target.value;persist();renderKcal()});

/* ---------- cuenta en la nube (Supabase, usuario + PIN) ---------- */
function cloudQueue(){
  if(!session)return;
  dirty=true;setPending(true);setSync('busy','Guardando…');
  clearTimeout(pushT);pushT=setTimeout(cloudPush,1200);
}
// Marca persistente: hay cambios de este dispositivo que aún no están en la nube
function setPending(v){try{v?localStorage.setItem(PEND_KEY,'1'):localStorage.removeItem(PEND_KEY)}catch(e){}}
function setSync(cls,title){const s=$('sync');s.className='sync'+(cls?' '+cls:'');s.title=title}
async function rpc(fn,args,keepalive){
  const headers={'Content-Type':'application/json',apikey:CLOUD.key};
  if(CLOUD.key.startsWith('eyJ'))headers.Authorization='Bearer '+CLOUD.key; // claves anon antiguas (JWT)
  const r=await fetch(`${CLOUD.url}/rest/v1/rpc/${fn}`,{method:'POST',headers,body:JSON.stringify(args),keepalive});
  if(!r.ok)throw new Error('No se pudo conectar con el servidor ('+r.status+')');
  return r.json();
}
async function cloudPush(keepalive){
  if(!session||!dirty)return;
  clearTimeout(pushT);
  const sent=JSON.stringify(S);dirty=false;
  try{
    const res=await rpc('guardar',{p_usuario:session.u,p_pin:session.p,p_datos:JSON.parse(sent)},keepalive);
    if(!res.ok){if(/incorrect/i.test(res.error))return expire(res.error);throw new Error(res.error)}
    lastSync=res.actualizado;
    if(!dirty){setPending(false);setSync('','Guardado en tu cuenta')}
  }catch(err){dirty=true;setSync('err','Sin conexión: se guardará cuando vuelva');clearTimeout(pushT);pushT=setTimeout(cloudPush,15000)}
}
// Sustituye los datos locales por los de la cuenta y repinta la pestaña visible
function applyRemote(datos,actualizado){
  S=Object.assign(DEF(),datos||{});ensureRoutine();saveLocal();
  lastSync=actualizado;logSel={r:S.active,d:S.day};pSel=null;
  const t=Object.keys(TABS).find(k=>!$('tab-'+k).hidden);
  ({home:renderHome,vol:renderVol,log:renderLog,kcal:renderKcal}[t]||(()=>{}))();
}
async function cloudPull(){
  if(!session||dirty)return;
  try{const res=await rpc('entrar',{p_usuario:session.u,p_pin:session.p});
    if(!res.ok)return /incorrect/i.test(res.error)?expire(res.error):null;
    if(res.actualizado!==lastSync)applyRemote(res.datos,res.actualizado);
    setSync('','Guardado en tu cuenta');
  }catch(err){setSync('err','Sin conexión: trabajando con los datos de este dispositivo')}
}
function startSession(u,p){
  session={u,p};try{localStorage.setItem(SES_KEY,JSON.stringify(session))}catch(e){}
  $('auth').hidden=true;$('acct').hidden=false;$('acctName').textContent=u;
}
function expire(msg){
  session=null;try{localStorage.removeItem(SES_KEY)}catch(e){}
  $('acct').hidden=true;showAuth('in',msg);
}
function showAuth(mode,msg){
  authMode=mode;$('auth').hidden=false;
  [...$('aMode').children].forEach(b=>b.classList.toggle('on',b.dataset.m===mode));
  $('aTitle').textContent=mode==='up'?'Crea tu cuenta':'Entra en tu cuenta';
  $('aGo').textContent=mode==='up'?'Crear cuenta':'Entrar';
  $('aPin2Wrap').hidden=mode!=='up';
  $('aPin').autocomplete=mode==='up'?'new-password':'current-password';
  $('aErr').textContent=msg||'';
  setTimeout(()=>$('aUser').focus(),50);
}
const CLOUD={url:(window.SUPABASE_URL||'').trim().replace(/\/+$/,''),key:(window.SUPABASE_ANON_KEY||'').trim()};
let session=null, dirty=false, pushT=null, lastSync=null, authMode='in';
$('aMode').onclick=e=>{const b=e.target.closest('[data-m]');if(b)showAuth(b.dataset.m)};
for(const id of['aPin','aPin2'])$(id).addEventListener('input',e=>{e.target.value=e.target.value.replace(/\D/g,'').slice(0,6)});
$('aForm').onsubmit=async e=>{
  e.preventDefault();
  const u=$('aUser').value.trim().toLowerCase(), p=$('aPin').value;
  if(!/^[a-z0-9_.-]{3,20}$/.test(u))return $('aErr').textContent='Usuario: 3–20 caracteres (letras, números, . _ -), sin espacios';
  if(!/^\d{4,6}$/.test(p))return $('aErr').textContent='El PIN debe tener entre 4 y 6 números';
  if(authMode==='up'&&p!==$('aPin2').value)return $('aErr').textContent='Los dos PIN no coinciden';
  $('aGo').disabled=true;$('aErr').textContent='';
  try{
    if(authMode==='up'){
      const res=await rpc('registrar',{p_usuario:u,p_pin:p,p_datos:S});
      if(!res.ok)throw new Error(res.error);
      startSession(u,p);lastSync=res.actualizado;setSync('','Guardado en tu cuenta');toast('Cuenta creada. ¡A entrenar, '+u+'!');
    }else{
      const res=await rpc('entrar',{p_usuario:u,p_pin:p});
      if(!res.ok)throw new Error(res.error);
      startSession(u,p);
      if(res.datos)applyRemote(res.datos,res.actualizado);else{dirty=true;cloudPush()}
      setSync('','Guardado en tu cuenta');toast('Hola de nuevo, '+u);
    }
    $('aPin').value=$('aPin2').value='';
  }catch(err){$('aErr').textContent=err.message}
  finally{$('aGo').disabled=false}
};
$('logout').onclick=async()=>{
  if(dirty)await cloudPush();
  if(dirty&&!confirm('Hay cambios que aún no se han subido (sin conexión). Si sales ahora se perderán. ¿Salir igualmente?'))return;
  session=null;try{for(const k of[SES_KEY,KEY,PEND_KEY])localStorage.removeItem(k)}catch(e){}
  location.reload();
};
document.addEventListener('visibilitychange',()=>{if(document.hidden)cloudPush(true);else cloudPull()});
addEventListener('online',()=>{if(dirty)cloudPush();else cloudPull()});

/* ---------- arranque ---------- */
const h=window.INIT_HASH||'';
const start=Object.keys(TABS).find(k=>TABS[k]===h)||(EX.some(e=>e.id===h)?'sim':'home');
showTab(start);
if(CLOUD.url&&CLOUD.key){
  let ses=null;try{ses=JSON.parse(localStorage.getItem(SES_KEY))}catch(e){}
  let pending=false;try{pending=!!localStorage.getItem(PEND_KEY)}catch(e){}
  if(ses&&ses.u&&ses.p){startSession(ses.u,ses.p);setSync('busy','Cargando tu cuenta…');
    if(pending){dirty=true;cloudPush()}else cloudPull()}
  else showAuth('in');
}
})();
