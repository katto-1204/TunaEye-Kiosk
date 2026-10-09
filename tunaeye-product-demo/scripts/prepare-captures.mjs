import {readFile, writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(path.join(root, 'public/captures/manifest.json'), 'utf8'));
const run = manifest.runs.find(r => r.video && r.viewport.width === 1280);
assert(run, 'Successful paced 1280×800 recording required');
assert.equal(run.segments.length, 10);
assert.deepEqual(run.consoleErrors, []);
assert.deepEqual(run.failedRequests, []);
const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', path.join(root, 'public', run.video)], {encoding: 'utf8'});
assert.equal(probe.status, 0);
const clockOffset = run.segments.at(-1).rawEndMs / 1000 - Number(probe.stdout.trim());
let start = 0;
const scenes = [];
for (const segment of run.segments) {
  const duration = segment.targetDurationSeconds;
  const rawDuration = (segment.rawEndMs - segment.rawStartMs) / 1000;
  const file = `captures/scene-${String(segment.id).padStart(2, '0')}.mp4`;
  const args = ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(Math.max(0, segment.rawStartMs / 1000 - clockOffset)), '-i', path.join(root, 'public', run.video), '-t', String(rawDuration), '-vf', `setpts=${duration / rawDuration}*(PTS-STARTPTS),fps=60,tpad=stop_mode=clone:stop_duration=1`, '-t', String(duration), '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', path.join(root, 'public', file)];
  const result = spawnSync('ffmpeg', args, {stdio: 'inherit'});
  assert.equal(result.status, 0, `ffmpeg scene ${segment.id}`);
  const events = run.events.filter(e => e.rawMs >= segment.rawStartMs && e.rawMs < segment.rawEndMs).map(e => ({...e, seconds: (e.rawMs - segment.rawStartMs) / 1000 * duration / rawDuration, absoluteSeconds: start + (e.rawMs - segment.rawStartMs) / 1000 * duration / rawDuration}));
  scenes.push({id: segment.id, file, start, duration, events});
  start += duration;
}
assert.equal(start, 85);
await writeFile(path.join(root, 'src/capture-timeline.json'), JSON.stringify(scenes, null, 2));
await writeFile(path.join(root, 'public/captures/edit-timeline.json'), JSON.stringify(scenes, null, 2));
console.log('Prepared ten real UI clips, 85 seconds, with synchronized touch events.');
