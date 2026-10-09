import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Original D-minor cinematic score, with a D-major brand resolution.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'public/combined/audio');await mkdir(out,{recursive:true});
const SR=48000,SECONDS=120,N=SR*SECONDS,BPM=136,beat=60/BPM;
const music=new Float32Array(N*2),sfx=new Float32Array(N*2);
const sfxOnly=process.argv.includes('--sfx-only');
const TAU=Math.PI*2,frequency=n=>440*2**((n-69)/12);
let seed=231136;const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
const ease=x=>Math.max(0,Math.min(1,x));
function sound(target,start,duration,note,level,kind,pan=0){
  const first=Math.round(start*SR),length=Math.round(duration*SR),f=frequency(note);
  const left=Math.cos((pan+1)*Math.PI/4),right=Math.sin((pan+1)*Math.PI/4);
  let filtered=0,lastNoise=0;
  for(let j=0;j<length&&first+j<N;j++){
    if(first+j<0)continue;
    const t=j/SR,p=TAU*f*t,release=ease((duration-t)/Math.min(.25,duration*.3));
    let sample=0,env=1;
    switch(kind){
      case 'pad':
        sample=(Math.sin(p*.997)+Math.sin(p*1.003)+.32*Math.sin(p*2.002)+.10*Math.sin(p*3.007))/2.42;
        env=ease(t/.75)*ease((duration-t)/1.1)*(.82+.18*Math.sin(t*TAU*.13));break;
      case 'bass':
        sample=Math.tanh(1.7*(Math.sin(p)+.30*Math.sin(p*2)+.12*Math.sin(p*3)))/1.1;
        env=ease(t/.018)*Math.exp(-t*1.6)*release;break;
      case 'pluck':
        sample=(Math.sin(p)+.47*Math.sin(p*2.003)+.18*Math.sin(p*3.998)+.07*Math.sin(p*6.011))/1.72;
        env=ease(t/.006)*Math.exp(-t*6)*release;break;
      case 'piano':
        sample=(Math.sin(p)+.5*Math.sin(p*2.001)+.22*Math.sin(p*3.003)+.09*Math.sin(p*5.009))/1.81;
        env=ease(t/.005)*Math.exp(-t*2.1)*release;break;
      case 'kick':
        sample=Math.sin(TAU*(43*t+91*.029*(1-Math.exp(-t/.029))))+.13*noise()*Math.exp(-t*100);
        env=ease(t/.001)*Math.exp(-t*11)*release;break;
      case 'snare':
        filtered=.64*filtered+.36*noise();sample=.72*(noise()-filtered)+.28*Math.sin(TAU*185*t);
        env=ease(t/.001)*Math.exp(-t*20)*release;break;
      case 'hat':
        sample=(noise()-lastNoise)*.40+.13*Math.sin(p)*Math.sin(p*1.613);lastNoise=noise();
        env=ease(t/.0006)*Math.exp(-t*66)*release;break;
      case 'impact':
        sample=Math.sin(TAU*(37*t+68*.052*(1-Math.exp(-t/.052))))+.35*noise()*Math.exp(-t*9);
        env=ease(t/.002)*Math.exp(-t*3.5)*release;break;
      case 'click':
        sample=.55*noise()+.45*Math.sin(p)*Math.sin(p*1.783);env=ease(t/.001)*Math.exp(-t*65)*release;break;
      case 'shutter':
        sample=(noise()+Math.sin(TAU*1220*t)*.4)*(.7+.3*Math.sin(TAU*45*t));
        env=(Math.exp(-t*45)+.65*Math.exp(-Math.abs(t-.09)*80))*release;break;
      case 'paper':
        filtered=.72*filtered+.28*noise();sample=(noise()-filtered)*(.48+.52*Math.sin(t*TAU*38)**2);
        env=ease(t/.06)*release;break;
      case 'sweep':{
        filtered=.91*filtered+.09*noise();sample=(noise()*.2+filtered*.8)+.12*Math.sin(TAU*(120*t+940*t*t/duration));
        env=Math.sin(Math.PI*t/duration)**2;break;}
      case 'riser':{
        filtered=.84*filtered+.16*noise();sample=.6*filtered+.2*Math.sin(TAU*(70*t+900*t*t/duration))+.2*Math.sin(TAU*(105*t+1250*t*t/duration));
        env=(t/duration)**1.5*release;break;}
      default:throw new Error(`Unknown synth ${kind}`);
    }
    sample*=env*level;const i=(first+j)*2;target[i]+=sample*left;target[i+1]+=sample*right;
  }
}

