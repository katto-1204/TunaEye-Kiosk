import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {DemoLabel, Eyebrow, KineticTypography, LightSweep, Screenshot, Stage, TabletHero, move} from './design';

export const GradeReveal = ({grade,at,subtitle}: {grade:string;at:number;subtitle:string}) => {
  const f=useCurrentFrame();const {fps}=useVideoConfig();
  return <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#071331',opacity:move(f,at*fps,(at+.12)*fps,0,1)}}>
    <Eyebrow style={{color:'#9AACFF',marginBottom:45}}>AI-assisted classification</Eyebrow>
    <div style={{fontSize:grade==='INVALID'?184:230,fontWeight:700,letterSpacing:-8,lineHeight:1.04,scale:interpolate(f,[at*fps,(at+.25)*fps],[1.07,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}>{grade==='INVALID'?'INVALID.':`GRADE ${grade}.`}</div>
    <KineticTypography at={at+.25} size={35} style={{marginTop:40,fontWeight:400,letterSpacing:1,color:'#C2CEEF'}}>{subtitle}</KineticTypography>
    <LightSweep at={at} duration={.7}/>
  </div>;
};

export const Classification = () => {
  const f=useCurrentFrame();const {fps}=useVideoConfig();const t=f/fps;
  return <Stage>
    {t<.5&&<><Eyebrow style={{position:'absolute',left:95,top:55}}>From image to insight.</Eyebrow><TabletHero tilt={false}><Screenshot file="10-sashibo-analysis"/></TabletHero><div style={{position:'absolute',width:160+f*2,height:160+f*2,borderRadius:'50%',border:'3px solid #8C9AFF',left:960-(160+f*2)/2,top:540-(160+f*2)/2,opacity:.5}}/></>}
    {t>=.5&&t<65/60&&<GradeReveal grade="A" at={.5} subtitle="A recommendation. Ready for expert review."/>}
    {t>=65/60&&t<100/60&&<GradeReveal grade="B" at={65/60} subtitle="An individual sample classification."/>}
    {t>=100/60&&t<3.6&&<GradeReveal grade="C" at={100/60} subtitle="Documented clearly. Reviewed by you."/>}
    {t>=3.6&&t<7.5&&<GradeReveal grade="INVALID" at={3.6} subtitle="When an image cannot be reliably classified."/>}
    {t>=7.5&&<><Eyebrow style={{position:'absolute',left:95,top:55,color:'#BCCAFF',letterSpacing:1,fontSize:30}}>{t<11.5?'SASHIBO CORE · INDIVIDUAL RESULT':'TAIL CUT · INDIVIDUAL RESULT'}</Eyebrow><TabletHero at={7.5} tilt={false}><Screenshot file={t<11.5?'11-sashibo-result':'15-tail-result'}/></TabletHero></>}
    <DemoLabel/>
  </Stage>;
};
