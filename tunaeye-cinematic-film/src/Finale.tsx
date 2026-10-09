import {Img, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BLUE, DemoLabel, Eyebrow, KineticTypography, LightSweep, Mark, Screenshot, Stage, TabletHero, move} from './design';

export const ReceiptTransition = () => {
  const f=useCurrentFrame();const {fps}=useVideoConfig();
  return <div style={{position:'absolute',left:790,top:220,width:340,height:600,borderRadius:18,background:'white',boxShadow:'0 30px 90px #0005',overflow:'hidden',scale:move(f,0,1.4*fps,1,.55),translate:`0 ${move(f,0,1.4*fps,0,-70)}px`,opacity:move(f,.7*fps,1.4*fps,1,0),transform:`perspective(1400px) rotateX(${move(f,0,1.4*fps,0,50)}deg)`}}>
    <Img src={staticFile('captures/1280x800/20-receipt-core.png')} style={{position:'absolute',height:600,width:960,left:-310,objectFit:'cover'}}/>
  </div>;
};

export const LogoFinale = () => {
  const f=useCurrentFrame();const {fps}=useVideoConfig();
  return <Stage blue>
    <div style={{position:'absolute',left:180,top:300,width:1560,textAlign:'center',opacity:move(f,0,.8*fps,0,1)}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:38}}><Mark size={200}/><KineticTypography at={.15} size={167}>TUNAEYE</KineticTypography></div>
      <KineticTypography at={.5} size={45} style={{letterSpacing:5,marginTop:45}}>SEA BEYOND THE CUT.</KineticTypography>
      <KineticTypography at={1.1} size={46} style={{fontWeight:400,letterSpacing:-1,marginTop:80}}>We don’t replace the expert eye.<br/><span style={{fontWeight:700}}>We extend its reach.</span></KineticTypography>
    </div>
    <LightSweep at={.1}/>
  </Stage>;
};

export const Finale = () => {
  const f=useCurrentFrame();const {fps}=useVideoConfig();const t=f/fps;
  const file=t<2.4?'17-override-grade-reason':t<4.2?'19-overview':t<5.8?'21-receipt-print-animation':'23-dashboard-records';
  const label=t<2.4?'EXPERT CONTROL.':t<4.2?'INDIVIDUAL GRADES.':t<5.8?'PRINTABLE RECEIPTS.':'LOCAL RECORDS.';
  return <Stage light>
    {t<7.5&&<><Eyebrow style={{position:'absolute',left:95,top:55,color:BLUE,fontSize:31,letterSpacing:1}}>{label}</Eyebrow><DemoLabel/><TabletHero tilt={false} style={{opacity:move(f,6.7*fps,7.5*fps,1,0),scale:move(f,6.7*fps,7.5*fps,1,.88)}}><Screenshot file={file}/></TabletHero></>}
    <Sequence from={6.2*fps} durationInFrames={1.4*fps} premountFor={fps}><ReceiptTransition/></Sequence>
    <Sequence from={7.5*fps} durationInFrames={4.5*fps} premountFor={fps}><LogoFinale/></Sequence>
    <LightSweep at={2.4} duration={.5}/><LightSweep at={4.2} duration={.5}/><LightSweep at={5.8} duration={.5}/>
  </Stage>;
};
