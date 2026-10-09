import {mkdir,readdir,copyFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const files=(await readdir('qa/critical-frames')).filter(x=>x.endsWith('.jpeg')).sort();
assert(files.length>0,'Render critical frames first');
await mkdir('qa/sheet-frames',{recursive:true});
for(const [i,f] of files.entries()) await copyFile(`qa/critical-frames/${f}`,`qa/sheet-frames/${String(i).padStart(2,'0')}.jpg`);
const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate','1','-i','qa/sheet-frames/%02d.jpg','-vf',`scale=480:270,tile=3x${Math.ceil(files.length/3)}`,'-frames:v','1','qa/contact-sheet.jpg'],{encoding:'utf8'});
assert.equal(r.status,0,r.stderr);console.log('Contact sheet:',files.join(', '));
