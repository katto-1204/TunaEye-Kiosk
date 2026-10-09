import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {BLUE, Eyebrow, KineticTypography, LightSweep, Stage, move} from './design';

export const Question = () => {
  const f=useCurrentFrame();const {fps}=useVideoConfig();
  return <Stage>
    <AbsoluteFill style={{backgroundImage:'linear-gradient(#8296ff12 1px,transparent 1px),linear-gradient(90deg,#8296ff12 1px,transparent 1px)',backgroundSize:'100px 100px',opacity:move(f,5*fps,12*fps,0,.6),transform:`perspective(1000px) rotateX(45deg) scale(1.8) translateY(${f*.05}px)`}}/>
    <div style={{position:'absolute',left:110,top:175}}>
      <Eyebrow style={{color:'#A4B5FF'}}>The question.</Eyebrow>
      <KineticTypography at={.4} size={136} style={{marginTop:36}}>EXPERTISE<br/>MATTERS.</KineticTypography>
      <KineticTypography at={4} size={71} style={{marginTop:60,fontWeight:400,letterSpacing:-2,color:'#CFD9FF'}}>What if technology<br/>could extend it?</KineticTypography>
    </div>
    <div style={{position:'absolute',width:800,height:800,right:-170,top:100,borderRadius:'50%',border:'2px solid #6379FF',scale:move(f,4*fps,12*fps,.6,1.4),opacity:move(f,4*fps,8*fps,0,.5)}}/>
    <div style={{position:'absolute',inset:0,background:BLUE,clipPath:`circle(${move(f,11.7*fps,13*fps,0,120)}% at 50% 50%)`}}/>
    <LightSweep at={11.4} duration={1.2}/>
  </Stage>;
};
