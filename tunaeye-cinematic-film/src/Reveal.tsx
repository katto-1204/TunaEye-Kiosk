import {useCurrentFrame, useVideoConfig} from 'remotion';
import {KineticTypography, LightSweep, Mark, Screenshot, Stage, TabletHero, move} from './design';

export const Reveal = () => {
  const f=useCurrentFrame();const {fps}=useVideoConfig();const hero=move(f,7.7*fps,9*fps,0,1);
  return <Stage blue>
    <div style={{position:'absolute',width:950,height:950,left:485,top:65,borderRadius:'50%',border:'1px solid #FFFFFF35',scale:move(f,0,4*fps,.35,1.9),opacity:move(f,0,4*fps,1,0)}}/>
    <div style={{position:'absolute',left:250,top:325-hero*215,width:1420,textAlign:'center',opacity:1-hero,transform:`perspective(1500px) rotateY(${move(f,0,2*fps,-12,0)}deg)`}}>
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:44,opacity:move(f,1*fps,2*fps,0,1)}}><Mark size={216}/><KineticTypography at={2} size={172}>TUNAEYE</KineticTypography></div>
      <KineticTypography at={5} size={48} style={{marginTop:48,letterSpacing:5}}>SEA BEYOND THE CUT.</KineticTypography>
      <KineticTypography at={6.4} size={32} style={{marginTop:45,fontWeight:400,letterSpacing:2}}>AI-ASSISTED TUNA QUALITY GRADING</KineticTypography>
    </div>
    <TabletHero at={8} style={{top:135,scale:.92}}><Screenshot file="01-welcome"/></TabletHero>
    <div style={{position:'absolute',left:110,top:54,opacity:hero,fontSize:35,fontWeight:600}}>Intelligence. In your hands.</div>
    <LightSweep at={1.6}/><LightSweep at={8}/>
  </Stage>;
};
