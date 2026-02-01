import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CourtPositionPicker } from "@/components/CourtPositionPicker";
import { useAppStore } from "@/store/useAppStore";
import { startMatch } from "@/api/client";
import { useState } from "react";

export default function PositionScreen() {
  const router = useRouter();
  const { positions, setPosition, currentPlayer, setMatchId, setMatchScore, setCurrentPlayer } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPosition = (quadrant: 1 | 2 | 3 | 4) => {
    if (currentPlayer) {
      setPosition(quadrant, currentPlayer);
      setCurrentPlayer(null);
    }
  };

  const allFilled = positions[1] && positions[2] && positions[3] && positions[4];

  const handleStartMatch = async () => {
    if (!allFilled) return;
    setLoading(true);
    setError(null);
    try {
      const match = await startMatch({
        position_1_user_id: positions[1]!.id,
        position_2_user_id: positions[2]!.id,
        position_3_user_id: positions[3]!.id,
        position_4_user_id: positions[4]!.id,
      });
      setMatchId(match.id);
      setMatchScore(match.score);
      router.replace("/match");
    } catch {
      setError("Не удалось начать матч");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {currentPlayer
          ? `${currentPlayer.name}, выберите позицию на корте`
          : "Выберите позицию на корте"}
      </Text>
      <CourtPositionPicker
        positions={positions}
        onSelectPosition={handleSelectPosition}
        currentPlayer={currentPlayer}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {allFilled ? (
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleStartMatch}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Запуск..." : "Начать матч"}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.next} onPress={() => router.push("/scan")}>
          Сканировать следующего игрока →
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 24,
    textAlign: "center",
  },
  error: {
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
    marginTop: 8,
  },
  button: {
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignSelf: "center",
    marginTop: 24,
    minHeight: 56,
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  next: {
    fontSize: 18,
    color: "#22c55e",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 24,
  },
});
