/** Paste Supabase project values here (anon key is public by design). */
export const LEADERBOARD_CONFIG = {
  /** e.g. https://xxxx.supabase.co */
  url: "",
  /** Project Settings → API → anon public */
  anonKey: "",
};
export function isLeaderboardConfigured(): boolean {
  return Boolean(LEADERBOARD_CONFIG.url.trim() && LEADERBOARD_CONFIG.anonKey.trim());
}
