import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {BLUE, CinematicCamera, Eyebrow, KineticTypography, Stage, TunaSampleReveal, clamp, move} from './design';

export const ExpertEye = () => {
  const f=useCurrentFrame();const {fps}=useVideoConfig();const t=f/fps;
  const word=t<6?'EXPERIENCE.':t<10?'PRECISION.':'THE TRAINED EYE.';
  const at=t<6?0:t<10?6:10;
  return <Stage light><CinematicCamera>
    <Eyebrow style={{position:'absolute',left:110,top:80,color:BLUE}}>Quality begins with expertise.</Eyebrow>
    <div style={{position:'absolute',left:110,top:148}}><KineticTypography key={word} at={at} size={96}>{word}</KineticTypography></div>
    <TunaSampleReveal at={0} sample="SASHIBOCORE_A.png" reticle label="SASHIBO CORE" style={{left:225,top:315,width:645,height:590,transform:`perspective(2200px) rotateY(${interpolate(f,[0,15*fps],[8,-3],clamp)}deg) rotateZ(-2deg)`}}/>
    <TunaSampleReveal at={2} sample="TAILCUT_A.png" reticle label="TAIL CUT" style={{left:1010,top:315,width:645,height:590,transform:`perspective(2200px) rotateY(${interpolate(f,[0,15*fps],[-8,3],clamp)}deg) rotateZ(2deg)`}}/>
    <div style={{position:'absolute',left:110,bottom:80,fontSize:32,color:BLUE,opacity:move(f,5*fps,6*fps,0,1)}}>COLOR <span style={{color:'#8895A9',padding:'0 20px'}}>+</span> CLARITY</div>
    <div style={{position:'absolute',right:110,bottom:80,fontSize:27,color:'#56637B',opacity:move(f,9*fps,10*fps,0,1)}}>Real samples. Human judgment.</div>
  </CinematicCamera></Stage>;
};
