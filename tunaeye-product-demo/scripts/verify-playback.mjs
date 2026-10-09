import {chromium} from '@playwright/test';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {writeFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const browser = await chromium.launch({channel: 'chrome', headless: true});
const page = await browser.newPage({viewport: {width: 1920, height: 1080}});
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => {if (message.type() === 'error') errors.push(message.text());});
try {
  await page.goto(pathToFileURL(path.join(root, 'tunaeye-kiosk-demo.mp4')).href);
  await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2);
  const media = await page.evaluate(() => {
    const video = document.querySelector('video');
    video.pause();
    return {duration: video.duration, width: video.videoWidth, height: video.videoHeight, error: video.error?.message};
  });
  assert.equal(media.duration, 90);
  assert.equal(media.width, 1920);
  assert.equal(media.height, 1080);
  assert.equal(media.error, undefined);
  for (const seconds of [3, 9, 16, 24, 33, 42, 53, 61, 72, 81, 88]) {
    await page.evaluate(seconds => new Promise(resolve => {
      const video = document.querySelector('video');
      video.addEventListener('seeked', resolve, {once: true});
      video.currentTime = seconds;
    }), seconds);
    const state = await page.evaluate(() => {const video = document.querySelector('video'); return {time: video.currentTime, ready: video.readyState, error: video.error?.message};});
    assert(Math.abs(state.time - seconds) < 0.03);
    assert(state.ready >= 2);
    assert.equal(state.error, undefined);
  }
  await page.screenshot({path: path.join(root, 'qa/browser-playback.png')});
  assert.deepEqual(errors, []);
  await writeFile(path.join(root, 'qa/playback-verification.json'), JSON.stringify({passed: true, browser: 'Google Chrome through Playwright', ...media, checkedSeconds: [3, 9, 16, 24, 33, 42, 53, 61, 72, 81, 88], consoleErrors: errors}, null, 2));
  console.log('Final MP4 browser playback/seek passed across all eleven scenes.');
} finally {await browser.close();}
