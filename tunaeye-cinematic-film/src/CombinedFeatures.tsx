import {Video} from '@remotion/media';
import {interpolate,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {BLUE,DemoLabel,Eyebrow,LightSweep,Stage,TabletHero,UIInteraction,clamp} from './design';
import footage from '../public/combined/feature-clips.json';
import admin from '../public/combined/admin-clips.json';

type Group=keyof typeof footage.groups;
type Interaction={type:string;seconds:number;x?:number;y?:number};
export const CombinedFeature=({group}:{group:Group})=>{
  const f=useCurrentFrame();const {fps}=useVideoConfig();const t=f/fps;
  const word=group==='workflow'?(t<6?'CHOOSE YOUR SAMPLES.':t<9?'KEEP EACH FISH CONNECTED.':t<13?'GUIDED PLACEMENT.':t<17?'RECORD THE WEIGHT.':t<23?'CAPTURE. REVIEW.':t<26?'ANALYZE.':'NEXT SAMPLE.'):
    group==='results'?(t<5.5?'SASHIBO CORE · RESULT':'TAIL CUT · RESULT'):
    group==='override'?(t<5?'EXPERT CONTROL.':'ORIGINAL PREDICTION PRESERVED.'):
    group==='receipts'?'INDIVIDUAL RECEIPTS.':'OFFLINE-FIRST RECORDS.';
  const clips:{events:Interaction[]}[]=footage.groups[group];
  return <Stage light>
    <Eyebrow style={{position:'absolute',left:95,top:55,color:BLUE,fontSize:36,letterSpacing:.5}}>{word}</Eyebrow>
    <DemoLabel/>
    <TabletHero tilt={false} style={{top:134,scale:interpolate(f,[0,.6*fps],[.985,1],clamp)}}>
      <Video src={staticFile(`combined/${group}.mp4`)} muted premountFor={fps} objectFit="contain" style={{width:'100%',height:'100%'}}/>
      {clips.flatMap(clip=>clip.events).filter(event=>event.type==='tap').map((event,i)=><UIInteraction key={i} x={(event.x??0)/1280} y={(event.y??0)/800} at={event.seconds}/>)}
    </TabletHero>
    <LightSweep at={0} duration={.5}/>
    {group==='results'&&<LightSweep at={5.5} duration={.45}/>}
  </Stage>;
};

export const CombinedAdmin=()=>{
  const f=useCurrentFrame();const {fps}=useVideoConfig();const t=f/fps;
  return <Stage light>
    <Eyebrow style={{position:'absolute',left:95,top:55,color:BLUE,fontSize:38,letterSpacing:.5}}>{t<3?'ADMIN SYNC.':t<7?'WORK SAVED LOCALLY.':t<10?'SYNC ON YOUR TERMS.':'VERIFIED RECORDS + IMAGES.'}</Eyebrow>
    <div style={{position:'absolute',right:94,top:48,fontSize:22,fontWeight:600,padding:'10px 18px',background:'#071331',color:'white',border:'1px solid #7384b0',borderRadius:40}}>DEMO CLOUD · SIMULATED SYNC</div>
    <TabletHero tilt={false} style={{top:134}}>
      <Video src={staticFile('combined/hero-admin.mp4')} muted premountFor={fps} objectFit="contain" style={{width:'100%',height:'100%'}}/>
      {admin.clips.flatMap(clip=>clip.events).filter(event=>event.type==='tap').map((event,i)=><UIInteraction key={i} x={(event.x??0)/1280} y={(event.y??0)/800} at={event.montageSeconds}/>)}
    </TabletHero>
    <LightSweep at={0} duration={.6}/><LightSweep at={10.5} duration={.5}/>
  </Stage>;
};
