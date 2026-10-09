import {useEffect, useState, type CSSProperties, type ReactNode} from 'react';
import {AbsoluteFill, Easing, Img, cancelRender, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {Trail} from '@remotion/motion-blur';

export const BLUE = '#3D40FE';
export const NAVY = '#071331';
export const ICE = '#EAF2FF';
export const clamp = {extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
export const ease = {...clamp,easing:Easing.bezier(.16,1,.3,1)};
export const move = (f:number, a:number,b:number, x:number,y:number) => interpolate(f,[a,b],[x,y],ease);

export const FontReady = () => {
  const [handle] = useState(() => delayRender('Repository Open Runde fonts'));
  useEffect(() => {
    Promise.all(['Regular','Semibold','Bold'].map((name,i)=>loadFont({family:'Open Runde',url:staticFile(`fonts/OpenRunde-${name}.woff2`),weight:['400','600','700'][i]})))
      .then(()=>continueRender(handle)).catch(cancelRender);
  },[handle]);
  return null;
};

export const Stage = ({children,light=false,blue=false}: {children:ReactNode;light?:boolean;blue?:boolean}) => <AbsoluteFill style={{fontFamily:'Open Runde',background:blue?BLUE:light?ICE:NAVY,color:light?NAVY:'white',overflow:'hidden'}}>
  <FontReady/>
  <AbsoluteFill style={{background:light?'radial-gradient(ellipse at 55% 38%,white 10%,#EAF2FF 85%)':`radial-gradient(ellipse at 50% 75%,${blue?'#8184FF55':'#3D40FE35'},transparent 70%)`}}/>
  {children}
</AbsoluteFill>;

export const CinematicCamera = ({children,style={},intensity=1}: {children:ReactNode;style?:CSSProperties;intensity?:number}) => {
  const f=useCurrentFrame();const {durationInFrames}=useVideoConfig();
  return <AbsoluteFill style={{perspective:2200,...style}}><AbsoluteFill style={{scale:interpolate(f,[0,durationInFrames],[1,1+.035*intensity],clamp),translate:`${interpolate(f,[0,durationInFrames],[-12*intensity,12*intensity],clamp)}px 0`,transformStyle:'flat'}}>{children}</AbsoluteFill></AbsoluteFill>;
};

export const KineticTypography = ({children,at=0,size=110,style={}}: {children:ReactNode;at?:number;size?:number;style?:CSSProperties}) => {
  const f=useCurrentFrame();const {fps}=useVideoConfig();
  const p=spring({frame:f-at*fps,fps,config:{damping:24,stiffness:100,mass:.7},durationInFrames:Math.round(.9*fps)});
  return <div style={{fontSize:size,fontWeight:700,letterSpacing:-size*.045,lineHeight:1.04,opacity:move(f,at*fps,(at+.35)*fps,0,1),translate:`0 ${(1-p)*64}px`,filter:`blur(${move(f,at*fps,(at+.4)*fps,9,0)}px)`,...style}}>{children}</div>;
};

type SweepProps = {at?:number;duration?:number;color?:string;angle?:number};
const SweepLayer = ({at=0,duration=1.4,color='#6D80FF',angle=-22}: SweepProps) => {
  const f=useCurrentFrame();const {fps}=useVideoConfig();const t=(f/fps-at)/duration;
  return <div style={{position:'absolute',left:interpolate(t,[0,1],[-600,2500],clamp),top:-500,width:180,height:2100,background:`linear-gradient(90deg,transparent,${color}66,${color},transparent)`,rotate:`${angle}deg`,filter:'blur(16px)',mixBlendMode:'screen',opacity:t>=0&&t<=1?.65:0,pointerEvents:'none'}}/>;
};
export const LightSweep = (props:SweepProps) => <Trail layers={6} lagInFrames={.15} trailOpacity={.18}><SweepLayer {...props}/></Trail>;

export const Eyebrow = ({children,style={}}:{children:ReactNode;style?:CSSProperties}) => <div style={{fontSize:25,fontWeight:600,letterSpacing:4,textTransform:'uppercase',...style}}>{children}</div>;
export const DemoLabel = () => <div style={{position:'absolute',right:94,top:48,fontSize:22,fontWeight:600,letterSpacing:.5,padding:'10px 18px',background:'#071331',color:'white',border:'1px solid #7384b0',borderRadius:40}}>DEMO DATA · SIMULATED INFERENCE</div>;
export const Mark = ({size=150}: {size?:number}) => <Img src={staticFile('brand/tunaeye-logo.svg')} style={{width:size,height:size*.75,borderRadius:size*.16}}/>;

export const Focus = ({style={}}:{style?:CSSProperties}) => <div style={{position:'absolute',width:140,height:140,...style}}>
  {[[0,0],[1,0],[0,1],[1,1]].map(([x,y],i)=><div key={i} style={{position:'absolute',left:x?'auto':0,right:x?0:'auto',top:y?'auto':0,bottom:y?0:'auto',width:28,height:28,borderTop:y?undefined:`3px solid ${BLUE}`,borderBottom:y?`3px solid ${BLUE}`:undefined,borderLeft:x?undefined:`3px solid ${BLUE}`,borderRight:x?`3px solid ${BLUE}`:undefined}}/>)}
  <div style={{position:'absolute',width:6,height:6,left:67,top:67,borderRadius:6,background:BLUE}}/>
</div>;

export const TunaSampleReveal = ({sample='TAILCUT_A.png',at=0,style={},reticle=false,label}: {sample?:string;at?:number;style?:CSSProperties;reticle?:boolean;label?:string}) => {
  const f=useCurrentFrame();const {fps}=useVideoConfig();const p=move(f,at*fps,(at+1.2)*fps,0,1);
  return <div style={{position:'absolute',width:620,height:600,borderRadius:36,background:'white',boxShadow:'0 35px 100px #07133120',overflow:'hidden',opacity:p,translate:`0 ${(1-p)*100}px`,transform:`rotateY(${(1-p)*18}deg)`,...style}}>
    <Img src={staticFile(`samples/${sample}`)} style={{width:'100%',height:'100%',objectFit:'contain'}}/>
    {reticle&&<Focus style={{left:240+Math.sin(f/90)*45,top:240,width:140,height:140,opacity:move(f,(at+1)*fps,(at+1.5)*fps,0,1)}}/>}
    {label&&<div style={{position:'absolute',left:32,bottom:26,fontWeight:600,fontSize:28,color:NAVY}}>{label}</div>}
  </div>;
};

export const UIInteraction = ({x,y,at}:{x:number;y:number;at:number}) => {
  const f=useCurrentFrame();const {fps}=useVideoConfig();const t=(f-at*fps)/fps;
  return <div style={{position:'absolute',left:`${x*100}%`,top:`${y*100}%`,width:70,height:70,marginLeft:-35,marginTop:-35,borderRadius:'50%',border:'3px solid #3D40FE',background:'#3D40FE22',boxShadow:'0 0 24px #3D40FE44',scale:interpolate(t,[0,.55],[.5,1.6],clamp),opacity:t>=0&&t<=.55?1-t/.55:0}}/>;
};

export const TabletHero = ({children,at=0,style={},tilt=true}: {children:ReactNode;at?:number;style?:CSSProperties;tilt?:boolean}) => {
  const f=useCurrentFrame();const {fps}=useVideoConfig();const p=move(f,at*fps,(at+1)*fps,0,1);
  return <div style={{position:'absolute',left:240,top:128,width:1440,height:904,padding:14,borderRadius:46,background:'linear-gradient(145deg,#FFFFFF,#8792AD 30%,#1B2335 70%,#8E9BB3)',boxShadow:'0 34px 90px #07133155, inset 0 0 0 2px #ffffff55',opacity:p,transform:`perspective(2400px) translateY(${(1-p)*100}px) rotateX(${tilt?interpolate(f,[at*fps,(at+2)*fps],[8,0],ease):0}deg) rotateY(${tilt?interpolate(f,[at*fps,(at+4)*fps],[-9,0],ease):0}deg)`,...style}}>
    <div style={{position:'absolute',top:4,left:'50%',width:6,height:6,borderRadius:'50%',background:'#101820'}}/>
    <div style={{width:'100%',height:'100%',position:'relative',borderRadius:32,overflow:'hidden',background:'white',border:'2px solid #121A2B'}}>{children}</div>
  </div>;
};

export const Screenshot = ({file,style={}}:{file:string;style?:CSSProperties}) => <Img src={staticFile(`captures/1280x800/${file}.png`)} style={{width:'100%',height:'100%',objectFit:'contain',...style}}/>;
