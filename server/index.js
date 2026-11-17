import express from 'express';
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });
const rooms = new Map();
const MAX_PLAYERS = 10;
const POINTS = [10,9,8,7,6,5,4,3,2,1];

app.get('/health', (_req,res)=>res.json({ok:true,game:'TRACK RACING 3D',rooms:rooms.size}));
app.use(express.static(path.resolve(__dirname,'../dist')));
app.get('*',(_req,res)=>res.sendFile(path.resolve(__dirname,'../dist/index.html')));

function send(ws,data){if(ws.readyState===1)ws.send(JSON.stringify(data));}
function publicPlayers(room){
 return [...room.players.values()].map(p=>({
  id:p.id,name:p.name,car:p.car,team:p.team,color:p.color,x:p.x,z:p.z,
  rotation:p.rotation,lap:p.lap,progress:p.progress,finished:p.finished,
  finishTime:p.finishTime,ready:p.ready
 }));
}
function snapshot(room){
 return {type:'room-state',room:room.code,hostId:room.hostId,config:room.config,
  started:room.started,players:publicPlayers(room)};
}
function broadcast(room,data){for(const p of room.players.values())send(p.ws,data);}
function roomState(room){broadcast(room,snapshot(room));}
function endRace(room){
 if(!room.started||room.resultsSent)return;
 if(room.timeout)clearTimeout(room.timeout);
 room.started=false;room.resultsSent=true;
 const finishers=[...room.players.values()].filter(p=>p.finished).sort((a,b)=>a.finishTime-b.finishTime);
 const incomplete=[...room.players.values()].filter(p=>!p.finished);
 const results=[...finishers,...incomplete].map((p,i)=>({
  id:p.id,name:p.name,team:p.team,car:p.car,finished:p.finished,
  rank:p.finished?i+1:null,points:p.finished?(POINTS[i]||0):0,
  finishTime:p.finishTime
 }));
 const red=results.filter(r=>r.team==='red').reduce((s,r)=>s+r.points,0);
 const blue=results.filter(r=>r.team==='blue').reduce((s,r)=>s+r.points,0);
 const winner=red===blue?'draw':red>blue?'red':'blue';
 const payload={type:'race-results',mode:room.config.mode,results,teams:{red,blue,winner}};
 broadcast(room,payload);
 room.results=payload;
}
function cleanRoom(room){if(!room.players.size)rooms.delete(room.code);}

