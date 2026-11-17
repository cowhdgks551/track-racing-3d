import * as THREE from 'three';
import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `
<div id="game"><div class="hud">
 <div class="topbar"><div class="brand">TRACK <span>RACING</span> 3D</div><div class="pill" id="connection">● OFFLINE</div></div>
 <div class="stats"><div class="stat"><small>LAP</small><strong id="lap">0 / 3</strong></div><div class="stat"><small>TIME</small><strong id="time">00:00.0</strong></div><div class="stat"><small>SPEED</small><strong id="speed">0</strong></div></div>
 <div class="roominfo" id="roominfo"></div><div class="leader" id="leader" hidden><strong>RACE ORDER</strong><div id="leaderlist"></div></div>
 <div class="controls"><div class="steer"><button class="control" id="left">◀</button><button class="control" id="right">▶</button></div><div class="pedals"><button class="control" id="brake">BRAKE</button><button class="control go" id="gas">GAS</button></div></div>
 <div id="message">WASD / 방향키로 조작 · 모바일은 화면 버튼</div>
 <div class="panel" id="lobby"><h1>TRACK <span>RACING</span> 3D</h1><p class="sub">간단하게 접속하고, 친구들과 서킷을 질주하세요.</p>
 <input class="field" id="nickname" maxlength="14" placeholder="닉네임" value="Racer"/>
 <input class="field" id="room" maxlength="8" placeholder="방 코드 (예: SPEED)" value="SPEED"/>
 <button class="btn" id="join">레이스 입장</button><button class="btn secondary" id="solo">혼자 연습하기</button>
 <p class="hint">최대 8명 · 3랩 레이스 · 온라인 방 코드를 친구에게 공유하세요.<br>현재 버전은 초기 플레이 테스트용 MVP입니다.</p></div>
</div></div>`;

const $ = id => document.getElementById(id);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb9d6df);
scene.fog = new THREE.Fog(0xb9d6df, 90, 230);
const camera = new THREE.PerspectiveCamera(58, innerWidth/innerHeight, .1, 500);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
$('game').prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff,0x66775d,2.0));
const sun = new THREE.DirectionalLight(0xffffff,2.1); sun.position.set(-35,55,25); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); scene.add(sun);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(500,500),new THREE.MeshStandardMaterial({color:0x75a76c,roughness:1}));
ground.rotation.x=-Math.PI/2; ground.position.y=-.12; ground.receiveShadow=true; scene.add(ground);

const N=220, RX=43, RZ=27, WIDTH=10;
const points=[];
for(let i=0;i<N;i++){const a=i/N*Math.PI*2;points.push(new THREE.Vector3(Math.cos(a)*RX,0,Math.sin(a)*RZ));}
const curve=new THREE.CatmullRomCurve3(points,true,'catmullrom',.15);
const trackVertices=[], trackIndices=[];
for(let i=0;i<=N;i++){
 const t=i/N, p=curve.getPointAt(t), tangent=curve.getTangentAt(t);
 const normal=new THREE.Vector3(-tangent.z,0,tangent.x).normalize();
 for(const side of [-1,1]){const v=p.clone().addScaledVector(normal,side*WIDTH/2);trackVertices.push(v.x,.015,v.z);}
 if(i<N){const k=i*2;trackIndices.push(k,k+1,k+2,k+1,k+3,k+2);}
}
const trackGeo=new THREE.BufferGeometry();trackGeo.setAttribute('position',new THREE.Float32BufferAttribute(trackVertices,3));trackGeo.setIndex(trackIndices);trackGeo.computeVertexNormals();
const track=new THREE.Mesh(trackGeo,new THREE.MeshStandardMaterial({color:0x343c44,roughness:.95,side:THREE.DoubleSide}));track.receiveShadow=true;scene.add(track);

function addEdge(offset,color){
 const pts=[];for(let i=0;i<=N;i++){const p=curve.getPointAt(i/N),t=curve.getTangentAt(i/N),n=new THREE.Vector3(-t.z,0,t.x).normalize();p.addScaledVector(n,offset);p.y=.08;pts.push(p);}
 const mesh=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),N,.16,5,true),new THREE.MeshStandardMaterial({color}));scene.add(mesh);
}
addEdge(WIDTH/2-.2,0xf4f1e7);addEdge(-WIDTH/2+.2,0xf4f1e7);
const dashMat=new THREE.MeshStandardMaterial({color:0xe8e6dc});
for(let i=0;i<44;i++){const p=curve.getPointAt(i/44),t=curve.getTangentAt(i/44);const dash=new THREE.Mesh(new THREE.BoxGeometry(.18,.035,1.1),dashMat);dash.position.set(p.x,.07,p.z);dash.rotation.y=-Math.atan2(t.z,t.x);scene.add(dash);}

