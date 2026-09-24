import { useState, useEffect, useCallback } from 'react';
import { save, load, KEYS } from '../services/storage';
import { getTodayString } from '../utils/date';
import { safeSubtract, safeAdd } from '../utils/currency';
import {
  type DayRecord,
  type AppSettings,
  DEFAULT_SETTINGS,
} from '../types/budget';

export function useBudget() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [todayRecord, setTodayRecord] = useState<DayRecord | null>(null);
  const [records, setRecords] = useState<DayRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // 初始化：載入設定與今日資料
  useEffect(() => {
    async function init() {
      try {
        // 載入設定
        const savedSettings = await load<AppSettings>(KEYS.SETTINGS);
        const currentSettings = savedSettings ?? DEFAULT_SETTINGS;
        setSettings(currentSettings);

        // 載入所有紀錄
        const savedRecords = await load<DayRecord[]>(KEYS.RECORDS);
        const allRecords = savedRecords ?? [];
        setRecords(allRecords);

        // 確認今日紀錄
        const today = getTodayString();
        const existing = allRecords.find(r => r.date === today);

        if (existing) {
          setTodayRecord(existing);
        } else {
          // 建立今日新紀錄
          const newRecord: DayRecord = {
            date: today,
            budget: currentSettings.dailyBudget,
            spent: 0,
            lastTransaction: null,
          };
          const updated = [newRecord, ...allRecords];
          setRecords(updated);
          setTodayRecord(newRecord);
          await save(KEYS.RECORDS, updated);
        }
      } catch (error) {
        console.error('[useBudget] 初始化失敗:', error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // 更新今日紀錄（同步狀態與 Storage）
  const updateTodayRecord = useCallback(
    async (updated: DayRecord) => {
      setTodayRecord(updated);
      const newRecords = records.map(r =>
        r.date === updated.date ? updated : r
      );
      setRecords(newRecords);
      await save(KEYS.RECORDS, newRecords);
    },
    [records]
  );

  // 花費（輸入金額）
  const spend = useCallback(
    async (amount: number) => {
      if (!todayRecord || amount <= 0) return;
      const updated: DayRecord = {
        ...todayRecord,
        spent: safeAdd(todayRecord.spent, amount),
        lastTransaction: amount,
      };
      await updateTodayRecord(updated);
    },
    [todayRecord, updateTodayRecord]
  );

  // 撤銷最後一筆
  const undoLast = useCallback(async () => {
    if (!todayRecord || todayRecord.lastTransaction === null) return;
    const updated: DayRecord = {
      ...todayRecord,
      spent: safeSubtract(todayRecord.spent, todayRecord.lastTransaction),
      lastTransaction: null,
    };
    await updateTodayRecord(updated);
  }, [todayRecord, updateTodayRecord]);

  // 更新設定
  const updateSettings = useCallback(
    async (newSettings: AppSettings) => {
      setSettings(newSettings);
      await save(KEYS.SETTINGS, newSettings);

      // 同步更新今日預算
      if (todayRecord) {
        const updated: DayRecord = {
          ...todayRecord,
          budget: newSettings.dailyBudget,
        };
        await updateTodayRecord(updated);
      }
    },
    [todayRecord, updateTodayRecord]
  );

  // 計算今日剩餘
  const remaining = todayRecord
    ? safeSubtract(todayRecord.budget, todayRecord.spent)
    : 0;

  // 取得歷史紀錄（排除今天）
  const historyRecords = records.filter(
    r => r.date !== getTodayString()
  );

  return {
    loading,
    settings,
    todayRecord,
    remaining,
    historyRecords,
    spend,
    undoLast,
    updateSettings,
    canUndo: todayRecord?.lastTransaction !== null,
  };
}
