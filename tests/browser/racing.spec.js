import { test, expect } from '@playwright/test';

test('login, Rapier race, drift, race locks and restart in the built browser app', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const uid = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
  const user = { id: uid, aud: 'authenticated', role: 'authenticated', email: 'fixture@example.com', user_metadata: { nickname: 'Test Racer' } };
  const jwt = Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url') + '.' +
    Buffer.from(JSON.stringify({sub:uid,exp:Math.floor(Date.now()/1000)+3600,role:'authenticated'})).toString('base64url') + '.fixture';
  const session = { access_token: jwt, refresh_token: 'fixture-refresh', token_type: 'bearer', expires_in: 3600, user };
  // Fixtures exercise the same account calls without creating users or spending coins.
  await page.route('https://*.supabase.co/**', async route => {
    const url = new URL(route.request().url()); let data;
    if (url.pathname.includes('/auth/v1/token')) data = session;
    else if (url.pathname.includes('/auth/v1/user')) data = user;
    else if (url.pathname.includes('/rpc/')) data = { balance: 100 };
    else if (url.pathname.endsWith('/player_profiles')) data = { user_id: uid, nickname: 'Test Racer' };
    else if (url.pathname.endsWith('/player_wallets')) data = { user_id: uid, coins: 100 };
    else if (url.pathname.endsWith('/player_vehicles')) data = [
      { user_id: uid, vehicle_class: 'balance', vehicle_grade: 'D', is_selected: true },
      { user_id: uid, vehicle_class: 'balance', vehicle_grade: 'A', is_selected: false }
    ];
    else data = [];
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
  });
  let socket;
  const player = {id:'host',name:'Test Racer',car:'balance',grade:'D',team:null,x:0,z:0,rotation:0,lap:0,progress:0};
  const room = started => ({type:'room-state',hostId:'host',config:{mode:'individual',track:'yeongam',laps:3},started,players:[player]});
  await page.routeWebSocket('**/ws', ws => {
    socket = ws;
    ws.onMessage(raw => {
      const m = JSON.parse(String(raw));
      if (m.type === 'join') { ws.send(JSON.stringify({type:'joined',id:'host'})); ws.send(JSON.stringify(room(false))); }
      if (m.type === 'start') { ws.send(JSON.stringify({type:'race-start'})); ws.send(JSON.stringify(room(true))); }
      if (m.type === 'restart') ws.send(JSON.stringify(room(false)));
    });
  });
  await page.goto('/');
  await expect(page.locator('canvas').first()).toBeVisible();
  await page.locator('#accountEmail').fill('fixture@example.com');
  await page.locator('#accountPassword').fill('fixture-password');
  await page.locator('#signIn').click();
  await expect(page.locator('#mainMenu')).toBeVisible();
  await page.locator('#openGarage').click();
  await expect(page.locator('#garage')).toBeVisible();
  await expect(page.locator('#garageVehicles')).toContainText('D');
  await page.locator('#closeGarage').click();
  await page.locator('#openShop').click(); await expect(page.locator('#shop')).toBeVisible();
  await page.locator('#closeShop').click();
  await page.locator('#timeAttack').click();
  await expect(page.locator('#timeAttackRecords')).toBeVisible();
  await page.locator('#backLobby').click();
  await page.locator('#join').click();
  await expect(page.locator('#setup')).toBeVisible();
  await page.locator('#startRace').click();
  await expect(page.locator('#raceHud')).toBeVisible();
  await expect(page.locator('#openGarage')).toBeHidden(); await expect(page.locator('#openShop')).toBeHidden();
  // Programmatic clicks must also be rejected while racing, not merely hidden.
  await page.locator('[data-grade="A"]').evaluate(el => el.click());
  await expect(page.locator('[data-grade="D"]')).toHaveClass(/active/);
  await page.locator('#openShop').evaluate(el => el.click()); await expect(page.locator('#shop')).toBeHidden();
  await page.keyboard.down('ArrowUp');
  await expect.poll(async () => Number(await page.locator('#speed').textContent()), { timeout: 25000 }).toBeGreaterThan(55);
  await page.keyboard.down('ArrowLeft'); await page.keyboard.down('Shift');
  await page.waitForTimeout(700);
  await expect.poll(async () => Number(await page.locator('#speed').textContent())).toBeGreaterThan(10);
  await page.screenshot({path:'test-results/rapier-drift.png'});
  socket.send(JSON.stringify({type:'race-results',raceId:'fixture-race',mode:'individual',results:[{id:'host',name:'Test Racer',rank:1,points:10,coins:10,finished:true}],teams:{red:0,blue:0,winner:'draw'}}));
  await expect(page.locator('#results')).toBeVisible();
  await page.keyboard.up('ArrowLeft'); await page.keyboard.up('Shift'); await page.keyboard.up('ArrowUp');
  await page.locator('#again').click(); await page.locator('#startRace').click();
  await expect(page.locator('#raceHud')).toBeVisible();
  await expect(page.locator('#speed')).toHaveText('0');
  await page.keyboard.down('ArrowUp');
  await expect.poll(async () => Number(await page.locator('#speed').textContent()), { timeout: 20000 }).toBeGreaterThan(25);
  await page.keyboard.up('ArrowUp');
  await page.screenshot({path:'test-results/rapier-restart.png'});
  expect(errors).toEqual([]);
});
