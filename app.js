'use strict';
const $=id=>document.getElementById(id),M=window.GasModel;
let wolfram=null;
const val=id=>Number($(id).value);
const label=(id,text)=>$(id+'Text').textContent=text;
function modelResponse(v,en,det){if(det==='ion')return M.ionCharge(v,en);if(det==='prop')return M.propCharge(v,en);return M.gm(v)}
function renderPlot(canvas,pts,color='#116e9e',opts={}){
 const c=$(canvas),ctx=c.getContext('2d'),W=c.width,H=c.height, pad={l:52,r:14,t:19,b:36};ctx.clearRect(0,0,W,H);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
 const [xmin,xmax]=opts.xdomain || [pts[0][0],pts[pts.length-1][0]];
 const valid=pts.filter(p=>Number.isFinite(p[1]));const ys=valid.map(p=>p[1]);const ymin=opts.yrange?.[0] ?? Math.min(...ys);const ymax=opts.yrange?.[1] ?? Math.max(...ys);
 const px=x=>pad.l+(x-xmin)/(xmax-xmin)*(W-pad.l-pad.r),py=y=>H-pad.b-(y-ymin)/(ymax-ymin||1)*(H-pad.t-pad.b);
 ctx.lineWidth=1;ctx.strokeStyle='#dce5ee';ctx.fillStyle='#47647d';ctx.font='11px system-ui';for(let i=0;i<=4;i++){let y=(ymax-ymin)*i/4+ymin;let yy=py(y);ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(W-pad.r,yy);ctx.stroke();ctx.fillText(Number(y).toPrecision(3),3,yy+3)}
 ctx.fillText(String(xmin),pad.l,H-12);ctx.fillText(String(xmax),W-pad.r-35,H-12);
 const curves=[{p:pts,c:color,dash:[]}].concat((opts.other||[]));for(const curve of curves){ctx.strokeStyle=curve.c;ctx.lineWidth=2.1;ctx.setLineDash(curve.dash||[]);ctx.beginPath();curve.p.forEach(([x,y],i)=>i?ctx.lineTo(px(x),py(y)):ctx.moveTo(px(x),py(y)));ctx.stroke();}ctx.setLineDash([]);
 if(Number.isFinite(opts.marker)){ctx.strokeStyle='#bb5b35';ctx.lineWidth=1.4;const x=px(opts.marker);ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,H-pad.b);ctx.stroke()}
}
function draw(){const v=val('voltage'),en=val('energy'),r=val('rate'),tau=val('tau'),det=$('detector').value;
 label('voltage',v+' V');label('energy',en+' eV');label('rate',r+' cps');label('tau',tau+' μs');
 const calc=M.calc(v,en,r,tau);$('npairs').textContent=calc.n0.toFixed(2);$('response').textContent=det==='gm'?calc.gm.toFixed(4)+' normalized':(det==='ion'?calc.ion:calc.prop).toExponential(3)+' C';
 $('np').textContent=calc.NP.toFixed(2);$('pp').textContent=calc.P.toFixed(2);
 let pts=Array.from({length:241},(_,i)=>{let vv=i*5;return [vv,modelResponse(vv,en,det)]});let normalized=det==='gm';
 let valuePlot=normalized?pts:pts.map(([x,y])=>[x,Math.log10(Math.max(y,1e-25))]);
 renderPlot('voltagePlot',valuePlot,'#147b9c',{marker:v});$('ylabel').textContent=normalized?'Y axis: normalized pulse amplitude, not energy':'Y axis: log₁₀(expected charge in C), not measured';
 const np=Array.from({length:201},(_,i)=>[i*50,M.nonParalyzable(i*50,tau)]), p=Array.from({length:201},(_,i)=>[i*50,M.paralyzable(i*50,tau)]);
 const ymax=Math.max(...np.map(x=>x[1]),...p.map(x=>x[1]))*1.05;
 renderPlot('deadPlot',np,'#1970a7',{other:[{p,c:'#de7142',dash:[7,4]}],yrange:[0,ymax],marker:r});
 $('verdict').textContent='At the selected inputs, non-paralyzable loss = '+(r?((1-calc.NP/r)*100).toFixed(2):'0')+'%. Model outputs are teaching examples only.';
}
function downloadCsv(){const det=$('detector').value,en=val('energy');const lines=['voltage_V,detector,energy_eV,simulated_response,unit,calibration_status'];for(let v=0;v<=1200;v+=5)lines.push([v,det,en,modelResponse(v,en,det),det==='gm'?'normalized':'C','illustrative_only'].join(','));const blob=new Blob([lines.join('\n')+'\n'],{type:'text/csv'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='gas_detector_simulation_'+det+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2500)}
function verifyData(d){if(!d||!Array.isArray(d.voltage)||!Array.isArray(d.deadtime))return {ok:false,msg:'Missing arrays'};let max=0;for(const z of d.deadtime){let a=M.nonParalyzable(z.true_rate_cps,150),b=M.paralyzable(z.true_rate_cps,150);max=Math.max(max,Math.abs(a-z.nonparalyzable_observed_cps),Math.abs(b-z.paralyzable_observed_cps))}for(const z of d.voltage){let v=z.voltage_V;max=Math.max(max,Math.abs(M.ionCharge(v,10000)-z.ionization_charge_C),Math.abs(M.propCharge(v,10000)-z.proportional_charge_C),Math.abs(M.gm(v)-z.GM_normalized_amplitude))}return {ok:max<1e-9,max,msg:'All '+d.deadtime.length+' dead-time and '+d.voltage.length+' voltage rows tested against analytic formulas'}}
for(const id of ['voltage','energy','rate','tau','detector'])$(id).addEventListener('input',draw);
$('export').addEventListener('click',downloadCsv);
$('reset').addEventListener('click',()=>{Object.entries({voltage:200,energy:10000,rate:1000,tau:150,detector:'ion'}).forEach(([k,v])=>$(k).value=v);draw()});
document.querySelectorAll('[data-answer]').forEach(b=>b.addEventListener('click',()=>{const a=$('answer-'+b.dataset.answer);a.hidden=!a.hidden;b.textContent=a.hidden?'Reveal educational explanation':'Hide explanation'}));
fetch('./wolfram_data.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(d=>{wolfram=d;const q=verifyData(d);$('status').innerHTML='<strong>Computational source data:</strong> '+(q.ok?'Verified':'CHECK REQUIRED')+' — '+q.msg+'; maximum absolute deviation '+q.max.toExponential(3)+' in the respective native units.';}).catch(e=>{$('status').textContent='Cannot open local dataset ('+e.message+'). Run via a local HTTP server or GitHub Pages; chart equations work without the file.'});
draw();
