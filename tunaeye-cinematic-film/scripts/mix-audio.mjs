import {spawnSync} from 'node:child_process';
import {writeFile,readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await mkdir(path.join(root,'qa'),{recursive:true});
const run=(command,args)=>{
  const r=spawnSync(command,args,{cwd:root,encoding:'utf8',maxBuffer:15e6});
  assert.equal(r.status,0,r.stderr||r.error?.message);return r;
};
const input=['-i','public/audio/narration.wav','-i','public/audio/music.wav','-i','public/audio/sfx.wav'];
const parse=text=>{const result=text.match(/\{\s*"input_i"[\s\S]*?\}/);assert(result,'Loudness JSON missing');return JSON.parse(result[0]);};
const voiceMix='[0:a]asplit=2[voice][key];[1:a]volume=0.68[score];[score][key]sidechaincompress=threshold=0.015:ratio=5:attack=18:release=450:makeup=1[ducked];[2:a]volume=0.64[effects];[voice][ducked][effects]amix=inputs=3:normalize=0,atrim=end=120,asetpts=N/SR/TB';
const instrumentalMix='[1:a]volume=0.68[score];[2:a]volume=0.64[effects];[score][effects]amix=inputs=2:normalize=0,atrim=end=120,asetpts=N/SR/TB';
const report={duration:120,sampleRate:48000,channels:2,targetLUFS:-14,truePeakCeiling:-1.5,musicDucking:'Automatic 5:1 compressor keyed by voice; 18ms attack and 450ms release',mixes:[]};
for(const [name,mix] of [['final_mix.wav',voiceMix],['no_narration_mix.wav',instrumentalMix]]){
  const first=run('ffmpeg',['-hide_banner','-nostats','-y',...input,'-filter_complex',`${mix},loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json[out]`,'-map','[out]','-t','120','-f','null','-']);
  const measured=parse(first.stderr);assert(Number.isFinite(Number(measured.input_i)));
  const master=`loudnorm=I=-14:TP=-1.5:LRA=9:measured_I=${measured.input_i}:measured_TP=${measured.input_tp}:measured_LRA=${measured.input_lra}:measured_thresh=${measured.input_thresh}:offset=${measured.target_offset}:linear=true:print_format=json`;
  const second=run('ffmpeg',['-hide_banner','-nostats','-y',...input,'-filter_complex',`${mix},${master}[out]`,'-map','[out]','-t','120','-ar','48000','-ac','2','-c:a','pcm_s24le',`qa/mastered-${name}`]);
  // OneDrive can reject native CopyFile on an existing synced WAV.
  const bytes=await readFile(path.join(root,'qa',`mastered-${name}`));
  await writeFile(path.join(root,'public/audio',name),bytes);
  await writeFile(path.join(root,name),bytes);
  const verification=run('ffmpeg',['-hide_banner','-nostats','-i',`public/audio/${name}`,'-af','loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json','-f','null','-']);
  const levels=parse(verification.stderr);
  assert(Math.abs(Number(levels.input_i)+14)<.8,`${name} misses loudness target`);
  assert(Number(levels.input_tp)<-.9,`${name} risks clipping`);
  const metadata=JSON.parse(run('ffprobe',['-v','error','-show_streams','-show_format','-of','json',`public/audio/${name}`]).stdout);
  assert.equal(Number(metadata.format.duration),120);assert.equal(Number(metadata.streams[0].sample_rate),48000);assert.equal(metadata.streams[0].channels,2);
  report.mixes.push({name,firstPass:measured,mastering:parse(second.stderr),verified:{lufs:Number(levels.input_i),truePeak:Number(levels.input_tp),loudnessRange:Number(levels.input_lra),duration:Number(metadata.format.duration),sampleRate:Number(metadata.streams[0].sample_rate),channels:metadata.streams[0].channels}});
  console.log(`${name}: ${levels.input_i} LUFS, ${levels.input_tp} dBTP, 120s stereo 48kHz`);
}
await writeFile(path.join(root,'qa/audio-mastering.json'),JSON.stringify(report,null,2));
