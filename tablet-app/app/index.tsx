import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎾 PadelSense</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/scan")}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>НАЧАТЬ МАТЧ</Text>
      </TouchableOpacity>
      <Text style={styles.subtitle}>Корт свободен</Text>
      <Text style={styles.courtName}>PadelClub СПб, Корт 1</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 48,
  },
  button: {
    backgroundColor: "#22c55e",
    paddingVertical: 20,
    paddingHorizontal: 48,
    borderRadius: 12,
    minHeight: 64,
    justifyContent: "center",
    marginBottom: 32,
  },
  buttonText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  subtitle: {
    fontSize: 18,
    color: "#94a3b8",
    marginBottom: 8,
  },
  courtName: {
    fontSize: 20,
    color: "#cbd5e1",
    fontWeight: "600",
  },
});
