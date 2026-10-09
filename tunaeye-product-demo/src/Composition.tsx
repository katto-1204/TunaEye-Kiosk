import {useEffect, useState} from 'react';
import {AbsoluteFill, Easing, Img, Sequence, cancelRender, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio, Video} from '@remotion/media';
import {loadFont} from '@remotion/fonts';
import timeline from './capture-timeline.json';

const blue = '#3D40FE';
const navy = '#071331';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export type DemoProps = {narration: boolean};
export type SceneProps = {id: number; title: string; detail: string; dark: boolean};

const FontReady = () => {
  const [handle] = useState(() => delayRender('Load repository Open Runde fonts'));
  useEffect(() => {
    Promise.all([
      loadFont({family: 'Open Runde', url: staticFile('fonts/OpenRunde-Regular.woff2'), weight: '400'}),
      loadFont({family: 'Open Runde', url: staticFile('fonts/OpenRunde-Semibold.woff2'), weight: '600'}),
      loadFont({family: 'Open Runde', url: staticFile('fonts/OpenRunde-Bold.woff2'), weight: '700'}),
    ]).then(() => continueRender(handle)).catch(cancelRender);
  }, [handle]);
  return null;
};

export const KioskScene = ({id, title, detail, dark}: SceneProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scene = timeline[id - 1];
  const seconds = frame / fps;
  const ink = dark ? 'white' : navy;
  const enter = spring({frame, fps, config: {damping: 200, mass: 0.7}});
  return <AbsoluteFill style={{fontFamily: 'Open Runde', background: dark ? (id === 6 ? navy : blue) : '#EAF2FF', color: ink}}>
    <FontReady />
    <div style={{position: 'absolute', inset: 0, background: dark ? 'radial-gradient(ellipse at 50% 70%, #ffffff12, transparent 65%)' : 'radial-gradient(ellipse at 50% 60%, #FFFFFF 10%, #EAF2FF 75%)'}} />
    <div style={{position: 'absolute', left: 100, top: 48, display: 'flex', alignItems: 'center', gap: 22, opacity: enter, translate: `0 ${interpolate(enter, [0, 1], [12, 0])}px`}}>
      <div style={{fontSize: 21, fontWeight: 600, border: `1px solid ${dark ? '#ffffff50' : '#3d40fe40'}`, borderRadius: 18, padding: '11px 18px', color: dark ? 'white' : blue}}>{String(id).padStart(2, '0')} / 10</div>
      <div style={{fontSize: 44, letterSpacing: '-1.4px', fontWeight: 700}}>{title}</div>
    </div>
    <div style={{position: 'absolute', right: 100, top: 63, display: 'flex', alignItems: 'center', gap: 10, fontSize: 17, letterSpacing: 0.6, fontWeight: 600}}>
      <span style={{width: 7, height: 7, borderRadius: '50%', background: dark ? '#AFC7FF' : blue}} />
      DEMONSTRATION DATA · SIMULATED INFERENCE
    </div>
    <div style={{position: 'absolute', left: 304, top: 151, width: 1312, height: 832, borderRadius: 37, background: '#121625', padding: 16, boxShadow: dark ? '0 36px 72px #00000045, inset 0 0 0 2px #ffffff35' : '0 34px 76px #07133130, inset 0 0 0 2px #ffffff60', scale: interpolate(frame, [0, scene.duration * fps], [id === 1 ? 0.96 : 0.989, 1.004], {...clamp, easing: Easing.bezier(0.22, 1, 0.36, 1)}), translate: id === 1 ? `0 ${interpolate(enter, [0, 1], [70, 0])}px` : '0 0', opacity: id === 1 ? enter : 1}}>
      <div style={{position: 'relative', width: 1280, height: 800, borderRadius: 24, overflow: 'hidden', background: 'white'}}>
        <Video src={staticFile(scene.file)} muted premountFor={fps} objectFit="contain" style={{width: 1280, height: 800}} />
        {scene.events.filter(event => event.type === 'tap').map((event, index) => {
          const age = seconds - event.seconds;
          if (age < 0 || age > 0.48 || event.x === undefined || event.y === undefined) return null;
          return <div key={index} style={{position: 'absolute', left: event.x - 22, top: event.y - 22, width: 44, height: 44, borderRadius: '50%', border: `3px solid ${blue}`, background: '#3d40fe18', scale: interpolate(age, [0, 0.48], [0.6, 1.8], clamp), opacity: interpolate(age, [0, 0.14, 0.48], [0.9, 0.65, 0], clamp), pointerEvents: 'none'}} />;
        })}
      </div>
      <div style={{position: 'absolute', left: 5, top: 412, height: 8, width: 8, borderRadius: '50%', background: '#323A52'}} />
    </div>
    <div style={{position: 'absolute', left: 100, right: 100, bottom: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 22}}>
      <span style={{opacity: 0.78}}>{detail}</span><span style={{fontWeight: 700, letterSpacing: 3, fontSize: 21}}>TUNAEYE</span>
    </div>
    <div style={{position: 'absolute', left: 100, right: 100, bottom: 14, height: 2, background: dark ? '#ffffff20' : '#07133115'}}><div style={{height: 2, width: `${(scene.start + seconds) / 90 * 100}%`, background: dark ? '#fff' : blue}} /></div>
  </AbsoluteFill>;
};

