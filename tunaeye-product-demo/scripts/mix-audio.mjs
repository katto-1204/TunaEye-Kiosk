import {spawnSync} from 'node:child_process';
import {writeFile, copyFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const input = ['-i', 'public/audio/narration.wav', '-i', 'public/audio/music.wav', '-i', 'public/audio/sfx.wav'];
const mix = '[0:a]asplit=2[voice][key];[1:a]volume=0.65[music];[music][key]sidechaincompress=threshold=0.012:ratio=6:attack=25:release=450[ducked];[voice][ducked][2:a]amix=inputs=3:normalize=0,atrim=start=0:end=90,asetpts=N/SR/TB';
const run = args => {
  const result = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-y', ...input, ...args], {cwd: root, encoding: 'utf8', maxBuffer: 10e6});
  assert.equal(result.status, 0, result.stderr);
  return result.stderr;
};
const measurement = run(['-filter_complex', `${mix},loudnorm=I=-14:TP=-1.5:LRA=7:print_format=json[out]`, '-map', '[out]', '-t', '90', '-f', 'null', '-']);
const match = measurement.match(/\{\s*"input_i"[\s\S]*?\}/);
assert(match, 'First-pass loudness measurement required');
const levels = JSON.parse(match[0]);
assert(Number.isFinite(Number(levels.input_i)));
const mastering = `loudnorm=I=-14:TP=-1.5:LRA=7:measured_I=${levels.input_i}:measured_TP=${levels.input_tp}:measured_LRA=${levels.input_lra}:measured_thresh=${levels.input_thresh}:offset=${levels.target_offset}:linear=true:print_format=json`;
const result = run(['-filter_complex', `${mix},${mastering}[out]`, '-map', '[out]', '-t', '90', '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s24le', 'public/audio/final_mix.wav']);
await copyFile(path.join(root, 'public/audio/final_mix.wav'), path.join(root, 'final_mix.wav'));
await writeFile(path.join(root, 'qa/audio-mastering.json'), JSON.stringify({voice: 'en-US-GuyNeural', duration: 90, sampleRate: 48000, channels: 2, musicDucking: '6:1 sidechain compression keyed by narration; 25ms attack / 450ms release', firstPass: levels, secondPass: JSON.parse(result.match(/\{\s*"input_i"[\s\S]*?\}/)[0])}, null, 2));
console.log('Narration + ducked original music + synchronized SFX mastered to -14 LUFS.');
