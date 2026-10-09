import {Video} from '@remotion/media';
import {interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DemoLabel, Eyebrow, LightSweep, Stage, TabletHero, UIInteraction, clamp} from './design';
import timeline from '../public/captures/workflow-clips.json';

export const Experience = () => {
  const f=useCurrentFrame();const {fps}=useVideoConfig();const t=f/fps;
  const word=t<8?'GUIDED.':t<16?'INTUITIVE.':'BUILT FOR GRADING.';
  return <Stage light>
    <Eyebrow style={{position:'absolute',left:95,top:55,color:'#3D40FE',fontSize:34,letterSpacing:1}}>{word}</Eyebrow>
    <DemoLabel/>
    <TabletHero tilt={false} style={{top:134,scale:interpolate(f,[0,fps,22*fps,23*fps],[.98,1,1,.99],clamp)}}>
      <Video src={staticFile('captures/hero-workflow.mp4')} muted premountFor={fps} objectFit="contain" style={{width:'100%',height:'100%'}}/>
      {timeline.clips.flatMap(clip=>clip.events).filter(event=>event.type==='tap').map((event,i)=><UIInteraction key={i} x={(event.x ?? 0)/1280} y={(event.y ?? 0)/800} at={Math.round(event.montageSeconds*fps)/fps}/>)}
    </TabletHero>
    <LightSweep at={0} duration={.75}/>
  </Stage>;
};
