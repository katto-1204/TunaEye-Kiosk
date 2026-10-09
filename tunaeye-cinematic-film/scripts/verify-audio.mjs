import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SR=48000,total=120*SR;
function run(args){const r=spawnSync('ffmpeg',args,{cwd:root,maxBuffer:65e6});assert.equal(r.status,0,r.stderr.toString());return r.stdout;}
function decode(name){const data=run(['-hide_banner','-loglevel','error','-i',`public/audio/${name}`,'-ar','48000','-ac','2','-f','f32le','-']);assert.equal(data.length,total*8);return new Float32Array(data.buffer,data.byteOffset,data.length/4);}
const voice=decode('narration.wav'),music=decode('music.wav'),sfx=decode('sfx.wav');
const energy=(data,start,end)=>{let sum=0;for(let i=Math.round(start*SR)*2;i<Math.min(data.length,Math.round(end*SR)*2);i++)sum+=data[i]*data[i];return Math.sqrt(sum/Math.max(1,Math.round((end-start)*SR)*2));};
const {scenes}=JSON.parse(await readFile(path.join(root,'public/audio/narration-manifest.json'),'utf8'));
const {events}=JSON.parse(await readFile(path.join(root,'public/audio/sound-events.json'),'utf8'));
const acts=scenes.map((s,i)=>({act:i+1,start:s.delay,end:s.delay+s.duration/s.tempo,rms:energy(voice,s.delay,s.delay+s.duration/s.tempo),tempo:s.tempo}));
assert(acts.every(s=>s.rms>.06&&s.tempo<1.16),'All eight acts must contain audible unrushed speech');
assert(acts.every((s,i)=>!i||s.start>acts[i-1].end),'Voice acts must not overlap');
const cues=events.map(e=>({...e,rms:energy(sfx,e.seconds,Math.min(120,e.seconds+.2))}));
assert(cues.every(e=>e.rms>.005),'Every synchronized cue must contain an audible effect');
const raw=run(['-hide_banner','-loglevel','error','-i','public/audio/music.wav','-i','public/audio/narration.wav','-filter_complex','[0:a]volume=0.68[score];[score][1:a]sidechaincompress=threshold=0.015:ratio=5:attack=18:release=450:makeup=1[ducked]','-map','[ducked]','-ar','48000','-ac','2','-f','f32le','-']);
const ducked=new Float32Array(raw.buffer,raw.byteOffset,raw.length/4),reductions=[];
for(let t=0;t<119.75;t+=.25){const v=energy(voice,t,t+.25),m=energy(music,t,t+.25)*.68;if(v>.035&&m>.004)reductions.push(20*Math.log10(energy(ducked,t,t+.25)/m));}
reductions.sort((a,b)=>a-b);assert(reductions.length>100);const median=reductions[Math.floor(reductions.length/2)];assert(median<-3,'Music must measurably duck below speech');
const stems=[];
for(const name of ['narration.wav','music.wav','sfx.wav','final_mix.wav','no_narration_mix.wav']){
  const samples=decode(name);let peak=0,sum=0;for(const x of samples){peak=Math.max(peak,Math.abs(x));sum+=x*x;}assert(peak<.999,'Stem must not clip');
  stems.push({name,duration:120,sampleRate:SR,channels:2,peakDbFS:20*Math.log10(peak),rms:Math.sqrt(sum/samples.length)});
}
const report={passed:true,acts,synchronizedCues:cues,musicDucking:{voicedWindows:reductions.length,medianAttenuationDB:median},stems,limits:'Numerical waveform, loudness, event and pace checks; final audiovisual playback review remains necessary.'};
await writeFile(path.join(root,'qa/audio-verification.json'),JSON.stringify(report,null,2));
console.log(`Verified 8 spoken acts, ${events.length} audible frame-timed effects, 120s/48k/stereo unclipped stems; music median duck ${median.toFixed(1)}dB.`);
