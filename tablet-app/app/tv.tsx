/** TV screen: large score only (for second display). */
import { StyleSheet, Text, View } from "react-native";
import { useAppStore } from "@/store/useAppStore";
import { useScore } from "@/src/hooks/useScore";

export default function TVScreen() {
  const { matchScore, positions } = useAppStore();
  const score = useScore(matchScore);

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  teamLabel: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "600",
    marginVertical: 12,
    textAlign: "center",
  },
  score: {
    fontSize: 72,
    fontWeight: "700",
    color: "#fff",
    marginVertical: 8,
  },
  games: {
    fontSize: 36,
    color: "#94a3b8",
    marginVertical: 4,
  },
  points: {
    fontSize: 48,
    fontWeight: "600",
    color: "#fff",
    marginVertical: 16,
  },
  recBadge: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#dc2626",
    borderRadius: 12,
  },
  recText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "600",
  },
});
