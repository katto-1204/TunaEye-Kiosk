import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const output = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/captures');
const manifest = JSON.parse(await readFile(path.join(output, 'manifest.json'), 'utf8'));
const run = manifest.runs.find(item => item.viewport.width === 1280);
assert.equal(run.status, 'passed');
const event = label => { const found = run.events.find(item => item.label === label); assert(found, label); return found.rawMs / 1000; };
const chapters = [
  ['01-welcome', event('Get started') - .6, 2],
  ['02-role', event('Expert Grader') - 1, 2],
  ['03-name', event('Eli') - .7, 2],
  ['04-samples', event('Select Tail cut') - .6, 2],
  ['05-association', event('Same fish') - .5, 2],
  ['06-tutorial', event('Tutorial Next 1') - .4, 2],
  ['07-weight', event('Weight 3') - .15, 2.5],
  ['08-capture', event('Capture sashibo core') - .5, 2],
  ['09-review', event('Sashibo Use Image') - 3.6, 2],
  ['10-use-image', event('Sashibo Use Image') - .5, 2.5],
  ['11-analysis-result', event('Sashibo Use Image') + 1.7, 2],
];
assert.equal(chapters.reduce((sum, chapter) => sum + chapter[2], 0), 23);
await mkdir(path.join(output, 'clips'), { recursive: true });
function ffmpeg(args) { const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { encoding: 'utf8', windowsHide: true }); assert.equal(result.status, 0, result.stderr || result.error?.message); }
let montageStart = 0;
const clips = [];
for (const [name, sourceStart, duration] of chapters) {
  assert(sourceStart > 0);
  const file = `clips/${name}.mp4`;
  ffmpeg(['-ss', String(sourceStart), '-i', path.join(output, 'raw-workflow.webm'), '-an', '-vf', 'setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=1,fps=60,setsar=1', '-frames:v', String(duration * 60), '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(output, file)]);
  clips.push({ name, file: `captures/${file}`, sourceStartSeconds: sourceStart, durationSeconds: duration, montageStartSeconds: montageStart, events: run.events.filter(item => item.rawMs / 1000 >= sourceStart && item.rawMs / 1000 < sourceStart + duration).map(item => ({ ...item, clipSeconds: item.rawMs / 1000 - sourceStart, montageSeconds: montageStart + item.rawMs / 1000 - sourceStart })) });
  montageStart += duration;
}
await writeFile(path.join(output, 'clips/concat.txt'), clips.map(item => `file '${path.basename(item.file)}'`).join('\n'));
ffmpeg(['-f', 'concat', '-safe', '0', '-i', path.join(output, 'clips/concat.txt'), '-c', 'copy', '-movflags', '+faststart', path.join(output, 'hero-workflow.mp4')]);
await writeFile(path.join(output, 'workflow-clips.json'), JSON.stringify({ source: 'Fresh actual kiosk Playwright recording; camera/inference fixtures; original UI preserved', durationSeconds: montageStart, video: 'captures/hero-workflow.mp4', clips }, null, 2));
console.log('11 authentic UI clips and 23-second hero-workflow.mp4 created.');
