import "./style.css";

type Rect = { x: number; y: number; w: number; h: number };
type Scene = "world" | "interior";
type EnemyKind = "goblin" | "bruiser" | "bat" | "boss";
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
type CosmeticId =
  | "elec_tshirt"
  | "blue_laser_glasses"
  | "elec_tattoo"
  | "grey_shoes"
  | "elec_poop"
  | "twitch_shoes"
  | "pink_heart_crown"
  | "google_hoodie"
  | "ig_pants"
  | "youtube_skin"
  | "metal_armor_pants"
  | "gold_armor_boots"
  | "emerald_gloves"
  | "diamond_chest"
  | "obsidian_helm"
  | "red_bowtie"
  | "rainbow_tux"
  | "slot_token"
  | "rainbow_skin";
type CosmeticSlot =
  | "body"
  | "pants"
  | "boots"
  | "helm"
  | "face"
  | "hands"
  | "held"
  | "skin"
  | "cape";
type ShopChestId = "detroit" | "google" | "knight" | "gamble";
type PlayMode = "solo" | "peaceful" | "survivor";
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
type GameState = "title" | "playing" | "dialog" | "win" | "dead" | "spectate";
type ProjKind =
  | "arrow"
  | "club"
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
const PLAYER_MAX_HP = 1000;
const COIN_TO_DOLLAR = 5;
const SAVE_KEY = "wtm_save_v2";
const ACCOUNTS_KEY = "wtm_accounts_v1";
const SESSION_KEY = "wtm_session_v1";

type CosmeticDef = {
  id: CosmeticId;
  label: string;
  slot: CosmeticSlot;
  colors: Record<string, string>;
};

const COSMETICS: Record<CosmeticId, CosmeticDef> = {
  elec_tshirt: {
    id: "elec_tshirt",
    label: "Elektrikli Tişört",
    slot: "body",
    colors: { body: "#1a3048", accent: "#4aa8ff", glow: "#7ad0ff" },
  },
  blue_laser_glasses: {
    id: "blue_laser_glasses",
    label: "Mavi Lazerli Gözlük",
    slot: "face",
    colors: { frame: "#0a1a30", lens: "#3a90ff", beam: "#6ab0ff" },
  },
  elec_tattoo: {
    id: "elec_tattoo",
    label: "Elektrik Dövmesi",
    slot: "cape",
    colors: { ink: "#4aa8ff", spark: "#a0e0ff" },
  },
  grey_shoes: {
    id: "grey_shoes",
    label: "Gri Ayakkabı",
    slot: "boots",
    colors: { boots: "#7a8088" },
  },
  elec_poop: {
    id: "elec_poop",
    label: "Elektrikli Bok (kafa üstü)",
    slot: "helm",
    colors: { brown: "#6a4020", glow: "#4aa8ff" },
  },
  twitch_shoes: {
    id: "twitch_shoes",
    label: "Twitch Logolu Ayakkabı",
    slot: "boots",
    colors: { boots: "#9146ff", logo: "#ffffff" },
  },
  pink_heart_crown: {
    id: "pink_heart_crown",
    label: "Kalpli Pembe Taç",
    slot: "helm",
    colors: { crown: "#ff7ad9", heart: "#ff3a8a", gem: "#ffe0f0" },
  },
  google_hoodie: {
    id: "google_hoodie",
    label: "Google Logolu Hoodie",
    slot: "body",
    colors: {
      body: "#4285f4",
      r: "#ea4335",
      y: "#fbbc05",
      g: "#34a853",
      b: "#4285f4",
    },
  },
  ig_pants: {
    id: "ig_pants",
    label: "Instagram Renkli Pantolon",
    slot: "pants",
    colors: { a: "#f58529", b: "#dd2a7b", c: "#8134af", d: "#515bd4" },
  },
  youtube_skin: {
    id: "youtube_skin",
    label: "YouTube Skin",
    slot: "skin",
    colors: { skin: "#c47a5a", accent: "#ff0000" },
  },
  metal_armor_pants: {
    id: "metal_armor_pants",
    label: "Metal Zırh Pantolon",
    slot: "pants",
    colors: { pants: "#8a949e", rim: "#c0c8d0" },
  },
  gold_armor_boots: {
    id: "gold_armor_boots",
    label: "Altın Zırh Ayakkabı",
    slot: "boots",
    colors: { boots: "#d4a017", shine: "#ffe08a" },
  },
  emerald_gloves: {
    id: "emerald_gloves",
    label: "Zümrüt Eldiven",
    slot: "hands",
    colors: { hands: "#2ecc71", gem: "#7dffb3" },
  },
  diamond_chest: {
    id: "diamond_chest",
    label: "Elmas Göğüslük Zırh",
    slot: "body",
    colors: { body: "#9ad8ff", shine: "#e8f6ff", rim: "#5aa0d0" },
  },
  obsidian_helm: {
    id: "obsidian_helm",
    label: "Obsidyen Şövalye Kaskı",
    slot: "helm",
    colors: { helm: "#1a1020", visor: "#4a2060", glow: "#a44dff" },
  },
  red_bowtie: {
    id: "red_bowtie",
    label: "Kırmızı Papyon",
    slot: "face",
    colors: { bow: "#e04040", knot: "#8a1010" },
  },
  rainbow_tux: {
    id: "rainbow_tux",
    label: "Rengarenk Smokin",
    slot: "body",
    colors: {
      a: "#ff3a3a",
      b: "#fbbc05",
      c: "#34a853",
      d: "#4285f4",
      e: "#9146ff",
    },
  },
  slot_token: {
    id: "slot_token",
    label: "Elde Slot Tokenı",
    slot: "held",
    colors: { coin: "#f5c518", face: "#111" },
  },
  rainbow_skin: {
    id: "rainbow_skin",
    label: "Rengarenk Skin",
    slot: "skin",
    colors: { a: "#ff7ad9", b: "#7dffb3", c: "#9ad1ff" },
  },
};

type LootEntry = { id: CosmeticId | null; weight: number; label: string };

const SHOP_CHESTS: Record<
  ShopChestId,
  {
    label: string;
    priceCoins: number;
    priceUsd: number;
    blurb: string;
    theme: "detroit" | "google" | "knight" | "gamble";
    loot: LootEntry[];
  }
> = {
  detroit: {
    label: "Detroit Sandığı",
    priceCoins: 13,
    priceUsd: 65,
    blurb: "Detroit neon · android grafik stili",
    theme: "detroit",
    loot: [
      { id: "elec_tshirt", weight: 18, label: "Elektrikli Tişört" },
      { id: "blue_laser_glasses", weight: 5, label: "Mavi Lazerli Gözlük" },
      { id: "elec_tattoo", weight: 24, label: "Elektrik Dövmesi" },
      { id: "grey_shoes", weight: 45, label: "Gri Ayakkabı" },
      { id: "elec_poop", weight: 8, label: "Elektrikli Bok" },
    ],
  },
  google: {
    label: "Google Sandığı",
    priceCoins: 31,
    priceUsd: 153,
    blurb: "Üstünde Google logosu",
    theme: "google",
    loot: [
      { id: "twitch_shoes", weight: 27, label: "Twitch Logolu Ayakkabı" },
      { id: "pink_heart_crown", weight: 39, label: "Kalpli Pembe Taç" },
      { id: "google_hoodie", weight: 14, label: "Google Logolu Hoodie" },
      { id: "ig_pants", weight: 15, label: "Instagram Pantolon" },
      { id: "youtube_skin", weight: 5, label: "YouTube Skin" },
    ],
  },
  knight: {
    label: "OnurluYaşamışŞövalye Sandığı",
    priceCoins: 46,
    priceUsd: 230,
    blurb: "Zırh maddesi · tepesinde çimen & papatya",
    theme: "knight",
    loot: [
      { id: "metal_armor_pants", weight: 43, label: "Metal Zırh Pantolon" },
      { id: "gold_armor_boots", weight: 24, label: "Altın Zırh Ayakkabı" },
      { id: "emerald_gloves", weight: 15, label: "Zümrüt Eldiven" },
      { id: "diamond_chest", weight: 14, label: "Elmas Göğüslük" },
      { id: "obsidian_helm", weight: 4, label: "Obsidyen Kask" },
    ],
  },
  gamble: {
    label: "Gamble Sandığı",
    priceCoins: 21,
    priceUsd: 105,
    blurb: "Rengarenk · üstünde kumar tokenı · %50 boş",
    theme: "gamble",
    loot: [
      { id: null, weight: 50, label: "BOŞ" },
      { id: "red_bowtie", weight: 25, label: "Kırmızı Papyon" },
      { id: "rainbow_tux", weight: 15, label: "Rengarenk Smokin" },
      { id: "slot_token", weight: 7, label: "Slot Tokenı" },
      { id: "rainbow_skin", weight: 3, label: "Rengarenk Skin" },
    ],
  },
};

const DEFAULT_LOOK = {
  cape: "#8a2030",
  body: "#5a6578",
  pants: "#3a4558",
  boots: "#2a2a32",
  helm: "#4a5568",
  skin: "#e8b896",
  accent: "#c9a227",
};

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

/** Level 1 → 10: HP strictly rises so later bosses are always tankier */
const BOSS_HP: Record<BossKind, number> = {
  ironface: 650,
  cloud: 950,
  mothman: 1350,
  anaconda: 1850,
  kingkong: 2500,
  firefox: 3300,
  minotaur: 4300,
  creeper: 5500,
  sphinx: 7000,
  cerberus: 9000,
};

/** Contact / projectile / special hit damage — also strictly rising by boss order */
const BOSS_ATK: Record<
  BossKind,
  { contact: number; proj: number; special: number; stomp: number }
> = {
  ironface: { contact: 30, proj: 0, special: 38, stomp: 42 },
  cloud: { contact: 42, proj: 30, special: 0, stomp: 0 },
  mothman: { contact: 55, proj: 50, special: 0, stomp: 0 },
  anaconda: { contact: 70, proj: 58, special: 0, stomp: 0 },
  kingkong: { contact: 90, proj: 0, special: 100, stomp: 0 },
  firefox: { contact: 115, proj: 130, special: 125, stomp: 0 },
  minotaur: { contact: 145, proj: 160, special: 185, stomp: 0 },
  creeper: { contact: 180, proj: 210, special: 240, stomp: 0 },
  sphinx: { contact: 225, proj: 260, special: 320, stomp: 0 },
  cerberus: { contact: 290, proj: 280, special: 380, stomp: 110 },
};

const BOSS_META: Record<
  BossKind,
  { name: string; w: number; h: number }
> = {
  ironface: { name: "İRONFACE", w: 74, h: 96 },
  cloud: { name: "THE CLOUD", w: 78, h: 88 },
  mothman: { name: "MOTHMAN", w: 80, h: 92 },
  anaconda: { name: "ANACONDA", w: 150, h: 62 },
  kingkong: { name: "KINGKONG", w: 96, h: 118 },
  firefox: { name: "FIREFOX", w: 92, h: 78 },
  minotaur: { name: "MINOTAUR", w: 84, h: 104 },
  creeper: { name: "CREEPER", w: 70, h: 94 },
  sphinx: { name: "SPHINX", w: 120, h: 96 },
  cerberus: { name: "CERBERUS", w: 130, h: 108 },
};

const canvas = document.querySelector<HTMLCanvasElement>("#game")!;
const ctx = canvas.getContext("2d")!;
const wrap = document.querySelector<HTMLElement>("#wrap")!;
const titleEl = document.querySelector<HTMLElement>("#title-screen")!;
const shopPanel = document.querySelector<HTMLElement>("#shop-panel")!;
const settingsPanel = document.querySelector<HTMLElement>("#settings-panel")!;
const guideWeapons = document.querySelector<HTMLElement>("#guide-weapons")!;
const guidePotions = document.querySelector<HTMLElement>("#guide-potions")!;
const shopList = document.querySelector<HTMLElement>("#shop-list")!;
const costumeList = document.querySelector<HTMLElement>("#costume-list")!;
const shopBalance = document.querySelector<HTMLElement>("#shop-balance")!;
const titleWallet = document.querySelector<HTMLElement>("#title-wallet")!;
const lobbyPanel = document.querySelector<HTMLElement>("#lobby-panel")!;
const lobbyInvites = document.querySelector<HTMLElement>("#lobby-invites")!;
const lobbyFriendPick = document.querySelector<HTMLElement>("#lobby-friend-pick")!;
const friendSearchInput = document.querySelector<HTMLInputElement>("#friend-search")!;
const friendSearchResults = document.querySelector<HTMLElement>("#friend-search-results")!;
const friendRequestsEl = document.querySelector<HTMLElement>("#friend-requests")!;
const friendListEl = document.querySelector<HTMLElement>("#friend-list")!;
const authUserInput = document.querySelector<HTMLInputElement>("#auth-user")!;
const authPassInput = document.querySelector<HTMLInputElement>("#auth-pass")!;
const authStatus = document.querySelector<HTMLElement>("#auth-status")!;
const profileFace = document.querySelector<HTMLCanvasElement>("#profile-face")!;
const modeTag = document.querySelector<HTMLElement>("#mode-tag")!;
const spectateBanner = document.querySelector<HTMLElement>("#spectate-banner")!;
const roomCodeInput = document.querySelector<HTMLInputElement>("#room-code")!;
const roomStatus = document.querySelector<HTMLElement>("#room-status")!;
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
/** Her barın sandığı seviye boyunca ayrı — gir-çık ile yenilenmez */
type BarChestSave = {
  type: ChestType;
  opened: boolean;
  isParchment: boolean;
  parchmentShown: boolean;
};
let barChestSaves: Record<string, BarChestSave> = {};
let enchantSparkleT = 0;
let drinkAnimT = 0;
let drinkAnimId: PotionId | null = null;
let pourAnimT = 0;
let pourAnimX = 0;
let pourAnimY = 0;
let potionBusy = false;

const CHEST_TITLE: Record<ChestType, string> = {
  wood: "AHŞAP SANDIK",
  thorny: "THORNY METAL",
  sticky: "STICKY RAINBOW",
  diamond: "ELMAS SANDIK",
  obsidian: "OBSİDYEN",
  none: "BOŞ KUTU",
};

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

const ownedCosmetics = new Set<CosmeticId>();
const equippedCosmetics: Partial<Record<CosmeticSlot, CosmeticId>> = {};
let helmOpen = true;

type AccountData = {
  user: string;
  pass: string;
  coins: number;
  owned: CosmeticId[];
  equipped: Partial<Record<CosmeticSlot, CosmeticId>>;
  friends: string[];
  incoming: string[];
  outgoing: string[];
};

type MpPeer = {
  name: string;
  isLocal: boolean;
  isBot: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  facing: 1 | -1;
  alive: boolean;
  invuln: number;
  attackCd: number;
  onGround: boolean;
  color: string;
};

let currentUser: string | null = null;
let playMode: PlayMode = "solo";
let lobbyInvited: string[] = [];
let lobbyModePick: "peaceful" | "survivor" = "peaceful";
const mpPeers: MpPeer[] = [];
let spectateTarget: string | null = null;
let survivorSettled = false;
let returningToHub = false;
let roomCode: string | null = null;
let roomRole: "host" | "guest" | null = null;
let roomChannel: BroadcastChannel | null = null;
let roomSyncAcc = 0;
const remoteHumanNames = new Set<string>();

const player: Rect & { vx: number; vy: number; hp: number; maxHp: number } = {
  x: 80,
  y: GROUND_Y - 52,
  w: 30,
  h: 52,
  vx: 0,
  vy: 0,
  hp: PLAYER_MAX_HP,
  maxHp: PLAYER_MAX_HP,
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

function dollarsFromCoins(n: number) {
  return n * COIN_TO_DOLLAR;
}

function loadAccounts(): Record<string, AccountData> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as Record<string, AccountData>;
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

function saveAccounts(map: Record<string, AccountData>) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function getAccount(user: string): AccountData | null {
  const map = loadAccounts();
  return map[user.toLowerCase()] ?? null;
}

function putAccount(acc: AccountData) {
  const map = loadAccounts();
  map[acc.user.toLowerCase()] = acc;
  saveAccounts(map);
}

function syncAccountFromRuntime() {
  if (!currentUser) return;
  const acc = getAccount(currentUser);
  if (!acc) return;
  acc.coins = inventory.coins;
  acc.owned = [...ownedCosmetics];
  acc.equipped = { ...equippedCosmetics };
  putAccount(acc);
}

function applyAccount(acc: AccountData) {
  currentUser = acc.user;
  inventory.coins = Math.max(0, Math.floor(acc.coins || 0));
  ownedCosmetics.clear();
  for (const id of acc.owned || []) {
    if (id in COSMETICS) ownedCosmetics.add(id);
  }
  for (const k of Object.keys(equippedCosmetics) as CosmeticSlot[]) {
    delete equippedCosmetics[k];
  }
  const eq = acc.equipped || {};
  for (const [slot, id] of Object.entries(eq) as [CosmeticSlot, CosmeticId][]) {
    if (id in COSMETICS && ownedCosmetics.has(id)) equippedCosmetics[slot] = id;
  }
  try {
    localStorage.setItem(SESSION_KEY, acc.user);
  } catch {
    /* ignore */
  }
}

function loadSave() {
  // migrate v1 coins if no session
  try {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      const acc = getAccount(session);
      if (acc) {
        applyAccount(acc);
        return;
      }
    }
    const raw = localStorage.getItem("wtm_save_v1") || localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw) as {
      coins?: number;
      owned?: string[];
      equipped?: unknown;
    };
    if (typeof data.coins === "number" && data.coins >= 0) {
      inventory.coins = Math.floor(data.coins);
    }
    if (Array.isArray(data.owned)) {
      for (const id of data.owned) {
        if (typeof id === "string" && id in COSMETICS) {
          ownedCosmetics.add(id as CosmeticId);
        }
      }
    }
  } catch {
    /* ignore */
  }
}

function saveProgress() {
  syncAccountFromRuntime();
  try {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        coins: inventory.coins,
        owned: [...ownedCosmetics],
        equipped: equippedCosmetics,
        user: currentUser,
      }),
    );
  } catch {
    /* ignore */
  }
}

function addCoins(n: number) {
  inventory.coins = Math.max(0, inventory.coins + n);
  saveProgress();
  updateHud();
  refreshShopUi();
  refreshTitleWallet();
}

