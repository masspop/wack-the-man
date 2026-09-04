import "./style.css";
type Rect = { x: number; y: number; w: number; h: number };
type Zone = "village" | "forest" | "ruins" | "boss";
type Scene = "world" | "interior";
type EnemyKind = "slime" | "bat" | "soldier" | "thug" | "midboss" | "boss";
type WeaponId = "fist" | "knife" | "sword" | "axe" | "rifle";
type PlaceKind = "table" | "window" | "barrel";
type GameState = "title" | "playing" | "dialog" | "win" | "dead";
type Enemy = Rect & {
  kind: EnemyKind;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  hurt: number;
  alive: boolean;
  patrolL: number;
  patrolR: number;
  facing: 1 | -1;
  flash: number;
  attackCd: number;
};
type WorldItem = Rect & {
  kind: "coin" | "key" | "potion" | "medallion";
  taken: boolean;
  bob: number;
};
type WeaponPickup = Rect & {
  weapon: WeaponId;
  place: PlaceKind;
  taken: boolean;
  bob: number;
};
type Door = Rect & {
  id: string;
  label: string;
  target: "interior";
  interiorId: string;
};
type InteriorDef = {
  id: string;
  title: string;
  kind: "house" | "bar";
  exitX: number;
  returnX: number;
  returnY: number;
};
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
};
type DialogLine = { name: string; text: string };
const WEAPONS: Record<
  WeaponId,
  { label: string; damage: number; cooldown: number; range: number; ammoMax: number }
