import {spawnSync} from 'node:child_process';
import {access,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const browser=process.env.REMOTION_BROWSER_EXECUTABLE||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const run=(cmd,args)=>{const r=spawnSync(cmd,args,{cwd:root,stdio:'inherit',windowsHide:true});assert.equal(r.status,0,`${cmd} failed`);};
await mkdir(path.join(root,'qa'),{recursive:true});
for(const f of ['public/audio/final_mix.wav','public/audio/no_narration_mix.wav','public/captures/hero-workflow.mp4'])await access(path.join(root,f));
if(!process.argv.includes('--mux-only'))run(process.execPath,[path.join(root,'node_modules/@remotion/cli/remotion-cli.js'),'render','src/index.ts','TunaEyeVisual','qa/visual-master.mp4','--codec=h264','--crf=18','--x264-preset=fast','--concurrency=4',`--browser-executable=${browser}`]);
await access(path.join(root,'qa/visual-master.mp4'));
run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i','qa/visual-master.mp4','-vf','scale=in_color_matrix=bt601:out_color_matrix=bt709:in_range=full:out_range=limited,format=yuv420p','-c:v','libx264','-crf','18','-preset','fast','-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-an','qa/visual-master-compatible.mp4']);
for(const [audio,filename]of[['final_mix.wav','tunaeye-cinematic-product-film.mp4'],['no_narration_mix.wav','tunaeye-cinematic-product-film-no-narration.mp4']]){
  run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i','qa/visual-master-compatible.mp4','-i',`public/audio/${audio}`,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','320k','-ar','48000','-ac','2','-t','120','-movflags','+faststart',filename]);
}
run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i','tunaeye-cinematic-product-film.mp4','-vf','scale=1280:720,fps=30','-c:v','libx264','-crf','24','-preset','fast','-c:a','aac','-b:a','192k','-ar','48000','-ac','2','-movflags','+faststart','tunaeye-preview.mp4']);
console.log('All three 120-second MP4s rendered. Run npm run verify next.');
