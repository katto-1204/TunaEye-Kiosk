import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BLUE, CinematicCamera, Eyebrow, KineticTypography, LightSweep, Stage, clamp, move} from './design';

export const Opening = () => {
  const f=useCurrentFrame();const {fps}=useVideoConfig();const t=f/fps;
  const end=move(f,13.7*fps,15*fps,0,1);
  return <Stage>
    <CinematicCamera intensity={2}>
      <div style={{position:'absolute',left:880-end*780,top:145+end*55,width:860+end*650,height:790-end*120,borderRadius:44,overflow:'hidden',opacity:move(f,.6*fps,2*fps,0,1),transform:`perspective(1800px) rotateY(${move(f,0,15*fps,-16,0)}deg) rotateZ(${move(f,0,15*fps,4,-1)}deg)`,boxShadow:'0 0 100px #3D40FE50'}}>
        <Img src={staticFile('samples/TAILCUT_A.png')} style={{position:'absolute',width:3500,height:3500,left:-1250,top:-1250,scale:interpolate(f,[0,15*fps],[1.1,.94],clamp)}}/>
        <AbsoluteFill style={{background:'#07133135'}}/>
        <div style={{position:'absolute',left:0,top:0,width:'100%',height:'100%',background:'#071331',clipPath:`inset(0 ${move(f,.7*fps,2.8*fps,0,100)}% 0 0)`}}/>
        <LightSweep at={1.2} duration={2}/>
      </div>
      <AbsoluteFill style={{background:'linear-gradient(90deg,#071331 3%,#071331ee 24%,#07133100 80%)',opacity:1-end*.9}}/>
      <div style={{position:'absolute',left:110,top:200,width:1400,opacity:1-end}}>
        <Eyebrow style={{color:'#A4B5FF',opacity:move(f,1*fps,2*fps,0,1)}}>A closer look.</Eyebrow>
        <KineticTypography at={3.2} size={154} style={{marginTop:35}}>EVERY TUNA</KineticTypography>
        <KineticTypography at={6.4} size={154}>TELLS A<br/>STORY.</KineticTypography>
      </div>
      <div style={{position:'absolute',left:110,bottom:145,display:'flex',gap:44,opacity:1-end}}>
        <KineticTypography at={9} size={43}>QUALITY.</KineticTypography>
        <KineticTypography at={10.8} size={43}>FRESHNESS.</KineticTypography>
        <KineticTypography at={12.6} size={43}>VALUE.</KineticTypography>
      </div>
      {t>13.5&&<div style={{position:'absolute',left:125,top:218,width:1440,height:680,border:`2px solid ${BLUE}`,borderRadius:40,opacity:end}}/>}
      <div style={{position:'absolute',inset:0,background:'black',opacity:move(f,0,.8*fps,1,0)}}/>
    </CinematicCamera>
  </Stage>;
};
