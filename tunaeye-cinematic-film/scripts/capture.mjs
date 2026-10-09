import { chromium, expect } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(project, '..');
const output = path.join(project, 'public', 'captures');
const baseURL = process.env.TUNAEYE_CAPTURE_URL || 'http://127.0.0.1:3016';
const server = process.env.TUNAEYE_CAPTURE_URL ? null : await createServer({ root, configLoader: 'runner', define: { 'import.meta.env.VITE_SUPABASE_URL': '""', 'import.meta.env.VITE_SUPABASE_ANON_KEY': '""', 'import.meta.env.VITE_DEMO_MODE': '"false"' }, server: { host: '127.0.0.1', port: 3016, strictPort: true, hmr: false, watch: { ignored: ['**/tunaeye-product-demo/**', '**/tunaeye-cinematic-film/**', '**/test-results/**'] } } });
if (server) await server.listen();
await mkdir(output, { recursive: true });
const core = await readFile(path.join(root, 'public/DEMO_SAMPLES/SASHIBOCORE_A.png'));
const tail = await readFile(path.join(root, 'public/DEMO_SAMPLES/TAILCUT_A.png'));
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const report = { source: 'Actual repository kiosk UI; production code unchanged', camera: 'Real Capture button and /snapshot request; deterministic isolated PNG fixture, not physical camera footage', inference: 'Isolated Playwright intercepted /grade responses, not live Pi predictions', printing: 'Actual receipt animation; headless window.print intercepted and counted, no physical printing', runs: [] };
if (process.argv.includes('--verify-tablet-only')) report.runs = JSON.parse(await readFile(path.join(output, 'manifest.json'), 'utf8')).runs.filter(run => run.viewport.width === 1280);

