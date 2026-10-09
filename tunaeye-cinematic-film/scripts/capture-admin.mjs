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
await mkdir(output, { recursive: true });
await mkdir(qa, { recursive: true });
const images = { core: await readFile(path.join(root, 'public/DEMO_SAMPLES/SASHIBOCORE_A.png')), tail: await readFile(path.join(root, 'public/DEMO_SAMPLES/TAILCUT_A.png')) };
const baseURL = 'http://127.0.0.1:3017';
const server = await createServer({ root, configLoader: 'runner', define: { 'import.meta.env.VITE_SUPABASE_URL': '"http://supabase.test"', 'import.meta.env.VITE_SUPABASE_ANON_KEY': '"isolated-demonstration-anon-key"', 'import.meta.env.VITE_DEMO_MODE': '"false"' }, server: { host: '127.0.0.1', port: 3017, strictPort: true, hmr: false, watch: { ignored: ['**/tunaeye-product-demo/**', '**/tunaeye-cinematic-film/**', '**/test-results/**'] } } });
await server.listen();
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const report = { label: 'DEMO CLOUD · SIMULATED SYNC', source: 'Current authentic repository Admin UI; production code unchanged', boundary: 'Isolated Playwright cloud, DNS and auth fixtures; no live cloud/hardware interaction', runs: [] };

