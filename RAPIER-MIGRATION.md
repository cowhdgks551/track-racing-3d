# Rapier arcade physics migration

The Three.js renderer, existing account/Supabase calls, garage/shop, four classes,
D–A grades, four circuits, online room protocol and three-lap time attack remain.
`client/src/vehiclePhysics.js` replaces the manual bicycle/heading integrator with
Rapier 0.21.0 dynamic rigid-body integration and environment contacts. No Unity
installation or Unity runtime license activation is involved.

The flat-track arcade chassis permits X/Z translation and yaw, with fixed height,
pitch and roll. Static colliders match the existing barrier/building boxes.
This is intentionally not a suspension or realistic tyre simulation. Remote
players remain interpolated visuals; authoritative multiplayer collisions and
server-side lap/ownership validation are outside this change.

Drift rotates the existing travel vector behind the nose without injecting speed.
With gas held, linear speed decays by approximately 4.5% per second before
contacts/grass. Opposite steering overcomes the drift entry bias; release briefly
increases grip. Stop/reset clears velocity, yaw, steering and drift state. Drift
alone on a straight does not choose a turn. There is no minimum-speed refill after
an impact. Vehicle class/grade formulas and close-follow camera are preserved;
matching KartRider's proprietary physics or exact proportions is not claimed.

Race stats are captured at the start; garage/shop, grade and cosmetic handlers
reject race-time changes, including hidden/programmatic clicks. Key-up releases
inputs even after focus changes. Visibility/focus loss clears input.

The server now relays valid D/C/B/A grade values (old clients default to D), locks
cosmetics during a race, and accepts X/Z up to ±250. Existing deployed servers
remain compatible with the new client but omit the added grade information until
the server changes are deployed. Supabase schema, keys and production data are
unchanged; live purchases/rewards must be checked with a test account separately.

Verification commands: `npm install`, `npm test`, `npm run build`,
`npx playwright install chromium`, `npm run test:browser`.
The browser test uses Supabase and race-result fixtures, not real account spending.
The server test exercises two real local WebSocket clients. Physics tests run
Rapier WASM and cover speed retention, countersteer, recovery, symmetry, restart,
wall contact, class performance and timestep comparison.

The `Rapier physics and app builds` workflow builds Windows NSIS x64 and an Android
debug APK only after validation. Build success does not establish actual Android
touch performance, installed app startup, upgrade signatures or subjective handling.
Physical device tests and real-account regression tests remain necessary.
