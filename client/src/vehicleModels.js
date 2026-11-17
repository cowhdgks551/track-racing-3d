import * as THREE from 'three';

export const VEHICLE_SHAPES = {
  acceleration:{width:1.8,length:3.8,cabinHeight:.95,cabinLength:1.65,label:'hot-hatch'},
  topSpeed:{width:1.95,length:4.8,cabinHeight:.42,cabinLength:1.5,label:'longtail-supercar'},
  cornering:{width:2.1,length:4.1,cabinHeight:.3,cabinLength:.85,label:'open-wheel'},
  balance:{width:1.9,length:4.4,cabinHeight:.7,cabinLength:2,label:'sports-coupe'}
};

export function createCarModel(color,type='balance'){
  const shape=VEHICLE_SHAPES[type]||VEHICLE_SHAPES.balance;
  const g=new THREE.Group(),paint=new THREE.MeshStandardMaterial({color,roughness:.35,metalness:.3});
  const dark=new THREE.MeshStandardMaterial({color:0x17212a,roughness:.7});
  const glass=new THREE.MeshStandardMaterial({color:0x83bbd0,metalness:.35,roughness:.18});
  const box=(w,h,d,x,y,z,material=paint)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;g.add(m);return m;};
  const {width:w,length:l}=shape;
  box(type==='cornering'?1.05:w,.5,l,0,.7,0);
  box(type==='cornering'?.75:w*.72,shape.cabinHeight,shape.cabinLength,0,1+shape.cabinHeight/2,-.25,glass);
  if(type==='acceleration'){
    box(w*.78,.8,.3,0,1.4,-l/2+.3);box(w+.1,.12,.4,0,.48,l/2);
    box(w,.12,.32,0,1.95,-l/2+.25,dark);
  }else if(type==='topSpeed'){
    box(w*.82,.24,1.15,0,.63,l/2-.2);box(.12,.45,1.1,0,1.15,-1.5,dark);
    box(w,.12,.4,0,1.13,-l/2,dark);
  }else if(type==='cornering'){
    box(2.2,.14,.4,0,.4,l/2+.15,dark);box(2.05,.18,.48,0,1.3,-l/2,dark);
    box(.65,.3,1.25,0,.65,l/2-.1);box(1.5,.5,.9,0,.65,-.55);
  }else{
    box(w*.9,.22,.7,0,.7,l/2-.15);box(w*.95,.13,.3,0,1.15,-l/2,dark);
  }
  for(const side of [-1,1])for(const end of [-1,1]){
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,type==='cornering'?.42:.26,14),dark);
    wheel.rotation.z=Math.PI/2;wheel.position.set(side*(w/2),.35,end*l*.32);wheel.castShadow=true;g.add(wheel);
  }
  const lights=new THREE.MeshStandardMaterial({color:0xffffdc,emissive:0xffedbc,emissiveIntensity:.5});
  for(const side of [-1,1])box(.35,.12,.05,side*w*.3,.8,l/2+.03,lights);
  g.userData.bodyMaterial=paint;g.userData.vehicleClass=type;g.userData.shape=shape.label;
  return g;
}