async function capture(width, height, paced) {
  const directory = path.join(output, `admin-${width}x${height}`);
  await mkdir(directory, { recursive: true });
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, ...(paced ? { recordVideo: { dir: output, size: { width, height } } } : {}) });
  let internet = false;
  let cloudRow = null;
  let signupCount = 0;
  let upserts = 0;
  let uploads = 0;
  let rowReadbacks = 0;
  let imageReadbacks = 0;
  const run = { viewport: { width, height }, events: [], screenshots: [], consoleErrors: [], intentionalOfflineConsole: [], existingImageDisplayIssues: [], failures: [], intentionalOfflineFailures: [], unexpectedRequests: [], cloudCalls: [], status: 'running' };
  await context.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === baseURL) return route.continue();
    if (url.origin !== 'http://supabase.test') { run.unexpectedRequests.push(request.url()); return route.fulfill({ status: 503, body: 'External service excluded from isolated demonstration.' }); }
    run.cloudCalls.push({ method: request.method(), path: url.pathname, internet });
    if (url.pathname === '/auth/v1/health') return internet ? route.fulfill({ contentType: 'application/json', body: '{"name":"GoTrue"}' }) : route.abort('namenotresolved');
    assert(internet, 'Cloud writes must not occur while internet unavailable');
    if (url.pathname === '/auth/v1/signup') {
      signupCount += 1;
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ access_token: 'test-token', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'test-refresh', user: { id: '11111111-1111-4111-8111-111111111111', aud: 'authenticated', role: 'authenticated', email: '', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() } }) });
    }
    if (url.pathname.startsWith('/storage/v1/object/grading-images/')) {
      if (request.method() === 'GET') { imageReadbacks += 1; return route.fulfill({ contentType: 'image/png', body: images.tail }); }
      uploads += 1;
      if (paced) await new Promise(resolve => setTimeout(resolve, 400));
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ Key: url.pathname }) });
    }
    if (url.pathname === '/rest/v1/grading_records') {
      if (request.method() === 'POST') { upserts += 1; const payload = request.postDataJSON(); cloudRow = Array.isArray(payload) ? payload[0] : payload; return route.fulfill({ status: 201, contentType: 'application/json', body: '[]' }); }
      rowReadbacks += 1;
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify(url.searchParams.get('select') === '*' ? (cloudRow ? [cloudRow] : []) : cloudRow) });
    }
    if (url.pathname === '/rest/v1/profiles') return route.fulfill({ contentType: 'application/json', body: '{"role":"admin"}' });
    run.unexpectedRequests.push(request.url());
    return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
  });
  await context.addInitScript(({ core, tail }) => {
    if (localStorage.getItem('admin-film-initialized')) return;
    localStorage.clear();
    localStorage.setItem('admin-film-initialized', 'true');
    localStorage.setItem('tunaeye-installed', 'true');
    localStorage.setItem('tunaeye-grader-name', 'Eli');
    localStorage.setItem('tunaeye-graders', JSON.stringify(['Eli', 'Maria Santos']));
    const now = Date.now();
    const record = (id, sample, grade, confidence, syncState) => ({ id, sessionId: 'demo-eli-session', timestamp: now, time: 'Today · Eli', grader: 'Eli', sample, fish: 'Fish 1', weight: '36.2 kg', grade, status: grade === 'B' ? 'Override' : 'Complete', capturedImageId: id, result: { status: 'valid', originalGrade: 'A', originalConfidence: confidence, rawConfidence: confidence / 100, overrideGrade: grade === 'B' ? 'B' : null, overrideReason: grade === 'B' ? 'Texture reviewed by Eli.' : '', overrideActor: grade === 'B' ? 'Eli' : null, overrideAt: grade === 'B' ? new Date(now).toISOString() : null, inferenceId: `inference-${id}`, captureId: `capture-${id}`, scores: { GRADE_A: confidence / 100, GRADE_B: .02, GRADE_C: .01, INVALID: .007 }, imageType: sample === 'Tail cut' ? 'tailcut' : 'sashibocore', modelSource: 'raspberry-pi' }, transaction: { currency: 'PHP', unitRatePerKg: grade === 'B' ? 350 : 420, amount: grade === 'B' ? 12670 : 15204, syncState } });
    localStorage.setItem('tunaeye-records', JSON.stringify([record('TE-ELI-SASHIBO', 'Sashibo core', 'A', 96.3, 'synced'), record('TE-ELI-TAIL', 'Tail cut', 'B', 94.1, 'pending')]));
    window.__adminFilmReady = new Promise((resolve, reject) => {
      const request = indexedDB.open('tunaeye-offline', 1);
      request.onupgradeneeded = () => { const store = request.result.createObjectStore('evidence', { keyPath: 'id' }); store.createIndex('syncState', 'syncState'); store.createIndex('sessionId', 'sessionId'); };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const database = request.result;
        const transaction = database.transaction('evidence', 'readwrite');
        const put = (id, sample, bytes, syncState) => transaction.objectStore('evidence').put({ id, sessionId: 'demo-eli-session', sample, fishId: 'Fish 1', capturedAt: now, mimeType: 'image/png', blob: new Blob([new Uint8Array(bytes)], { type: 'image/png' }), syncState });
        put('TE-ELI-SASHIBO', 'Sashibo core', core, 'synced'); put('TE-ELI-TAIL', 'Tail cut', tail, 'pending');
        transaction.oncomplete = () => { database.close(); resolve(true); };
      };
    });
  }, { core: [...images.core], tail: [...images.tail] });
  const page = await context.newPage();
  const epoch = Date.now();
  page.on('console', message => { if (message.type() === 'error') (message.text().includes('ERR_NAME_NOT_RESOLVED') ? run.intentionalOfflineConsole : message.text().includes('ERR_FILE_NOT_FOUND') ? run.existingImageDisplayIssues : run.consoleErrors).push(message.text()); });
  page.on('pageerror', error => run.consoleErrors.push(error.message));
  page.on('requestfailed', request => (request.url() === 'http://supabase.test/auth/v1/health' && request.failure()?.errorText.includes('ERR_NAME_NOT_RESOLVED') ? run.intentionalOfflineFailures : request.url().startsWith('blob:') && request.failure()?.errorText.includes('ERR_FILE_NOT_FOUND') ? run.existingImageDisplayIssues : run.failures).push(`${request.url()} ${request.failure()?.errorText}`));
  const elapsed = () => (Date.now() - epoch) / 1000;
  const pause = seconds => page.waitForTimeout(paced ? seconds * 1000 : 100);
  const button = name => page.getByRole('button', { name, exact: true });
  async function tap(locator, label) {
    await expect(locator).toBeInViewport();
    const box = await locator.boundingBox();
    assert(box && box.x >= -1 && box.y >= -1 && box.x + box.width <= width + 1 && box.y + box.height <= height + 1, `${label} clipped`);
    run.events.push({ label, type: 'tap', rawSeconds: elapsed(), x: box.x + box.width / 2, y: box.y + box.height / 2 });
    await locator.click();
  }
  async function shot(name) {
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(directory, `${name}.png`) });
    const layout = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, broken: [...document.images].filter(image => image.complete && !image.naturalWidth).map(image => image.src) }));
    assert.equal(layout.overflow, false, `${name} overflow`);
    if (['06-sync-success', '07-synced-records'].includes(name) && layout.broken.every(url => url.startsWith('blob:'))) run.existingImageDisplayIssues.push(...layout.broken.map(url => `${name}: retained revoked URL ${url}`));
    else assert.deepEqual(layout.broken, [], `${name} broken images`);
    run.screenshots.push({ name, file: `combined/admin-${width}x${height}/${name}.png`, rawSeconds: elapsed() });
  }
  try {
    await page.goto(`${baseURL}/admin`);
    await page.evaluate(() => window.__adminFilmReady);
    await expect(page.getByRole('heading', { name: 'Enter your admin PIN' })).toBeVisible();
    await shot('01-admin-login');
    for (const [index, digit] of ['1', '2', '3', '4'].entries()) { await page.getByLabel(`PIN digit ${index + 1}`).fill(digit); await pause(.12); }
    await tap(button('Verify and continue'), 'Admin login');
    await expect(page.getByRole('heading', { name: 'Good day, Admin.' })).toBeVisible();
    await pause(1); await shot('02-admin-overview'); await pause(1.3);
    assert.equal(upserts, 0);
    await tap(button('Records'), 'Records');
    await expect(page.locator('.grader-record-item')).toHaveCount(1);
    await pause(1); await shot('03-records-before-sync'); await pause(1.3);
    await tap(button('Audit logs'), 'Open audit logs before sync');
    await tap(button('Sync now'), 'Sync offline');
    await expect(page.getByRole('heading', { name: 'Waiting for internet' })).toBeVisible();
    await pause(1); await shot('04-waiting-for-internet'); await pause(1.3);
    assert.equal(upserts, 0); assert.equal(uploads, 0);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('tunaeye-records')).find(item => item.id === 'TE-ELI-TAIL').transaction.syncState), 'pending');
    await tap(button('Understood'), 'Close waiting notice');
    internet = true;
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await expect(page.getByText('Internet is back', { exact: true })).toBeVisible();
    await pause(1); await shot('05-confirmed-recovery'); await pause(1.3);
    assert.equal(upserts, 0); assert.equal(uploads, 0);
    await tap(button('Dismiss internet message'), 'Dismiss recovery');
    await tap(button('Sync now'), 'Explicit Sync now');
    await expect(page.getByRole('heading', { name: 'Sync complete', exact: true })).toBeVisible();
    await pause(1); await shot('06-sync-success'); await pause(1.3);
    assert.equal(upserts, 1); assert.equal(uploads, 1); assert.equal(signupCount, 1); assert(rowReadbacks >= 2); assert.equal(imageReadbacks, 1);
    await tap(button('Understood'), 'Close sync success');
    await tap(button('Records'), 'Reopen synced Records');
    await expect(page.locator('.grader-record-item').filter({ hasText: 'TE-ELI-TAIL' })).toBeVisible();
    await expect(page.locator('.image-sync-label')).toHaveText(['Synced']);
    await shot('07-synced-records');
    await tap(page.locator('.grader-record-item').filter({ hasText: 'TE-ELI-TAIL' }), 'Open synced Tail record');
    await expect(page.getByRole('dialog').locator('.image-sync-label')).toHaveText('Synced');
    await expect(page.getByRole('dialog')).toContainText('Texture reviewed by Eli.');
    await pause(1); await shot('08-admin-synced-detail');
    // Current cloud-row mapping omits local evidence IDs; use the actual local record view for image proof.
    await tap(button('Close record'), 'Close admin detail');
    await tap(button('Start grading'), 'Open local grader dashboard');
    await expect(page.getByRole('heading', { name: 'Welcome back, Eli.' })).toBeVisible();
    await tap(page.locator('.grader-record-item').filter({ hasText: 'Tail cut' }), 'Open synced local evidence');
    await expect(page.getByRole('dialog').locator('.image-sync-label')).toHaveText('Synced');
    await expect(page.getByRole('dialog').getByRole('img', { name: 'Captured Tail cut' })).toBeVisible();
    await pause(1); await shot('09-synced-evidence-detail'); await pause(1.3);
    const evidenceState = await page.evaluate(async () => new Promise(resolve => { const open = indexedDB.open('tunaeye-offline', 1); open.onsuccess = () => { const get = open.result.transaction('evidence').objectStore('evidence').get('TE-ELI-TAIL'); get.onsuccess = () => { open.result.close(); resolve(get.result.syncState); }; }; }));
    assert.equal(evidenceState, 'synced');
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('tunaeye-records')).find(item => item.id === 'TE-ELI-TAIL').transaction.syncState), 'synced');
    assert.deepEqual(run.consoleErrors, []); assert.deepEqual(run.failures, []); assert.deepEqual(run.unexpectedRequests, []); assert.deepEqual(run.existingImageDisplayIssues, []);
    run.checks = ['Actual local PIN admin login', 'Overview and records', 'Pending record remains local during DNS outage', 'Waiting for internet notice', 'Recovery only after successful cloud health probe', 'No writes on internet recovery', 'Explicit manual Sync now', 'One upload and stable-ID upsert', 'Complete row readback before synced state', 'Byte-identical image readback before synced state', 'Real Synced image/record labels', 'IndexedDB evidence state verified synced', 'Tail override and original model preserved', 'No unexpected console errors or failed requests', 'No broken images/horizontal overflow', 'Every tapped control fully in viewport'];
    run.status = 'passed'; run.counters = { signupCount, upserts, uploads, rowReadbacks, imageReadbacks };
  } catch (error) { run.status = 'failed'; run.error = error.stack; await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {}); throw error; }
  finally {
    const video = page.video(); await context.close();
    if (video) { await video.saveAs(path.join(output, 'admin-raw.webm')); await video.delete(); run.video = 'combined/admin-raw.webm'; }
    report.runs.push(run); await writeFile(path.join(output, 'admin-manifest.json'), JSON.stringify(report, null, 2));
  }
}
try { if (process.argv.includes('--clips-only')) report.runs = JSON.parse(await readFile(path.join(output, 'admin-manifest.json'), 'utf8')).runs; else { await capture(1280, 800, true); await capture(1024, 600, false); } }
finally { await browser.close(); await server.close(); }

