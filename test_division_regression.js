const assert=(x,m)=>{if(!x)throw Error(m)};
function expectedSteps(a,b){
  const digits=String(a).split('').map(Number); let current=0; const steps=[];
  for(let i=0;i<digits.length;i++){
    current=current*10+digits[i];
    const qd=Math.floor(current/b), product=qd*b, remainder=current-product;
    if(qd>0 || steps.length>0 || i===digits.length-1){
      steps.push({current,product,remainder,brought:i<digits.length-1?digits[i+1]:null});
    }
    current=remainder;
  }
  return steps;
}
function verify(a,b,entered){
 const q=Math.floor(a/b),r=a%b,steps=expectedSteps(a,b);
 const resultMarks=[...String(q)].map((d,i)=>entered.q?.[i]===d?'ok':'bad');
 const restMark=String(entered.r)===String(r)?'ok':'bad';
 const pathMarks=[];
 steps.forEach((s,i)=>{
  const got=entered.steps?.[i]||{};
  pathMarks.push({
    current:String(got.current)===String(s.current)?'ok':'bad',
    product:String(got.product)===String(s.product)?'ok':'bad',
    remainder:String(got.remainder)===String(s.remainder)?'ok':'bad'
  });
 });
 const all=resultMarks.every(x=>x==='ok')&&restMark==='ok'&&pathMarks.every(x=>Object.values(x).every(v=>v==='ok'));
 return{q,r,steps,resultMarks,restMark,pathMarks,all};
}
const cases=[
 {a:538,b:3,q:'179',r:'1',steps:[{current:5,product:3,remainder:2},{current:23,product:21,remainder:2},{current:28,product:27,remainder:1}]},
 {a:36603,b:6,q:'6100',r:'3',steps:[{current:36,product:36,remainder:0},{current:6,product:6,remainder:0},{current:0,product:0,remainder:0},{current:3,product:0,remainder:3}]},
 {a:85,b:4,q:'21',r:'1',steps:[{current:8,product:8,remainder:0},{current:5,product:4,remainder:1}]},
 {a:736,b:5,q:'147',r:'1',steps:[{current:7,product:5,remainder:2},{current:23,product:20,remainder:3},{current:36,product:35,remainder:1}]},
 {a:12346,b:5,q:'2469',r:'1',steps:[{current:12,product:10,remainder:2},{current:23,product:20,remainder:3},{current:34,product:30,remainder:4},{current:46,product:45,remainder:1}]}
];
for(const c of cases){
 const auto=expectedSteps(c.a,c.b).map(({current,product,remainder})=>({current,product,remainder}));assert(JSON.stringify(auto)===JSON.stringify(c.steps),`step generation ${c.a}:${c.b}`);
 let r=verify(c.a,c.b,c);assert(r.all,`correct path must all pass ${c.a}:${c.b}`);assert(r.resultMarks.every(x=>x==='ok')&&r.restMark==='ok'&&r.pathMarks.flatMap(Object.values).every(x=>x==='ok'),`all green ${c.a}:${c.b}`);
 const bad=structuredClone(c);bad.steps[1].product=String(+bad.steps[1].product+1);r=verify(c.a,c.b,bad);assert(!r.all,`bad path fails ${c.a}:${c.b}`);assert(r.pathMarks[1].product==='bad',`wrong intermediate yellow ${c.a}:${c.b}`);assert(r.pathMarks.flatMap((x,i)=>i===1?[x.current,x.remainder]:Object.values(x)).every(x=>x==='ok'),`other path cells green ${c.a}:${c.b}`);assert(r.resultMarks.every(x=>x==='ok')&&r.restMark==='ok',`correct result/rest stay green ${c.a}:${c.b}`);
 const badRest=structuredClone(c);badRest.r=String((+c.r+1)%c.b);r=verify(c.a,c.b,badRest);assert(r.restMark==='bad'&&!r.all,`bad rest yellow ${c.a}:${c.b}`);assert(r.resultMarks.every(x=>x==='ok')&&r.pathMarks.flatMap(Object.values).every(x=>x==='ok'),`path/result remain green on bad rest ${c.a}:${c.b}`);
}
console.log(JSON.stringify({passed:true,regressionCases:cases.length,focus:'538:3=179 Rest 1 all path values green; one wrong intermediate only yellow'}));
