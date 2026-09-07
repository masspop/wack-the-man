
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

type Plat = Rect & { oneWay?: boolean };

type GroundDrop = Rect & {
  kind: "weapon" | "armor";
  id: CarryWeapon | ArmorSlot;
  ammo?: number;
  enchanted?: boolean;
  armorAbsorb?: number;
  bob: number;
  sparkle: number;
};

type Ally = Rect & {
  hp: number;
  maxHp: number;
  facing: 1 | -1;
  attackCd: number;
  alive: boolean;
  vx: number;
  vy: number;
};

type PlatTrap = Rect & {
  dmg: number;
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
      label: "Recovery",
      color: "#3dff7a",
      hint: "Yeşil · iç · +200–350 can",
    },
    poison: {
      label: "Krypton",
      color: "#ff3a3a",
      hint: "Kırmızı · at · düşmana 250–300",
    },
    fly: {
      label: "Pigeon",
      color: "#4aa8ff",
      hint: "Mavi · iç · 5 sn uçuş",
    },
    purple: {
      label: "Enchant",
      color: "#b44dff",
      hint: "Mor · yere at · eşyanın üstüne dök",
    },
    yellow: {
      label: "TheReeker",
      color: "#ffd24a",
      hint: "Sarı · iç · 8 sn görünmezlik",
    },
    pink: {
      label: "Splındog",
      color: "#ff7ad9",
      hint: "Pembe · yere at · 2 asalı müttefik",
    },
  };

/** drink = içilen · throw = atılan · ground = yere atılıp dökülen/çağırılan */
const POTION_USE: Record<PotionId, "drink" | "throw" | "ground"> = {
  heal: "drink",
  fly: "drink",
  yellow: "drink",
  poison: "throw",
  purple: "ground",
  pink: "ground",
};

