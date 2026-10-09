import {spawnSync} from 'node:child_process';
import {access} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const browser = process.env.REMOTION_BROWSER_EXECUTABLE || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
for (const file of ['public/audio/final_mix.wav', 'public/audio/no_narration_mix.wav', 'src/capture-timeline.json']) await access(path.join(root, file));
const cli = path.join(root, 'node_modules/@remotion/cli/remotion-cli.js');
if (!process.argv.includes('--mux-only')) {
  const result = spawnSync(process.execPath, [cli, 'render', 'src/index.ts', 'TunaEyeVisual', 'qa/visual-master.mp4', '--codec=h264', '--crf=18', '--x264-preset=fast', '--concurrency=4', `--browser-executable=${browser}`], {cwd: root, stdio: 'inherit'});
  assert.equal(result.status, 0, 'Remotion final render');
}
await access(path.join(root, 'qa/visual-master.mp4'));
const compatible = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', 'qa/visual-master.mp4', '-vf', 'scale=in_color_matrix=bt601:out_color_matrix=bt709:in_range=full:out_range=limited,format=yuv420p', '-c:v', 'libx264', '-crf', '18', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-an', 'qa/visual-master-compatible.mp4'], {cwd: root, stdio: 'inherit'});
assert.equal(compatible.status, 0, 'BT.709 compatible visual export');
const narrated = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', 'qa/visual-master-compatible.mp4', '-i', 'public/audio/final_mix.wav', '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-ac', '2', '-t', '90', '-movflags', '+faststart', 'tunaeye-kiosk-demo.mp4'], {cwd: root, stdio: 'inherit'});
assert.equal(narrated.status, 0, 'Narrated export');
// Both versions share identical visuals; remux avoids rendering 5,400 frames twice.
const withoutNarration = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', 'tunaeye-kiosk-demo.mp4', '-i', 'public/audio/no_narration_mix.wav', '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-ac', '2', '-t', '90', '-movflags', '+faststart', 'tunaeye-kiosk-demo-no-narration.mp4'], {cwd: root, stdio: 'inherit'});
assert.equal(withoutNarration.status, 0, 'Narration-free export');
const preview = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', 'tunaeye-kiosk-demo.mp4', '-vf', 'scale=1280:720,fps=30', '-c:v', 'libx264', '-crf', '24', '-preset', 'fast', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2', '-movflags', '+faststart', 'tunaeye-kiosk-preview.mp4'], {cwd: root, stdio: 'inherit'});
assert.equal(preview.status, 0, 'Preview export');
console.log('Delivered full, narration-free and preview MP4s.');
