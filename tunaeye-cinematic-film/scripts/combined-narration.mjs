import {EdgeTTS} from '@andresaya/edge-tts';
import {mkdir,writeFile,readFile,access} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const directory=path.join(root,'public/combined/audio');await mkdir(directory,{recursive:true});
const scenes=[
  {start:0,end:8,delay:.6,text:'Every tuna tells a story. Tuna Eye helps you see beyond the cut.'},
  {start:8,end:16,delay:8.15,text:'Built around the expert eye. Review sashibo core and tail cut, with human judgment at the center.'},
  {start:16,end:23,delay:16.3,text:'Meet Tuna Eye. AI-assisted grading, in one guided kiosk workflow.'},
  {start:23,end:32,delay:23.2,text:'Computer vision examines visual color and clarity, supporting the grader with A, B, C, or Invalid classifications.'},
  {start:32,end:42,delay:32.3,text:'Choose your samples, and keep every fish connected to its own results.'},
  {start:42,end:52,delay:42.25,text:'Follow the placement guide. Enter the weight. Capture the image, and review it before analysis.'},
  {start:52,end:62,delay:52.3,text:'Move from sashibo core to tail cut in one clear workflow.'},
  {start:62,end:73,delay:62.2,text:"Review each sample's grade and confidence. Clear results, ready for expert interpretation."},
  {start:73,end:85,delay:73.25,text:'The expert stays in control. Use a protected manual override, add your reason, and preserve the original prediction.'},
  {start:85,end:93,delay:85.2,text:"Print individual receipts, with each sample's result clearly documented."},
  {start:93,end:100,delay:93.2,text:'Every record stays saved locally, with its captured image and review history.'},
  {start:100,end:114,delay:100.25,text:"On the admin side, review records and sync when you're ready. No internet? Work stays safe locally. Reconnect, choose Sync now, and confirm verified records and images."},
  {start:114,end:120,delay:114.15,text:'Tuna Eye. Sea beyond the cut. Guided grading. Expert control. Connected records.'},
];
assert(scenes.every((s,i)=>!i||s.start===scenes[i-1].end));assert.equal(scenes.at(-1).end,120);
const run=(command,args)=>{const r=spawnSync(command,args,{encoding:'utf8',maxBuffer:5e6});assert.equal(r.status,0,r.stderr||r.error?.message);return r.stdout;};
for(const [index,scene] of scenes.entries()){
  scene.file=path.join(directory,`voice-${String(index+1).padStart(2,'0')}.mp3`);
  const metadataFile=scene.file.replace('.mp3','-words.json');
  try{await access(scene.file);await access(metadataFile);}catch{
    const tts=new EdgeTTS();const timeout=setTimeout(()=>{console.error('Neural voice request timed out');process.exit(1);},45000);
    await tts.synthesize(scene.text,'en-US-GuyNeural',{rate:'+8%',pitch:'+0Hz',volume:'+0%'});
    clearTimeout(timeout);const bytes=tts.toBuffer();assert(bytes.length>1000);
    await writeFile(scene.file,bytes);await writeFile(metadataFile,JSON.stringify(tts.getWordBoundaries(),null,2));
  }
  scene.duration=Number(run('ffprobe',['-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',scene.file]).trim());
  scene.tempo=Math.max(1,scene.duration/(scene.end-scene.delay-.22));
  assert(scene.tempo<1.16,`Voice cue ${index+1} exceeds comfortable pace: ${scene.duration}s`);
  scene.words=JSON.parse(await readFile(metadataFile,'utf8')).map(w=>({text:w.text,seconds:scene.delay+w.offset/1e7/scene.tempo,frame:Math.round((scene.delay+w.offset/1e7/scene.tempo)*60),duration:w.duration/1e7/scene.tempo}));
  console.log(`Voice cue ${index+1}: ${scene.duration.toFixed(3)}s; tempo ${scene.tempo.toFixed(3)}; starts ${scene.delay}s`);
}
const filters=scenes.map((s,i)=>`[${i}:a]atempo=${s.tempo},highpass=f=70,loudnorm=I=-17:TP=-3:LRA=7,aresample=48000,aformat=channel_layouts=stereo,asetpts=N/SR/TB,adelay=${Math.round(s.delay*1000)}|${Math.round(s.delay*1000)}[v${i}]`);
filters.push(`${scenes.map((_,i)=>`[v${i}]`).join('')}amix=inputs=${scenes.length}:normalize=0,aresample=48000,apad=whole_len=5760000,atrim=end=120[out]`);
run('ffmpeg',['-hide_banner','-loglevel','error','-y',...scenes.flatMap(s=>['-i',s.file]),'-filter_complex',filters.join(';'),'-map','[out]','-ar','48000','-ac','2','-c:a','pcm_s24le',path.join(directory,'narration.wav')]);
assert.equal(Number(run('ffprobe',['-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',path.join(directory,'narration.wav')]).trim()),120);
await writeFile(path.join(root,'combined-narration.wav'),await readFile(path.join(directory,'narration.wav')));
await writeFile(path.join(directory,'narration-manifest.json'),JSON.stringify({voice:'en-US-GuyNeural',rate:'+8%',pitch:'+0Hz',service:'Microsoft Edge online neural TTS',pronunciationAdaptations:['TunaEye => Tuna Eye'],scenes:scenes.map(s=>({...s,file:path.basename(s.file)}))},null,2));
console.log(JSON.stringify({classificationWordOnsets:scenes[3].words.filter(w=>['A','B','C','Invalid'].includes(w.text))}));
await writeFile(path.join(root,'public/combined/grade-cues.json'),JSON.stringify(Object.fromEntries(scenes[3].words.filter(w=>['A','B','C','Invalid'].includes(w.text)).map(w=>[w.text,w.frame/60])),null,2));
