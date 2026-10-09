import {Freeze,useCurrentFrame} from 'remotion';
import {Opening} from './Opening';
import {ExpertEye} from './ExpertEye';
import {Reveal} from './Reveal';

// Reuse the accepted cinematic scenes at the new edit's brisker pace.
export const CombinedOpening=()=>{const f=useCurrentFrame();return <Freeze frame={Math.round(f*15/8)}><Opening/></Freeze>;};
export const CombinedExpert=()=>{const f=useCurrentFrame();return <Freeze frame={Math.round(f*15/8)}><ExpertEye/></Freeze>;};
export const CombinedReveal=()=>{const f=useCurrentFrame();return <Freeze frame={Math.round(f*12/7)}><Reveal/></Freeze>;};
