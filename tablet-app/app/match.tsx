import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "@/store/useAppStore";
import { useScore } from "@/src/hooks/useScore";
import {
  addPoint,
  undoPoint,
  addHighlight,
  sideChange,
  endMatch,
} from "@/api/client";

export default function MatchScreen() {
  const router = useRouter();
  const { matchId, matchScore, positions, setMatchScore } = useAppStore();
  const score = useScore(matchScore);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateFromResponse = useCallback(
    (res: { score: typeof matchScore }) => {
      setMatchScore(res.score);
    },
    [setMatchScore]
  );

  const handlePoint = useCallback(
    async (team: "A" | "B") => {
      if (!matchId) return;
      setLoading("point");
      setError(null);
      try {
        const res = await addPoint(matchId, team);
        updateFromResponse(res);
      } catch {
        setError("Ошибка добавления очка");
      } finally {
        setLoading(null);
      }
    },
    [matchId, updateFromResponse]
  );

  const handleUndo = useCallback(async () => {
    if (!matchId) return;
    setLoading("undo");
    setError(null);
    try {
      const res = await undoPoint(matchId);
      updateFromResponse(res);
    } catch {
      setError("Ошибка отмены");
    } finally {
      setLoading(null);
    }
  }, [matchId, updateFromResponse]);

  const handleHighlight = useCallback(async () => {
    if (!matchId) return;
    setLoading("highlight");
    setError(null);
    try {
      const res = await addHighlight(matchId, Date.now() / 1000);
      updateFromResponse(res);
    } catch {
      setError("Ошибка хайлайта");
    } finally {
      setLoading(null);
    }
  }, [matchId, updateFromResponse]);

  const handleSideChange = useCallback(async () => {
    if (!matchId) return;
    setLoading("side");
    setError(null);
    try {
      const res = await sideChange(matchId);
      updateFromResponse(res);
    } catch {
      setError("Ошибка смены сторон");
    } finally {
      setLoading(null);
    }
  }, [matchId, updateFromResponse]);

  const handleEnd = useCallback(async () => {
    if (!matchId) return;
    setLoading("end");
    setError(null);
    try {
      await endMatch(matchId);
      router.replace("/finished");
    } catch {
      setError("Ошибка завершения");
    } finally {
      setLoading(null);
    }
  }, [matchId, router]);

  const teamANames = [positions[1]?.name, positions[2]?.name].filter(Boolean).join(" & ") || "Team A";
  const teamBNames = [positions[3]?.name, positions[4]?.name].filter(Boolean).join(" & ") || "Team B";

  return (
    <View style={styles.container}>
      <Text style={styles.teamLabel}>🟢 {teamANames}</Text>
      <Text style={styles.score}>
        {score.setsA} : {score.setsB}
      </Text>
      <Text style={styles.games}>
        [{score.gamesA[score.currentSet] ?? 0}] - [{score.gamesB[score.currentSet] ?? 0}]
      </Text>
      <Text style={styles.points}>
        {score.pointsA} - {score.pointsB}
      </Text>
      <Text style={styles.teamLabel}>🔵 {teamBNames}</Text>

      <View style={styles.recBadge}>
        <Text style={styles.recText}>◉ REC</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.btn, styles.btnA]}
          onPress={() => handlePoint("A")}
          disabled={!!loading}
        >
          <Text style={styles.btnText}>+1 🟢</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnB]}
          onPress={() => handlePoint("B")}
          disabled={!!loading}
        >
          <Text style={styles.btnText}>+1 🔵</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.btn, styles.btnSecondary]}
          onPress={handleUndo}
          disabled={!!loading}
        >
          <Text style={styles.btnText}>Отмена</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnSecondary]}
          onPress={handleHighlight}
          disabled={!!loading}
        >
          <Text style={styles.btnText}>Хайлайт!</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.btn, styles.btnSide]}
        onPress={handleSideChange}
        disabled={!!loading}
      >
        <Text style={styles.btnText}>🔄 Смена сторон</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, styles.btnEnd]}
        onPress={handleEnd}
        disabled={!!loading}
      >
        <Text style={styles.btnText}>{loading === "end" ? "..." : "Завершить матч"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#121212",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  teamLabel: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "600",
    marginVertical: 8,
    textAlign: "center",
  },
  score: {
    fontSize: 48,
    fontWeight: "700",
    color: "#fff",
    marginVertical: 4,
  },
  games: {
    fontSize: 24,
    color: "#94a3b8",
    marginBottom: 4,
  },
  points: {
    fontSize: 32,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 16,
  },
  recBadge: {
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#dc2626",
    borderRadius: 8,
  },
  recText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
  error: {
    fontSize: 14,
    color: "#ef4444",
    marginBottom: 8,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 52,
    justifyContent: "center",
  },
  btnA: { backgroundColor: "#166534" },
  btnB: { backgroundColor: "#1e3a8a" },
  btnSecondary: { backgroundColor: "#334155" },
  btnSide: { backgroundColor: "#475569", marginBottom: 12 },
  btnEnd: { backgroundColor: "#dc2626", marginTop: 8 },
  btnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