async function capture(width, height, paced) {
  const directory = path.join(output, `${width}x${height}`);
  await mkdir(directory, { recursive: true });
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, ...(paced ? { recordVideo: { dir: output, size: { width, height } } } : {}) });
  const run = { viewport: { width, height }, segments: [], events: [], screenshots: [], consoleErrors: [], consoleWarnings: [], failedRequests: [], abortedLocalResources: [], unexpectedExternalRequests: [], checks: [] };
  let inferenceIndex = 0;
  let captureIndex = 0;
  await context.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === new URL(baseURL).origin) return route.continue();
    if (url.pathname === '/grade') {
      const sample = request.postData().includes('tailcut') ? 'tailcut' : 'sashibocore';
      inferenceIndex += 1;
      await new Promise(resolve => setTimeout(resolve, paced ? 2100 : 500));
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ id: `demonstration-grade-${inferenceIndex}`, capture_id: `demonstration-capture-${inferenceIndex}`, image_type: sample, grade: 'GRADE_A', confidence: sample === 'tailcut' ? .941 : .963, scores: { GRADE_A: sample === 'tailcut' ? .941 : .963, GRADE_B: .02, GRADE_C: .01, INVALID: .007 } }) });
    }
    if (url.pathname === '/snapshot') { captureIndex += 1; return route.fulfill({ contentType: 'image/png', body: captureIndex === 1 ? core : tail }); }
    if (url.pathname === '/stream') return route.fulfill({ contentType: 'image/png', body: inferenceIndex ? tail : core });
    if (url.pathname === '/status') return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ status: 'ok', service: 'isolated-demonstration-fixture' }) });
    run.unexpectedExternalRequests.push(request.url());
    return route.fulfill({ status: 503, body: 'External service excluded from isolated recording.' });
  });
  await context.addInitScript(() => {
    if (localStorage.getItem('tunaeye-recording-initialized') === 'true') return;
    localStorage.clear();
    localStorage.setItem('tunaeye-recording-initialized', 'true');
    localStorage.setItem('tunaeye-installed', 'true');
    localStorage.setItem('tunaeye-grader-name', '');
    localStorage.setItem('tunaeye-rpi-url', 'http://10.42.0.1:5000');
    localStorage.setItem('tunaeye-camera-url', 'http://10.42.0.1:8080');
    window.__demoPrintCalls = 0;
    window.print = () => { window.__demoPrintCalls += 1; };
  });
  const recordingEpoch = Date.now();
  const page = await context.newPage();
  page.on('console', message => {
    if (message.type() === 'error') run.consoleErrors.push(message.text());
    if (message.type() === 'warning') run.consoleWarnings.push(message.text());
  });
  page.on('pageerror', error => run.consoleErrors.push(error.message));
  page.on('requestfailed', request => {
    const detail = `${request.method()} ${request.url()} ${request.failure()?.errorText}`;
    // Object URLs are revoked when leaving grading; canceled local image loads are not network failures.
    if (request.url().startsWith('blob:') && request.failure()?.errorText === 'net::ERR_ABORTED') run.abortedLocalResources.push(detail);
    else run.failedRequests.push(detail);
  });
  const elapsed = () => Date.now() - recordingEpoch;
  const pause = ms => page.waitForTimeout(paced ? ms : 70);
  async function shot(name) {
    await page.waitForTimeout(180);
    const relative = `${width}x${height}/${name}.png`;
    await page.screenshot({ path: path.join(output, relative) });
    const layout = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, brokenImages: Array.from(document.images).filter(image => image.complete && !image.naturalWidth).map(image => image.src) }));
    assert.equal(layout.overflow, false, `${name}: horizontal overflow`);
    assert.deepEqual(layout.brokenImages, [], `${name}: broken images`);
    run.screenshots.push({ name, file: `captures/${relative}`, rawMs: elapsed(), route: new URL(page.url()).pathname });
  }
  async function tap(locator, name) {
    await expect(locator).toBeInViewport();
    const box = await locator.boundingBox();
    assert(box && box.x >= -1 && box.y >= -1 && box.x + box.width <= width + 1 && box.y + box.height <= height + 1, `${name}: control clipped`);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: paced ? 12 : 1 });
    run.events.push({ type: 'tap', label: name, rawMs: elapsed(), x: box.x + box.width / 2, y: box.y + box.height / 2 });
    await locator.click();
  }
  const button = (name, exact = true) => page.getByRole('button', { name, exact });
  async function segment(id, seconds, action) {
    const rawStartMs = elapsed();
    console.log(`${width}x${height}: scene ${id}`);
    await action();
    if (paced) await page.waitForTimeout(Math.max(0, seconds * 1000 - (elapsed() - rawStartMs)));
    run.segments.push({ id, targetDurationSeconds: seconds, rawStartMs, rawEndMs: elapsed() });
  }
  try {
    await page.goto(`${baseURL}/kiosk/`);
    await expect(button('Get started')).toBeVisible();
    await page.waitForTimeout(500);
    run.videoLeadMs = elapsed();
    await segment(1, 6, async () => {
      await shot('01-welcome'); await pause(3000);
      await tap(button('Get started'), 'Get started');
      await expect(button(/Expert Grader/, false)).toBeVisible();
    });
    await segment(2, 6, async () => {
      await shot('02-role'); await pause(600);
      await tap(button(/Expert Grader/, false), 'Expert Grader');
      await page.getByLabel('Your name').fill('');
      await page.getByLabel('Your name').pressSequentially('Eli', { delay: paced ? 180 : 1 });
      run.events.push({ type: 'typing', label: 'Eli', rawMs: elapsed() });
      await shot('03-grader-eli'); await pause(500);
      await tap(button('Start grading'), 'Start grading');
    });
    await segment(3, 8, async () => {
      await expect(button(/Sashibo core/, false)).toHaveClass(/is-selected/);
      await pause(1000); await tap(button(/Tail cut/, false), 'Select Tail cut');
      await expect(button(/Tail cut/, false)).toHaveClass(/is-selected/);
      await shot('04-both-samples'); await pause(700);
      await tap(button('Continue'), 'Sample Continue');
      await expect(page.getByRole('heading', { name: 'Same fish?' })).toBeVisible();
      await pause(600); await tap(button(/Yes, same fish/, false), 'Same fish');
      await shot('05-same-fish'); await pause(600);
      await tap(button('Continue'), 'Association Continue');
    });
    await segment(4, 7, async () => {
      await shot('06-placement-guide');
      await tap(button('Next'), 'Tutorial Next 1'); await pause(300);
      await tap(button('Next'), 'Tutorial Next 2'); await pause(300);
      await tap(button('Enter weight'), 'Enter weight');
      await expect(page.getByRole('heading', { name: 'Fish weight' })).toBeVisible();
      for (const digit of ['3', '6', '.', '2']) { await tap(button(digit), `Weight ${digit}`); await pause(150); }
      await expect(page.locator('.weight-input input')).toHaveValue('36.2');
      await shot('07-weight-36-2');
      await tap(button('Start capture'), 'Start capture');
    });
    await segment(5, 11, async () => {
      await expect(button('Upload image')).toBeVisible();
      await shot('08-sashibo-camera'); await pause(2300);
      await tap(button('Capture'), 'Capture sashibo core');
      await expect(page.getByRole('heading', { name: 'Use this image?' })).toBeVisible();
      await shot('09-sashibo-review');
    });
    await segment(6, 8, async () => {
      await tap(button('Use Image'), 'Sashibo Use Image');
      await expect(page.getByRole('heading', { name: 'Reading sashibo core' })).toBeVisible();
      await shot('10-sashibo-analysis');
      await expect(page.getByRole('heading', { name: 'Sashibo core · Grade A' })).toBeVisible();
      await expect(page.locator('.confidence')).toContainText('96.3%');
      await shot('11-sashibo-result');
    });
    await segment(7, 11, async () => {
      await tap(button('Next sample'), 'Next sample');
      await expect(page.locator('.sample-context')).toContainText('Tail cut');
      await shot('12-tail-camera'); await pause(900);
      await tap(button('Capture'), 'Capture tail cut');
      await expect(page.getByRole('heading', { name: 'Use this image?' })).toBeVisible();
      await shot('13-tail-review'); await pause(500);
      await tap(button('Use Image'), 'Tail Use Image');
      await expect(page.getByRole('heading', { name: 'Reading tail cut' })).toBeVisible();
      await shot('14-tail-analysis');
      await expect(page.getByRole('heading', { name: 'Tail cut · Grade A' })).toBeVisible();
      await expect(page.locator('.confidence')).toContainText('94.1%');
      await shot('15-tail-result');
    });
    await segment(8, 10, async () => {
      await tap(button('Manual override'), 'Manual override');
      const dialog = page.getByRole('dialog', { name: 'Manual override' });
      await shot('16-override-pin');
      for (const digit of ['1', '2', '3', '4']) await tap(dialog.getByRole('button', { name: digit, exact: true }), `PIN ${digit}`);
      await tap(dialog.getByRole('button', { name: 'Unlock override' }), 'Unlock override');
      await tap(dialog.getByRole('button', { name: 'Grade B', exact: true }), 'Expert Grade B');
      await dialog.getByLabel('Reason').pressSequentially('Texture reviewed by Eli.', { delay: paced ? 30 : 1 });
      await shot('17-override-grade-reason');
      await tap(dialog.getByRole('button', { name: 'Save override' }), 'Save override');
      await expect(page.getByRole('heading', { name: 'Tail cut · Grade B' })).toBeVisible();
      await shot('18-tail-expert-result');
      await tap(button('View results overview'), 'View results overview');
      await expect(page.locator('.overview-card')).toHaveCount(2);
      await shot('19-overview');
    });
    await segment(9, 10, async () => {
      await tap(button('Print separate copies'), 'Print separate copies');
      await expect(page.locator('.receipt-container-v2')).toBeVisible();
      await pause(900); await shot('20-receipt-core');
      await tap(button('Print Sashibo core'), 'Print Sashibo core');
      await pause(450); await shot('21-receipt-print-animation');
      await expect(button('Print Tail cut')).toBeVisible();
      await pause(400); await tap(button('Print Tail cut'), 'Print Tail cut');
      await expect(page.getByRole('heading', { name: 'Results printed.' })).toBeVisible();
      await shot('22-complete');
      assert.equal(await page.evaluate(() => window.__demoPrintCalls), 2);
    });
    await segment(10, 8, async () => {
      await tap(button('Dashboard'), 'Dashboard');
      await expect(page.getByRole('heading', { name: 'Welcome back, Eli.' })).toBeVisible();
      await expect(page.locator('.grader-record-item')).toHaveCount(2);
      await shot('23-dashboard-records'); await pause(1200);
      const tailRecord = page.locator('.grader-record-item').filter({ hasText: 'Tail cut' });
      await tap(tailRecord, 'Open Tail cut record');
      await expect(page.getByRole('dialog')).toContainText('Texture reviewed by Eli.');
      await shot('24-record-detail');
    });
    await expect(page.getByRole('dialog')).toContainText('Texture reviewed by Eli.');
    const records = await page.evaluate(() => JSON.parse(localStorage.getItem('tunaeye-records')));
    assert.equal(records.length, 2);
    assert(records.every(record => record.grader === 'Eli' && record.weight === '36.2 kg' && record.fish === 'Fish 1' && record.transaction.syncState === 'pending'));
    assert.equal(records.find(record => record.sample === 'Tail cut').grade, 'B');
    assert.equal(records.find(record => record.sample === 'Tail cut').result.originalGrade, 'A');
    assert.equal(inferenceIndex, 2);
    assert.equal(captureIndex, 2);
    assert.deepEqual(run.consoleErrors, []);
    assert.deepEqual(run.failedRequests, []);
    assert.deepEqual(run.unexpectedExternalRequests, []);
    run.checks = ['Ordered real kiosk workflow', 'Both samples selected', 'Same Fish 1 association', 'Three placement tutorial pages', '36.2 kg manual weight before camera', 'Real Capture button, two intercepted /snapshot requests and image review', 'Two intercepted /grade requests', 'Individual 96.3% and 94.1% Grade A results', 'PIN-protected tail Grade B expert override with preserved Grade A prediction', 'Two-sample overview', 'Two real receipt animations and intercepted browser print calls', 'Complete screen', 'Eli dashboard with 1 session and 2 local pending records', 'Record detail preserves evidence and override reason', 'No horizontal overflow or broken images on captured screens', 'Every clicked control fully in viewport', 'No console errors or failed requests'];
    run.status = 'passed';
  } catch (error) {
    run.status = 'failed'; run.error = error.stack;
    await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {});
    throw error;
  } finally {
    const video = page.video();
    await context.close();
    if (video) { await video.saveAs(path.join(output, 'raw-workflow.webm')); await video.delete(); run.video = 'captures/raw-workflow.webm'; }
    report.runs.push(run);
    await writeFile(path.join(output, 'manifest.json'), JSON.stringify(report, null, 2));
  }
}

try { if (!process.argv.includes('--verify-tablet-only')) await capture(1280, 800, !process.argv.includes('--verify-only')); await capture(1024, 600, false); }
finally { await browser.close(); if (server) await server.close(); }
await writeFile(path.join(output, 'capture-report.md'), `# TunaEye real UI capture verification\n\n${report.runs.map(run => `- ${run.viewport.width}×${run.viewport.height}: ${run.status}; ${run.screenshots.length} screen captures; ${run.consoleErrors.length} console errors; ${run.failedRequests.length} failed network requests.`).join('\n')}\n\nThe ordered welcome, role, Eli entry, both samples, same fish, guide, weight, Capture/snapshot/review, individual results, override, overview, receipt, complete, dashboard and record-detail flow passed.\n\nInference responses, snapshot images and camera preview are deterministic isolated Playwright fixtures. Results must be labeled demonstration data in the video. Physical Raspberry Pi inference/camera, printer, scale and cloud sync were not tested. The app's real receipt animation ran; headless browser print calls were intercepted, so no physical receipt or OS print dialog is claimed.\n\nProduction application source was not changed. The existing real UI contains peso values and averaged confidence on overview; the video must not claim automated transaction pricing or grade fusion.\n`);
console.log('Capture and responsive verification passed.');