function refreshTitleWallet() {
  const d = dollarsFromCoins(inventory.coins);
  titleWallet.textContent = `${inventory.coins} coin · $${d}`;
}

function rollShopChestLoot(id: ShopChestId): LootEntry {
  const table = SHOP_CHESTS[id].loot;
  const total = table.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const e of table) {
    r -= e.weight;
    if (r <= 0) return e;
  }
  return table[table.length - 1]!;
}

function openShop() {
  closeLobby();
  closeSettings();
  shopPanel.classList.add("open");
  shopPanel.setAttribute("aria-hidden", "false");
  refreshShopUi();
  beep(440, 0.05, "sine", 0.025);
}

function closeShop() {
  shopPanel.classList.remove("open");
  shopPanel.setAttribute("aria-hidden", "true");
}

function fillGuideUi() {
  const weaponLines: { id: WeaponId; how: string }[] = [
    { id: "fist", how: "Yakın dövüş. Zayıf ama her zaman hazır." },
    { id: "knife", how: "Hızlı yakın kesik. Düşük hasar, kısa cooldown." },
    { id: "axe", how: "Ağır yakın savuş. Yavaş ama yumruktan sert." },
    { id: "rifle", how: "Uzaktan mermi. Mermi sınırlı (max 5) — israf etme." },
    { id: "sword", how: "Güçlü yakın kılıç. Dengeli menzil ve hasar." },
    { id: "lava", how: "Ateş mermisi fırlatır. Orta menzil, yanık hasarı." },
    { id: "staff", how: "Büyü topu. En güçlü silahlardan; sandıktan nadir." },
  ];
  guideWeapons.innerHTML = weaponLines
    .map(
      (w) =>
        `<div class="guide-row"><strong>${WEAPONS[w.id].label} · ${WEAPON_BASE[w.id]} hasar</strong><span>${w.how}</span></div>`,
    )
    .join("");
  guidePotions.innerHTML = (
    Object.keys(POTIONS) as PotionId[]
  )
    .map((id) => {
      const p = POTIONS[id];
      const use = POTION_USE[id];
      const how =
        use === "drink"
          ? "C ile iç."
          : use === "throw"
            ? "C ile düşmana doğru at."
            : "C ile yere bırak / eşyanın üstüne dök.";
      return `<div class="guide-row"><strong>${p.label}</strong><span>${p.hint} · ${how}</span></div>`;
    })
    .join("");
}

function openSettings() {
  closeShop();
  closeLobby();
  fillGuideUi();
  settingsPanel.classList.add("open");
  settingsPanel.setAttribute("aria-hidden", "false");
  beep(360, 0.05, "sine", 0.02);
}

function closeSettings() {
  settingsPanel.classList.remove("open");
  settingsPanel.setAttribute("aria-hidden", "true");
}

function openLobby() {
  if (!currentUser) {
    showHint("Önce giriş yap");
    return;
  }
  closeShop();
  closeSettings();
  lobbyPanel.classList.add("open");
  lobbyPanel.setAttribute("aria-hidden", "false");
  refreshLobbyUi();
  beep(400, 0.05, "triangle", 0.02);
}
function closeLobby() {
  lobbyPanel.classList.remove("open");
  lobbyPanel.setAttribute("aria-hidden", "true");
}

function grantCosmetic(id: CosmeticId) {
  ownedCosmetics.add(id);
  const slot = COSMETICS[id].slot;
  equippedCosmetics[slot] = id;
  saveProgress();
  drawProfileFace();
}

function buyChest(id: ShopChestId) {
  if (!currentUser) {
    showHint("Mağaza için giriş gerekli");
    return;
  }
  const item = SHOP_CHESTS[id];
  if (inventory.coins < item.priceCoins) {
    showHint(`Yetersiz coin · ${item.priceCoins} lazım ($${item.priceUsd})`);
    beep(90, 0.08, "square", 0.025);
    return;
  }
  inventory.coins -= item.priceCoins;
  const drop = rollShopChestLoot(id);
  saveProgress();
  refreshShopUi();
  updateHud();
  refreshTitleWallet();
  sfxPickup();
  if (!drop.id) {
    showStory(`${item.label} açıldı… BOŞ çıktı!`);
    showHint("Şanssız — boş sandık");
    return;
  }
  grantCosmetic(drop.id);
  showStory(`${item.label} açıldı! → ${drop.label}`);
  showHint(`Kazandın: ${drop.label}`);
}

function equipCosmetic(id: CosmeticId) {
  if (!ownedCosmetics.has(id)) {
    showHint("Önce sandıktan aç");
    return;
  }
  const def = COSMETICS[id];
  if (equippedCosmetics[def.slot] === id) {
    delete equippedCosmetics[def.slot];
  } else {
    equippedCosmetics[def.slot] = id;
  }
  saveProgress();
  refreshShopUi();
  drawProfileFace();
  beep(520, 0.05, "triangle", 0.02);
  showHint(`${def.label} ${equippedCosmetics[def.slot] === id ? "kuşanıldı" : "çıkarıldı"}`);
}

