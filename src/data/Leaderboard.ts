import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_NAME_ID,
  DEFAULT_PROFILE_ID,
  getNameById,
  getProfileById,
} from "./shop";
import { isLeaderboardConfigured, LEADERBOARD_CONFIG } from "./leaderboardConfig";
export interface LeaderboardEntry {
  player_id: string;
  display_name: string;
  profile_id: string;
  frame_hue: number;
  money: number;
  level: number;
  compounds_done: number;
  updated_at: string;
}
export interface LeaderboardPayload {
  playerId: string;
  frameHue: number;
  displayNameId: string;
  profileId: string;
  money: number;
  level: number;
  compoundsDone: number;
}
const LOCAL_LB_KEY = "heisenberg-lab-leaderboard-local-v1";
let client: SupabaseClient | null = null;
function getClient(): SupabaseClient | null {
  if (!isLeaderboardConfigured()) return null;
  if (!client) {
    client = createClient(LEADERBOARD_CONFIG.url, LEADERBOARD_CONFIG.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
function readLocalBoard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_LB_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LeaderboardEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function writeLocalBoard(entries: LeaderboardEntry[]) {
  try {
    localStorage.setItem(LOCAL_LB_KEY, JSON.stringify(entries.slice(0, 100)));
  } catch {
    /* ignore */
  }
}
function toEntry(payload: LeaderboardPayload): LeaderboardEntry {
  return {
    player_id: payload.playerId,
    display_name: getNameById(payload.displayNameId).label,
    profile_id: payload.profileId || DEFAULT_PROFILE_ID,
    frame_hue: ((payload.frameHue % 360) + 360) % 360,
    money: Math.max(0, Math.floor(payload.money)),
    level: Math.max(1, Math.floor(payload.level)),
    compounds_done: Math.max(0, Math.floor(payload.compoundsDone)),
    updated_at: new Date().toISOString(),
  };
}
function sortEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => {
    if (b.money !== a.money) return b.money - a.money;
    if (b.compounds_done !== a.compounds_done) return b.compounds_done - a.compounds_done;
    if (b.level !== a.level) return b.level - a.level;
    return a.display_name.localeCompare(b.display_name, "tr");
  });
}
export async function submitLeaderboardScore(
  payload: LeaderboardPayload
): Promise<{ ok: boolean; mode: "remote" | "local" | "skipped"; error?: string }> {
  if (payload.compoundsDone < 1) return { ok: true, mode: "skipped" };
  const entry = toEntry(payload);
  const sb = getClient();
  if (sb) {
    const { error } = await sb.from("leaderboard").upsert(
      {
        player_id: entry.player_id,
        display_name: entry.display_name,
        profile_id: entry.profile_id,
        frame_hue: entry.frame_hue,
        money: entry.money,
        level: entry.level,
        compounds_done: entry.compounds_done,
        updated_at: entry.updated_at,
      },
      { onConflict: "player_id" }
    );
    if (error) return { ok: false, mode: "remote", error: error.message };
    return { ok: true, mode: "remote" };
  }
  const board = readLocalBoard().filter((e) => e.player_id !== entry.player_id);
  board.push(entry);
  writeLocalBoard(sortEntries(board));
  return { ok: true, mode: "local" };
}
export async function fetchLeaderboard(
  limit = 50
): Promise<{ entries: LeaderboardEntry[]; mode: "remote" | "local"; error?: string }> {
  const sb = getClient();
  if (sb) {
    const { data, error } = await sb
      .from("leaderboard")
      .select(
        "player_id, display_name, profile_id, frame_hue, money, level, compounds_done, updated_at"
      )
      .gte("compounds_done", 1)
      .order("money", { ascending: false })
      .order("compounds_done", { ascending: false })
      .limit(limit);
    if (error) {
      return { entries: sortEntries(readLocalBoard()), mode: "local", error: error.message };
    }
    return { entries: (data as LeaderboardEntry[]) ?? [], mode: "remote" };
  }
  return {
    entries: sortEntries(readLocalBoard()).filter((e) => e.compounds_done >= 1),
    mode: "local",
  };
}
export function frameCss(hue: number): string {
  const h = ((hue % 360) + 360) % 360;
  return `hsl(${h} 82% 58%)`;
}
export function isDefaultCosmetics(profileId: string, nameId: string): boolean {
  return profileId === DEFAULT_PROFILE_ID && nameId === DEFAULT_NAME_ID;
}
export function getProfileLabel(profileId: string): string {
  return getProfileById(profileId).name;
}
