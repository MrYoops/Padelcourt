/**
 * Bluetooth pulpt hook (stub for MVP).
 * When react-native-ble-plx is integrated:
 * - Scan/connect to BLE Numpad or gamepad
 * - Map keys: 1 -> +1A, 2 -> +1B, 3 -> Undo, 4 -> Highlight, 0 -> End
 * - Call onPointA, onPointB, onUndo, onHighlight, onEnd when key pressed
 */
export interface BluetoothPultCallbacks {
  onPointA?: () => void;
  onPointB?: () => void;
  onUndo?: () => void;
  onHighlight?: () => void;
  onEnd?: () => void;
}

export function useBluetoothPult(_callbacks: BluetoothPultCallbacks): { connected: boolean } {
  return { connected: false };
}
