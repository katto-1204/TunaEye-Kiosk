import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'public/combined');
await mkdir(path.join(out,'clips'),{recursive:true});
const tailRetake=JSON.parse(await readFile(path.join(out,'tail-camera-events.json'),'utf8'));
assert(tailRetake.runs.every(run=>run.status==='passed'));
assert.equal(tailRetake.durationSeconds,2.5);
const sources={};
for(const [name,directory] of [['film',root],['demo',path.resolve(root,'../tunaeye-product-demo')]]){
  const manifest=JSON.parse(await readFile(path.join(directory,'public/captures/manifest.json'),'utf8'));
  const run=manifest.runs.find(r=>r.viewport.width===1280);
  assert.equal(run.status,'passed');
  sources[name]={run,video:path.join(directory,'public/captures/raw-workflow.webm'),videoOffsetSeconds:name==='film'?.52:.51};
}
const event=(source,label)=>{const item=sources[source].run.events.find(e=>e.label===label);assert(item,`${source}: ${label}`);return item.rawMs/1000;};
const shot=(source,name)=>{const item=sources[source].run.screenshots.find(e=>e.name===name);assert(item,name);return item.rawMs/1000;};
const chapters=[
  ['workflow','film','welcome',event('film','Get started')-.7,1],
  ['workflow','demo','role',event('demo','Expert Grader')-.5,1.5],
  ['workflow','demo','name',event('demo','Eli')-.9,1.5],
  ['workflow','film','samples',event('film','Select Tail cut')-.7,3],
  ['workflow','film','association',event('film','Same fish')-.5,2],
  ['workflow','demo','tutorial-first',shot('demo','06-placement-guide'),2],
  ['workflow','demo','tutorial-next',event('demo','Tutorial Next 1')-.2,2],
  ['workflow','demo','weight',event('demo','Weight 3')-.2,4],
  ['workflow','film','capture',event('film','Capture sashibo core')-1.7,3],
  ['workflow','film','review',event('film','Sashibo Use Image')-3.6,3],
  ['workflow','film','analysis',event('film','Sashibo Use Image')-.3,2.5],
  ['workflow','film','tail-capture',event('film','Capture tail cut')-1.7,2.5],
  ['workflow','film','tail-review',event('film','Tail Use Image')-.8,2],
  ['results','film','core-result',shot('film','11-sashibo-result')-.2,5.5],
  ['results','film','tail-result',shot('film','15-tail-result')-.2,5.5],
  ['override','demo','expert-control',event('demo','Manual override')-.2,12],
  ['receipts','demo','individual-receipts',event('demo','Print separate copies')-.2,8],
  ['records','film','local-records',event('film','Dashboard')-.2,7],
];
const expected={workflow:30,results:11,override:12,receipts:8,records:7};
const starts={workflow:32,results:62,override:73,receipts:85,records:93};
const groups={};
const ffmpeg=args=>{const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{encoding:'utf8',windowsHide:true});assert.equal(r.status,0,r.stderr||r.error?.message);};
for(const [group,source,name,start,duration] of chapters){
  assert(start>=0);const file=`clips/${group}-${name}.mp4`;
  const image=name==='welcome'?'01-welcome':name==='role'?'02-role':name==='tutorial-first'?'06-placement-guide':null;
  const boundary=name==='core-result'?event(source,'Next sample')-.15:name==='tail-result'?event(source,'Manual override')-.15:name==='tutorial-next'?event(source,'Enter weight')-.2:name==='weight'?event(source,'Start capture')-.12:name==='tail-review'?event(source,'Tail Use Image')-.05:group==='override'?event(source,'Print separate copies')-.3:start+duration;
  const sourceDuration=Math.min(duration,boundary-start);assert(sourceDuration>0);
  const input=image?['-loop','1','-i',path.resolve(sources[source].video,'../1280x800',`${image}.png`)]:['-ss',String(start-sources[source].videoOffsetSeconds),'-t',String(sourceDuration),'-i',sources[source].video];
  if(name==='tail-capture')await writeFile(path.join(out,file),await readFile(path.join(out,'tail-camera.mp4')));
  else ffmpeg([...input,'-an','-vf','setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=12,fps=60,setsar=1','-frames:v',String(duration*60),'-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',path.join(out,file)]);
  const clips=groups[group]??=[];const offset=clips.reduce((sum,c)=>sum+c.durationSeconds,0);
  const events=name==='tail-capture'?[{...tailRetake.event,type:'tap',seconds:Math.round((offset+tailRetake.event.clipSeconds)*60)/60,filmSeconds:Math.round((starts[group]+offset+tailRetake.event.clipSeconds)*60)/60}]:image?[]:sources[source].run.events.filter(e=>e.rawMs/1000>=start&&e.rawMs/1000<start+sourceDuration).map(e=>({...e,seconds:Math.round((offset+e.rawMs/1000-start)*60)/60,filmSeconds:Math.round((starts[group]+offset+e.rawMs/1000-start)*60)/60}));
  clips.push({name,source:name==='tail-capture'?'Fresh correct Tail camera fixture capture':source==='demo'?'Previous 90-second product demo recording':'Accepted cinematic film recording',file:`combined/${file}`,sourceStartSeconds:name==='tail-capture'?0:start-sources[source].videoOffsetSeconds,observedVideoClockOffsetSeconds:name==='tail-capture'?0:sources[source].videoOffsetSeconds,durationSeconds:duration,montageStartSeconds:offset,events});
}
for(const [group,clips] of Object.entries(groups)){
  const duration=clips.reduce((sum,c)=>sum+c.durationSeconds,0);assert.equal(duration,expected[group]);
  const list=path.join(out,`clips/${group}.txt`);await writeFile(list,clips.map(c=>`file '${path.basename(c.file)}'`).join('\n'));
  ffmpeg(['-f','concat','-safe','0','-i',list,'-c','copy','-movflags','+faststart',path.join(out,`${group}.mp4`)]);
  const frames=Number(spawnSync('ffprobe',['-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=nb_read_frames','-of','default=nw=1:nk=1',path.join(out,`${group}.mp4`)],{encoding:'utf8'}).stdout.trim());assert.equal(frames,duration*60);
}
await writeFile(path.join(out,'feature-clips.json'),JSON.stringify({fps:60,source:'Re-edited authentic footage from both accepted projects; camera/inference fixtures remain labeled',groups},null,2));
console.log('Combined footage prepared:30s workflow,11s results,12s override,8s receipts,7s records. Exact frames verified.');
