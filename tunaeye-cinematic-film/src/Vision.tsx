import {Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BLUE, Eyebrow, KineticTypography, LightSweep, Stage, clamp, move} from './design';

export const NeuralNetworkVisualization = () => {
  const f=useCurrentFrame();const {fps}=useVideoConfig();const progress=move(f,4*fps,12*fps,0,1);
  return <svg width="1050" height="520" viewBox="0 0 1050 520" style={{position:'absolute',left:710,top:390,overflow:'visible'}}>
    {[0,1,2,3,4].map(layer=><g key={layer} opacity={move(f,(4+layer*.8)*fps,(5+layer*.8)*fps,0,1)}>
      {Array.from({length:layer===4?4:6},(_,node)=>{
        const x=60+layer*218;const y=layer===4?130+node*85:50+node*84;
        return <g key={node}>
          {layer<4&&Array.from({length:layer===3?4:6},(_,target)=><line key={target} x1={x} y1={y} x2={x+218} y2={layer===3?130+target*85:50+target*84} stroke="#9AA8FF" strokeWidth="1.2" opacity={.08+.12*Math.max(0,Math.sin(f/15-node-target-layer))}/>)}
          <circle cx={x} cy={y} r={layer===4?23:15} fill={layer===4?'white':BLUE} stroke="#A5B8FF" strokeWidth="2"/>
          <circle cx={x} cy={y} r={22+8*Math.sin(f/18-layer)} fill="none" stroke={BLUE} opacity={.2+progress*.2}/>
        </g>;
      })}
      {layer>0&&layer<4&&<rect x={60+layer*218-42} y="-14" width="84" height="535" rx="24" fill="none" stroke="#6A7FFF" opacity=".25"/>}
    </g>)}
    {[0,1,2].map(i=><circle key={i} cx={60+((f/100+i*.3)%1)*872} cy={210+i*42} r="5" fill="white" opacity={progress*.8}/>)}
  </svg>;
};

export const Vision = () => {
  const f=useCurrentFrame();const {fps}=useVideoConfig();const t=f/fps;
  const split=move(f,3*fps,6*fps,0,1);
  return <Stage>
    <Eyebrow style={{position:'absolute',left:110,top:75,color:'#9BB0FF'}}>Powered by computer vision.</Eyebrow>
    <KineticTypography at={.5} size={108} style={{position:'absolute',left:110,top:145}}>A closer look.<br/><span style={{color:'#A7B9FF'}}>An informed result.</span></KineticTypography>
    <div style={{position:'absolute',left:120,top:480,width:570,height:420,opacity:move(f,0,1*fps,0,1)}}>
      {['SASHIBOCORE_A.png','TAILCUT_A.png'].map((file,i)=><div key={file} style={{position:'absolute',left:i*295-split*i*18,top:i*22,width:270,height:330,borderRadius:24,background:'white',overflow:'hidden',transform:`perspective(1400px) rotateY(${i?-9:9}deg) scale(${1-split*.1})`,boxShadow:'0 20px 70px #0005'}}>
        <Img src={staticFile(`samples/${file}`)} style={{width:'100%',height:'100%',objectFit:'contain',imageRendering:t>3&&t<6?'pixelated':'auto'}}/>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(#3D40FE80 1px,transparent 1px),linear-gradient(90deg,#3D40FE80 1px,transparent 1px)',backgroundSize:`${32-split*16}px ${32-split*16}px`,opacity:split*.45}}/>
      </div>)}
    </div>
    <NeuralNetworkVisualization/>
    <div style={{position:'absolute',left:120,top:940,fontSize:25,letterSpacing:2}}>IMAGE INPUT</div>
    <div style={{position:'absolute',left:880,top:940,fontSize:29,fontWeight:600,opacity:move(f,4*fps,5*fps,0,1)}}>MOBILENETV3</div>
    <div style={{position:'absolute',right:105,top:940,fontSize:25,letterSpacing:2,opacity:move(f,12*fps,13*fps,0,1)}}>CLASSIFICATION</div>
    <div style={{position:'absolute',left:810,top:380,fontSize:25,color:'#A7B9FF',opacity:move(f,8*fps,9*fps,0,1)}}>COLOR + CLARITY</div>
    <div style={{position:'absolute',left:110,bottom:45,fontSize:20,color:'#B1BDE2'}}>Conceptual architecture visualization · not measured feature maps</div>
    <div style={{position:'absolute',right:130,top:390,fontSize:34,fontWeight:700,opacity:move(f,13*fps,14*fps,0,1)}}>A / B / C / INVALID</div>
    <LightSweep at={4}/><LightSweep at={13}/>
    <div style={{position:'absolute',right:0,top:0,width:interpolate(f,[16*fps,17*fps],[0,1920],clamp),height:1080,background:BLUE}}/>
  </Stage>;
};
