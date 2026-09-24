import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
export const KEYS = {
  SETTINGS: '@today_budget/settings',
  RECORDS: '@today_budget/records',
} as const;

// 儲存資料
export async function save<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('[Storage] 儲存失敗:', error);
  }
}

// 讀取資料
export async function load<T>(key: string): Promise<T | null> {
  try {
    const json = await AsyncStorage.getItem(key);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error('[Storage] 讀取失敗:', error);
    return null;
  }
}

// 刪除單筆
export async function remove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('[Storage] 刪除失敗:', error);
  }
}

// 清除全部
export async function clear(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('[Storage] 清除失敗:', error);
  }
}