export const Finale = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 200}});
  return <AbsoluteFill style={{background: blue, color: 'white', fontFamily: 'Open Runde', alignItems: 'center', justifyContent: 'center'}}>
    <FontReady />
    <div style={{display: 'flex', alignItems: 'center', gap: 40, opacity: enter, translate: `0 ${interpolate(enter, [0, 1], [32, 0])}px`, scale: interpolate(frame, [0, 5 * fps], [0.98, 1.025], clamp)}}>
      <Img src={staticFile('tunaeye-logo.svg')} style={{width: 192, height: 144, borderRadius: 30}} /><div style={{fontSize: 134, fontWeight: 700, letterSpacing: '-6px'}}>TUNAEYE</div>
    </div>
    <div style={{fontSize: 40, fontWeight: 600, letterSpacing: 4, marginTop: 38, opacity: interpolate(frame, [0.5 * fps, 1.2 * fps], [0, 1], clamp)}}>SEA BEYOND THE CUT.</div>
    <div style={{position: 'absolute', bottom: 80, fontSize: 20, opacity: 0.65}}>AI-assisted grading. Expert-led decisions.</div>
  </AbsoluteFill>;
};

export const TunaEyeVisual = () => {
  const {fps} = useVideoConfig();
  return <AbsoluteFill>
    <Sequence name="01 Welcome" durationInFrames={6 * fps} premountFor={fps}><KioskScene id={1} title="SEA BEYOND THE CUT." detail="Meet your AI-assisted tuna grading kiosk." dark /></Sequence>
    <Sequence name="02 Expert grader" from={6 * fps} durationInFrames={6 * fps} premountFor={fps}><KioskScene id={2} title="EXPERT-LED WORKFLOW" detail="Eli identifies the grader handling this session." dark={false} /></Sequence>
    <Sequence name="03 Samples and association" from={12 * fps} durationInFrames={8 * fps} premountFor={fps}><KioskScene id={3} title="SELECT YOUR SAMPLES" detail="Sashibo core + tail-cut. Both belong to the same fish." dark={false} /></Sequence>
    <Sequence name="04 Placement and weight" from={20 * fps} durationInFrames={7 * fps} premountFor={fps}><KioskScene id={4} title="RECORD WEIGHT" detail="Placement guide → manual weight entry: 36.2 kg." dark={false} /></Sequence>
    <Sequence name="05 Core capture and review" from={27 * fps} durationInFrames={11 * fps} premountFor={fps}><KioskScene id={5} title="CAPTURE. REVIEW. CONFIRM." detail="Actual Upload image workflow using the repository’s sashibo sample." dark /></Sequence>
    <Sequence name="06 Core analysis and result" from={38 * fps} durationInFrames={8 * fps} premountFor={fps}><KioskScene id={6} title="AI-ASSISTED GRADE" detail="Sashibo core: Grade A · 96.3% confidence. Demonstration response." dark /></Sequence>
    <Sequence name="07 Tail capture and result" from={46 * fps} durationInFrames={11 * fps} premountFor={fps}><KioskScene id={7} title="TAIL-CUT ANALYSIS" detail="A separate image, analysis, and individual result for tail-cut." dark={false} /></Sequence>
    <Sequence name="08 Expert override and overview" from={57 * fps} durationInFrames={10 * fps} premountFor={fps}><KioskScene id={8} title="EXPERT REMAINS IN CONTROL" detail="Tail-cut A → B. The original recommendation stays in the record." dark={false} /></Sequence>
    <Sequence name="09 Receipt and completion" from={67 * fps} durationInFrames={10 * fps} premountFor={fps}><KioskScene id={9} title="PRINTABLE GRADING SUMMARY" detail="Existing receipt animation and browser print action. Session complete." dark={false} /></Sequence>
    <Sequence name="10 Dashboard and records" from={77 * fps} durationInFrames={8 * fps} premountFor={fps}><KioskScene id={10} title="YOUR GRADING RECORDS" detail="One completed session. Two local records, including the expert decision." dark={false} /></Sequence>
    <Sequence name="11 TunaEye brand" from={85 * fps} durationInFrames={5 * fps} premountFor={fps}><Finale /></Sequence>
  </AbsoluteFill>;
};

export const TunaEyeDemo = ({narration}: DemoProps) => {
  const {fps} = useVideoConfig();
  return <AbsoluteFill><TunaEyeVisual /><Audio src={staticFile(narration ? 'audio/final_mix.wav' : 'audio/no_narration_mix.wav')} premountFor={fps} /></AbsoluteFill>;
};