> = {
  fist: { label: "Yumruk", damage: 10, cooldown: 0.28, range: 34, ammoMax: 0 },
  knife: { label: "Çakı", damage: 10, cooldown: 0.12, range: 36, ammoMax: 0 },
  sword: { label: "Kılıç", damage: 50, cooldown: 0.28, range: 44, ammoMax: 0 },
  axe: { label: "Balta", damage: 20, cooldown: 0.45, range: 42, ammoMax: 0 },
  rifle: { label: "Tüfek", damage: 100, cooldown: 0.4, range: 120, ammoMax: 5 },
};
const NORMAL_HP = 100;
const BOSS_HP = 300;
const MIDBOSS_HP = 300;
const canvas = document.querySelector<HTMLCanvasElement>("#game")!;
const ctx = canvas.getContext("2d")!;
const wrap = document.querySelector<HTMLElement>("#wrap")!;
const titleEl = document.querySelector<HTMLElement>("#title-screen")!;
const overlay = document.querySelector<HTMLElement>("#overlay")!;
const overlayTitle = document.querySelector<HTMLElement>("#overlay-title")!;
const overlayText = document.querySelector<HTMLElement>("#overlay-text")!;
const storyEl = document.querySelector<HTMLElement>("#story")!;
const hintToast = document.querySelector<HTMLElement>("#hint-toast")!;
const dialogEl = document.querySelector<HTMLElement>("#dialog")!;
const dialogName = document.querySelector<HTMLElement>("#dialog-name")!;
const dialogText = document.querySelector<HTMLElement>("#dialog-text")!;
const hpFill = document.querySelector<HTMLElement>("#hp-fill")!;
const hpText = document.querySelector<HTMLElement>("#hp-text")!;
const zoneName = document.querySelector<HTMLElement>("#zone-name")!;
const coinCount = document.querySelector<HTMLElement>("#coin-count")!;
const potionCount = document.querySelector<HTMLElement>("#potion-count")!;
const keySlot = document.querySelector<HTMLElement>("#key-slot")!;
const medalSlot = document.querySelector<HTMLElement>("#medal-slot")!;
const weaponNameEl = document.querySelector<HTMLElement>("#weapon-name")!;
const ammoTextEl = document.querySelector<HTMLElement>("#ammo-text")!;
const W = 960;
const H = 540;
const GRAVITY = 2200;
const MOVE = 290;
const JUMP = 620;
const WORLD_W = 9800;
const GROUND_Y = 430;
const INTERIOR_W = 960;
canvas.width = W;
canvas.height = H;
const keys = new Set<string>();
const particles: Particle[] = [];
let state: GameState = "title";
let scene: Scene = "world";
let time = 0;
let camX = 0;
let storyTimer = 0;
let hintTimer = 0;
let invuln = 0;
let attackT = 0;
let attackCd = 0;
let facing: 1 | -1 = 1;
let onGround = false;
let jumpBuffered = 0;
let coyote = 0;
let shake = 0;
let midbossIntro = false;
let bossIntro = false;
let weapon: WeaponId = "fist";
let ammo = 0;
let interactLatch = false;
let attackLatch = false;
let dialogQueue: DialogLine[] = [];
let dialogAdvanceLatch = false;
const inventory = {
  coins: 0,
  key: false,
  potion: 0,
  medallion: false,
};
const player: Rect & { vx: number; vy: number; hp: number; maxHp: number } = {
  x: 80,
  y: GROUND_Y - 52,
  w: 30,
  h: 52,
  vx: 0,
  vy: 0,
  hp: 1000,
  maxHp: 1000,
};
const platforms: Rect[] = [];
const enemies: Enemy[] = [];
const items: WorldItem[] = [];
const spikes: Rect[] = [];
const gates: (Rect & { open: boolean })[] = [];
const doors: Door[] = [];
const buildings: (Rect & { kind: "house" | "bar"; label: string })[] = [];
const weaponPickups: WeaponPickup[] = [];
const interiorPlatforms: Rect[] = [];
const interiors: Record<string, InteriorDef> = {};
let currentInterior: InteriorDef | null = null;
let returnPos = { x: 80, y: GROUND_Y - 52 };
let audioCtx: AudioContext | null = null;
function ensureAudio() {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") void audioCtx.resume();
}
function beep(freq: number, dur = 0.06, type: OscillatorType = "square", gain = 0.03) {
  try {
    ensureAudio();
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start(t);
    o.stop(t + dur);
  } catch {
    /* ignore */
  }
}
function sfxHit() {
  beep(180, 0.07, "square", 0.035);
}
function sfxSwing() {
  beep(420, 0.04, "triangle", 0.025);
}
function sfxShoot() {
  beep(140, 0.05, "sawtooth", 0.04);
  beep(90, 0.08, "square", 0.02);
}
function sfxPickup() {
  beep(660, 0.05, "sine", 0.03);
  beep(880, 0.07, "sine", 0.025);
}
function sfxHurt() {
  beep(110, 0.12, "sawtooth", 0.04);
}
function sfxDoor() {
  beep(240, 0.08, "triangle", 0.03);
}
function sfxDialog() {
  beep(520, 0.03, "sine", 0.02);
}
function aabb(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function rand(a: number, b: number) {
  return a + Math.floor(Math.random() * (b - a + 1));
}
function chance(p: number) {
  return Math.random() < p;
}
function addPlat(x: number, y: number, w: number, h = 24) {
  platforms.push({ x, y, w, h });
}
function addEnemy(kind: EnemyKind, x: number, y: number, patrol = 90) {
  const sizes: Record<EnemyKind, { w: number; h: number; hp: number }> = {
    slime: { w: 32, h: 26, hp: NORMAL_HP },
    bat: { w: 30, h: 22, hp: NORMAL_HP },
    soldier: { w: 32, h: 48, hp: NORMAL_HP },
    thug: { w: 32, h: 50, hp: NORMAL_HP },
    midboss: { w: 56, h: 70, hp: MIDBOSS_HP },
    boss: { w: 72, h: 84, hp: BOSS_HP },
  };
  const s = sizes[kind];
  enemies.push({
    kind,
    x,
    y,
    w: s.w,
    h: s.h,
    vx: kind === "bat" ? 85 : kind === "midboss" || kind === "boss" ? 0 : 55,
    vy: 0,
    hp: s.hp,
    maxHp: s.hp,
    hurt: 0,
    alive: true,
    patrolL: x - patrol,
    patrolR: x + patrol,
    facing: 1,
    flash: 0,
    attackCd: 0,
  });
}
function addItem(kind: WorldItem["kind"], x: number, y: number) {
  const sizes = { coin: 14, key: 18, potion: 16, medallion: 22 };
  const s = sizes[kind];
  items.push({ kind, x, y, w: s, h: s, taken: false, bob: Math.random() * 6 });
}
function addWeapon(weaponId: WeaponId, x: number, y: number, place: PlaceKind) {
  weaponPickups.push({
    weapon: weaponId,
    place,
    x,
    y,
    w: 22,
    h: 18,
    taken: false,
    bob: Math.random() * 6,
  });
}
function burst(x: number, y: number, color: string, n = 10) {
  for (let i = 0; i < n; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 280,
      vy: -Math.random() * 220 - 40,
      life: 0.3 + Math.random() * 0.4,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}
function buildInteriorsMeta() {
  interiors.house1 = {
    id: "house1",
    title: "Eski Ev",
    kind: "house",
    exitX: 80,
    returnX: 360,
    returnY: GROUND_Y - 52,
  };
  interiors.bar1 = {
    id: "bar1",
    title: "Kör Fare Bar",
    kind: "bar",
    exitX: 80,
    returnX: 820,
    returnY: GROUND_Y - 52,
  };
  interiors.house2 = {
    id: "house2",
    title: "Orman Kulübesi",
    kind: "house",
    exitX: 80,
    returnX: 2100,
    returnY: GROUND_Y - 52,
  };
  interiors.bar2 = {
    id: "bar2",
    title: "Harabe Meyhanesi",
    kind: "bar",
    exitX: 80,
    returnX: 4550,
    returnY: GROUND_Y - 52,
  };
}
function buildInteriorRoom(def: InteriorDef) {
  interiorPlatforms.length = 0;
  weaponPickups.length = 0;
  interiorPlatforms.push({ x: 0, y: GROUND_Y, w: INTERIOR_W, h: 24 });
  interiorPlatforms.push({ x: 200, y: 340, w: 140, h: 18 });
  interiorPlatforms.push({ x: 520, y: 300, w: 160, h: 18 });
  interiorPlatforms.push({ x: 760, y: 350, w: 120, h: 18 });
  const pool: WeaponId[] = ["knife", "sword", "axe", "rifle"];
  const spots: { x: number; y: number; place: PlaceKind }[] = [
    { x: 250, y: 318, place: "table" },
    { x: 580, y: 278, place: "table" },
    { x: 820, y: 250, place: "window" },
    { x: 400, y: GROUND_Y - 40, place: "barrel" },
    { x: 700, y: GROUND_Y - 40, place: "barrel" },
  ];
  for (const spot of spots) {
    if (!chance(0.55)) continue;
    const wpn = pool[rand(0, pool.length - 1)]!;
    addWeapon(wpn, spot.x, spot.y, spot.place);
  }
  if (def.kind === "bar" && weaponPickups.length === 0 && chance(0.7)) {
    addWeapon(chance(0.5) ? "knife" : "sword", 260, 318, "table");
  }
}
function buildWorld() {
  platforms.length = 0;
  enemies.length = 0;
  items.length = 0;
  spikes.length = 0;
  gates.length = 0;
  doors.length = 0;
  buildings.length = 0;
  weaponPickups.length = 0;
  particles.length = 0;
  buildInteriorsMeta();
  addPlat(0, GROUND_Y, 1500);
  addPlat(1620, GROUND_Y, 1000);
  addPlat(2750, GROUND_Y, 1200);
  addPlat(4100, GROUND_Y, 1400);
  addPlat(5650, GROUND_Y, 1200);
  addPlat(7000, GROUND_Y, 2800);
  addPlat(240, 340, 120);
  addPlat(500, 290, 100);
  addPlat(980, 310, 120);
  addPlat(1750, 340, 100);
  addPlat(1980, 270, 130);
  addPlat(2300, 320, 110);
  addPlat(2900, 340, 90);
  addPlat(3100, 280, 100);
  addPlat(3350, 220, 110);
  addPlat(3600, 300, 120);
  addPlat(4300, 330, 100);
  addPlat(4550, 260, 120);
  addPlat(4900, 300, 140);
  addPlat(5200, 240, 100);
  addPlat(5800, 330, 110);
  addPlat(6100, 270, 120);
  addPlat(6450, 310, 100);
  addPlat(7200, 340, 110);
  addPlat(7600, 280, 130);
  addPlat(8000, 320, 100);
  addPlat(8400, 260, 140);
  addPlat(8800, 320, 120);
  spikes.push({ x: 1520, y: GROUND_Y + 8, w: 80, h: 20 });
  spikes.push({ x: 2640, y: GROUND_Y + 8, w: 90, h: 20 });
  spikes.push({ x: 3980, y: GROUND_Y + 8, w: 100, h: 20 });
  spikes.push({ x: 5520, y: GROUND_Y + 8, w: 110, h: 20 });
  spikes.push({ x: 6880, y: GROUND_Y + 8, w: 100, h: 20 });
  buildings.push({ x: 300, y: GROUND_Y - 110, w: 120, h: 110, kind: "house", label: "EV" });
  doors.push({ x: 340, y: GROUND_Y - 56, w: 36, h: 56, id: "d1", label: "Ev", target: "interior", interiorId: "house1" });
  buildings.push({ x: 760, y: GROUND_Y - 120, w: 140, h: 120, kind: "bar", label: "BAR" });
  doors.push({ x: 810, y: GROUND_Y - 56, w: 40, h: 56, id: "d2", label: "Bar", target: "interior", interiorId: "bar1" });
  buildings.push({ x: 2040, y: GROUND_Y - 110, w: 120, h: 110, kind: "house", label: "KULÜBE" });
  doors.push({ x: 2080, y: GROUND_Y - 56, w: 36, h: 56, id: "d3", label: "Kulübe", target: "interior", interiorId: "house2" });
  buildings.push({ x: 4480, y: GROUND_Y - 120, w: 150, h: 120, kind: "bar", label: "MEYHANE" });
  doors.push({ x: 4530, y: GROUND_Y - 56, w: 40, h: 56, id: "d4", label: "Meyhane", target: "interior", interiorId: "bar2" });
  gates.push({ x: 6980, y: GROUND_Y - 120, w: 28, h: 120, open: false });
  addEnemy("slime", 520, GROUND_Y - 26, 70);
  addEnemy("thug", 1100, GROUND_Y - 50, 90);
  addEnemy("bat", 700, 200, 110);
  addEnemy("slime", 1800, GROUND_Y - 26, 80);
  addEnemy("soldier", 2200, GROUND_Y - 48, 100);
  addEnemy("bat", 2400, 170, 100);
  addEnemy("thug", 3000, GROUND_Y - 50, 90);
  addEnemy("soldier", 3500, GROUND_Y - 48, 110);
  addEnemy("midboss", 3900, GROUND_Y - 70, 160);
  addEnemy("bat", 4400, 160, 100);
  addEnemy("thug", 4800, GROUND_Y - 50, 90);
  addEnemy("soldier", 5300, GROUND_Y - 48, 80);
  addEnemy("thug", 6000, GROUND_Y - 50, 100);
  addEnemy("soldier", 6400, GROUND_Y - 48, 90);
  addEnemy("slime", 6700, GROUND_Y - 26, 70);
  addEnemy("boss", 8200, GROUND_Y - 84, 240);
  addItem("coin", 260, 310);
  addItem("potion", 520, 260);
  addItem("coin", 1000, 280);
  addItem("coin", 1780, 310);
  addItem("potion", 2000, 240);
  addItem("key", 3380, 180);
  addItem("potion", 4580, 230);
  addItem("coin", 4920, 270);
  addItem("potion", 6120, 240);
  addItem("coin", 7620, 250);
  addItem("medallion", 9100, GROUND_Y - 50);
}
function zoneAt(x: number): Zone {
  if (x < 1600) return "village";
  if (x < 4000) return "forest";
  if (x < 7000) return "ruins";
  return "boss";
}
function zoneLabel(z: Zone) {
  return {
    village: "Köy Kenarı",
    forest: "Karanlık Orman",
    ruins: "Eski Harabeler",
    boss: "Kardeş Kulesi",
  }[z];
}
function queueDialog(lines: DialogLine[]) {
  dialogQueue.push(...lines);
  if (state === "playing" && dialogQueue.length) {
    state = "dialog";
    showDialogLine();
  }
}
function showDialogLine() {
  const line = dialogQueue[0];
  if (!line) {
    dialogEl.classList.remove("show");
    dialogEl.setAttribute("aria-hidden", "true");
    if (state === "dialog") state = "playing";
    return;
  }
  dialogName.textContent = line.name;
  dialogText.textContent = line.text;
  dialogEl.classList.add("show");
  dialogEl.setAttribute("aria-hidden", "false");
  sfxDialog();
}
function advanceDialog() {
  if (!dialogQueue.length) return;
  dialogQueue.shift();
  if (dialogQueue.length) showDialogLine();
  else {
    dialogEl.classList.remove("show");
    dialogEl.setAttribute("aria-hidden", "true");
    state = "playing";
  }
}
function showStory(text: string) {
  storyEl.textContent = text;
  storyEl.classList.add("show");
  storyTimer = 4.5;
}
function showHint(text: string) {
  hintToast.textContent = text;
  hintToast.classList.add("show");
  hintTimer = 2.2;
}
function updateHud() {
  const pct = Math.max(0, (player.hp / player.maxHp) * 100);
  hpFill.style.width = `${pct}%`;
  hpText.textContent = String(Math.max(0, Math.ceil(player.hp)));
  if (scene === "interior" && currentInterior) zoneName.textContent = currentInterior.title;
  else zoneName.textContent = zoneLabel(zoneAt(player.x + player.w / 2));
  coinCount.textContent = String(inventory.coins);
  potionCount.textContent = String(inventory.potion);
  keySlot.classList.toggle("owned", inventory.key);
  medalSlot.classList.toggle("owned", inventory.medallion);
  const w = WEAPONS[weapon];
  weaponNameEl.textContent = w.label;
  ammoTextEl.textContent = w.ammoMax > 0 ? ` · ${ammo}/${w.ammoMax}` : "";
}
function hurtPlayer(dmg: number, knock: number) {
  if (invuln > 0 || state !== "playing") return;
  player.hp -= dmg;
  invuln = 0.9;
  player.vx = knock;
  player.vy = -260;
  shake = 10;
  sfxHurt();
  burst(player.x + player.w / 2, player.y + player.h / 2, "#ff6b6b", 12);
  updateHud();
  if (player.hp <= 0) {
    state = "dead";
    showOverlay("DÜŞTÜN", "R veya Yeniden ile tekrar dene.");
  }
}
function showOverlay(title: string, text: string) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  overlay.classList.add("show");
  overlay.setAttribute("aria-hidden", "false");
}
function hideOverlay() {
  overlay.classList.remove("show");
  overlay.setAttribute("aria-hidden", "true");
}
function attackBox(): Rect | null {
  if (attackT <= 0) return null;
  const w = WEAPONS[weapon];
  if (weapon === "rifle") {
    return {
      x: facing === 1 ? player.x + player.w : player.x - w.range,
      y: player.y + 16,
      w: w.range,
      h: 14,
    };
  }
  return {
    x: facing === 1 ? player.x + player.w - 6 : player.x - w.range + 6,
    y: player.y + 10,
    w: w.range,
    h: 26,
  };
}
function usePotion() {
  if (inventory.potion <= 0 || player.hp >= player.maxHp || state !== "playing") return;
  inventory.potion -= 1;
  player.hp = Math.min(player.maxHp, player.hp + 280);
  burst(player.x + player.w / 2, player.y + 10, "#7dffb3", 14);
  sfxPickup();
  updateHud();
  showStory("İksir içildi. (+280 can)");
}
function solidList(): Rect[] {
  if (scene === "interior") return interiorPlatforms;
  const list: Rect[] = [...platforms];
  for (const g of gates) if (!g.open) list.push(g);
  return list;
}
function solidAt(r: Rect): Rect | null {
  for (const p of solidList()) if (aabb(r, p)) return p;
  return null;
}
function resolvePlayer(dt: number) {
  player.vy += GRAVITY * dt;
  player.x += player.vx * dt;
  let hit = solidAt(player);
  if (hit) {
    if (player.vx > 0) player.x = hit.x - player.w;
    else if (player.vx < 0) player.x = hit.x + hit.w;
    player.vx = 0;
  }
  if (scene === "interior") {
    player.x = Math.max(20, Math.min(player.x, INTERIOR_W - player.w - 20));
  }
  player.y += player.vy * dt;
  onGround = false;
  hit = solidAt(player);
  if (hit) {
    if (player.vy > 0) {
      player.y = hit.y - player.h;
      onGround = true;
      coyote = 0.1;
    } else if (player.vy < 0) {
      player.y = hit.y + hit.h;
    }
    player.vy = 0;
  }
  if (player.y > H + 80) hurtPlayer(9999, 0);
  if (scene === "world") {
    for (const s of spikes) {
      if (aabb(player, s)) {
        hurtPlayer(rand(90, 110), facing * -220);
        break;
      }
    }
  }
}
function enemyDamage(kind: EnemyKind) {
  if (kind === "boss" || kind === "midboss") return rand(250, 300);
  return rand(90, 110);
}
function updateEnemies(dt: number) {
  if (scene !== "world") return;
  for (const e of enemies) {
    if (!e.alive) continue;
    e.hurt = Math.max(0, e.hurt - dt);
    e.flash = Math.max(0, e.flash - dt);
    e.attackCd = Math.max(0, e.attackCd - dt);
    if (e.kind === "bat") {
      e.x += e.vx * dt;
      e.y += Math.sin(time * 4 + e.x * 0.01) * 40 * dt;
      if (e.x < e.patrolL || e.x > e.patrolR) e.vx *= -1;
      e.facing = e.vx >= 0 ? 1 : -1;
    } else if (e.kind === "boss" || e.kind === "midboss") {
      const dx = player.x - e.x;
      if (Math.abs(dx) < 560) {
        e.facing = dx >= 0 ? 1 : -1;
        e.vx = e.facing * (e.kind === "boss" ? 100 : 90);
        e.x += e.vx * dt;
        if (e.x < e.patrolL) e.x = e.patrolL;
        if (e.x > e.patrolR) e.x = e.patrolR;
        if (e.kind === "midboss" && !midbossIntro && Math.abs(dx) < 380) {
          midbossIntro = true;
          queueDialog([
            { name: "DEMİR YÜZ", text: "Bu yolda kardeşini mi arıyorsun, ufaklık?" },
            { name: "SEN", text: "Yoldan çekil." },
            { name: "DEMİR YÜZ", text: "Önce benimle konuşursun. Yumrukla." },
          ]);
        }
        if (e.kind === "boss" && !bossIntro && Math.abs(dx) < 420) {
          bossIntro = true;
          queueDialog([
            { name: "GARDİYAN", text: "Kule benim. Kardeşin… içeride." },
            { name: "SEN", text: "O zaman kapıyı aç." },
            { name: "GARDİYAN", text: "Açılmaz. Kırılır." },
          ]);
        }
        if (e.attackCd <= 0 && Math.abs(dx) < 200) {
          e.vy = -500;
          e.attackCd = 2.1;
        }
      }
      e.vy += GRAVITY * dt;
      e.y += e.vy * dt;
      const hit = solidAt(e);
      if (hit && e.vy >= 0) {
        e.y = hit.y - e.h;
        e.vy = 0;
        if (e.attackCd > 1.7) {
          shake = 12;
          burst(e.x + e.w / 2, e.y + e.h, "#c9a227", 14);
        }
      }
    } else {
      e.x += e.vx * dt;
      if (e.x < e.patrolL || e.x > e.patrolR) e.vx *= -1;
      e.facing = e.vx >= 0 ? 1 : -1;
      e.vy += GRAVITY * dt;
      e.y += e.vy * dt;
      const hit = solidAt(e);
      if (hit && e.vy >= 0) {
        e.y = hit.y - e.h;
        e.vy = 0;
      }
    }
    if (e.hurt <= 0 && aabb(player, e) && invuln <= 0) {
      const knock = player.x < e.x ? -260 : 260;
      hurtPlayer(enemyDamage(e.kind), knock);
    }
  }
  const box = attackBox();
  if (box) {
    for (const e of enemies) {
      if (!e.alive || e.hurt > 0) continue;
      if (!aabb(box, e)) continue;
      const dmg = WEAPONS[weapon].damage;
      e.hp -= dmg;
      e.hurt = 0.2;
      e.flash = 0.15;
      e.vx = facing * (e.kind === "boss" || e.kind === "midboss" ? 30 : 130);
      sfxHit();
      burst(e.x + e.w / 2, e.y + e.h / 2, "#ffe08a", 8);
      shake = 5;
      if (e.hp <= 0) {
        e.alive = false;
        burst(e.x + e.w / 2, e.y + e.h / 2, "#ff8a8a", 18);
        if (e.kind === "midboss") {
          queueDialog([
            { name: "DEMİR YÜZ", text: "Heh… kuleye giden yol… anahtarda." },
            { name: "SEN", text: "Anladım." },
          ]);
          if (!items.some((i) => i.kind === "key" && !i.taken)) addItem("key", e.x, e.y - 10);
        } else if (e.kind === "boss") {
          queueDialog([
            { name: "GARDİYAN", text: "Git… onu bul…" },
            { name: "SEN", text: "Bekle beni." },
          ]);
        } else if (chance(0.3)) {
          addItem("coin", e.x + 6, e.y);
        }
      }
    }
  }
}
function updateItems(dt: number) {
  const list = scene === "world" ? items : [];
  for (const it of list) {
    if (it.taken) continue;
    it.bob += dt * 3;
    const body = { x: it.x, y: it.y + Math.sin(it.bob) * 4, w: it.w, h: it.h };
    if (!aabb(player, body)) continue;
    it.taken = true;
    sfxPickup();
    if (it.kind === "coin") inventory.coins += 1;
    else if (it.kind === "key") {
      inventory.key = true;
      showStory("Anahtar bulundu. Kule kapısı açılabilir.");
    } else if (it.kind === "potion") {
      inventory.potion += 1;
      showStory("Can iksiri alındı. C ile kullan (+280).");
    } else if (it.kind === "medallion") {
      inventory.medallion = true;
      state = "win";
      queueDialog([{ name: "KARDEŞ", text: "Beni buldun… Wack. Artık birlikteyiz." }]);
      showOverlay("KARDEŞİNİ BULDUN", "Wack The Man — ilk yolculuk bitti. Devamı sonra.");
    }
    updateHud();
  }
  for (const wp of weaponPickups) {
    if (wp.taken) continue;
    wp.bob += dt * 3;
    const body = { x: wp.x, y: wp.y + Math.sin(wp.bob) * 3, w: wp.w, h: wp.h };
    if (!aabb(player, body)) continue;
    wp.taken = true;
    weapon = wp.weapon;
    ammo = WEAPONS[weapon].ammoMax;
    sfxPickup();
    showStory(`${WEAPONS[weapon].label} alındı!`);
    updateHud();
  }
  if (scene === "world") {
    for (const g of gates) {
      if (g.open) continue;
      if (inventory.key && Math.abs(player.x - g.x) < 70) {
        g.open = true;
        sfxDoor();
        showStory("Kapı açıldı. Kardeş Kulesi!");
        burst(g.x + 10, g.y + 40, "#c9a227", 20);
      }
    }
  }
}
function tryEnterDoor() {
  if (scene === "interior") {
    if (currentInterior && player.x < 140) {
      sfxDoor();
      scene = "world";
      player.x = returnPos.x;
      player.y = returnPos.y;
      player.vx = 0;
      player.vy = 0;
      currentInterior = null;
      weaponPickups.length = 0;
      updateHud();
      showHint("Dışarı çıktın.");
    }
    return;
  }
  for (const d of doors) {
    if (!aabb(player, { x: d.x - 10, y: d.y, w: d.w + 20, h: d.h })) continue;
    const def = interiors[d.interiorId];
    if (!def) continue;
    sfxDoor();
    returnPos = { x: def.returnX, y: def.returnY };
    currentInterior = def;
    buildInteriorRoom(def);
    scene = "interior";
    player.x = 120;
    player.y = GROUND_Y - player.h;
    player.vx = 0;
    player.vy = 0;
    camX = 0;
    updateHud();
    if (def.kind === "bar") {
      queueDialog([
        { name: "BARMEN", text: "İçerisi kalabalık değil. Masaya bak. Belki şansın vardır." },
        { name: "SEN", text: "Sadece geçiyorum." },
      ]);
    } else {
      showHint("Evin içi. Masa / pencere / varil — silah olabilir.");
    }
    return;
  }
}
function updateParticles(dt: number) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]!;
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 600 * dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
}
function tryAttack() {
  if (attackCd > 0 || state !== "playing") return;
  const w = WEAPONS[weapon];
  if (weapon === "rifle") {
    if (ammo <= 0) {
      showHint("Mermi yok! (0/5)");
      beep(90, 0.05, "square", 0.02);
      return;
    }
    ammo -= 1;
    sfxShoot();
    updateHud();
  } else {
    sfxSwing();
  }
  attackT = weapon === "knife" ? 0.1 : 0.16;
  attackCd = w.cooldown;
}
function handleInput(dt: number) {
  if (state === "dialog") {
    const adv =
      keys.has("x") || keys.has("X") || keys.has("Enter") || keys.has(" ");
    if (adv && !dialogAdvanceLatch) {
      dialogAdvanceLatch = true;
      advanceDialog();
    }
    if (!adv) dialogAdvanceLatch = false;
    return;
  }
  const left = keys.has("ArrowLeft") || keys.has("a") || keys.has("A");
  const right = keys.has("ArrowRight") || keys.has("d") || keys.has("D");
  const jump = keys.has(" ") || keys.has("z") || keys.has("Z") || keys.has("w") || keys.has("W");
  const attack = keys.has("x") || keys.has("X") || keys.has("j") || keys.has("J");
  const enter =
    keys.has("ArrowUp") || keys.has("e") || keys.has("E") || keys.has("f") || keys.has("F");
  let ax = 0;
  if (left) ax -= 1;
  if (right) ax += 1;
  if (ax !== 0) facing = ax > 0 ? 1 : -1;
  player.vx = ax * MOVE;
  if (jump) jumpBuffered = 0.12;
  jumpBuffered = Math.max(0, jumpBuffered - dt);
  coyote = Math.max(0, coyote - dt);
  if (jumpBuffered > 0 && (onGround || coyote > 0)) {
    player.vy = -JUMP;
    onGround = false;
    coyote = 0;
    jumpBuffered = 0;
  }
  attackCd = Math.max(0, attackCd - dt);
  attackT = Math.max(0, attackT - dt);
  if (attack && !attackLatch) {
    attackLatch = true;
    tryAttack();
  }
  if (!attack) attackLatch = false;
  if (enter && !interactLatch) {
    interactLatch = true;
    tryEnterDoor();
  }
  if (!enter) interactLatch = false;
  if (scene === "world") {
    for (const d of doors) {
      if (aabb(player, { x: d.x - 12, y: d.y, w: d.w + 24, h: d.h })) {
        showHint(`↑ / E — ${d.label} gir`);
        break;
      }
    }
  } else if (scene === "interior" && player.x < 150) {
    showHint("↑ / E — dışarı çık");
  }
}
function drawSky(zone: Zone) {
  const grads: Record<Zone, [string, string]> = {
    village: ["#1a2740", "#3d5a80"],
    forest: ["#0f1f18", "#1e3d2f"],
    ruins: ["#1a1520", "#3a2a45"],
    boss: ["#1a1018", "#4a2030"],
  };
  const [a, b] = scene === "interior" ? (["#1a1520", "#2a2438"] as const) : grads[zone];
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}
function drawHills(zone: Zone) {
  if (scene === "interior") return;
  const colors: Record<Zone, string> = {
    village: "#243552",
    forest: "#163528",
    ruins: "#2a2035",
    boss: "#301820",
  };
  ctx.fillStyle = colors[zone];
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 40) {
    const wx = x + camX * 0.3;
    const y = 320 + Math.sin(wx * 0.01) * 28 + Math.sin(wx * 0.003) * 18;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W, H);
  ctx.fill();
}
function drawPlatforms(list: Rect[]) {
  for (const p of list) {
    const x = p.x - camX;
    if (x + p.w < -20 || x > W + 20) continue;
    ctx.fillStyle = "#2c3e2f";
    ctx.fillRect(x, p.y, p.w, p.h);
    ctx.fillStyle = "#5a8f4a";
    ctx.fillRect(x, p.y, p.w, 6);
  }
}
function drawBuildings() {
  for (const b of buildings) {
    const x = b.x - camX;
    if (x + b.w < -20 || x > W + 20) continue;
    ctx.fillStyle = b.kind === "bar" ? "#4a3038" : "#3a3428";
    ctx.fillRect(x, b.y, b.w, b.h);
    ctx.fillStyle = b.kind === "bar" ? "#8a4050" : "#6a4030";
    ctx.beginPath();
    ctx.moveTo(x - 8, b.y + 8);
    ctx.lineTo(x + b.w / 2, b.y - 28);
    ctx.lineTo(x + b.w + 8, b.y + 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#c9e6ff";
    ctx.fillRect(x + 14, b.y + 28, 22, 22);
    ctx.fillRect(x + b.w - 36, b.y + 28, 22, 22);
    ctx.fillStyle = "#1a120e";
    ctx.fillRect(x + b.w / 2 - 14, b.y + b.h - 52, 28, 52);
    ctx.fillStyle = "#f5c518";
    ctx.font = "10px monospace";
    ctx.fillText(b.label, x + 12, b.y - 34);
  }
}
function drawInteriorDecor() {
  if (!currentInterior) return;
  ctx.fillStyle = currentInterior.kind === "bar" ? "#2a1a22" : "#2a241c";
  ctx.fillRect(0, 80, W, GROUND_Y - 80);
  ctx.fillStyle = "#3a3028";
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  ctx.fillStyle = "#1a120e";
  ctx.fillRect(40, GROUND_Y - 70, 40, 70);
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(68, GROUND_Y - 40, 6, 6);
  ctx.fillStyle = "#6a4a28";
  ctx.fillRect(220 - camX, 330, 120, 14);
  ctx.fillRect(240 - camX, 344, 12, 40);
  ctx.fillRect(320 - camX, 344, 12, 40);
  ctx.fillRect(520 - camX, 290, 140, 14);
  ctx.fillRect(540 - camX, 304, 12, 50);
  ctx.fillRect(630 - camX, 304, 12, 50);
  ctx.fillStyle = "#7ab0d8";
  ctx.fillRect(800 - camX, 160, 70, 70);
  ctx.strokeStyle = "#1a1a1a";
  ctx.strokeRect(800 - camX, 160, 70, 70);
  for (const bx of [400, 700]) {
    const x = bx - camX;
    ctx.fillStyle = "#6a4020";
    ctx.fillRect(x, GROUND_Y - 36, 28, 36);
    ctx.fillStyle = "#8a6030";
    ctx.fillRect(x + 2, GROUND_Y - 28, 24, 6);
    ctx.fillRect(x + 2, GROUND_Y - 14, 24, 6);
  }
  if (currentInterior.kind === "bar") {
    ctx.fillStyle = "#4a2030";
    ctx.fillRect(300 - camX, 200, 200, 16);
    ctx.fillStyle = "#f5c518";
    ctx.font = "12px monospace";
    ctx.fillText("KÖR FARE", 350 - camX, 212);
  }
}
function drawSpikes() {
  for (const s of spikes) {
    const x = s.x - camX;
    if (x + s.w < 0 || x > W) continue;
    const n = Math.floor(s.w / 12);
    for (let i = 0; i < n; i++) {
      const px = x + i * 12;
      ctx.fillStyle = "#c0c8d0";
      ctx.beginPath();
      ctx.moveTo(px, s.y + s.h);
      ctx.lineTo(px + 6, s.y);
      ctx.lineTo(px + 12, s.y + s.h);
      ctx.fill();
    }
  }
}
function drawGates() {
  for (const g of gates) {
    if (g.open) continue;
    const x = g.x - camX;
    ctx.fillStyle = "#4a3a28";
    ctx.fillRect(x, g.y, g.w, g.h);
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(x + 8, g.y + 40, 12, 12);
  }
}
function drawPlayer() {
  const x = player.x - camX;
  const y = player.y;
  const blink = invuln > 0 && Math.floor(time * 20) % 2 === 0;
  if (blink) return;
  ctx.save();
  if (facing < 0) {
    ctx.translate(x + player.w / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(x + player.w / 2), 0);
  }
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(x + 15, y + player.h + 2, 13, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a2a32";
  ctx.fillRect(x + 5, y + 44, 9, 8);
  ctx.fillRect(x + 17, y + 44, 9, 8);
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(x + 5, y + 44, 9, 2);
  ctx.fillRect(x + 17, y + 44, 9, 2);
  const legSwing = onGround ? Math.sin(time * (Math.abs(player.vx) > 20 ? 14 : 0)) * 3 : 0;
  ctx.fillStyle = "#3a4558";
  ctx.fillRect(x + 7, y + 30, 8, 15 + legSwing);
  ctx.fillRect(x + 16, y + 30, 8, 15 - legSwing);
  ctx.fillStyle = "#5a6578";
  ctx.fillRect(x + 5, y + 14, 20, 18);
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(x + 5, y + 20, 20, 3);
  ctx.fillStyle = "#8a95a8";
  ctx.fillRect(x + 12, y + 14, 6, 18);
  ctx.fillStyle = "#8a2030";
  ctx.fillRect(x + 2, y + 16, 5, 22);
  ctx.fillStyle = "#e8b896";
  ctx.fillRect(x + 8, y + 2, 14, 13);
  ctx.fillStyle = "#4a5568";
  ctx.fillRect(x + 6, y - 2, 18, 8);
  ctx.fillRect(x + 10, y - 8, 10, 8);
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(x + 6, y + 4, 18, 2);
  ctx.fillStyle = "#1a1a22";
  ctx.fillRect(x + 10, y + 7, 3, 3);
  ctx.fillRect(x + 16, y + 7, 3, 3);
  const swinging = attackT > 0;
  if (weapon === "rifle") {
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(x + 22, y + 18, swinging ? 40 : 28, 6);
    ctx.fillStyle = "#6a4a28";
    ctx.fillRect(x + 20, y + 20, 10, 8);
  } else if (weapon === "sword") {
    ctx.fillStyle = "#c0d0e0";
    ctx.fillRect(x + (swinging ? 24 : 22), y + (swinging ? 8 : 14), 5, swinging ? 28 : 22);
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(x + 20, y + (swinging ? 30 : 32), 10, 4);
  } else if (weapon === "axe") {
    ctx.fillStyle = "#6a4020";
    ctx.fillRect(x + 24, y + 12, 5, 24);
    ctx.fillStyle = "#a0a8b0";
    ctx.fillRect(x + 20, y + 8, 16, 10);
  } else if (weapon === "knife") {
    ctx.fillStyle = "#d0d8e0";
    ctx.fillRect(x + (swinging ? 28 : 24), y + 18, swinging ? 16 : 12, 4);
    ctx.fillStyle = "#4a3020";
    ctx.fillRect(x + 22, y + 17, 6, 6);
  } else if (swinging) {
    ctx.fillStyle = "#e8b896";
    ctx.fillRect(x + 22, y + 16, 20, 7);
  } else {
    ctx.fillStyle = "#e8b896";
    ctx.fillRect(x + 22, y + 16, 7, 12);
  }
  ctx.restore();
}
function drawEnemy(e: Enemy) {
  if (!e.alive) return;
  const x = e.x - camX;
  const y = e.y;
  if (x + e.w < -40 || x > W + 40) return;
  ctx.save();
  if (e.flash > 0) ctx.globalAlpha = 0.45;
  if (e.kind === "slime") {
    ctx.fillStyle = "#4ecf7a";
    ctx.beginPath();
    ctx.ellipse(x + e.w / 2, y + e.h - 4, e.w / 2, e.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#102018";
    ctx.fillRect(x + 8, y + 8, 5, 5);
    ctx.fillRect(x + 18, y + 8, 5, 5);
  } else if (e.kind === "bat") {
    const flap = Math.sin(time * 12) * 6;
    ctx.fillStyle = "#6a4a8a";
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 10);
    ctx.lineTo(x - 6, y + 4 + flap);
    ctx.lineTo(x + 8, y + 14);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 10);
    ctx.lineTo(x + 34, y + 4 - flap);
    ctx.lineTo(x + 20, y + 14);
    ctx.fill();
    ctx.fillStyle = "#2a1a3a";
    ctx.fillRect(x + 10, y + 6, 12, 10);
  } else if (e.kind === "soldier" || e.kind === "thug") {
    ctx.fillStyle = "#2a2220";
    ctx.fillRect(x + 6, y + 40, 8, 8);
    ctx.fillRect(x + 18, y + 40, 8, 8);
    ctx.fillStyle = e.kind === "thug" ? "#4a3038" : "#5a3030";
    ctx.fillRect(x + 5, y + 16, 22, 24);
    ctx.fillStyle = "#b09080";
    ctx.fillRect(x + 8, y + 2, 16, 14);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(x + 8, y + 0, 16, 5);
    ctx.fillStyle = "#ff4444";
    ctx.fillRect(x + 11, y + 7, 3, 3);
    ctx.fillRect(x + 18, y + 7, 3, 3);
    ctx.fillStyle = "#c0c0c0";
    const sx = e.facing > 0 ? x + 24 : x - 14;
    ctx.fillRect(sx, y + 18, 18, 3);
  } else {
    ctx.fillStyle = "#1a1010";
    ctx.fillRect(x + 10, y + e.h - 12, 16, 12);
    ctx.fillRect(x + e.w - 26, y + e.h - 12, 16, 12);
    ctx.fillStyle = e.kind === "boss" ? "#5a2028" : "#3a4058";
    ctx.fillRect(x + 6, y + 24, e.w - 12, e.h - 36);
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(x + 6, y + 40, e.w - 12, 6);
    ctx.fillStyle = "#c09070";
    ctx.fillRect(x + 14, y + 2, e.w - 28, 26);
    ctx.fillStyle = "#1a1010";
    ctx.fillRect(x + 10, y - 4, e.w - 20, 12);
    ctx.fillStyle = "#d0d0d0";
    ctx.fillRect(x + 6, y - 10, 8, 14);
    ctx.fillRect(x + e.w - 14, y - 10, 8, 14);
    ctx.fillStyle = "#ff3030";
    ctx.fillRect(x + 20, y + 12, 6, 6);
    ctx.fillRect(x + e.w - 26, y + 12, 6, 6);
    const bw = e.w - 10;
    ctx.fillStyle = "#1a1010";
    ctx.fillRect(x + 5, y - 18, bw, 6);
    ctx.fillStyle = "#e04040";
    ctx.fillRect(x + 5, y - 18, bw * (e.hp / e.maxHp), 6);
  }
  ctx.restore();
}
function drawWorldItem(it: WorldItem) {
  if (it.taken) return;
  const x = it.x - camX;
  const y = it.y + Math.sin(it.bob) * 4;
  if (x < -30 || x > W + 30) return;
  if (it.kind === "coin") {
    ctx.fillStyle = "#ffd76a";
    ctx.beginPath();
    ctx.arc(x + 7, y + 7, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (it.kind === "key") {
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(x + 2, y + 6, 14, 5);
    ctx.beginPath();
    ctx.arc(x + 4, y + 8, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (it.kind === "potion") {
    ctx.fillStyle = "#7dffb3";
    ctx.fillRect(x + 4, y + 6, 8, 12);
    ctx.fillStyle = "#e8e8e8";
    ctx.fillRect(x + 5, y + 2, 6, 5);
  } else {
    const pulse = 0.7 + Math.sin(time * 5) * 0.3;
    ctx.fillStyle = `rgba(154,208,255,${pulse})`;
    ctx.beginPath();
    ctx.arc(x + 11, y + 11, 11, 0, Math.PI * 2);
    ctx.fill();
  }
}
function drawWeaponPickup(wp: WeaponPickup) {
  if (wp.taken) return;
  const x = wp.x - camX;
  const y = wp.y + Math.sin(wp.bob) * 3;
  if (x < -40 || x > W + 40) return;
  if (wp.place === "barrel") {
    ctx.fillStyle = "#8a8a8a";
    ctx.fillRect(x + 8, y - 8, 4, 16);
  }
  ctx.fillStyle = "#f5c518";
  ctx.font = "9px monospace";
  ctx.fillText(WEAPONS[wp.weapon].label, x - 4, y - 6);
  if (wp.weapon === "rifle") {
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(x, y + 4, 26, 5);
  } else if (wp.weapon === "sword") {
    ctx.fillStyle = "#c0d0e0";
    ctx.fillRect(x + 8, y - 2, 4, 20);
  } else if (wp.weapon === "axe") {
    ctx.fillStyle = "#6a4020";
    ctx.fillRect(x + 10, y, 4, 16);
    ctx.fillStyle = "#a0a8b0";
    ctx.fillRect(x + 4, y - 2, 14, 8);
  } else {
    ctx.fillStyle = "#d0d8e0";
    ctx.fillRect(x + 4, y + 6, 14, 4);
  }
}
function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life * 2);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - camX, p.y, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}
function resetGame() {
  Object.assign(player, {
    x: 80,
    y: GROUND_Y - 52,
    vx: 0,
    vy: 0,
    hp: 1000,
    maxHp: 1000,
  });
  inventory.coins = 0;
  inventory.key = false;
  inventory.potion = 0;
  inventory.medallion = false;
  weapon = "fist";
  ammo = 0;
  facing = 1;
  invuln = 0;
  attackT = 0;
  attackCd = 0;
  camX = 0;
  scene = "world";
  currentInterior = null;
  midbossIntro = false;
  bossIntro = false;
  dialogQueue = [];
  dialogEl.classList.remove("show");
  buildWorld();
  updateHud();
  queueDialog([
    { name: "???", text: "Hey. Kardeşin doğuya gitti. Sen de git." },
    { name: "SEN", text: "Silahım yok." },
    { name: "???", text: "Evlerde, barlarda bak. Masada… varilde… belki vardır. Belki yoktur." },
  ]);
}
function frame(dt: number) {
  time += dt;
  if (shake > 0) shake = Math.max(0, shake - dt * 30);
  if (state === "playing" || state === "dialog") {
    if (state === "playing") {
      handleInput(dt);
      resolvePlayer(dt);
      updateEnemies(dt);
      updateItems(dt);
    } else {
      handleInput(dt);
    }
    updateParticles(dt);
    invuln = Math.max(0, invuln - dt);
    if (scene === "world") {
      camX = player.x + player.w / 2 - W * 0.35;
      camX = Math.max(0, Math.min(camX, WORLD_W - W));
    } else {
      camX = 0;
    }
    if (storyTimer > 0) {
      storyTimer -= dt;
      if (storyTimer <= 0) storyEl.classList.remove("show");
    }
    if (hintTimer > 0) {
      hintTimer -= dt;
      if (hintTimer <= 0) hintToast.classList.remove("show");
    }
  } else {
    updateParticles(dt);
  }
  const z = zoneAt(player.x);
  drawSky(z);
  const ox = shake > 0 ? (Math.random() - 0.5) * shake : 0;
  const oy = shake > 0 ? (Math.random() - 0.5) * shake : 0;
  ctx.save();
  ctx.translate(ox, oy);
  drawHills(z);
  if (scene === "interior") {
    drawInteriorDecor();
    drawPlatforms(interiorPlatforms);
    for (const wp of weaponPickups) drawWeaponPickup(wp);
  } else {
    drawBuildings();
    drawPlatforms(platforms);
    drawSpikes();
    drawGates();
    for (const it of items) drawWorldItem(it);
    for (const e of enemies) drawEnemy(e);
  }
  if (state !== "title") drawPlayer();
  drawParticles();
  ctx.restore();
}
let last = performance.now();
function loop(now: number) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  frame(dt);
  requestAnimationFrame(loop);
}
function startGame() {
  ensureAudio();
  titleEl.classList.add("hidden");
  wrap.classList.add("playing");
  hideOverlay();
  resetGame();
  state = dialogQueue.length ? "dialog" : "playing";
  if (state === "dialog") showDialogLine();
}
function restartFromOverlay() {
  ensureAudio();
  hideOverlay();
  resetGame();
  state = dialogQueue.length ? "dialog" : "playing";
  if (state === "dialog") showDialogLine();
}
window.addEventListener("keydown", (e) => {
  keys.add(e.key);
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
  if (e.key === "r" || e.key === "R") {
    if (state === "playing" || state === "dead" || state === "win" || state === "dialog") {
      hideOverlay();
      resetGame();
      state = dialogQueue.length ? "dialog" : "playing";
      if (state === "dialog") showDialogLine();
    }
  }
  if (e.key === "c" || e.key === "C") usePotion();
  if (e.key === "Enter" && state === "title") startGame();
});
window.addEventListener("keyup", (e) => keys.delete(e.key));
document.querySelector("#btn-start")!.addEventListener("click", startGame);
document.querySelector("#btn-restart")!.addEventListener("click", restartFromOverlay);
function bindHold(sel: string, key: string) {
  const el = document.querySelector<HTMLElement>(sel)!;
  const on = (ev: Event) => {
    ev.preventDefault();
    keys.add(key);
  };
  const off = (ev: Event) => {
    ev.preventDefault();
    keys.delete(key);
  };
  el.addEventListener("pointerdown", on);
  el.addEventListener("pointerup", off);
  el.addEventListener("pointerleave", off);
  el.addEventListener("pointercancel", off);
}
bindHold("#btn-left", "ArrowLeft");
bindHold("#btn-right", "ArrowRight");
bindHold("#btn-jump", " ");
bindHold("#btn-punch", "x");
bindHold("#btn-enter", "e");
document.querySelector("#btn-potion")!.addEventListener("click", (e) => {
  e.preventDefault();
  usePotion();
});
state = "title";
buildWorld();
player.x = 200;
requestAnimationFrame(loop);
