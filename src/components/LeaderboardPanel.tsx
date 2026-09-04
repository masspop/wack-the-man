import { useEffect, useState } from "react";
import { ProfileAvatar } from "./ProfileAvatar";
import {
  fetchLeaderboard,
  frameCss,
  type LeaderboardEntry,
} from "../data/leaderboard";
import { isLeaderboardConfigured } from "../data/leaderboardConfig";
import { getProfileById } from "../data/shop";
interface Props {
  open: boolean;
  onClose: () => void;
  myPlayerId: string;
}
export function LeaderboardPanel({ open, onClose, myPlayerId }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [mode, setMode] = useState<"remote" | "local">("local");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetchLeaderboard(50).then((res) => {
      if (cancelled) return;
      setEntries(res.entries);
      setMode(res.mode);
      setError(res.error ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);
  if (!open) return null;
  return (
    <div className="lb-overlay" role="dialog" aria-modal="true">
      <div className="lb-panel">
        <header className="lb-header">
          <div>
            <h2>Leaderboard</h2>
            <p className="lb-sub">
              En az 1 bileşik satanlar · sıralama kazanca göre
            </p>
          </div>
          <button type="button" className="lb-close" onClick={onClose}>
            ✕
          </button>
        </header>
        {!isLeaderboardConfigured() && (
          <p className="lb-banner">
            Şimdilik bu cihazda kaydediliyor. Global liste için Supabase
            bağlanınca herkes görünür.
          </p>
        )}
        {mode === "remote" && (
          <p className="lb-banner lb-banner-ok">Global liste açık.</p>
        )}
        {error && <p className="lb-banner lb-banner-err">{error}</p>}
        <div className="lb-list">
          {loading && <p className="lb-empty">Yükleniyor…</p>}
          {!loading && entries.length === 0 && (
            <p className="lb-empty">
              Henüz kimse yok. Bir bileşik karıştırıp sat — listede yerin
              açılsın.
            </p>
          )}
          {!loading &&
            entries.map((e, i) => {
              const color = frameCss(e.frame_hue);
              const mine = e.player_id === myPlayerId;
              const profileLabel = getProfileById(e.profile_id).name;
              return (
                <div
                  key={e.player_id}
                  className={`lb-row${mine ? " lb-row-me" : ""}`}
                >
                  <span className="lb-rank">#{i + 1}</span>
                  <span
                    className="lb-avatar-wrap"
                    style={{ ["--lb-frame" as string]: color }}
                  >
                    <ProfileAvatar id={e.profile_id} className="lb-avatar" />
                  </span>
                  <div className="lb-meta">
                    <span className="lb-name" style={{ color }}>
                      {e.display_name}
                      {mine ? " · sen" : ""}
                    </span>
                    <span className="lb-profile">
                      {profileLabel} · Lv {e.level} · {e.compounds_done} bileşik
                    </span>
                  </div>
                  <span className="lb-money">
                    ${e.money.toLocaleString("tr-TR")}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
