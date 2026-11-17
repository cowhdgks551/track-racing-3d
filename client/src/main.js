import * as THREE from 'three';
import './style.css';

const app=document.querySelector('#app');
app.innerHTML=`
<div id="game"><div class="hud">
 <header class="topbar"><div class="brand">TRACK <span>RACING</span> 3D</div><div class="pill" id="connection">● OFFLINE</div></header>
 <div class="race-hud" id="raceHud"><div class="stat"><small>LAP</small><b id="lap">0 / 3</b></div><div class="stat"><small>TIME</small><b id="time">00:00.0</b></div><div class="stat"><small>SPEED</small><b id="speed">0</b><small>KM/H</small></div><div class="stat"><small>POSITION</small><b id="position">-</b></div></div>
 <div class="wallet" id="wallet">🪙 <b id="coinBalance">0</b></div><button class="garage-open" id="openGarage">차고</button><button class="shop-open" id="openShop">상점</button><div class="roominfo" id="roominfo"></div><div class="leader" id="leader" hidden><strong>RACE ORDER</strong><div id="leaderlist"></div></div>
 <div class="controls"><div class="steer"><button class="control" id="left">◀</button><button class="control" id="right">▶</button></div><div class="pedals"><button class="control" id="brake">BRAKE</button><button class="control go" id="gas">GAS</button></div></div>
 <div id="message">WASD / 방향키로 조작 · 모바일은 화면 버튼</div>
 <section class="panel" id="lobby">
  <div class="eyebrow">ONLINE CIRCUIT RACING</div><h1>TRACK <span>RACING</span> 3D</h1><p class="sub">국내 서킷에서 펼쳐지는 온라인 레이싱</p>
  <div class="account-box" id="accountBox">
   <div class="account-title">PLAYER ACCOUNT <span id="authStatus">게스트 플레이</span></div>
   <div class="account-fields"><input class="field" id="accountEmail" type="email" autocomplete="email" placeholder="이메일"/><input class="field" id="accountPassword" type="password" autocomplete="current-password" placeholder="비밀번호"/></div>
   <div class="account-actions"><button class="btn" id="signIn">로그인</button><button class="btn secondary" id="signUp">회원가입</button><button class="btn secondary" id="signOut" hidden>로그아웃</button></div>
   <p class="hint" id="accountMessage">로그인하면 코인과 차고가 계정에 안전하게 저장됩니다.</p>
  </div>
  <div class="setup-grid"><label>닉네임<input class="field" id="nickname" maxlength="14" value="Racer"/></label><label>방 코드<input class="field" id="room" maxlength="8" value="SPEED"/></label></div>
  <button class="btn" id="join">온라인 방 만들기 / 입장</button><button class="btn secondary" id="solo">혼자 연습하기</button><button class="btn secondary" id="timeAttack">⏱ 타임어택 도전</button>
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
  <div class="field-label">차량 등급</div>
  <div class="grade-grid" id="gradeGrid">
   <button data-grade="D" class="grade-choice active"><b>D</b><small>최고 60</small></button>
   <button data-grade="C" class="grade-choice"><b>C</b><small>최고 65</small></button>
   <button data-grade="B" class="grade-choice"><b>B</b><small>최고 70</small></button>
   <button data-grade="A" class="grade-choice"><b>A</b><small>최고 75</small></button>
  </div>
  <div class="vehicle-stat-panel" id="vehicleStats"></div><div class="field-label">차량 구매 · 등급별 독립 차량</div><div id="vehicleShop" class="vehicle-shop"></div><div class="field-label">타임어택 기록실</div><div id="timeAttackBoard" class="time-attack-board"><button class="btn secondary" id="refreshRecords">기록 불러오기</button></div>
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
 <section class="panel garage-panel" id="garage" hidden>
  <div class="shop-head"><div><div class="eyebrow">MY COLLECTION</div><h2>나의 차고</h2></div><button class="close-shop" id="closeGarage">✕</button></div>
  <div class="shop-balance">보유 코인 <b id="garageCoins">0</b> 🪙</div>
  <div class="field-label">내 차량</div><div id="garageVehicles" class="garage-vehicles"></div>
  <div class="field-label">보유 페인트 & 문양</div><div id="garageInventory" class="garage-inventory"></div>
  <div class="field-label">최근 구매 및 레이스 이력</div><div id="garageHistory" class="garage-history"></div>
  <p class="hint">계정에 저장된 차량, 아이템, 구매 내역은 다른 기기에서 로그인해도 유지됩니다.</p>
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

const GRADE_PEAK={D:60,C:65,B:70,A:75};
const CLASS_RATIOS={
 acceleration:{label:'가속형',acceleration:1,topSpeed:.90,cornering:.70},
 topSpeed:{label:'최고속도형',acceleration:.82,topSpeed:1,cornering:.65},
 cornering:{label:'코너링형',acceleration:.80,topSpeed:.87,cornering:1},
 balance:{label:'밸런스형',acceleration:1,topSpeed:1,cornering:1}
};
let vehicleGrade='D',timeAttackMode=false;
function vehicleRatings(type=carId,grade=vehicleGrade){
 const peak=GRADE_PEAK[grade]||60,ratio=CLASS_RATIOS[type]||CLASS_RATIOS.balance;
 return {acceleration:Math.round(peak*ratio.acceleration),topSpeed:Math.round(peak*ratio.topSpeed),cornering:Math.round(peak*ratio.cornering)};
}
function getVehicleStats(type=carId,grade=vehicleGrade){
 const r=vehicleRatings(type,grade);
 return {label:CLASS_RATIOS[type].label,max:r.topSpeed*.65,accel:r.acceleration*.47,turn:r.cornering*.03,grip:r.cornering/60,ratings:r};
}

const CLASSES=new Proxy({}, {get:(_t,k)=>getVehicleStats(k,vehicleGrade)});
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
import { supabase } from './supabase.js';
let accountUser=null,cloudGarage=null,authReady=false;
let wallet=loadWallet(),shopCar='balance',shopTab='paint',selectedDecal=null;
function loadWallet(){try{return JSON.parse(localStorage.getItem(walletKey))||{coins:0,ownedPaint:{},ownedDecal:{},equipped:{}};}catch{return {coins:0,ownedPaint:{},ownedDecal:{},equipped:{}};}}
function saveWallet(){localStorage.setItem(walletKey,JSON.stringify(wallet));updateWalletUI();}
function updateWalletUI(){$('coinBalance').textContent=wallet.coins;$('shopCoins').textContent=wallet.coins;}
function carInventory(type){wallet.ownedPaint[type]??=['default'];wallet.ownedDecal[type]??=[];wallet.equipped[type]??={paint:'default',decal:null,position:{x:0,z:0,rotation:0}};return wallet.equipped[type];}
function currentPaint(type){const id=carInventory(type).paint;return id==='default'?'#ffd447':PAINTS.find(p=>p.id===id)?.color||'#ffd447';}
function cosmeticsFor(type){const e=carInventory(type);return {paint:currentPaint(type),decal:e.decal,position:e.position};}
function grantCoins(amount){if(!Number.isFinite(amount)||amount<=0)return;wallet.coins+=amount;saveWallet();}
async function buyItem(kind,id){
 const owned=kind==='paint'?wallet.ownedPaint[shopCar]:wallet.ownedDecal[shopCar];
 if(owned.includes(id)){
  if(kind==='paint')wallet.equipped[shopCar].paint=id;else{wallet.equipped[shopCar].decal=id;selectedDecal=id;}
  if(accountUser){const placement=wallet.equipped[shopCar].position;await supabase.rpc('equip_cosmetic',{p_vehicle_class:shopCar,p_item_id:id,p_placement:placement});}
  saveWallet();applyLocalCosmetics();renderShop();return;
 }
 if(accountUser){
  const {error}=await supabase.rpc('purchase_cosmetic',{p_vehicle_class:shopCar,p_item_id:id});
  if(error){alert(error.message);return;}
  await loadCloudAccount();applyLocalCosmetics();renderShop();return;
 }
 const cost=kind==='paint'?30:20;
 if(wallet.coins<cost){alert('코인이 부족합니다. 레이스에 참가해 코인을 모아주세요.');return;}
 wallet.coins-=cost;owned.push(id);if(kind==='paint')wallet.equipped[shopCar].paint=id;else{wallet.equipped[shopCar].decal=id;selectedDecal=id;}saveWallet();applyLocalCosmetics();renderShop();
}
function renderShop(){updateWalletUI();document.querySelectorAll('[data-shopcar]').forEach(b=>b.classList.toggle('active',b.dataset.shopcar===shopCar));document.querySelectorAll('[data-shoptab]').forEach(b=>b.classList.toggle('active',b.dataset.shoptab===shopTab));const inv=carInventory(shopCar),items=shopTab==='paint'?PAINTS:DECALS,owned=shopTab==='paint'?wallet.ownedPaint[shopCar]:wallet.ownedDecal[shopCar],equipped=shopTab==='paint'?inv.paint:inv.decal;
 $('shopItems').innerHTML=items.map(item=>{const isOwned=owned.includes(item.id),active=equipped===item.id;return '<button class="shop-item '+(active?'equipped':'')+'" data-buy="'+item.id+'"><span class="swatch" style="'+(shopTab==='paint'?'background:'+item.color:'')+'">'+(shopTab==='decal'?item.glyph:'')+'</span><span><b>'+item.name+'</b><small>'+(isOwned?(active?'장착 중':'보유 · 장착 가능'):(shopTab==='paint'?30:20)+' 코인')+'</small></span><strong>'+(active?'✓':isOwned?'장착':'구매')+'</strong></button>';}).join('');
 $('shopItems').querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buyItem(shopTab,b.dataset.buy));
 $('decalEditor').hidden=shopTab!=='decal'||!inv.decal;
 $('decalX').value=inv.position.x;$('decalZ').value=inv.position.z;$('decalRotation').value=inv.position.rotation;
}
function makeDecalTexture(id){const item=DECALS.find(d=>d.id===id);const c=document.createElement('canvas');c.width=256;c.height=256;const ctx=c.getContext('2d');ctx.clearRect(0,0,256,256);ctx.fillStyle='#ffffff';ctx.strokeStyle='#ffffff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 190px Arial';ctx.shadowColor='#111827';ctx.shadowBlur=5;ctx.fillText(item?.glyph||'★',128,132);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function applyCarCosmetics(car,type){if(!car)return;const paint=car.userData.bodyMaterial;if(paint)paint.color.set(currentPaint(type));if(car.userData.decal){car.remove(car.userData.decal);car.userData.decal.material.map?.dispose();}const e=carInventory(type);if(e.decal){const mat=new THREE.MeshBasicMaterial({map:makeDecalTexture(e.decal),transparent:true,depthWrite:false,side:THREE.DoubleSide});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.85,.85),mat);mesh.rotation.x=-Math.PI/2;mesh.rotation.z=(e.position.rotation||0)*Math.PI/180;mesh.position.set(e.position.x,.999,e.position.z);car.add(mesh);car.userData.decal=mesh;} }
function applyLocalCosmetics(){applyCarCosmetics(localCar,carId);send({type:'cosmetics',cosmetics:cosmeticsFor(carId)});}
async function awardRaceCoins(m){const result=m.results?.find(r=>r.id===myId);if(!result||m.raceId===lastAwardedRace)return;lastAwardedRace=m.raceId||('local-'+Date.now());if(accountUser&&m.raceId){const teamResult=m.teams?.winner==='draw'?'draw':result.team===m.teams?.winner?'win':'loss';const {data,error}=await supabase.rpc('claim_race_reward',{p_race_id:m.raceId,p_mode:m.mode,p_track_id:trackId,p_vehicle_class:carId,p_finish_rank:result.rank||null,p_finished:!!result.finished,p_team_id:result.team||null,p_team_result:teamResult});if(error){$('message').textContent='보상 저장 실패: '+error.message;return;}wallet.coins=data.balance??wallet.coins;await loadCloudAccount();}else grantCoins(result.coins||0);$('message').textContent='레이스 보상 +' +(result.coins||0)+' 코인';}
let lastAwardedRace=null;
async function loadCloudAccount(){
 if(!accountUser)return;
 const uid=accountUser.id;
 const [profile,walletRow,vehicles,inventory,tx,races]=await Promise.all([
  supabase.from('player_profiles').select('*').eq('user_id',uid).maybeSingle(),
  supabase.from('player_wallets').select('*').eq('user_id',uid).maybeSingle(),
  supabase.from('player_vehicles').select('*').eq('user_id',uid),
  supabase.from('player_inventory').select('*, cosmetic_catalog(*)').eq('user_id',uid),
  supabase.from('wallet_transactions').select('*').eq('user_id',uid).order('created_at',{ascending:false}).limit(8),
  supabase.from('player_race_history').select('*').eq('user_id',uid).order('played_at',{ascending:false}).limit(8)
 ]);
 for(const q of [profile,walletRow,vehicles,inventory,tx,races])if(q.error)throw q.error;
 cloudGarage={profile:profile.data,wallet:walletRow.data,vehicles:vehicles.data||[],inventory:inventory.data||[],transactions:tx.data||[],races:races.data||[]};
 const selectedVehicle=cloudGarage.vehicles.find(v=>v.is_selected);if(selectedVehicle){carId=selectedVehicle.vehicle_class;vehicleGrade=selectedVehicle.vehicle_grade||'D';}
 wallet.coins=walletRow.data?.coins||0;
 for(const type of ['acceleration','topSpeed','cornering','balance']){
  const rows=cloudGarage.inventory.filter(v=>v.vehicle_class===type);
  wallet.ownedPaint[type]=['default',...rows.filter(v=>v.cosmetic_catalog?.item_type==='paint').map(v=>v.item_id)];
  wallet.ownedDecal[type]=rows.filter(v=>v.cosmetic_catalog?.item_type==='decal').map(v=>v.item_id);
  const paint=rows.find(v=>v.cosmetic_catalog?.item_type==='paint'&&v.is_equipped);
  const decal=rows.find(v=>v.cosmetic_catalog?.item_type==='decal'&&v.is_equipped);
  wallet.equipped[type]={paint:paint?.item_id||'default',decal:decal?.item_id||null,position:decal?.placement||{x:0,z:0,rotation:0}};
 }
 updateWalletUI();
 if(profile.data?.nickname)$('nickname').value=profile.data.nickname;
 if(localCar)applyLocalCosmetics();
}
async function renderGarage(){
 if(!accountUser){alert('차고를 이용하려면 먼저 로그인해주세요.');showPanel('lobby');return;}
 try{await loadCloudAccount();}catch(e){alert('차고 정보를 불러오지 못했습니다: '+e.message);return;}
 $('garageCoins').textContent=wallet.coins;
 $('garageVehicles').innerHTML=cloudGarage.vehicles.map(v=>'<div class="garage-car"><b>'+({acceleration:'가속형',topSpeed:'최고속도형',cornering:'코너링형',balance:'밸런스형'}[v.vehicle_class]||v.vehicle_class)+' · '+v.vehicle_grade+'</b><span>'+(v.is_selected?'선택된 차량':'보유 차량')+'</span><button data-garage-car="'+v.vehicle_class+'" data-garage-grade="'+v.vehicle_grade+'">차량 선택</button></div>').join('');
 $('garageVehicles').querySelectorAll('[data-garage-car]').forEach(b=>b.onclick=()=>{selectCar(b.dataset.garageCar);showPanel('setup');});
 $('garageInventory').innerHTML=cloudGarage.inventory.length?cloudGarage.inventory.map(v=>'<div class="garage-item"><span>'+(v.cosmetic_catalog?.item_type==='paint'?'🎨':'✦')+'</span><b>'+escapeHtml(v.cosmetic_catalog?.display_name||v.item_id)+'</b><small>'+({acceleration:'가속형',topSpeed:'최고속도형',cornering:'코너링형',balance:'밸런스형'}[v.vehicle_class])+'</small><em>'+(v.is_equipped?'장착 중':'보유')+'</em></div>').join(''):'<p class="hint">아직 구매한 페인트나 문양이 없습니다.</p>';
 const history=[...cloudGarage.transactions.map(t=>({date:t.created_at,label:t.description,amount:t.amount})),...cloudGarage.races.map(r=>({date:r.played_at,label:'레이스 · '+r.track_id+' · '+(r.finish_rank||'DNF')+'위',amount:r.coins_earned}))].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,8);
 $('garageHistory').innerHTML=history.length?history.map(h=>'<div class="history-row"><span>'+escapeHtml(h.label)+'</span><b class="'+(h.amount<0?'negative':'positive')+'">'+(h.amount>0?'+':'')+h.amount+' 🪙</b></div>').join(''):'<p class="hint">아직 기록이 없습니다.</p>';
 showPanel('garage');
}
async function syncAuth(){
 const {data:{session}}=await supabase.auth.getSession();accountUser=session?.user||null;updateAuthUI();if(accountUser)await loadCloudAccount();
}
function updateAuthUI(){ $('authStatus').textContent=accountUser?accountUser.email:'게스트 플레이';$('signIn').hidden=!!accountUser;$('signUp').hidden=!!accountUser;$('signOut').hidden=!accountUser;$('accountEmail').hidden=!!accountUser;$('accountPassword').hidden=!!accountUser;$('accountMessage').textContent=accountUser?'계정 연결됨 · 코인과 차고가 클라우드에 저장됩니다.':'로그인하면 코인과 차고가 계정에 안전하게 저장됩니다.'; }
async function signIn(){const email=$('accountEmail').value.trim(),password=$('accountPassword').value;if(!email||!password)return alert('이메일과 비밀번호를 입력해주세요.');const {data,error}=await supabase.auth.signInWithPassword({email,password});if(error)return alert(error.message);accountUser=data.user;await loadCloudAccount();updateAuthUI();}
async function signUp(){const email=$('accountEmail').value.trim(),password=$('accountPassword').value,nickname=$('nickname').value.trim()||'Racer';if(!email||password.length<8)return alert('이메일과 8자 이상의 비밀번호를 입력해주세요.');const {data,error}=await supabase.auth.signUp({email,password,options:{data:{nickname}}});if(error)return alert(error.message);if(data.session){accountUser=data.user;await loadCloudAccount();updateAuthUI();}else alert('가입 요청이 완료됐어요. 이메일 인증 후 로그인해주세요.');}


const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const setStatus=t=>$('connection').textContent=t;
function send(o){if(ws&&ws.readyState===1)ws.send(JSON.stringify(o));}
function showPanel(id){['lobby','setup','results','shop','garage'].forEach(k=>$(k).hidden=k!==id);}
function makeCar(color,type='balance'){
 const g=new THREE.Group(),paint=new THREE.MeshStandardMaterial({color,roughness:.35,metalness:.12}),dark=new THREE.MeshStandardMaterial({color:0x17212a,roughness:.7});
 const dimensions={acceleration:[2.05,.56,3.65],topSpeed:[1.92,.5,4.15],cornering:[2.18,.54,3.55],balance:[2.1,.58,3.8]}[type]||[2.1,.58,3.8];
 const body=new THREE.Mesh(new THREE.BoxGeometry(...dimensions),paint);body.position.y=.7;body.castShadow=true;g.add(body);g.userData.bodyMaterial=paint;
 const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.5,.62,1.7),new THREE.MeshStandardMaterial({color:0x9fc2ce,metalness:.2,roughness:.25}));cabin.position.set(0,1.23,-.18);cabin.castShadow=true;g.add(cabin);
 for(const sx of [-1.06,1.06])for(const sz of [-1.2,1.2]){const w=new THREE.Mesh(new THREE.BoxGeometry(.34,.58,.8),dark);w.position.set(sx,.44,sz);g.add(w);}
 const spoilerWidth=type==='cornering'?2.2:type==='topSpeed'?1.65:2.05;
 const spoiler=new THREE.Mesh(new THREE.BoxGeometry(spoilerWidth,.12,.3),dark);spoiler.position.set(0,1.05,-1.72);g.add(spoiler);
 if(type==='acceleration'){const splitter=new THREE.Mesh(new THREE.BoxGeometry(2.15,.1,.38),dark);splitter.position.set(0,.52,1.88);g.add(splitter);}
 if(type==='topSpeed'){const fin=new THREE.Mesh(new THREE.BoxGeometry(.12,.34,.9),dark);fin.position.set(0,1.18,-1.35);g.add(fin);}
 return g;
}
function initScene(){
 scene=new THREE.Scene();scene.background=new THREE.Color(0xb8d4df);scene.fog=new THREE.Fog(0xb8d4df,100,230);
 camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,500);
 renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;$('game').prepend(renderer.domElement);
 scene.add(new THREE.HemisphereLight(0xffffff,0x60715b,1.8));const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(-35,55,25);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);
 ground=new THREE.Mesh(new THREE.PlaneGeometry(500,500),new THREE.MeshStandardMaterial({color:0x719e6b,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.16;ground.receiveShadow=true;scene.add(ground);
 localCar=makeCar(0xffd447,carId);scene.add(localCar);applyCarCosmetics(localCar,carId);buildTrack(trackId);resetCar();
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
 if(timeAttackMode){saveTimeAttackRecord();$('message').textContent='타임어택 완주! '+formatTime(elapsed);showPanel('setup');$('raceHud').style.display='none';return;}
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
async function selectCar(v){
 carId=v;
 if(accountUser&&!cloudGarage?.vehicles?.some(row=>row.vehicle_class===v&&row.vehicle_grade===vehicleGrade))vehicleGrade='D';
 renderVehicleRatings();
 if(localCar){const pos=localCar.position.clone(),rot=localCar.rotation.y;scene.remove(localCar);localCar=makeCar(0xffd447,v);localCar.position.copy(pos);localCar.rotation.y=rot;scene.add(localCar);}
 applyLocalCosmetics();
 if(accountUser){const {error}=await supabase.rpc('select_vehicle',{p_vehicle_class:v,p_grade:vehicleGrade});if(error)console.error(error);}
 if(online)send({type:'select',car:carId,grade:vehicleGrade,team});
}
function renderVehicleRatings(){
 const stats=vehicleRatings();
 const labels=[['acceleration','가속'],['topSpeed','최고속도'],['cornering','코너링']];
 const el=$('vehicleStats');if(!el)return;
 el.innerHTML='<div class="stat-heading">'+CLASS_RATIOS[carId].label+' · '+vehicleGrade+'등급</div>'+labels.map(([key,label])=>'<div class="stat-row"><span>'+label+'</span><div class="stat-track"><i style="width:'+stats[key]+'%"></i></div><b>'+stats[key]+'</b></div>').join('');
 document.querySelectorAll('[data-grade]').forEach(b=>b.classList.toggle('active',b.dataset.grade===vehicleGrade));
}
async function selectGrade(grade){
 if(!GRADE_PEAK[grade])return;
 if(accountUser&&!cloudGarage?.vehicles?.some(v=>v.vehicle_class===carId&&v.vehicle_grade===grade)){alert('먼저 상점에서 해당 등급 차량을 구매해주세요.');return;}
 vehicleGrade=grade;renderVehicleRatings();
 if(accountUser){const {error}=await supabase.rpc('select_vehicle',{p_vehicle_class:carId,p_grade:grade});if(error){alert(error.message);return;}}
 if(online)send({type:'select',car:carId,grade,team});
}
function selectTeam(v){team=v;if(online)send({type:'select',car:carId,team});}

function renderVehicleShop(){
 const names={acceleration:'가속형',topSpeed:'최고속도형',cornering:'코너링형',balance:'밸런스형'};
 const owned=new Set((cloudGarage?.vehicles||[]).map(v=>v.vehicle_class+'-'+v.vehicle_grade));
 $('vehicleShop').innerHTML=['D','C','B','A'].map(g=>['acceleration','topSpeed','cornering','balance'].map(t=>{
  const price={D:0,C:50,B:70,A:100}[g],key=t+'-'+g,has=owned.has(key)||g==='D';
  return '<div class="vehicle-shop-item"><b>'+names[t]+' · '+g+'</b><small>'+Object.entries(vehicleRatings(t,g)).map(([k,v])=>({acceleration:'가속',topSpeed:'최고속도',cornering:'코너링'}[k])+' '+v).join(' / ')+'</small><button data-vehicle-buy="'+key+'" '+(has?'disabled':'')+'>'+(has?'보유 중':price+' 코인 구매')+'</button></div>';
 }).join('')).join('');
 $('vehicleShop').querySelectorAll('[data-vehicle-buy]').forEach(b=>b.onclick=async()=>{
  if(!accountUser)return alert('차량 구매는 로그인 후 이용할 수 있습니다.');
  const [type,grade]=b.dataset.vehicleBuy.split('-');
  const {error}=await supabase.rpc('purchase_vehicle',{p_vehicle_class:type,p_grade:grade});
  if(error)return alert(error.message);
  await loadCloudAccount();renderVehicleShop();alert(grade+'등급 차량을 차고에 추가했어요!');
 });
}
async function loadTimeAttackBoard(){
 const {data,error}=await supabase.from('time_attack_records').select('nickname,track_id,vehicle_class,vehicle_grade,time_ms,created_at').eq('track_id',trackId).order('time_ms',{ascending:true}).limit(10);
 if(error){$('timeAttackBoard').textContent='기록을 불러오지 못했습니다.';return;}
 $('timeAttackBoard').innerHTML='<div class="leaderboard-head">'+TRACKS[trackId].name+' · TOP 10</div>'+((data||[]).length?data.map((r,i)=>'<div class="record-row"><b>'+(i+1)+'</b><span>'+escapeHtml(r.nickname)+'<small>'+({acceleration:'가속형',topSpeed:'최고속도형',cornering:'코너링형',balance:'밸런스형'}[r.vehicle_class])+' '+r.vehicle_grade+'</small></span><strong>'+formatTime(r.time_ms)+'</strong></div>').join(''):'<p class="hint">아직 등록된 기록이 없습니다. 첫 기록에 도전하세요!</p>');
}
async function saveTimeAttackRecord(){
 if(!accountUser){$('message').textContent='기록 등록은 로그인 후 가능합니다.';return;}
 const nickname=$('nickname').value.trim()||'Racer';
 const {error}=await supabase.from('time_attack_records').insert({user_id:accountUser.id,nickname,track_id:trackId,vehicle_class:carId,vehicle_grade:vehicleGrade,lap_count:3,time_ms:Math.round(elapsed)});
 if(error){$('message').textContent='기록 저장 실패: '+error.message;return;}
 $('message').textContent='기록 등록 완료! '+formatTime(elapsed);await loadTimeAttackBoard();
}

function startLocal(){started=true;finished=false;elapsed=0;raceStart=performance.now();resetCar();$('raceHud').style.display='flex';showPanel('');$('message').textContent='GO! 3랩을 완주하세요!';}
function update(dt){
 const stats=getVehicleStats(carId,vehicleGrade),accel=keys.gas?stats.accel:0,brake=keys.brake?34:0;
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
 if(accountUser)supabase.from('player_profiles').update({nickname:value,updated_at:new Date().toISOString()}).eq('user_id',accountUser.id).then(({error})=>{if(error)alert(error.message);});
 if(online)send({type:'rename',name:value});
 else if(solo)$('roster').innerHTML='<span class="roster-chip">🏎 '+escapeHtml(value)+'</span>';
}
$('saveNickname').onclick=saveNickname;
$('nicknameEdit').addEventListener('keydown',e=>{if(e.key==='Enter')saveNickname();});

$('solo').onclick=()=>{timeAttackMode=false;solo=true;joined=true;online=false;myId='local';mode='individual';$('nicknameEdit').value=$('nickname').value.trim()||'Racer';showPanel('setup');setStatus('● PRACTICE');$('roominfo').textContent='PRACTICE MODE';$('roster').innerHTML='<span class="roster-chip">🏎 나</span>';$('rosterCount').textContent='1 / 1';$('hostHint').textContent='혼자 연습 모드입니다.';$('startRace').disabled=false;};
$('timeAttack').onclick=async()=>{timeAttackMode=true;solo=true;joined=true;online=false;myId='local';mode='individual';$('nicknameEdit').value=$('nickname').value.trim()||'Racer';$('hostHint').textContent='3랩 타임어택 · 전체 기록 랭킹에 도전하세요.';$('startRace').textContent='타임어택 시작';$('startRace').disabled=false;showPanel('setup');setStatus('● TIME ATTACK');$('roominfo').textContent='TIME ATTACK · SOLO';await loadCloudAccount().catch(()=>{});renderVehicleShop();await loadTimeAttackBoard();};
$('refreshRecords').onclick=loadTimeAttackBoard;
$('backLobby').onclick=()=>{if(ws)ws.close();joined=false;solo=false;timeAttackMode=false;$('startRace').textContent='3랩 레이스 시작';showPanel('lobby');setStatus('● OFFLINE');};
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{if(myId!==hostId&&!solo)return;setMode(b.dataset.mode);});
document.querySelectorAll('[data-track]').forEach(b=>b.onclick=()=>{if(myId!==hostId&&!solo)return;setTrack(b.dataset.track);if(timeAttackMode)loadTimeAttackBoard();});
document.querySelectorAll('[data-car]').forEach(b=>b.onclick=()=>selectCar(b.dataset.car));
document.querySelectorAll('[data-team]').forEach(b=>b.onclick=()=>selectTeam(b.dataset.team));
$('startRace').onclick=()=>{if(solo){startLocal();return;}if(myId===hostId)send({type:'start'});};
$('again').onclick=()=>{showPanel('setup');if(solo){resetCar();$('startRace').disabled=false;}else send({type:'restart'});};
$('signIn').onclick=signIn;$('signUp').onclick=signUp;$('signOut').onclick=async()=>{await supabase.auth.signOut();accountUser=null;updateAuthUI();showPanel('lobby');};
supabase.auth.onAuthStateChange(async (_event,session)=>{accountUser=session?.user||null;updateAuthUI();if(accountUser){try{await loadCloudAccount();}catch(e){console.error(e);}}});
document.querySelectorAll('[data-grade]').forEach(b=>b.onclick=()=>selectGrade(b.dataset.grade));renderVehicleRatings();renderVehicleShop();$('openGarage').onclick=renderGarage;$('closeGarage').onclick=()=>showPanel(joined?'setup':'lobby');
$('openShop').onclick=()=>{shopCar=carId;renderShop();showPanel('shop');};
$('closeShop').onclick=()=>showPanel(joined?'setup':'lobby');
document.querySelectorAll('[data-shopcar]').forEach(b=>b.onclick=()=>{shopCar=b.dataset.shopcar;renderShop();});
document.querySelectorAll('[data-shoptab]').forEach(b=>b.onclick=()=>{shopTab=b.dataset.shoptab;renderShop();});
function updateDecalPreview(){const e=carInventory(shopCar);e.position={x:Number($('decalX').value),z:Number($('decalZ').value),rotation:Number($('decalRotation').value)};if(shopCar===carId)applyLocalCosmetics();}
['decalX','decalZ','decalRotation'].forEach(id=>$(id).addEventListener('input',updateDecalPreview));
$('saveDecalPosition').onclick=async()=>{updateDecalPreview();if(accountUser&&wallet.equipped[shopCar].decal){const {error}=await supabase.rpc('equip_cosmetic',{p_vehicle_class:shopCar,p_item_id:wallet.equipped[shopCar].decal,p_placement:wallet.equipped[shopCar].position});if(error)return alert(error.message);}saveWallet();renderShop();};
updateWalletUI();
updateAuthUI();syncAuth().catch(console.error);
initScene();
