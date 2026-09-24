import { FlexWidget, TextWidget, requestWidgetUpdate } from 'react-native-android-widget';

// 傳給 Widget 的資料
export interface AndroidWidgetProps {
  remaining: number; // 今日剩餘（可為負）
  budget: number;    // 今日預算
  spent: number;     // 今日已花
  currency: string;  // 幣別符號
  isVip: boolean;    // VIP 會員（VIP 顯示金色邊框）
}

// Android 桌面 Widget 版面（純 JS 元件，以 RemoteViews 繪製）
export function AndroidTodayBudgetWidget({
  remaining,
  budget,
  spent,
  currency,
  isVip,
}: AndroidWidgetProps) {
  const over = remaining < 0;
  const remainingText =
    (over ? '-' : '') + currency + Math.abs(remaining).toLocaleString();
  const summaryText =
    '已花 ' + currency + spent.toLocaleString() + ' / 預算 ' + currency + budget.toLocaleString();

  return (
    <FlexWidget
      style={{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: 'match_parent',
        height: 'match_parent',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        // VIP 顯示金色邊框
        ...(isVip ? { borderColor: '#D97706', borderWidth: 2 } : {}),
        padding: 12,
      }}
    >
      <TextWidget
        text={over ? '今日超支' : '今天還能花'}
        style={{ fontSize: 12, color: over ? '#DC2626' : '#64748B' }}
      />
      <TextWidget
        text={remainingText}
        style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: over ? '#DC2626' : '#111827',
        }}
      />
      <TextWidget text={summaryText} style={{ fontSize: 11, color: '#94A3B8' }} />
    </FlexWidget>
  );
}

// 從 App 端重繪 Widget（需開發版建置；Expo Go 會 throw，由呼叫端 catch）
export async function syncAndroidBudgetWidget(props: AndroidWidgetProps): Promise<void> {
  await requestWidgetUpdate({
    widgetName: 'TodayBudgetWidget',
    renderWidget: () => (
      <AndroidTodayBudgetWidget
        remaining={props.remaining}
        budget={props.budget}
        spent={props.spent}
        currency={props.currency}
        isVip={props.isVip}
      />
    ),
  });
}