const run = report.runs[0];
const tapTime = label => { const found = run.events.find(item => item.label === label); assert(found, label); return found.rawSeconds; };
const shotTime = name => { const found = run.screenshots.find(item => item.name === name); assert(found, name); return found.rawSeconds; };
const chapters = [['01-login', tapTime('Admin login') - .8], ['02-overview', shotTime('02-admin-overview') - .9], ['03-records', tapTime('Records') - .4], ['04-offline-waiting', tapTime('Sync offline') - .35], ['05-recovery', shotTime('05-confirmed-recovery') - .8], ['06-explicit-sync', tapTime('Explicit Sync now') - .35], ['07-synced-evidence', tapTime('Open synced local evidence') - .35]];
const clips = [];
// shortcut: browser recording begins after the wall-clock epoch; visually recalibrate this offset after recapturing.
const videoClockOffsetSeconds = 1.2;
function ffmpeg(args) { const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { encoding: 'utf8', windowsHide: true }); assert.equal(result.status, 0, result.stderr || result.error?.message); }
for (const [index, [name, start]] of chapters.entries()) {
  const filename = `admin-${name}.mp4`;
  ffmpeg(['-ss', String(Math.max(0, start - videoClockOffsetSeconds)), '-i', path.join(output, 'admin-raw.webm'), '-an', '-vf', 'setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=3,fps=60,setsar=1', '-frames:v', '120', '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(output, filename)]);
  clips.push({ name, file: `combined/${filename}`, sourceStartSeconds: start - videoClockOffsetSeconds, wallStartSeconds: start, videoClockOffsetSeconds, durationSeconds: 2, montageStartSeconds: index * 2, events: run.events.filter(item => item.rawSeconds >= start && item.rawSeconds < start + 2).map(item => ({ ...item, clipSeconds: item.rawSeconds - start, montageSeconds: index * 2 + item.rawSeconds - start })) });
}
await writeFile(path.join(output, 'admin-concat.txt'), clips.map(item => `file '${path.basename(item.file)}'`).join('\n'));
ffmpeg(['-f', 'concat', '-safe', '0', '-i', path.join(output, 'admin-concat.txt'), '-c', 'copy', '-movflags', '+faststart', path.join(output, 'hero-admin.mp4')]);
await writeFile(path.join(output, 'admin-clips.json'), JSON.stringify({ label: report.label, durationSeconds: 14, video: 'combined/hero-admin.mp4', clips }, null, 2));
await writeFile(path.join(qa, 'combined-admin-image-limit.md'), '# Existing Admin image display limitation\n\nThe authentic post-sync Admin detail reports captured image unavailable. `fetchCloudRecords` maps the remote image path but omits a local capturedImageId (`src/cloudSync.ts:189`); `AdminRecords` requires capturedImageId or a legacy capturedImage source before rendering StoredEvidenceImage (`src/App.tsx:455`). The cloud upload and byte-identical image readback still pass, and the local IndexedDB evidence retains its ID and Synced state.\n\nProduction code was preserved. The final two-second film clip opens the real Grader dashboard local Tail cut record and displays its actual captured image with Synced label, original Grade A confidence and expert Grade B override. The film must not imply the Admin cloud detail displays the uploaded image.\n');
await writeFile(path.join(qa, 'combined-admin-report.md'), `# Authentic Admin + simulated manual sync\n\n${report.runs.map(item => `- ${item.viewport.width}x${item.viewport.height}: ${item.status}; ${item.screenshots.length} screenshots; ${item.consoleErrors.length} unexpected console errors; ${item.failures.length} unexpected failed requests.`).join('\n')}\n\nActual local PIN login, admin overview/records, offline waiting, confirmed health-probe recovery, explicit manual sync, one image upload, one stable-ID upsert, full row and byte-identical image readback, then verified synced metadata and IndexedDB image state passed. No write occurred at startup, during offline waiting, or on internet recovery. The previous model result and expert override were preserved.\n\nSeven moving UI clips compose the exact 14-second / 840-frame hero-admin.mp4. Tap times/positions are in admin-clips.json; full endpoint counters and checkpoints are in admin-manifest.json.\n\nRequired onscreen label: DEMO CLOUD · SIMULATED SYNC. Cloud/auth/DNS responses are isolated Playwright fixtures. Expected DNS failures are recorded separately; no live Supabase, Pi, physical camera, printer or scale was accessed. Production source and previous demo were not edited.\n`);
console.log('Admin offline/recovery/manual sync verification passed at both viewports; exact 14-second footage created.');
