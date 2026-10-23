/* Scientific calculations mirrored from the supplied Wolfram V1 model.
   These are schematics, not calibrated instrument response curves. */
(function(root,factory){const api=factory(); if(typeof module==='object'&&module.exports)module.exports=api; root.GasModel=api;})(typeof window!=='undefined'?window:globalThis,function(){
  const E=1.602176634e-19, W=34, BASE_ENERGY=10000;
  function collection(v){return 1-Math.exp(-v/90)}
  function gain(v){return Math.exp(.011*Math.max(0,Math.min(v-280,420)))}
  function ionCharge(v,Edep=BASE_ENERGY){return E*(Edep/W)*collection(v)}
  function propCharge(v,Edep=BASE_ENERGY){return E*(Edep/W)*collection(v)*gain(v)}
  function gm(v){return 1/(1+Math.exp(-(v-850)/25))}
  function nonParalyzable(rate,tauUs){return rate/(1+rate*tauUs*1e-6)}
  function paralyzable(rate,tauUs){return rate*Math.exp(-rate*tauUs*1e-6)}
  function calc(v,Edep,rate,tauUs){return {ion:ionCharge(v,Edep),prop:propCharge(v,Edep),gm:gm(v),n0:Edep/W,NP:nonParalyzable(rate,tauUs),P:paralyzable(rate,tauUs)}}
  return {E,W,BASE_ENERGY,collection,gain,ionCharge,propCharge,gm,nonParalyzable,paralyzable,calc};
});