function makeCar(color){
 const g=new THREE.Group();
 const paint=new THREE.MeshStandardMaterial({color,roughness:.35,metalness:.12});
 const dark=new THREE.MeshStandardMaterial({color:0x18212a,roughness:.75});
 const body=new THREE.Mesh(new THREE.BoxGeometry(2.15,.58,3.8),paint);body.position.y=.72;body.castShadow=true;g.add(body);
 const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.55,.65,1.8),new THREE.MeshStandardMaterial({color:0xb7d3dc,roughness:.25,metalness:.15}));cabin.position.set(0,1.27,-.15);cabin.castShadow=true;g.add(cabin);
 const nose=new THREE.Mesh(new THREE.BoxGeometry(1.8,.18,.45),dark);nose.position.set(0,.88,1.68);g.add(nose);
 for(const x of [-1.08,1.08])for(const z of [-1.2,1.2]){const w=new THREE.Mesh(new THREE.BoxGeometry(.34,.62,.82),dark);w.position.set(x,.48,z);g.add(w);}
 const lightMat=new THREE.MeshStandardMaterial({color:0xfff3c5,emissive:0x554422});
 for(const x of [-.68,.68]){const l=new THREE.Mesh(new THREE.BoxGeometry(.38,.16,.08),lightMat);l.position.set(x,.78,1.94);g.add(l);}
 return g;
}
const localCar=makeCar(0xff5b55);scene.add(localCar);
const remotes=new Map();
const colors=['#45b7ff','#ffd447','#7be0a3','#bd8cff','#ff8ac7','#ff9852','#80e7e7'];
let ws=null, myId=null, roomCode='', joined=false, online=false, started=false;
let x=0,z=0,heading=0,speed=0,lap=0,finished=false,lastProgress=0,lapStart=0,raceStart=0;
const totalLaps=3, keys={left:false,right:false,gas:false,brake:false};
const clock=new THREE.Clock();
function setStatus(t){$('connection').textContent=t;}
function send(o){if(ws&&ws.readyState===1)ws.send(JSON.stringify(o));}
function connect(name,room){
 const proto=location.protocol==='https:'?'wss':'ws';
 ws=new WebSocket(`${proto}://${location.host}/ws`);
 ws.onopen=()=>send({type:'join',name,room});
 ws.onmessage=e=>{
  const m=JSON.parse(e.data);
  if(m.type==='joined'){myId=m.id;roomCode=m.room;online=true;joined=true;$('lobby').hidden=true;setStatus('● ONLINE');$('roominfo').innerHTML=`ROOM <b>${roomCode}</b><br>친구에게 방 코드를 공유하세요`;updatePlayers(m.players);}
  if(m.type==='players')updatePlayers(m.players);
  if(m.type==='error')alert(m.message);
  if(m.type==='race-start'){startRace();}
  if(m.type==='race-reset'){lap=0;finished=false;started=false;resetCar();$('lap').textContent='0 / 3';}
 };
 ws.onclose=()=>{online=false;setStatus('● DISCONNECTED');};
 ws.onerror=()=>setStatus('● CONNECTION ERROR');
}
function updatePlayers(players){
 const ids=new Set();
 for(const p of players){if(p.id===myId)continue;ids.add(p.id);let r=remotes.get(p.id);
  if(!r){const car=makeCar(new THREE.Color(p.color));scene.add(car);r={car,data:p};remotes.set(p.id,r);}
  r.data=p;r.car.visible=true;
 }
 for(const [id,r] of remotes){if(!ids.has(id)){scene.remove(r.car);remotes.delete(id);}}
 $('leader').hidden=players.length<2;
 $('leaderlist').innerHTML=players.sort((a,b)=>b.lap-a.lap).map((p,i)=>`<div>${i+1}. ${p.name}${p.id===myId?' (YOU)':''} · ${p.lap}/${totalLaps}</div>`).join('');
}
function resetCar(){const p=curve.getPointAt(.01);const t=curve.getTangentAt(.01);x=p.x;z=p.z;heading=Math.atan2(t.x,t.z);speed=0;lap=0;lastProgress=.01;localCar.position.set(x,0,z);localCar.rotation.y=heading;lapStart=performance.now();}
function startRace(){started=true;finished=false;lap=0;resetCar();raceStart=performance.now();$('message').textContent='GO! 3랩을 완주하세요!';}
function nearestProgress(px,pz){let best=0,dist=Infinity;for(let i=0;i<N;i++){const p=points[i],d=(p.x-px)**2+(p.z-pz)**2;if(d<dist){dist=d;best=i/N;}}return best;}
function update(dt){
 if(joined&&!started&&!finished&&keys.gas){} // race starts explicitly via key/button
 const accel=keys.gas?23:0, braking=keys.brake?32:0;
 speed+=accel*dt;speed-=braking*dt;speed*=Math.pow(.985,dt*60);speed=Math.max(0,Math.min(34,speed));
 const steer=(keys.left?1:0)-(keys.right?1:0);
 heading+=steer*dt*(1.9*(.25+speed/34))*Math.sign(speed||1);
 x+=Math.sin(heading)*speed*dt;z+=Math.cos(heading)*speed*dt;
 const progress=nearestProgress(x,z), cp=curve.getPointAt(progress);
 const dist=Math.hypot(x-cp.x,z-cp.z);
 if(dist>WIDTH*.78){speed*=Math.pow(.91,dt*60);}
 if(dist>WIDTH*2.2){x=cp.x;z=cp.z;speed=0;}
 if(started&&!finished){
  if(lastProgress>.88&&progress<.12&&speed>3){lap++;$('lap').textContent=`${lap} / ${totalLaps}`;lastProgress=progress;if(lap>=totalLaps){finished=true;started=false;$('message').textContent='FINISH! 레이스 완료';}}
  else if(progress>lastProgress-.15)lastProgress=progress;
 }
 localCar.position.set(x,0,z);localCar.rotation.y=heading;
 $('speed').textContent=Math.round(speed*4.2);
 const elapsed=started?performance.now()-raceStart:(finished?performance.now()-raceStart:0);
 $('time').textContent=formatTime(elapsed);
 if(online)send({type:'state',x,z,rotation:heading,lap,finished});
 for(const r of remotes.values()){
  const d=r.data;r.car.position.lerp(new THREE.Vector3(d.x,0,d.z),.35);r.car.rotation.y=d.rotation;
 }
}
function formatTime(ms){const s=ms/1000;return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}.${Math.floor(s%1*10)}`;}
function animate(){
 requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);
 if(joined)update(dt);
 const target=new THREE.Vector3(x,0,z),behind=new THREE.Vector3(-Math.sin(heading)*13,8,-Math.cos(heading)*13);
 camera.position.lerp(target.clone().add(behind),.09);camera.lookAt(target.clone().add(new THREE.Vector3(0,1,0)));
 renderer.render(scene,camera);
}
function bindHold(id,key){const el=$(id);const down=e=>{e.preventDefault();keys[key]=true;};const up=e=>{e.preventDefault();keys[key]=false;};el.addEventListener('pointerdown',down);['pointerup','pointerleave','pointercancel'].forEach(ev=>el.addEventListener(ev,up));}
bindHold('left','left');bindHold('right','right');bindHold('gas','gas');bindHold('brake','brake');
addEventListener('keydown',e=>{if(['ArrowLeft','a','A'].includes(e.key))keys.left=true;if(['ArrowRight','d','D'].includes(e.key))keys.right=true;if(['ArrowUp','w','W'].includes(e.key))keys.gas=true;if(['ArrowDown','s','S'].includes(e.key))keys.brake=true;if(e.key===' '&&joined&&!started){send({type:'start'});if(!online)startRace();}});
addEventListener('keyup',e=>{if(['ArrowLeft','a','A'].includes(e.key))keys.left=false;if(['ArrowRight','d','D'].includes(e.key))keys.right=false;if(['ArrowUp','w','W'].includes(e.key))keys.gas=false;if(['ArrowDown','s','S'].includes(e.key))keys.brake=false;});
$('join').onclick=()=>{const name=$('nickname').value.trim()||'Racer',room=$('room').value.trim()||'SPEED';connect(name,room);};
$('solo').onclick=()=>{joined=true;online=false;myId='local';$('lobby').hidden=true;setStatus('● PRACTICE');$('roominfo').innerHTML='PRACTICE MODE';resetCar();};
$('message').addEventListener('click',()=>{if(joined&&!started&&!finished){if(online)send({type:'start'});else startRace();}});
$('message').textContent='레이스 시작: 화면의 메시지를 누르거나 스페이스바';
resetCar();
camera.position.set(0,40,65);camera.lookAt(0,0,0);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
animate();