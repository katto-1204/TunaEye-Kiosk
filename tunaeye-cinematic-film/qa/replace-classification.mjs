import {spawnSync} from 'node:child_process';
import {rename} from 'node:fs/promises';
import assert from 'node:assert/strict';
// Repair the in-flight render's old grade timings using exact Remotion frames.
const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i','qa/visual-master.mp4','-i','qa/classification-corrected.mp4','-filter_complex','[0:v]split=2[before][after];[before]trim=end_frame=5700,setpts=PTS-STARTPTS[h];[after]trim=start_frame=6480,setpts=PTS-STARTPTS[t];[1:v]setpts=PTS-STARTPTS[c];[h][c][t]concat=n=3:v=1:a=0,fps=60,format=yuvj420p[out]','-map','[out]','-c:v','libx264','-crf','18','-preset','fast','-pix_fmt','yuvj420p','-color_range','pc','-colorspace','bt470bg','-an','qa/visual-master-corrected.mp4'],{stdio:'inherit',windowsHide:true});
assert.equal(r.status,0,'Frame-exact classification replacement');
await rename('qa/visual-master.mp4','qa/visual-master-original.mp4');
await rename('qa/visual-master-corrected.mp4','qa/visual-master.mp4');
