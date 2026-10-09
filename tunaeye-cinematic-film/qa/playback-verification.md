# Final MP4 browser playback

Status: **pending**. Checked at 2026-10-09T23:01:07.861Z.

Isolated headless Chrome HTML video playback through a localhost HTTP byte-range server; real final MP4 files, no mocked media.

- tunaeye-cinematic-product-film.mp4: pending; 0 representative seeks; Final export does not exist yet.
- tunaeye-cinematic-product-film-no-narration.mp4: pending; 0 representative seeks; Final export does not exist yet.
- tunaeye-preview.mp4: pending; 0 representative seeks; Final export does not exist yet.

Representative seconds: 3, 8, 25.75, 49, 70, 74, 82, 88, 100, 106.5, 108.5, 111, 112.5, 114.5, 117, 119.5. Each seek must show a decoded frame and progress through actual playback; supported Chrome counters verify audio decoding. Successful checks require no console errors, page errors, HTTP errors, or unexpected failed requests. User-agent aborted byte-range requests during seeking are listed separately in JSON. Screenshots from the narrated final MP4 are in qa/playback/.

This checks browser decoding and seeking. It does not prove subjective narration quality or listening-device output, and does not replace physical Pi, camera, weighing, or printer tests.
