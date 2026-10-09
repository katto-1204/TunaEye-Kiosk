import {Audio} from '@remotion/media';
import {AbsoluteFill,Sequence,staticFile,useVideoConfig} from 'remotion';
import {CombinedOpening,CombinedExpert,CombinedReveal} from './CombinedIntro';
import {CombinedVision} from './CombinedVision';
import {CombinedFeature,CombinedAdmin} from './CombinedFeatures';
import {LogoFinale} from './Finale';

export const CombinedVisual=()=>{
  const {fps}=useVideoConfig();
  return <AbsoluteFill style={{background:'#071331'}}>
    <Sequence name="01 Every tuna tells a story" durationInFrames={8*fps} premountFor={fps}><CombinedOpening/></Sequence>
    <Sequence name="02 The expert eye" from={8*fps} durationInFrames={8*fps} premountFor={fps}><CombinedExpert/></Sequence>
    <Sequence name="03 Meet TunaEye" from={16*fps} durationInFrames={7*fps} premountFor={fps}><CombinedReveal/></Sequence>
    <Sequence name="04 AI-assisted classification" from={23*fps} durationInFrames={9*fps} premountFor={fps}><CombinedVision/></Sequence>
    <Sequence name="05 Guided grading workflow" from={32*fps} durationInFrames={30*fps} premountFor={fps}><CombinedFeature group="workflow"/></Sequence>
    <Sequence name="06 Individual results and confidence" from={62*fps} durationInFrames={11*fps} premountFor={fps}><CombinedFeature group="results"/></Sequence>
    <Sequence name="07 Expert override and preserved prediction" from={73*fps} durationInFrames={12*fps} premountFor={fps}><CombinedFeature group="override"/></Sequence>
    <Sequence name="08 Individual receipts" from={85*fps} durationInFrames={8*fps} premountFor={fps}><CombinedFeature group="receipts"/></Sequence>
    <Sequence name="09 Local records and image evidence" from={93*fps} durationInFrames={7*fps} premountFor={fps}><CombinedFeature group="records"/></Sequence>
    <Sequence name="10 Admin controlled sync" from={100*fps} durationInFrames={14*fps} premountFor={fps}><CombinedAdmin/></Sequence>
    <Sequence name="11 Sea beyond the cut" from={114*fps} durationInFrames={6*fps} premountFor={fps}><LogoFinale/></Sequence>
  </AbsoluteFill>;
};
export const Combined=({narration}:{narration:boolean})=><><CombinedVisual/><Audio src={staticFile(narration?'combined/audio/final_mix.wav':'combined/audio/no_narration_mix.wav')} premountFor={60}/></>;
