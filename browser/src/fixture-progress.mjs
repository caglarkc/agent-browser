// The soak fixture must keep executing its background JS, not just retain old DOM.
export function checkFixtureProgress(text,label,previousTick) {
  const progressRequired=previousTick!==undefined;
  if(!text.includes('"label":'+JSON.stringify(label))||!text.includes('Row 199')) {
    return {passed:false,tick:null,progressRequired,reason:'WRONG_FIXTURE'};
  }
  const match=text.match(/Tick (\d+)/);
  const tick=match?Number(match[1]):text.includes('Row 0')?0:null;
  if(tick===null)return {passed:false,tick,progressRequired,reason:'TIMER_MISSING'};
  if(progressRequired&&tick<=previousTick)return {passed:false,tick,progressRequired,reason:'TIMER_STALLED'};
  return {passed:true,tick,progressRequired,reason:null};
}
