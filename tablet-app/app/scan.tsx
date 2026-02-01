import { Alert, Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { parseQR, Player, User } from "../src/types";
import { API_BASE } from "../src/api/config";
import { useAppStore } from "../src/store/useAppStore";

export default function ScanScreen() {
  const router = useRouter();
  const { addPlayer, players } = useAppStore();
  const [isScanning, setIsScanning] = useState(false);
  const [currentPlayerNumber, setCurrentPlayerNumber] = useState(1);

  const handleQRScanned = async (data: string) => {
    // 1. Парсим QR
    const parsed = parseQR(data);
    if (!parsed) {
      Alert.alert('Ошибка', 'Неверный QR код. Нужен QR из @PadelSenseBot');
      return;
    }
    
    // 2. Проверяем не отсканирован ли уже
    const alreadyScanned = players.some(
      p => p.id === String(parsed.telegram_id) // временно по telegram_id
    );
    if (alreadyScanned) {
      Alert.alert('Уже есть', 'Этот игрок уже отсканирован');
      return;
    }
    
    // 3. Запрос к API
    try {
      const res = await fetch(
        `${API_BASE}/api/users/by-telegram/${parsed.telegram_id}` 
      );
      
      if (res.status === 404) {
        Alert.alert(
          'Не зарегистрирован', 
          'Игрок не найден. Пусть откроет @PadelSenseBot и зарегистрируется.'
        );
        return;
      }
      
      if (!res.ok) {
        throw new Error('API error');
      }
      
      const user: User = await res.json();
      
      // 4. Преобразуем в Player
      const player: Player = {
        id: user.id,
        name: user.name,
        photoUrl: user.photo_url || undefined,
      };
      
      // 5. Добавляем в store
      addPlayer(player);
      
      // 6. Если 4 игрока — переход на выбор позиций
      if (players.length + 1 >= 4) {
        Alert.alert('Отлично!', 'Все 4 игрока отсканированы!');
        router.push('/position');
      } else {
        setCurrentPlayerNumber(players.length + 2);
        Alert.alert(`Игрок ${players.length + 1} добавлен!`, `${user.name}`);
      }
      
    } catch (error) {
      console.error('API error:', error);
      Alert.alert('Ошибка сети', 'Не удалось связаться с сервером');
    }
  };

  const handleTestQR = (qrData: string) => {
    setIsScanning(true);
    handleQRScanned(qrData).finally(() => setIsScanning(false));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Игрок {currentPlayerNumber}, покажите QR-код
      </Text>
      
      <View style={styles.cameraPlaceholder}>
        <Text style={styles.placeholderText}>📷 КАМЕРА (сканер)</Text>
        <Text style={styles.hint}>Сканирование QR — заглушка</Text>
        
        {/* Тестовые кнопки для разработки */}
        {__DEV__ && (
          <View style={styles.testButtons}>
            <TouchableOpacity
              style={[styles.testButton, styles.testButton1]}
              onPress={() => handleTestQR('user:123456789')}
              disabled={isScanning}
            >
              <Text style={styles.testButtonText}>
                [DEV] Тест: Игрок 1
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.testButton, styles.testButton2]}
              onPress={() => handleTestQR('user:987654321')}
              disabled={isScanning}
            >
              <Text style={styles.testButtonText}>
                [DEV] Тест: Игрок 2
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.testButton, styles.testButton3]}
              onPress={() => handleTestQR('user:555666777')}
              disabled={isScanning}
            >
              <Text style={styles.testButtonText}>
                [DEV] Тест: Игрок 3
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.testButton, styles.testButton4]}
              onPress={() => handleTestQR('user:999888777')}
              disabled={isScanning}
            >
              <Text style={styles.testButtonText}>
                [DEV] Тест: Игрок 4
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Список уже отсканированных игроков */}
        {players.length > 0 && (
          <View style={styles.playersList}>
            <Text style={styles.playersTitle}>Отсканированы:</Text>
            {players.map((player, index) => (
              <Text key={player.id} style={styles.playerItem}>
                {index + 1}. {player.name}
              </Text>
            ))}
          </View>
        )}
      </View>
      
      {/* Кнопка пропуска для разработки */}
      {__DEV__ && players.length >= 2 && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.push('/position')}
        >
          <Text style={styles.skipButtonText}>
            [DEV] Перейти к позициям ({players.length}/4)
          </Text>
        </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 24,
    textAlign: "center",
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#334155",
    padding: 20,
  },
  placeholderText: {
    fontSize: 20,
    color: "#94a3b8",
    marginBottom: 12,
  },
  hint: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 24,
  },
  testButtons: {
    width: '100%',
    gap: 10,
  },
  testButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButton1: { backgroundColor: "#22c55e" },
  testButton2: { backgroundColor: "#3b82f6" },
  testButton3: { backgroundColor: "#f59e0b" },
  testButton4: { backgroundColor: "#ef4444" },
  testButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  playersList: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#0f172a",
    borderRadius: 8,
    width: '100%',
  },
  playersTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  playerItem: {
    fontSize: 14,
    color: "#cbd5e1",
    marginBottom: 4,
  },
  skipButton: {
    marginTop: 20,
    backgroundColor: "#6b7280",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
