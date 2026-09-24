// 每日預算資料
export interface DayRecord {
  date: string;                   // 格式：YYYY-MM-DD
  budget: number;                 // 當日預算
  spent: number;                  // 當日已花
  lastTransaction: number | null; // 最後一筆金額（撤銷用）
}

// App 設定
export interface AppSettings {
  dailyBudget: number; // 每日預算
  currency: string;    // 幣別符號，預設 NT$
  rollover: boolean;   // 結餘累積（V1 預設關閉）
}

// 幣別選項
export const CURRENCY_OPTIONS = [
  { label: 'NT$（新台幣）', value: 'NT$' },
  { label: 'USD（美元）', value: '$' },
  { label: 'JPY（日圓）', value: '¥' },
  { label: 'EUR（歐元）', value: '€' },
  { label: 'KRW（韓元）', value: '₩' },
];

// 快速扣款固定金額
export const QUICK_AMOUNTS = [50, 100, 200, 500];

// 預設設定
export const DEFAULT_SETTINGS: AppSettings = {
  dailyBudget: 1000,
  currency: 'NT$',
  rollover: false,
};
