import type { CourtPositions, Player } from "@/types";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CourtPositionPickerProps {
  positions: CourtPositions;
  onSelectPosition: (quadrant: 1 | 2 | 3 | 4) => void;
  currentPlayer: Player | null;
}

export function CourtPositionPicker({
  positions,
  onSelectPosition,
}: CourtPositionPickerProps) {
  const quadrants: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4];

  return (
    <View style={styles.court}>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.cell, styles.cellTopLeft]}
          onPress={() => onSelectPosition(1)}
        >
          <Text style={styles.cellLabel}>
            {positions[1] ? positions[1].name : "1"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cell, styles.cellTopRight]}
          onPress={() => onSelectPosition(2)}
        >
          <Text style={styles.cellLabel}>
            {positions[2] ? positions[2].name : "2"}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.net}>
        <Text style={styles.netText}>СЕТКА</Text>
      </View>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.cell, styles.cellBottomLeft]}
          onPress={() => onSelectPosition(3)}
        >
          <Text style={styles.cellLabel}>
            {positions[3] ? positions[3].name : "3"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cell, styles.cellBottomRight]}
          onPress={() => onSelectPosition(4)}
        >
          <Text style={styles.cellLabel}>
            {positions[4] ? positions[4].name : "4"}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.labels}>
        <Text style={styles.teamLabel}>🟢 Team A</Text>
        <Text style={styles.teamLabel}>🔵 Team B</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  court: {
    width: "100%",
    aspectRatio: 1,
    maxWidth: 400,
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
    flex: 1,
  },
  cell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
    minHeight: 64,
    borderRadius: 8,
  },
  cellTopLeft: {
    backgroundColor: "#166534",
  },
  cellTopRight: {
    backgroundColor: "#166534",
  },
  cellBottomLeft: {
    backgroundColor: "#1e3a8a",
  },
  cellBottomRight: {
    backgroundColor: "#1e3a8a",
  },
  cellLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  net: {
    backgroundColor: "#475569",
    paddingVertical: 8,
    alignItems: "center",
    marginHorizontal: 4,
    borderRadius: 4,
  },
  netText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
  },
  teamLabel: {
    fontSize: 16,
    color: "#94a3b8",
  },
});