function drawShopChestArt(
  c: CanvasRenderingContext2D,
  theme: ShopChestId,
  w: number,
  h: number,
) {
  c.clearRect(0, 0, w, h);
  if (theme === "detroit") {
    const g = c.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#0a1828");
    g.addColorStop(0.5, "#1a3a58");
    g.addColorStop(1, "#0e2030");
    c.fillStyle = g;
    c.fillRect(8, 22, w - 16, h - 30);
    c.fillStyle = "#4aa8ff";
    c.globalAlpha = 0.55 + Math.sin(Date.now() / 200) * 0.2;
    c.fillRect(12, 36, w - 24, 4);
    c.globalAlpha = 1;
    c.fillStyle = "#7ad0ff";
    c.fillRect(w / 2 - 8, 28, 16, 8);
    c.strokeStyle = "#3a90c0";
    c.lineWidth = 2;
    c.strokeRect(8, 22, w - 16, h - 30);
    c.fillStyle = "#9ad1ff";
    c.font = "8px monospace";
    c.fillText("DETROIT", 18, 18);
  } else if (theme === "google") {
    c.fillStyle = "#f4f0e6";
    c.fillRect(10, 28, w - 20, h - 36);
    c.strokeStyle = "#dadce0";
    c.lineWidth = 2;
    c.strokeRect(10, 28, w - 20, h - 36);
    const cols = ["#ea4335", "#fbbc05", "#34a853", "#4285f4"];
    for (let i = 0; i < 4; i++) {
      c.fillStyle = cols[i]!;
      c.beginPath();
      c.arc(22 + i * 14, 18, 6, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = "#4285f4";
    c.font = "bold 10px sans-serif";
    c.fillText("G", w / 2 - 5, 52);
  } else if (theme === "knight") {
    c.fillStyle = "#6a7888";
    c.fillRect(10, 26, w - 20, h - 34);
    c.fillStyle = "#8a949e";
    c.fillRect(14, 32, w - 28, 10);
    c.fillStyle = "#3a5040";
    c.fillRect(12, 18, w - 24, 12);
    c.fillStyle = "#5dff7a";
    for (let i = 0; i < 5; i++) {
      c.fillRect(16 + i * 12, 14, 3, 8);
    }
    // daisy
    c.fillStyle = "#ffe08a";
    c.beginPath();
    c.arc(w / 2, 16, 5, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#fff";
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      c.beginPath();
      c.arc(w / 2 + Math.cos(a) * 7, 16 + Math.sin(a) * 7, 3, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = "#d4a017";
    c.fillRect(w / 2 - 6, 48, 12, 8);
  } else {
    const cols = ["#ff3a3a", "#fbbc05", "#34a853", "#4285f4", "#9146ff"];
    for (let i = 0; i < 5; i++) {
      c.fillStyle = cols[i]!;
      c.fillRect(8 + i * ((w - 16) / 5), 24, (w - 16) / 5, h - 32);
    }
    c.fillStyle = "#f5c518";
    c.beginPath();
    c.arc(w / 2, 18, 12, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#111";
    c.font = "bold 9px sans-serif";
    c.fillText("$", w / 2 - 3, 21);
    c.strokeStyle = "#111";
    c.strokeRect(8, 24, w - 16, h - 32);
  }
}

function refreshShopUi() {
  refreshTitleWallet();
  const d = dollarsFromCoins(inventory.coins);
  shopBalance.textContent = `Bakiye: ${inventory.coins} coin · $${d}`;

  shopList.innerHTML = "";
  for (const id of Object.keys(SHOP_CHESTS) as ShopChestId[]) {
    const item = SHOP_CHESTS[id];
    const el = document.createElement("div");
    el.className = "shop-item shop-chest-item";
    const canvas = document.createElement("canvas");
    canvas.width = 88;
    canvas.height = 72;
    canvas.className = "chest-art";
    drawShopChestArt(canvas.getContext("2d")!, id, 88, 72);
    const odds = item.loot
      .map((e) => `%${e.weight} ${e.label}`)
      .join(" · ");
    el.innerHTML = `
      <div class="chest-art-wrap"></div>
      <h4>${item.label}</h4>
      <div class="price">${item.priceCoins} coin<br>$${item.priceUsd}</div>
      <p>${item.blurb}<br><span class="odds">${odds}</span></p>
      <button type="button">AÇ (${item.priceCoins})</button>
    `;
    el.querySelector(".chest-art-wrap")!.appendChild(canvas);
    el.querySelector("button")!.addEventListener("click", () => buyChest(id));
    shopList.appendChild(el);
  }

  costumeList.innerHTML = "";
  if (ownedCosmetics.size === 0) {
    const empty = document.createElement("p");
    empty.className = "shop-empty";
    empty.textContent = "Henüz parça yok — sandık aç.";
    costumeList.appendChild(empty);
  }
  for (const id of ownedCosmetics) {
    const c = COSMETICS[id];
    const on = equippedCosmetics[c.slot] === id;
    const el = document.createElement("div");
    el.className = `costume-item${on ? " equipped" : ""}`;
    el.innerHTML = `
      <h4>${c.label}</h4>
      ${on ? '<span class="tag">KUŞANILI</span>' : '<button type="button">KUŞAN</button>'}
      <p>Slot: ${c.slot}</p>
    `;
    const btn = el.querySelector("button");
    if (btn) btn.addEventListener("click", () => equipCosmetic(id));
    costumeList.appendChild(el);
  }
}

function normalizeUser(s: string) {
  return s.trim().slice(0, 16);
}

function registerAccount() {
  const user = normalizeUser(authUserInput.value);
  const pass = authPassInput.value.slice(0, 32);
  if (user.length < 2) {
    authStatus.textContent = "Kullanıcı adı en az 2 karakter";
    return;
  }
  if (pass.length < 2) {
    authStatus.textContent = "Parola en az 2 karakter";
    return;
  }
  if (getAccount(user)) {
    authStatus.textContent = "Bu isim alınmış — giriş yap";
    return;
  }
  const acc: AccountData = {
    user,
    pass,
    coins: Math.max(inventory.coins, 50),
    owned: [...ownedCosmetics],
    equipped: { ...equippedCosmetics },
    friends: [],
    incoming: [],
    outgoing: [],
  };
  putAccount(acc);
  applyAccount(acc);
  authStatus.textContent = `Kayıt OK · ${user}`;
  refreshFriendsUi();
  refreshTitleWallet();
  drawProfileFace();
  saveProgress();
  beep(660, 0.06, "sine", 0.03);
}

function loginAccount() {
  const user = normalizeUser(authUserInput.value);
  const pass = authPassInput.value.slice(0, 32);
  const acc = getAccount(user);
  if (!acc || acc.pass !== pass) {
    authStatus.textContent = "Kullanıcı / parola hatalı";
    beep(90, 0.08, "square", 0.025);
    return;
  }
  applyAccount(acc);
  authUserInput.value = acc.user;
  authStatus.textContent = `Giriş: ${acc.user}`;
  refreshFriendsUi();
  refreshShopUi();
  refreshTitleWallet();
  drawProfileFace();
  beep(520, 0.05, "triangle", 0.025);
}

function sendFriendRequest(target: string) {
  if (!currentUser) {
    showHint("Önce giriş yap");
    return;
  }
  const me = getAccount(currentUser);
  const them = getAccount(target);
  if (!me || !them) {
    showHint("Kullanıcı bulunamadı");
    return;
  }
  if (me.user.toLowerCase() === them.user.toLowerCase()) {
    showHint("Kendine istek atılmaz");
    return;
  }
  if (me.friends.includes(them.user)) {
    showHint("Zaten arkadaşsınız");
    return;
  }
  if (!them.incoming.includes(me.user)) them.incoming.push(me.user);
  if (!me.outgoing.includes(them.user)) me.outgoing.push(them.user);
  putAccount(me);
  putAccount(them);
  refreshFriendsUi();
  showHint(`İstek gönderildi: ${them.user}`);
}

function acceptFriend(from: string) {
  if (!currentUser) return;
  const me = getAccount(currentUser);
  const them = getAccount(from);
  if (!me || !them) return;
  me.incoming = me.incoming.filter((u) => u !== from);
  them.outgoing = them.outgoing.filter((u) => u !== me.user);
  if (!me.friends.includes(them.user)) me.friends.push(them.user);
  if (!them.friends.includes(me.user)) them.friends.push(me.user);
  putAccount(me);
  putAccount(them);
  refreshFriendsUi();
  showHint(`Arkadaş: ${them.user}`);
}

function rejectFriend(from: string) {
  if (!currentUser) return;
  const me = getAccount(currentUser);
  const them = getAccount(from);
  if (!me) return;
  me.incoming = me.incoming.filter((u) => u !== from);
  putAccount(me);
  if (them) {
    them.outgoing = them.outgoing.filter((u) => u !== me.user);
    putAccount(them);
  }
  refreshFriendsUi();
}

function searchFriends() {
  const q = normalizeUser(friendSearchInput.value).toLowerCase();
  friendSearchResults.innerHTML = "";
  if (!q) return;
  const map = loadAccounts();
  const hits = Object.values(map).filter((a) =>
    a.user.toLowerCase().includes(q),
  );
  if (!hits.length) {
    friendSearchResults.innerHTML = `<div class="friend-row">Sonuç yok</div>`;
    return;
  }
  for (const a of hits.slice(0, 8)) {
    const row = document.createElement("div");
    row.className = "friend-row";
    row.innerHTML = `<span>${a.user}</span><button type="button">Ekle</button>`;
    row.querySelector("button")!.addEventListener("click", () =>
      sendFriendRequest(a.user),
    );
    friendSearchResults.appendChild(row);
  }
}

function refreshFriendsUi() {
  friendRequestsEl.innerHTML = "";
  friendListEl.innerHTML = "";
  if (!currentUser) {
    friendRequestsEl.innerHTML = `<div class="friend-row">Giriş gerekli</div>`;
    friendListEl.innerHTML = `<div class="friend-row">—</div>`;
    return;
  }
  const me = getAccount(currentUser);
  if (!me) return;
  if (!me.incoming.length) {
    friendRequestsEl.innerHTML = `<div class="friend-row">İstek yok</div>`;
  }
  for (const from of me.incoming) {
    const row = document.createElement("div");
    row.className = "friend-row";
    row.innerHTML = `<span>${from}</span><button type="button" class="ok">Kabul</button><button type="button" class="no">Red</button>`;
    row.querySelector(".ok")!.addEventListener("click", () => acceptFriend(from));
    row.querySelector(".no")!.addEventListener("click", () => rejectFriend(from));
    friendRequestsEl.appendChild(row);
  }
  if (!me.friends.length) {
    friendListEl.innerHTML = `<div class="friend-row">Henüz arkadaş yok</div>`;
  }
  for (const f of me.friends) {
    const row = document.createElement("div");
    row.className = "friend-row";
    row.innerHTML = `<span>${f}</span>`;
    friendListEl.appendChild(row);
  }
  refreshLobbyUi();
}

function refreshLobbyUi() {
  lobbyInvites.innerHTML = lobbyInvited.length
    ? lobbyInvited.map((n) => `<span class="invite-chip">${n}</span>`).join("")
    : `<span class="invite-chip muted">Davet yok · bot doldurulur</span>`;
  lobbyFriendPick.innerHTML = "";
  if (!currentUser) return;
  const me = getAccount(currentUser);
  if (!me) return;
  for (const f of me.friends) {
    const on = lobbyInvited.includes(f);
    const row = document.createElement("div");
    row.className = "friend-row";
    row.innerHTML = `<span>${f}</span><button type="button">${on ? "Çıkar" : "Davet"}</button>`;
    row.querySelector("button")!.addEventListener("click", () => {
      if (on) lobbyInvited = lobbyInvited.filter((x) => x !== f);
      else if (lobbyInvited.length < 3) lobbyInvited.push(f);
      else showHint("Max +3 davet");
      refreshLobbyUi();
    });
    lobbyFriendPick.appendChild(row);
  }
  document.querySelector("#btn-mode-peaceful")!.classList.toggle(
    "active",
    lobbyModePick === "peaceful",
  );
  document.querySelector("#btn-mode-survivor")!.classList.toggle(
    "active",
    lobbyModePick === "survivor",
  );
}

function botNamePool(): string[] {
  return [
    "ShadowFox",
    "NeonKid",
    "BarRat",
    "IronToe",
    "PixelDuck",
    "LavaJay",
    "MistOwl",
    "CoinGoblin",
  ];
}

function closeRoomChannel() {
  try {
    roomChannel?.close();
  } catch {
    /* ignore */
  }
  roomChannel = null;
}

function openRoomChannel(code: string) {
  closeRoomChannel();
  roomCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
  if (!roomCode) {
    roomStatus.textContent = "Geçerli kod gir";
    return false;
  }
  try {
    roomChannel = new BroadcastChannel(`wtm_room_${roomCode}`);
  } catch {
    roomStatus.textContent = "Bu tarayıcı oda desteklemiyor";
    return false;
  }
  roomChannel.onmessage = (ev) => {
    const msg = ev.data as {
      type: string;
      from?: string;
      mode?: "peaceful" | "survivor";
      guests?: string[];
      peer?: Partial<MpPeer> & { name: string };
    };
    if (!msg || msg.from === currentUser) return;
    if (msg.type === "hello" && roomRole === "host" && msg.from) {
      remoteHumanNames.add(msg.from);
      roomStatus.textContent = `Oda ${roomCode} · katılan: ${[...remoteHumanNames].join(", ") || "—"}`;
      roomChannel?.postMessage({
        type: "welcome",
        from: currentUser,
        peers: [...remoteHumanNames, currentUser],
      });
    }
    if (msg.type === "welcome" && roomRole === "guest") {
      roomStatus.textContent = `Odaya girildi: ${roomCode}`;
    }
    if (msg.type === "start" && roomRole === "guest" && msg.mode) {
      playMode = msg.mode;
      lobbyModePick = msg.mode;
      const guests = (msg.guests || []).filter((g) => g !== currentUser);
      // ensure host name appears as peer
      if (msg.from && !guests.includes(msg.from) && msg.from !== currentUser) {
        guests.unshift(msg.from);
      }
      closeLobby();
      startGameWithMode(playMode, guests.slice(0, 3));
      // mark remote humans
      for (const p of mpPeers) {
        if (!p.isLocal && remoteHumanNames.has(p.name)) p.isBot = false;
        if (!p.isLocal && p.name === msg.from) p.isBot = false;
      }
    }
    if (msg.type === "state" && msg.peer && playMode !== "solo") {
      const p = mpPeers.find((x) => x.name === msg.peer!.name && !x.isLocal);
      if (!p) return;
      p.isBot = false;
      Object.assign(p, {
        x: msg.peer.x ?? p.x,
        y: msg.peer.y ?? p.y,
        vx: msg.peer.vx ?? p.vx,
        vy: msg.peer.vy ?? p.vy,
        hp: msg.peer.hp ?? p.hp,
        facing: msg.peer.facing ?? p.facing,
        alive: msg.peer.alive ?? p.alive,
        invuln: msg.peer.invuln ?? p.invuln,
      });
    }
    if (msg.type === "dead" && msg.from) {
      const p = mpPeers.find((x) => x.name === msg.from);
      if (p) {
        p.alive = false;
        p.hp = 0;
        checkMpRoundEnd();
      }
    }
  };
  roomStatus.textContent = `Oda ${roomCode} hazır (${roomRole})`;
  roomCodeInput.value = roomCode;
  return true;
}

function hostRoom() {
  if (!currentUser) {
    showHint("Önce giriş yap");
    return;
  }
  roomRole = "host";
  remoteHumanNames.clear();
  const code =
    roomCodeInput.value.trim() ||
    `W${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  if (!openRoomChannel(code)) return;
  roomChannel?.postMessage({ type: "hosting", from: currentUser });
  showHint(`Oda kuruldu: ${roomCode} — arkadaşın KATIL desin`);
}

function joinRoom() {
  if (!currentUser) {
    showHint("Önce giriş yap");
    return;
  }
  roomRole = "guest";
  remoteHumanNames.clear();
  const code = roomCodeInput.value.trim();
  if (!code) {
    roomStatus.textContent = "Kod yaz";
    return;
  }
  if (!openRoomChannel(code)) return;
  roomChannel?.postMessage({ type: "hello", from: currentUser });
  showHint(`Katılma isteği: ${roomCode}`);
}

function broadcastLocalState() {
  if (!roomChannel || playMode === "solo" || !currentUser) return;
  roomChannel.postMessage({
    type: "state",
    from: currentUser,
    peer: {
      name: currentUser,
      x: player.x,
      y: player.y,
      vx: player.vx,
      vy: player.vy,
      hp: player.hp,
      facing,
      alive: state === "playing" && player.hp > 0,
      invuln,
    },
  });
}

function startLobbyMatch() {
  if (!currentUser) {
    showHint("Önce giriş yap");
    return;
  }
  if (roomRole === "guest") {
    showHint("Misafirsin — host LOBİYİ BAŞLAT basmalı");
    return;
  }
  playMode = lobbyModePick;
  // prefer real room joiners, then invited friends, then bots
  const humans = [...remoteHumanNames].filter((n) => n !== currentUser);
  for (const n of lobbyInvited) {
    if (!humans.includes(n) && humans.length < 3) humans.push(n);
  }
  const guests =
    humans.length >= 3 ? humans.slice(0, 3) : fillLobbyRosterFrom(humans);
  closeLobby();
  if (roomChannel && roomCode) {
    roomChannel.postMessage({
      type: "start",
      from: currentUser,
      mode: playMode,
      guests: [currentUser, ...guests],
    });
  }
  startGameWithMode(playMode, guests);
  for (const p of mpPeers) {
    if (!p.isLocal && remoteHumanNames.has(p.name)) p.isBot = false;
  }
}

function fillLobbyRosterFrom(preferred: string[]): string[] {
  const names = [...preferred];
  const pool = botNamePool().filter(
    (n) => !names.includes(n) && n !== currentUser,
  );
  while (names.length < 3) {
    names.push(pool.shift() || `Bot${names.length + 1}`);
  }
  return names.slice(0, 3);
}

function startGameWithMode(mode: PlayMode, guests: string[] = []) {
  ensureAudio();
  playMode = mode;
  survivorSettled = false;
  returningToHub = false;
  spectateTarget = null;
  spectateBanner.hidden = true;
  titleEl.classList.add("hidden");
  wrap.classList.add("playing");
  hideOverlay();
  resetGame();
  setupMultiplayer(guests);
  updateModeTag();
  state = dialogQueue.length ? "dialog" : "playing";
  if (state === "dialog") showDialogLine();
}

function updateModeTag() {
  if (playMode === "solo") {
    modeTag.textContent = "";
    modeTag.dataset.mode = "";
  } else if (playMode === "peaceful") {
    modeTag.textContent = "PEACEFUL · PvP YOK · 12 BAR";
    modeTag.dataset.mode = "peaceful";
  } else {
    modeTag.textContent = "SURVIVOR · PvP · SON KALAN";
    modeTag.dataset.mode = "survivor";
  }
}

function setupMultiplayer(guests: string[]) {
  mpPeers.length = 0;
  if (playMode === "solo") return;
  const palette = ["#7ab0ff", "#ff7ad9", "#7dffb3", "#f5c518"];
  mpPeers.push({
    name: currentUser || "Sen",
    isLocal: true,
    isBot: false,
    x: player.x,
    y: player.y,
    w: player.w,
    h: player.h,
    vx: 0,
    vy: 0,
    hp: player.hp,
    maxHp: player.maxHp,
    facing: 1,
    alive: true,
    invuln: 0,
    attackCd: 0,
    onGround: true,
    color: palette[0]!,
  });
  guests.forEach((name, i) => {
    mpPeers.push({
      name,
      isLocal: false,
      isBot: true,
      x: player.x + 40 + i * 36,
      y: player.y,
      w: 30,
      h: 52,
      vx: 0,
      vy: 0,
      hp: PLAYER_MAX_HP,
      maxHp: PLAYER_MAX_HP,
      facing: 1,
      alive: true,
      invuln: 0,
      attackCd: 0,
      onGround: true,
      color: palette[(i + 1) % palette.length]!,
    });
  });
}

function syncLocalPeer() {
  const local = mpPeers.find((p) => p.isLocal);
  if (!local) return;
  local.x = player.x;
  local.y = player.y;
  local.vx = player.vx;
  local.vy = player.vy;
  local.hp = player.hp;
  local.facing = facing;
  local.alive = player.hp > 0 && state !== "spectate";
  local.invuln = invuln;
}

function alivePeers() {
  return mpPeers.filter((p) => p.alive);
}

function returnToHub(msg?: string) {
  if (returningToHub) return;
  returningToHub = true;
  playMode = "solo";
  mpPeers.length = 0;
  // keep room channel so rematch possible; clear match flags
  spectateTarget = null;
  spectateBanner.hidden = true;
  state = "title";
  wrap.classList.remove("playing");
  titleEl.classList.remove("hidden");
  hideOverlay();
  saveProgress();
  refreshFriendsUi();
  refreshTitleWallet();
  drawProfileFace();
  updateModeTag();
  if (msg) showHint(msg);
  returningToHub = false;
}

function enterSpectate(reason: string) {
  state = "spectate";
  player.hp = 0;
  spectateBanner.hidden = false;
  spectateBanner.textContent = `İZLEME MODU — ${reason}`;
  if (roomChannel && currentUser) {
    roomChannel.postMessage({ type: "dead", from: currentUser });
  }
  const others = alivePeers().filter((p) => !p.isLocal);
  spectateTarget = others[0]?.name ?? null;
  hideOverlay();
  checkMpRoundEnd();
}

function checkMpRoundEnd() {
  if (playMode === "solo" || survivorSettled) return;
  const alive = alivePeers();
  if (alive.length === 0) {
    returnToHub("Herkes öldü — lobiye dönüş");
    return;
  }
  if (playMode === "survivor" && alive.length === 1) {
    survivorSettled = true;
    const winner = alive[0]!;
    for (const p of mpPeers) {
      if (p.name === winner.name) {
        if (p.isLocal) addCoins(5);
      } else if (p.isLocal) {
        addCoins(-2);
      }
    }
    const msg = winner.isLocal
      ? "SURVIVOR kazandın! +5 coin"
      : `Kazanan: ${winner.name} · sen -2 coin`;
    showStory(msg);
    setTimeout(() => returnToHub(msg), 2200);
  }
}

function hurtPeer(p: MpPeer, raw: number, knock: number) {
  if (!p.alive || p.invuln > 0) return;
  p.hp -= Math.max(1, Math.round(raw));
  p.invuln = 0.7;
  p.vx = knock;
  p.vy = -220;
  burst(p.x + p.w / 2, p.y + p.h / 2, "#ff6b6b", 8);
  if (p.hp <= 0) {
    p.alive = false;
    p.hp = 0;
    burst(p.x + p.w / 2, p.y + p.h / 2, "#fff", 16);
    if (p.isLocal) enterSpectate("öldün · diğerlerini izle");
    else showHint(`${p.name} düştü`);
    checkMpRoundEnd();
  }
}

function tryPvpAttack() {
  if (playMode !== "survivor" || state !== "playing") return;
  const box = attackBox();
  if (!box) return;
  for (const p of mpPeers) {
    if (p.isLocal || !p.alive) continue;
    if (aabb(box, p)) {
      hurtPeer(p, 55 + WEAPON_BASE[equippedWeapon()] * 0.15, facing * 220);
    }
  }
}

function updateBots(dt: number) {
  if (playMode === "solo") return;
  syncLocalPeer();
  roomSyncAcc += dt;
  if (roomSyncAcc >= 0.1) {
    roomSyncAcc = 0;
    broadcastLocalState();
  }
  for (const p of mpPeers) {
    if (!p.alive) continue;
    p.invuln = Math.max(0, p.invuln - dt);
    p.attackCd = Math.max(0, p.attackCd - dt);
    if (p.isLocal) continue;
    if (!p.isBot) continue; // remote human — driven by room sync

    // simple physics
    p.vy += GRAVITY * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.y + p.h >= GROUND_Y) {
      p.y = GROUND_Y - p.h;
      p.vy = 0;
      p.onGround = true;
    } else p.onGround = false;
    p.x = Math.max(40, Math.min(WORLD_W - 60, p.x));

    let targetX = player.x;
    if (playMode === "survivor") {
      // hunt nearest living non-self
      let best: MpPeer | null = null;
      let bestD = Infinity;
      for (const o of mpPeers) {
        if (o === p || !o.alive) continue;
        const d = Math.abs(o.x - p.x);
        if (d < bestD) {
          bestD = d;
          best = o;
        }
      }
      // also pressure toward local player
      if (best) targetX = best.x;
    } else {
      // peaceful: chase nearest enemy
      let bestE: Enemy | null = null;
      let bestD = Infinity;
      for (const e of enemies) {
        if (!e.alive) continue;
        const d = Math.abs(e.x - p.x);
        if (d < bestD) {
          bestD = d;
          bestE = e;
        }
      }
      if (bestE) targetX = bestE.x;
      else targetX = player.x;
    }

    const dx = targetX - p.x;
    p.facing = dx >= 0 ? 1 : -1;
    p.vx = Math.sign(dx) * MOVE * 0.72;
    if (Math.abs(dx) < 40) p.vx *= 0.2;
    if (p.onGround && Math.random() < 0.008) p.vy = -JUMP * 0.85;

    // attack enemies
    if (p.attackCd <= 0) {
      for (const e of enemies) {
        if (!e.alive) continue;
        if (Math.abs(e.x - p.x) < 42 && Math.abs(e.y - p.y) < 40) {
          damageEnemy(e, 40, p.x);
          p.attackCd = 0.45;
          break;
        }
      }
    }
    // survivor PvP vs local / others
    if (playMode === "survivor" && p.attackCd <= 0) {
      for (const o of mpPeers) {
        if (o === p || !o.alive) continue;
        if (Math.abs(o.x - p.x) < 38 && Math.abs(o.y - p.y) < 40) {
          if (o.isLocal) hurtPlayer(45, p.facing * 200);
          else hurtPeer(o, 45, p.facing * 200);
          p.attackCd = 0.55;
          break;
        }
      }
    }
  }

  // camera follow spectate
  if (state === "spectate") {
    const t =
      mpPeers.find((p) => p.name === spectateTarget && p.alive) ||
      alivePeers()[0];
    if (t) {
      camX = t.x + t.w / 2 - W * 0.35;
      camX = Math.max(0, Math.min(camX, WORLD_W - W));
    }
  }
}

function drawMpPeers() {
  for (const p of mpPeers) {
    if (p.isLocal || !p.alive) continue;
    const x = p.x - camX;
    const y = p.y;
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(x + 15, y + p.h + 2, 13, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.color;
    ctx.fillRect(x + 5, y + 14, 20, 30);
    ctx.fillStyle = "#e8b896";
    ctx.fillRect(x + 8, y + 2, 14, 13);
    ctx.fillStyle = "#1a1a22";
    ctx.fillRect(x + 10, y + 7, 3, 3);
    ctx.fillRect(x + 16, y + 7, 3, 3);
    ctx.fillStyle = p.color;
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(p.name, x + 15, y - 6);
    ctx.textAlign = "left";
    // hp pip
    ctx.fillStyle = "#1a1010";
    ctx.fillRect(x, y - 12, 30, 4);
    ctx.fillStyle = "#e04040";
    ctx.fillRect(x, y - 12, 30 * (p.hp / p.maxHp), 4);
  }
}

function drawProfileFace() {
  const c = profileFace.getContext("2d")!;
  const w = profileFace.width;
  const h = profileFace.height;
  c.clearRect(0, 0, w, h);
  c.fillStyle = "#121a2c";
  c.fillRect(0, 0, w, h);
  const look = resolveLook();
  const s = w / 72;
  c.save();
  c.scale(s, s);
  // head (drawn in 72x72 space, scaled up)
  c.fillStyle = look.skin;
  c.fillRect(22, 18, 28, 28);
  c.fillStyle = look.helm;
  c.fillRect(18, 12, 36, 14);
  c.fillStyle = look.accent;
  c.fillRect(18, 26, 36, 3);
  c.fillStyle = "#1a1a22";
  c.fillRect(28, 30, 5, 5);
  c.fillRect(40, 30, 5, 5);
  // shoulders hint so profile feels like character
  c.fillStyle = look.body;
  c.fillRect(16, 48, 40, 18);
  c.fillStyle = look.accent;
  c.fillRect(16, 54, 40, 3);
  applyCosmeticOverlays(c, 21, 16, 1, true);
  c.restore();
  c.strokeStyle = "#3d5a80";
  c.lineWidth = 3;
  c.strokeRect(1, 1, w - 2, h - 2);
}

function resolveLook() {
  const look = { ...DEFAULT_LOOK };
  const body = equippedCosmetics.body;
  const pants = equippedCosmetics.pants;
  const boots = equippedCosmetics.boots;
  const helm = equippedCosmetics.helm;
  const skin = equippedCosmetics.skin;
  if (body === "elec_tshirt") {
    look.body = COSMETICS.elec_tshirt.colors.body!;
    look.accent = COSMETICS.elec_tshirt.colors.accent!;
  } else if (body === "google_hoodie") {
    look.body = COSMETICS.google_hoodie.colors.body!;
    look.accent = COSMETICS.google_hoodie.colors.y!;
  } else if (body === "diamond_chest") {
    look.body = COSMETICS.diamond_chest.colors.body!;
    look.accent = COSMETICS.diamond_chest.colors.shine!;
  } else if (body === "rainbow_tux") {
    look.body = COSMETICS.rainbow_tux.colors.d!;
    look.accent = COSMETICS.rainbow_tux.colors.a!;
  }
  if (pants === "ig_pants") look.pants = COSMETICS.ig_pants.colors.b!;
  else if (pants === "metal_armor_pants")
    look.pants = COSMETICS.metal_armor_pants.colors.pants!;
  if (boots === "grey_shoes") look.boots = COSMETICS.grey_shoes.colors.boots!;
  else if (boots === "twitch_shoes")
    look.boots = COSMETICS.twitch_shoes.colors.boots!;
  else if (boots === "gold_armor_boots")
    look.boots = COSMETICS.gold_armor_boots.colors.boots!;
  if (helm === "pink_heart_crown")
    look.helm = COSMETICS.pink_heart_crown.colors.crown!;
  else if (helm === "elec_poop") look.helm = COSMETICS.elec_poop.colors.brown!;
  else if (helm === "obsidian_helm")
    look.helm = COSMETICS.obsidian_helm.colors.helm!;
  if (skin === "youtube_skin") look.skin = COSMETICS.youtube_skin.colors.skin!;
  else if (skin === "rainbow_skin")
    look.skin = COSMETICS.rainbow_skin.colors.a!;
  if (equippedCosmetics.cape === "elec_tattoo")
    look.cape = COSMETICS.elec_tattoo.colors.ink!;
  return look;
}

function applyCosmeticOverlays(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  facingDir: 1 | -1,
  faceOnly = false,
) {
  const t = typeof time === "number" ? time : 0;
  const face = equippedCosmetics.face;
  const helm = equippedCosmetics.helm;
  const hands = equippedCosmetics.hands;
  const held = equippedCosmetics.held;
  const body = equippedCosmetics.body;

  if (face === "blue_laser_glasses") {
    c.fillStyle = "#0a1a30";
    c.fillRect(x + 8, y + 6, 14, 5);
    c.fillStyle = "#3a90ff";
    c.fillRect(x + 9, y + 7, 5, 3);
    c.fillRect(x + 16, y + 7, 5, 3);
    c.fillStyle = `rgba(106,176,255,${0.4 + Math.sin(t * 10) * 0.3})`;
    c.fillRect(x + (facingDir > 0 ? 22 : -10), y + 8, 12, 2);
  }
  if (face === "red_bowtie") {
    c.fillStyle = "#e04040";
    c.beginPath();
    c.moveTo(x + 15, y + 14);
    c.lineTo(x + 8, y + 18);
    c.lineTo(x + 15, y + 17);
    c.lineTo(x + 22, y + 18);
    c.closePath();
    c.fill();
  }
  if (helm === "elec_poop") {
    c.fillStyle = "#6a4020";
    c.beginPath();
    c.ellipse(x + 15, y - 6, 8, 6, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = `rgba(74,168,255,${0.5 + Math.sin(t * 8) * 0.3})`;
    c.fillRect(x + 12, y - 10, 6, 3);
  }
  if (helm === "pink_heart_crown") {
    c.fillStyle = "#ff7ad9";
    c.fillRect(x + 6, y - 6, 18, 6);
    c.fillStyle = "#ff3a8a";
    c.beginPath();
    c.moveTo(x + 15, y - 14);
    c.lineTo(x + 10, y - 8);
    c.lineTo(x + 20, y - 8);
    c.fill();
  }
  if (helm === "obsidian_helm") {
    c.fillStyle = "#1a1020";
    c.fillRect(x + 5, y - 4, 20, 14);
    c.fillStyle = helmOpen ? "#4a2060" : "#1a1020";
    c.fillRect(x + 8, y + 2, 14, 5);
    if (Math.floor(t * 2) % 6 === 0) helmOpen = !helmOpen;
  }
  if (faceOnly) return;

  if (body === "google_hoodie") {
    const cols = ["#ea4335", "#fbbc05", "#34a853", "#4285f4"];
    for (let i = 0; i < 4; i++) {
      c.fillStyle = cols[i]!;
      c.fillRect(x + 8 + i * 4, y + 16, 3, 3);
    }
  }
  if (body === "elec_tshirt") {
    c.fillStyle = `rgba(74,168,255,${0.45 + Math.sin(t * 8) * 0.35})`;
    c.fillRect(x + 7, y + 18, 16, 2);
  }
  if (body === "rainbow_tux") {
    const cols = ["#ff3a3a", "#fbbc05", "#34a853", "#4285f4", "#9146ff"];
    for (let i = 0; i < 5; i++) {
      c.fillStyle = cols[i]!;
      c.fillRect(x + 5 + i * 4, y + 14, 4, 18);
    }
  }
  if (body === "diamond_chest") {
    c.fillStyle = "#e8f6ff";
    c.fillRect(x + 12, y + 18, 6, 6);
  }
  if (equippedCosmetics.pants === "ig_pants") {
    const cols = ["#f58529", "#dd2a7b", "#8134af", "#515bd4"];
    for (let i = 0; i < 4; i++) {
      c.fillStyle = cols[i]!;
      c.fillRect(x + 7, y + 30 + i * 3, 16, 3);
    }
  }
  if (hands === "emerald_gloves") {
    c.fillStyle = "#2ecc71";
    c.fillRect(x + 2, y + 22, 6, 8);
    c.fillRect(x + 22, y + 22, 6, 8);
  }
  if (held === "slot_token") {
    c.fillStyle = "#f5c518";
    c.beginPath();
    c.arc(x + (facingDir > 0 ? 28 : 2), y + 24, 6, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#111";
    c.font = "8px sans-serif";
    c.fillText("7", x + (facingDir > 0 ? 25 : -1), y + 27);
  }
  if (equippedCosmetics.boots === "twitch_shoes") {
    c.fillStyle = "#fff";
    c.fillRect(x + 7, y + 46, 4, 3);
    c.fillRect(x + 19, y + 46, 4, 3);
  }
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

type LootReveal = {
  t: number;
  duration: number;
  loot: LootResult;
  label: string;
  granted: boolean;
};
let lootReveal: LootReveal | null = null;

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
    bruiser: { w: 34, h: 50 },
    bat: { w: 30, h: 22 },
  };
  const s = sizes[kind];
  const hp = normalHp();
  enemies.push({
    kind,
    name: kind === "goblin" ? "Goblin" : kind === "bruiser" ? "Sopacı" : "Yarasa",
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

function buildInteriorsMeta(barXs: number[]) {
  for (const k of Object.keys(interiors)) delete interiors[k];
  barXs.forEach((barX, i) => {
    const id = `bar${i}`;
    interiors[id] = {
      id,
      title: barXs.length > 1 ? `Kör Fare Bar ${i + 1}` : "Kör Fare Bar",
      kind: "bar",
      exitX: 80,
      returnX: barX + 50,
      returnY: GROUND_Y - 52,
    };
  });
}

function buildInteriorRoom(def: InteriorDef) {
  interiorPlatforms.length = 0;
  chest = null;
  parchmentShown = false;
  lootReveal = null;
  interiorPlatforms.push({ x: 0, y: GROUND_Y, w: INTERIOR_W, h: 24 });
  // Climbable one-way staircase to upstairs chest
  interiorPlatforms.push({ x: 160, y: 368, w: 150, h: 18, oneWay: true });
  interiorPlatforms.push({ x: 380, y: 310, w: 160, h: 18, oneWay: true });
  interiorPlatforms.push({ x: 620, y: 250, w: 180, h: 18, oneWay: true });

  if (def.kind === "bar") {
    let save = barChestSaves[def.id];
    if (!save) {
      const ctype = rollChestType();
      save = {
        type: ctype,
        opened: false,
        isParchment: ctype === "none",
        parchmentShown: false,
      };
      barChestSaves[def.id] = save;
    }
    chest = {
      x: 690,
      y: 198,
      w: 56,
      h: 44,
      type: save.type,
      opened: save.opened,
      isParchment: save.isParchment,
    };
    parchmentShown = save.parchmentShown;
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
  barChestSaves = {};
  levelClearPending = false;

  // Longer maps so boss is farther / run lasts more
  // Multiplayer modes: 12 bars (6x normal density) + wider map
  const mpBars = playMode !== "solo";
  WORLD_W = mpBars ? 7200 + level * 320 : 4200 + level * 260;

  const barCount = mpBars ? 12 : 2;
  const barXs: number[] = [];
  for (let bi = 0; bi < barCount; bi++) {
    barXs.push(
      Math.floor(220 + (bi / Math.max(1, barCount - 1)) * (WORLD_W - 900)),
    );
  }
  buildInteriorsMeta(barXs);

  // Ground: full collision
  addPlat(0, GROUND_Y, WORLD_W, 24, false);

  // Climbable routes + mid/late platforms before the boss
  const airPlats: Plat[] = [
    { x: 200, y: 368, w: 120, h: 24, oneWay: true },
    { x: 380, y: 308, w: 110, h: 24, oneWay: true },
    { x: Math.floor(WORLD_W * 0.18), y: 248, w: 130, h: 24, oneWay: true },
    { x: Math.floor(WORLD_W * 0.28), y: 308, w: 120, h: 24, oneWay: true },
    { x: Math.floor(WORLD_W * 0.4), y: 248, w: 120, h: 24, oneWay: true },
    { x: Math.floor(WORLD_W * 0.5), y: 308, w: 130, h: 24, oneWay: true },
    { x: Math.floor(WORLD_W * 0.58), y: 220, w: 110, h: 24, oneWay: true },
    { x: Math.floor(WORLD_W * 0.68), y: 190, w: 130, h: 24, oneWay: true },
    { x: Math.floor(WORLD_W * 0.78), y: 260, w: 120, h: 24, oneWay: true },
    { x: Math.floor(WORLD_W * 0.86), y: 210, w: 130, h: 24, oneWay: true },
  ];
  for (const p of airPlats) {
    platforms.push(p);
    if (chance(0.65) || airPlats.indexOf(p) % 2 === 0) addPlatTrap(p);
  }

  // Keys on upper platforms — enough for both bars in solo
  addItem("key", airPlats[0]!.x + 20, airPlats[0]!.y - 28);
  addItem("key", airPlats[3]!.x + 30, airPlats[3]!.y - 28);
  if (level >= 4) {
    addItem("key", airPlats[7]!.x + 30, airPlats[7]!.y - 28);
  }

  for (let bi = 0; bi < barCount; bi++) {
    const bx = barXs[bi]!;
    buildings.push({
      x: bx,
      y: GROUND_Y - 120,
      w: 140,
      h: 120,
      kind: "bar",
      label: barCount > 1 ? `BAR ${bi + 1}` : "BAR",
    });
    doors.push({
      x: bx + 50,
      y: GROUND_Y - 56,
      w: 40,
      h: 56,
      id: `d-bar-${bi}`,
      label: barCount > 1 ? `Bar ${bi + 1}` : "Bar",
      target: "interior",
      interiorId: `bar${bi}`,
      needsKey: true,
    });
  }

  const count = Math.min(mpBars ? 28 : 16, (mpBars ? 12 : 6) + level * 2);
  const kinds: Array<Exclude<EnemyKind, "boss">> = ["goblin", "bruiser", "bat"];
  for (let i = 0; i < count; i++) {
    const t = (i + 1) / (count + 1);
    const x = 320 + t * (WORLD_W - 900);
    if (barXs.some((bx) => Math.abs(x - (bx + 70)) < 140)) continue;
    if (Math.abs(x - (WORLD_W - 450)) < 180) continue;
    const kind = kinds[(i + level) % kinds.length]!;
    if (kind === "bat") addEnemy("bat", x, 170 + (i % 4) * 28, 110);
    else if (kind === "bruiser") addEnemy("bruiser", x, GROUND_Y - 50, 100);
    else addEnemy("goblin", x, GROUND_Y - 44, 90);
  }

  addBoss(WORLD_W - 480);
  addItem("coin", airPlats[1]!.x + 30, airPlats[1]!.y - 28);
  addItem("coin", airPlats[4]!.x + 20, airPlats[4]!.y - 28);
  addItem("coin", airPlats[8]!.x + 24, airPlats[8]!.y - 28);
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

  coinCount.textContent = `${inventory.coins} ($${dollarsFromCoins(inventory.coins)})`;
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
    saveProgress();
    if (playMode !== "solo") {
      enterSpectate("öldün · diğerlerini izle");
    } else {
      state = "dead";
      showOverlay("DÜŞTÜN", "R veya Yeniden ile tekrar dene. Coin ve kıyafetler güvende.");
    }
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
  for (let i = 0; i < 10; i++) {
    particles.push({
      x: ox + 20,
      y: oy,
      vx: (Math.random() - 0.5) * 200,
      vy: -Math.random() * 180 - 40,
      life: 0.5 + Math.random() * 0.4,
      color: "#ff7ad9",
      size: 3 + Math.random() * 3,
    });
  }
  showStory("Splındog! 2 asalı müttefik çağırıldı.");
  beep(760, 0.1, "sine", 0.04);
}

function throwPotionBottle(id: PotionId) {
  const color = POTIONS[id].color;
  let tx = player.x + player.w / 2 + facing * 40;
  let ty = player.y + 8;
  if (id === "purple") {
    const drop = nearestGroundDrop(220);
    if (drop) {
      tx = drop.x + drop.w / 2;
      ty = drop.y - 10;
    } else {
      tx = player.x + facing * 90;
      ty = GROUND_Y - 30;
    }
  } else if (id === "pink") {
    tx = player.x + facing * 70;
    ty = GROUND_Y - 24;
  }
  const startX = player.x + (facing > 0 ? player.w : -10);
  const startY = player.y + 12;
  const dx = tx - startX;
  const dy = ty - startY;
  thrownBottles.push({
    id,
    x: startX,
    y: startY,
    vx: dx * 2.4 + facing * 40,
    vy: Math.min(-120, dy * 2.2 - 180),
    w: 12,
    h: 16,
    color,
    life: 2.2,
    spin: 0,
    alive: true,
  });
  // throw arm burst
  burst(startX, startY, color, 6);
  beep(300, 0.06, "triangle", 0.025);
  showHint(
    id === "poison"
      ? "Krypton atıldı!"
      : id === "purple"
        ? "Enchant atıldı!"
        : "Splındog atıldı!",
  );
}

function applyDrinkEffect(id: PotionId) {
  if (id === "heal") {
    const heal = rand(200, 350);
    player.hp = Math.min(player.maxHp, player.hp + heal);
    burst(player.x + player.w / 2, player.y + 10, "#7dffb3", 16);
    sfxPickup();
    showStory(`Recovery. (+${heal})`);
  } else if (id === "fly") {
    flyTimer = 5;
    burst(player.x + player.w / 2, player.y + 10, "#4aa8ff", 18);
    beep(520, 0.12, "sine", 0.04);
    showStory("Pigeon! 5 saniye uçuş.");
  } else if (id === "yellow") {
    invisTimer = 8;
    burst(player.x + player.w / 2, player.y + 10, "#ffd24a", 18);
    beep(640, 0.1, "triangle", 0.035);
    showStory("TheReeker! 8 sn görünmezlik.");
  }
  updateHud();
}

function onBottleLand(b: ThrownBottle) {
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  burst(cx, cy, b.color, 16);
  beep(180, 0.08, "sawtooth", 0.03);

  if (b.id === "poison") {
    // splash damage zone — hit nearby enemies
    let hitAny = false;
    for (const e of enemies) {
      if (!e.alive) continue;
      if (Math.hypot(e.x + e.w / 2 - cx, e.y + e.h / 2 - cy) < 70) {
        damageEnemy(e, rand(250, 300), cx);
        hitAny = true;
      }
    }
    // also leave a short-lived hostile splash if nothing? keep as friendly splash only
    if (!hitAny) {
      spawnProjectile("poison", cx, cy - 4, facing * 80, -40, rand(250, 300), 0.8, false, 14, 10);
    }
    showStory("Krypton patladı!");
  } else if (b.id === "purple") {
    if (!pourEnchantAt(cx, cy)) {
      // failed — purple puddle FX only
      for (let i = 0; i < 12; i++) {
        particles.push({
          x: cx,
          y: cy,
          vx: (Math.random() - 0.5) * 120,
          vy: -Math.random() * 100,
          life: 0.6,
          color: "#b44dff",
          size: 2 + Math.random() * 3,
        });
      }
    }
  } else if (b.id === "pink") {
    spawnAllies(cx - 20, Math.min(cy, GROUND_Y - 40));
  }
}

function updateThrownBottles(dt: number) {
  for (let i = thrownBottles.length - 1; i >= 0; i--) {
    const b = thrownBottles[i]!;
    if (!b.alive) {
      thrownBottles.splice(i, 1);
      continue;
    }
    b.life -= dt;
    b.vy += GRAVITY * 0.85 * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.spin += dt * 14;
    b.vx *= 0.995;

    // hit enemy mid-air (Krypton)
    if (b.id === "poison") {
      for (const e of enemies) {
        if (!e.alive) continue;
        if (aabb(b, e)) {
          b.alive = false;
          onBottleLand(b);
          break;
        }
      }
      if (!b.alive) {
        thrownBottles.splice(i, 1);
        continue;
      }
    }

    const hit = solidAt(b);
    const landed =
      b.life <= 0 ||
      b.y > H + 40 ||
      (hit && b.vy >= 0 && b.y + b.h >= hit.y);

    if (landed) {
      if (hit && b.vy >= 0) b.y = hit.y - b.h;
      b.alive = false;
      onBottleLand(b);
      thrownBottles.splice(i, 1);
    }
  }
  if (thrownBottles.length === 0 && drinkAnimT <= 0 && pourAnimT <= 0) {
    potionBusy = false;
  }
}

function updatePotionAnims(dt: number) {
  if (drinkAnimT > 0) {
    drinkAnimT -= dt;
    // sip particles
    if (Math.random() < 0.35 && drinkAnimId) {
      const c = POTIONS[drinkAnimId].color;
      particles.push({
        x: player.x + player.w / 2 + facing * 6,
        y: player.y + 4,
        vx: (Math.random() - 0.5) * 40,
        vy: -40 - Math.random() * 40,
        life: 0.35,
        color: c,
        size: 2,
      });
    }
    if (drinkAnimT <= 0 && drinkAnimId) {
      applyDrinkEffect(drinkAnimId);
      drinkAnimId = null;
      potionBusy = false;
    }
  }
  if (pourAnimT > 0) {
    pourAnimT -= dt;
    // pouring stream particles
    particles.push({
      x: pourAnimX + (Math.random() - 0.5) * 8,
      y: pourAnimY - 20 + Math.random() * 10,
      vx: (Math.random() - 0.5) * 20,
      vy: 60 + Math.random() * 40,
      life: 0.25,
      color: "#b44dff",
      size: 2 + Math.random() * 2,
    });
    if (pourAnimT <= 0 && thrownBottles.length === 0 && drinkAnimT <= 0) {
      potionBusy = false;
    }
  }
}
function usePotion() {
  if (state !== "playing") return;
  if (potionBusy || drinkAnimT > 0 || thrownBottles.length > 0) {
    showHint("İksir animasyonu bitene kadar bekle");
    return;
  }
  const held = rightHand.item;
  if (!held || held.kind !== "potion") {
    showHint("Sağ elde iksir yok");
    return;
  }

  const id = held.id;
  const mode = POTION_USE[id];
  rightHand.item = null;
  potionBusy = true;
  updateHud();

  if (mode === "drink") {
    drinkAnimId = id;
    drinkAnimT = 0.55;
    beep(480, 0.08, "sine", 0.03);
    showHint(`${POTIONS[id].label} içiliyor…`);
    return;
  }

  // throw / ground-throw
  throwPotionBottle(id);
}

function solidList(): Plat[] {
  const base = scene === "interior" ? interiorPlatforms : platforms;
  const extras: Plat[] = [];
  for (const h of hazards) {
    if (h.kind === "platform" && h.life > 0) extras.push(h);
  }
  return extras.length ? [...base, ...extras] : base;
}

function solidAt(r: Rect): Plat | null {
  for (const p of solidList()) if (aabb(r, p)) return p;
  return null;
}

function resolvePlayer(dt: number) {
  const flying = flyTimer > 0;

  if (flyTimer > 0) flyTimer = Math.max(0, flyTimer - dt);
  if (invisTimer > 0) invisTimer = Math.max(0, invisTimer - dt);
  if (shieldTimer > 0) {
    shieldTimer = Math.max(0, shieldTimer - dt);
    if (shieldTimer <= 0) shieldHp = 0;
  }
  if (enchantSparkleT > 0) enchantSparkleT = Math.max(0, enchantSparkleT - dt);

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

  const prevBottom = player.y + player.h;

  player.x += player.vx * dt;
  for (const p of solidList()) {
    if (p.oneWay) continue; // one-way: never block horizontal
    if (!aabb(player, p)) continue;
    if (player.vx > 0) player.x = p.x - player.w;
    else if (player.vx < 0) player.x = p.x + p.w;
    player.vx = 0;
  }
  if (scene === "interior") {
    player.x = Math.max(20, Math.min(player.x, INTERIOR_W - player.w - 20));
  } else {
    player.x = Math.max(10, Math.min(player.x, WORLD_W - player.w - 10));
  }

  player.y += player.vy * dt;
  onGround = false;
  for (const p of solidList()) {
    if (!aabb(player, p)) continue;
    if (p.oneWay) {
      // Land only when falling and feet were at/above platform top before move
      if (player.vy >= 0 && prevBottom <= p.y + 6) {
        player.y = p.y - player.h;
        onGround = true;
        coyote = 0.1;
        player.vy = 0;
      }
      continue;
    }
    if (player.vy > 0) {
      player.y = p.y - player.h;
      onGround = true;
      coyote = 0.1;
    } else if (player.vy < 0) {
      player.y = p.y + p.h;
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
  if (e.kind === "bruiser") return 20;
  if (e.kind === "bat") return 15;
  if (e.bossKind) return BOSS_ATK[e.bossKind].contact;
  return 50;
}

function bossAtk(kind: BossKind) {
  return BOSS_ATK[kind];
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
      saveProgress();
      venomDot = 0;
      venomAcc = 0;
      if (playMode !== "solo") enterSpectate("öldün · diğerlerini izle");
      else {
        state = "dead";
        showOverlay("DÜŞTÜN", "R veya Yeniden ile tekrar dene. Coin ve kıyafetler güvende.");
      }
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
    // Hit nearest living head
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

  player.hp = Math.min(player.maxHp, player.hp + 80);
  const cleared = level;
  const bossName = e.name;
  level += 1;

  queueDialog([
    { name: bossName, text: "…Yeter… git…" },
    {
      name: "???",
      text: `Seviye ${cleared} temiz. İleri — sandıklarda şansını dene.`,
    },
  ]);
  showStory(`Seviye ${level}.`);

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
  const playerVisible = invisTimer <= 0;
  e.facing = playerVisible ? (dx >= 0 ? 1 : -1) : e.facing;
  e.unhittable = false;

  if (dist < 480) triggerBossIntro(e);

  const kind = e.bossKind ?? "ironface";
  let skipGravity = false;

  // When invisible, bosses still patrol but do not aim/attack the player
  if (!playerVisible) {
    if (kind === "mothman" || kind === "creeper" || (kind === "cloud" && e.raining > 0)) {
      skipGravity = true;
      e.grounded = false;
      const hoverY =
        kind === "cloud"
          ? 90
          : GROUND_Y - e.h - (kind === "creeper" ? 40 : 70);
      e.y += (hoverY - e.y) * Math.min(1, 3 * dt);
    }
    e.vx = e.facing * 30;
    e.x += e.vx * dt;
    if (e.x < e.patrolL) e.x = e.patrolL;
    if (e.x > e.patrolR) e.x = e.patrolR;
    if (!skipGravity) {
      e.vy += GRAVITY * dt;
      e.y += e.vy * dt;
      const hit = solidAt(e);
      if (hit && e.vy >= 0) {
        e.y = hit.y - e.h;
        e.vy = 0;
        e.grounded = true;
      }
    }
    return;
  }

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
        spawnProjectile("rain", rx, 40, 0, 220, bossAtk("cloud").proj, 3.5, true, 8, 14);
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
        bossAtk("mothman").proj,
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
        bossAtk("anaconda").proj,
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
          hurtPlayer(bossAtk("kingkong").special, e.facing * 320);
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
          bossAtk("firefox").proj,
          1.6,
          true,
          22,
          14,
        );
      } else {
        // tail swipe — contact window
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
        hurtPlayer(bossAtk("firefox").special, e.facing * 280);
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
      // Horn charge — jumpable (only hits if player low)
      if (
        aabb(player, { x: e.x, y: e.y + 20, w: e.w, h: e.h - 20 }) &&
        player.y + player.h > e.y + 30
      ) {
        hurtPlayer(bossAtk("minotaur").special, e.facing * 340);
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
            bossAtk("minotaur").proj,
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
          bossAtk("creeper").proj,
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
          bossAtk("creeper").special,
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
          dmg: bossAtk("creeper").special,
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
    // Stationary-ish
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
            bossAtk("sphinx").proj,
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
          bossAtk("sphinx").proj,
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
          hurtPlayer(bossAtk("sphinx").special, player.x < e.x ? -300 : 300);
        }
        burst(e.x + e.w / 2, e.y + e.h, "#c9a227", 16);
        shake = 14;
        e.phase = 0;
        e.attackCd = 2.0;
      }
    }
  } else {
    // cerberus
    e.vx = e.facing * 70;
    e.x += e.vx * dt;
    if (e.attackCd <= 0 && dist < 500) {
      if (e.phase % 3 === 0) {
        // bite via contact boost
        e.phase = 30;
        e.attackCd = 0.4;
        e.vx = e.facing * 300;
      } else if (e.phase % 3 === 1) {
        // jump → lava rises
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
          dmg: bossAtk("cerberus").special,
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
          bossAtk("cerberus").proj,
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
      if (aabb(player, e)) hurtPlayer(bossAtk("cerberus").contact, e.facing * 360);
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
          hurtPlayer(kind === "ironface" ? bossAtk("ironface").stomp : bossAtk("cerberus").stomp, player.x < e.x ? -280 : 280);
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
      // rise toward ground surface
      const targetY = GROUND_Y - 20;
      if (h.y > targetY) h.y = Math.max(targetY, h.y - 40 * dt);
      h.tick -= dt;
      if (aabb(player, h) && h.tick <= 0) {
        // check if on safe platform
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
      // sparks while standing on platform
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
      if (aabb(player, h) && invuln <= 0 && invisTimer <= 0) {
        hurtPlayer(h.dmg, 0);
        h.life = 0;
      }
    }
  }
}

function updatePlatTraps(dt: number) {
  if (scene !== "world") return;
  for (const t of platTraps) {
    t.tick = Math.max(0, t.tick - dt);
    if (aabb(player, t) && t.tick <= 0 && invuln <= 0) {
      // Traps still hit while invisible (already-placed hazards)
      hurtPlayer(t.dmg, 0);
      t.tick = 0.8;
      burst(t.x + t.w / 2, t.y, "#ff6060", 6);
    }
  }
}

function updateGroundDrops(dt: number) {
  for (let i = groundDrops.length - 1; i >= 0; i--) {
    const d = groundDrops[i]!;
    d.bob += dt * 3;
    if (d.sparkle > 0) d.sparkle = Math.max(0, d.sparkle - dt);
    const body = {
      x: d.x,
      y: d.y + Math.sin(d.bob) * 3,
      w: d.w,
      h: d.h,
    };
    if (!aabb(player, body)) continue;
    if (d.kind === "weapon") {
      const ok = grantItem({
        kind: "weapon",
        id: d.id as CarryWeapon,
      });
      if (ok) {
        // restore ammo / enchanted state onto left hand if rifle
        if (leftHand.item?.kind === "weapon" && leftHand.item.id === d.id) {
          if (d.ammo !== undefined) leftHand.item.ammo = d.ammo;
        } else {
          // may have gone to bag
          for (let b = 0; b < bag.length; b++) {
            const it = bag[b];
            if (it?.kind === "weapon" && it.id === d.id && d.ammo !== undefined) {
              it.ammo = d.ammo;
            }
          }
        }
        if (d.enchanted) weaponEnchanted[d.id as WeaponId] = true;
        groundDrops.splice(i, 1);
      }
    } else {
      const slot = d.id as ArmorSlot;
      grantArmor(slot, d.armorAbsorb ?? 0);
      groundDrops.splice(i, 1);
    }
  }
}

function nearestEnemyFor(fromX: number, fromY: number): Enemy | null {
  let best: Enemy | null = null;
  let bestD = Infinity;
  for (const e of enemies) {
    if (!e.alive) continue;
    const d = Math.hypot(e.x + e.w / 2 - fromX, e.y + e.h / 2 - fromY);
    if (d < bestD) {
      bestD = d;
      best = e;
    }
  }
  return best;
}

function updateAllies(dt: number) {
  for (const a of allies) {
    if (!a.alive) continue;
    a.attackCd = Math.max(0, a.attackCd - dt);

    // Follow / strafe near player
    const targetX = player.x + (a.x < player.x ? -40 : 44);
    const dx = targetX - a.x;
    a.vx = Math.max(-160, Math.min(160, dx * 4));
    a.facing = a.vx >= 0 ? 1 : -1;
    a.x += a.vx * dt;
    a.vy += GRAVITY * dt;
    a.y += a.vy * dt;
    const hit = solidAt(a);
    if (hit && a.vy >= 0) {
      // one-way land if feet near top
      if (!hit.oneWay || a.y + a.h <= hit.y + 10) {
        a.y = hit.y - a.h;
        a.vy = 0;
      }
    }
    if (scene === "world") {
      a.x = Math.max(10, Math.min(a.x, WORLD_W - a.w - 10));
    }

    const foe = nearestEnemyFor(a.x, a.y);
    if (foe && a.attackCd <= 0) {
      const dir = foe.x >= a.x ? 1 : -1;
      a.facing = dir;
      spawnProjectile(
        "magic",
        a.x + (dir > 0 ? a.w : -10),
        a.y + 10,
        dir * 340,
        -40,
        weaponDamage("staff") || 380,
        1.1,
        false,
        14,
        14,
      );
      a.attackCd = 0.7;
      beep(880, 0.04, "sine", 0.02);
    }

    // Ally takes contact damage from enemies
    for (const e of enemies) {
      if (!e.alive) continue;
      if (aabb(a, e)) {
        a.hp -= contactDamage(e) * 0.35 * dt * 8;
        if (a.hp <= 0) {
          a.alive = false;
          burst(a.x + a.w / 2, a.y + a.h / 2, "#ff7ad9", 12);
        }
      }
    }
  }
  // prune dead occasionally
  for (let i = allies.length - 1; i >= 0; i--) {
    if (!allies[i]!.alive) allies.splice(i, 1);
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
      if (e.attackCd <= 0 && Math.abs(player.x - e.x) < 360 && invisTimer <= 0) {
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
    } else if (e.kind === "bruiser") {
      // melee only — holds club but does not throw it
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

    if (
      e.hurt <= 0 &&
      !e.unhittable &&
      aabb(player, e) &&
      invuln <= 0 &&
      invisTimer <= 0 &&
      state === "playing"
    ) {
      const knock = player.x < e.x ? -260 : 260;
      hurtPlayer(contactDamage(e), knock);
    }
    if (playMode !== "solo" && e.hurt <= 0 && !e.unhittable) {
      for (const peer of mpPeers) {
        if (!peer.alive || peer.isLocal || peer.invuln > 0) continue;
        if (aabb(peer, e)) {
          hurtPeer(peer, contactDamage(e), peer.x < e.x ? -220 : 220);
        }
      }
    }
  }

  const box = attackBox();
  if (box) {
    for (const e of enemies) {
      if (!e.alive) continue;
      if (!aabb(box, e)) continue;
      damageEnemy(e, weaponDamage(equippedWeapon()), player.x + player.w / 2);
    }
    tryPvpAttack();
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
    if (it.kind === "coin") addCoins(1);
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
      if (aabb(player, p) && invuln <= 0 && state === "playing") {
        if (p.kind === "venom") {
          applyVenomDot();
          if (p.dmg > 0) hurtPlayer(p.dmg, p.vx > 0 ? 160 : -160);
        } else if (p.kind === "spark") {
          // visual only if dmg 0
          if (p.dmg > 0) hurtPlayer(p.dmg, 0);
        } else {
          hurtPlayer(p.dmg, p.vx > 0 ? 200 : -200);
        }
        p.alive = false;
      }
      if (p.alive && playMode !== "solo") {
        for (const peer of mpPeers) {
          if (!peer.alive || peer.isLocal || peer.invuln > 0) continue;
          if (aabb(peer, p)) {
            hurtPeer(peer, Math.max(1, p.dmg), p.vx > 0 ? 180 : -180);
            p.alive = false;
            break;
          }
        }
      }
    } else if (scene === "world") {
      for (const e of enemies) {
        if (!e.alive) continue;
        if (!aabb(p, e)) continue;
        damageEnemy(e, p.dmg, p.x);
        p.alive = false;
        break;
      }
      if (p.alive && playMode === "survivor") {
        for (const peer of mpPeers) {
          if (!peer.alive || peer.isLocal || peer.invuln > 0) continue;
          if (aabb(peer, p)) {
            hurtPeer(peer, p.dmg, p.vx > 0 ? 200 : -200);
            p.alive = false;
            break;
          }
        }
      }
    }
    if (!p.alive) projectiles.splice(i, 1);
  }
}

function lootLabel(loot: LootResult): string {
  if (loot.kind === "weapon") return WEAPONS[loot.id].label;
  if (loot.kind === "potion") return POTIONS[loot.id].label;
  return ARMOR_LABEL[loot.id];
}

function startLootReveal(loot: LootResult) {
  lootReveal = {
    t: 0,
    duration: 2.8,
    loot,
    label: lootLabel(loot),
    granted: false,
  };
  beep(520, 0.08, "sine", 0.035);
}

function updateLootReveal(dt: number) {
  if (!lootReveal) return;
  lootReveal.t += dt;
  const p = lootReveal.t / lootReveal.duration;
  if (!lootReveal.granted && p >= 0.55) {
    lootReveal.granted = true;
    grantItem(lootReveal.loot);
    burst(W / 2, H / 2, "#f5c518", 24);
    beep(880, 0.12, "sine", 0.04);
  }
  if (lootReveal.t >= lootReveal.duration) {
    if (!lootReveal.granted) grantItem(lootReveal.loot);
    lootReveal = null;
  }
}

function tryOpenChest() {
  if (!chest || chest.opened || scene !== "interior") return false;
  if (
    !aabb(player, {
      x: chest.x - 24,
      y: chest.y - 16,
      w: chest.w + 48,
      h: chest.h + 32,
    })
  )
    return false;
  if (lootReveal) return true;

  chest.opened = true;
  const save =
    currentInterior && barChestSaves[currentInterior.id]
      ? barChestSaves[currentInterior.id]!
      : null;
  if (save) save.opened = true;
  if (chest.isParchment || chest.type === "none") {
    parchmentShown = true;
    if (save) save.parchmentShown = true;
    queueDialog([
      {
        name: "ROCKET RACCOON",
        text: "Sandık yok kardeşim. Sadece ben varım — ve orta parmağım.",
      },
      {
        name: "PARŞÖMEN",
        text: "Üstte yazıyor: ROCKET RACCOON. Alaycı rakun posterı.",
      },
    ]);
    showStory("Boş kutu — Rocket Raccoon parşömeni.");
    beep(180, 0.2, "sawtooth", 0.03);
    return true;
  }

  const loot = rollChestLoot(chest.type);
  showHint(`${CHEST_TITLE[chest.type]} açıldı!`);
  burst(chest.x + chest.w / 2, chest.y, "#f5c518", 18);
  startLootReveal(loot);
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
  if (state === "spectate") return;
  if (lootReveal) {
    const skip =
      keys.has("x") ||
      keys.has("X") ||
      keys.has("Enter") ||
      keys.has(" ") ||
      keys.has("e") ||
      keys.has("E");
    if (skip) lootReveal.t = Math.max(lootReveal.t, lootReveal.duration - 0.05);
    return;
  }
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

  const moveMul = 1;
  const jumpPower = JUMP;

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
    } else if (
      chest &&
      chest.opened &&
      parchmentShown &&
      aabb(player, {
        x: chest.x - 24,
        y: chest.y - 16,
        w: chest.w + 48,
        h: chest.h + 32,
      })
    ) {
      showHint("Rocket Raccoon parşömeni");
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

function drawPlatforms(list: Plat[]) {
  for (const p of list) {
    const x = p.x - camX;
    if (x + p.w < -20 || x > W + 20) continue;
    ctx.fillStyle = p.oneWay ? "#354a38" : "#2c3e2f";
    ctx.fillRect(x, p.y, p.w, p.h);
    ctx.fillStyle = p.oneWay ? "#6aaa58" : "#5a8f4a";
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

function drawRocketRaccoon(px: number, py: number, big = false) {
  const s = big ? 1.7 : 1;
  const w = 48 * s;
  const h = 56 * s;
  // parchment / poster board
  ctx.fillStyle = big ? "#3a2a18" : "#e8d8a8";
  ctx.fillRect(px, py, w, h);
  ctx.strokeStyle = big ? "#c9a227" : "#8a7040";
  ctx.lineWidth = big ? 3 : 1;
  ctx.strokeRect(px, py, w, h);
  // title banner
  ctx.fillStyle = "#8a2030";
  ctx.fillRect(px + 2, py + 2, w - 4, 10 * s);
  ctx.fillStyle = "#f5c518";
  ctx.font = `${Math.max(7, 8 * s)}px monospace`;
  ctx.fillText("ROCKET", px + 6 * s, py + 9 * s);
  // raccoon body
  ctx.fillStyle = "#6a5a48";
  ctx.fillRect(px + 14 * s, py + 24 * s, 20 * s, 18 * s);
  ctx.fillStyle = "#c8b090";
  ctx.fillRect(px + 16 * s, py + 12 * s, 16 * s, 14 * s);
  // mask
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(px + 14 * s, py + 16 * s, 20 * s, 6 * s);
  ctx.fillStyle = "#fff";
  ctx.fillRect(px + 18 * s, py + 17 * s, 3 * s, 3 * s);
  ctx.fillRect(px + 27 * s, py + 17 * s, 3 * s, 3 * s);
  // ears
  ctx.fillStyle = "#6a5a48";
  ctx.fillRect(px + 15 * s, py + 10 * s, 5 * s, 4 * s);
  ctx.fillRect(px + 28 * s, py + 10 * s, 5 * s, 4 * s);
  // middle finger (clear)
  ctx.fillStyle = "#c8b090";
  ctx.fillRect(px + 34 * s, py + 28 * s, 5 * s, 16 * s);
  ctx.fillRect(px + 32 * s, py + 40 * s, 9 * s, 4 * s);
  ctx.fillRect(px + 30 * s, py + 42 * s, 4 * s, 3 * s);
  ctx.fillRect(px + 39 * s, py + 42 * s, 4 * s, 3 * s);
  ctx.fillStyle = "#ff6060";
  ctx.font = `${Math.max(8, 9 * s)}px monospace`;
  ctx.fillText("!", px + 36 * s, py + 27 * s);
  if (big) {
    ctx.fillStyle = "#f4f0e6";
    ctx.font = "10px monospace";
    ctx.fillText("ROCKET RACCOON", px - 8, py + h + 14);
    ctx.fillStyle = "#9ad1ff";
    ctx.font = "9px monospace";
    ctx.fillText("E — bak", px + 18, py + h + 28);
  }
}

function drawChestVisual(cx: number, cy: number, type: ChestType, opened: boolean) {
  const w = 56;
  const h = 44;
  if (opened && type !== "none") {
    // open empty chest shell
    ctx.fillStyle = "#3a2a1a";
    ctx.fillRect(cx, cy + 16, w, h - 16);
    ctx.fillStyle = "#5a4030";
    ctx.fillRect(cx - 2, cy + 4, w + 4, 14);
    ctx.strokeStyle = "#1a1010";
    ctx.strokeRect(cx, cy + 16, w, h - 16);
    return;
  }

  if (type === "wood" || type === "none") {
    // wooden planks
    ctx.fillStyle = "#6b4226";
    ctx.fillRect(cx, cy, w, h);
    ctx.fillStyle = "#8a5a32";
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(cx + 3, cy + 6 + i * 9, w - 6, 6);
    }
    ctx.fillStyle = "#4a2e18";
    ctx.fillRect(cx + 2, cy + 2, w - 4, 4);
    ctx.fillRect(cx + 2, cy + h - 6, w - 4, 4);
    // iron bands
    ctx.fillStyle = "#3a3a40";
    ctx.fillRect(cx, cy + 14, w, 5);
    ctx.fillRect(cx, cy + 30, w, 5);
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(cx + w / 2 - 4, cy + 18, 8, 8);
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.arc(cx + w / 2, cy + 22, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "thorny") {
    // metal body
    const g = ctx.createLinearGradient(cx, cy, cx, cy + h);
    g.addColorStop(0, "#8a9098");
    g.addColorStop(0.5, "#5a6068");
    g.addColorStop(1, "#3a4048");
    ctx.fillStyle = g;
    ctx.fillRect(cx, cy, w, h);
    ctx.fillStyle = "#b0b8c0";
    ctx.fillRect(cx + 3, cy + 3, w - 6, 8);
    ctx.fillStyle = "#2a3038";
    ctx.fillRect(cx + 4, cy + 18, w - 8, 4);
    // metal rivets
    ctx.fillStyle = "#d0d4d8";
    for (const rx of [8, 20, 32, 44]) {
      ctx.fillRect(cx + rx, cy + 6, 3, 3);
      ctx.fillRect(cx + rx, cy + 34, 3, 3);
    }
    // thorns / spikes
    ctx.fillStyle = "#c8d0d8";
    for (let i = 0; i < 6; i++) {
      const sx = cx + 6 + i * 8;
      ctx.beginPath();
      ctx.moveTo(sx, cy);
      ctx.lineTo(sx + 3, cy - 10);
      ctx.lineTo(sx + 6, cy);
      ctx.fill();
    }
    for (let i = 0; i < 3; i++) {
      const sy = cy + 12 + i * 10;
      ctx.beginPath();
      ctx.moveTo(cx, sy);
      ctx.lineTo(cx - 8, sy + 3);
      ctx.lineTo(cx, sy + 6);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + w, sy);
      ctx.lineTo(cx + w + 8, sy + 3);
      ctx.lineTo(cx + w, sy + 6);
      ctx.fill();
    }
    ctx.fillStyle = "#e04040";
    ctx.fillRect(cx + w / 2 - 5, cy + 20, 10, 10);
  } else if (type === "sticky") {
    // melted rainbow goo chest
    const cols = ["#ff4d6d", "#ff9f1c", "#ffd60a", "#2ec4b6", "#7b2cbf", "#ff7ad9"];
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = cols[i]!;
      const drip = Math.sin(time * 3 + i) * 3;
      ctx.beginPath();
      ctx.moveTo(cx + i * 9, cy + 4);
      ctx.lineTo(cx + i * 9 + 12, cy + 4);
      ctx.lineTo(cx + i * 9 + 10, cy + h + 6 + drip);
      ctx.lineTo(cx + i * 9 - 2, cy + h + 2 + drip);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(cx + 8, cy + 8, w - 16, 10);
    // goo blobs
    ctx.fillStyle = "#ff7ad9";
    ctx.beginPath();
    ctx.arc(cx + 12, cy + h + 4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2ec4b6";
    ctx.beginPath();
    ctx.arc(cx + w - 10, cy + h + 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(cx + w / 2 - 4, cy + 20, 8, 8);
  } else if (type === "diamond") {
    // bright crystalline
    const g = ctx.createLinearGradient(cx, cy, cx + w, cy + h);
    g.addColorStop(0, "#e8f7ff");
    g.addColorStop(0.4, "#7ad0f0");
    g.addColorStop(1, "#3a90c0");
    ctx.fillStyle = g;
    ctx.fillRect(cx, cy, w, h);
    // diamond facets
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.moveTo(cx + w / 2, cy - 6);
    ctx.lineTo(cx + w / 2 + 12, cy + 10);
    ctx.lineTo(cx + w / 2, cy + 18);
    ctx.lineTo(cx + w / 2 - 12, cy + 10);
    ctx.fill();
    ctx.fillStyle = "rgba(180,230,255,0.8)";
    for (const dx of [8, 28, 44]) {
      ctx.beginPath();
      ctx.moveTo(cx + dx, cy + 22);
      ctx.lineTo(cx + dx + 6, cy + 30);
      ctx.lineTo(cx + dx, cy + 38);
      ctx.lineTo(cx + dx - 6, cy + 30);
      ctx.fill();
    }
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(cx + 2, cy + 2, w - 4, h - 4);
    // sparkle
    ctx.fillStyle = `rgba(255,255,255,${0.5 + Math.sin(time * 10) * 0.4})`;
    ctx.fillRect(cx + 10, cy + 8, 3, 3);
    ctx.fillRect(cx + 40, cy + 14, 2, 2);
    ctx.fillRect(cx + 22, cy + 34, 3, 3);
  } else {
    // obsidian — purple-black stone
    ctx.fillStyle = "#120818";
    ctx.fillRect(cx, cy, w, h);
    ctx.fillStyle = "#2a1038";
    ctx.fillRect(cx + 3, cy + 3, w - 6, h - 6);
    // crystalline veins
    ctx.strokeStyle = "#7a3aaa";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + 8, cy + 8);
    ctx.lineTo(cx + 22, cy + 20);
    ctx.lineTo(cx + 14, cy + 34);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + w - 8, cy + 10);
    ctx.lineTo(cx + w - 20, cy + 24);
    ctx.lineTo(cx + w - 12, cy + 36);
    ctx.stroke();
    ctx.fillStyle = "#b44dff";
    ctx.fillRect(cx + 18, cy + 16, 4, 4);
    ctx.fillRect(cx + 34, cy + 26, 3, 3);
    ctx.fillStyle = `rgba(180,77,255,${0.35 + Math.sin(time * 6) * 0.25})`;
    ctx.fillRect(cx + 6, cy + 6, w - 12, 6);
    ctx.fillStyle = "#1a0a20";
    ctx.fillRect(cx + w / 2 - 5, cy + 22, 10, 10);
    ctx.fillStyle = "#d0a0ff";
    ctx.fillRect(cx + w / 2 - 2, cy + 25, 4, 4);
  }

  // name plate above chest
  const title = CHEST_TITLE[type];
  ctx.font = "9px monospace";
  const tw = ctx.measureText(title).width;
  ctx.fillStyle = "rgba(8,10,18,0.85)";
  ctx.fillRect(cx + w / 2 - tw / 2 - 4, cy - 18, tw + 8, 14);
  ctx.fillStyle = "#f5c518";
  ctx.fillText(title, cx + w / 2 - tw / 2, cy - 7);
}

function drawLootReveal() {
  if (!lootReveal) return;
  const p = Math.min(1, lootReveal.t / lootReveal.duration);
  ctx.fillStyle = `rgba(5,8,14,${0.55 + Math.min(0.3, p * 0.4)})`;
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2;
  const cy = H / 2 - 10;
  // spinning rays
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(lootReveal.t * 4);
  for (let i = 0; i < 12; i++) {
    ctx.rotate(Math.PI / 6);
    ctx.fillStyle = `rgba(245,197,24,${0.08 + (i % 2) * 0.06})`;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-18, -160);
    ctx.lineTo(18, -160);
    ctx.fill();
  }
  ctx.restore();

  // spinning card / orb
  const spin = lootReveal.t * 10;
  const scale = p < 0.2 ? p / 0.2 : p > 0.85 ? 1 + (p - 0.85) * 0.4 : 1;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(spin);
  ctx.scale(scale, scale * Math.max(0.15, Math.abs(Math.cos(spin * 0.5))));
  ctx.fillStyle = "#1a2740";
  ctx.fillRect(-40, -50, 80, 100);
  ctx.strokeStyle = "#f5c518";
  ctx.lineWidth = 3;
  ctx.strokeRect(-40, -50, 80, 100);

  // show item once past reveal threshold
  if (p >= 0.35) {
    ctx.rotate(-spin);
    const loot = lootReveal.loot;
    if (loot.kind === "weapon") {
      ctx.fillStyle = "#c0d0e0";
      ctx.fillRect(-6, -28, 12, 50);
      ctx.fillStyle = "#c9a227";
      ctx.fillRect(-12, 16, 24, 8);
    } else if (loot.kind === "potion") {
      drawPotionBottle(0, 4, POTIONS[loot.id].color, 2.2, 0);
    } else {
      ctx.fillStyle = "#708090";
      ctx.fillRect(-16, -20, 32, 36);
      ctx.fillStyle = "#c9a227";
      ctx.fillRect(-12, -4, 24, 6);
    }
  } else {
    ctx.fillStyle = "#3d5a80";
    ctx.font = "28px monospace";
    ctx.fillText("?", -10, 10);
  }
  ctx.restore();

  if (p >= 0.45) {
    ctx.fillStyle = "#f5c518";
    ctx.font = "16px monospace";
    const label = lootReveal.label;
    const tw = ctx.measureText(label).width;
    ctx.fillText(label, cx - tw / 2, cy + 90);
    ctx.fillStyle = "#9ad1ff";
    ctx.font = "11px monospace";
    ctx.fillText("Eşya kazanıldı!", cx - 50, cy + 112);
  }
}

function drawInteriorDecor() {
  if (!currentInterior) return;
  const isBar = currentInterior.kind === "bar";
  ctx.fillStyle = isBar ? "#2a1a18" : "#2a241c";
  ctx.fillRect(0, 80, W, GROUND_Y - 80);
  ctx.fillStyle = "#3a3028";
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

  // exit door
  ctx.fillStyle = "#1a120e";
  ctx.fillRect(40, GROUND_Y - 70, 40, 70);
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(68, GROUND_Y - 40, 6, 6);

  if (isBar) {
    // counter + bartender
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
        drawRocketRaccoon(cx - 4, cy - 24, false);
      } else {
        drawChestVisual(cx, cy, chest.type, chest.opened);
      }
    }
  }
}

function drawPotionBottle(
  ox: number,
  oy: number,
  color: string,
  scale = 1,
  tilted = 0,
) {
  ctx.save();
  ctx.translate(ox, oy);
  if (tilted) ctx.rotate(tilted);
  ctx.scale(scale, scale);

  // glass body
  ctx.fillStyle = "rgba(220,235,255,0.35)";
  ctx.strokeStyle = "rgba(190,210,230,0.85)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-5, -2);
  ctx.quadraticCurveTo(-7, 4, -6.5, 10);
  ctx.quadraticCurveTo(-6, 16, 0, 17);
  ctx.quadraticCurveTo(6, 16, 6.5, 10);
  ctx.quadraticCurveTo(7, 4, 5, -2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // liquid
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-5.2, 4);
  ctx.quadraticCurveTo(-6.2, 10, -5.5, 14);
  ctx.quadraticCurveTo(-4, 17, 0, 15.5);
  ctx.quadraticCurveTo(4, 17, 5.5, 14);
  ctx.quadraticCurveTo(6.2, 10, 5.2, 4);
  ctx.closePath();
  ctx.fill();

  // liquid meniscus shine
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(-3.5, 4.5, 7, 1.5);

  // neck
  ctx.fillStyle = "rgba(210,230,250,0.55)";
  ctx.fillRect(-2.2, -8, 4.4, 7);
  ctx.strokeStyle = "rgba(170,195,220,0.9)";
  ctx.strokeRect(-2.2, -8, 4.4, 7);

  // cork
  ctx.fillStyle = "#8a5a2a";
  ctx.fillRect(-2.6, -11, 5.2, 3.5);
  ctx.fillStyle = "#a87038";
  ctx.fillRect(-2.2, -11.5, 4.4, 1.5);

  // glass highlight
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillRect(-4.2, 0, 1.6, 9);
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(3.2, 2, 1.2, 6);

  // label wrap
  ctx.fillStyle = "rgba(245,240,220,0.85)";
  ctx.fillRect(-4.5, 7, 9, 3.5);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.7;
  ctx.fillRect(-3.5, 7.6, 7, 2);
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawHandPotion(x: number, y: number) {
  // drinking animation: raise bottle to mouth
  if (drinkAnimT > 0 && drinkAnimId) {
    const t = 1 - drinkAnimT / 0.55;
    const color = POTIONS[drinkAnimId].color;
    const lift = t * 18;
    const tilt = -0.55 * Math.min(1, t * 1.4);
    drawPotionBottle(x + 6, y + 10 - lift, color, 1.05, tilt);
    if (t > 0.35) {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.ellipse(x + 6, y + 16 - lift * 0.2, 1.4, 3 + t * 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    return;
  }
  if (!rightHand.item || rightHand.item.kind !== "potion") return;
  const color = POTIONS[rightHand.item.id].color;
  drawPotionBottle(x + 4, y + 12, color, 0.95, -0.15);
}


function limb(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  thick: number,
  color: string,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * (thick / 2);
  const ny = (dx / len) * (thick / 2);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1 + nx, y1 + ny);
  ctx.lineTo(x2 + nx, y2 + ny);
  ctx.lineTo(x2 - nx, y2 - ny);
  ctx.lineTo(x1 - nx, y1 - ny);
  ctx.closePath();
  ctx.fill();
}

function softBlob(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string,
  rot = 0,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(rx, 0);
  for (let i = 1; i <= 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const jagged = 1 + Math.sin(a * 3) * 0.04;
    ctx.lineTo(Math.cos(a) * rx * jagged, Math.sin(a) * ry * jagged);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBossArt(e: Enemy, x: number, y: number) {
  const bk = e.bossKind ?? "ironface";
  const f = e.facing >= 0 ? 1 : -1;
  const cx = x + e.w / 2;
  const footY = y + e.h;

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  softBlob(cx, footY + 2, e.w * 0.38, 6, "rgba(0,0,0,0.35)");

  ctx.save();
  ctx.translate(cx, 0);
  ctx.scale(f, 1);
  ctx.translate(-cx, 0);

  if (bk === "anaconda") {
    // Coiled serpent body — overlapping tapered segments, not a single oval
    const segs = 14;
    for (let i = 0; i < segs; i++) {
      const t = i / (segs - 1);
      const wave = Math.sin(time * 4 + i * 0.55) * 10;
      const sx = x + 18 + t * (e.w - 40);
      const sy = y + e.h * 0.55 + Math.sin(t * Math.PI * 2.2) * 14 + wave * 0.15;
      const r = 16 - t * 9;
      softBlob(sx, sy, r + 2, r * 0.75, i % 2 === 0 ? "#1f6b32" : "#2e8a42");
      // belly stripe
      softBlob(sx, sy + 3, r * 0.55, r * 0.28, "#c8e070");
    }
    // head
    const hx = x + e.w - 22;
    const hy = y + e.h * 0.42 + Math.sin(time * 4) * 3;
    softBlob(hx, hy, 18, 14, "#246b34");
    softBlob(hx + 10, hy + 2, 12, 9, "#1a5528");
    // jaw
    ctx.fillStyle = "#143d1c";
    ctx.beginPath();
    ctx.moveTo(hx + 8, hy + 6);
    ctx.lineTo(hx + 26, hy + 10);
    ctx.lineTo(hx + 8, hy + 14);
    ctx.closePath();
    ctx.fill();
    // fangs
    ctx.fillStyle = "#f4f0e6";
    ctx.fillRect(hx + 16, hy + 7, 2, 5);
    ctx.fillRect(hx + 20, hy + 8, 2, 4);
    // eyes
    ctx.fillStyle = "#ff3030";
    softBlob(hx - 2, hy - 4, 3.5, 3, "#ff3030");
    softBlob(hx + 6, hy - 5, 3.5, 3, "#ff3030");
    ctx.fillStyle = "#1a1010";
    ctx.fillRect(hx - 2, hy - 5, 2, 2);
    ctx.fillRect(hx + 6, hy - 6, 2, 2);
    // forked tongue
    ctx.strokeStyle = "#e04060";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(hx + 24, hy + 8);
    ctx.lineTo(hx + 34, hy + 6);
    ctx.moveTo(hx + 24, hy + 8);
    ctx.lineTo(hx + 34, hy + 11);
    ctx.stroke();
  } else if (bk === "ironface") {
    // Armored knight / iron giant
    limb(cx - 14, y + 70, cx - 18, footY - 4, 10, "#2a3038");
    limb(cx + 14, y + 70, cx + 18, footY - 4, 10, "#2a3038");
    softBlob(cx - 18, footY - 2, 10, 5, "#1a1010");
    softBlob(cx + 18, footY - 2, 10, 5, "#1a1010");
    softBlob(cx, y + 52, 28, 32, "#3a4058");
    // breastplate ridges
    ctx.fillStyle = "#6a7080";
    ctx.fillRect(cx - 18, y + 40, 36, 8);
    ctx.fillRect(cx - 16, y + 54, 32, 7);
    ctx.fillStyle = "#8a9098";
    ctx.fillRect(cx - 14, y + 42, 28, 3);
    // arms + fists
    limb(cx - 26, y + 38, cx - 36, y + 62, 9, "#4a5060");
    limb(cx + 26, y + 38, cx + 38, y + 58, 9, "#4a5060");
    softBlob(cx - 38, y + 64, 8, 7, "#c09070");
    softBlob(cx + 40, y + 60, 8, 7, "#c09070");
    // iron mask face
    softBlob(cx, y + 18, 20, 18, "#c09070");
    softBlob(cx, y + 16, 18, 14, "#8a9098");
    ctx.fillStyle = "#1a1010";
    ctx.fillRect(cx - 10, y + 12, 7, 5);
    ctx.fillRect(cx + 3, y + 12, 7, 5);
    ctx.fillStyle = "#ff3030";
    ctx.fillRect(cx - 8, y + 13, 3, 3);
    ctx.fillRect(cx + 5, y + 13, 3, 3);
    ctx.fillStyle = "#2a3038";
    ctx.fillRect(cx - 6, y + 22, 12, 3);
    // helm crest
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(cx - 3, y - 2, 6, 10);
  } else if (bk === "cloud") {
    // Storm spirit: ragged cloud cloak + humanoid under
    softBlob(cx - 22, y + 18, 20, 14, "#b8d4f0");
    softBlob(cx, y + 10, 26, 18, "#d0e6f8");
    softBlob(cx + 22, y + 18, 18, 13, "#a8c8e8");
    softBlob(cx + 8, y + 6, 12, 9, "#eef6ff");
    // rain wisps
    ctx.strokeStyle = "rgba(120,180,255,0.55)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      const rx = cx - 20 + i * 10;
      ctx.beginPath();
      ctx.moveTo(rx, y + 28);
      ctx.lineTo(rx - 2, y + 42 + (i % 2) * 4);
      ctx.stroke();
    }
    softBlob(cx, y + 48, 18, 24, "#5a80a8");
    softBlob(cx, y + 36, 14, 12, "#c09070");
    ctx.fillStyle = "#1a3048";
    ctx.fillRect(cx - 7, y + 34, 4, 4);
    ctx.fillRect(cx + 3, y + 34, 4, 4);
    limb(cx - 12, y + 50, cx - 20, y + 72, 7, "#5a80a8");
    limb(cx + 12, y + 50, cx + 18, y + 72, 7, "#5a80a8");
  } else if (bk === "mothman") {
    const flap = Math.sin(time * 10) * 12;
    // moth wings with vein detail
    ctx.fillStyle = "#5a4070";
    ctx.beginPath();
    ctx.moveTo(cx, y + 36);
    ctx.quadraticCurveTo(cx - 50, y + 8 + flap, cx - 44, y + 48);
    ctx.quadraticCurveTo(cx - 28, y + 56, cx, y + 44);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, y + 36);
    ctx.quadraticCurveTo(cx + 50, y + 8 - flap, cx + 44, y + 48);
    ctx.quadraticCurveTo(cx + 28, y + 56, cx, y + 44);
    ctx.fill();
    ctx.strokeStyle = "rgba(200,160,255,0.35)";
    ctx.beginPath();
    ctx.moveTo(cx - 8, y + 38);
    ctx.lineTo(cx - 36, y + 20 + flap * 0.5);
    ctx.moveTo(cx + 8, y + 38);
    ctx.lineTo(cx + 36, y + 20 - flap * 0.5);
    ctx.stroke();
    softBlob(cx, y + 50, 14, 26, "#3a2a48");
    softBlob(cx, y + 22, 13, 14, "#c09070");
    // glowing red eyes
    softBlob(cx - 5, y + 20, 3, 3.5, "#ff4040");
    softBlob(cx + 5, y + 20, 3, 3.5, "#ff4040");
    // antennae
    ctx.strokeStyle = "#2a1a30";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 4, y + 10);
    ctx.quadraticCurveTo(cx - 14, y - 4, cx - 10, y - 8);
    ctx.moveTo(cx + 4, y + 10);
    ctx.quadraticCurveTo(cx + 14, y - 4, cx + 10, y - 8);
    ctx.stroke();
    limb(cx - 8, y + 70, cx - 12, footY - 2, 6, "#3a2a48");
    limb(cx + 8, y + 70, cx + 12, footY - 2, 6, "#3a2a48");
  } else if (bk === "kingkong") {
    // Gorilla stance
    limb(cx - 10, y + 78, cx - 16, footY - 2, 12, "#4a2e1e");
    limb(cx + 10, y + 78, cx + 16, footY - 2, 12, "#4a2e1e");
        softBlob(cx, y + 58, 30, 34, "#5a3a28");
    softBlob(cx, y + 62, 18, 16, "#3a2418"); // chest darker
    // massive arms
    limb(cx - 28, y + 40, cx - 42, y + 78, 14, "#5a3a28");
    limb(cx + 28, y + 40, cx + 44, y + 72, 14, "#5a3a28");
    softBlob(cx - 44, y + 82, 11, 9, "#3a2418");
    softBlob(cx + 46, y + 76, 11, 9, "#3a2418");
    // head
    softBlob(cx, y + 22, 20, 20, "#6a4a34");
    softBlob(cx, y + 28, 14, 10, "#8a6a50"); // muzzle
    ctx.fillStyle = "#1a1010";
    ctx.fillRect(cx - 10, y + 16, 5, 5);
    ctx.fillRect(cx + 5, y + 16, 5, 5);
    ctx.fillStyle = "#c09070";
    ctx.fillRect(cx - 6, y + 30, 12, 4);
    // brow ridge
    ctx.fillStyle = "#3a2418";
    ctx.fillRect(cx - 14, y + 12, 28, 4);
  } else if (bk === "firefox") {
    // Fox / fire beast
    limb(cx - 12, y + 55, cx - 16, footY - 2, 8, "#a04018");
    limb(cx + 10, y + 55, cx + 16, footY - 2, 8, "#a04018");
    softBlob(cx, y + 42, 24, 22, "#c05020");
    softBlob(cx - 4, y + 44, 10, 10, "#ff9050");
    // bushy flaming tail
    for (let i = 0; i < 4; i++) {
      const tw = Math.sin(time * 8 + i) * 5;
      softBlob(
        cx - 28 - i * 8,
        y + 40 + i * 4 + tw,
        12 - i,
        9 - i * 0.5,
        i % 2 === 0 ? "#ffd24a" : "#ff6020",
      );
    }
    softBlob(cx + 6, y + 20, 16, 14, "#e07040");
    softBlob(cx + 16, y + 24, 10, 7, "#ff9050"); // snout
    softBlob(cx + 4, y + 10, 5, 6, "#c05020"); // ear
    softBlob(cx + 14, y + 8, 5, 6, "#c05020");
    ctx.fillStyle = "#1a1010";
    ctx.fillRect(cx + 2, y + 18, 3, 3);
    ctx.fillRect(cx + 10, y + 18, 3, 3);
    ctx.fillStyle = "#fff";
    ctx.fillRect(cx + 18, y + 22, 3, 2);
  } else if (bk === "minotaur") {
    limb(cx - 12, y + 72, cx - 16, footY - 2, 11, "#5a4030");
    limb(cx + 12, y + 72, cx + 16, footY - 2, 11, "#5a4030");
    softBlob(cx, y + 55, 26, 30, "#6a5030");
    softBlob(cx, y + 58, 16, 12, "#4a3820");
    // arms
    limb(cx - 24, y + 40, cx - 34, y + 66, 10, "#6a5030");
    limb(cx + 24, y + 40, cx + 36, y + 64, 10, "#6a5030");
    softBlob(cx, y + 22, 18, 18, "#c09070");
    // bull horns
    ctx.fillStyle = "#e8e0d0";
    ctx.beginPath();
    ctx.moveTo(cx - 12, y + 14);
    ctx.quadraticCurveTo(cx - 28, y - 6, cx - 22, y + 18);
    ctx.quadraticCurveTo(cx - 16, y + 16, cx - 12, y + 14);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 12, y + 14);
    ctx.quadraticCurveTo(cx + 28, y - 6, cx + 22, y + 18);
    ctx.quadraticCurveTo(cx + 16, y + 16, cx + 12, y + 14);
    ctx.fill();
    // snout + ring
    softBlob(cx, y + 28, 10, 7, "#a07858");
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, y + 32, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#1a1010";
    ctx.fillRect(cx - 8, y + 18, 4, 4);
    ctx.fillRect(cx + 4, y + 18, 4, 4);
  } else if (bk === "creeper") {
    const flap = Math.sin(time * 14) * 10;
    // torn cape / shadow wings
    ctx.fillStyle = "#2a3828";
    ctx.beginPath();
    ctx.moveTo(cx, y + 30);
    ctx.quadraticCurveTo(cx - 40, y + 4 + flap, cx - 30, y + 50);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, y + 30);
    ctx.quadraticCurveTo(cx + 40, y + 4 - flap, cx + 30, y + 50);
    ctx.fill();
    softBlob(cx, y + 48, 16, 28, "#1a2818");
    softBlob(cx, y + 24, 14, 14, "#2a3828");
    // eerie grin
    ctx.fillStyle = "#80ff60";
    ctx.fillRect(cx - 8, y + 22, 4, 4);
    ctx.fillRect(cx + 4, y + 22, 4, 4);
    ctx.fillStyle = "#4a6840";
    ctx.fillRect(cx - 8, y + 32, 16, 3);
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(cx - 7 + i * 4, y + 32, 2, 5);
    }
    limb(cx - 6, y + 70, cx - 10, footY - 2, 5, "#1a2818");
    limb(cx + 6, y + 70, cx + 10, footY - 2, 5, "#1a2818");
  } else if (bk === "sphinx") {
    // Lion body + human head + headdress
    softBlob(cx + 10, y + 58, 40, 22, "#c9a060");
    softBlob(cx - 10, y + 62, 18, 16, "#b89050");
    // legs
    limb(cx - 20, y + 70, cx - 24, footY - 2, 9, "#b89050");
    limb(cx + 8, y + 70, cx + 6, footY - 2, 9, "#b89050");
    limb(cx + 28, y + 68, cx + 34, footY - 2, 8, "#b89050");
    // tail
    ctx.strokeStyle = "#c9a060";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx + 48, y + 58);
    ctx.quadraticCurveTo(cx + 70, y + 40, cx + 66, y + 70);
    ctx.stroke();
    softBlob(cx + 66, y + 72, 6, 5, "#8a6840");
    // human head + nemes headdress
    softBlob(cx - 18, y + 28, 16, 18, "#e8c090");
    ctx.fillStyle = "#4a2030";
    ctx.beginPath();
    ctx.moveTo(cx - 36, y + 18);
    ctx.lineTo(cx - 18, y + 8);
    ctx.lineTo(cx - 2, y + 18);
    ctx.lineTo(cx - 6, y + 48);
    ctx.lineTo(cx - 32, y + 48);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(cx - 34, y + 20, 30, 3);
    ctx.fillStyle = "#1a1010";
    ctx.fillRect(cx - 24, y + 26, 4, 4);
    ctx.fillRect(cx - 14, y + 26, 4, 4);
  } else if (bk === "cerberus") {
    // Three-headed hellhound
    limb(cx - 18, y + 78, cx - 28, footY - 2, 12, "#3a1818");
    limb(cx + 18, y + 78, cx + 28, footY - 2, 12, "#3a1818");
    softBlob(cx, y + 62, 36, 28, "#4a2028");
    softBlob(cx, y + 66, 20, 14, "#2a1014");
    // shoulders / front paws
    limb(cx - 30, y + 55, cx - 48, y + 82, 11, "#4a2028");
    limb(cx + 30, y + 55, cx + 48, y + 80, 11, "#4a2028");
    const heads = [-34, 0, 34];
    for (let i = 0; i < 3; i++) {
      const hx = cx + heads[i]!;
      const dead = e.headHp && e.headHp[i]! <= 0;
      const hy = y + 22 + (i === 1 ? -4 : 2);
      softBlob(hx, hy, 16, 15, dead ? "#2a1010" : "#6a3038");
      if (!dead) {
        softBlob(hx + 8, hy + 4, 9, 7, "#8a4048");
        softBlob(hx - 4, hy - 2, 3, 3, "#ff4040");
        softBlob(hx + 4, hy - 2, 3, 3, "#ff4040");
        // ears
        softBlob(hx - 10, hy - 12, 4, 6, "#4a2028");
        softBlob(hx + 6, hy - 12, 4, 6, "#4a2028");
        ctx.fillStyle = "#f0c0a0";
        ctx.fillRect(hx + 6, hy + 6, 6, 3);
      }
      if (e.headHp) {
        ctx.fillStyle = "#1a1010";
        ctx.fillRect(hx - 14, hy - 22, 28, 4);
        ctx.fillStyle = dead ? "#333" : "#e04040";
        ctx.fillRect(hx - 14, hy - 22, 28 * (e.headHp[i]! / 1800), 4);
      }
    }
  } else {
    softBlob(cx, y + e.h / 2, e.w * 0.35, e.h * 0.4, "#5a6578");
  }

  ctx.restore();

  // HP / name (not flipped)
  if (bk !== "cerberus") {
    const bw = e.w - 10;
    ctx.fillStyle = "#1a1010";
    ctx.fillRect(x + 5, y - 22, bw, 6);
    ctx.fillStyle = "#e04040";
    ctx.fillRect(x + 5, y - 22, bw * (e.hp / e.maxHp), 6);
  }
  if (e.telegraph > 0) {
    ctx.fillStyle = "rgba(255,120,40,0.25)";
    ctx.fillRect(x - 8, y - 8, e.w + 16, e.h + 8);
  }
  ctx.fillStyle = "#f5c518";
  ctx.font = "8px monospace";
  ctx.fillText(e.name, x, y - 28);
}

function drawPlayer() {
  const x = player.x - camX;
  const y = player.y;
  const blink = invuln > 0 && Math.floor(time * 20) % 2 === 0;
  if (blink) return;

  ctx.save();
  if (invisTimer > 0) ctx.globalAlpha = 0.28;

  if (flyTimer > 0) {
    ctx.fillStyle = `rgba(74,168,255,${0.25 + Math.sin(time * 10) * 0.15})`;
    softBlob(x + player.w / 2, y + player.h / 2, 28, 36, `rgba(74,168,255,${0.25 + Math.sin(time * 10) * 0.15})`);
  }
  if (shieldTimer > 0 && shieldHp > 0) {
    ctx.strokeStyle = `rgba(255,122,217,${0.4 + Math.sin(time * 8) * 0.2})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x + player.w / 2, y + player.h / 2, 26, 34, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.save();
  if (facing < 0) {
    ctx.translate(x + player.w / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(x + player.w / 2), 0);
  }

  const cos = resolveLook();
  const px = x + player.w / 2;
  const legSwing = onGround
    ? Math.sin(time * (Math.abs(player.vx) > 20 ? 14 : 0)) * 4
    : 0;

  // shadow
  softBlob(px, y + player.h + 2, 13, 4, "rgba(0,0,0,0.28)");

  // boots
  const boot = armor.boots ? "#8a9098" : cos.boots;
  softBlob(px - 7, y + 48, 6, 4, boot);
  softBlob(px + 7, y + 48, 6, 4, boot);
  ctx.fillStyle = boot;
  ctx.fillRect(px - 10, y + 44, 8, 6);
  ctx.fillRect(px + 2, y + 44, 8, 6);

  // legs
  const pant = armor.pants ? "#3a5068" : cos.pants;
  limb(px - 5, y + 30, px - 7, y + 46 + legSwing, 7, pant);
  limb(px + 5, y + 30, px + 7, y + 46 - legSwing, 7, pant);

  // cape
  ctx.fillStyle = cos.cape;
  ctx.beginPath();
  ctx.moveTo(px - 10, y + 16);
  ctx.quadraticCurveTo(px - 18, y + 28, px - 12, y + 42);
  ctx.lineTo(px - 6, y + 18);
  ctx.fill();

  // torso
  const body = armor.chest ? "#6a7888" : cos.body;
  softBlob(px, y + 24, 11, 14, body);
  ctx.fillStyle = cos.accent;
  ctx.fillRect(px - 10, y + 22, 20, 3);

  // arms
  const skin = cos.skin;
  limb(px - 10, y + 18, px - 14, y + 32, 5, skin);
  limb(px + 10, y + 18, px + (attackT > 0 ? 22 : 14), y + (attackT > 0 ? 22 : 32), 5, skin);

  // head
  softBlob(px, y + 8, 9, 10, skin);
  // hair / helm
  const helmCol = armor.helm ? "#a0a8b0" : cos.helm;
  softBlob(px, y + 2, 10, 7, helmCol);
  ctx.fillStyle = helmCol;
  ctx.fillRect(px - 8, y - 4, 16, 6);
  ctx.fillStyle = cos.accent;
  ctx.fillRect(px - 9, y + 5, 18, 2);
  // eyes
  ctx.fillStyle = "#1a1a22";
  ctx.fillRect(px - 4, y + 8, 3, 3);
  ctx.fillRect(px + 2, y + 8, 3, 3);
  // mouth
  ctx.fillStyle = "#8a5040";
  ctx.fillRect(px - 2, y + 13, 4, 1);

  applyCosmeticOverlays(ctx, x, y, facing);

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
    softBlob(x + 28, y + 4, 7, 7, "#b44dff");
  } else if (swinging) {
    softBlob(x + 30, y + 20, 8, 5, "#e8b896");
  } else {
    softBlob(x + 26, y + 22, 4, 6, "#e8b896");
  }

  if (wpn !== "fist" && weaponEnchanted[wpn]) {
    ctx.fillStyle = `rgba(180,77,255,${0.5 + Math.sin(time * 12) * 0.4})`;
    ctx.fillRect(x + 26, y + 12, 3, 3);
    ctx.fillRect(x + 32, y + 20, 2, 2);
  }

  for (const slot of ["helm", "chest", "pants", "boots"] as ArmorSlot[]) {
    if (armor[slot] && armorEnchant[slot] > 0) {
      ctx.fillStyle = `rgba(180,77,255,${0.35 + Math.sin(time * 9 + armorEnchant[slot] * 10) * 0.25})`;
      if (slot === "helm") ctx.fillRect(x + 12, y - 4, 2, 2);
      if (slot === "chest") ctx.fillRect(x + 14, y + 16, 2, 2);
      if (slot === "pants") ctx.fillRect(x + 10, y + 34, 2, 2);
      if (slot === "boots") ctx.fillRect(x + 20, y + 46, 2, 2);
    }
  }

  ctx.restore();
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
    softBlob(x + 15, y + 40, 7, 5, "#2a4a28");
    softBlob(x + 10, y + 40, 5, 4, "#2a4a28");
    softBlob(x + 20, y + 40, 5, 4, "#2a4a28");
    softBlob(x + 15, y + 26, 11, 12, "#3d7a3a");
    softBlob(x + 15, y + 10, 9, 8, "#6aaa58");
    // ears
    softBlob(x + 6, y + 6, 3, 5, "#6aaa58");
    softBlob(x + 24, y + 6, 3, 5, "#6aaa58");
    ctx.fillStyle = "#1a2a18";
    ctx.fillRect(x + 11, y + 8, 3, 3);
    ctx.fillRect(x + 17, y + 8, 3, 3);
  } else if (e.kind === "bat") {
    const flap = Math.sin(time * 12) * 6;
    ctx.fillStyle = "#6a4a8a";
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 10);
    ctx.quadraticCurveTo(x - 4, y + 2 + flap, x + 8, y + 16);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 10);
    ctx.quadraticCurveTo(x + 32, y + 2 - flap, x + 20, y + 16);
    ctx.fill();
    softBlob(x + 14, y + 12, 7, 6, "#2a1a3a");
    ctx.fillStyle = "#ff6060";
    ctx.fillRect(x + 11, y + 10, 2, 2);
    ctx.fillRect(x + 16, y + 10, 2, 2);
  } else if (e.kind === "bruiser") {
    softBlob(x + 16, y + 42, 8, 5, "#3a2a48");
    softBlob(x + 10, y + 42, 5, 4, "#3a2a48");
    softBlob(x + 22, y + 42, 5, 4, "#3a2a48");
    softBlob(x + 16, y + 28, 13, 14, "#5a4068");
    softBlob(x + 16, y + 10, 10, 10, "#c09070");
    ctx.fillStyle = "#2a1a28";
    ctx.fillRect(x + 12, y + 8, 3, 3);
    ctx.fillRect(x + 18, y + 8, 3, 3);
    ctx.fillStyle = "#8a3040";
    ctx.fillRect(x + 12, y + 14, 10, 2);
    const handX = e.facing >= 0 ? x + 26 : x - 4;
    limb(handX, y + 18, handX, y + 36, 5, "#6a4020");
    softBlob(handX, y + 14, 7, 7, "#8a9098");
  } else {
    drawBossArt(e, x, y);
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

function drawPlatTraps() {
  for (const t of platTraps) {
    const x = t.x - camX;
    if (x + t.w < -10 || x > W + 10) continue;
    ctx.fillStyle = "#4a3030";
    ctx.fillRect(x, t.y + 8, t.w, 4);
    ctx.fillStyle = "#c0c8d0";
    const spikes = 5;
    for (let i = 0; i < spikes; i++) {
      const sx = x + 3 + i * ((t.w - 6) / (spikes - 1));
      ctx.beginPath();
      ctx.moveTo(sx, t.y + 10);
      ctx.lineTo(sx + 3, t.y);
      ctx.lineTo(sx + 6, t.y + 10);
      ctx.fill();
    }
  }
}

function drawGroundDrops() {
  for (const d of groundDrops) {
    const x = d.x - camX;
    const y = d.y + Math.sin(d.bob) * 3;
    if (x < -40 || x > W + 40) continue;
    if (d.kind === "weapon") {
      ctx.fillStyle = "#6a4a28";
      ctx.fillRect(x, y + 6, d.w, 6);
      ctx.fillStyle = "#c0d0e0";
      ctx.fillRect(x + 4, y + 2, d.w - 6, 4);
    } else {
      ctx.fillStyle = "#708090";
      ctx.fillRect(x + 2, y, d.w - 4, d.h);
      ctx.fillStyle = "#c9a227";
      ctx.fillRect(x + 4, y + 6, d.w - 8, 3);
    }
    if (d.enchanted || d.sparkle > 0) {
      const pulse = 0.4 + Math.sin(time * 14) * 0.35;
      ctx.fillStyle = `rgba(180,77,255,${pulse})`;
      ctx.fillRect(x + 2, y - 4, 3, 3);
      ctx.fillRect(x + d.w - 6, y + 2, 3, 3);
      ctx.fillRect(x + d.w / 2, y + d.h, 2, 2);
    }
  }
}

function drawAllies() {
  for (const a of allies) {
    if (!a.alive) continue;
    const x = a.x - camX;
    const y = a.y;
    if (x + a.w < -20 || x > W + 20) continue;
    ctx.fillStyle = "#4a3068";
    ctx.fillRect(x + 4, y + 14, 14, 16);
    ctx.fillStyle = "#e8b896";
    ctx.fillRect(x + 5, y + 2, 12, 12);
    ctx.fillStyle = "#ff7ad9";
    ctx.fillRect(x + 4, y, 14, 4);
    // magic staff
    const sx = a.facing > 0 ? x + 16 : x - 2;
    ctx.fillStyle = "#6a4080";
    ctx.fillRect(sx, y + 4, 3, 26);
    ctx.fillStyle = "#b44dff";
    ctx.beginPath();
    ctx.arc(sx + 1, y + 4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(180,77,255,${0.4 + Math.sin(time * 10) * 0.3})`;
    ctx.fillRect(sx - 1, y + 2, 2, 2);
    ctx.fillStyle = "#1a1010";
    ctx.fillRect(x + 2, y - 6, a.w - 4, 3);
    ctx.fillStyle = "#ff7ad9";
    ctx.fillRect(x + 2, y - 6, (a.w - 4) * (a.hp / a.maxHp), 3);
  }
}

function drawThrownBottles() {
  for (const b of thrownBottles) {
    if (!b.alive) continue;
    const x = b.x - camX;
    const y = b.y;
    drawPotionBottle(x + b.w / 2, y + b.h / 2, b.color, 1.15, b.spin);
    // trail droplets
    ctx.fillStyle = b.color;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(x - b.vx * 0.02 + 4, y - b.vy * 0.02 + 4, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawPotionFx() {
  if (pourAnimT > 0) {
    const x = pourAnimX - camX;
    const y = pourAnimY;
    drawPotionBottle(x, y - 30, "#b44dff", 1.25, 0.85);
    ctx.strokeStyle = `rgba(180,77,255,${0.55 + Math.sin(time * 20) * 0.3})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x + 6, y - 18);
    ctx.quadraticCurveTo(
      x + 4 + Math.sin(time * 28) * 4,
      y - 8,
      x + Math.sin(time * 22) * 2,
      y,
    );
    ctx.stroke();
    ctx.fillStyle = "rgba(180,77,255,0.55)";
    ctx.beginPath();
    ctx.arc(x + Math.sin(time * 22) * 2, y + 2, 3, 0, Math.PI * 2);
    ctx.fill();
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
    } else if (p.kind === "club") {
      ctx.save();
      ctx.translate(x + p.w / 2, p.y + p.h / 2);
      ctx.rotate(time * 10 * (p.vx >= 0 ? 1 : -1));
      ctx.fillStyle = "#6a4020";
      ctx.fillRect(-3, -8, 6, 16);
      ctx.fillStyle = "#8a9098";
      ctx.beginPath();
      ctx.arc(0, -9, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#c0c8d0";
      ctx.fillRect(-4, -12, 3, 3);
      ctx.fillRect(1, -11, 3, 3);
      ctx.restore();
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
    hp: PLAYER_MAX_HP,
    maxHp: PLAYER_MAX_HP,
  });
  // coins + costumes persist in localStorage — do not wipe bank
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
  for (const k of Object.keys(weaponEnchanted) as WeaponId[])
    weaponEnchanted[k] = false;
  for (const k of Object.keys(armorEnchant) as ArmorSlot[]) armorEnchant[k] = 0;
  facing = 1;
  invuln = 0;
  attackT = 0;
  attackCd = 0;
  flyTimer = 0;
  invisTimer = 0;
  shieldHp = 0;
  shieldTimer = 0;
  venomDot = 0;
  venomAcc = 0;
  enchantSparkleT = 0;
  drinkAnimT = 0;
  drinkAnimId = null;
  pourAnimT = 0;
  potionBusy = false;
  lootReveal = null;
  barChestSaves = {};
  projectiles.length = 0;
  hazards.length = 0;
  platTraps.length = 0;
  groundDrops.length = 0;
  allies.length = 0;
  thrownBottles.length = 0;
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
      text: "İçilen: Pigeon / TheReeker / Recovery. Atılan: Krypton. Yere atılan: Enchant / Splındog.",
    },
    { name: "SEN", text: "Kardeşimi bulacağım." },
    {
      name: "???",
      text: "Enchant için eşyayı Q/G/U ile yere koy, iksiri üstüne at. Splındog asalı yoldaş çağırır.",
    },
  ]);
}