const chords=[[50,57,65,69],[46,53,62,65],[41,48,57,60],[48,55,64,67]];
const phases=[
  {start:0,end:8,pad:.060,bass:.035,arp:.010,drums:.14},
  {start:8,end:16,pad:.059,bass:.048,arp:.020,drums:.35},
  {start:16,end:23,pad:.072,bass:.085,arp:.037,drums:.85},
  {start:23,end:32,pad:.062,bass:.078,arp:.038,drums:.86},
  {start:32,end:62,pad:.065,bass:.088,arp:.041,drums:1.0},
  {start:62,end:73,pad:.076,bass:.085,arp:.037,drums:.98},
  {start:73,end:93,pad:.067,bass:.081,arp:.037,drums:.94},
  {start:93,end:114,pad:.073,bass:.087,arp:.039,drums:1.0},
  {start:114,end:120,pad:.088,bass:.051,arp:.019,drums:.52},
];
if(!sfxOnly){
for(const phase of phases){
  for(let bar=0,start=phase.start;start<phase.end;bar++,start=phase.start+bar*8*beat){
    const chord=phase.start===114?[50,57,66,69]:chords[(bar+Math.floor(phase.start/8))%chords.length];
    const duration=Math.min(8*beat+.8,phase.end-start+.55);
    for(const [k,note] of chord.entries())sound(music,start,duration,note+12,phase.pad,'pad',-.65+k*.43);
    sound(music,start,duration,chord[0]-12,phase.pad*.62,'pad',0);
    if(phase.start<23||phase.start>=93){
      const melody=[chord[2]+12,chord[1]+24,chord[3]+12,chord[2]+12];
      for(let k=0;k<4;k++)if(start+k*2*beat<phase.end)sound(music,start+k*2*beat,1.75,melody[k],phase.start>=114?.044:.023,'piano',Math.sin(k*1.7)*.48);
    }
    for(let k=0;k<16;k++){
      const time=start+k*beat/2;if(time>=phase.end)break;
      if(phase.arp){
        const pattern=[0,2,1,3,0,1,2,3,2,1,0,2,3,2,1,3];
        sound(music,time,.48,chord[pattern[k]]+24,phase.arp*(k%2?.64:1),'pluck',Math.sin(k*.8)*.65);
      }
      if(k%2===0){
        sound(music,time,.48,chord[0]-12,phase.bass,'bass',0);
        if(phase.drums)sound(music,time,.42,38,.21*phase.drums,'kick');
      }
      if(phase.drums){
        sound(music,time+.005,.085,105,.040*phase.drums*(k%2?1:.62),'hat',k%2?.32:-.28);
        if(k%4===2)sound(music,time,.27,54,.070*phase.drums,'snare',-.08);
        if(k%8===7)sound(music,time+beat/4,.070,108,.028*phase.drums,'hat',-.35);
      }
    }
  }
}
// Pressure and slow water movement establish the opening without a literal field recording.
for(let t=0;t<16;t+=5){sound(music,t,5.8,26,.021,'pad',-.2);sound(music,t,5.8,38,.012,'pad',.3);}
sound(music,14.2,1.8,30,.16,'riser');sound(music,16,2.1,30,.25,'impact');
for(const t of [32,62,73,85,93,100,114]){sound(music,t-1.15,1.15,50,.095,'riser');sound(music,t,1.0,30,.15,'impact');}
// A restrained melodic identity returns in the warm resolution.
for(const [t,note] of [[114.1,74],[115.4,78],[116.7,81],[118,86]])sound(music,t,1.9,note,.052,'piano',-.1);
for(const n of [50,57,66,74])sound(music,117.2,2.8,n,.073,'pad',n%2?.3:-.3);
}
seed=991136;

