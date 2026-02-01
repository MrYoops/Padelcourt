import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "@/store/useAppStore";
import { useScore } from "@/src/hooks/useScore";

export default function FinishedScreen() {
  const router = useRouter();
  const { matchScore, positions, resetMatch } = useAppStore();
  const score = useScore(matchScore);

  const teamANames = [positions[1]?.name, positions[2]?.name].filter(Boolean).join(" & ") || "Team A";
  const teamBNames = [positions[3]?.name, positions[4]?.name].filter(Boolean).join(" & ") || "Team B";
  const teamAWon = (score.setsA ?? 0) > (score.setsB ?? 0);
  const scoreLine =
    matchScore?.games_a?.length && matchScore?.games_b?.length
      ? (matchScore.games_a as number[]).map((g, i) => `${g}:${(matchScore.games_b as number[])[i] ?? 0}`).join("  ")
      : "—";

  const handleNewMatch = () => {
    resetMatch();
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 МАТЧ ЗАВЕРШЁН!</Text>
      <Text style={[styles.result, teamAWon ? styles.win : styles.lose]}>
        🟢 {teamANames} {teamAWon ? "— ПОБЕДА" : ""}
      </Text>
      <Text style={styles.score}>{scoreLine}</Text>
      <Text style={styles.subtitle}>
        🔵 {teamBNames} {!teamAWon ? "— ПОБЕДА" : ""}
      </Text>
      <Text style={styles.meta}>⏱ Длительность: —</Text>
      <TouchableOpacity style={styles.button} onPress={handleNewMatch} activeOpacity={0.8}>
        <Text style={styles.buttonText}>НОВЫЙ МАТЧ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 32,
  },
  result: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
  },
  win: { color: "#22c55e" },
  lose: { color: "#94a3b8" },
  score: {
    fontSize: 32,
    color: "#fff",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    color: "#94a3b8",
    marginBottom: 32,
  },
  meta: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 48,
  },
  button: {
    backgroundColor: "#22c55e",
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 12,
    minHeight: 64,
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
});
