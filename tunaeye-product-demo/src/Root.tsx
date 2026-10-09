import {Composition, Folder} from 'remotion';
import {Finale, KioskScene, TunaEyeDemo, TunaEyeVisual} from './Composition';

export const RemotionRoot = () => <>
  <Composition id="TunaEyeKioskDemo" component={TunaEyeDemo} durationInFrames={5400} fps={60} width={1920} height={1080} defaultProps={{narration: true}} />
  <Composition id="TunaEyeNoNarration" component={TunaEyeDemo} durationInFrames={5400} fps={60} width={1920} height={1080} defaultProps={{narration: false}} />
  <Folder name="Scenes">
    <Composition id="TunaEyeVisual" component={TunaEyeVisual} durationInFrames={5400} fps={60} width={1920} height={1080} />
    <Composition id="Welcome" component={KioskScene} durationInFrames={360} fps={60} width={1920} height={1080} defaultProps={{id: 1, title: 'SEA BEYOND THE CUT.', detail: 'Meet your AI-assisted tuna grading kiosk.', dark: true}} />
    <Composition id="ExpertGrader" component={KioskScene} durationInFrames={360} fps={60} width={1920} height={1080} defaultProps={{id: 2, title: 'EXPERT-LED WORKFLOW', detail: 'Eli identifies the grader handling this session.', dark: false}} />
    <Composition id="Samples" component={KioskScene} durationInFrames={480} fps={60} width={1920} height={1080} defaultProps={{id: 3, title: 'SELECT YOUR SAMPLES', detail: 'Sashibo core + tail-cut. Both belong to the same fish.', dark: false}} />
    <Composition id="Weight" component={KioskScene} durationInFrames={420} fps={60} width={1920} height={1080} defaultProps={{id: 4, title: 'RECORD WEIGHT', detail: 'Placement guide → manual weight entry: 36.2 kg.', dark: false}} />
    <Composition id="CoreCapture" component={KioskScene} durationInFrames={660} fps={60} width={1920} height={1080} defaultProps={{id: 5, title: 'CAPTURE. REVIEW. CONFIRM.', detail: 'Actual Upload image workflow using the repository’s sashibo sample.', dark: true}} />
    <Composition id="CoreResult" component={KioskScene} durationInFrames={480} fps={60} width={1920} height={1080} defaultProps={{id: 6, title: 'AI-ASSISTED GRADE', detail: 'Sashibo core: Grade A · 96.3% confidence. Demonstration response.', dark: true}} />
    <Composition id="TailResult" component={KioskScene} durationInFrames={660} fps={60} width={1920} height={1080} defaultProps={{id: 7, title: 'TAIL-CUT ANALYSIS', detail: 'A separate image, analysis, and individual result for tail-cut.', dark: false}} />
    <Composition id="Override" component={KioskScene} durationInFrames={600} fps={60} width={1920} height={1080} defaultProps={{id: 8, title: 'EXPERT REMAINS IN CONTROL', detail: 'Tail-cut A → B. The original recommendation stays in the record.', dark: false}} />
    <Composition id="Receipt" component={KioskScene} durationInFrames={600} fps={60} width={1920} height={1080} defaultProps={{id: 9, title: 'PRINTABLE GRADING SUMMARY', detail: 'Existing receipt animation and browser print action. Session complete.', dark: false}} />
    <Composition id="Records" component={KioskScene} durationInFrames={480} fps={60} width={1920} height={1080} defaultProps={{id: 10, title: 'YOUR GRADING RECORDS', detail: 'One completed session. Two local records, including the expert decision.', dark: false}} />
    <Composition id="BrandFinale" component={Finale} durationInFrames={300} fps={60} width={1920} height={1080} />
  </Folder>
</>;