const events=[
  [.6,'opening-beam','sweep'],[2.2,'every-tuna-headline','impact'],[5.5,'beyond-the-cut','sweep'],
  [8,'expert-eye','sweep'],[10,'sashibo-panel','scan'],[12,'tail-panel','scan'],
  [15.3,'reveal-riser','riser'],[16,'product-reveal','reveal'],[17.3,'logo-settle','logo'],[20,'guided-workflow','shine'],
  [23,'computer-vision','data'],[25,'visual-characteristics','data'],[32,'guided-kiosk','sweep'],
  [62,'individual-results','confirm'],[73,'expert-control','impact'],[85,'receipt-overview','sweep'],
  [93,'local-records','sweep'],[100,'admin-sync','data'],[114,'brand-finale','logo'],[117.2,'connected-records','shine'],
];
// The narration word metadata and actual captures supply the final synchronization.
let cueFilesReady=true;
for(const name of ['feature-clips.json','admin-clips.json']){
  let montage;try{montage=JSON.parse(await readFile(path.join(root,'public/combined',name),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;cueFilesReady=false;continue;}
  const groups=name==='feature-clips.json'?Object.entries(montage.groups):[['admin',montage.clips]];
  const groupStart={workflow:32,results:62,override:73,receipts:85,records:93,admin:100};
  for(const [group,clips] of groups){
    for(const clip of clips){
      const base=groupStart[group]+clip.montageStartSeconds;
      events.push([base,clip.name,'sweep']);
      for(const event of clip.events??[]){
        const seconds=event.filmSeconds??(base+event.clipSeconds);
        const type=event.type==='typing'?'typing':event.label.includes('Capture')?'shutter':event.label.includes('Use Image')||event.label.includes('Save')||event.label.includes('Sync now')?'confirm':event.label.includes('Print')?'paper':'click';
        events.push([seconds,event.label,type]);
      }
    }
  }
}
const captureCuesReady=cueFilesReady;
const gradeCues=JSON.parse(await readFile(path.join(root,'public/combined/grade-cues.json'),'utf8'));
for(const [grade,seconds] of Object.entries(gradeCues))events.push([seconds,grade==='Invalid'?'invalid':`grade-${grade.toLowerCase()}`,'grade']);
try{await readFile(path.join(out,'narration-manifest.json'),'utf8');}catch(error){if(error.code!=='ENOENT')throw error;cueFilesReady=false;}
const synchronizedEvents=events.map(([seconds,label,type])=>({seconds:Math.round(seconds*60)/60,frame:Math.round(seconds*60),label,type})).sort((a,b)=>a.frame-b.frame);
for(const [index,event] of synchronizedEvents.entries()){
  const t=event.seconds,pan=Math.sin(index*1.6)*.35;
  switch(event.type){
    case 'sweep':sound(sfx,t-.32,.57,50,.24,'sweep',pan);break;
    case 'impact':sound(sfx,t,1.0,30,.28,'impact',0);sound(sfx,t,.6,62,.06,'piano',pan);break;
    case 'reveal':sound(sfx,t,2.5,30,.43,'impact');sound(sfx,t-.12,.6,50,.21,'sweep',pan);break;
    case 'riser':sound(sfx,t-.8,1,50,.20,'riser',pan);break;
    case 'scan':sound(sfx,t,.45,78,.11,'pluck',pan);sound(sfx,t+.12,.28,85,.07,'pluck',-pan);break;
    case 'logo':for(const n of [62,69,74,78])sound(sfx,t,2.2,n,.075,'piano',pan);sound(sfx,t,1.4,30,.20,'impact');break;
    case 'shine':for(const [i,n] of [81,86,90].entries())sound(sfx,t+i*.10,1.2,n,.065,'piano',pan);break;
    case 'data':sound(sfx,t-.16,.4,50,.10,'sweep',pan);for(let k=0;k<5;k++)sound(sfx,t+k*.09,.18,62+k*3,.073,'pluck',Math.sin(k*1.3)*.5);break;
    case 'click':sound(sfx,t,.09,85,.13,'click',pan);sound(sfx,t+.015,.17,74,.037,'pluck',pan);break;
    case 'typing':for(let k=0;k<5;k++)sound(sfx,t+k*.10,.05,84+k,.075,'click',pan);break;
    case 'shutter':sound(sfx,t,.22,85,.30,'shutter',pan);break;
    case 'confirm':sound(sfx,t,.46,78,.10,'piano',-.18);sound(sfx,t+.12,.6,81,.10,'piano',.18);break;
    case 'grade':sound(sfx,t,.8,30,.26,'impact');sound(sfx,t+.015,.44,event.label==='invalid'?66:78,.11,'piano',pan);break;
    case 'paper':sound(sfx,t,1.15,74,.25,'paper',pan);sound(sfx,t-.16,.4,50,.08,'sweep',pan);break;
  }
}
function space(buffer,mix){
  // Different delay lengths create a stereo chamber while retaining a dry center.
  const taps=[[.113,.105],[.241,.085],[.389,.060],[.613,.037]];
  for(let i=buffer.length-2;i>=0;i-=2){
    let l=0,r=0;
    for(const [seconds,gain] of taps){const d=Math.round(seconds*SR)*2;if(i>=d){l+=buffer[i-d+1]*gain;r+=buffer[i-d]*gain;}}
    buffer[i]+=l*mix;buffer[i+1]+=r*mix;
  }
}
if(!sfxOnly)space(music,.95);space(sfx,.75);
async function save(name,buffer,targetPeak){
  let peak=0;for(const x of buffer)peak=Math.max(peak,Math.abs(x));assert(peak>0);
  const gain=targetPeak/peak,pcm=Buffer.allocUnsafe(N*2*3);
  let sum=0;
  for(let i=0;i<N;i++){
    const fade=Math.min(1,i/(SR*.08),(N-i)/(SR*1.0));
    for(let channel=0;channel<2;channel++){
      const v=buffer[i*2+channel]*gain*fade;sum+=v*v;
      const value=Math.round(Math.max(-.999,Math.min(.999,v))*8388607);pcm.writeIntLE(value,(i*2+channel)*3,3);
    }
  }
  const header=Buffer.alloc(44);header.write('RIFF');header.writeUInt32LE(pcm.length+36,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(2,22);header.writeUInt32LE(SR,24);header.writeUInt32LE(SR*6,28);header.writeUInt16LE(6,32);header.writeUInt16LE(24,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);
  const bytes=Buffer.concat([header,pcm]);await writeFile(path.join(out,name),bytes);await writeFile(path.join(root,`combined-${name}`),bytes);
  return {name,duration:SECONDS,sampleRate:SR,channels:2,bits:24,peak:targetPeak,rms:Math.sqrt(sum/(N*2))};
}
const reports=[...(!sfxOnly?[await save('music.wav',music,.48)]:[]),await save('sfx.wav',sfx,.53)];
assert(synchronizedEvents.every(e=>e.frame===Math.round(e.seconds*60)&&e.frame>=0&&e.frame<7200));
if(cueFilesReady)assert(synchronizedEvents.some(e=>e.type==='shutter')&&synchronizedEvents.some(e=>e.label.includes('Use Image')),'Actual capture and confirmation need sound cues');
await writeFile(path.join(out,'sound-events.json'),JSON.stringify({fps:60,bpm:BPM,originalComposition:true,captureCuesReady,cueFilesReady,actBoundaries:[0,8,16,23,32,62,73,85,93,100,114,120],events:synchronizedEvents},null,2));
await writeFile(path.join(root,'qa/combined-audio-synthesis.json'),JSON.stringify({bpm:BPM,seed:231136,composition:'Original 136 BPM D minor / B flat / F / C progression, D major bright finale; evolving detuned pads, mallet motif, syncopated arpeggios, saturated bass, synthesized percussion, deterministic stereo sound design',cueFilesReady,events:synchronizedEvents.length,stems:reports},null,2));
for(const report of reports){
  const r=spawnSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',path.join(out,report.name)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);assert.equal(Number(r.stdout.trim()),120);
}
console.log(JSON.stringify({bpm:BPM,eventCount:synchronizedEvents.length,reports}));
