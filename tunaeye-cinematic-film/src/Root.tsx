import {Composition, Folder} from 'remotion';
import {Film, FilmVisual} from './Film';
import {Opening} from './Opening';
import {ExpertEye} from './ExpertEye';
import {Question} from './Question';
import {Reveal} from './Reveal';
import {Vision} from './Vision';
import {Experience} from './Experience';
import {Classification} from './Classification';
import {Finale} from './Finale';
import {Combined,CombinedVisual} from './Combined';
import {CombinedAdmin,CombinedFeature} from './CombinedFeatures';

export const RemotionRoot = () => <>
  <Composition id="TunaEyeCombined" component={Combined} durationInFrames={7200} fps={60} width={1920} height={1080} defaultProps={{narration:true}}/>
  <Composition id="TunaEyeCombinedNoNarration" component={Combined} durationInFrames={7200} fps={60} width={1920} height={1080} defaultProps={{narration:false}}/>
  <Composition id="TunaEyeCombinedVisual" component={CombinedVisual} durationInFrames={7200} fps={60} width={1920} height={1080}/>
  <Folder name="CombinedFeatures">
    <Composition id="CombinedWorkflow" component={CombinedFeature} durationInFrames={1800} fps={60} width={1920} height={1080} defaultProps={{group:'workflow'}}/>
    <Composition id="CombinedResults" component={CombinedFeature} durationInFrames={660} fps={60} width={1920} height={1080} defaultProps={{group:'results'}}/>
    <Composition id="CombinedOverride" component={CombinedFeature} durationInFrames={720} fps={60} width={1920} height={1080} defaultProps={{group:'override'}}/>
    <Composition id="CombinedReceipts" component={CombinedFeature} durationInFrames={480} fps={60} width={1920} height={1080} defaultProps={{group:'receipts'}}/>
    <Composition id="CombinedRecords" component={CombinedFeature} durationInFrames={420} fps={60} width={1920} height={1080} defaultProps={{group:'records'}}/>
    <Composition id="CombinedAdminSync" component={CombinedAdmin} durationInFrames={840} fps={60} width={1920} height={1080}/>
  </Folder>
  <Composition id="TunaEyeCinematic" component={Film} durationInFrames={7200} fps={60} width={1920} height={1080} defaultProps={{narration:true}}/>
  <Composition id="TunaEyeNoNarration" component={Film} durationInFrames={7200} fps={60} width={1920} height={1080} defaultProps={{narration:false}}/>
  <Composition id="TunaEyeVisual" component={FilmVisual} durationInFrames={7200} fps={60} width={1920} height={1080}/>
  <Folder name="Acts">
    <Composition id="EveryTuna" component={Opening} durationInFrames={900} fps={60} width={1920} height={1080}/>
    <Composition id="ExpertEye" component={ExpertEye} durationInFrames={900} fps={60} width={1920} height={1080}/>
    <Composition id="Question" component={Question} durationInFrames={780} fps={60} width={1920} height={1080}/>
    <Composition id="Introducing" component={Reveal} durationInFrames={720} fps={60} width={1920} height={1080}/>
    <Composition id="ComputerVision" component={Vision} durationInFrames={1020} fps={60} width={1920} height={1080}/>
    <Composition id="KioskExperience" component={Experience} durationInFrames={1380} fps={60} width={1920} height={1080}/>
    <Composition id="Classification" component={Classification} durationInFrames={780} fps={60} width={1920} height={1080}/>
    <Composition id="ExpertControl" component={Finale} durationInFrames={720} fps={60} width={1920} height={1080}/>
  </Folder>
</>;
