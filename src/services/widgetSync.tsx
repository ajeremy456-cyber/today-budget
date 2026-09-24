import { Platform } from 'react-native';

// 傳給 Widget 的資料
interface WidgetBudgetProps {
  remaining: number; // 今日剩餘（可為負）
  budget: number;    // 今日預算
  spent: number;     // 今日已花
  currency: string;  // 幣別符號
  isVip: boolean;    // VIP 會員（VIP 顯示金色邊框）
}

// iOS：動態載入 expo-widgets 模組（Web / Android 不載入）
let iosWidgetModule:
  | {
      default: {
        updateTimeline: (entries: { date: Date; props: WidgetBudgetProps }[]) => void;
      };
    }
  | null
  | undefined;

async function loadIosWidgetModule() {
  if (Platform.OS !== 'ios') return null;
  if (iosWidgetModule === undefined) {
    try {
      iosWidgetModule = await import('../widgets/TodayBudgetWidget');
    } catch {
      iosWidgetModule = null;
    }
  }
  return iosWidgetModule;
}

// iOS：更新 Widget 時間軸（現在的剩餘 + 明天 00:00 自動切換成新一天預算）
async function syncIosWidget(props: WidgetBudgetProps): Promise<void> {
  const widget = await loadIosWidgetModule();
  if (!widget) return;
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  widget.default.updateTimeline([
    { date: now, props },
    {
      date: tomorrow,
      props: {
        remaining: props.budget,
        budget: props.budget,
        spent: 0,
        currency: props.currency,
        isVip: props.isVip,
      },
    },
  ]);
}

// Android：資料變更後立即重繪 Widget（Expo Go / 未建置環境會 throw，由 catch 略過）
async function syncAndroidWidget(props: WidgetBudgetProps): Promise<void> {
  const { syncAndroidBudgetWidget } = await import('../widgets/AndroidTodayBudgetWidget');
  await syncAndroidBudgetWidget(props);
}

// 同步今日預算到 Widget；任何失敗都靜默略過，不影響 App 原本功能
export async function syncTodayBudgetWidget(props: WidgetBudgetProps) {
  try {
    if (Platform.OS === 'android') {
      await syncAndroidWidget(props);
    } else if (Platform.OS === 'ios') {
      await syncIosWidget(props);
    }
  } catch {
    // Widget 功能需開發版建置（Expo Go 不支援），失敗不影響原本功能
  }
}
