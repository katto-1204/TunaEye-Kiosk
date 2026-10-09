import {EdgeTTS} from '@andresaya/edge-tts';
import {mkdir, writeFile, copyFile, access} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = path.join(root, 'public/audio');
await mkdir(directory, {recursive: true});
const scenes = [
  {start: 0, end: 6, text: 'Meet Tuna Eye. Your AI-assisted tuna quality grading kiosk.'},
  {start: 6, end: 12, text: 'Start by identifying the expert grader handling the session.'},
  {start: 12, end: 20, text: 'Choose sashibo core, tail-cut, or both. Then identify whether samples belong to the same fish.'},
  {start: 20, end: 27, text: "Follow the sample placement guide, then enter the tuna's measured weight."},
  {start: 27, end: 38, text: 'Capture or upload the sashibo-core image, review it, and confirm before analysis.'},
  {start: 38, end: 46, text: 'Tuna Eye sends the image to Raspberry Pi for analysis, then displays a grade recommendation with confidence.'},
  {start: 46, end: 57, text: 'Repeat the process for tail-cut. Each sample receives its own grading result.'},
  {start: 57, end: 67, text: 'Expert graders can review or override recommendations, with their decisions reflected in the grading record.'},
  {start: 67, end: 77, text: 'Review the grading summary, prepare a printable receipt, and complete the session.'},
  {start: 77, end: 85, text: 'Completed results remain available in local records, with synchronization supported when configured.'},
  {start: 85, end: 90, text: 'Tuna Eye. Sea Beyond the Cut.'},
];
assert.equal(scenes.at(-1).end, 90);
assert(scenes.every((scene, index) => !index || scene.start === scenes[index - 1].end));
const run = (command, args) => {
  const result = spawnSync(command, args, {encoding: 'utf8', maxBuffer: 5e6});
  assert.equal(result.status, 0, result.stderr || result.error?.message);
  return result.stdout;
};
try {
  for (const [index, scene] of scenes.entries()) {
    scene.file = path.join(directory, `voice-${String(index + 1).padStart(2, '0')}.mp3`);
    try { await access(scene.file); }
    catch {
      const tts = new EdgeTTS();
      const timeout = setTimeout(() => {console.error('TTS blocker: Microsoft neural voice request exceeded 30 seconds.'); process.exit(1);}, 30000);
      await tts.synthesize(scene.text, 'en-US-GuyNeural', {rate: '-4%', pitch: '+0Hz', volume: '+0%'});
      clearTimeout(timeout);
      const bytes = tts.toBuffer();
      assert(bytes.length > 1000, 'Neural narration is empty');
      await writeFile(scene.file, bytes);
    }
    scene.duration = Number(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', scene.file]).trim());
    assert(scene.duration > 1, 'Narration must contain speech');
    scene.delay = scene.start + 0.35;
    scene.tempo = Math.max(1, scene.duration / (scene.end - scene.delay - 0.25));
    assert(scene.tempo < 1.22, `Scene ${index + 1} narration would be rushed`);
    console.log(`Narration ${index + 1}: ${scene.duration.toFixed(2)} seconds, en-US-GuyNeural`);
  }
  const inputs = scenes.flatMap(scene => ['-i', scene.file]);
  const filters = scenes.map((scene, index) => `[${index}:a]atempo=${scene.tempo},loudnorm=I=-17:TP=-3:LRA=7,aresample=48000,aformat=channel_layouts=stereo,asetpts=N/SR/TB,adelay=${Math.round(scene.delay * 1000)}|${Math.round(scene.delay * 1000)}[v${index}]`);
  filters.push(`${scenes.map((_, index) => `[v${index}]`).join('')}amix=inputs=11:normalize=0,aresample=48000,asetpts=N/SR/TB,apad=whole_len=4320000,atrim=end_sample=4320000[narration]`);
  run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...inputs, '-filter_complex', filters.join(';'), '-map', '[narration]', '-t', '90', '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s24le', path.join(directory, 'narration.wav')]);
  const duration = Number(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', path.join(directory, 'narration.wav')]).trim());
  assert.equal(duration, 90, 'Narration stem must be exactly 90 seconds');
  await copyFile(path.join(directory, 'narration.wav'), path.join(root, 'narration.wav'));
  await writeFile(path.join(directory, 'narration-manifest.json'), JSON.stringify({voice: 'en-US-GuyNeural', service: 'Microsoft Edge online neural TTS', scenes: scenes.map(scene => ({...scene, file: path.basename(scene.file)}))}, null, 2));
} catch (error) {
  console.error(`TTS blocker: ${error.message || error.code || error.name}`);
  if (error.errors) console.error(error.errors.map(item => `${item.code}: ${item.message}`).join('\n'));
  process.exit(1);
}