wss.on('connection',ws=>{
 ws.id=crypto.randomUUID();ws.roomCode=null;
 ws.on('message',raw=>{
  let msg;try{msg=JSON.parse(raw.toString());}catch{return;}
  if(msg.type==='join'){
   const code=String(msg.room||'RACE').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8)||'RACE';
   let room=rooms.get(code);
   if(!room){room={code,players:new Map(),hostId:null,started:false,resultsSent:false,results:null,
    config:{mode:'individual',track:'yeongam',laps:3}};rooms.set(code,room);}
   if(room.started)return send(ws,{type:'error',message:'경기가 진행 중인 방에는 입장할 수 없습니다.'});
   if(room.players.size>=MAX_PLAYERS)return send(ws,{type:'error',message:'방 정원이 가득 찼습니다. (최대 10명)'});
   const p={id:ws.id,ws,name:String(msg.name||'Racer').slice(0,14),car:['acceleration','topSpeed','cornering','balance'].includes(msg.car)?msg.car:'balance',
    team:msg.team==='blue'?'blue':msg.team==='red'?'red':null,color:'#ff5b55',x:0,z:0,rotation:0,lap:0,progress:0,finished:false,finishTime:null,ready:false};
   room.players.set(p.id,p);if(!room.hostId)room.hostId=p.id;ws.roomCode=code;
   send(ws,{type:'joined',id:p.id});
   roomState(room);return;
  }
  const room=rooms.get(ws.roomCode);if(!room)return;
  const player=room.players.get(ws.id);if(!player)return;
  if(msg.type==='rename'){
   const name=String(msg.name||'').trim().slice(0,14);
   if(!name)return send(player.ws,{type:'error',message:'닉네임을 입력해주세요.'});
   player.name=name;
   roomState(room);
  }else if(msg.type==='configure'){
   if(player.id!==room.hostId||room.started)return;
   const mode=msg.mode==='team'?'team':'individual';
   const track=['yeongam','inje','everland','taebaek'].includes(msg.track)?msg.track:'yeongam';
   room.config={mode,track,laps:3};
   if(mode==='individual')for(const p of room.players.values())p.team=null;
   roomState(room);
  }else if(msg.type==='select'){
   if(room.started)return;
   const car=['acceleration','topSpeed','cornering','balance'].includes(msg.car)?msg.car:player.car;
   const team=msg.team==='red'||msg.team==='blue'?msg.team:null;
   if(room.config.mode==='team'&&!team)return send(player.ws,{type:'error',message:'팀전을 선택했다면 레드팀 또는 블루팀을 골라주세요.'});
   if(room.config.mode==='team'){
    const count=[...room.players.values()].filter(p=>p.id!==player.id&&p.team===team).length;
    if(count>=5)return send(player.ws,{type:'error',message:'각 팀은 최대 5명까지 참가할 수 있습니다.'});
   }
   player.car=car;player.team=room.config.mode==='team'?team:null;
   player.color=player.team==='blue'?'#42a5ff':player.team==='red'?'#ff5b55':'#ffd447';
   roomState(room);
  }else if(msg.type==='start'){
   if(player.id!==room.hostId||room.started)return;
   if(room.players.size<1)return;
   if(room.config.mode==='team'){
    const red=[...room.players.values()].filter(p=>p.team==='red').length;
    const blue=[...room.players.values()].filter(p=>p.team==='blue').length;
    if(!red||!blue||red+blue!==room.players.size)return send(player.ws,{type:'error',message:'팀전은 모든 참가자가 레드팀 또는 블루팀을 선택해야 하며, 양 팀에 1명 이상 있어야 합니다.'});
   }
   if(room.timeout)clearTimeout(room.timeout);
   room.started=true;room.startedAt=Date.now();room.resultsSent=false;room.results=null;
   for(const p of room.players.values()){p.lap=0;p.progress=0;p.finished=false;p.finishTime=null;p.x=0;p.z=0;p.ready=true;}
   broadcast(room,{type:'race-start',at:Date.now(),config:room.config});
   roomState(room);
   room.timeout=setTimeout(()=>endRace(room),240000);
  }else if(msg.type==='state'){
   if(!room.started||player.finished)return;
   player.x=Number.isFinite(msg.x)?Math.max(-100,Math.min(100,msg.x)):player.x;
   player.z=Number.isFinite(msg.z)?Math.max(-100,Math.min(100,msg.z)):player.z;
   player.rotation=Number.isFinite(msg.rotation)?msg.rotation:player.rotation;
   player.lap=Number.isFinite(msg.lap)?Math.max(0,Math.min(3,msg.lap)):player.lap;
   player.progress=Number.isFinite(msg.progress)?Math.max(0,Math.min(1,msg.progress)):player.progress;
   broadcast(room,{type:'players',players:publicPlayers(room)});
  }else if(msg.type==='finish'){
   if(!room.started||player.finished)return;
   player.finished=true;player.finishTime=Date.now()-(room.startedAt||Date.now());
   broadcast(room,{type:'players',players:publicPlayers(room)});
   if([...room.players.values()].every(p=>p.finished))endRace(room);
  }else if(msg.type==='leave'){
   room.players.delete(player.id);if(room.hostId===player.id)room.hostId=room.players.keys().next().value||null;
   roomState(room);cleanRoom(room);
  }else if(msg.type==='restart'){
   if(player.id!==room.hostId)return;
   room.started=false;room.resultsSent=false;room.results=null;roomState(room);
  }
 });
 ws.on('close',()=>{
  const room=rooms.get(ws.roomCode);if(!room)return;
  room.players.delete(ws.id);
  if(room.hostId===ws.id)room.hostId=room.players.keys().next().value||null;
  if(room.started&&room.players.size&&[...room.players.values()].every(p=>p.finished))endRace(room);
  roomState(room);cleanRoom(room);
 });
});
const port=process.env.PORT||3000;
server.listen(port,'0.0.0.0',()=>console.log(`TRACK RACING 3D listening on ${port}`));