function frame(dt: number) {
  time += dt;
  if (shake > 0) shake = Math.max(0, shake - dt * 30);

  if (lootReveal) {
    updateLootReveal(dt);
    handleInput(dt);
    updateParticles(dt);
    if (scene === "world") {
      camX = player.x + player.w / 2 - W * 0.35;
      camX = Math.max(0, Math.min(camX, WORLD_W - W));
    } else camX = 0;
  } else if (state === "playing" || state === "dialog" || state === "spectate") {
    if (state === "playing") {
      handleInput(dt);
      resolvePlayer(dt);
      tickVenomDot(dt);
      updateEnemies(dt);
      updateAllies(dt);
      updateHazards(dt);
      updatePlatTraps(dt);
      updateItems(dt);
      updateGroundDrops(dt);
      updateProjectiles(dt);
      updateThrownBottles(dt);
      updatePotionAnims(dt);
      updateBots(dt);
    } else if (state === "spectate") {
      updateEnemies(dt);
      updateAllies(dt);
      updateHazards(dt);
      updatePlatTraps(dt);
      updateProjectiles(dt);
      updateThrownBottles(dt);
      updatePotionAnims(dt);
      updateBots(dt);
      checkMpRoundEnd();
    } else {
      handleInput(dt);
    }
    updateParticles(dt);
    invuln = Math.max(0, invuln - dt);

    if (state !== "spectate") {
      if (scene === "world") {
        camX = player.x + player.w / 2 - W * 0.35;
        camX = Math.max(0, Math.min(camX, WORLD_W - W));
      } else {
        camX = 0;
      }
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
    drawGroundDrops();
    drawAllies();
  } else {
    drawBuildings();
    drawPlatforms(platforms);
    drawPlatTraps();
    drawHazards();
    drawGroundDrops();
    for (const it of items) drawWorldItem(it);
    for (const e of enemies) drawEnemy(e);
    drawAllies();
  }
  drawProjectiles();
  drawThrownBottles();
  drawPotionFx();
  if (state !== "title" && state !== "spectate") drawPlayer();
  if (state !== "title") drawMpPeers();
  drawParticles();
  ctx.restore();
  drawLootReveal();
}

let last = performance.now();
function loop(now: number) {
  // Always reschedule first so one frame error cannot freeze the game.
  requestAnimationFrame(loop);
  try {
    let dt = Math.min(0.033, (now - last) / 1000);
    if (!Number.isFinite(dt) || dt < 0) dt = 1 / 60;
    last = now;
    frame(dt);
  } catch (err) {
    console.error("[Wack The Man] frame error:", err);
  }
}

function startGame() {
  playMode = "solo";
  startGameWithMode("solo", []);
}

function restartFromOverlay() {
  if (playMode !== "solo") {
    returnToHub();
    return;
  }
  ensureAudio();
  hideOverlay();
  resetGame();
  setupMultiplayer([]);
  state = dialogQueue.length ? "dialog" : "playing";
  if (state === "dialog") showDialogLine();
}

window.addEventListener("keydown", (e) => {
  keys.add(e.key);
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key))
    e.preventDefault();
  if (e.key === "r" || e.key === "R") {
    if (state === "spectate" || (playMode !== "solo" && state === "dead")) {
      returnToHub();
      return;
    }
    if (
      state === "playing" ||
      state === "dead" ||
      state === "win" ||
      state === "dialog"
    ) {
      hideOverlay();
      playMode = "solo";
      resetGame();
      setupMultiplayer([]);
      state = dialogQueue.length ? "dialog" : "playing";
      if (state === "dialog") showDialogLine();
    }
  }
  if (e.key === "c" || e.key === "C") usePotion();
  if ((e.key === "q" || e.key === "Q") && !e.repeat) dropLeftHand();
  if ((e.key === "g" || e.key === "G") && !e.repeat) dropRightHand();
  if ((e.key === "u" || e.key === "U") && !e.repeat) dropArmorPiece();
  if (e.key === "Enter" && state === "title") startGame();
});
window.addEventListener("keyup", (e) => keys.delete(e.key));
window.addEventListener("blur", () => keys.clear());
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    keys.clear();
  } else {
    last = performance.now();
  }
});

