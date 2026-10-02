import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { load, KEYS } from '../services/storage';
import { getTodayString } from '../utils/date';
import type { AppSettings, DayRecord } from '../types/budget';
import { AndroidTodayBudgetWidget } from './AndroidTodayBudgetWidget';

// 註冊 Widget Task Handler（module scope 執行，headless 環境啟動時生效）
// 處理 WIDGET_ADDED / WIDGET_UPDATE / WIDGET_RESIZED：讀取本機資料渲染 Widget
// WIDGET_DELETED / WIDGET_CLICK 不需處理（clickAction="OPEN_APP" 由原生端直接處理，不會路由到 handler）
registerWidgetTaskHandler(async ({ widgetAction, renderWidget }) => {
  if (widgetAction === 'WIDGET_DELETED' || widgetAction === 'WIDGET_CLICK') return;

  const savedSettings = await load<AppSettings>(KEYS.SETTINGS);
  const records = await load<DayRecord[]>(KEYS.RECORDS);
  const today = getTodayString();
  const record = records?.find(r => r.date === today);
  const currency = savedSettings?.currency ?? 'NT$';
  const budget = record?.budget ?? savedSettings?.dailyBudget ?? 0;
  const spent = record?.spent ?? 0;

  renderWidget(
    <AndroidTodayBudgetWidget
      remaining={budget - spent}
      budget={budget}
      spent={spent}
      currency={currency}
      isVip={savedSettings?.isVip ?? false}
    />
  );
});
