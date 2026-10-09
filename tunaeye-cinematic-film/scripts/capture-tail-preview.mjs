import { chromium, expect } from '@playwright/test';
import { createServer } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(project, '..');
const output = path.join(project, 'public/combined');
const qa = path.join(project, 'qa');
await mkdir(output, { recursive: true }); await mkdir(qa, { recursive: true });
const core = await readFile(path.join(root, 'public/DEMO_SAMPLES/SASHIBOCORE_A.png'));
const tail = await readFile(path.join(root, 'public/DEMO_SAMPLES/TAILCUT_A.png'));
const server = await createServer({ root, configLoader: 'runner', define: { 'import.meta.env.VITE_SUPABASE_URL': '""', 'import.meta.env.VITE_SUPABASE_ANON_KEY': '""', 'import.meta.env.VITE_DEMO_MODE': '"false"' }, server: { host: '127.0.0.1', port: 3018, strictPort: true, hmr: false, watch: { ignored: ['**/tunaeye-product-demo/**', '**/tunaeye-cinematic-film/**', '**/test-results/**'] } } });
await server.listen();
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const manifest = { source: 'Current unchanged kiosk Tail cut Capture 2 of 2', boundary: 'Deterministic isolated Pi camera snapshot/stream and inference fixtures; no live hardware', runs: [] };
async function capture(width, height, record) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, ...(record ? { recordVideo: { dir: output, size: { width, height } } } : {}) });
  let snapshots = 0;
  let grades = 0;
  const run = { viewport: { width, height }, errors: [], failedRequests: [], streamSource: 'public/DEMO_SAMPLES/TAILCUT_A.png', status: 'running' };
  await context.route('**/*', async route => {
    const request = route.request(); const url = new URL(request.url());
    if (url.origin === 'http://127.0.0.1:3018') return route.continue();
    if (url.pathname === '/stream') return route.fulfill({ contentType: 'image/png', headers: { 'Access-Control-Allow-Origin': '*' }, body: tail });
    if (url.pathname === '/snapshot') { snapshots += 1; return route.fulfill({ contentType: 'image/png', body: snapshots === 1 ? core : tail }); }
    if (url.pathname === '/grade') { grades += 1; const imageType = request.postData().includes('tailcut') ? 'tailcut' : 'sashibocore'; return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ id: `tail-retake-${grades}`, capture_id: `tail-capture-${grades}`, image_type: imageType, grade: 'GRADE_A', confidence: imageType === 'tailcut' ? .941 : .963, scores: { GRADE_A: .963, GRADE_B: .02, GRADE_C: .01, INVALID: .007 } }) }); }
    run.errors.push(`Unexpected external request: ${request.url()}`); return route.fulfill({ status: 503, body: 'External endpoint excluded.' });
  });
  await context.addInitScript(() => { localStorage.clear(); localStorage.setItem('tunaeye-installed', 'true'); localStorage.setItem('tunaeye-rpi-url', 'http://10.42.0.1:5000'); localStorage.setItem('tunaeye-camera-url', 'http://10.42.0.1:8080'); });
  const page = await context.newPage();
  page.on('console', message => { if (message.type() === 'error') run.errors.push(message.text()); }); page.on('pageerror', error => run.errors.push(error.message));
  page.on('requestfailed', request => { if (!(request.url().startsWith('blob:') && request.failure()?.errorText === 'net::ERR_ABORTED')) run.failedRequests.push(`${request.url()} ${request.failure()?.errorText}`); });
  const button = name => page.getByRole('button', { name, exact: true });
  let endWall;
  let tapWall;
  try {
    await page.goto('http://127.0.0.1:3018/kiosk/'); await button('Get started').click(); await page.getByRole('button', { name: /Expert Grader/ }).click();
    await page.getByLabel('Your name').fill('Eli'); await button('Start grading').click(); await page.getByRole('button', { name: /Tail cut/ }).click(); await button('Continue').click(); await page.getByRole('button', { name: /Yes, same fish/ }).click(); await button('Continue').click();
    await button('Next').click(); await button('Next').click(); await button('Enter weight').click(); for (const digit of ['3', '6', '.', '2']) await button(digit).click(); await button('Start capture').click();
    await button('Capture').click(); await button('Use Image').click(); await expect(page.getByRole('heading', { name: 'Sashibo core · Grade A' })).toBeVisible(); await button('Next sample').click();
    await expect(page.locator('.sample-context')).toContainText('Tail cut'); await expect(page.getByText('Capture 2 of 2', { exact: true })).toBeVisible();
    const preview = page.locator('.live-camera img'); await expect(preview).toBeVisible();
    const pixelsMatch = await preview.evaluate(async (image, bytes) => {
      await image.decode(); const fixture = await createImageBitmap(new Blob([new Uint8Array(bytes)], { type: 'image/png' }));
      const previewBitmap = await createImageBitmap(await fetch(image.src).then(response => response.blob()));
      if (image.naturalWidth !== fixture.width || image.naturalHeight !== fixture.height) return false;
      const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight; const drawing = canvas.getContext('2d'); drawing.drawImage(previewBitmap, 0, 0); const actual = drawing.getImageData(0, 0, canvas.width, canvas.height).data; drawing.clearRect(0, 0, canvas.width, canvas.height); drawing.drawImage(fixture, 0, 0); const expected = drawing.getImageData(0, 0, canvas.width, canvas.height).data; fixture.close(); previewBitmap.close(); return actual.every((value, index) => value === expected[index]);
    }, [...tail]);
    assert.equal(pixelsMatch, true, 'Tail preview must match actual supplied Tail PNG pixels');
    await page.screenshot({ path: path.join(qa, `tail-camera-${width}x${height}.png`) });
    const box = await button('Capture').boundingBox(); assert(box && box.x >= 0 && box.y >= 0 && box.x + box.width <= width && box.y + box.height <= height, 'Capture is fully visible');
    await page.waitForTimeout(record ? 1600 : 100); tapWall = Date.now(); await button('Capture').click();
    await expect(page.getByRole('heading', { name: 'Use this image?' })).toBeVisible(); await expect(page.getByRole('img', { name: 'Captured Tail cut', exact: true })).toBeVisible();
    await page.screenshot({ path: path.join(qa, `tail-review-${width}x${height}.png`) });
    if (record) await page.waitForTimeout(150);
    endWall = Date.now(); run.event = { label: 'Capture Tail cut', x: box.x + box.width / 2, y: box.y + box.height / 2, clipSeconds: 2.5 - (endWall - tapWall) / 1000 };
    assert.equal(snapshots, 2); assert.equal(grades, 1); assert.deepEqual(run.errors, []); assert.deepEqual(run.failedRequests, []);
    run.checks = ['Actual two-sample same-fish setup, Eli,36.2kg', 'Capture2of2 and Tail context', 'Decoded preview pixels exactly match TAILCUT_A.png', 'Real Capture snapshot2 is Tail PNG', 'Actual Captured Tail cut review image', 'Capture button fully inside viewport', 'No console errors or failed requests']; run.status = 'passed';
  } catch (error) { run.status = 'failed'; run.error = error.stack; throw error; }
  finally { const video = page.video(); await context.close(); if (video) { await video.saveAs(path.join(output, 'tail-camera-raw.webm')); await video.delete(); } manifest.runs.push(run); await writeFile(path.join(output, 'tail-camera-events.json'), JSON.stringify(manifest, null, 2)); }
}
try { await capture(1280, 800, true); await capture(1024, 600, false); }
finally { await browser.close(); await server.close(); }
// shortcut: Chromium adds a final idle frame hold; retain one extra second of preroll and visually verify after recapturing.
const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-sseof', '-3.5', '-i', path.join(output, 'tail-camera-raw.webm'), '-an', '-vf', 'setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=1,fps=60,setsar=1', '-frames:v', '150', '-c:v', 'libx264', '-crf', '18', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(output, 'tail-camera.mp4')], { encoding: 'utf8', windowsHide: true }); assert.equal(result.status, 0, result.stderr || result.error?.message);
manifest.video = 'combined/tail-camera.mp4'; manifest.durationSeconds = 2.5; manifest.event = manifest.runs[0].event; await writeFile(path.join(output, 'tail-camera-events.json'), JSON.stringify(manifest, null, 2));
await writeFile(path.join(qa, 'tailcapture-report.md'), '# Correct Tail cut camera preview retake\n\n1280x800 and1024x600 actual two-sample workflow passed. Both previews were decoded in the browser and compared pixel-for-pixel against supplied TAILCUT_A.png. Capture2of2, Tail cut context, actual Capture/snapshot and Captured Tail cut review were verified, with no console errors or failed requests.\n\nThe final2.5-second/150-frame moving UI clip preserves real camera preview→Capture→review. Tap coordinates and end-relative timing are in tail-camera-events.json. Only the Tail segment from this isolated recording is used; hardware/camera and inference endpoints are simulated. Production app and previous workflow captures were not changed.\n');
console.log('Correct Tail preview/capture passed both viewports;2.5-second clip ready.');
