import {Freeze,Img,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {Eyebrow,KineticTypography,LightSweep,Stage,move} from './design';
import {NeuralNetworkVisualization} from './Vision';
import cues from '../public/combined/grade-cues.json';

export const CombinedVision=()=>{
  const f=useCurrentFrame();const {fps}=useVideoConfig();const t=23+f/fps;
  return <Stage>
    <Eyebrow style={{position:'absolute',left:110,top:70,color:'#ACBBFF'}}>AI-assisted classification.</Eyebrow>
    <KineticTypography at={.1} size={98} style={{position:'absolute',left:110,top:145}}>VISUAL INSIGHT.<br/><span style={{color:'#ACBBFF'}}>EXPERT INTERPRETATION.</span></KineticTypography>
    <div style={{position:'absolute',left:120,top:470,display:'flex',gap:24}}>
      <div style={{background:'white',borderRadius:24,width:250,height:350,overflow:'hidden',rotate:'-3deg'}}><Img src={staticFile('samples/SASHIBOCORE_A.png')} style={{width:'100%',height:'100%',objectFit:'contain'}}/></div>
      <div style={{background:'white',borderRadius:24,width:250,height:350,overflow:'hidden',rotate:'3deg'}}><Img src={staticFile('samples/TAILCUT_A.png')} style={{width:'100%',height:'100%',objectFit:'contain'}}/></div>
    </div>
    <Freeze frame={Math.round(f*17/9)}><NeuralNetworkVisualization/></Freeze>
    {(['A','B','C','Invalid'] as const).map((grade,i)=>{
      const active=t>=cues[grade]&&(i===3||t<cues[(['A','B','C','Invalid'] as const)[i+1]]);
      return <div key={grade} style={{position:'absolute',left:1685,top:498+i*85,fontSize:32,fontWeight:700,color:active?'white':'#ACBBFF',textShadow:active?'0 0 30px #AAB8FF':'none',opacity:move(f,2*fps,2.7*fps,0,1),scale:active?1.08:1}}>{grade.toUpperCase()}</div>;
    })}
    <div style={{position:'absolute',left:120,top:910,fontSize:28,letterSpacing:2}}>SASHIBO CORE + TAIL CUT</div>
    <div style={{position:'absolute',left:920,top:910,fontSize:28,fontWeight:600}}>MOBILENETV3</div>
    <div style={{position:'absolute',left:110,bottom:60,fontSize:21,color:'#ACBBFF'}}>Conceptual classifier visualization · not measured feature maps</div>
    <LightSweep at={0} duration={.65}/><LightSweep at={7.8} duration={.65}/>
  </Stage>;
};
