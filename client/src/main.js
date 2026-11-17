import * as THREE from 'three';
import './style.css';

const app=document.querySelector('#app');
app.innerHTML=`
<div id="game"><div class="hud">
 <header class="topbar"><div class="brand">TRACK <span>RACING</span> 3D</div><div class="pill" id="connection">● OFFLINE</div></header>
 <div class="race-hud" id="raceHud"><div class="stat"><small>LAP</small><b id="lap">0 / 3</b></div><div class="stat"><small>TIME</small><b id="time">00:00.0</b></div><div class="stat"><small>SPEED</small><b id="speed">0</b><small>KM/H</small></div><div class="stat"><small>POSITION</small><b id="position">-</b></div></div>
 <div class="wallet" id="wallet">🪙 <b id="coinBalance">0</b></div><button class="shop-open" id="openShop">상점</button><div class="roominfo" id="roominfo"></div><div class="leader" id="leader" hidden><strong>RACE ORDER</strong><div id="leaderlist"></div></div>
 <div class="controls"><div class="steer"><button class="control" id="left">◀</button><button class="control" id="right">▶</button></div><div class="pedals"><button class="control" id="brake">BRAKE</button><button class="control go" id="gas">GAS</button></div></div>
 <div id="message">WASD / 방향키로 조작 · 모바일은 화면 버튼</div>
 <section class="panel" id="lobby">
  <div class="eyebrow">ONLINE CIRCUIT RACING</div><h1>TRACK <span>RACING</span> 3D</h1><p class="sub">국내 서킷에서 펼쳐지는 온라인 레이싱</p>
  <div class="setup-grid"><label>닉네임<input class="field" id="nickname" maxlength="14" value="Racer"/></label><label>방 코드<input class="field" id="room" maxlength="8" value="SPEED"/></label></div>
  <button class="btn" id="join">온라인 방 만들기 / 입장</button><button class="btn secondary" id="solo">혼자 연습하기</button>
  <p class="hint">온라인 최대 10명 · 3랩 · 팀전은 5대5</p>
 </section>
 <section class="panel setup-panel" id="setup" hidden>
  <div class="eyebrow">RACE SETTINGS</div><h2>레이스 설정</h2>
  <div class="field-label">경기 모드</div><div class="segmented"><button data-mode="individual" class="active">개인전</button><button data-mode="team">팀전</button></div>
  <div class="field-label">서킷 선택</div><div class="track-grid">
   <button data-track="yeongam" class="track-choice active"><b>KIC</b><span>코리아 인터내셔널 서킷</span><small>영암 · 5.615 km</small></button>
   <button data-track="inje" class="track-choice"><b>INJE</b><span>인제 스피디움</span><small>인제 · 3.908 km</small></button>
   <button data-track="everland" class="track-choice"><b>EVERLAND</b><span>에버랜드 스피드웨이</span><small>용인 · 4.346 km</small></button>
   <button data-track="taebaek" class="track-choice"><b>TAEBAEK</b><span>태백 스피드웨이</span><small>태백 · 2.500 km</small></button>
  </div>
  <div class="field-label">차량 클래스</div><div class="car-grid">
   <button data-car="acceleration" class="car-choice"><b>01</b><span>가속형</span><small>초반 가속 우수</small></button>
   <button data-car="topSpeed" class="car-choice"><b>02</b><span>최고속도형</span><small>직선 구간 강점</small></button>
   <button data-car="cornering" class="car-choice"><b>03</b><span>코너링형</span><small>조향과 안정성</small></button>
   <button data-car="balance" class="car-choice active"><b>04</b><span>밸런스형</span><small>전체 능력 균형</small></button>
  </div>
  <div id="teamSelect" hidden><div class="field-label">팀 선택</div><div class="segmented team-segment"><button data-team="red">🔴 레드팀</button><button data-team="blue">🔵 블루팀</button></div></div>
  <div class="nickname-edit"><label for="nicknameEdit">내 닉네임</label><div><input class="field" id="nicknameEdit" maxlength="14" placeholder="닉네임 입력"/><button class="btn" id="saveNickname">변경</button></div></div>
  <div class="room-roster"><div><b>참가자</b><span id="rosterCount">1 / 10</span></div><div id="roster"></div></div>
  <button class="btn" id="startRace">3랩 레이스 시작</button><button class="btn secondary" id="backLobby">나가기</button>
  <p class="hint" id="hostHint">방장만 경기 설정과 시작을 진행할 수 있습니다.</p>
 </section>
 <section class="panel result-panel" id="results" hidden>
  <div class="eyebrow">RACE COMPLETE</div><h2>레이스 결과</h2><div id="teamScore"></div><div id="resultRows"></div>
  <button class="btn" id="again">로비로 돌아가기</button>
 </section>
 <section class="panel shop-panel" id="shop" hidden>
  <div class="shop-head"><div><div class="eyebrow">GARAGE & SHOP</div><h2>레이싱 상점</h2></div><button class="close-shop" id="closeShop">✕</button></div>
  <div class="shop-balance">보유 코인 <b id="shopCoins">0</b> 🪙</div>
  <div class="field-label">꾸밀 차량</div><div class="segmented shop-cars"><button data-shopcar="acceleration">가속형</button><button data-shopcar="topSpeed">최고속도형</button><button data-shopcar="cornering">코너링형</button><button data-shopcar="balance">밸런스형</button></div>
  <div class="shop-tabs"><button class="active" data-shoptab="paint">페인트 · 30코인</button><button data-shoptab="decal">문양 · 20코인</button></div>
  <div id="shopItems" class="shop-items"></div>
  <div id="decalEditor" hidden>
   <div class="field-label">문양 위치 조정</div>
   <label class="range-label">좌우 <input id="decalX" type="range" min="-0.8" max="0.8" step="0.05" value="0"/></label>
   <label class="range-label">앞뒤 <input id="decalZ" type="range" min="-1.5" max="1.5" step="0.05" value="0"/></label>
   <label class="range-label">회전 <input id="decalRotation" type="range" min="0" max="360" step="5" value="0"/></label>
   <button class="btn" id="saveDecalPosition">문양 위치 저장</button>
  </div>
  <p class="hint">구매한 페인트와 문양은 차량 클래스별로 보관돼. 문양 위치도 직접 조정할 수 있어.</p>
 </section>
</div></div>

const $=id=>document.getElementById(id);
const TRACKS={
 yeongam:{name:'코리아 인터내셔널 서킷',short:'KIC · YEONGAM',color:0x3b434a,points:[[-48,-5],[-44,-24],[-28,-32],[-9,-31],[12,-30],[34,-26],[46,-17],[49,-3],[42,8],[29,10],[20,4],[12,15],[7,28],[-5,32],[-18,27],[-26,15],[-38,12],[-49,5]]},
 inje:{name:'인제 스피디움',short:'INJE SPEEDIUM',color:0x3c454b,points:[[-42,-4],[-34,-24],[-18,-30],[0,-28],[16,-20],[35,-21],[43,-8],[37,5],[25,8],[20,19],[8,27],[-6,25],[-14,13],[-26,12],[-40,8],[-47,0]]},
 everland:{name:'에버랜드 스피드웨이',short:'EVERLAND SPEEDWAY',color:0x3c454b,points:[[-42,-9],[-35,-25],[-20,-30],[-4,-28],[14,-25],[33,-19],[43,-7],[41,6],[30,16],[15,18],[5,12],[-4,19],[-18,25],[-32,17],[-44,7]]},
 taebaek:{name:'태백 스피드웨이',short:'TAEBAEK SPEEDWAY',color:0x3c454b,points:[[-38,-8],[-34,-24],[-18,-30],[2,-27],[23,-20],[38,-10],[40,4],[28,13],[15,9],[8,20],[-6,28],[-23,23],[-36,12]]}
};
const CLASSES={
 acceleration:{label:'가속형',max:31,accel:28,turn:1.65,grip:.9},
 topSpeed:{label:'최고속도형',max:39,accel:19,turn:1.25,grip:.82},
 cornering:{label:'코너링형',max:29,accel:21,turn:2.25,grip:1.18},
 balance:{label:'밸런스형',max:34,accel:23,turn:1.8,grip:1}
};
let scene,camera,renderer,curve,localCar,ground,trackGroup;
let ws=null,myId=null,roomCode='',online=false,joined=false,hostId=null;
let mode='individual',trackId='yeongam',carId='balance',team=null,players=[];
let started=false,finished=false,lap=0,progress=0,lastProgress=0,speed=0,heading=0,x=0,z=0;
let raceStart=0,elapsed=0,sendClock=0,solo=false;
const keys={left:false,right:false,gas:false,brake:false};
const remotes=new Map(),clock=new THREE.Clock();
const pointsAward=[10,9,8,7,6,5,4,3,2,1];
const PAINTS=[{id:'red',name:'레이싱 레드',color:'#ef4444'},{id:'blue',name:'일렉트릭 블루',color:'#2684ff'},{id:'green',name:'네온 그린',color:'#55d66b'},{id:'purple',name:'퍼플 메탈',color:'#9b59d0'},{id:'white',name:'펄 화이트',color:'#f2f3f4'},{id:'black',name:'미드나잇 블랙',color:'#222831'},{id:'orange',name:'레이싱 오렌지',color:'#ff8a24'},{id:'pink',name:'핫 핑크',color:'#f052a5'}];
const DECALS=[{id:'bolt',name:'번개',glyph:'ϟ'},{id:'star',name:'스타',glyph:'★'},{id:'number',name:'레이싱 넘버',glyph:'03'},{id:'stripe',name:'스트라이프',glyph:'〓'},{id:'flame',name:'파이어',glyph:'♨'},{id:'wing',name:'윙',glyph:'翼'}];
const walletKey='trackRacing3D_wallet_v1';
let wallet=loadWallet(),shopCar='balance',shopTab='paint',selectedDecal=null;
function loadWallet(){try{return JSON.parse(localStorage.getItem(walletKey))||{coins:0,ownedPaint:{},ownedDecal:{},equipped:{}};}catch{return {coins:0,ownedPaint:{},ownedDecal:{},equipped:{}};}}
function saveWallet(){localStorage.setItem(walletKey,JSON.stringify(wallet));updateWalletUI();}
function updateWalletUI(){$('coinBalance').textContent=wallet.coins;$('shopCoins').textContent=wallet.coins;}
function carInventory(type){wallet.ownedPaint[type]??=['default'];wallet.ownedDecal[type]??=[];wallet.equipped[type]??={paint:'default',decal:null,position:{x:0,z:0,rotation:0}};return wallet.equipped[type];}
function currentPaint(type){const id=carInventory(type).paint;return id==='default'?'#ffd447':PAINTS.find(p=>p.id===id)?.color||'#ffd447';}
function cosmeticsFor(type){const e=carInventory(type);return {paint:currentPaint(type),decal:e.decal,position:e.position};}
function grantCoins(amount){if(!Number.isFinite(amount)||amount<=0)return;wallet.coins+=amount;saveWallet();}
function buyItem(kind,id){const cost=kind==='paint'?30:20,owned=kind==='paint'?wallet.ownedPaint[shopCar]:wallet.ownedDecal[shopCar];if(owned.includes(id)){if(kind==='paint')wallet.equipped[shopCar].paint=id;else{wallet.equipped[shopCar].decal=id;selectedDecal=id;}saveWallet();applyLocalCosmetics();renderShop();return;}
 if(wallet.coins<cost){alert('코인이 부족합니다. 레이스에 참가해 코인을 모아주세요.');return;}
 wallet.coins-=cost;owned.push(id);if(kind==='paint')wallet.equipped[shopCar].paint=id;else{wallet.equipped[shopCar].decal=id;selectedDecal=id;}saveWallet();applyLocalCosmetics();renderShop();}
function renderShop(){updateWalletUI();document.querySelectorAll('[data-shopcar]').forEach(b=>b.classList.toggle('active',b.dataset.shopcar===shopCar));document.querySelectorAll('[data-shoptab]').forEach(b=>b.classList.toggle('active',b.dataset.shoptab===shopTab));const inv=carInventory(shopCar),items=shopTab==='paint'?PAINTS:DECALS,owned=shopTab==='paint'?wallet.ownedPaint[shopCar]:wallet.ownedDecal[shopCar],equipped=shopTab==='paint'?inv.paint:inv.decal;
 $('shopItems').innerHTML=items.map(item=>{const isOwned=owned.includes(item.id),active=equipped===item.id;return '<button class="shop-item '+(active?'equipped':'')+'" data-buy="'+item.id+'"><span class="swatch" style="'+(shopTab==='paint'?'background:'+item.color:'')+'">'+(shopTab==='decal'?item.glyph:'')+'</span><span><b>'+item.name+'</b><small>'+(isOwned?(active?'장착 중':'보유 · 장착 가능'):(shopTab==='paint'?30:20)+' 코인')+'</small></span><strong>'+(active?'✓':isOwned?'장착':'구매')+'</strong></button>';}).join('');
 $('shopItems').querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buyItem(shopTab,b.dataset.buy));
 $('decalEditor').hidden=shopTab!=='decal'||!inv.decal;
 $('decalX').value=inv.position.x;$('decalZ').value=inv.position.z;$('decalRotation').value=inv.position.rotation;
}
function makeDecalTexture(id){const item=DECALS.find(d=>d.id===id);const c=document.createElement('canvas');c.width=256;c.height=256;const ctx=c.getContext('2d');ctx.clearRect(0,0,256,256);ctx.fillStyle='#ffffff';ctx.strokeStyle='#ffffff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 190px Arial';ctx.shadowColor='#111827';ctx.shadowBlur=5;ctx.fillText(item?.glyph||'★',128,132);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function applyCarCosmetics(car,type){if(!car)return;const paint=car.userData.bodyMaterial;if(paint)paint.color.set(currentPaint(type));if(car.userData.decal){car.remove(car.userData.decal);car.userData.decal.material.map?.dispose();}const e=carInventory(type);if(e.decal){const mat=new THREE.MeshBasicMaterial({map:makeDecalTexture(e.decal),transparent:true,depthWrite:false,side:THREE.DoubleSide});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.85,.85),mat);mesh.rotation.x=-Math.PI/2;mesh.rotation.z=(e.position.rotation||0)*Math.PI/180;mesh.position.set(e.position.x,.999,e.position.z);car.add(mesh);car.userData.decal=mesh;} }
function applyLocalCosmetics(){applyCarCosmetics(localCar,carId);send({type:'cosmetics',cosmetics:cosmeticsFor(carId)});}
function awardRaceCoins(m){const result=m.results?.find(r=>r.id===myId);if(!result||m.raceId===lastAwardedRace)return;lastAwardedRace=m.raceId||('local-'+Date.now());grantCoins(result.coins||0);$('message').textContent='레이스 보상 +' +(result.coins||0)+' 코인';}
let lastAwardedRace=null;

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const setStatus=t=>$('connection').textContent=t;
function send(o){if(ws&&ws.readyState===1)ws.send(JSON.stringify(o));}
function showPanel(id){['lobby','setup','results','shop'].forEach(k=>$(k).hidden=k!==id);}
function makeCar(color){
 const g=new THREE.Group(),paint=new THREE.MeshStandardMaterial({color,roughness:.35,metalness:.12}),dark=new THREE.MeshStandardMaterial({color:0x17212a,roughness:.7});
 const body=new THREE.Mesh(new THREE.BoxGeometry(2.1,.58,3.8),paint);body.position.y=.7;body.castShadow=true;g.add(body);g.userData.bodyMaterial=paint;
 const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.5,.62,1.7),new THREE.MeshStandardMaterial({color:0x9fc2ce,metalness:.2,roughness:.25}));cabin.position.set(0,1.23,-.18);cabin.castShadow=true;g.add(cabin);
 for(const sx of [-1.06,1.06])for(const sz of [-1.2,1.2]){const w=new THREE.Mesh(new THREE.BoxGeometry(.34,.58,.8),dark);w.position.set(sx,.44,sz);g.add(w);}
 const spoiler=new THREE.Mesh(new THREE.BoxGeometry(2.05,.12,.3),dark);spoiler.position.set(0,1.05,-1.72);g.add(spoiler);
 return g;
}
function initScene(){
 scene=new THREE.Scene();scene.background=new THREE.Color(0xb8d4df);scene.fog=new THREE.Fog(0xb8d4df,100,230);
 camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,500);
 renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;$('game').prepend(renderer.domElement);
 scene.add(new THREE.HemisphereLight(0xffffff,0x60715b,1.8));const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(-35,55,25);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);
 ground=new THREE.Mesh(new THREE.PlaneGeometry(500,500),new THREE.MeshStandardMaterial({color:0x719e6b,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.16;ground.receiveShadow=true;scene.add(ground);
 localCar=makeCar(0xffd447);scene.add(localCar);applyCarCosmetics(localCar,carId);buildTrack(trackId);resetCar();
 addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
 animate();
}
function buildTrack(id){
 trackId=id;if(trackGroup)scene.remove(trackGroup);trackGroup=new THREE.Group();scene.add(trackGroup);
 const data=TRACKS[id],raw=data.points.map(([a,b])=>new THREE.Vector3(a,0,b));
 curve=new THREE.CatmullRomCurve3(raw,true,'catmullrom',.15);
 const n=320,width=10,verts=[],indices=[];
 for(let i=0;i<=n;i++){const p=curve.getPointAt(i/n),t=curve.getTangentAt(i/n),normal=new THREE.Vector3(-t.z,0,t.x).normalize();
  for(const s of [-1,1]){const q=p.clone().addScaledVector(normal,s*width/2);verts.push(q.x,.02,q.z);}
  if(i<n){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();
 const road=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:data.color,roughness:.96,side:THREE.DoubleSide}));road.receiveShadow=true;trackGroup.add(road);
 for(const side of [-1,1]){const pts=[];for(let i=0;i<=n;i++){const p=curve.getPointAt(i/n),t=curve.getTangentAt(i/n),nn=new THREE.Vector3(-t.z,0,t.x).normalize();p.addScaledVector(nn,side*(width/2-.18));p.y=.09;pts.push(p);}
  trackGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),n,.14,5,true),new THREE.MeshStandardMaterial({color:0xf1eee3})));
 }
 const centerMat=new THREE.MeshStandardMaterial({color:0xe7e5dc});
 for(let i=0;i<64;i++){const p=curve.getPointAt(i/64),t=curve.getTangentAt(i/64),d=new THREE.Mesh(new THREE.BoxGeometry(.16,.035,1.1),centerMat);d.position.set(p.x,.075,p.z);d.rotation.y=-Math.atan2(t.z,t.x);trackGroup.add(d);}
 // Start/finish checker strip
 const start=curve.getPointAt(0),tan=curve.getTangentAt(0),normal=new THREE.Vector3(-tan.z,0,tan.x).normalize();
 for(let i=0;i<10;i++)for(let j=0;j<2;j++){const tile=new THREE.Mesh(new THREE.BoxGeometry(width/10,.05,.65),new THREE.MeshStandardMaterial({color:(i+j)%2?0x20252a:0xffffff}));const offset=(i-4.5)*width/10;tile.position.copy(start).addScaledVector(normal,offset).addScaledVector(tan,j*.65-.32);tile.position.y=.11;tile.rotation.y=-Math.atan2(tan.z,tan.x);trackGroup.add(tile);}
 // Simple scenery markers
 const postMat=new THREE.MeshStandardMaterial({color:0xf6f0df});
 for(let i=0;i<24;i++){const p=curve.getPointAt(i/24),t=curve.getTangentAt(i/24),nn=new THREE.Vector3(-t.z,0,t.x).normalize();p.addScaledVector(nn,sideSign(i)*13);const post=new THREE.Mesh(new THREE.BoxGeometry(.5,1.8,.5),postMat);post.position.set(p.x,.9,p.z);trackGroup.add(post);}
}
function sideSign(i){return i%2?1:-1;}
function nearest(px,pz){let best=0,dist=Infinity;for(let i=0;i<400;i++){const p=curve.getPointAt(i/400),d=(p.x-px)**2+(p.z-pz)**2;if(d<dist){dist=d;best=i/400;}}return {progress:best,dist:Math.sqrt(dist),point:curve.getPointAt(best)};}
function resetCar(){
 const p=curve.getPointAt(.005),t=curve.getTangentAt(.005);x=p.x;z=p.z;heading=Math.atan2(t.x,t.z);speed=0;lap=0;progress=.005;lastProgress=.005;finished=false;localCar.position.set(x,0,z);localCar.rotation.y=heading;
 $('lap').textContent='0 / 3';$('time').textContent='00:00.0';$('position').textContent='-';
}
function connect(){
 const proto=location.protocol==='https:'?'wss':'ws';ws=new WebSocket(`${proto}://${location.host}/ws`);
 ws.onopen=()=>send({type:'join',name:$('nickname').value.trim()||'Racer',room:$('room').value.trim()||'SPEED',car:carId,team,cosmetics:cosmeticsFor(carId)});
 ws.onmessage=e=>{const m=JSON.parse(e.data);
  if(m.type==='joined'){myId=m.id;online=true;joined=true;setStatus('● ONLINE');}
  if(m.type==='error')alert(m.message);
  if(m.type==='room-state')applyRoom(m);
  if(m.type==='players')updateRemoteData(m.players);
  if(m.type==='race-start'){startRace();}
  if(m.type==='race-results')showResults(m);
 };
 ws.onclose=()=>{online=false;setStatus('● DISCONNECTED');};
 ws.onerror=()=>setStatus('● CONNECTION ERROR');
}
function applyRoom(m){
 hostId=m.hostId;mode=m.config.mode;trackId=m.config.track;players=m.players;
 const self=players.find(p=>p.id===myId);if(self){carId=self.car;team=self.team;}
 if(trackId!==activeTrack){activeTrack=trackId;buildTrack(trackId);resetCar();}
 $('teamSelect').hidden=mode!=='team';
 $('hostHint').textContent=myId===hostId?'방장입니다. 설정을 선택하고 레이스를 시작하세요.':'방장이 레이스를 시작할 때까지 기다려주세요.';
 $('startRace').disabled=myId!==hostId;
 $('startRace').textContent=myId===hostId?'3랩 레이스 시작':'방장 시작 대기 중';
 $('roominfo').innerHTML=`ROOM <b>${roomCode}</b><br>${TRACKS[trackId].short} · ${mode==='team'?'TEAM':'INDIVIDUAL'}`;
 $('rosterCount').textContent=`${players.length} / 10`;
 if(document.activeElement!==$('nicknameEdit'))$('nicknameEdit').value=self?.name||$('nickname').value.trim()||'Racer';
 $('roster').innerHTML=players.map(p=>`<span class="roster-chip ${p.team||''}">${p.team==='red'?'🔴':p.team==='blue'?'🔵':'🏎'} ${escapeHtml(p.name)} ${p.id===hostId?'★':''}</span>`).join('');
 document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
 document.querySelectorAll('[data-track]').forEach(b=>b.classList.toggle('active',b.dataset.track===trackId));
 document.querySelectorAll('[data-car]').forEach(b=>b.classList.toggle('active',b.dataset.car===carId));
 document.querySelectorAll('[data-team]').forEach(b=>b.classList.toggle('active',b.dataset.team===team));
 $('teamSelect').hidden=mode!=='team';
 showPanel(m.started?'':'setup');
 updateRemoteData(players);
}
let activeTrack='yeongam';
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function updateRemoteData(list){
 players=list||players;const ids=new Set();
 for(const p of players){if(p.id===myId)continue;ids.add(p.id);let r=remotes.get(p.id);
  if(!r){r={car:makeCar(p.color||0x42a5ff),data:p};scene.add(r.car);remotes.set(p.id,r);}
  r.data=p;r.car.visible=true;
  const cosmeticSig=JSON.stringify(p.cosmetics||null);
  if(r.car.userData.cosmeticSignature!==cosmeticSig){
   if(r.car.userData.decal){r.car.remove(r.car.userData.decal);r.car.userData.decal.material.map?.dispose();r.car.userData.decal=null;}
   if(p.cosmetics?.paint)r.car.userData.bodyMaterial.color.set(p.cosmetics.paint);
   if(p.cosmetics?.decal){const mat=new THREE.MeshBasicMaterial({map:makeDecalTexture(p.cosmetics.decal),transparent:true,depthWrite:false,side:THREE.DoubleSide});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.85,.85),mat);mesh.rotation.x=-Math.PI/2;mesh.rotation.z=(p.cosmetics.position?.rotation||0)*Math.PI/180;mesh.position.set(p.cosmetics.position?.x||0,.999,p.cosmetics.position?.z||0);r.car.add(mesh);r.car.userData.decal=mesh;}
   r.car.userData.cosmeticSignature=cosmeticSig;
  }
 }
 for(const [id,r] of remotes)if(!ids.has(id)){scene.remove(r.car);remotes.delete(id);}
 const ranked=[...players].sort((a,b)=>b.lap-a.lap||b.progress-a.progress);
 $('leader').hidden=players.length<2||!started;
 $('leaderlist').innerHTML=ranked.slice(0,10).map((p,i)=>`<div>${i+1}. ${escapeHtml(p.name)} · ${p.lap}/3</div>`).join('');
 $('position').textContent=ranked.findIndex(p=>p.id===myId)+1||'-';
}
function startRace(){
 started=true;finished=false;elapsed=0;raceStart=performance.now();resetCar();$('raceHud').style.display='flex';$('message').textContent='GO! 3랩을 완주하세요!';showPanel('');
}
function finishRace(){
 if(finished)return;finished=true;started=false;speed=0;elapsed=performance.now()-raceStart;
 $('message').textContent='FINISH! 결과를 기다리는 중';
 if(solo){showResults({mode:'individual',results:[{id:myId,name:$('nickname').value.trim()||'Racer',team:null,finished:true,rank:1,points:10,coins:0}],raceId:'solo-'+Date.now(),teams:{red:0,blue:0,winner:'draw'}});}
 else send({type:'finish',elapsed});
}
function showResults(m){
 awardRaceCoins(m);
 started=false;finished=true;showPanel('results');$('leader').hidden=true;
 if(m.mode==='team'){
  const t=m.teams;$('teamScore').innerHTML=`<div class="scoreboard"><div class="red-score"><small>RED TEAM</small><b>${t.red}</b></div><div class="versus">VS</div><div class="blue-score"><small>BLUE TEAM</small><b>${t.blue}</b></div></div><div class="winner">${t.winner==='draw'?'무승부':t.winner==='red'?'🔴 레드팀 승리':'🔵 블루팀 승리'}</div>`;
 }else $('teamScore').innerHTML='';
 $('resultRows').innerHTML=m.results.map(r=>`<div class="result-row ${r.finished?'':'dnf'}"><b>${r.rank||'DNF'}</b><span>${r.team==='red'?'🔴':r.team==='blue'?'🔵':'🏁'} ${escapeHtml(r.name)}</span><strong>${r.points}점 · +${r.coins||0}🪙</strong></div>`).join('');
 $('again').textContent=myId===hostId?'로비로 돌아가기':'결과 확인 완료';
}
function setMode(v){mode=v;if(online)send({type:'configure',mode,track:trackId});}
function setTrack(v){trackId=v;activeTrack=v;buildTrack(v);resetCar();if(online)send({type:'configure',mode,track:trackId});}
function selectCar(v){carId=v;applyLocalCosmetics();if(online)send({type:'select',car:carId,team});}
function selectTeam(v){team=v;if(online)send({type:'select',car:carId,team});}
function startLocal(){started=true;finished=false;elapsed=0;raceStart=performance.now();resetCar();$('raceHud').style.display='flex';showPanel('');$('message').textContent='GO! 3랩을 완주하세요!';}
function update(dt){
 const stats=CLASSES[carId],accel=keys.gas?stats.accel:0,brake=keys.brake?34:0;
 if(started){speed+=accel*dt;speed-=brake*dt;speed*=Math.pow(.989,dt*60);speed=clamp(speed,0,stats.max);
  const steer=(keys.left?1:0)-(keys.right?1:0);heading+=steer*dt*stats.turn*(.25+speed/stats.max)*Math.sign(speed||1);
  x+=Math.sin(heading)*speed*dt;z+=Math.cos(heading)*speed*dt;
  const near=nearest(x,z);if(near.dist>5.9)speed*=Math.pow(stats.grip<1?.86:.92,dt*60);
  if(near.dist>13){x=near.point.x;z=near.point.z;speed*=.35;}
  const p=near.progress;
  if(lastProgress>.88&&p<.12&&speed>2.5){lap++;$('lap').textContent=`${lap} / 3`;lastProgress=p;if(lap>=3)finishRace();}
  else if(p>lastProgress-.12)lastProgress=p;
  progress=p;
  elapsed=performance.now()-raceStart;
  $('time').textContent=formatTime(elapsed);
  sendClock+=dt;if(online&&sendClock>.08){sendClock=0;send({type:'state',x,z,rotation:heading,lap,progress});}
 }
 $('speed').textContent=Math.round(speed*4.2);
 localCar.position.set(x,0,z);localCar.rotation.y=heading;
 for(const r of remotes.values()){const d=r.data;r.car.position.lerp(new THREE.Vector3(d.x,0,d.z),.28);r.car.rotation.y=d.rotation;}
}
function formatTime(ms){const s=ms/1000;return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}.${Math.floor(s%1*10)}`;}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);if(joined)update(dt);
 const target=new THREE.Vector3(x,0,z),behind=new THREE.Vector3(-Math.sin(heading)*13,8,-Math.cos(heading)*13);
 camera.position.lerp(target.clone().add(behind),.09);camera.lookAt(target.clone().add(new THREE.Vector3(0,1,0)));renderer.render(scene,camera);}
function hold(id,key){const el=$(id),down=e=>{e.preventDefault();keys[key]=true;},up=e=>{e.preventDefault();keys[key]=false;};el.addEventListener('pointerdown',down);['pointerup','pointerleave','pointercancel'].forEach(ev=>el.addEventListener(ev,up));}
hold('left','left');hold('right','right');hold('gas','gas');hold('brake','brake');
addEventListener('keydown',e=>{if(['ArrowLeft','a','A'].includes(e.key))keys.left=true;if(['ArrowRight','d','D'].includes(e.key))keys.right=true;if(['ArrowUp','w','W'].includes(e.key))keys.gas=true;if(['ArrowDown','s','S'].includes(e.key))keys.brake=true;});
addEventListener('keyup',e=>{if(['ArrowLeft','a','A'].includes(e.key))keys.left=false;if(['ArrowRight','d','D'].includes(e.key))keys.right=false;if(['ArrowUp','w','W'].includes(e.key))keys.gas=false;if(['ArrowDown','s','S'].includes(e.key))keys.brake=false;});
$('join').onclick=()=>{if(joined)return;roomCode=$('room').value.trim().toUpperCase()||'SPEED';connect();};
function saveNickname(){
 const value=$('nicknameEdit').value.trim();
 if(!value){alert('닉네임을 입력해주세요.');return;}
 if(value.length>14){alert('닉네임은 14자 이내로 입력해주세요.');return;}
 $('nickname').value=value;
 if(online)send({type:'rename',name:value});
 else if(solo)$('roster').innerHTML='<span class="roster-chip">🏎 '+escapeHtml(value)+'</span>';
}
$('saveNickname').onclick=saveNickname;
$('nicknameEdit').addEventListener('keydown',e=>{if(e.key==='Enter')saveNickname();});

$('solo').onclick=()=>{solo=true;joined=true;online=false;myId='local';mode='individual';$('nicknameEdit').value=$('nickname').value.trim()||'Racer';showPanel('setup');setStatus('● PRACTICE');$('roominfo').textContent='PRACTICE MODE';$('roster').innerHTML='<span class="roster-chip">🏎 나</span>';$('rosterCount').textContent='1 / 1';$('hostHint').textContent='혼자 연습 모드입니다.';$('startRace').disabled=false;};
$('backLobby').onclick=()=>{if(ws)ws.close();joined=false;solo=false;showPanel('lobby');setStatus('● OFFLINE');};
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{if(myId!==hostId&&!solo)return;setMode(b.dataset.mode);});
document.querySelectorAll('[data-track]').forEach(b=>b.onclick=()=>{if(myId!==hostId&&!solo)return;setTrack(b.dataset.track);});
document.querySelectorAll('[data-car]').forEach(b=>b.onclick=()=>selectCar(b.dataset.car));
document.querySelectorAll('[data-team]').forEach(b=>b.onclick=()=>selectTeam(b.dataset.team));
$('startRace').onclick=()=>{if(solo){startLocal();return;}if(myId===hostId)send({type:'start'});};
$('again').onclick=()=>{showPanel('setup');if(solo){resetCar();$('startRace').disabled=false;}else send({type:'restart'});};
$('openShop').onclick=()=>{shopCar=carId;renderShop();showPanel('shop');};
$('closeShop').onclick=()=>showPanel(joined?'setup':'lobby');
document.querySelectorAll('[data-shopcar]').forEach(b=>b.onclick=()=>{shopCar=b.dataset.shopcar;renderShop();});
document.querySelectorAll('[data-shoptab]').forEach(b=>b.onclick=()=>{shopTab=b.dataset.shoptab;renderShop();});
function updateDecalPreview(){const e=carInventory(shopCar);e.position={x:Number($('decalX').value),z:Number($('decalZ').value),rotation:Number($('decalRotation').value)};if(shopCar===carId)applyLocalCosmetics();}
['decalX','decalZ','decalRotation'].forEach(id=>$(id).addEventListener('input',updateDecalPreview));
$('saveDecalPosition').onclick=()=>{updateDecalPreview();saveWallet();renderShop();};
updateWalletUI();
initScene();
