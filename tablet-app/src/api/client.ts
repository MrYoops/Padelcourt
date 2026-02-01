import { API_BASE } from "./config";
import type { Player } from "@/types";

export interface UserResponse {
  id: string;
  telegram_id: number | null;
  name: string;
  phone: string | null;
  photo_url: string | null;
  is_pro: boolean;
}

export interface MatchStartBody {
  position_1_user_id: string;
  position_2_user_id: string;
  position_3_user_id: string;
  position_4_user_id: string;
  court_id?: string;
}

export interface MatchResponse {
  id: string;
  court_id: string;
  started_at: string;
  ended_at: string | null;
  status: string;
  team_a_player_ids: string[];
  team_b_player_ids: string[];
  score: {
    sets_a: number;
    sets_b: number;
    games_a: number[];
    games_b: number[];
    points_a: number | string;
    points_b: number | string;
  };
}

export async function fetchUser(id: string): Promise<Player> {
  const res = await fetch(`${API_BASE}/users/${id}`);
  if (!res.ok) throw new Error("User not found");
  const data: UserResponse = await res.json();
  return {
    id: data.id,
    name: data.name,
    photoUrl: data.photo_url ?? undefined,
  };
}

export async function startMatch(body: MatchStartBody): Promise<MatchResponse> {
  const res = await fetch(`${API_BASE}/matches/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      position_1_user_id: body.position_1_user_id,
      position_2_user_id: body.position_2_user_id,
      position_3_user_id: body.position_3_user_id,
      position_4_user_id: body.position_4_user_id,
      court_id: body.court_id,
    }),
  });
  if (!res.ok) throw new Error("Failed to start match");
  return res.json();
}

export async function addPoint(matchId: string, team: "A" | "B"): Promise<MatchResponse> {
  const res = await fetch(`${API_BASE}/matches/${matchId}/point`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ team }),
  });
  if (!res.ok) throw new Error("Failed to add point");
  return res.json();
}

export async function undoPoint(matchId: string): Promise<MatchResponse> {
  const res = await fetch(`${API_BASE}/matches/${matchId}/undo`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to undo");
  return res.json();
}

export async function addHighlight(matchId: string, timestampSec: number): Promise<MatchResponse> {
  const res = await fetch(
    `${API_BASE}/matches/${matchId}/highlight?timestamp_sec=${timestampSec}`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error("Failed to add highlight");
  return res.json();
}

export async function sideChange(matchId: string): Promise<MatchResponse> {
  const res = await fetch(`${API_BASE}/matches/${matchId}/side-change`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to change sides");
  return res.json();
}

export async function endMatch(matchId: string): Promise<MatchResponse> {
  const res = await fetch(`${API_BASE}/matches/${matchId}/end`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to end match");
  return res.json();
}

export async function getMatch(matchId: string): Promise<MatchResponse> {
  const res = await fetch(`${API_BASE}/matches/${matchId}`);
  if (!res.ok) throw new Error("Match not found");
  return res.json();
}

/** Upload match video (stub: call when FFmpeg recording is done). */
export async function uploadMatchVideo(matchId: string, file: Blob): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file, "match.mp4");
  const res = await fetch(`${API_BASE}/videos/${matchId}/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Failed to upload video");
  const data = await res.json();
  return { url: data.url };
}