document.querySelector("#btn-start")!.addEventListener("click", startGame);
document
  .querySelector("#btn-restart")!
  .addEventListener("click", restartFromOverlay);
document.querySelector("#btn-shop")!.addEventListener("click", (e) => {
  e.preventDefault();
  openShop();
});
document.querySelector("#btn-shop-open")!.addEventListener("click", (e) => {
  e.preventDefault();
  openShop();
});
document.querySelector("#btn-shop-close")!.addEventListener("click", (e) => {
  e.preventDefault();
  closeShop();
});
shopPanel.addEventListener("pointerdown", (e) => {
  if (e.target === shopPanel) closeShop();
});
document.querySelector("#btn-settings-open")!.addEventListener("click", (e) => {
  e.preventDefault();
  openSettings();
});
document.querySelector("#btn-settings-close")!.addEventListener("click", (e) => {
  e.preventDefault();
  closeSettings();
});
settingsPanel.addEventListener("pointerdown", (e) => {
  if (e.target === settingsPanel) closeSettings();
});
document.querySelector("#btn-lobby")!.addEventListener("click", (e) => {
  e.preventDefault();
  openLobby();
});
document.querySelector("#btn-lobby-close")!.addEventListener("click", (e) => {
  e.preventDefault();
  closeLobby();
});
lobbyPanel.addEventListener("pointerdown", (e) => {
  if (e.target === lobbyPanel) closeLobby();
});
document.querySelector("#btn-mode-peaceful")!.addEventListener("click", (e) => {
  e.preventDefault();
  lobbyModePick = "peaceful";
  refreshLobbyUi();
});
document.querySelector("#btn-mode-survivor")!.addEventListener("click", (e) => {
  e.preventDefault();
  lobbyModePick = "survivor";
  refreshLobbyUi();
});
document.querySelector("#btn-lobby-start")!.addEventListener("click", (e) => {
  e.preventDefault();
  startLobbyMatch();
});
document.querySelector("#btn-room-host")!.addEventListener("click", (e) => {
  e.preventDefault();
  hostRoom();
});
document.querySelector("#btn-room-join")!.addEventListener("click", (e) => {
  e.preventDefault();
  joinRoom();
});
document.querySelector("#btn-auth-login")!.addEventListener("click", (e) => {
  e.preventDefault();
  loginAccount();
});
document.querySelector("#btn-auth-register")!.addEventListener("click", (e) => {
  e.preventDefault();
  registerAccount();
});
document.querySelector("#btn-friend-search")!.addEventListener("click", (e) => {
  e.preventDefault();
  searchFriends();
});
friendSearchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchFriends();
  }
});

