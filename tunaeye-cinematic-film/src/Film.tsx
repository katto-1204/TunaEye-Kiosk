import {Audio} from '@remotion/media';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Opening} from './Opening';
import {ExpertEye} from './ExpertEye';
import {Question} from './Question';
import {Reveal} from './Reveal';
import {Vision} from './Vision';
import {Experience} from './Experience';
import {Classification} from './Classification';
import {Finale} from './Finale';

export const FilmVisual = () => {
  const {fps}=useVideoConfig();const f=useCurrentFrame();
  return <AbsoluteFill style={{background:'black'}}>
    <Sequence name="01 Every tuna tells a story" durationInFrames={15*fps} premountFor={fps}><Opening/></Sequence>
    <Sequence name="02 The expert eye" from={15*fps} durationInFrames={15*fps} premountFor={fps}><ExpertEye/></Sequence>
    <Sequence name="03 The question" from={30*fps} durationInFrames={13*fps} premountFor={fps}><Question/></Sequence>
    <Sequence name="04 Introducing TunaEye" from={43*fps} durationInFrames={12*fps} premountFor={fps}><Reveal/></Sequence>
    <Sequence name="05 Powered by computer vision" from={55*fps} durationInFrames={17*fps} premountFor={fps}><Vision/></Sequence>
    <Sequence name="06 The kiosk experience" from={72*fps} durationInFrames={23*fps} premountFor={fps}><Experience/></Sequence>
    <Sequence name="07 The classification" from={95*fps} durationInFrames={13*fps} premountFor={fps}><Classification/></Sequence>
    <Sequence name="08 Expert control and records" from={108*fps} durationInFrames={12*fps} premountFor={fps}><Finale/></Sequence>
    <AbsoluteFill style={{pointerEvents:'none',background:'radial-gradient(ellipse at center,transparent 60%,#07133115 100%)',opacity:f>0?1:0}}/>
  </AbsoluteFill>;
};
export type FilmProps = {narration:boolean};
export const Film = ({narration}:FilmProps) => <><FilmVisual/><Audio src={staticFile(narration?'audio/final_mix.wav':'audio/no_narration_mix.wav')} premountFor={60}/></>;
