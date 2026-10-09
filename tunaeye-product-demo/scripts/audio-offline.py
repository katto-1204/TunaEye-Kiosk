"""Original 124 BPM instrumental and capture-synchronized UI sound design.

Run from anywhere with Python 3 and ffmpeg on PATH. No third-party packages.
"""
from array import array
import json
import math
from pathlib import Path
import shutil
import subprocess
import sys
import wave

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'audio'
OUT.mkdir(parents=True, exist_ok=True)
RATE, SECONDS = 48000, 90
COUNT = RATE * SECONDS
music = array('f', [0]) * COUNT
sfx = array('f', [0]) * COUNT


def tone(target, start, duration, frequency, level, kind='bell'):
    first = round(start * RATE)
    length = min(round(duration * RATE), COUNT - first)
    for j in range(max(0, length)):
        t = j / RATE
        attack = min(1, t / 0.008)
        release = min(1, (duration - t) / 0.08)
        phase = 2 * math.pi * frequency * t
        if kind == 'pad':
            shape = (math.sin(phase) + 0.2 * math.sin(phase * 2)) / 1.2
            env = attack * release
        elif kind == 'kick':
            shape = math.sin(2 * math.pi * (45 * t + 70 * 0.035 * (1 - math.exp(-t / 0.035))))
            env = math.exp(-t * 19)
        elif kind == 'tick':
            shape = math.sin(phase) * math.sin(phase * 1.731)
            env = math.exp(-t * 90)
        elif kind == 'paper':
            shape = math.sin(phase) * math.sin(phase * 1.731) * math.sin(phase * 0.823)
            env = attack * release * (0.6 + 0.4 * math.sin(t * 40))
        else:
            shape = math.sin(phase) + 0.15 * math.sin(phase * 2.003)
            env = attack * math.exp(-t * 8) * release
        target[first + j] += level * shape * env


beat = 60 / 124
# D major / B minor / G major / A major; original restrained product-demo motif.
chords = [(146.832, 184.997, 220), (123.471, 146.832, 184.997),
          (97.999, 123.471, 146.832), (110, 138.591, 164.814)]
for bar in range(0 if '--sfx-only' in sys.argv else math.ceil(SECONDS / (beat * 4))):
    start = bar * beat * 4
    chord = chords[bar % 4]
    intensity = 0.72 if start < 12 else 1.0 if start < 77 else 0.75
    for f in chord:
        tone(music, start, min(beat * 4.05, SECONDS - start), f * 2, 0.017 * intensity, 'pad')
    for n in range(8):
        pos = start + n * beat / 2
        if pos >= 85:
            break
        tone(music, pos, 0.36, chord[[0, 1, 2, 1, 0, 2, 1, 2][n]] * 4,
             0.028 * intensity)
    for n in range(4):
        pos = start + n * beat
        if pos >= 85:
            break
        tone(music, pos, 0.25, 60, 0.09 * intensity, 'kick')
        tone(music, pos + beat / 2, 0.065, 6800, 0.025 * intensity, 'tick')
        if n % 2:
            tone(music, pos, 0.09, 2600, 0.028 * intensity, 'tick')
        tone(music, pos, 0.3, chord[0] / 2, 0.032 * intensity, 'pad')
if '--sfx-only' not in sys.argv:
    for f in chords[0]:
        tone(music, 85, 4.95, f * 2, 0.025, 'pad')
        tone(music, 85.15, 1.7, f * 4, 0.018)

timeline = json.loads((ROOT / 'public' / 'captures' / 'edit-timeline.json').read_text())
events = [event for scene in timeline for event in scene['events']]
for event in events:
    start = event['absoluteSeconds']
    label = event['label']
    if event['type'] == 'typing':
        for i in range(len(label)):
            tone(sfx, start + i * 0.11, 0.07, 1600 + i * 110, 0.07, 'tick')
    elif event['type'] == 'upload':
        tone(sfx, start, 0.2, 659.255, 0.08)
        tone(sfx, start + 0.08, 0.35, 987.767, 0.07)
    elif 'Weight' in label or 'PIN' in label:
        tone(sfx, start, 0.065, 1250, 0.055, 'tick')
    else:
        tone(sfx, start, 0.11, 900, 0.045)
    if 'Use Image' in label:
        for i in range(3):
            tone(sfx, start + 0.25 + i * 0.28, 0.22, 220 + i * 55, 0.033)
    if label in ['Print Sashibo core', 'Print Tail cut']:
        tone(sfx, start + 0.12, 1.1, 620, 0.045, 'paper')
    if label == 'Manual override':
        tone(sfx, start, 0.22, 330, 0.055)
    if label == 'Save override':
        tone(sfx, start + 0.06, 0.38, 880, 0.05)

for f in [146.832, 220, 293.665]:
    tone(sfx, 0.2, 1.4, f, 0.06)
    tone(sfx, 85.15, 1.8, f, 0.08)
# Screenshot timestamps anchor confirmations to verified visible UI states.
run = json.loads((ROOT / 'public' / 'captures' / 'manifest.json').read_text())['runs'][0]
for shot in run['screenshots']:
    if shot['name'] not in ['11-sashibo-result', '15-tail-result', '22-complete']:
        continue
    segment = next(s for s in run['segments'] if s['rawStartMs'] <= shot['rawMs'] <= s['rawEndMs'])
    scene = next(s for s in timeline if s['id'] == segment['id'])
    when = scene['start'] + (shot['rawMs'] - segment['rawStartMs']) / (segment['rawEndMs'] - segment['rawStartMs']) * scene['duration']
    tone(sfx, when, 0.44, 880, 0.065)
    tone(sfx, when + 0.10, 0.4, 1108.73, 0.045)


def save(name, mono, widen=False):
    pcm = array('h')
    for i, value in enumerate(mono):
        fade = min(1, i / (RATE * 0.15), (COUNT - i) / (RATE * 0.6))
        left = value * fade
        right = (value * 0.93 + (mono[i - 311] if i >= 311 else 0) * 0.07) * fade if widen else left
        pcm.append(round(max(-0.98, min(0.98, left)) * 32767))
        pcm.append(round(max(-0.98, min(0.98, right)) * 32767))
    with wave.open(str(OUT / name), 'wb') as handle:
        handle.setparams((2, 2, RATE, COUNT, 'NONE', 'not compressed'))
        handle.writeframes(pcm.tobytes())
    shutil.copy2(OUT / name, ROOT / name)


if '--sfx-only' not in sys.argv:
    save('music.wav', music, True)
save('sfx.wav', sfx)
cmd = ['ffmpeg', '-y', '-hide_banner', '-i', str(OUT / 'music.wav'), '-i', str(OUT / 'sfx.wav'),
       '-filter_complex', '[0:a][1:a]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.2:LRA=7:linear=false[a]',
       '-map', '[a]', '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', str(OUT / 'no_narration_mix.wav')]
subprocess.run(cmd, check=True, capture_output=True)
shutil.copy2(OUT / 'no_narration_mix.wav', ROOT / 'no_narration_mix.wav')
for name in ['music.wav', 'sfx.wav', 'no_narration_mix.wav']:
    with wave.open(str(OUT / name)) as handle:
        assert handle.getnchannels() == 2 and handle.getframerate() == RATE
        assert handle.getnframes() == COUNT, (name, handle.getnframes())
assert all(0 <= event['absoluteSeconds'] < SECONDS for event in events)
print(json.dumps({'seconds': SECONDS, 'rate': RATE, 'channels': 2, 'bpm': 124,
                  'synchronized_events': len(events), 'outputs': ['music.wav', 'sfx.wav', 'no_narration_mix.wav']}))
