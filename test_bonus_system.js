const assert=(x,m)=>{if(!x)throw Error(m)};
const CM={power:{need:25,reward:250,xp:80,vehicle:'City Mini'},tow:{need:25,reward:400,xp:120,vehicle:'Abschleppwagen'},rescue:{need:25,reward:550,xp:160,vehicle:'Rescue Heli'},race:{need:40,reward:700,xp:200,vehicle:'Turbo GT'}};
const fresh=()=>({activeMission:null,progress:{},credits:0,xp:0,runs:{},owned:['City Mini'],activeVehicle:'City Mini'});
const clone=x=>JSON.parse(JSON.stringify(x));
function correct(z){let id=z.activeMission;if(!id||!CM[id])return [z,false];let p=z.progress[id]||0;if(p>=CM[id].need)return[z,false];let n=clone(z);n.progress[id]=Math.min(CM[id].need,p+1);return[n,true]}
function activate(z,id){let m=CM[id];if(!z.owned.includes(m.vehicle)||z.activeVehicle!==m.vehicle)return[z,false];return[{...clone(z),activeMission:id},true]}
function buy(z,name,price){if(z.credits<price||z.owned.includes(name))return[z,false];let n=clone(z);n.credits-=price;n.owned.push(name);return[n,true]}
function choose(z,name){if(!z.owned.includes(name))return[z,false];return[{...clone(z),activeVehicle:name},true]}
function finish(z,id){let m=CM[id],p=z.progress[id]||0;if(p<m.need)return[z,false];let n=clone(z);n.credits+=m.reward;n.xp+=m.xp;n.runs[id]=(n.runs[id]||0)+1;n.progress[id]=0;n.activeMission=null;if(id==='tow'&&!n.owned.includes('Rescue Heli'))n.owned.push('Rescue Heli');return[n,true]}
function stage(id,p){return CM[id].need===40?Math.min(4,Math.floor(p/10)):Math.min(5,Math.floor(p/5))}
let z=fresh(),ok;
// no active mission: correct math must NOT silently increment anything
[z,ok]=correct(z);assert(!ok&&Object.keys(z.progress).length===0,'no active mission');
// power lifecycle + milestones
[z,ok]=activate(z,'power');assert(ok&&z.activeMission==='power','activate power');
for(let i=1;i<=25;i++){[z,ok]=correct(z);assert(ok&&z.progress.power===i,`power +1 ${i}`);if([5,10,15,20,25].includes(i))assert(stage('power',i)===i/5,`power stage ${i}`)}
[z,ok]=correct(z);assert(!ok&&z.progress.power===25,'cap at 25');
[z,ok]=finish(z,'power');assert(ok&&z.credits===250&&z.xp===80&&z.progress.power===0&&z.runs.power===1&&z.activeMission===null,'finish power');
// repeat power twice for 750 credits
for(let round=0;round<2;round++){[z,ok]=activate(z,'power');assert(ok);for(let i=0;i<25;i++) [z]=correct(z);[z,ok]=finish(z,'power');assert(ok)}
assert(z.credits===750&&z.xp===240&&z.runs.power===3,'3 power rounds');
// failed purchases and vehicle gates
let before=clone(z);[z,ok]=activate(z,'tow');assert(!ok&&JSON.stringify(z)===JSON.stringify(before),'tow locked before truck');
[z,ok]=buy(z,'Turbo GT',900);assert(!ok&&z.credits===750,'cannot buy turbo without credits');
[z,ok]=buy(z,'Abschleppwagen',600);assert(ok&&z.credits===150&&z.owned.includes('Abschleppwagen'),'buy tow truck');
[z,ok]=activate(z,'tow');assert(!ok,'tow mission requires active tow vehicle');
[z,ok]=choose(z,'Abschleppwagen');assert(ok&&z.activeVehicle==='Abschleppwagen','choose tow truck');
[z,ok]=activate(z,'tow');assert(ok&&z.activeMission==='tow','activate tow mission');
for(let i=0;i<25;i++) [z]=correct(z);[z,ok]=finish(z,'tow');assert(ok&&z.credits===550&&z.xp===360&&z.owned.includes('Rescue Heli')&&z.runs.tow===1,'finish tow/unlock heli');
assert(Math.min(6,1+z.runs.tow)===2,'tow level 2');
// heli lifecycle and persistence round trip
[z,ok]=activate(z,'rescue');assert(!ok,'rescue requires active heli');[z,ok]=choose(z,'Rescue Heli');assert(ok);[z,ok]=activate(z,'rescue');assert(ok);for(let i=0;i<7;i++) [z]=correct(z);let stored=JSON.stringify(z),reloaded=JSON.parse(stored);assert(reloaded.progress.rescue===7&&reloaded.activeMission==='rescue'&&reloaded.activeVehicle==='Rescue Heli','reload persistence');z=reloaded;for(let i=7;i<25;i++) [z]=correct(z);[z,ok]=finish(z,'rescue');assert(ok&&z.credits===1100&&z.xp===520,'finish rescue');
// buy turbo / race 40 / milestones
[z,ok]=buy(z,'Turbo GT',900);assert(ok&&z.credits===200,'buy turbo');[z,ok]=choose(z,'Turbo GT');assert(ok);[z,ok]=activate(z,'race');assert(ok);for(let i=1;i<=40;i++){[z]=correct(z);if([10,20,30,40].includes(i))assert(stage('race',i)===i/10,`race stage ${i}`)}[z,ok]=finish(z,'race');assert(ok&&z.credits===900&&z.xp===720&&z.runs.race===1,'finish race');
// tow reaches level 6 but does not exceed it
z.owned.includes('Abschleppwagen')||z.owned.push('Abschleppwagen');z.activeVehicle='Abschleppwagen';for(let r=1;r<6;r++){[z]=activate(z,'tow');for(let i=0;i<25;i++) [z]=correct(z);[z]=finish(z,'tow')}assert(z.runs.tow===6&&Math.min(6,1+z.runs.tow)===6,'tow max level 6');
console.log(JSON.stringify({passed:true,powerProgress:true,noActiveNoProgress:true,vehicleGates:true,purchases:true,heliUnlock:true,reload:true,missions25:true,race40:true,creditsXp:true,towMaxLevel6:true}));
