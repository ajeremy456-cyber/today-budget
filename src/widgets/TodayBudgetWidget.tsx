import { Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding, strokeBorder } from '@expo/ui/swift-ui/modifiers';
import { createWidget } from 'expo-widgets';

// 傳給 Widget 的資料
export interface TodayBudgetWidgetProps {
  remaining: number; // 今日剩餘（可為負）
  budget: number;    // 今日預算
  spent: number;     // 今日已花
  currency: string;  // 幣別符號
  isVip: boolean;    // VIP 會員（VIP 顯示金色邊框）
}

// 注意：'widget' 元件運行在隔離環境（Widget Extension 內建 JS runtime），
// 不能使用 hooks、async、或參考函式外宣告的任何常數
const TodayBudgetWidget = (props: TodayBudgetWidgetProps) => {
  'widget';
  const over = props.remaining < 0;
  const remainingText =
    (over ? '-' : '') + props.currency + Math.abs(props.remaining).toLocaleString();
  const summaryText = '已花 ' + props.currency + props.spent.toLocaleString();

  return (
    <VStack
      alignment="center"
      spacing={4}
      modifiers={[
        padding({ all: 12 }),
        // VIP 顯示金色邊框（跟隨圓角）
        ...(props.isVip
          ? [strokeBorder({
              content: '#D97706',
              style: { lineWidth: 2 },
              shape: 'roundedRectangle',
              cornerRadius: 16,
            })]
          : []),
      ]}
    >
      <Text modifiers={[font({ size: 12 }), foregroundStyle(over ? '#DC2626' : '#64748B')]}>
        {over ? '今日超支' : '今天還能花'}
      </Text>
      <Text
        modifiers={[
          font({ weight: 'bold', size: 28 }),
          foregroundStyle(over ? '#DC2626' : '#111827'),
        ]}
      >
        {remainingText}
      </Text>
      <Text modifiers={[font({ size: 11 }), foregroundStyle('#94A3B8')]}>
        {summaryText}
      </Text>
    </VStack>
  );
};

// 名稱必須與 app.json 中 expo-widgets 設定的 widgets[].name 一致
export default createWidget('TodayBudgetWidget', TodayBudgetWidget);
