import type { MatchResponse } from "@/api/client";

function formatPoint(p: number | string): string {
  if (p === "adv") return "AD";
  if (typeof p === "number") {
    if (p === 0) return "0";
    if (p === 15) return "15";
    if (p === 30) return "30";
    if (p === 40) return "40";
  }
  return String(p);
}

export function useScore(score: MatchResponse["score"] | null) {
  if (!score) {
    return {
      setsA: 0,
      setsB: 0,
      gamesA: [0],
      gamesB: [0],
      pointsA: "0",
      pointsB: "0",
      currentSet: 0,
    };
  }
  const gamesA = score.games_a ?? [0];
  const gamesB = score.games_b ?? [0];
  const currentSet = Math.max(gamesA.length - 1, gamesB.length - 1, 0);
  return {
    setsA: score.sets_a ?? 0,
    setsB: score.sets_b ?? 0,
    gamesA,
    gamesB,
    pointsA: formatPoint(score.points_a ?? 0),
    pointsB: formatPoint(score.points_b ?? 0),
    currentSet,
  };
}
