# TRACK RACING 3D

심플한 로우폴리 3D 서킷 레이싱 MVP. 웹과 모바일 브라우저를 지원하며, WebSocket 방 기반으로 최대 8명이 같은 방에서 주행 위치와 랩 정보를 공유합니다.

## 현재 구현
- Three.js 3D 타원형 서킷, 추적 카메라, 간단한 자동차 모델
- 키보드 및 모바일 터치 조작 (좌/우/가속/브레이크)
- 방 코드 기반 WebSocket 멀티플레이 (최대 8명)
- 랩/속도/시간 HUD, 레이스 순위 패널
- 혼자 연습 모드
- Render 배포용 `render.yaml`

## 로컬 실행
Node.js 20 이상 권장.

```bash
npm install
npm run dev
```
Vite 개발 서버 주소가 터미널에 표시됩니다. 웹소켓 서버는 `localhost:3000`에서 실행됩니다.

## Render 배포
1. 이 폴더를 GitHub 저장소 루트에 업로드합니다.
2. Render에서 **New → Blueprint**를 선택하고 저장소를 연결합니다.
3. `render.yaml`을 읽어 Node 웹 서비스를 생성합니다.
4. 배포된 HTTPS 주소로 접속합니다. WebSocket은 자동으로 WSS를 사용합니다.

## 스마트폰 앱
현재는 반응형 웹/PWA 형태로 모바일 브라우저에서 플레이할 수 있습니다. Android APK로 패키징하려면 Capacitor를 추가할 수 있습니다.

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Track Racing 3D" "com.trackracing.game"
npm run build
npx cap add android
npx cap sync android
npx cap open android
```
Android Studio에서 APK/AAB를 빌드합니다. 웹 배포 후 `capacitor.config`의 `server.url`을 서비스 주소로 지정하면 원격 웹 앱을 앱 셸에서 불러올 수 있습니다.

## MVP 제한
현재 멀티플레이는 위치/랩 상태를 중계하는 초기 프로토타입입니다. 서버 권위형 물리 판정, 치트 방지, 충돌 동기화, 매치메이킹, 재접속 복구, 정교한 랩 판정은 다음 개발 단계에서 보강해야 합니다. 실제 공개 서비스 전에는 서버 검증과 부하 테스트가 필요합니다.