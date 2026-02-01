import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#1a1a1a" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontSize: 20 },
          contentStyle: { backgroundColor: "#121212" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "PadelSense" }} />
        <Stack.Screen name="scan" options={{ title: "Сканирование QR" }} />
        <Stack.Screen name="position" options={{ title: "Выбор позиции" }} />
        <Stack.Screen name="match" options={{ title: "Матч" }} />
        <Stack.Screen name="tv" options={{ title: "ТВ", headerShown: false }} />
        <Stack.Screen name="finished" options={{ title: "Матч завершён" }} />
      </Stack>
    </>
  );
}
