
import "./style.css";

type Rect = { x: number; y: number; w: number; h: number };
type Scene = "world" | "interior";
type EnemyKind = "goblin" | "archer" | "bat" | "boss";
type BossKind =
  | "ironface"
  | "cloud"
  | "mothman"
  | "anaconda"
  | "kingkong"
  | "firefox"
  | "minotaur"
  | "creeper"
  | "sphinx"
  | "cerberus";
type WeaponId = "fist" | "knife" | "axe" | "rifle" | "sword" | "lava" | "staff";
type PotionId = "heal" | "poison" | "fly" | "purple" | "yellow" | "pink";
type ArmorSlot = "helm" | "chest" | "pants" | "boots";
type ArmorId = ArmorSlot;
type CarryWeapon = Exclude<WeaponId, "fist">;
type InvItem =
  | { kind: "weapon"; id: CarryWeapon; ammo?: number }
  | { kind: "potion"; id: PotionId };
type ChestType =
  | "wood"
  | "thorny"
  | "sticky"
  | "diamond"
  | "obsidian"
  | "none";
type GameState = "title" | "playing" | "dialog" | "win" | "dead";
type ProjKind =
  | "arrow"
  | "spit"
  | "rain"
  | "poison"
  | "bolt"
  | "venom"
  | "cotton"
  | "bullet"
  | "fire"
  | "magic"
  | "blade"
  | "head"
  | "spike"
  | "anvil"
  | "spark"
  | "breath"
  | "horn"
  | "punch";

type Enemy = Rect & {
  kind: EnemyKind;
  bossKind?: BossKind;
  name: string;
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
  phase: number;
  telegraph: number;
  raining: number;
  rainSpawned: number;
  grounded: boolean;
  introDone: boolean;
  headHp?: [number, number, number];
  unhittable?: boolean;
};

type WorldItem = Rect & {
  kind: "coin" | "key" | "medallion";
  taken: boolean;
  bob: number;
};

type Projectile = Rect & {
  kind: ProjKind;
  vx: number;
  vy: number;
  dmg: number;
  life: number;
  hostile: boolean;
  alive: boolean;
};

type Door = Rect & {
  id: string;
  label: string;
  target: "interior";
  interiorId: string;
  needsKey: boolean;
};

type InteriorDef = {
  id: string;
  title: string;
  kind: "house" | "bar";
  exitX: number;
  returnX: number;
  returnY: number;
};

