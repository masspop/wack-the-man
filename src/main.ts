import "./style.css";

type Rect = { x: number; y: number; w: number; h: number };
type Zone = "village" | "forest" | "ruins" | "boss";

type EnemyKind = "slime" | "bat" | "soldier" | "boss";

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

type ItemKind = "coin" | "key" | "potion" | "medallion";

type Item = Rect & {
  kind: ItemKind;
  taken: boolean;
  bob: number;
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

type Inventory = {
  coins: number;
  key: boolean;
  potion: number;
  medallion: boolean;
};

type GameState = "title" | "playing" | "paused" | "win" | "dead";

const canvas = document.querySelector<HTMLCanvasElement>("#game")!;
const ctx = canvas.getContext("2d")!;
const wrap = document.querySelector<HTMLElement>("#wrap")!;
const titleEl = document.querySelector<HTMLElement>("#title-screen")!;
const overlay = document.querySelector<HTMLElement>("#overlay")!;
const overlayTitle = document.querySelector<HTMLElement>("#overlay-title")!;
const overlayText = document.querySelector<HTMLElement>("#overlay-text")!;
const storyEl = document.querySelector<HTMLElement>("#story")!;
const hpFill = document.querySelector<HTMLElement>("#hp-fill")!;
const zoneName = document.querySelector<HTMLElement>("#zone-name")!;
const coinCount = document.querySelector<HTMLElement>("#coin-count")!;
const potionCount = document.querySelector<HTMLElement>("#potion-count")!;
const keySlot = document.querySelector<HTMLElement>("#key-slot")!;
const medalSlot = document.querySelector<HTMLElement>("#medal-slot")!;

const W = 960;
const H = 540;
const GRAVITY = 2200;
const MOVE = 290;
const JUMP = 620;
const WORLD_W = 9200;
const GROUND_Y = 430;

canvas.width = W;
canvas.height = H;

const keys = new Set<string>();
const particles: Particle[] = [];

let state: GameState = "title";
let time = 0;
let camX = 0;
let storyTimer = 0;
let invuln = 0;
let punchT = 0;
let punchCd = 0;
let facing: 1 | -1 = 1;
let onGround = false;
let jumpBuffered = 0;
let coyote = 0;
let shake = 0;
let bossIntroDone = false;

const inventory: Inventory = {
  coins: 0,
  key: false,
  potion: 0,
  medallion: false,
};

const player: Rect & { vx: number; vy: number; hp: number; maxHp: number } = {
  x: 80,
  y: GROUND_Y - 48,
  w: 28,
  h: 48,
  vx: 0,
  vy: 0,
  hp: 5,
  maxHp: 5,
};

const platforms: Rect[] = [];
const enemies: Enemy[] = [];
const items: Item[] = [];
const spikes: Rect[] = [];
const gates: (Rect & { open: boolean })[] = [];

function aabb(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function addPlat(x: number, y: number, w: number, h = 24) {
  platforms.push({ x, y, w, h });
}

function addEnemy(
  kind: EnemyKind,
  x: number,
  y: number,
  patrol = 90,
  hp = 2,
): void {
  const sizes: Record<EnemyKind, { w: number; h: number }> = {
    slime: { w: 30, h: 24 },
    bat: { w: 28, h: 20 },
    soldier: { w: 30, h: 46 },
    boss: { w: 70, h: 80 },
  };
  const s = sizes[kind];
  enemies.push({
    kind,
    x,
    y,
    w: s.w,
    h: s.h,
    vx: kind === "bat" ? 80 : 55,
    vy: 0,
    hp,
    maxHp: hp,
    hurt: 0,
    alive: true,
    patrolL: x - patrol,
    patrolR: x + patrol,
    facing: 1,
    flash: 0,
    attackCd: 0,
  });
}

function addItem(kind: ItemKind, x: number, y: number) {
  const sizes: Record<ItemKind, { w: number; h: number }> = {
    coin: { w: 14, h: 14 },
    key: { w: 18, h: 18 },
    potion: { w: 16, h: 20 },
    medallion: { w: 22, h: 22 },
  };
  const s = sizes[kind];
  items.push({ kind, x, y, w: s.w, h: s.h, taken: false, bob: Math.random() * Math.PI * 2 });
}

function burst(x: number, y: number, color: string, n = 10) {
  for (let i = 0; i < n; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 280,
      vy: -Math.random() * 220 - 40,
      life: 0.35 + Math.random() * 0.4,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

function buildWorld() {
  platforms.length = 0;
  enemies.length = 0;
  items.length = 0;
  spikes.length = 0;
  gates.length = 0;
  particles.length = 0;

  // Ground segments with gaps
  addPlat(0, GROUND_Y, 1400);
  addPlat(1520, GROUND_Y, 900);
  addPlat(2550, GROUND_Y, 1100);
  addPlat(3800, GROUND_Y, 1400);
  addPlat(5350, GROUND_Y, 1200);
  addPlat(6700, GROUND_Y, 2500);

  // Village platforms
  addPlat(220, 340, 120);
  addPlat(420, 280, 100);
  addPlat(620, 320, 140);
  addPlat(900, 300, 110);
  addPlat(1100, 250, 90);

  // Forest platforms + tree tops
  addPlat(1650, 340, 100);
  addPlat(1820, 280, 120);
  addPlat(2020, 220, 90);
  addPlat(2180, 300, 130);
  addPlat(2380, 250, 100);

  // Ruins climb
  addPlat(2700, 350, 80);
  addPlat(2850, 300, 80);
  addPlat(3000, 250, 80);
  addPlat(3150, 200, 100);
  addPlat(3350, 280, 120);
  addPlat(3500, 330, 100);
  addPlat(4000, 340, 90);
  addPlat(4200, 280, 110);
  addPlat(4450, 220, 100);
  addPlat(4700, 300, 140);
  addPlat(4950, 250, 100);

  // Gate area
  addPlat(5500, 340, 100);
  addPlat(5700, 280, 120);
  addPlat(5950, 220, 90);
  addPlat(6200, 300, 140);
  addPlat(6450, 250, 100);

  // Boss arena platforms
  addPlat(7000, 340, 100);
  addPlat(7300, 280, 120);
  addPlat(7600, 320, 100);
  addPlat(7900, 260, 140);
  addPlat(8200, 320, 100);
  addPlat(8500, 280, 160);

  // Spikes in gaps / traps
  spikes.push({ x: 1420, y: GROUND_Y + 10, w: 80, h: 20 });
  spikes.push({ x: 2440, y: GROUND_Y + 10, w: 90, h: 20 });
  spikes.push({ x: 3680, y: GROUND_Y + 10, w: 100, h: 20 });
  spikes.push({ x: 5220, y: GROUND_Y + 10, w: 110, h: 20 });
  spikes.push({ x: 6580, y: GROUND_Y + 10, w: 100, h: 20 });
  spikes.push({ x: 4800, y: GROUND_Y - 8, w: 50, h: 16 });
  spikes.push({ x: 6100, y: GROUND_Y - 8, w: 40, h: 16 });

  // Locked gate before boss
  gates.push({ x: 6680, y: GROUND_Y - 120, w: 28, h: 120, open: false });

  // Enemies — village
  addEnemy("slime", 500, GROUND_Y - 24, 70, 2);
  addEnemy("slime", 980, GROUND_Y - 24, 80, 2);
  addEnemy("bat", 700, 200, 100, 1);

  // Forest
  addEnemy("slime", 1750, GROUND_Y - 24, 90, 2);
  addEnemy("soldier", 2100, GROUND_Y - 46, 100, 3);
  addEnemy("bat", 1900, 180, 120, 1);
  addEnemy("bat", 2300, 160, 90, 1);
  addEnemy("slime", 2450, 250 - 24, 40, 2);

  // Ruins
  addEnemy("soldier", 2900, GROUND_Y - 46, 80, 3);
  addEnemy("slime", 3200, GROUND_Y - 24, 70, 2);
  addEnemy("soldier", 3600, GROUND_Y - 46, 110, 3);
  addEnemy("bat", 3400, 150, 100, 1);
  addEnemy("soldier", 4300, GROUND_Y - 46, 90, 4);
  addEnemy("slime", 4600, GROUND_Y - 24, 80, 2);
  addEnemy("bat", 4800, 170, 110, 2);
  addEnemy("soldier", 5100, GROUND_Y - 46, 70, 4);

  // Approach
  addEnemy("soldier", 5600, GROUND_Y - 46, 90, 4);
  addEnemy("slime", 5900, GROUND_Y - 24, 80, 3);
  addEnemy("bat", 6100, 160, 100, 2);
  addEnemy("soldier", 6400, GROUND_Y - 46, 80, 4);

  // Boss
  addEnemy("boss", 8000, GROUND_Y - 80, 220, 18);

  // Items
  addItem("coin", 260, 310);
  addItem("coin", 450, 250);
  addItem("coin", 940, 270);
  addItem("potion", 1120, 220);
  addItem("coin", 1680, 310);
  addItem("coin", 1850, 250);
  addItem("coin", 2200, 270);
  addItem("potion", 2390, 220);
  addItem("coin", 2720, 320);
  addItem("coin", 3020, 220);
  addItem("key", 3180, 160); // ruins key
  addItem("coin", 3380, 250);
  addItem("potion", 4020, 310);
  addItem("coin", 4220, 250);
  addItem("coin", 4480, 190);
  addItem("coin", 4720, 270);
  addItem("potion", 5520, 310);
  addItem("coin", 5720, 250);
  addItem("coin", 5970, 190);
  addItem("coin", 6220, 270);
  addItem("potion", 7020, 310);
  addItem("coin", 7320, 250);
  addItem("coin", 7920, 230);
  addItem("medallion", 8700, GROUND_Y - 50);
}

function zoneAt(x: number): Zone {
  if (x < 1500) return "village";
  if (x < 3800) return "forest";
  if (x < 6700) return "ruins";
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

function resetGame() {
  Object.assign(player, {
    x: 80,
    y: GROUND_Y - 48,
    vx: 0,
    vy: 0,
    hp: 5,
    maxHp: 5,
  });
  inventory.coins = 0;
  inventory.key = false;
  inventory.potion = 0;
  inventory.medallion = false;
  facing = 1;
  invuln = 0;
  punchT = 0;
  punchCd = 0;
  camX = 0;
  storyTimer = 6;
  bossIntroDone = false;
  onGround = false;
  buildWorld();
  updateHud();
  showStory("Kardeşin kayboldu. Köyden ormana, harabelere… kapıyı aç, kuleye çık.");
}

function updateHud() {
  const pct = Math.max(0, (player.hp / player.maxHp) * 100);
  hpFill.style.width = `${pct}%`;
  zoneName.textContent = zoneLabel(zoneAt(player.x + player.w / 2));
  coinCount.textContent = String(inventory.coins);
  potionCount.textContent = String(inventory.potion);
  keySlot.classList.toggle("owned", inventory.key);
  medalSlot.classList.toggle("owned", inventory.medallion);
}

function showStory(text: string) {
  storyEl.textContent = text;
  storyEl.classList.add("show");
  storyTimer = 5.5;
}

function hurtPlayer(dmg: number, knock: number) {
  if (invuln > 0 || state !== "playing") return;
  player.hp -= dmg;
  invuln = 1.1;
  player.vx = knock;
  player.vy = -280;
  shake = 10;
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

function punchBox(): Rect | null {
  if (punchT <= 0) return null;
  return {
    x: facing === 1 ? player.x + player.w - 4 : player.x - 30,
    y: player.y + 12,
    w: 34,
    h: 22,
  };
}

function usePotion() {
  if (inventory.potion <= 0 || player.hp >= player.maxHp || state !== "playing") return;
  inventory.potion -= 1;
  player.hp = Math.min(player.maxHp, player.hp + 2);
  burst(player.x + player.w / 2, player.y + 10, "#7dffb3", 14);
  updateHud();
  showStory("İksir içildi. Can yenilendi.");
}

function solidAt(r: Rect, ignoreGate = false): Rect | null {
  for (const p of platforms) if (aabb(r, p)) return p;
  if (!ignoreGate) {
    for (const g of gates) {
      if (!g.open && aabb(r, g)) return g;
    }
  }
  return null;
}

function resolvePlayer(dt: number) {
  player.vy += GRAVITY * dt;
  player.x += player.vx * dt;

  // horizontal collide
  let hit = solidAt(player);
  if (hit) {
    if (player.vx > 0) player.x = hit.x - player.w;
    else if (player.vx < 0) player.x = hit.x + hit.w;
    player.vx = 0;
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

  // fall death
  if (player.y > H + 80) {
    hurtPlayer(99, 0);
  }

  // spikes
  for (const s of spikes) {
    if (aabb(player, s)) {
      hurtPlayer(1, facing * -220);
      break;
    }
  }
}

function updateEnemies(dt: number) {
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
    } else if (e.kind === "boss") {
      // chase player when nearby
      const dx = player.x - e.x;
      if (Math.abs(dx) < 520) {
        e.facing = dx >= 0 ? 1 : -1;
        e.vx = e.facing * 95;
        e.x += e.vx * dt;
        if (e.x < e.patrolL) e.x = e.patrolL;
        if (e.x > e.patrolR) e.x = e.patrolR;
        if (!bossIntroDone && Math.abs(dx) < 400) {
          bossIntroDone = true;
          showStory("Gardiyan: “Buradan geçemezsin. Kardeşin… benimde.”");
          shake = 14;
        }
        // stomp hop
        if (onGround && e.attackCd <= 0 && Math.abs(dx) < 180) {
          e.vy = -520;
          e.attackCd = 2.2;
        }
      }
      e.vy += GRAVITY * dt;
      e.y += e.vy * dt;
      const ground = { x: e.x, y: e.y, w: e.w, h: e.h };
      const hit = solidAt(ground);
      if (hit && e.vy >= 0) {
        e.y = hit.y - e.h;
        e.vy = 0;
        if (e.attackCd > 1.8) {
          shake = 12;
          burst(e.x + e.w / 2, e.y + e.h, "#c9a227", 16);
        }
      }
    } else {
      e.x += e.vx * dt;
      if (e.x < e.patrolL || e.x > e.patrolR) e.vx *= -1;
      e.facing = e.vx >= 0 ? 1 : -1;
      // gravity for ground enemies
      e.vy += GRAVITY * dt;
      e.y += e.vy * dt;
      const hit = solidAt(e);
      if (hit && e.vy >= 0) {
        e.y = hit.y - e.h;
        e.vy = 0;
      }
    }

    // contact damage
    if (e.hurt <= 0 && aabb(player, e) && invuln <= 0) {
      const knock = player.x < e.x ? -260 : 260;
      hurtPlayer(e.kind === "boss" ? 2 : 1, knock);
    }
  }

  // punch hits
  const box = punchBox();
  if (box) {
    for (const e of enemies) {
      if (!e.alive || e.hurt > 0) continue;
      if (aabb(box, e)) {
        e.hp -= 1;
        e.hurt = 0.25;
        e.flash = 0.2;
        e.vx = facing * (e.kind === "boss" ? 40 : 120);
        burst(e.x + e.w / 2, e.y + e.h / 2, "#ffe08a", 8);
        shake = 5;
        if (e.hp <= 0) {
          e.alive = false;
          burst(e.x + e.w / 2, e.y + e.h / 2, "#ff8a8a", 18);
          if (e.kind === "boss") {
            showStory("Gardiyan düştü. Medalyon önde… kardeşine yaklaştın.");
          } else if (Math.random() < 0.35) {
            addItem("coin", e.x + 6, e.y);
          }
        }
      }
    }
  }
}

function updateItems(dt: number) {
  for (const it of items) {
    if (it.taken) continue;
    it.bob += dt * 3;
    const body = {
      x: it.x,
      y: it.y + Math.sin(it.bob) * 4,
      w: it.w,
      h: it.h,
    };
    if (!aabb(player, body)) continue;
    it.taken = true;
    if (it.kind === "coin") {
      inventory.coins += 1;
      burst(it.x, it.y, "#ffd76a", 8);
    } else if (it.kind === "key") {
      inventory.key = true;
      showStory("Eski anahtar bulundu. Kule kapısı açılabilir.");
      burst(it.x, it.y, "#c9a227", 12);
    } else if (it.kind === "potion") {
      inventory.potion += 1;
      showStory("Can iksiri alındı. C ile kullan.");
      burst(it.x, it.y, "#7dffb3", 10);
    } else if (it.kind === "medallion") {
      inventory.medallion = true;
      state = "win";
      showOverlay("KARDEŞİNİ BULDUN", "Medalyon ışıdı. Hikaye burada başlıyor — devamı sonra.");
      burst(it.x, it.y, "#9ad0ff", 24);
    }
    updateHud();
  }

  // open gate with key
  for (const g of gates) {
    if (g.open) continue;
    if (inventory.key && Math.abs(player.x - g.x) < 70) {
      g.open = true;
      showStory("Kapı açıldı. Kardeş Kulesi'ne gir.");
      burst(g.x + 10, g.y + 40, "#c9a227", 20);
      shake = 8;
    }
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

function handleInput(dt: number) {
  const left = keys.has("ArrowLeft") || keys.has("a") || keys.has("A");
  const right = keys.has("ArrowRight") || keys.has("d") || keys.has("D");
  const jump = keys.has(" ") || keys.has("z") || keys.has("Z") || keys.has("w") || keys.has("W");
  const punch = keys.has("x") || keys.has("X") || keys.has("j") || keys.has("J");

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

  punchCd = Math.max(0, punchCd - dt);
  punchT = Math.max(0, punchT - dt);
  if (punch && punchCd <= 0) {
    punchT = 0.16;
    punchCd = 0.28;
  }
}

function drawSky(zone: Zone) {
  const grads: Record<Zone, [string, string]> = {
    village: ["#1a2740", "#3d5a80"],
    forest: ["#0f1f18", "#1e3d2f"],
    ruins: ["#1a1520", "#3a2a45"],
    boss: ["#1a1018", "#4a2030"],
  };
  const [a, b] = grads[zone];
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // stars / dust
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (let i = 0; i < 40; i++) {
    const sx = ((i * 97 + camX * 0.15) % W + W) % W;
    const sy = (i * 37) % (H * 0.55);
    ctx.fillRect(sx, sy, 2, 2);
  }
}

function drawHills(zone: Zone) {
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

function drawPlatforms() {
  for (const p of platforms) {
    const x = p.x - camX;
    if (x + p.w < -20 || x > W + 20) continue;
    ctx.fillStyle = "#2c3e2f";
    ctx.fillRect(x, p.y, p.w, p.h);
    ctx.fillStyle = "#5a8f4a";
    ctx.fillRect(x, p.y, p.w, 6);
    ctx.fillStyle = "#1a241c";
    for (let i = 0; i < p.w; i += 18) {
      ctx.fillRect(x + i, p.y + 8, 2, p.h - 10);
    }
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
    ctx.fillStyle = "#1a140e";
    ctx.fillRect(x + 4, g.y + 10, 4, g.h - 20);
    ctx.fillRect(x + 20, g.y + 10, 4, g.h - 20);
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

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(x + 14, y + player.h + 2, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // boots
  ctx.fillStyle = "#3a2a1a";
  ctx.fillRect(x + 4, y + 40, 9, 8);
  ctx.fillRect(x + 16, y + 40, 9, 8);

  // legs
  const legSwing = onGround ? Math.sin(time * (Math.abs(player.vx) > 20 ? 14 : 0)) * 3 : 0;
  ctx.fillStyle = "#2a4060";
  ctx.fillRect(x + 6, y + 28, 8, 14 + legSwing);
  ctx.fillRect(x + 15, y + 28, 8, 14 - legSwing);

  // body / jacket
  ctx.fillStyle = "#3d5a80";
  ctx.fillRect(x + 5, y + 14, 18, 16);
  ctx.fillStyle = "#c45c26";
  ctx.fillRect(x + 5, y + 20, 18, 4);

  // head
  ctx.fillStyle = "#e8b896";
  ctx.fillRect(x + 7, y + 2, 14, 14);
  // hair
  ctx.fillStyle = "#1a1a22";
  ctx.fillRect(x + 7, y + 1, 14, 5);
  ctx.fillRect(x + 18, y + 5, 4, 6);
  // eyes
  ctx.fillStyle = "#1a1a22";
  ctx.fillRect(x + 10, y + 7, 3, 3);
  ctx.fillRect(x + 16, y + 7, 3, 3);
  ctx.fillStyle = "#fff";
  ctx.fillRect(x + 11, y + 7, 1, 1);

  // arm + fist
  const punch = punchT > 0;
  ctx.fillStyle = "#e8b896";
  if (punch) {
    ctx.fillRect(x + 20, y + 16, 22, 7);
    ctx.fillStyle = "#c45c26";
    ctx.fillRect(x + 38, y + 14, 10, 10);
  } else {
    ctx.fillRect(x + 20, y + 16, 7, 12);
  }

  ctx.restore();
}

function drawEnemy(e: Enemy) {
  if (!e.alive) return;
  const x = e.x - camX;
  const y = e.y;
  if (x + e.w < -40 || x > W + 40) return;

  ctx.save();
  if (e.flash > 0) ctx.globalAlpha = 0.5;

  if (e.kind === "slime") {
    ctx.fillStyle = "#5ecf6a";
    ctx.beginPath();
    ctx.ellipse(x + e.w / 2, y + e.h - 4, e.w / 2, e.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a2a1a";
    ctx.fillRect(x + 8, y + 8, 4, 5);
    ctx.fillRect(x + 18, y + 8, 4, 5);
    ctx.fillStyle = "#3aaa4a";
    ctx.fillRect(x + 6, y + e.h - 6, e.w - 12, 4);
  } else if (e.kind === "bat") {
    const flap = Math.sin(time * 12) * 6;
    ctx.fillStyle = "#6a4a8a";
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 10);
    ctx.lineTo(x - 4, y + 4 + flap);
    ctx.lineTo(x + 8, y + 14);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 10);
    ctx.lineTo(x + 32, y + 4 - flap);
    ctx.lineTo(x + 20, y + 14);
    ctx.fill();
    ctx.fillStyle = "#2a1a3a";
    ctx.fillRect(x + 10, y + 6, 10, 10);
    ctx.fillStyle = "#ff6b6b";
    ctx.fillRect(x + 12, y + 9, 2, 2);
    ctx.fillRect(x + 16, y + 9, 2, 2);
  } else if (e.kind === "soldier") {
    ctx.fillStyle = "#3a2a2a";
    ctx.fillRect(x + 6, y + 38, 8, 8);
    ctx.fillRect(x + 16, y + 38, 8, 8);
    ctx.fillStyle = "#5a3030";
    ctx.fillRect(x + 5, y + 16, 20, 22);
    ctx.fillStyle = "#8a7070";
    ctx.fillRect(x + 8, y + 2, 14, 14);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(x + 8, y + 0, 14, 5);
    ctx.fillStyle = "#ff4444";
    ctx.fillRect(x + 11, y + 7, 3, 3);
    ctx.fillRect(x + 17, y + 7, 3, 3);
    // spear
    ctx.fillStyle = "#c0c0c0";
    const sx = e.facing > 0 ? x + 24 : x - 16;
    ctx.fillRect(sx, y + 18, 20, 3);
    ctx.fillStyle = "#aaa";
    ctx.beginPath();
    if (e.facing > 0) {
      ctx.moveTo(sx + 20, y + 15);
      ctx.lineTo(sx + 28, y + 19);
      ctx.lineTo(sx + 20, y + 23);
    } else {
      ctx.moveTo(sx, y + 15);
      ctx.lineTo(sx - 8, y + 19);
      ctx.lineTo(sx, y + 23);
    }
    ctx.fill();
  } else if (e.kind === "boss") {
    // big armored brute
    ctx.fillStyle = "#2a1818";
    ctx.fillRect(x + 12, y + 68, 18, 12);
    ctx.fillRect(x + 40, y + 68, 18, 12);
    ctx.fillStyle = "#5a2028";
    ctx.fillRect(x + 8, y + 28, 54, 42);
    ctx.fillStyle = "#8a3038";
    ctx.fillRect(x + 8, y + 40, 54, 8);
    // head
    ctx.fillStyle = "#c09070";
    ctx.fillRect(x + 18, y + 4, 34, 28);
    ctx.fillStyle = "#1a1010";
    ctx.fillRect(x + 14, y + 0, 42, 12);
    // horns
    ctx.fillStyle = "#d0d0d0";
    ctx.fillRect(x + 10, y - 8, 8, 16);
    ctx.fillRect(x + 52, y - 8, 8, 16);
    // eyes
    ctx.fillStyle = "#ff3030";
    ctx.fillRect(x + 24, y + 14, 6, 6);
    ctx.fillRect(x + 40, y + 14, 6, 6);
    // hp bar
    const bw = 60;
    ctx.fillStyle = "#1a1010";
    ctx.fillRect(x + 5, y - 16, bw, 6);
    ctx.fillStyle = "#e04040";
    ctx.fillRect(x + 5, y - 16, bw * (e.hp / e.maxHp), 6);
  }

  ctx.restore();
}

function drawItem(it: Item) {
  if (it.taken) return;
  const x = it.x - camX;
  const y = it.y + Math.sin(it.bob) * 4;
  if (x < -30 || x > W + 30) return;

  if (it.kind === "coin") {
    ctx.fillStyle = "#ffd76a";
    ctx.beginPath();
    ctx.ellipse(x + 7, y + 7, 7, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(x + 5, y + 4, 4, 6);
  } else if (it.kind === "key") {
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(x + 2, y + 6, 14, 5);
    ctx.beginPath();
    ctx.arc(x + 4, y + 8, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a1408";
    ctx.beginPath();
    ctx.arc(x + 4, y + 8, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(x + 14, y + 11, 3, 5);
    ctx.fillRect(x + 14, y + 14, 5, 3);
  } else if (it.kind === "potion") {
    ctx.fillStyle = "#7dffb3";
    ctx.fillRect(x + 4, y + 6, 8, 12);
    ctx.fillStyle = "#e8e8e8";
    ctx.fillRect(x + 5, y + 2, 6, 5);
    ctx.fillStyle = "#2a6a4a";
    ctx.fillRect(x + 6, y + 0, 4, 3);
  } else if (it.kind === "medallion") {
    const pulse = 0.7 + Math.sin(time * 5) * 0.3;
    ctx.fillStyle = `rgba(154,208,255,${pulse})`;
    ctx.beginPath();
    ctx.arc(x + 11, y + 11, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffe08a";
    ctx.beginPath();
    ctx.arc(x + 11, y + 11, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c45c26";
    ctx.fillRect(x + 9, y + 7, 4, 8);
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

function drawDecor(zone: Zone) {
  // simple trees / ruins pillars in parallax bands
  if (zone === "forest" || zone === "village") {
    for (let i = 0; i < 12; i++) {
      const wx = i * 220 + 100;
      const x = wx - camX * 0.55;
      if (x < -40 || x > W + 40) continue;
      ctx.fillStyle = "#2a1a10";
      ctx.fillRect(x + 10, 300, 10, 130);
      ctx.fillStyle = zone === "forest" ? "#1a4030" : "#2a5038";
      ctx.beginPath();
      ctx.arc(x + 15, 290, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 0, 310, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 30, 310, 22, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (zone === "ruins" || zone === "boss") {
    for (let i = 0; i < 10; i++) {
      const wx = 3800 + i * 280;
      const x = wx - camX * 0.5;
      if (x < -40 || x > W + 40) continue;
      ctx.fillStyle = "#3a3040";
      ctx.fillRect(x, 250, 22, 180);
      ctx.fillStyle = "#4a4050";
      ctx.fillRect(x - 6, 245, 34, 12);
    }
  }
}

function frame(dt: number) {
  time += dt;
  if (shake > 0) shake = Math.max(0, shake - dt * 30);

  if (state === "playing") {
    handleInput(dt);
    resolvePlayer(dt);
    updateEnemies(dt);
    updateItems(dt);
    updateParticles(dt);
    invuln = Math.max(0, invuln - dt);

    camX = player.x + player.w / 2 - W * 0.35;
    camX = Math.max(0, Math.min(camX, WORLD_W - W));

    if (storyTimer > 0) {
      storyTimer -= dt;
      if (storyTimer <= 0) storyEl.classList.remove("show");
    }

    const z = zoneAt(player.x);
    zoneName.textContent = zoneLabel(z);
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
  drawDecor(z);
  drawPlatforms();
  drawSpikes();
  drawGates();
  for (const it of items) drawItem(it);
  for (const e of enemies) drawEnemy(e);
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
  titleEl.classList.add("hidden");
  wrap.classList.add("playing");
  hideOverlay();
  resetGame();
  state = "playing";
}

function restartFromOverlay() {
  hideOverlay();
  resetGame();
  state = "playing";
}

// Input
window.addEventListener("keydown", (e) => {
  keys.add(e.key);
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
    e.preventDefault();
  }
  if (e.key === "r" || e.key === "R") {
    if (state === "playing" || state === "dead" || state === "win") {
      hideOverlay();
      resetGame();
      state = "playing";
    }
  }
  if (e.key === "c" || e.key === "C") usePotion();
  if (e.key === "Enter" && state === "title") startGame();
});

window.addEventListener("keyup", (e) => keys.delete(e.key));

document.querySelector("#btn-start")!.addEventListener("click", startGame);
document.querySelector("#btn-restart")!.addEventListener("click", restartFromOverlay);

// Mobile controls
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
document.querySelector("#btn-potion")!.addEventListener("click", (e) => {
  e.preventDefault();
  usePotion();
});

// Title idle animation still draws
state = "title";
buildWorld();
player.x = 200;
requestAnimationFrame(loop);
