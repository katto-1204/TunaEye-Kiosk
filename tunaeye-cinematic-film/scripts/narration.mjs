import {EdgeTTS} from '@andresaya/edge-tts';
import {mkdir, writeFile, copyFile, access} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = path.join(root, 'public/audio');
await mkdir(directory, {recursive:true});
const scenes = [
  {start:0,end:15,delay:3.2,text:'Every tuna tells a story. A story of quality, freshness, and value.'},
  {start:15,end:30,delay:15.4,text:'But determining that quality requires experience, precision, and a trained eye. Expert graders examine critical visual indicators, including sashibo core and tail-cut.'},
  {start:30,end:43,delay:30.6,text:'Their expertise matters. But what if technology could help make grading more consistent, efficient, and accessible?'},
  {start:43,end:55,delay:44.1,text:'Introducing Tuna Eye. A computer vision-powered tuna quality grading system designed to support expert judgment.'},
  {start:55,end:72,delay:55.6,text:'Powered by MobileNet V three, Tuna Eye analyzes sashibo-core and tail-cut images, examining visual characteristics such as color and clarity.'},
  {start:72,end:95,delay:72.7,text:'With a guided kiosk interface, users select samples, record weight, capture images, and review each step before analysis.'},
  {start:95,end:108,delay:95.4,text:'Grade A. Grade B. Grade C. Or Invalid when the image cannot be reliably classified. Each result includes confidence to support interpretation.'},
  {start:108,end:120,delay:108.1,text:"Because Tuna Eye doesn't replace expert judgment. It supports review, documents results, and extends expert-informed grading into a streamlined digital workflow."},
];
assert.equal(scenes.at(-1).end,120);
assert(scenes.every((s,i)=>!i||s.start===scenes[i-1].end));
const run=(command,args)=>{
  const r=spawnSync(command,args,{encoding:'utf8',maxBuffer:5e6});
  assert.equal(r.status,0,r.stderr||r.error?.message);return r.stdout;
};
for(const [index,scene] of scenes.entries()){
  scene.file=path.join(directory,`voice-${String(index+1).padStart(2,'0')}.mp3`);
  try{await access(scene.file);}catch{
    const tts=new EdgeTTS();
    const timeout=setTimeout(()=>{console.error('Neural voice request timed out');process.exit(1);},45000);
    await tts.synthesize(scene.text,'en-US-GuyNeural',{rate:'-2%',pitch:'-2Hz',volume:'+0%'});
    clearTimeout(timeout);const bytes=tts.toBuffer();assert(bytes.length>1000);await writeFile(scene.file,bytes);
  }
  scene.duration=Number(run('ffprobe',['-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',scene.file]).trim());
  scene.tempo=Math.max(1,scene.duration/(scene.end-scene.delay-0.3));
  assert(scene.tempo<1.16,`Act ${index+1} voice exceeds comfortable pace: ${scene.duration}s; reschedule instead`);
  console.log(`Act ${index+1}: ${scene.duration.toFixed(2)}s, tempo ${scene.tempo.toFixed(3)}, starts ${scene.delay}s`);
}
const filters=scenes.map((s,i)=>`[${i}:a]atempo=${s.tempo},highpass=f=70,loudnorm=I=-17:TP=-3:LRA=7,aresample=48000,aformat=channel_layouts=stereo,asetpts=N/SR/TB,adelay=${Math.round(s.delay*1000)}|${Math.round(s.delay*1000)}[v${i}]`);
filters.push(`${scenes.map((_,i)=>`[v${i}]`).join('')}amix=inputs=8:normalize=0,aresample=48000,apad=whole_len=5760000,atrim=end_sample=5760000[out]`);
run('ffmpeg',['-hide_banner','-loglevel','error','-y',...scenes.flatMap(s=>['-i',s.file]),'-filter_complex',filters.join(';'),'-map','[out]','-ar','48000','-ac','2','-c:a','pcm_s24le',path.join(directory,'narration.wav')]);
assert.equal(Number(run('ffprobe',['-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',path.join(directory,'narration.wav')]).trim()),120);
await copyFile(path.join(directory,'narration.wav'),path.join(root,'narration.wav'));
await writeFile(path.join(directory,'narration-manifest.json'),JSON.stringify({voice:'en-US-GuyNeural',service:'Microsoft Edge online neural TTS',pronunciationAdaptations:['TunaEye => Tuna Eye','MobileNetV3 => MobileNet V three'],scenes:scenes.map(s=>({...s,file:path.basename(s.file)}))},null,2));
