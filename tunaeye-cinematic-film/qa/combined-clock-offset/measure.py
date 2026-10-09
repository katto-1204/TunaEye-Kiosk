import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[2]
for name, filename, event_seconds in [
    ("film", root / "public/captures/raw-workflow.webm", 7.122),
    ("demo", root.parent / "tunaeye-product-demo/public/captures/raw-workflow.webm", 6.908),
]:
    start = 5.8
    raw = subprocess.check_output(["ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", str(start), "-i", str(filename), "-t", "1.6", "-vf", "crop=280:70:500:470,fps=60", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"])
    size = 280 * 70 * 3
    assert len(raw) % size == 0 and len(raw) >= size * 60
    baseline = raw[:size]
    print(name, "recorded event", event_seconds)
    first = True
    for index in range(len(raw) // size):
        frame = raw[index * size:(index + 1) * size]
        difference = sum(abs(a - b) for a, b in zip(baseline, frame)) / size
        if difference > 2 and first:
            print("first changed button region", round(start + index / 60, 4), "offset", round(start + index / 60 - event_seconds, 4), "mean RGB delta", round(difference, 3))
            first = False
        if index % 6 == 0:
            print(round(start + index / 60, 2), round(difference, 3))