function bindHold(sel: string, key: string) {
  const el = document.querySelector<HTMLElement>(sel)!;
  const on = (ev: PointerEvent) => {
    ev.preventDefault();
    try {
      el.setPointerCapture(ev.pointerId);
    } catch {
      /* ignore */
    }
    keys.add(key);
  };
  const off = (ev: Event) => {
    ev.preventDefault();
    keys.delete(key);
  };
  el.addEventListener("pointerdown", on);
  el.addEventListener("pointerup", off);
  el.addEventListener("pointercancel", off);
  el.addEventListener("lostpointercapture", off);
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
document.querySelector("#btn-drop")!.addEventListener("click", (e) => {
  e.preventDefault();
  if (leftHand.item?.kind === "weapon") dropLeftHand();
  else dropRightHand();
});
document.querySelector("#btn-armor")!.addEventListener("click", (e) => {
  e.preventDefault();
  dropArmorPiece();
});
dialogEl.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  if (lootReveal) {
    lootReveal.t = Math.max(lootReveal.t, lootReveal.duration - 0.05);
    return;
  }
  if (state === "dialog") advanceDialog();
});

canvas.addEventListener("pointerdown", (e) => {
  if (!lootReveal) return;
  e.preventDefault();
  lootReveal.t = Math.max(lootReveal.t, lootReveal.duration - 0.05);
});

(function seedDemoAccounts() {
  const map = loadAccounts();
  if (Object.keys(map).length > 0) return;
  const demos = ["NeonKid", "BarRat", "ShadowFox"];
  for (const u of demos) {
    map[u.toLowerCase()] = {
      user: u,
      pass: "1234",
      coins: 20,
      owned: [],
      equipped: {},
      friends: [],
      incoming: [],
      outgoing: [],
    };
  }
  saveAccounts(map);
})();
loadSave();
if (currentUser) {
  authUserInput.value = currentUser;
  authStatus.textContent = `Giriş: ${currentUser}`;
}
refreshShopUi();
refreshFriendsUi();
refreshTitleWallet();
drawProfileFace();
state = "title";
buildWorld();
player.x = 200;
updateHud();
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
