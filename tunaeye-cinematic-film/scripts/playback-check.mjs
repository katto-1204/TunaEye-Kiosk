import assert from 'node:assert/strict';
import {createReadStream} from 'node:fs';
import {mkdir, stat, writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exports = [
  {file:'tunaeye-cinematic-product-film.mp4',width:1920,height:1080},
  {file:'tunaeye-cinematic-product-film-no-narration.mp4',width:1920,height:1080},
  {file:'tunaeye-preview.mp4',width:1280,height:720},
];
const samples = [3,8,25.75,49,70,74,82,88,100,106.5,108.5,111,112.5,114.5,117,119.5];
const parseRange = (header, size) => {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2])) return null;
  const start = match[1] ? Number(match[1]) : Math.max(0,size-Number(match[2]));
  const end = match[1] && match[2] ? Math.min(size-1,Number(match[2])) : size-1;
  return Number.isSafeInteger(start) && Number.isSafeInteger(end) && start <= end && start < size ? {start,end} : null;
};
if (process.argv.includes('--self-check')) {
  assert.deepEqual(parseRange('bytes=0-99',1000),{start:0,end:99});
  assert.deepEqual(parseRange('bytes=900-',1000),{start:900,end:999});
  assert.deepEqual(parseRange('bytes=-100',1000),{start:900,end:999});
  assert.deepEqual(parseRange('bytes=900-2000',1000),{start:900,end:999});
  assert.equal(parseRange('bytes=1000-',1000),null);
  assert.equal(parseRange('bytes=200-100',1000),null);
  assert.equal(parseRange('bytes=-',1000),null);
  assert.equal(parseRange('bytes=0-10,20-30',1000),null);
  console.log('Playback server range self-check passed. No media files inspected.');
  process.exit(0);
}

