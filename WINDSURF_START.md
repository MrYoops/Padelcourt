# 🎯 WINDSURF — Задачи (Tablet App)

> Читай также: `SYNC.md`, `shared/types.ts`

---

## ✅ Сделано

- [x] Структура проекта (Expo Router)
- [x] Базовые экраны (index, scan, position, match, finished, tv)
- [x] CourtPositionPicker компонент
- [x] useScore, useBluetoothPult хуки
- [x] Zustand store

---

## 📋 ТЕКУЩИЕ ЗАДАЧИ

### 1. Обновить типы из shared

**Файл:** `tablet-app/src/types/index.ts`

Либо импортируй из shared:
```typescript
export * from '../../../shared/types';
```

Либо скопируй типы `Player`, `CourtPositions`, `parseQR` из `shared/types.ts`.

---

### 2. Сканирование QR → запрос к API

**Файл:** `tablet-app/app/scan.tsx`

```typescript
import { parseQR, Player } from '../src/types';

async function onQRScanned(data: string) {
  const parsed = parseQR(data);
  if (!parsed) {
    Alert.alert('Ошибка', 'Неверный QR код');
    return;
  }
  
  try {
    const res = await fetch(
      `${API_BASE}/api/users/by-telegram/${parsed.telegram_id}`
    );
    
    if (res.status === 404) {
      Alert.alert('Не найден', 'Игрок не зарегистрирован в @PadelSenseBot');
      return;
    }
    
    const user = await res.json();
    
    const player: Player = {
      id: user.id,
      name: user.name,
      photoUrl: user.photo_url,
    };
    
    // Добавить в store
    addPlayer(player);
    
  } catch (e) {
    Alert.alert('Ошибка', 'Нет связи с сервером');
  }
}
```

---

### 3. После 4 игроков → выбор позиций

В store (`useAppStore.ts`) отслеживать количество игроков:

```typescript
// Когда 4 игрока отсканированы
if (players.length === 4) {
  router.push('/position');
}
```

---

### 4. Тестовая кнопка (без камеры)

**Файл:** `tablet-app/app/scan.tsx` — добавить временно:

```tsx
{__DEV__ && (
  <Button
    title="[DEV] Тест QR"
    onPress={() => onQRScanned('user:123456789')}
  />
)}
```

---

## 🧪 Как проверить

```bash
cd tablet-app
npm install
npx expo start

# В эмуляторе или на устройстве через Expo Go
```

**Важно:** Backend должен быть запущен и доступен планшету!

Для теста на устройстве нужен туннель или локальная сеть.

---

## ✅ Критерии готовности

- [ ] Типы синхронизированы с `shared/types.ts`
- [ ] QR сканирование вызывает API
- [ ] При 404 — сообщение "Не зарегистрирован"
- [ ] После 4 игроков — переход на выбор позиций
- [ ] Выбор позиций работает (drag или tap)
