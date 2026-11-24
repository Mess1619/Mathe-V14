const assert=(x,m)=>{if(!x)throw Error(m)};
function digitMarks(expected,input){const e=String(expected),v=String(input).padStart(e.length,' ');return [...e].map((d,i)=>v[i]===d?'ok':'bad')}
function mulModel(a,b){const A=String(a),B=String(b),answer=String(a*b),parts=B.split('').map((d,i)=>({shift:B.length-1-i,text:String(a*Number(d))}));const cols=Math.max(A.length+B.length+1,answer.length+1,5),start=(t,s=0)=>cols-t.length-s,exp={};parts.forEach((p,r)=>[...p.text].forEach((d,j)=>exp[`p-${r}-${start(p.text,p.shift)+j}`]=d));let fs=start(answer);[...answer].forEach((d,j)=>exp[`f-${fs+j}`]=d);return{parts,answer,exp,cols,fs}}
function mulMarks(a,b,input){const m=mulModel(a,b),status={};for(const id in m.exp)if(id in input)status[id]=String(input[id])===m.exp[id]?'ok':'bad';return{...m,status,all:Object.keys(m.exp).every(id=>String(input[id])===m.exp[id])}}
function divExpected(a,b){return{q:Math.floor(a/b),r:a%b}}
let count=0;
// Addition / subtraction correct and one-wrong-digit checks, including carry/borrow boundaries.
for(let a of [10,99,100,347,999,1000,9999,10000,99999])for(let b of [1,9,10,26,99,286,999,9999]){
 let sum=a+b,m=digitMarks(sum,sum);assert(m.every(x=>x==='ok'),`add correct ${a}+${b}`);let wrong=String(sum);wrong=wrong.slice(0,-1)+((+wrong.at(-1)+1)%10);m=digitMarks(sum,wrong);assert(m.at(-1)==='bad'&&m.slice(0,-1).every(x=>x==='ok'),`add bad digit ${a}+${b}`);count++;
 if(a>=b){let d=a-b;m=digitMarks(d,d);assert(m.every(x=>x==='ok'),`sub correct ${a}-${b}`);wrong=String(d);wrong=wrong.slice(0,-1)+((+wrong.at(-1)+1)%10);m=digitMarks(d,wrong);assert(m.at(-1)==='bad'&&m.slice(0,-1).every(x=>x==='ok'),`sub bad digit ${a}-${b}`);count++}
}
// Multiplication, every supported length, correct all-green and a single wrong digit only yellow.
for(let a of [12,99,154,347,999,1000,9999,10000,99999])for(let b of [2,5,9,10,15,26,99,105,999]){
 let model=mulModel(a,b),input={...model.exp},r=mulMarks(a,b,input);assert(r.all,`mul correct ${a}*${b}`);assert(Object.values(r.status).every(x=>x==='ok'),`mul green ${a}*${b}`);
 let resultIds=Object.keys(model.exp).filter(x=>x.startsWith('f-')).sort((x,y)=>+x.slice(2)-+y.slice(2)),id=resultIds[Math.floor(resultIds.length/2)];input={...model.exp,[id]:String((+model.exp[id]+1)%10)};r=mulMarks(a,b,input);assert(!r.all&&r.status[id]==='bad',`mul wrong target ${a}*${b}`);assert(Object.entries(r.status).filter(([k])=>k!==id).every(([,v])=>v==='ok'),`mul only wrong digit ${a}*${b}`);count++;
}
// Specific screenshot regression.
let ss=mulModel(154,15),good={...ss.exp},bad={...ss.exp};let mids=Object.keys(ss.exp).filter(x=>x.startsWith('f-')).sort((x,y)=>+x.slice(2)-+y.slice(2));assert(mids.map(id=>ss.exp[id]).join('')==='2310','154*15 expected 2310');bad[mids[2]]='2';let rr=mulMarks(154,15,bad);assert(rr.status[mids[2]]==='bad','2320 tens must be bad');assert([mids[0],mids[1],mids[3]].every(id=>rr.status[id]==='ok'),'other 2310 digits green');
// Division quotient/remainder across supported dividend lengths and all one-digit divisors.
for(let digits=2;digits<=5;digits++){let lo=10**(digits-1),hi=10**digits-1;for(let b=2;b<=9;b++)for(let a of [lo,lo+1,Math.floor((lo+hi)/2),hi-1,hi]){let {q,r}=divExpected(a,b);assert(q*b+r===a,`div identity ${a}:${b}`);assert(r>=0&&r<b,`div remainder range ${a}:${b}`);let qm=digitMarks(q,q);assert(qm.every(x=>x==='ok'),`div q green ${a}:${b}`);let wrong=String(q);wrong=wrong.slice(0,-1)+((+wrong.at(-1)+1)%10);qm=digitMarks(q,wrong);assert(qm.at(-1)==='bad',`div q bad ${a}:${b}`);assert(String(r)===String(a%b),`div rest ${a}:${b}`);count++}}
console.log(JSON.stringify({passed:true,cases:count,screenshotRegression:'154*15=2310; 2320 marks only the wrong 2 yellow'}));