await mkdir(path.join(root,'qa/playback'),{recursive:true});
const report = {checkedAt:new Date().toISOString(),passed:false,status:'pending',method:'Isolated headless Chrome HTML video playback through a localhost HTTP byte-range server; real final MP4 files, no mocked media',files:[]};
const allowed = new Set(exports.map(item=>`/${item.file}`));
const server = createServer(async (request,response) => {
  const pathname = new URL(request.url,'http://localhost').pathname;
  if (pathname === '/') {
    response.writeHead(200,{'Content-Type':'text/html'});
    response.end('<!doctype html><html><head><title>TunaEye export playback verification</title><link rel="icon" href="data:,"><style>html,body{margin:0;background:#071331}video{display:block;width:100vw;height:100vh;object-fit:contain}</style></head><body><video preload="auto" playsinline></video></body></html>');
    return;
  }
  if (!allowed.has(pathname)) {response.writeHead(404);response.end();return;}
  try {
    const filename=path.join(root,pathname.slice(1));
    const info=await stat(filename);
    const range=request.headers.range ? parseRange(request.headers.range,info.size) : {start:0,end:info.size-1};
    if (!range) {response.writeHead(416,{'Content-Range':`bytes */${info.size}`});response.end();return;}
    response.writeHead(request.headers.range?206:200,{'Content-Type':'video/mp4','Accept-Ranges':'bytes','Content-Length':range.end-range.start+1,...(request.headers.range?{'Content-Range':`bytes ${range.start}-${range.end}/${info.size}`}:{})});
    if (request.method==='HEAD') {response.end();return;}
    const stream=createReadStream(filename,range);
    stream.on('error',()=>response.destroy());
    response.on('close',()=>stream.destroy());
    stream.pipe(response);
  } catch {response.writeHead(404);response.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser=await chromium.launch({headless:true,channel:'chrome',args:['--autoplay-policy=no-user-gesture-required']});
  for (const spec of exports) {
    const result={file:spec.file,status:'pending',consoleErrors:[],consoleWarnings:[],pageErrors:[],failedRequests:[],seekAborts:[],httpErrors:[],samples:[]};
    report.files.push(result);
    try {await stat(path.join(root,spec.file));} catch {result.error='Final export does not exist yet';continue;}
    const context=await browser.newContext({viewport:{width:1280,height:720},deviceScaleFactor:1});
    const page=await context.newPage();
    page.on('console',message=>{if(message.type()==='error')result.consoleErrors.push(message.text());if(message.type()==='warning')result.consoleWarnings.push(message.text());});
    page.on('pageerror',error=>result.pageErrors.push(error.message));
    page.on('requestfailed',request=>{const failure={url:request.url(),error:request.failure()?.errorText};(failure.error==='net::ERR_ABORTED'?result.seekAborts:result.failedRequests).push(failure);});
    page.on('response',response=>{if(response.status()>=400)result.httpErrors.push({url:response.url(),status:response.status()});});
    try {
      await page.goto(base,{waitUntil:'load'});
      await page.locator('video').evaluate((video,filename)=>{video.src=`/${filename}`;video.load();},spec.file);
      await page.waitForFunction(()=>document.querySelector('video').readyState>=2,{},{timeout:30000});
      result.metadata=await page.locator('video').evaluate(video=>({duration:video.duration,width:video.videoWidth,height:video.videoHeight,readyState:video.readyState,codecSupport:video.canPlayType('video/mp4; codecs="avc1.64002a, mp4a.40.2"')}));
      assert(Math.abs(result.metadata.duration-120)<.05,'Browser duration must be 120 seconds');
      assert.equal(result.metadata.width,spec.width,'Browser video width mismatch');
      assert.equal(result.metadata.height,spec.height,'Browser video height mismatch');
      for (const seconds of samples) {
        await page.locator('video').evaluate(async (video,time)=>{
          video.pause();
          await new Promise((resolve,reject)=>{
            const timer=setTimeout(()=>{video.removeEventListener('seeked',done);reject(new Error(`Seek to ${time}s timed out`));},15000);
            const done=()=>{clearTimeout(timer);resolve();};
            video.addEventListener('seeked',done,{once:true});
            video.currentTime=time;
          });
          await video.play();
        },seconds);
        await page.waitForFunction(time=>document.querySelector('video').currentTime>time+.12,seconds,{timeout:15000});
        await page.locator('video').evaluate(video=>video.pause());
        const state=await page.locator('video').evaluate(video=>({currentTime:video.currentTime,readyState:video.readyState,mediaError:video.error?.message??null,audioDecodedBytes:video.webkitAudioDecodedByteCount??null,videoDecodedBytes:video.webkitVideoDecodedByteCount??null,decodedFrames:video.getVideoPlaybackQuality().totalVideoFrames}));
        assert.equal(state.mediaError,null,'Browser reported a media decoding error');
        assert(state.readyState>=2,'Video frame is unavailable after seek');
        assert(state.decodedFrames>0,'Browser must decode actual video frames');
        if (state.audioDecodedBytes!==null) assert(state.audioDecodedBytes>0,'Browser must decode audio');
        result.samples.push({seconds,...state});
        if (spec.file===exports[0].file) await page.locator('video').screenshot({path:path.join(root,'qa/playback',`frame-${String(seconds).replace('.','-')}.png`)});
      }
      assert.equal(result.consoleErrors.length,0,'Browser console errors detected');
      assert.equal(result.consoleWarnings.length,0,'Browser console warnings detected');
      assert.equal(result.pageErrors.length,0,'Browser page errors detected');
      assert.equal(result.failedRequests.length,0,'Unexpected failed media/network requests detected');
      assert.equal(result.httpErrors.length,0,'HTTP errors detected');
      result.status='passed';
      console.log(`PASS playback ${spec.file}: ${result.samples.length} representative seeks, audio and video decoded`);
    } catch(error) {result.status='failed';result.error=error.message;console.error(`FAIL playback ${spec.file}: ${error.message}`);}
    finally {await context.close();}
  }
} catch(error) {report.error=error.message;report.status='failed';}
finally {await browser?.close();await new Promise(resolve=>server.close(resolve));}
report.passed=report.files.length===exports.length&&report.files.every(item=>item.status==='passed')&&!report.error;
report.status=report.error||report.files.some(item=>item.status==='failed')?'failed':report.passed?'passed':'pending';
await writeFile(path.join(root,'qa/playback-verification.json'),JSON.stringify(report,null,2));
await writeFile(path.join(root,'qa/playback-verification.md'),`# Final MP4 browser playback\n\nStatus: **${report.status}**. Checked at ${report.checkedAt}.\n\n${report.method}.\n\n${report.files.map(item=>`- ${item.file}: ${item.status}; ${item.samples.length} representative seeks${item.error?`; ${item.error}`:''}.`).join('\n')}\n\nRepresentative seconds: ${samples.join(', ')}. Each seek must show a decoded frame and progress through actual playback; supported Chrome counters verify audio decoding. Successful checks require no console errors or warnings, page errors, HTTP errors, or unexpected failed requests. User-agent aborted byte-range requests during seeking are listed separately in JSON. Screenshots from the narrated final MP4 are in qa/playback/.\n\nThis checks browser decoding and seeking. It does not prove subjective narration quality or listening-device output, and does not replace physical Pi, camera, weighing, or printer tests.\n`);
console.log(`Final MP4 browser playback: ${report.status}. Reports written to qa/playback-verification.{json,md}`);
process.exitCode=report.passed?0:report.status==='pending'?2:1;
