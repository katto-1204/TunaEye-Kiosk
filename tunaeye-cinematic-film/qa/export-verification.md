# Export verification

Status: **passed**. Checked at 2026-10-09T23:14:41.317Z.

| File | Status | Seconds | Video / audio | LUFS | dBTP |
| --- | --- | --- | --- | --- | --- |
| tunaeye-cinematic-product-film.mp4 | passed | 120 | 1920×1080 / 60 fps | -14.1 | -1.3 |
| tunaeye-cinematic-product-film-no-narration.mp4 | passed | 120 | 1920×1080 / 60 fps | -13.9 | -1.1 |
| tunaeye-preview.mp4 | passed | 120 | 1280×720 / 30 fps | -14.2 | -1.2 |
| narration.wav | passed | 120 | 48 kHz stereo PCM | -17.7 | -6 |
| music.wav | passed | 120 | 48 kHz stereo PCM | -22.7 | -6.3 |
| sfx.wav | passed | 120 | 48 kHz stereo PCM | -24.4 | -4.8 |
| final_mix.wav | passed | 120 | 48 kHz stereo PCM | -14.1 | -1.4 |
| public/audio/no_narration_mix.wav | passed | 120 | 48 kHz stereo PCM | -13.9 | -1.3 |
| public/audio/narration.wav | passed | 120 | 48 kHz stereo PCM | -17.7 | -6 |
| public/audio/music.wav | passed | 120 | 48 kHz stereo PCM | -22.7 | -6.3 |
| public/audio/sfx.wav | passed | 120 | 48 kHz stereo PCM | -24.4 | -4.8 |
| public/audio/final_mix.wav | passed | 120 | 48 kHz stereo PCM | -14.1 | -1.4 |

Checks use ffprobe decoded frame counts and metadata, plus ffmpeg EBU R128 integrated loudness / true peak and astats sample peaks / invalid samples. Mixed audio must be within 1 LUFS of -14, with no sample or true-peak clipping. All required files must pass before status becomes passed.

This verifies exported media properties and audio levels. It does not verify subjective narration intelligibility, every visual frame, live inference, or physical hardware.
