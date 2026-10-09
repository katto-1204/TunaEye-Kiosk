# Export verification

Status: **passed**. Checked at 2026-10-09T21:37:38.569Z.

| File | Status | Seconds | Video / audio | LUFS | dBTP |
| --- | --- | --- | --- | --- | --- |
| tunaeye-kiosk-demo.mp4 | passed | 90 | 1920×1080 / 60 fps | -14 | -1.5 |
| tunaeye-kiosk-demo-no-narration.mp4 | passed | 90 | 1920×1080 / 60 fps | -13.5 | -1.1 |
| tunaeye-kiosk-preview.mp4 | passed | 90 | 1280×720 / 30 fps | -14 | -1.3 |
| narration.wav | passed | 90 | 48 kHz stereo PCM | -17.4 | -6 |
| music.wav | passed | 90 | 48 kHz stereo PCM | -30.4 | -16.9 |
| sfx.wav | passed | 90 | 48 kHz stereo PCM | -35.3 | -13.5 |
| final_mix.wav | passed | 90 | 48 kHz stereo PCM | -14 | -1.5 |
| public/audio/no_narration_mix.wav | passed | 90 | 48 kHz stereo PCM | -13.5 | -1.2 |
| public/audio/narration.wav | passed | 90 | 48 kHz stereo PCM | -17.4 | -6 |
| public/audio/music.wav | passed | 90 | 48 kHz stereo PCM | -30.4 | -16.9 |
| public/audio/sfx.wav | passed | 90 | 48 kHz stereo PCM | -35.3 | -13.5 |
| public/audio/final_mix.wav | passed | 90 | 48 kHz stereo PCM | -14 | -1.5 |

Checks use ffprobe decoded frame counts and metadata, plus ffmpeg EBU R128 integrated loudness / true peak and astats sample peaks / invalid samples. Mixed audio must be within 1 LUFS of -14, with no sample or true-peak clipping. All required files must pass before status becomes passed.

This verifies exported media properties and audio levels. It does not verify subjective narration intelligibility, every visual frame, live inference, or physical hardware.
