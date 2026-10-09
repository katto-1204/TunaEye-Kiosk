import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {access, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const duration = 120;
const instrumentalOnly = process.argv.includes('--instrumental-only');
const reportPrefix = instrumentalOnly ? 'combined-instrumental' : 'combined';
const rate = value => {
  const [numerator, denominator = '1'] = String(value).split('/');
  return Number(numerator) / Number(denominator);
};
const lastNumber = (text, regex, label) => {
  const matches = [...text.matchAll(regex)];
  assert(matches.length, `${label} was not reported by ffmpeg`);
  const result = Number(matches.at(-1)[1]);
  assert(Number.isFinite(result), `${label} must be finite`);
  return result;
};
const parseAudio = text => ({
  integratedLufs: lastNumber(text, /I:\s*(-?\d+(?:\.\d+)?)\s+LUFS/g, 'Integrated loudness'),
  truePeakDbfs: lastNumber(text, /True peak:\s*\n\s*Peak:\s*(-?\d+(?:\.\d+)?)\s+dBFS/g, 'True peak'),
  samplePeakDbfs: lastNumber(text, /Peak level dB:\s*(-?\d+(?:\.\d+)?)/g, 'Sample peak'),
  invalidSamples: [...text.matchAll(/Number of (?:NaNs|Infs):\s*(\d+)/g)].reduce((sum, match) => sum + Number(match[1]), 0),
});
const near = (actual, expected, tolerance, label) => {
  assert(Number.isFinite(Number(actual)), `${label} is missing`);
  assert(Math.abs(Number(actual) - expected) <= tolerance, `${label}: expected ${expected} Â± ${tolerance}, got ${actual}`);
};
const run = (command, args) => {
  const result = spawnSync(command, args, {encoding: 'utf8', maxBuffer: 32 * 1024 * 1024});
  assert.equal(result.status, 0, `${command} failed: ${result.error?.message ?? result.stderr}`);
  return result;
};

const expected = instrumentalOnly ? [
  {file: 'tunaeye-combined-product-demo-no-narration.mp4', width: 1920, height: 1080, fps: 60, mix: true},
  {file: 'tunaeye-combined-preview-instrumental.mp4', width: 1280, height: 720, fps: 30, mix: true},
  {file: 'combined-music.wav'},
  {file: 'combined-sfx.wav'},
  {file: 'combined-no_narration_mix.wav', mix: true},
  {file: 'public/combined/audio/music.wav'},
  {file: 'public/combined/audio/sfx.wav'},
  {file: 'public/combined/audio/no_narration_mix.wav', mix: true},
] : [
  {file: 'tunaeye-combined-product-demo.mp4', width: 1920, height: 1080, fps: 60, mix: true},
  {file: 'tunaeye-combined-product-demo-no-narration.mp4', width: 1920, height: 1080, fps: 60, mix: true},
  {file: 'tunaeye-combined-preview.mp4', width: 1280, height: 720, fps: 30, mix: true},
  {file: 'combined-narration.wav'},
  {file: 'combined-music.wav'},
  {file: 'combined-sfx.wav'},
  {file: 'combined-final_mix.wav', mix: true},
  {file: 'public/combined/audio/narration.wav'},
  {file: 'public/combined/audio/music.wav'},
  {file: 'public/combined/audio/sfx.wav'},
  {file: 'public/combined/audio/final_mix.wav', mix: true},
  {file: 'public/combined/audio/no_narration_mix.wav', mix: true},
];

if (process.argv.includes('--self-check')) {
  assert.equal(expected.length,instrumentalOnly ? 8 : 12);
  assert.equal(expected.some(spec=>spec.file==='combined-narration.wav'),!instrumentalOnly);
  assert.equal(rate('60000/1001'), 60000 / 1001);
  assert.equal(rate('60/1'), 60);
  assert.deepEqual(parseAudio('I: -70.0 LUFS\nPeak level dB: -2.0\nNumber of NaNs: 0\nNumber of Infs: 0\nIntegrated loudness:\n I: -14.2 LUFS\nTrue peak:\n Peak: -1.1 dBFS\nPeak level dB: -1.3'), {integratedLufs: -14.2, truePeakDbfs: -1.1, samplePeakDbfs: -1.3, invalidSamples: 0});
  assert.throws(() => near(59.94, 60, 0.001, 'fps'));
  assert.throws(() => parseAudio('missing ffmpeg summary'));
  console.log('Export verifier self-check passed. No media files were inspected.');
  process.exit(0);
}

const report = {checkedAt: new Date().toISOString(), passed: false, status: 'pending', scope: instrumentalOnly ? 'Instrumental outputs only; revised narration awaits user approval' : 'Complete combined outputs', requirements: {durationSeconds: duration, sampleRate: 48000, channels: 2, integratedLufs: -14, lufsTolerance: 1, maximumTruePeakDbfs: 0}, files: []};
for (const spec of expected) {
  const result = {file: spec.file, status: 'pending'};
  report.files.push(result);
  const fullPath = path.join(root, spec.file);
  try { await access(fullPath); } catch { result.error = 'File does not exist yet'; continue; }
  try {
    const probe = JSON.parse(run('ffprobe', ['-v', 'error', ...(spec.fps ? ['-count_frames'] : []), '-show_streams', '-show_format', '-of', 'json', fullPath]).stdout);
    const videos = probe.streams.filter(stream => stream.codec_type === 'video');
    const audios = probe.streams.filter(stream => stream.codec_type === 'audio');
    assert.equal(audios.length, 1, 'Exactly one audio stream required');
    const audio = audios[0];
    near(probe.format.duration, duration, 0.05, 'Container duration');
    near(audio.duration ?? probe.format.duration, duration, 0.05, 'Audio duration');
    assert.equal(Number(audio.sample_rate), 48000, 'Audio must be 48 kHz');
    assert.equal(audio.channels, 2, 'Audio must be stereo');
    result.media = {durationSeconds: Number(probe.format.duration), audioCodec: audio.codec_name, sampleRate: Number(audio.sample_rate), channels: audio.channels};
    if (spec.fps) {
      assert.equal(videos.length, 1, 'Exactly one video stream required');
      const video = videos[0];
      assert.equal(video.codec_name, 'h264', 'Video must be H.264');
      assert.equal(video.pix_fmt, 'yuv420p', 'Video must use compatible yuv420p pixels');
      assert.equal(audio.codec_name, 'aac', 'MP4 audio must be AAC');
      assert.equal(video.width, spec.width, 'Unexpected video width');
      assert.equal(video.height, spec.height, 'Unexpected video height');
      near(rate(video.avg_frame_rate), spec.fps, 0.001, 'Frame rate');
      near(video.duration, duration, 1 / spec.fps, 'Video duration');
      assert.equal(Number(video.nb_read_frames), duration * spec.fps, 'Decoded frame count must match full 120-second export');
      Object.assign(result.media, {videoCodec: video.codec_name, pixelFormat: video.pix_fmt, width: video.width, height: video.height, fps: rate(video.avg_frame_rate), decodedFrames: Number(video.nb_read_frames)});
    } else {
      assert.equal(videos.length, 0, 'Audio stem must not contain video');
      assert(audio.codec_name.startsWith('pcm_'), 'WAV stem must use PCM audio');
    }
    const analysis = run('ffmpeg', ['-hide_banner', '-nostats', '-i', fullPath, '-map', '0:a:0', '-af', 'ebur128=peak=true,astats=metadata=0:reset=0', '-f', 'null', '-']);
    result.audio = parseAudio(analysis.stderr);
    assert.equal(result.audio.invalidSamples, 0, 'Audio must not contain NaN or infinity samples');
    assert(result.audio.samplePeakDbfs < 0, `Sample clipping detected: ${result.audio.samplePeakDbfs} dBFS`);
    assert(result.audio.truePeakDbfs <= 0, `True-peak clipping detected: ${result.audio.truePeakDbfs} dBFS`);
    if (spec.mix) near(result.audio.integratedLufs, -14, 1, 'Mixed audio integrated loudness');
    result.status = 'passed';
    console.log(`PASS ${spec.file}: ${result.audio.integratedLufs} LUFS, ${result.audio.truePeakDbfs} dBTP`);
  } catch (error) {
    result.status = 'failed';
    result.error = error.message;
    console.error(`FAIL ${spec.file}: ${error.message}`);
  }
}
report.passed = report.files.every(file => file.status === 'passed');
report.status = report.files.some(file => file.status === 'failed') ? 'failed' : report.passed ? 'passed' : 'pending';
await mkdir(path.join(root, 'qa'), {recursive: true});
await writeFile(path.join(root, `qa/${reportPrefix}-export-verification.json`), JSON.stringify(report, null, 2));
const rows = report.files.map(file => `| ${file.file} | ${file.status} | ${file.media?.durationSeconds ?? '-'} | ${file.media?.width ? `${file.media.width}x${file.media.height} / ${file.media.fps} fps` : file.media ? '48 kHz stereo PCM' : '-'} | ${file.audio?.integratedLufs ?? '-'} | ${file.audio?.truePeakDbfs ?? '-'} |`).join('\n');
const issues = report.files.filter(file => file.error).map(file => `- ${file.file}: ${file.error}`).join('\n');
await writeFile(path.join(root, `qa/${reportPrefix}-export-verification.md`), `# Export verification\n\nStatus: **${report.status}**. Checked at ${report.checkedAt}.\n\nScope: ${report.scope}.\n\n| File | Status | Seconds | Video / audio | LUFS | dBTP |\n| --- | --- | --- | --- | --- | --- |\n${rows}\n\n${issues ? `## Outstanding checks\n\n${issues}\n\n` : ''}Checks use ffprobe decoded frame counts and metadata, plus ffmpeg EBU R128 integrated loudness / true peak and astats sample peaks / invalid samples. Mixed audio must be within 1 LUFS of -14, with no sample or true-peak clipping. All required files must pass before status becomes passed.\n\nThis verifies exported media properties and audio levels. It does not verify subjective narration intelligibility, every visual frame, live inference, or physical hardware.\n`);
console.log(`Export verification: ${report.status}. Reports written to qa/${reportPrefix}-export-verification.{json,md}`);
process.exitCode = report.status === 'passed' ? 0 : report.status === 'pending' ? 2 : 1;