type ThrownBottle = {
  id: PotionId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  life: number;
  spin: number;
  alive: boolean;
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
const JUMP = 680;
const GROUND_Y = 430;
const INTERIOR_W = 960;

canvas.width = W;
canvas.height = H;

const keys = new Set<string>();
const particles: Particle[] = [];
const platforms: Plat[] = [];
const enemies: Enemy[] = [];
const items: WorldItem[] = [];
const doors: Door[] = [];
const buildings: (Rect & { kind: "house" | "bar"; label: string })[] = [];
const projectiles: Projectile[] = [];
const interiorPlatforms: Plat[] = [];
const interiors: Record<string, InteriorDef> = {};
const hazards: Hazard[] = [];
const groundDrops: GroundDrop[] = [];
const allies: Ally[] = [];
const platTraps: PlatTrap[] = [];
const thrownBottles: ThrownBottle[] = [];
const weaponBonus: Record<WeaponId, number> = {
  fist: 0,
  knife: 0,
  axe: 0,
  rifle: 0,
  sword: 0,
  lava: 0,
  staff: 0,
};
const weaponEnchanted: Record<WeaponId, boolean> = {
  fist: false,
  knife: false,
  axe: false,
  rifle: false,
  sword: false,
  lava: false,
  staff: false,
};
const armorEnchant: Record<ArmorSlot, number> = {
  helm: 0,
  chest: 0,
  pants: 0,
  boots: 0,
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
let invisTimer = 0;
let shieldHp = 0;
let shieldTimer = 0;
let currentInterior: InteriorDef | null = null;
let returnPos = { x: 80, y: GROUND_Y - 52 };
let levelClearPending = false;
let venomDot = 0;
let venomAcc = 0;
let chest: Chest | null = null;
let parchmentShown = false;
let enchantSparkleT = 0;
let drinkAnimT = 0;
let drinkAnimId: PotionId | null = null;
let pourAnimT = 0;
let pourAnimX = 0;
let pourAnimY = 0;
let potionBusy = false;

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

function grantArmor(slot: ArmorSlot, absorbExtra = 0) {
  const had = armor[slot];
  armor[slot] = true;
  if (absorbExtra > 0) armorEnchant[slot] = absorbExtra;
  const block = Math.min(0.9, ARMOR_BLOCK[slot] + armorEnchant[slot]);
  sfxPickup();
  showStory(
    had
      ? `${ARMOR_LABEL[slot]} yenilendi (%${Math.round(block * 100)} blok).`
      : `${ARMOR_LABEL[slot]} kuşanıldı (%${Math.round(block * 100)} blok).`,
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

function addPlat(x: number, y: number, w: number, h = 24, oneWay = false) {
  platforms.push(oneWay ? { x, y, w, h, oneWay: true } : { x, y, w, h });
}

function addPlatTrap(plat: Plat) {
  const tw = 28;
  const tx = plat.x + Math.floor((plat.w - tw) / 2) + rand(-8, 8);
  platTraps.push({
    x: Math.max(plat.x + 4, Math.min(tx, plat.x + plat.w - tw - 4)),
    y: plat.y - 10,
    w: tw,
    h: 12,
    dmg: rand(40, 50),
    tick: 0,
  });
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
  // Climbable one-way staircase to upstairs chest
  interiorPlatforms.push({ x: 160, y: 368, w: 150, h: 18, oneWay: true });
  interiorPlatforms.push({ x: 380, y: 310, w: 160, h: 18, oneWay: true });
  interiorPlatforms.push({ x: 620, y: 250, w: 180, h: 18, oneWay: true });

  if (def.kind === "bar") {
    const ctype = rollChestType();
    chest = {
      x: 700,
      y: 210,
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
  platTraps.length = 0;
  groundDrops.length = 0;
  chest = null;
  levelClearPending = false;

  WORLD_W = 2400 + level * 80;
  const mid = Math.floor(WORLD_W * 0.42);
  const houseX = level % 2 === 1 ? Math.floor(WORLD_W * 0.18) : null;
  const barX = mid;

  buildInteriorsMeta(barX, houseX);

  // Ground: full collision
  addPlat(0, GROUND_Y, WORLD_W, 24, false);

  // Climbable one-way staircase (steps ~58–62px, first reachable from ground)
  const airPlats: Plat[] = [
    { x: 200, y: 368, w: 120, h: 24, oneWay: true },
    { x: 380, y: 308, w: 110, h: 24, oneWay: true },
    { x: Math.floor(WORLD_W * 0.28), y: 248, w: 130, h: 24, oneWay: true },
    { x: Math.floor(WORLD_W * 0.48), y: 308, w: 120, h: 24, oneWay: true },
    { x: Math.floor(WORLD_W * 0.58), y: 248, w: 110, h: 24, oneWay: true },
    { x: Math.floor(WORLD_W * 0.68), y: 190, w: 120, h: 24, oneWay: true },
    { x: Math.floor(WORLD_W * 0.8), y: 250, w: 130, h: 24, oneWay: true },
  ];
  for (const p of airPlats) {
    platforms.push(p);
    // Spike traps on most floating platforms
    if (chance(0.7) || airPlats.indexOf(p) % 2 === 0) addPlatTrap(p);
  }

  // Keys on upper platforms
  addItem("key", airPlats[0]!.x + 20, airPlats[0]!.y - 28);
  if (level >= 4) {
    addItem("key", airPlats[5]!.x + 30, airPlats[5]!.y - 28);
  }

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
  addItem("coin", airPlats[1]!.x + 30, airPlats[1]!.y - 28);
  addItem("coin", airPlats[3]!.x + 20, airPlats[3]!.y - 28);
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
  const block = (slot: ArmorSlot) =>
    armor[slot] ? Math.min(0.9, ARMOR_BLOCK[slot] + armorEnchant[slot]) : 0;
  dmg *= 1 - block("helm");
  dmg *= 1 - block("chest");
  dmg *= 1 - block("pants");
  dmg *= 1 - block("boots");
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

function nearestGroundDrop(maxDist = 56): GroundDrop | null {
  return nearestGroundDropAt(
    player.x + player.w / 2,
    player.y + player.h / 2,
    maxDist,
  );
}

function nearestGroundDropAt(
  x: number,
  y: number,
  maxDist = 64,
): GroundDrop | null {
  let best: GroundDrop | null = null;
  let bestD = maxDist;
  for (const d of groundDrops) {
    const cx = d.x + d.w / 2;
    const cy = d.y + d.h / 2;
    const dist = Math.hypot(cx - x, cy - y);
    if (dist <= bestD) {
      bestD = dist;
      best = d;
    }
  }
  return best;
}

function dropLeftHand() {
  if (state !== "playing") return;
  const item = leftHand.item;
  if (!item || item.kind !== "weapon") {
    showHint("Sol elde silah yok");
    return;
  }
  groundDrops.push({
    x: player.x + (facing > 0 ? player.w + 4 : -28),
    y: player.y + player.h - 22,
    w: 22,
    h: 16,
    kind: "weapon",
    id: item.id,
    ammo: item.ammo,
    enchanted: weaponEnchanted[item.id],
    bob: 0,
    sparkle: weaponEnchanted[item.id] ? 1 : 0,
  });
  leftHand.item = null;
  showHint(`${WEAPONS[item.id].label} yere bırakıldı (Q)`);
  updateHud();
  beep(280, 0.05, "triangle", 0.02);
}

function dropRightHand() {
  if (state !== "playing") return;
  const item = rightHand.item;
  if (!item) {
    // Convenience: if right empty, drop left weapon (Enchant workflow)
    if (leftHand.item?.kind === "weapon") {
      dropLeftHand();
      return;
    }
    showHint("Sağ el boş");
    return;
  }
  if (item.kind === "potion") {
    showHint("İksir yere konmaz — silah Q, zırh U");
    return;
  }
  groundDrops.push({
    x: player.x + (facing > 0 ? player.w + 4 : -28),
    y: player.y + player.h - 22,
    w: 22,
    h: 16,
    kind: "weapon",
    id: item.id,
    ammo: item.ammo,
    enchanted: weaponEnchanted[item.id],
    bob: 0,
    sparkle: weaponEnchanted[item.id] ? 1 : 0,
  });
  rightHand.item = null;
  showHint(`${WEAPONS[item.id].label} yere bırakıldı (G)`);
  updateHud();
  beep(280, 0.05, "triangle", 0.02);
}

function dropArmorPiece() {
  if (state !== "playing") return;
  const slots: ArmorSlot[] = ["helm", "chest", "pants", "boots"];
  const owned = slots.find((s) => armor[s]);
  if (!owned) {
    showHint("Çıkarılacak zırh yok");
    return;
  }
  groundDrops.push({
    x: player.x + (facing > 0 ? player.w + 4 : -28),
    y: player.y + player.h - 20,
    w: 20,
    h: 18,
    kind: "armor",
    id: owned,
    enchanted: armorEnchant[owned] > 0,
    armorAbsorb: armorEnchant[owned],
    bob: 0,
    sparkle: armorEnchant[owned] > 0 ? 1 : 0,
  });
  armor[owned] = false;
  armorEnchant[owned] = 0;
  showHint(`${ARMOR_LABEL[owned]} yere bırakıldı (U)`);
  updateHud();
  beep(260, 0.05, "triangle", 0.02);
}

function pourEnchantAt(x: number, y: number) {
  const drop = nearestGroundDropAt(x, y, 72);
  if (!drop) {
    showHint("Eşyanın yanına at (Q/G/U ile yere koy)");
    return false;
  }
  pourAnimT = 0.75;
  pourAnimX = drop.x + drop.w / 2;
  pourAnimY = drop.y;
  if (drop.kind === "weapon") {
    const wid = drop.id as CarryWeapon;
    const bonus = rand(200, 350);
    weaponBonus[wid] += bonus;
    weaponEnchanted[wid] = true;
    drop.enchanted = true;
    drop.sparkle = 2.5;
    burst(drop.x + drop.w / 2, drop.y, "#b44dff", 22);
    enchantSparkleT = 1.2;
    showStory(`Enchant! ${WEAPONS[wid].label} +${bonus}`);
    beep(720, 0.12, "sine", 0.04);
  } else {
    const slot = drop.id as ArmorSlot;
    const absorb = (drop.armorAbsorb ?? 0) + 0.1;
    drop.armorAbsorb = absorb;
    drop.enchanted = true;
    drop.sparkle = 2.5;
    const idx = groundDrops.indexOf(drop);
    if (idx >= 0) groundDrops.splice(idx, 1);
    armorEnchant[slot] = absorb;
    grantArmor(slot, absorb);
    burst(x, y, "#b44dff", 20);
    enchantSparkleT = 1.2;
    showStory(
      `Enchant! ${ARMOR_LABEL[slot]} emilim +0.10 → %${Math.round(Math.min(0.9, ARMOR_BLOCK[slot] + absorb) * 100)}`,
    );
    beep(720, 0.12, "sine", 0.04);
  }
  return true;
}

function spawnAllies(atX?: number, atY?: number) {
  const ox = atX ?? player.x;
  const oy = atY ?? player.y;
  for (let i = 0; i < 2; i++) {
    allies.push({
      x: ox + (i === 0 ? -36 : 40),
      y: oy,
      w: 22,
      h: 36,
      hp: 300,
      maxHp: 300,
      facing: facing,
      attackCd: 0.4 + i * 0.2,
      alive: true,
      vx: 0,
      vy: 0,
    });
  }
  burst(ox + 20, oy + 10, "#ff7ad9", 22);