type Chest = Rect & {
  type: ChestType;
  opened: boolean;
  isParchment: boolean;
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

type Hazard = Rect & {
  kind: "lava" | "platform" | "trap";
  dmg: number;
  life: number;
  tick: number;
};

const MAX_LEVEL = 10;

const WEAPON_BASE: Record<WeaponId, number> = {
  fist: 25,
  knife: 80,
  axe: 115,
  rifle: 190,
  sword: 260,
  lava: 295,
  staff: 380,
};

const WEAPONS: Record<
  WeaponId,
  { label: string; cooldown: number; range: number; ammoMax: number }
> = {
  fist: { label: "Yumruk", cooldown: 0.28, range: 34, ammoMax: 0 },
  knife: { label: "Çakı", cooldown: 0.12, range: 36, ammoMax: 0 },
  axe: { label: "Balta", cooldown: 0.45, range: 42, ammoMax: 0 },
  rifle: { label: "Tüfek", cooldown: 0.4, range: 320, ammoMax: 5 },
  sword: { label: "Kılıç", cooldown: 0.28, range: 44, ammoMax: 0 },
  lava: { label: "Lav Silahı", cooldown: 0.35, range: 120, ammoMax: 0 },
  staff: { label: "Büyülü Asa", cooldown: 0.38, range: 280, ammoMax: 0 },
};

const POTIONS: Record<PotionId, { label: string; color: string; hint: string }> =
  {
    heal: {
      label: "Can İksiri",
      color: "#3dff7a",
      hint: "Yeşil · +150–200 can",
    },
    poison: {
      label: "Zehir İksiri",
      color: "#ff3a3a",
      hint: "Kırmızı · düşman zehir mermisi",
    },
    fly: {
      label: "Uçuş İksiri",
      color: "#4aa8ff",
      hint: "Mavi · 5 sn uçuş",
    },
    purple: {
      label: "Mor İksir",
      color: "#b44dff",
      hint: "Mor · mevcut silaha kalıcı +50",
    },
    yellow: {
      label: "Sarı İksir",
      color: "#ffd24a",
      hint: "Sarı · 8 sn hız x1.45 + zıplama artışı",
    },
    pink: {
      label: "Pembe İksir",
      color: "#ff7ad9",
      hint: "Pembe · zehiri temizle + 10 sn 220 hasar kalkanı",
    },
  };

const ARMOR_BLOCK: Record<ArmorSlot, number> = {
  helm: 0.45,
  chest: 0.6,
  pants: 0.35,
  boots: 0.25,
};

const ARMOR_LABEL: Record<ArmorSlot, string> = {
  helm: "Miğfer",
  chest: "Göğüslük",
  pants: "Pantolon",
  boots: "Çizme",
};

const BOSS_ORDER: BossKind[] = [
  "ironface",
  "cloud",
  "mothman",
  "anaconda",
  "kingkong",
  "firefox",
  "minotaur",
  "creeper",
  "sphinx",
  "cerberus",
];

const BOSS_HP: Record<BossKind, number> = {
  ironface: 700,
  cloud: 800,
  mothman: 1000,
  anaconda: 1300,
  kingkong: 1700,
  firefox: 2200,
  minotaur: 2800,
  creeper: 3500,
  sphinx: 4300,
  cerberus: 5400,
};

const BOSS_META: Record<
  BossKind,
  { name: string; w: number; h: number }
> = {
  ironface: { name: "İRONFACE", w: 70, h: 88 },
  cloud: { name: "THE CLOUD", w: 68, h: 80 },
  mothman: { name: "MOTHMAN", w: 72, h: 78 },
  anaconda: { name: "ANACONDA", w: 100, h: 48 },
  kingkong: { name: "KINGKONG", w: 90, h: 110 },
  firefox: { name: "FIREFOX", w: 86, h: 70 },
  minotaur: { name: "MINOTAUR", w: 78, h: 96 },
  creeper: { name: "CREEPER", w: 64, h: 86 },
  sphinx: { name: "SPHINX", w: 110, h: 90 },
  cerberus: { name: "CERBERUS", w: 120, h: 100 },
};

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
const keySlot = document.querySelector<HTMLElement>("#key-slot")!;
const medalSlot = document.querySelector<HTMLElement>("#medal-slot")!;
const weaponNameEl = document.querySelector<HTMLElement>("#weapon-name")!;
const ammoTextEl = document.querySelector<HTMLElement>("#ammo-text")!;
const drinkHandName = document.querySelector<HTMLElement>("#drink-hand-name")!;
const bagEls = [
  document.querySelector<HTMLElement>("#bag-0")!,
  document.querySelector<HTMLElement>("#bag-1")!,
  document.querySelector<HTMLElement>("#bag-2")!,
];
const armorEls: Record<ArmorSlot, HTMLElement> = {
  helm: document.querySelector<HTMLElement>("#armor-helm")!,
  chest: document.querySelector<HTMLElement>("#armor-chest")!,
  pants: document.querySelector<HTMLElement>("#armor-pants")!,
  boots: document.querySelector<HTMLElement>("#armor-boots")!,
};

const W = 960;
const H = 540;
const GRAVITY = 2200;
const MOVE = 290;
const JUMP = 620;
const GROUND_Y = 430;
const INTERIOR_W = 960;

canvas.width = W;
canvas.height = H;

const keys = new Set<string>();
const particles: Particle[] = [];
const platforms: Rect[] = [];
const enemies: Enemy[] = [];
const items: WorldItem[] = [];
const doors: Door[] = [];
const buildings: (Rect & { kind: "house" | "bar"; label: string })[] = [];
const projectiles: Projectile[] = [];
const interiorPlatforms: Rect[] = [];
const interiors: Record<string, InteriorDef> = {};
const hazards: Hazard[] = [];
const weaponBonus: Record<WeaponId, number> = {
  fist: 0,
  knife: 0,
  axe: 0,
  rifle: 0,
  sword: 0,
  lava: 0,
  staff: 0,
};

let WORLD_W = 2480;
let level = 1;
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
let interactLatch = false;
let attackLatch = false;
let bagLatch = false;
let dialogQueue: DialogLine[] = [];
let dialogAdvanceLatch = false;
let flyTimer = 0;
let speedTimer = 0;
let shieldHp = 0;
let shieldTimer = 0;
let currentInterior: InteriorDef | null = null;
let returnPos = { x: 80, y: GROUND_Y - 52 };
let levelClearPending = false;
let venomDot = 0;
let venomAcc = 0;
let chest: Chest | null = null;
let parchmentShown = false;

const leftHand: { item: InvItem | null } = { item: null };
const rightHand: { item: InvItem | null } = { item: null };
const bag: (InvItem | null)[] = [null, null, null];
const armor: Record<ArmorSlot, boolean> = {
  helm: false,
  chest: false,
  pants: false,
  boots: false,
};

const inventory = {
  coins: 0,
  key: false,
  medallion: false,
};

const player: Rect & { vx: number; vy: number; hp: number; maxHp: number } = {
  x: 80,
  y: GROUND_Y - 52,
  w: 30,
  h: 52,
  vx: 0,
  vy: 0,
  hp: 450,
  maxHp: 450,
};

let audioCtx: AudioContext | null = null;

function ensureAudio() {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") void audioCtx.resume();
}

function beep(
  freq: number,
  dur = 0.06,
  type: OscillatorType = "square",
  gain = 0.03,
) {
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
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

function rand(a: number, b: number) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function chance(p: number) {
  return Math.random() < p;
}

function pickOne<T>(arr: T[]): T {
  return arr[rand(0, arr.length - 1)]!;
}

function equippedWeapon(): WeaponId {
  if (leftHand.item?.kind === "weapon") return leftHand.item.id;
  return "fist";
}

function rifleAmmo(): number {
  if (leftHand.item?.kind === "weapon" && leftHand.item.id === "rifle") {
    return leftHand.item.ammo ?? 0;
  }
  return 0;
}

function setRifleAmmo(n: number) {
  if (leftHand.item?.kind === "weapon" && leftHand.item.id === "rifle") {
    leftHand.item.ammo = Math.max(0, n);
  }
}

function weaponDamage(id: WeaponId) {
  return WEAPON_BASE[id] + weaponBonus[id];
}

function itemShortLabel(it: InvItem | null): string {
  if (!it) return "—";
  if (it.kind === "weapon") {
    const base = WEAPONS[it.id].label;
    if (it.id === "rifle") return `${base} ${it.ammo ?? 0}`;
    return base;
  }
  return POTIONS[it.id].label;
}

function normalHp() {
  return 300 + (level - 1) * 50;
}

function bossKindForLevel(lv: number): BossKind {
  const clamped = Math.max(1, Math.min(MAX_LEVEL, lv));
  return BOSS_ORDER[clamped - 1]!;
}

function rollChestType(): ChestType {
  const r = Math.random();
  if (r < 0.42) return "wood";
  if (r < 0.7) return "thorny";
  if (r < 0.89) return "sticky";
  if (r < 0.95) return "diamond";
  if (r < 0.98) return "obsidian";
  return "none";
}

function rollWeighted<T>(tiers: { p: number; items: T[] }[]): T {
  const r = Math.random();
  let acc = 0;
  for (const tier of tiers) {
    acc += tier.p;
    if (r < acc) return pickOne(tier.items);
  }
  return pickOne(tiers[tiers.length - 1]!.items);
}

type LootResult =
  | { kind: "weapon"; id: CarryWeapon }
  | { kind: "potion"; id: PotionId }
  | { kind: "armor"; id: ArmorId };

function rollChestLoot(type: Exclude<ChestType, "none">): LootResult {
  const commonW: CarryWeapon[] = ["knife", "axe"];
  const commonP: PotionId[] = ["fly"];
  const midW: CarryWeapon[] = ["rifle"];
  const midP: PotionId[] = ["yellow", "poison"];
  const rareW: CarryWeapon[] = ["sword", "lava"];
  const rareP: PotionId[] = ["purple"];
  const topW: CarryWeapon[] = ["staff"];
  const topP: PotionId[] = ["heal", "pink"];

  const asLoot = (id: CarryWeapon | PotionId | ArmorId): LootResult => {
    if (id === "helm" || id === "chest" || id === "pants" || id === "boots") {
      return { kind: "armor", id };
    }
    if (
      id === "heal" ||
      id === "poison" ||
      id === "fly" ||
      id === "purple" ||
      id === "yellow" ||
      id === "pink"
    ) {
      return { kind: "potion", id };
    }
    return { kind: "weapon", id };
  };

  if (type === "obsidian") {
    return asLoot(
      rollWeighted([
        { p: 0.4, items: ["boots" as ArmorId] },
        { p: 0.3, items: ["pants" as ArmorId] },
        { p: 0.2, items: ["helm" as ArmorId] },
        { p: 0.1, items: ["chest" as ArmorId] },
      ]),
    );
  }

  const tables: Record<
    Exclude<ChestType, "none" | "obsidian">,
    { p: number; items: Array<CarryWeapon | PotionId | ArmorId> }[]
  > = {
    wood: [
      { p: 0.75, items: [...commonW, ...commonP] },
      { p: 0.2, items: [...midW, ...midP] },
      { p: 0.04, items: [...rareW, ...rareP] },
      { p: 0.01, items: [...topW, ...topP] },
    ],
    thorny: [
      { p: 0.55, items: [...commonW, ...commonP] },
      { p: 0.25, items: [...midW, ...midP] },
      { p: 0.14, items: [...rareW, ...rareP] },
      { p: 0.06, items: [...topW, ...topP] },
    ],
    sticky: [
      { p: 0.25, items: [...commonW, ...commonP] },
      { p: 0.25, items: [...midW, ...midP] },
      { p: 0.32, items: [...rareW, ...rareP] },
      { p: 0.18, items: [...topW, ...topP] },
    ],
    diamond: [
      { p: 0.12, items: [...commonW, ...commonP] },
      { p: 0.05, items: [...midW, ...midP] },
      { p: 0.43, items: [...rareW, ...rareP] },
      { p: 0.3, items: [...topW, ...topP] },
      {
        p: 0.1,
        items: ["helm", "chest", "pants", "boots"] as ArmorId[],
      },
    ],
  };

  return asLoot(rollWeighted(tables[type]));
}

function emptyBagSlot(): number {
  return bag.findIndex((s) => s === null);
}

function grantArmor(slot: ArmorSlot) {
  const had = armor[slot];
  armor[slot] = true;
  sfxPickup();
  showStory(
    had
      ? `${ARMOR_LABEL[slot]} yenilendi (%${Math.round(ARMOR_BLOCK[slot] * 100)} blok).`
      : `${ARMOR_LABEL[slot]} kuşanıldı (%${Math.round(ARMOR_BLOCK[slot] * 100)} blok).`,
  );
  updateHud();
}

function makeWeaponItem(id: CarryWeapon): InvItem {
  if (id === "rifle") return { kind: "weapon", id, ammo: 5 };
  return { kind: "weapon", id };
}

function grantItem(loot: LootResult): boolean {
  if (loot.kind === "armor") {
    grantArmor(loot.id);
    return true;
  }

  const item: InvItem =
    loot.kind === "weapon"
      ? makeWeaponItem(loot.id)
      : { kind: "potion", id: loot.id };

  if (item.kind === "weapon") {
    if (!leftHand.item) {
      leftHand.item = item;
      sfxPickup();
      showStory(`${WEAPONS[item.id].label} sol ele alındı!`);
      updateHud();
      return true;
    }
  } else if (!rightHand.item) {
    rightHand.item = item;
    sfxPickup();
    showStory(`${POTIONS[item.id].label} sağ ele alındı!`);
    updateHud();
    return true;
  }

  const slot = emptyBagSlot();
  if (slot >= 0) {
    bag[slot] = item;
    sfxPickup();
    const label =
      item.kind === "weapon"
        ? WEAPONS[item.id].label
        : POTIONS[item.id].label;
    showStory(`${label} çantaya kondu (yuva ${slot + 1}).`);
    updateHud();
    return true;
  }

  showHint("Envanter dolu");
  return false;
}

function swapBagSlot(index: number) {
  if (index < 0 || index > 2) return;
  const slotItem = bag[index];

  if (slotItem) {
    if (slotItem.kind === "weapon") {
      const hand = leftHand.item;
      leftHand.item = slotItem;
      bag[index] = hand;
      showHint(
        hand
          ? `Sol el ↔ çanta ${index + 1}`
          : `${WEAPONS[slotItem.id].label} sol ele`,
      );
    } else {
      const hand = rightHand.item;
      rightHand.item = slotItem;
      bag[index] = hand;
      showHint(
        hand
          ? `Sağ el ↔ çanta ${index + 1}`
          : `${POTIONS[slotItem.id].label} sağ ele`,
      );
    }
  } else if (leftHand.item) {
    bag[index] = leftHand.item;
    leftHand.item = null;
    showHint(`Sol el → çanta ${index + 1}`);
  } else if (rightHand.item) {
    bag[index] = rightHand.item;
    rightHand.item = null;
    showHint(`Sağ el → çanta ${index + 1}`);
  } else {
    showHint("Boş yuva");
  }
  updateHud();
  beep(400, 0.04, "triangle", 0.02);
}

function addPlat(x: number, y: number, w: number, h = 24) {
  platforms.push({ x, y, w, h });
}

function addEnemy(
  kind: Exclude<EnemyKind, "boss">,
  x: number,
  y: number,
  patrol = 90,
) {
  const sizes: Record<Exclude<EnemyKind, "boss">, { w: number; h: number }> = {
    goblin: { w: 32, h: 44 },
    archer: { w: 30, h: 48 },
    bat: { w: 30, h: 22 },
  };
  const s = sizes[kind];
  const hp = normalHp();
  enemies.push({
    kind,
    name: kind === "goblin" ? "Goblin" : kind === "archer" ? "Okçu" : "Yarasa",
    x,
    y,
    w: s.w,
    h: s.h,
    vx: kind === "bat" ? 90 : 55,
    vy: 0,
    hp,
    maxHp: hp,
    hurt: 0,
    alive: true,
    patrolL: x - patrol,
    patrolR: x + patrol,
    facing: 1,
    flash: 0,
    attackCd: rand(4, 14) / 10,
    phase: 0,
    telegraph: 0,
    raining: 0,
    rainSpawned: 0,
    grounded: true,
    introDone: true,
  });
}

function addBoss(x: number) {
  const kind = bossKindForLevel(level);
  const meta = BOSS_META[kind];
  const hp = BOSS_HP[kind];
  const e: Enemy = {
    kind: "boss",
    bossKind: kind,
    name: meta.name,
    x,
    y: GROUND_Y - meta.h,
    w: meta.w,
    h: meta.h,
    vx: 0,
    vy: 0,
    hp,
    maxHp: hp,
    hurt: 0,
    alive: true,
    patrolL: x - 260,
    patrolR: Math.min(WORLD_W - 40, x + 260),
    facing: -1,
    flash: 0,
    attackCd: 1.2,
    phase: 0,
    telegraph: 0,
    raining: 0,
    rainSpawned: 0,
    grounded: true,
    introDone: false,
  };
  if (kind === "cerberus") {
    e.headHp = [1800, 1800, 1800];
  }
  enemies.push(e);
}

function addItem(kind: WorldItem["kind"], x: number, y: number) {
  const sizes = { coin: 14, key: 18, medallion: 22 };
  const s = sizes[kind];
  items.push({ kind, x, y, w: s, h: s, taken: false, bob: Math.random() * 6 });
}

function spawnProjectile(
  kind: ProjKind,
  x: number,
  y: number,
  vx: number,
  vy: number,
  dmg: number,
  life: number,
  hostile: boolean,
  w = 12,
  h = 10,
) {
  projectiles.push({
    kind,
    x,
    y,
    w,
    h,
    vx,
    vy,
    dmg,
    life,
    hostile,
    alive: true,
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

function buildInteriorsMeta(barX: number, houseX: number | null) {
  for (const k of Object.keys(interiors)) delete interiors[k];
  interiors.bar1 = {
    id: "bar1",
    title: "Kör Fare Bar",
    kind: "bar",
    exitX: 80,
    returnX: barX + 50,
    returnY: GROUND_Y - 52,
  };
  if (houseX !== null) {
    interiors.house1 = {
      id: "house1",
      title: "Eski Ev",
      exitX: 80,
      kind: "house",
      returnX: houseX + 40,
      returnY: GROUND_Y - 52,
    };
  }
}

function buildInteriorRoom(def: InteriorDef) {
  interiorPlatforms.length = 0;
  chest = null;
  parchmentShown = false;
  interiorPlatforms.push({ x: 0, y: GROUND_Y, w: INTERIOR_W, h: 24 });
  interiorPlatforms.push({ x: 180, y: 340, w: 160, h: 18 });
  interiorPlatforms.push({ x: 480, y: 300, w: 180, h: 18 });
  interiorPlatforms.push({ x: 720, y: 240, w: 180, h: 18 });

  if (def.kind === "bar") {
    const ctype = rollChestType();
    chest = {
      x: 780,
      y: 200,
      w: 40,
      h: 32,
      type: ctype,
      opened: false,
      isParchment: ctype === "none",
    };
  }
}

function buildWorld() {
  platforms.length = 0;
  enemies.length = 0;
  items.length = 0;
  doors.length = 0;
  buildings.length = 0;
  projectiles.length = 0;
  particles.length = 0;
  hazards.length = 0;
  chest = null;
  levelClearPending = false;

  WORLD_W = 2400 + level * 80;
  const mid = Math.floor(WORLD_W * 0.42);
  const houseX = level % 2 === 1 ? Math.floor(WORLD_W * 0.18) : null;
  const barX = mid;

  buildInteriorsMeta(barX, houseX);

  addPlat(0, GROUND_Y, WORLD_W);
  addPlat(220, 340, 120);
  addPlat(520, 290, 110);
  addPlat(Math.floor(WORLD_W * 0.28), 310, 130);
  addPlat(Math.floor(WORLD_W * 0.55), 300, 120);
  addPlat(Math.floor(WORLD_W * 0.68), 250, 110);
  addPlat(Math.floor(WORLD_W * 0.78), 320, 130);

  addItem("key", 240, 310);
  if (level >= 4) addItem("key", Math.floor(WORLD_W * 0.68) + 30, 220);

  if (houseX !== null) {
    buildings.push({
      x: houseX,
      y: GROUND_Y - 110,
      w: 120,
      h: 110,
      kind: "house",
      label: "EV",
    });
    doors.push({
      x: houseX + 40,
      y: GROUND_Y - 56,
      w: 36,
      h: 56,
      id: "d-house",
      label: "Ev",
      target: "interior",
      interiorId: "house1",
      needsKey: false,
    });
  }

  buildings.push({
    x: barX,
    y: GROUND_Y - 120,
    w: 140,
    h: 120,
    kind: "bar",
    label: "BAR",
  });
  doors.push({
    x: barX + 50,
    y: GROUND_Y - 56,
    w: 40,
    h: 56,
    id: "d-bar",
    label: "Bar",
    target: "interior",
    interiorId: "bar1",
    needsKey: true,
  });

  const count = Math.min(8, 3 + level);
  const kinds: Array<Exclude<EnemyKind, "boss">> = ["goblin", "archer", "bat"];
  for (let i = 0; i < count; i++) {
    const t = (i + 1) / (count + 1);
    const x = 280 + t * (WORLD_W - 720);
    if (Math.abs(x - (barX + 70)) < 120) continue;
    const kind = kinds[(i + level) % kinds.length]!;
    if (kind === "bat") addEnemy("bat", x, 180 + (i % 3) * 30, 100);
    else if (kind === "archer") addEnemy("archer", x, GROUND_Y - 48, 90);
    else addEnemy("goblin", x, GROUND_Y - 44, 80);
  }

  addBoss(WORLD_W - 400);
  addItem("coin", 260, 310);
  addItem("coin", Math.floor(WORLD_W * 0.55) + 20, 270);
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

function nearBoss(): Enemy | null {
  for (const e of enemies) {
    if (!e.alive || e.kind !== "boss") continue;
    if (Math.abs(player.x - e.x) < 420) return e;
  }
  return null;
}

function updateHud() {
  const pct = Math.max(0, (player.hp / player.maxHp) * 100);
  hpFill.style.width = `${pct}%`;
  hpText.textContent = String(Math.max(0, Math.ceil(player.hp)));

  if (scene === "interior" && currentInterior) {
    zoneName.textContent = currentInterior.title;
  } else {
    const boss = nearBoss();
    if (boss) zoneName.textContent = `Seviye ${level} · ${boss.name}`;
    else zoneName.textContent = `Seviye ${level}`;
  }

  coinCount.textContent = String(inventory.coins);
  keySlot.classList.toggle("owned", inventory.key);
  medalSlot.classList.toggle("owned", inventory.medallion);

  for (const slot of Object.keys(armor) as ArmorSlot[]) {
    armorEls[slot].classList.toggle("owned", armor[slot]);
  }

  const wpn = equippedWeapon();
  const w = WEAPONS[wpn];
  const bonus = weaponBonus[wpn];
  weaponNameEl.textContent =
    bonus > 0 ? `${w.label} (+${bonus})` : w.label;
  if (wpn === "rifle") {
    ammoTextEl.textContent = ` · ${rifleAmmo()}/5`;
  } else {
    ammoTextEl.textContent = "";
  }

  if (rightHand.item?.kind === "potion") {
    drinkHandName.textContent = POTIONS[rightHand.item.id].label;
  } else {
    drinkHandName.textContent = "İksir yok";
  }

  for (let i = 0; i < 3; i++) {
    bagEls[i]!.textContent = itemShortLabel(bag[i]!);
  }
}

function mitigatedDamage(raw: number): number {
  let dmg = raw;
  dmg *= 1 - (armor.helm ? ARMOR_BLOCK.helm : 0);
  dmg *= 1 - (armor.chest ? ARMOR_BLOCK.chest : 0);
  dmg *= 1 - (armor.pants ? ARMOR_BLOCK.pants : 0);
  dmg *= 1 - (armor.boots ? ARMOR_BLOCK.boots : 0);
  return Math.max(1, Math.round(dmg));
}

function hurtPlayer(rawDmg: number, knock: number) {
  if (invuln > 0 || state !== "playing") return;
  let dmg = mitigatedDamage(rawDmg);
  if (shieldHp > 0 && shieldTimer > 0) {
    const absorb = Math.min(shieldHp, dmg);
    shieldHp -= absorb;
    dmg -= absorb;
    burst(player.x + player.w / 2, player.y + 10, "#ff7ad9", 8);
    if (shieldHp <= 0) {
      shieldTimer = 0;
      showHint("Kalkan kırıldı");
    }
  }
  if (dmg <= 0) {
    invuln = 0.35;
    return;
  }
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
  const wpn = equippedWeapon();
  if (wpn === "rifle" || wpn === "lava" || wpn === "staff") return null;
  const w = WEAPONS[wpn];
  return {
    x: facing === 1 ? player.x + player.w - 6 : player.x - w.range + 6,
    y: player.y + 10,
    w: w.range,
    h: 26,
  };
}

function usePotion() {
  if (state !== "playing") return;
  const held = rightHand.item;
  if (!held || held.kind !== "potion") {
    showHint("Sağ elde iksir yok");
    return;
  }

  const id = held.id;
  rightHand.item = null;

  if (id === "heal") {
    const heal = rand(150, 200);
    player.hp = Math.min(player.maxHp, player.hp + heal);
    burst(player.x + player.w / 2, player.y + 10, "#7dffb3", 14);
    sfxPickup();
    showStory(`Yeşil can iksiri. (+${heal})`);
  } else if (id === "poison") {
    spawnProjectile(
      "poison",
      facing === 1 ? player.x + player.w : player.x - 14,
      player.y + 18,
      facing * 420,
      -40,
      rand(90, 140),
      1.4,
      false,
      14,
      10,
    );
    burst(player.x + player.w / 2, player.y + 20, "#ff3a3a", 8);
    beep(140, 0.08, "sawtooth", 0.03);
    showStory("Zehir fırlatıldı!");
  } else if (id === "fly") {
    flyTimer = 5;
    burst(player.x + player.w / 2, player.y + 10, "#4aa8ff", 16);
    beep(520, 0.12, "sine", 0.04);
    showStory("Mavi uçuş! 5 saniye.");
  } else if (id === "purple") {
    const wpn = equippedWeapon();
    weaponBonus[wpn] += 50;
    burst(player.x + player.w / 2, player.y + 10, "#b44dff", 18);
    beep(700, 0.1, "sine", 0.04);
    showStory(
      `Mor iksir! ${WEAPONS[wpn].label} +50 → ${weaponDamage(wpn)}`,
    );
  } else if (id === "yellow") {
    speedTimer = 8;
    burst(player.x + player.w / 2, player.y + 10, "#ffd24a", 16);
    beep(640, 0.1, "triangle", 0.035);
    showStory("Sarı iksir! 8 sn hız x1.45 + zıplama artışı.");
  } else if (id === "pink") {
    venomDot = 0;
    venomAcc = 0;
    shieldHp = 220;
    shieldTimer = 10;
    burst(player.x + player.w / 2, player.y + 10, "#ff7ad9", 18);
    beep(760, 0.1, "sine", 0.04);
    showStory("Pembe iksir! Zehir temiz + 10 sn 220 kalkan.");
  }

  updateHud();
}

function solidList(): Rect[] {
  const base = scene === "interior" ? interiorPlatforms : platforms;
  const extras: Rect[] = [];
  for (const h of hazards) {
    if (h.kind === "platform" && h.life > 0) extras.push(h);
  }
  return extras.length ? [...base, ...extras] : base;
}

function solidAt(r: Rect): Rect | null {
  for (const p of solidList()) if (aabb(r, p)) return p;
  return null;
}

function resolvePlayer(dt: number) {
  const flying = flyTimer > 0;
  const moveMul = speedTimer > 0 ? 1.45 : 1;
  const jumpMul = speedTimer > 0 ? 1.2 : 1;
  if (flyTimer > 0) flyTimer = Math.max(0, flyTimer - dt);
  if (speedTimer > 0) speedTimer = Math.max(0, speedTimer - dt);
  if (shieldTimer > 0) {
    shieldTimer = Math.max(0, shieldTimer - dt);
    if (shieldTimer <= 0) shieldHp = 0;
  }

  if (flying) {
    player.vy += GRAVITY * 0.18 * dt;
    if (jumpBuffered > 0) {
      player.vy = -340;
      jumpBuffered = 0;
    }
    player.vy = Math.max(-420, Math.min(360, player.vy));
  } else {
    player.vy += GRAVITY * dt;
  }

  // apply horizontal already set in handleInput with moveMul baked in via player.vx
  void moveMul;
  void jumpMul;

  player.x += player.vx * dt;
  let hit = solidAt(player);
  if (hit) {
    if (player.vx > 0) player.x = hit.x - player.w;
    else if (player.vx < 0) player.x = hit.x + hit.w;
    player.vx = 0;
  }
  if (scene === "interior") {
    player.x = Math.max(20, Math.min(player.x, INTERIOR_W - player.w - 20));
  } else {
    player.x = Math.max(10, Math.min(player.x, WORLD_W - player.w - 10));
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

  if (player.y < 24) {
    player.y = 24;
    if (player.vy < 0) player.vy = 0;
  }

  if (player.y > H + 80) hurtPlayer(9999, 0);
}

function contactDamage(e: Enemy) {
  if (e.kind === "goblin") return 80;
  if (e.kind === "archer" || e.kind === "bat") return 15;
  if (e.bossKind === "ironface") return 25;
  if (e.bossKind === "cloud") return 35;
  if (e.bossKind === "mothman") return 40;
  if (e.bossKind === "anaconda") return 45;
  if (e.bossKind === "kingkong") return 80;
  if (e.bossKind === "firefox") return 170;
  if (e.bossKind === "minotaur") return 60;
  if (e.bossKind === "creeper") return 90;
  if (e.bossKind === "sphinx") return 100;
  if (e.bossKind === "cerberus") return 450;
  return 50;
}

function applyVenomDot() {
  venomDot = 5;
  venomAcc = 0;
  showHint("Zehirlendin!");
  burst(player.x + player.w / 2, player.y + 20, "#5dff7a", 10);
  beep(140, 0.1, "sawtooth", 0.03);
}

function tickVenomDot(dt: number) {
  if (venomDot <= 0 || state !== "playing") return;
  venomDot = Math.max(0, venomDot - dt);
  venomAcc += dt;
  while (venomAcc >= 1) {
    venomAcc -= 1;
    player.hp -= 20;
    burst(player.x + player.w / 2, player.y + player.h / 2, "#5dff7a", 6);
    updateHud();
    if (player.hp <= 0) {
      state = "dead";
      showOverlay("DÜŞTÜN", "R veya Yeniden ile tekrar dene.");
      venomDot = 0;
      venomAcc = 0;
      return;
    }
  }
  if (venomDot <= 0) venomAcc = 0;
}

function damageEnemy(e: Enemy, dmg: number, fromX: number) {
  if (!e.alive || e.hurt > 0) return;
  if (e.unhittable) return;
  if (e.bossKind === "cloud" && e.raining > 0) return;

  if (e.bossKind === "cerberus" && e.headHp) {
    const centers = [0.2, 0.5, 0.8].map((t) => e.x + e.w * t);
    let best = -1;
    let bestDist = Infinity;
    for (let i = 0; i < 3; i++) {
      if (e.headHp[i]! <= 0) continue;
      const d = Math.abs(fromX - centers[i]!);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    if (best < 0) return;
    e.headHp[best]! -= dmg;
    e.hurt = 0.2;
    e.flash = 0.15;
    e.hp = e.headHp[0]! + e.headHp[1]! + e.headHp[2]!;
    sfxHit();
    burst(centers[best]!, e.y + 20, "#ffe08a", 8);
    shake = 5;
    if (e.headHp.every((h) => h <= 0)) {
      e.alive = false;
      e.hp = 0;
      burst(e.x + e.w / 2, e.y + e.h / 2, "#ff8a8a", 28);
      onBossDefeated(e);
    }
    return;
  }

  e.hp -= dmg;
  e.hurt = 0.2;
  e.flash = 0.15;
  e.vx = facing * (e.kind === "boss" ? 40 : 130);
  sfxHit();
  burst(e.x + e.w / 2, e.y + e.h / 2, "#ffe08a", 8);
  shake = 5;
  if (e.hp <= 0) {
    e.alive = false;
    burst(e.x + e.w / 2, e.y + e.h / 2, "#ff8a8a", 18);
    if (e.kind === "boss") onBossDefeated(e);
    else if (chance(0.35)) addItem("coin", e.x + 6, e.y);
  }
}

function onBossDefeated(e: Enemy) {
  if (levelClearPending) return;
  levelClearPending = true;
  burst(e.x + e.w / 2, e.y + e.h / 2, "#ffe08a", 28);
  shake = 16;
  hazards.length = 0;

  if (level >= MAX_LEVEL) {
    inventory.medallion = true;
    state = "win";
    queueDialog([
      {
        name: "CERBERUS",
        text: "Üç baş… bir son. Kardeşin… özgür.",
      },
      { name: "KARDEŞ", text: "Wack… beni buldun. Birlikteyiz." },
    ]);
    showOverlay(
      "KARDEŞİNİ KURTARDIN",
      "Cerberus yenildi. Medalyon senin. Wack The Man.",
    );
    updateHud();
    return;
  }

  grantItem({ kind: "potion", id: "purple" });
  player.hp = Math.min(player.maxHp, player.hp + 80);
  const cleared = level;
  const bossName = e.name;
  level += 1;

  queueDialog([
    { name: bossName, text: "…Yeter… git…" },
    {
      name: "???",
      text: `Seviye ${cleared} temiz. Mor iksir kazandın.`,
    },
  ]);
  showStory(`Mor iksir! Seviye ${level}.`);

  scene = "world";
  currentInterior = null;
  player.x = 80;
  player.y = GROUND_Y - player.h;
  player.vx = 0;
  player.vy = 0;
  camX = 0;
  buildWorld();
  updateHud();
}

function triggerBossIntro(e: Enemy) {
  if (e.introDone || !e.bossKind) return;
  e.introDone = true;
  const lines: Record<BossKind, DialogLine[]> = {
    ironface: [
      { name: "IRONFACE", text: "Yavaş adımlarım… ama ezilişin hızlı." },
    ],
    cloud: [
      { name: "THE CLOUD", text: "Yağmur geliyor. Her damla… bir iğne." },
    ],
    mothman: [{ name: "MOTHMAN", text: "Kanatlarım gölge. Pamuk… boğar." }],
    anaconda: [
      { name: "ANACONDA", text: "Zehirim damarlarındadır. Kaçamazsın." },
    ],
    kingkong: [
      { name: "KINGKONG", text: "Yumruğum dağları ezer. Sen kimsin?" },
    ],
    firefox: [
      { name: "FIREFOX", text: "Üç kuyruk. Bir nefes. Kül olursun." },
    ],
    minotaur: [
      { name: "MINOTAUR", text: "Boynuz hücumu. Zıpla… ya da kırıl." },
    ],
    creeper: [
      { name: "CREEPER", text: "Bıçak döner. Kafa uçar. Tuzak bekler." },
    ],
    sphinx: [
      { name: "SPHINX", text: "Çöl dikeni. Örs. Kol. Bilmece yok — ölüm var." },
    ],
    cerberus: [
      {
        name: "CERBERUS",
        text: "Üç baş. Üç ölüm. Kardeşin… benim gölgemde.",
      },
      { name: "SEN", text: "Kardeşimi ver." },
      { name: "CERBERUS", text: "Lav yükselir. Platform… ya da yan." },
    ],
  };
  queueDialog(lines[e.bossKind]);
}

function updateBoss(e: Enemy, dt: number) {
  const dx = player.x - e.x;
  const dist = Math.abs(dx);
  e.facing = dx >= 0 ? 1 : -1;
  e.unhittable = false;

  if (dist < 480) triggerBossIntro(e);

  const kind = e.bossKind ?? "ironface";
  let skipGravity = false;

  if (kind === "ironface") {
    e.vx = e.facing * 40;
    e.x += e.vx * dt;
    if (e.attackCd <= 0 && dist < 260) {
      e.vy = -620;
      e.grounded = false;
      e.attackCd = 2.4;
      e.phase = 1;
    }
  } else if (kind === "cloud") {
    e.vx = e.facing * 70;
    e.x += e.vx * dt;
    if (e.raining > 0) {
      skipGravity = true;
      e.unhittable = true;
      e.vy = 0;
      const hoverY = 90 + Math.sin(time * 1.4) * 12;
      e.y += (hoverY - e.y) * Math.min(1, 4 * dt);
      e.grounded = false;
      e.raining -= dt;
      const need = Math.min(10, Math.floor(10 - e.raining) + 1);
      while (e.rainSpawned < need && e.rainSpawned < 10) {
        const rx = player.x + rand(-40, 80);
        spawnProjectile("rain", rx, 40, 0, 220, 15, 3.5, true, 8, 14);
        e.rainSpawned += 1;
      }
      if (e.raining <= 0) {
        e.attackCd = 5;
        e.rainSpawned = 0;
        e.vy = 80;
        e.unhittable = false;
      }
    } else if (e.attackCd <= 0 && dist < 520) {
      e.raining = 10;
      e.rainSpawned = 0;
      e.grounded = false;
      e.vy = -280;
      showHint("Yağmur başlıyor!");
      beep(200, 0.15, "sine", 0.03);
    }
  } else if (kind === "mothman") {
    skipGravity = true;
    e.grounded = false;
    const hoverY = GROUND_Y - e.h - 70 + Math.sin(time * 2.2) * 18;
    e.vx = e.facing * 90;
    e.x += e.vx * dt;
    e.y += (hoverY - e.y) * Math.min(1, 3 * dt);
    if (e.attackCd <= 0 && dist < 500) {
      spawnProjectile(
        "cotton",
        e.x + e.w / 2,
        e.y + e.h / 2,
        e.facing * 240,
        30 + rand(-20, 40),
        45,
        2.2,
        true,
        16,
        14,
      );
      e.attackCd = 1.4;
      beep(300, 0.06, "triangle", 0.025);
    }
  } else if (kind === "anaconda") {
    e.vx = e.facing * 75;
    e.x += e.vx * dt;
    if (e.attackCd <= 0 && dist < 500) {
      spawnProjectile(
        "venom",
        e.x + (e.facing > 0 ? e.w : 0),
        e.y + 16,
        e.facing * 280,
        -80,
        10,
        2.2,
        true,
        14,
        12,
      );
      e.attackCd = 1.7;
      beep(160, 0.08, "sawtooth", 0.03);
    }
  } else if (kind === "kingkong") {
    e.vx = e.facing * 55;
    e.x += e.vx * dt;
    if (e.telegraph > 0) {
      e.telegraph -= dt;
      e.vx = 0;
      if (e.telegraph <= 0) {
        e.phase = 2;
        e.attackCd = 0.4;
        e.vx = e.facing * 380;
      }
    } else if (e.phase === 2) {
      e.x += e.vx * dt;
      e.attackCd -= dt;
      if (e.attackCd <= 0) {
        e.phase = 0;
        e.vx = 0;
        e.attackCd = 1.6;
        if (aabb(player, { x: e.x - 10, y: e.y, w: e.w + 20, h: e.h })) {
          hurtPlayer(80, e.facing * 320);
        }
      }
    } else if (e.attackCd <= 0 && dist < 360) {
      e.telegraph = 0.45;
      e.attackCd = 99;
      burst(e.x + e.w / 2, e.y + e.h - 4, "#ffaa66", 8);
      showHint("Kingkong yumruğu!");
    }
  } else if (kind === "firefox") {
    e.vx = e.facing * 95;
    e.x += e.vx * dt;
    if (e.attackCd <= 0 && dist < 520) {
      if (e.phase % 2 === 0) {
        spawnProjectile(
          "breath",
          e.x + (e.facing > 0 ? e.w : -16),
          e.y + 24,
          e.facing * 300,
          -10,
          200,
          1.6,
          true,
          22,
          14,
        );
      } else {
        e.phase = 10;
        e.attackCd = 0.35;
        burst(e.x + e.w / 2, e.y + e.h / 2, "#ff6020", 10);
      }
      e.phase += 1;
      if (e.phase !== 11) e.attackCd = 1.5;
      beep(220, 0.07, "sawtooth", 0.03);
    }
    if (e.phase === 10) {
      if (aabb(player, { x: e.x - 20, y: e.y + 10, w: e.w + 40, h: e.h })) {
        hurtPlayer(170, e.facing * 280);
      }
      if (e.attackCd <= 0) {
        e.phase = 1;
        e.attackCd = 1.4;
      }
    }
  } else if (kind === "minotaur") {
    if (e.telegraph > 0) {
      e.telegraph -= dt;
      e.vx = 0;
      if (e.telegraph <= 0) {
        e.phase = 2;
        e.attackCd = 0.5;
        e.vx = e.facing * 560;
      }
    } else if (e.phase === 2) {
      e.x += e.vx * dt;
      e.attackCd -= dt;
      if (
        aabb(player, { x: e.x, y: e.y + 20, w: e.w, h: e.h - 20 }) &&
        player.y + player.h > e.y + 30
      ) {
        hurtPlayer(235, e.facing * 340);
      }
      if (e.attackCd <= 0) {
        e.phase = 0;
        e.vx = 0;
        e.attackCd = 1.2;
      }
    } else {
      e.vx = e.facing * 60;
      e.x += e.vx * dt;
      if (e.attackCd <= 0 && dist < 480) {
        if (e.phase % 2 === 0) {
          e.telegraph = 0.55;
          e.attackCd = 99;
          showHint("Boynuz hücumu — zıpla!");
        } else {
          spawnProjectile(
            "arrow",
            e.x + (e.facing > 0 ? e.w : -16),
            e.y + 28,
            e.facing * 360,
            -20,
            180,
            2.2,
            true,
            18,
            8,
          );
          e.attackCd = 1.5;
        }
        e.phase += 1;
      }
    }
  } else if (kind === "creeper") {
    skipGravity = true;
    e.grounded = false;
    const hoverY = GROUND_Y - e.h - 40 + Math.sin(time * 3.5) * 30;
    e.vx = e.facing * (140 + (e.hp < e.maxHp * 0.5 ? 40 : 0));
    e.x += e.vx * dt;
    e.y += (hoverY - e.y) * Math.min(1, 4 * dt);
    if (e.attackCd <= 0 && dist < 560) {
      const mode = e.phase % 3;
      if (mode === 0) {
        spawnProjectile(
          "blade",
          e.x + e.w / 2,
          e.y + 20,
          e.facing * 280,
          40,
          200,
          2.0,
          true,
          18,
          18,
        );
      } else if (mode === 1) {
        spawnProjectile(
          "head",
          e.x + e.w / 2,
          e.y + 10,
          e.facing * 220,
          -120,
          280,
          2.4,
          true,
          20,
          20,
        );
      } else {
        hazards.push({
          x: player.x + rand(-30, 30),
          y: GROUND_Y - 8,
          w: 40,
          h: 8,
          kind: "trap",
          dmg: 250,
          life: 3.5,
          tick: 0,
        });
        showHint("Yer tuzağı!");
      }
      e.phase += 1;
      e.attackCd = 0.9;
      beep(100, 0.06, "sawtooth", 0.03);
    }
  } else if (kind === "sphinx") {
    e.vx = e.facing * 15;
    e.x += e.vx * dt;
    if (e.attackCd <= 0 && dist < 600) {
      const mode = e.phase % 3;
      if (mode === 0) {
        for (let i = 0; i < 3; i++) {
          spawnProjectile(
            "spike",
            player.x + rand(-60, 60),
            GROUND_Y - 40,
            0,
            -20,
            280,
            1.8,
            true,
            10,
            28,
          );
        }
      } else if (mode === 1) {
        spawnProjectile(
          "anvil",
          player.x + rand(-20, 20),
          40,
          0,
          280,
          300,
          3.0,
          true,
          28,
          24,
        );
      } else {
        e.telegraph = 0.5;
        e.phase = 20;
        e.attackCd = 99;
        showHint("Kol ezmesi!");
      }
      if (e.phase !== 20) {
        e.phase += 1;
        e.attackCd = 1.7;
      }
      beep(160, 0.08, "triangle", 0.03);
    }
    if (e.phase === 20) {
      e.telegraph -= dt;
      if (e.telegraph <= 0) {
        if (Math.abs(player.x - e.x) < 140 && player.y + player.h > e.y + 20) {
          hurtPlayer(350, player.x < e.x ? -300 : 300);
        }
        burst(e.x + e.w / 2, e.y + e.h, "#c9a227", 16);
        shake = 14;
        e.phase = 0;
        e.attackCd = 2.0;
      }
    }
  } else {
    e.vx = e.facing * 70;
    e.x += e.vx * dt;
    if (e.attackCd <= 0 && dist < 500) {
      if (e.phase % 3 === 0) {
        e.phase = 30;
        e.attackCd = 0.4;
        e.vx = e.facing * 300;
      } else if (e.phase % 3 === 1) {
        e.vy = -700;
        e.grounded = false;
        e.phase = 40;
        e.attackCd = 3.5;
        hazards.length = 0;
        hazards.push({
          x: e.patrolL - 40,
          y: GROUND_Y + 8,
          w: e.patrolR - e.patrolL + 120,
          h: 80,
          kind: "lava",
          dmg: 500,
          life: 8,
          tick: 0,
        });
        hazards.push({
          x: e.x + e.w / 2 - 50,
          y: GROUND_Y - 90,
          w: 100,
          h: 18,
          kind: "platform",
          dmg: 0,
          life: 8,
          tick: 0,
        });
        showHint("Lav yükseliyor! Platforma çık!");
      } else {
        spawnProjectile(
          "breath",
          e.x + e.w / 2,
          e.y + 30,
          e.facing * 260,
          0,
          200,
          1.5,
          true,
          18,
          12,
        );
        e.attackCd = 1.4;
      }
      e.phase += 1;
    }
    if (e.phase === 30) {
      e.x += e.vx * dt;
      e.attackCd -= dt;
      if (aabb(player, e)) hurtPlayer(450, e.facing * 360);
      if (e.attackCd <= 0) {
        e.phase = 1;
        e.attackCd = 1.5;
      }
    }
  }

  if (e.x < e.patrolL) e.x = e.patrolL;
  if (e.x > e.patrolR) e.x = e.patrolR;

  if (!skipGravity) {
    e.vy += GRAVITY * dt;
    e.y += e.vy * dt;
    const hit = solidAt(e);
    if (hit && e.vy >= 0) {
      const wasAir = !e.grounded;
      e.y = hit.y - e.h;
      e.vy = 0;
      e.grounded = true;
      if (wasAir && (kind === "ironface" || kind === "cerberus")) {
        shake = 12;
        burst(e.x + e.w / 2, e.y + e.h, "#c9a227", 14);
        if (Math.abs(player.x + player.w / 2 - (e.x + e.w / 2)) < 110) {
          hurtPlayer(kind === "ironface" ? 40 : 80, player.x < e.x ? -280 : 280);
        }
      }
    }
  }
}

function updateHazards(dt: number) {
  for (let i = hazards.length - 1; i >= 0; i--) {
    const h = hazards[i]!;
    h.life -= dt;
    if (h.life <= 0) {
      hazards.splice(i, 1);
      continue;
    }
    if (h.kind === "lava") {
      const targetY = GROUND_Y - 20;
      if (h.y > targetY) h.y = Math.max(targetY, h.y - 40 * dt);
      h.tick -= dt;
      if (aabb(player, h) && h.tick <= 0) {
        let onSafe = false;
        for (const p of hazards) {
          if (p.kind !== "platform") continue;
          if (
            player.y + player.h <= p.y + 6 &&
            player.y + player.h >= p.y - 8 &&
            player.x + player.w > p.x &&
            player.x < p.x + p.w
          ) {
            onSafe = true;
            break;
          }
        }
        if (!onSafe) {
          hurtPlayer(500, 0);
          h.tick = 3;
        }
      }
    } else if (h.kind === "platform") {
      if (
        player.y + player.h <= h.y + 6 &&
        player.y + player.h >= h.y - 8 &&
        player.x + player.w > h.x &&
        player.x < h.x + h.w &&
        onGround
      ) {
        h.tick -= dt;
        if (h.tick <= 0) {
          hurtPlayer(380, rand(-1, 1) * 120);
          h.tick = 1.2;
          spawnProjectile(
            "spark",
            player.x + 10,
            h.y - 8,
            rand(-40, 40),
            -80,
            0,
            0.4,
            true,
            6,
            6,
          );
        }
      }
    } else if (h.kind === "trap") {
      if (aabb(player, h) && invuln <= 0) {
        hurtPlayer(h.dmg, 0);
        h.life = 0;
      }
    }
  }
}

function updateEnemies(dt: number) {
  if (scene !== "world") return;
  for (const e of enemies) {
    if (!e.alive) continue;
    e.hurt = Math.max(0, e.hurt - dt);
    e.flash = Math.max(0, e.flash - dt);
    e.attackCd = Math.max(0, e.attackCd - dt);

    if (e.kind === "boss") {
      updateBoss(e, dt);
    } else if (e.kind === "bat") {
      e.x += e.vx * dt;
      e.y += Math.sin(time * 4 + e.x * 0.01) * 40 * dt;
      if (e.x < e.patrolL || e.x > e.patrolR) e.vx *= -1;
      e.facing = e.vx >= 0 ? 1 : -1;
      if (e.attackCd <= 0 && Math.abs(player.x - e.x) < 360) {
        const dir = player.x >= e.x ? 1 : -1;
        spawnProjectile(
          "spit",
          e.x + e.w / 2,
          e.y + e.h / 2,
          dir * 260,
          40,
          55,
          2.0,
          true,
          10,
          10,
        );
        e.attackCd = 1.8;
      }
    } else if (e.kind === "archer") {
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
      if (e.attackCd <= 0 && Math.abs(player.x - e.x) < 420) {
        const dir = player.x >= e.x ? 1 : -1;
        e.facing = dir;
        spawnProjectile(
          "arrow",
          e.x + (dir > 0 ? e.w : -12),
          e.y + 18,
          dir * 340,
          -20,
          35,
          2.4,
          true,
          16,
          6,
        );
        e.attackCd = 1.6;
        beep(500, 0.03, "triangle", 0.015);
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

    if (e.hurt <= 0 && !e.unhittable && aabb(player, e) && invuln <= 0) {
      const knock = player.x < e.x ? -260 : 260;
      hurtPlayer(contactDamage(e), knock);
    }
  }

  const box = attackBox();
  if (box) {
    for (const e of enemies) {
      if (!e.alive) continue;
      if (!aabb(box, e)) continue;
      damageEnemy(e, weaponDamage(equippedWeapon()), player.x + player.w / 2);
    }
  }
}

function updateItems(_dt: number) {
  if (scene !== "world") return;
  for (const it of items) {
    if (it.taken) continue;
    it.bob += _dt * 3;
    const body = {
      x: it.x,
      y: it.y + Math.sin(it.bob) * 4,
      w: it.w,
      h: it.h,
    };
    if (!aabb(player, body)) continue;
    it.taken = true;
    sfxPickup();
    if (it.kind === "coin") inventory.coins += 1;
    else if (it.kind === "key") {
      inventory.key = true;
      showStory("Anahtar bulundu. Bar kapısı açılır.");
    } else if (it.kind === "medallion") {
      inventory.medallion = true;
    }
    updateHud();
  }
}

function updateProjectiles(dt: number) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i]!;
    if (!p.alive) {
      projectiles.splice(i, 1);
      continue;
    }
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (
      p.kind === "venom" ||
      p.kind === "poison" ||
      p.kind === "bolt" ||
      p.kind === "head" ||
      p.kind === "anvil"
    ) {
      p.vy += 420 * dt;
    } else if (p.kind === "cotton" || p.kind === "blade") {
      p.vy += 120 * dt;
    } else if (p.kind === "fire" || p.kind === "breath") {
      p.vy += 80 * dt;
    }
    if (p.life <= 0 || p.y > H + 40) {
      projectiles.splice(i, 1);
      continue;
    }

    if (p.hostile) {
      if (aabb(player, p) && invuln <= 0) {
        if (p.kind === "venom") {
          applyVenomDot();
          if (p.dmg > 0) hurtPlayer(p.dmg, p.vx > 0 ? 160 : -160);
        } else if (p.kind === "spark") {
          if (p.dmg > 0) hurtPlayer(p.dmg, 0);
        } else {
          hurtPlayer(p.dmg, p.vx > 0 ? 200 : -200);
        }
        p.alive = false;
      }
    } else if (scene === "world") {
      for (const e of enemies) {
        if (!e.alive) continue;
        if (!aabb(p, e)) continue;
        damageEnemy(e, p.dmg, p.x);
        p.alive = false;
        break;
      }
    }

    if (!p.alive) projectiles.splice(i, 1);
  }
}

function tryOpenChest() {
  if (!chest || chest.opened || scene !== "interior") return false;
  if (!aabb(player, { x: chest.x - 24, y: chest.y - 16, w: chest.w + 48, h: chest.h + 32 }))
    return false;

  chest.opened = true;
  if (chest.isParchment || chest.type === "none") {
    parchmentShown = true;
    queueDialog([
      {
        name: "PARŞÖMEN",
        text: "Üzerinde pikselli bir rakun… orta parmak çekiyor. Rocket?",
      },
    ]);
    showStory("Sandık yok — sadece alaycı bir parşömen.");
    beep(180, 0.2, "sawtooth", 0.03);
    return true;
  }

  const loot = rollChestLoot(chest.type);
  const labels: Record<ChestType, string> = {
    wood: "Ahşap",
    thorny: "Dikenli",
    sticky: "Yapışkan",
    diamond: "Elmas",
    obsidian: "Obsidyen",
    none: "Boş",
  };
  showHint(`${labels[chest.type]} sandık açıldı`);
  grantItem(loot);
  burst(chest.x + 20, chest.y, "#f5c518", 16);
  return true;
}

function tryEnterDoor() {
  if (scene === "interior") {
    if (tryOpenChest()) return;
    if (currentInterior && player.x < 140) {
      sfxDoor();
      scene = "world";
      player.x = returnPos.x;
      player.y = returnPos.y;
      player.vx = 0;
      player.vy = 0;
      currentInterior = null;
      chest = null;
      updateHud();
      showHint("Dışarı çıktın.");
    }
    return;
  }
  for (const d of doors) {
    if (
      !aabb(player, {
        x: d.x - 36,
        y: d.y - 8,
        w: d.w + 72,
        h: d.h + 16,
      })
    )
      continue;
    if (d.needsKey && !inventory.key) {
      showHint("Bar kapısı kilitli — anahtar gerekli");
      beep(90, 0.08, "square", 0.025);
      return;
    }
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
        {
          name: "BARMEN",
          text: "Silah ve iksir yalnız üst kattaki sandıktan. Masada bedava yok.",
        },
        {
          name: "BARBAR",
          text: "Bir bira daha… ve sen o sandığa tırman.",
        },
      ]);
    } else {
      showHint("Eski ev. Dinlen, sonra dışarı.");
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
  const wpn = equippedWeapon();
  const w = WEAPONS[wpn];

  if (wpn === "rifle") {
    if (rifleAmmo() <= 0) {
      showHint("Mermi yok! (0/5)");
      beep(90, 0.05, "square", 0.02);
      return;
    }
    setRifleAmmo(rifleAmmo() - 1);
    spawnProjectile(
      "bullet",
      facing === 1 ? player.x + player.w : player.x - 14,
      player.y + 18,
      facing * 520,
      0,
      weaponDamage("rifle"),
      0.9,
      false,
      14,
      6,
    );
    sfxShoot();
    updateHud();
    attackT = 0.12;
    attackCd = w.cooldown;
    return;
  }

  if (wpn === "lava") {
    spawnProjectile(
      "fire",
      facing === 1 ? player.x + player.w : player.x - 16,
      player.y + 16,
      facing * 280,
      -20,
      weaponDamage("lava"),
      0.45,
      false,
      16,
      12,
    );
    sfxShoot();
    attackT = 0.14;
    attackCd = w.cooldown;
    return;
  }

  if (wpn === "staff") {
    spawnProjectile(
      "magic",
      facing === 1 ? player.x + player.w : player.x - 14,
      player.y + 14,
      facing * 360,
      -30,
      weaponDamage("staff"),
      1.1,
      false,
      14,
      14,
    );
    beep(880, 0.06, "sine", 0.03);
    attackT = 0.14;
    attackCd = w.cooldown;
    return;
  }

  sfxSwing();
  attackT = wpn === "knife" ? 0.1 : 0.16;
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
  const jump =
    keys.has(" ") ||
    keys.has("z") ||
    keys.has("Z") ||
    keys.has("w") ||
    keys.has("W");
  const attack =
    keys.has("x") || keys.has("X") || keys.has("j") || keys.has("J");
  const enter =
    keys.has("ArrowUp") ||
    keys.has("e") ||
    keys.has("E") ||
    keys.has("f") ||
    keys.has("F");

  const moveMul = speedTimer > 0 ? 1.45 : 1;
  const jumpPower = speedTimer > 0 ? JUMP * 1.2 : JUMP;

  let ax = 0;
  if (left) ax -= 1;
  if (right) ax += 1;
  if (ax !== 0) facing = ax > 0 ? 1 : -1;
  player.vx = ax * MOVE * moveMul;

  if (jump) jumpBuffered = 0.12;
  jumpBuffered = Math.max(0, jumpBuffered - dt);
  coyote = Math.max(0, coyote - dt);
  if (jumpBuffered > 0 && !flyTimer && (onGround || coyote > 0)) {
    player.vy = -jumpPower;
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

  const bagKey =
    keys.has("1") || keys.has("2") || keys.has("3")
      ? keys.has("1")
        ? 0
        : keys.has("2")
          ? 1
          : 2
      : -1;
  if (bagKey >= 0 && !bagLatch) {
    bagLatch = true;
    swapBagSlot(bagKey);
  }
  if (bagKey < 0) bagLatch = false;

  if (scene === "world") {
    for (const d of doors) {
      if (
        aabb(player, {
          x: d.x - 36,
          y: d.y - 8,
          w: d.w + 72,
          h: d.h + 16,
        })
      ) {
        if (d.needsKey && !inventory.key) {
          showHint("Bar kilitli — anahtar lazım");
        } else {
          showHint(`↑ / E — ${d.label} gir`);
        }
        break;
      }
    }
  } else if (scene === "interior") {
    if (
      chest &&
      !chest.opened &&
      aabb(player, {
        x: chest.x - 24,
        y: chest.y - 16,
        w: chest.w + 48,
        h: chest.h + 32,
      })
    ) {
      showHint("↑ / E — sandığı aç");
    } else if (player.x < 150) {
      showHint("↑ / E — dışarı çık");
    }
  }
}

function drawSky() {
  const t = (level - 1) / (MAX_LEVEL - 1);
  const top =
    scene === "interior"
      ? "#1a1520"
      : `rgb(${26 + ((t * 20) | 0)},${39 - ((t * 10) | 0)},${64 - ((t * 20) | 0)})`;
  const bot =
    scene === "interior"
      ? "#2a2438"
      : `rgb(${61},${90 - ((t * 30) | 0)},${128 - ((t * 40) | 0)})`;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top);
  g.addColorStop(1, bot);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawHills() {
typescript
  if (scene === "interior") return;
  ctx.fillStyle = level >= 8 ? "#301820" : level >= 5 ? "#2a2035" : "#243552";
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

function drawRocketParchment(px: number, py: number) {
  ctx.fillStyle = "#e8d8a8";
  ctx.fillRect(px, py, 48, 56);
  ctx.strokeStyle = "#8a7040";
  ctx.strokeRect(px, py, 48, 56);
  ctx.fillStyle = "#6a5a48";
  ctx.fillRect(px + 14, py + 22, 20, 18);
  ctx.fillStyle = "#c8b090";
  ctx.fillRect(px + 16, py + 10, 16, 14);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(px + 14, py + 14, 20, 6);
  ctx.fillStyle = "#fff";
  ctx.fillRect(px + 18, py + 15, 3, 3);
  ctx.fillRect(px + 27, py + 15, 3, 3);
  ctx.fillStyle = "#c8b090";
  ctx.fillRect(px + 34, py + 28, 5, 14);
  ctx.fillRect(px + 32, py + 38, 9, 4);
  ctx.fillStyle = "#8a2030";
  ctx.font = "7px monospace";
  ctx.fillText("!", px + 38, py + 26);
}

function drawInteriorDecor() {
  if (!currentInterior) return;
  const isBar = currentInterior.kind === "bar";
  ctx.fillStyle = isBar ? "#2a1a18" : "#2a241c";
  ctx.fillRect(0, 80, W, GROUND_Y - 80);
  ctx.fillStyle = "#3a3028";
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

  ctx.fillStyle = "#1a120e";
  ctx.fillRect(40, GROUND_Y - 70, 40, 70);
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(68, GROUND_Y - 40, 6, 6);

  if (isBar) {
    ctx.fillStyle = "#4a3020";
    ctx.fillRect(300, GROUND_Y - 48, 280, 48);
    ctx.fillStyle = "#6a4830";
    ctx.fillRect(300, GROUND_Y - 56, 280, 10);
    ctx.fillStyle = "#5a4030";
    ctx.fillRect(420, GROUND_Y - 100, 28, 44);
    ctx.fillStyle = "#e8b896";
    ctx.fillRect(424, GROUND_Y - 114, 20, 16);
    ctx.fillStyle = "#8a2030";
    ctx.fillRect(418, GROUND_Y - 118, 32, 8);
    ctx.fillStyle = "#f5c518";
    ctx.font = "10px monospace";
    ctx.fillText("BARMEN", 450, GROUND_Y - 90);

    for (const tx of [160, 520]) {
      ctx.fillStyle = "#6a4a28";
      ctx.fillRect(tx, GROUND_Y - 36, 70, 12);
      ctx.fillRect(tx + 8, GROUND_Y - 24, 10, 24);
      ctx.fillRect(tx + 52, GROUND_Y - 24, 10, 24);
      ctx.fillStyle = "#c9a227";
      ctx.fillRect(tx + 16, GROUND_Y - 48, 10, 14);
      ctx.fillRect(tx + 40, GROUND_Y - 48, 10, 14);
      ctx.fillStyle = "#f0e080";
      ctx.fillRect(tx + 18, GROUND_Y - 44, 6, 6);
      ctx.fillRect(tx + 42, GROUND_Y - 44, 6, 6);
    }

    for (const bx of [200, 600]) {
      ctx.fillStyle = "#4a3028";
      ctx.fillRect(bx, GROUND_Y - 50, 22, 28);
      ctx.fillStyle = "#e8b896";
      ctx.fillRect(bx + 4, GROUND_Y - 62, 14, 14);
      ctx.fillStyle = "#8a6030";
      ctx.fillRect(bx + 2, GROUND_Y - 66, 18, 6);
      ctx.fillStyle = "#c9a227";
      ctx.fillRect(bx - 4, GROUND_Y - 40, 8, 18);
    }

    ctx.fillStyle = "#4a2030";
    ctx.fillRect(340, 160, 180, 18);
    ctx.fillStyle = "#f5c518";
    ctx.font = "12px monospace";
    ctx.fillText("KÖR FARE", 375, 174);

    if (chest) {
      const cx = chest.x - camX;
      const cy = chest.y;
      if (chest.opened && parchmentShown) {
        drawRocketParchment(cx - 4, cy - 20);
      } else if (!chest.opened) {
        const colors: Record<ChestType, string> = {
          wood: "#8a6030",
          thorny: "#4a6830",
          sticky: "#6a5080",
          diamond: "#70c8e8",
          obsidian: "#2a2038",
          none: "#8a6030",
        };
        ctx.fillStyle = colors[chest.type];
        ctx.fillRect(cx, cy, chest.w, chest.h);
        ctx.fillStyle = "#c9a227";
        ctx.fillRect(cx + 4, cy + 12, chest.w - 8, 4);
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(cx + chest.w / 2 - 3, cy + 10, 6, 8);
        ctx.fillStyle = "#f5c518";
        ctx.font = "8px monospace";
        ctx.fillText("SANDIK", cx - 4, cy - 6);
      } else {
        ctx.fillStyle = "#5a4030";
        ctx.fillRect(cx, cy + 10, chest.w, chest.h - 10);
        ctx.fillStyle = "#8a6840";
        ctx.fillRect(cx - 2, cy, chest.w + 4, 12);
      }
    }
  } else {
    ctx.fillStyle = "#6a4a28";
    ctx.fillRect(220, 330, 120, 14);
    ctx.fillStyle = "#7ab0d8";
    ctx.fillRect(700, 160, 70, 70);
  }
}

function drawHandPotion(x: number, y: number) {
  if (!rightHand.item || rightHand.item.kind !== "potion") return;
  const color = POTIONS[rightHand.item.id].color;
  ctx.fillStyle = color;
  ctx.fillRect(x, y + 4, 7, 11);
  ctx.fillStyle = "#f0f4ff";
  ctx.fillRect(x + 1, y, 5, 4);
}

function drawPlayer() {
  const x = player.x - camX;
  const y = player.y;
  const blink = invuln > 0 && Math.floor(time * 20) % 2 === 0;
  if (blink) return;

  if (flyTimer > 0) {
    ctx.fillStyle = `rgba(74,168,255,${0.25 + Math.sin(time * 10) * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(x + player.w / 2, y + player.h / 2, 28, 36, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (shieldTimer > 0 && shieldHp > 0) {
    ctx.strokeStyle = `rgba(255,122,217,${0.4 + Math.sin(time * 8) * 0.2})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x + player.w / 2, y + player.h / 2, 26, 34, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (speedTimer > 0) {
    ctx.fillStyle = "rgba(255,210,74,0.2)";
    ctx.fillRect(x - 4, y, 4, player.h);
  }

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

  ctx.fillStyle = armor.boots ? "#8a9098" : "#2a2a32";
  ctx.fillRect(x + 5, y + 44, 9, 8);
  ctx.fillRect(x + 17, y + 44, 9, 8);

  const legSwing = onGround
    ? Math.sin(time * (Math.abs(player.vx) > 20 ? 14 : 0)) * 3
    : 0;
  ctx.fillStyle = armor.pants ? "#3a5068" : "#3a4558";
  ctx.fillRect(x + 7, y + 30, 8, 15 + legSwing);
  ctx.fillRect(x + 16, y + 30, 8, 15 - legSwing);

  ctx.fillStyle = armor.chest ? "#6a7888" : "#5a6578";
  ctx.fillRect(x + 5, y + 14, 20, 18);
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(x + 5, y + 20, 20, 3);

  ctx.fillStyle = "#8a2030";
  ctx.fillRect(x + 2, y + 16, 5, 22);

  ctx.fillStyle = "#e8b896";
  ctx.fillRect(x + 8, y + 2, 14, 13);
  ctx.fillStyle = armor.helm ? "#a0a8b0" : "#4a5568";
  ctx.fillRect(x + 6, y - 2, 18, 8);
  ctx.fillRect(x + 10, y - 8, 10, 8);
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(x + 6, y + 4, 18, 2);
  ctx.fillStyle = "#1a1a22";
  ctx.fillRect(x + 10, y + 7, 3, 3);
  ctx.fillRect(x + 16, y + 7, 3, 3);

  drawHandPotion(x - 2, y + 18);

  const wpn = equippedWeapon();
  const swinging = attackT > 0;
  if (wpn === "rifle") {
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(x + 22, y + 18, swinging ? 40 : 28, 6);
    ctx.fillStyle = "#6a4a28";
    ctx.fillRect(x + 20, y + 20, 10, 8);
  } else if (wpn === "sword") {
    ctx.fillStyle = "#c0d0e0";
    ctx.fillRect(
      x + (swinging ? 24 : 22),
      y + (swinging ? 8 : 14),
      5,
      swinging ? 28 : 22,
    );
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(x + 20, y + (swinging ? 30 : 32), 10, 4);
  } else if (wpn === "axe") {
    ctx.fillStyle = "#6a4020";
    ctx.fillRect(x + 24, y + 12, 5, 24);
    ctx.fillStyle = "#a0a8b0";
    ctx.fillRect(x + 20, y + 8, 16, 10);
  } else if (wpn === "knife") {
    ctx.fillStyle = "#d0d8e0";
    ctx.fillRect(x + (swinging ? 28 : 24), y + 18, swinging ? 16 : 12, 4);
    ctx.fillStyle = "#4a3020";
    ctx.fillRect(x + 22, y + 17, 6, 6);
  } else if (wpn === "lava") {
    ctx.fillStyle = "#ff5020";
    ctx.fillRect(x + 22, y + 14, 8, 20);
    ctx.fillStyle = "#ffd24a";
    ctx.fillRect(x + 24, y + 10, 4, 6);
  } else if (wpn === "staff") {
    ctx.fillStyle = "#6a4080";
    ctx.fillRect(x + 26, y + 4, 4, 30);
    ctx.fillStyle = "#b44dff";
    ctx.beginPath();
    ctx.arc(x + 28, y + 4, 7, 0, Math.PI * 2);
    ctx.fill();
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
  if (e.unhittable) ctx.globalAlpha = 0.55;

  if (e.kind === "goblin") {
    ctx.fillStyle = "#2a4a28";
    ctx.fillRect(x + 6, y + 36, 8, 8);
    ctx.fillRect(x + 18, y + 36, 8, 8);
    ctx.fillStyle = "#3d7a3a";
    ctx.fillRect(x + 5, y + 14, 22, 24);
    ctx.fillStyle = "#6aaa58";
    ctx.fillRect(x + 8, y + 2, 16, 14);
    ctx.fillStyle = "#1a2a18";
    ctx.fillRect(x + 10, y + 6, 3, 3);
    ctx.fillRect(x + 18, y + 6, 3, 3);
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
  } else if (e.kind === "archer") {
    ctx.fillStyle = "#4a5538";
    ctx.fillRect(x + 5, y + 16, 22, 24);
    ctx.fillStyle = "#b09080";
    ctx.fillRect(x + 8, y + 2, 16, 14);
    ctx.fillStyle = "#ff4444";
    ctx.fillRect(x + 11, y + 7, 3, 3);
    ctx.fillRect(x + 18, y + 7, 3, 3);
  } else {
    const bk = e.bossKind ?? "ironface";
    const bodyColor: Record<BossKind, string> = {
      ironface: "#3a4058",
      cloud: "#6a90b8",
      mothman: "#4a3a58",
      anaconda: "#2e7a3a",
      kingkong: "#5a3a28",
      firefox: "#c05020",
      minotaur: "#6a5030",
      creeper: "#1a2818",
      sphinx: "#c9a060",
      cerberus: "#4a2028",
    };

    if (bk === "anaconda") {
      ctx.fillStyle = bodyColor.anaconda;
      ctx.beginPath();
      ctx.ellipse(
        x + e.w * 0.55,
        y + e.h * 0.55,
        e.w * 0.48,
        e.h * 0.42,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = "#ff3030";
      ctx.fillRect(x + 8, y + 14, 5, 5);
      ctx.fillRect(x + 18, y + 14, 5, 5);
    } else if (bk === "mothman") {
      const flap = Math.sin(time * 10) * 10;
      ctx.fillStyle = "#6a5080";
      ctx.beginPath();
      ctx.moveTo(x + e.w / 2, y + 28);
      ctx.lineTo(x - 18, y + 10 + flap);
      ctx.lineTo(x + 10, y + 40);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + e.w / 2, y + 28);
      ctx.lineTo(x + e.w + 18, y + 10 - flap);
      ctx.lineTo(x + e.w - 10, y + 40);
      ctx.fill();
      ctx.fillStyle = bodyColor.mothman;
      ctx.fillRect(x + 18, y + 20, e.w - 36, e.h - 28);
      ctx.fillStyle = "#c09070";
      ctx.fillRect(x + 22, y + 4, e.w - 44, 20);
    } else if (bk === "firefox") {
      ctx.fillStyle = bodyColor.firefox;
      ctx.fillRect(x + 10, y + 20, e.w - 20, e.h - 28);
      ctx.fillStyle = "#ffd24a";
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x + e.w - 8, y + 30 + i * 10);
        ctx.lineTo(x + e.w + 18, y + 20 + i * 12 + Math.sin(time * 8 + i) * 4);
        ctx.lineTo(x + e.w - 4, y + 38 + i * 8);
        ctx.fill();
      }
      ctx.fillStyle = "#ffe0a0";
      ctx.fillRect(x + 16, y + 4, e.w - 40, 20);
      ctx.fillStyle = "#ff3030";
      ctx.fillRect(x + 22, y + 10, 5, 5);
      ctx.fillRect(x + e.w - 36, y + 10, 5, 5);
    } else if (bk === "kingkong") {
      ctx.fillStyle = bodyColor.kingkong;
      ctx.fillRect(x + 8, y + 28, e.w - 16, e.h - 40);
      ctx.fillRect(x + 4, y + 40, 16, 28);
      ctx.fillRect(x + e.w - 20, y + 40, 16, 28);
      ctx.fillStyle = "#8a6a50";
      ctx.fillRect(x + 20, y + 4, e.w - 40, 28);
      ctx.fillStyle = "#1a1010";
      ctx.fillRect(x + 28, y + 14, 6, 6);
      ctx.fillRect(x + e.w - 34, y + 14, 6, 6);
    } else if (bk === "creeper") {
      const flap = Math.sin(time * 14) * 8;
      ctx.fillStyle = "#3a5030";
      ctx.beginPath();
      ctx.moveTo(x + e.w / 2, y + 20);
      ctx.lineTo(x - 8, y + 8 + flap);
      ctx.lineTo(x + 12, y + 30);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + e.w / 2, y + 20);
      ctx.lineTo(x + e.w + 8, y + 8 - flap);
      ctx.lineTo(x + e.w - 12, y + 30);
      ctx.fill();
      ctx.fillStyle = bodyColor.creeper;
      ctx.fillRect(x + 14, y + 16, e.w - 28, e.h - 28);
      ctx.fillStyle = "#80ff60";
      ctx.fillRect(x + 22, y + 24, 5, 5);
      ctx.fillRect(x + e.w - 27, y + 24, 5, 5);
    } else if (bk === "sphinx") {
      ctx.fillStyle = bodyColor.sphinx;
      ctx.fillRect(x + 10, y + 30, e.w - 20, e.h - 40);
      ctx.fillRect(x + 20, y + 8, e.w - 50, 28);
      ctx.fillStyle = "#8a6840";
      ctx.beginPath();
      ctx.moveTo(x + e.w - 20, y + 40);
      ctx.lineTo(x + e.w + 20, y + 50);
      ctx.lineTo(x + e.w - 10, y + 70);
      ctx.fill();
      ctx.fillStyle = "#1a1010";
      ctx.fillRect(x + 28, y + 16, 5, 5);
    } else if (bk === "cerberus") {
      ctx.fillStyle = bodyColor.cerberus;
      ctx.fillRect(x + 16, y + 36, e.w - 32, e.h - 44);
      const heads = [0.18, 0.5, 0.82];
      for (let i = 0; i < 3; i++) {
        const hx = x + e.w * heads[i]! - 14;
        const dead = e.headHp && e.headHp[i]! <= 0;
        ctx.fillStyle = dead ? "#2a1010" : "#6a3038";
        ctx.fillRect(hx, y + 4, 28, 36);
        if (!dead) {
          ctx.fillStyle = "#ff4040";
          ctx.fillRect(hx + 6, y + 16, 5, 5);
          ctx.fillRect(hx + 16, y + 16, 5, 5);
        }
        if (e.headHp) {
          ctx.fillStyle = "#1a1010";
          ctx.fillRect(hx, y - 8 - i * 2, 28, 4);
          ctx.fillStyle = dead ? "#333" : "#e04040";
          ctx.fillRect(hx, y - 8 - i * 2, 28 * (e.headHp[i]! / 1800), 4);
        }
      }
    } else if (bk === "minotaur") {
      ctx.fillStyle = bodyColor.minotaur;
      ctx.fillRect(x + 10, y + 28, e.w - 20, e.h - 36);
      ctx.fillStyle = "#c09070";
      ctx.fillRect(x + 18, y + 6, e.w - 36, 26);
      ctx.fillStyle = "#e8e0d0";
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 10);
      ctx.lineTo(x - 6, y - 10);
      ctx.lineTo(x + 16, y + 8);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + e.w - 8, y + 10);
      ctx.lineTo(x + e.w + 6, y - 10);
      ctx.lineTo(x + e.w - 16, y + 8);
      ctx.fill();
    } else if (bk === "cloud") {
      ctx.fillStyle = "#a8c8e8";
      ctx.beginPath();
      ctx.arc(x + 18, y + 16, 14, 0, Math.PI * 2);
      ctx.arc(x + e.w / 2, y + 10, 18, 0, Math.PI * 2);
      ctx.arc(x + e.w - 18, y + 16, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = bodyColor.cloud;
      ctx.fillRect(x + 14, y + 28, e.w - 28, e.h - 36);
    } else {
      ctx.fillStyle = "#1a1010";
      ctx.fillRect(x + 10, y + e.h - 12, 16, 12);
      ctx.fillRect(x + e.w - 26, y + e.h - 12, 16, 12);
      ctx.fillStyle = bodyColor[bk];
      ctx.fillRect(x + 6, y + 24, e.w - 12, e.h - 36);
      ctx.fillStyle = "#c09070";
      ctx.fillRect(x + 14, y + 2, e.w - 28, 26);
      if (bk === "ironface") {
        ctx.fillStyle = "#8a9098";
        ctx.fillRect(x + 16, y + 8, e.w - 32, 14);
      }
      ctx.fillStyle = "#ff3030";
      ctx.fillRect(x + 20, y + 12, 6, 6);
      ctx.fillRect(x + e.w - 26, y + 12, 6, 6);
    }

    if (e.telegraph > 0) {
      ctx.fillStyle = "rgba(255,120,40,0.35)";
      ctx.fillRect(x - 8, y - 8, e.w + 16, e.h + 8);
    }
    if (bk !== "cerberus") {
      const bw = e.w - 10;
      ctx.fillStyle = "#1a1010";
      ctx.fillRect(x + 5, y - 22, bw, 6);
      ctx.fillStyle = "#e04040";
      ctx.fillRect(x + 5, y - 22, bw * (e.hp / e.maxHp), 6);
    }
    ctx.fillStyle = "#f5c518";
    ctx.font = "8px monospace";
    ctx.fillText(e.name, x, y - 28);
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
  } else {
    const pulse = 0.7 + Math.sin(time * 5) * 0.3;
    ctx.fillStyle = `rgba(154,208,255,${pulse})`;
    ctx.beginPath();
    ctx.arc(x + 11, y + 11, 11, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHazards() {
  for (const h of hazards) {
    const x = h.x - camX;
    if (h.kind === "lava") {
      ctx.fillStyle = "#c03010";
      ctx.fillRect(x, h.y, h.w, h.h);
      ctx.fillStyle = "#ff6020";
      ctx.fillRect(x, h.y, h.w, 8);
    } else if (h.kind === "platform") {
      ctx.fillStyle = "#5a6878";
      ctx.fillRect(x, h.y, h.w, h.h);
      ctx.fillStyle = "#ffd24a";
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(x + 10 + i * 18, h.y - 4, 3, 3);
      }
    } else {
      ctx.fillStyle = "#ff4040";
      ctx.fillRect(x, h.y, h.w, h.h);
      ctx.fillStyle = "#1a1010";
      ctx.fillRect(x + 4, h.y - 6, 4, 6);
      ctx.fillRect(x + h.w - 8, h.y - 6, 4, 6);
    }
  }
}

function drawProjectiles() {
  for (const p of projectiles) {
    if (!p.alive) continue;
    const x = p.x - camX;
    if (p.kind === "arrow" || p.kind === "horn") {
      ctx.fillStyle = "#d0c090";
      ctx.fillRect(x, p.y + 2, p.w, 3);
      ctx.fillStyle = "#888";
      ctx.fillRect(x + (p.vx >= 0 ? p.w - 4 : 0), p.y, 4, 6);
    } else if (p.kind === "spit") {
      ctx.fillStyle = "#7dffb3";
      ctx.beginPath();
      ctx.arc(x + 5, p.y + 5, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === "rain") {
      ctx.fillStyle = "#7ab0ff";
      ctx.fillRect(x + 2, p.y, 4, 12);
    } else if (p.kind === "poison") {
      ctx.fillStyle = "#ff3a3a";
      ctx.beginPath();
      ctx.arc(x + 7, p.y + 5, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === "bullet") {
      ctx.fillStyle = "#f5c518";
      ctx.fillRect(x, p.y + 1, p.w, 4);
    } else if (p.kind === "fire" || p.kind === "breath") {
      ctx.fillStyle = "#ff5020";
      ctx.beginPath();
      ctx.arc(x + 8, p.y + 6, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffd24a";
      ctx.beginPath();
      ctx.arc(x + 8, p.y + 6, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === "magic" || p.kind === "bolt") {
      ctx.fillStyle = "#b44dff";
      ctx.beginPath();
      ctx.arc(x + 7, p.y + 7, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillRect(x + 5, p.y + 4, 4, 6);
    } else if (p.kind === "cotton") {
      ctx.fillStyle = "#f4f0e8";
      ctx.beginPath();
      ctx.arc(x + 6, p.y + 6, 7, 0, Math.PI * 2);
      ctx.arc(x + 12, p.y + 5, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === "blade") {
      ctx.fillStyle = "#c0d0e0";
      ctx.save();
      ctx.translate(x + 9, p.y + 9);
      ctx.rotate(time * 18);
      ctx.fillRect(-10, -2, 20, 4);
      ctx.fillRect(-2, -10, 4, 20);
      ctx.restore();
    } else if (p.kind === "head") {
      ctx.fillStyle = "#3a5030";
      ctx.fillRect(x, p.y, p.w, p.h);
      ctx.fillStyle = "#80ff60";
      ctx.fillRect(x + 4, p.y + 6, 4, 4);
      ctx.fillRect(x + 12, p.y + 6, 4, 4);
    } else if (p.kind === "spike") {
      ctx.fillStyle = "#c9a060";
      ctx.beginPath();
      ctx.moveTo(x + 5, p.y);
      ctx.lineTo(x + 10, p.y + p.h);
      ctx.lineTo(x, p.y + p.h);
      ctx.fill();
    } else if (p.kind === "anvil") {
      ctx.fillStyle = "#4a4a50";
      ctx.fillRect(x, p.y + 8, p.w, p.h - 8);
      ctx.fillRect(x + 4, p.y, p.w - 8, 10);
    } else if (p.kind === "spark") {
      ctx.fillStyle = "#ffd24a";
      ctx.fillRect(x, p.y, 4, 4);
    } else {
      ctx.fillStyle = "#5dff7a";
      ctx.beginPath();
      ctx.arc(x + 6, p.y + 6, 6, 0, Math.PI * 2);
      ctx.fill();
    }
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
  level = 1;
  Object.assign(player, {
    x: 80,
    y: GROUND_Y - 52,
    vx: 0,
    vy: 0,
    hp: 450,
    maxHp: 450,
  });
  inventory.coins = 0;
  inventory.key = false;
  inventory.medallion = false;
  leftHand.item = null;
  rightHand.item = null;
  bag[0] = null;
  bag[1] = null;
  bag[2] = null;
  armor.helm = false;
  armor.chest = false;
  armor.pants = false;
  armor.boots = false;
  for (const k of Object.keys(weaponBonus) as WeaponId[]) weaponBonus[k] = 0;
  facing = 1;
  invuln = 0;
  attackT = 0;
  attackCd = 0;
  flyTimer = 0;
  speedTimer = 0;
  shieldHp = 0;
  shieldTimer = 0;
  venomDot = 0;
  venomAcc = 0;
  projectiles.length = 0;
  hazards.length = 0;
  camX = 0;
  scene = "world";
  currentInterior = null;
  chest = null;
  dialogQueue = [];
  dialogEl.classList.remove("show");
  buildWorld();
  updateHud();
  queueDialog([
    {
      name: "???",
      text: "Sol el silah (X), sağ el iksir (C). Çanta 1/2/3. Bar için anahtar.",
    },
    { name: "SEN", text: "Kardeşimi bulacağım." },
    {
      name: "???",
      text: "Sandıktan yağma. Boss düşür, mor iksir al. 10. seviye: CERBERUS.",
    },
  ]);
}

function frame(dt: number) {
  time += dt;
  if (shake > 0) shake = Math.max(0, shake - dt * 30);

  if (state === "playing" || state === "dialog") {
    if (state === "playing") {
      handleInput(dt);
      resolvePlayer(dt);
      tickVenomDot(dt);
      updateEnemies(dt);
      updateHazards(dt);
      updateItems(dt);
      updateProjectiles(dt);
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

    if (state === "playing") updateHud();
  } else {
    updateParticles(dt);
  }

  drawSky();
  const ox = shake > 0 ? (Math.random() - 0.5) * shake : 0;
  const oy = shake > 0 ? (Math.random() - 0.5) * shake : 0;
  ctx.save();
  ctx.translate(ox, oy);
  drawHills();
  if (scene === "interior") {
    drawInteriorDecor();
    drawPlatforms(interiorPlatforms);
  } else {
    drawBuildings();
    drawPlatforms(platforms);
    drawHazards();
    for (const it of items) drawWorldItem(it);
    for (const e of enemies) drawEnemy(e);
  }
  drawProjectiles();
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
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key))
    e.preventDefault();
  if (e.key === "r" || e.key === "R") {
    if (
      state === "playing" ||
      state === "dead" ||
      state === "win" ||
      state === "dialog"
    ) {
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
document
  .querySelector("#btn-restart")!
  .addEventListener("click", restartFromOverlay);

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
bindHold("#btn-bag1", "1");
bindHold("#btn-bag2", "2");
bindHold("#btn-bag3", "3");
document.querySelector("#btn-potion")!.addEventListener("click", (e) => {
  e.preventDefault();
  usePotion();
});

state = "title";
buildWorld();
player.x = 200;
requestAnimationFrame(loop);

if (typeof location !== "undefined" && location.search.includes("debug=1")) {
  (window as unknown as { wtmDebug: Record<string, unknown> }).wtmDebug = {
    grantItem,
    grantArmor,
    swapBagSlot,
    tryEnterDoor,
    leftHand,
    rightHand,
    bag,
    armor,
    inventory,
    player,
    buildWorld,
    updateHud,
    getState: () => state,
    setLevel: (n: number) => {
      level = n;
      scene = "world";
      currentInterior = null;
      chest = null;
      player.x = 80;
      player.y = GROUND_Y - player.h;
      buildWorld();
      updateHud();
    },
  };
}
