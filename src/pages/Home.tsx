import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Platform, ScrollView,
} from 'react-native';
import { useBudget } from '../hooks/useBudget';
import { formatAmount, isOverBudget } from '../utils/currency';
import { getTodayString, formatDateDisplay, getWeekdayDisplay } from '../utils/date';
import { QUICK_AMOUNTS } from '../types/budget';
import { syncTodayBudgetWidget } from '../services/widgetSync';

interface HomeProps {
  onGoHistory: () => void;
  onGoSettings: () => void;
}

// 角色與對話設定
const CHARS_SAFE = ['😸', '😺', '😼'];
const CHAR_WARN = '🙀';
const CHAR_DANGER = '😿';

const BUBBLES_SAFE = ['今天預算還很充足！', '繼續加油！', '省錢達人！'];
const BUBBLES_WARN = ['小心快超支了...', '再想想要不要買？', '要節制一下喔 😅'];
const BUBBLES_DANGER = ['哇！超支了！！', '今天要省省了...', '主人你花太多了！'];

function rnd(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getCharAndBubble(remainPct: number) {
  if (remainPct > 60) {
    return { char: rnd(CHARS_SAFE), bubble: rnd(BUBBLES_SAFE), level: 'safe' };
  } else if (remainPct > 25) {
    return { char: CHAR_WARN, bubble: rnd(BUBBLES_WARN), level: 'warn' };
  } else {
    return { char: CHAR_DANGER, bubble: rnd(BUBBLES_DANGER), level: 'danger' };
  }
}

export default function Home({ onGoHistory, onGoSettings }: HomeProps) {
  const { settings, todayRecord, remaining, spend, undoLast, canUndo, loading } = useBudget();
  const [input, setInput] = useState('');

  const today = getTodayString();
  const overBudget = isOverBudget(remaining);

  // 同步今日預算到桌面 Widget（Web / Expo Go 環境自動略過，不影響原本功能）
  useEffect(() => {
    if (!loading && todayRecord) {
      syncTodayBudgetWidget({
        remaining,
        budget: todayRecord.budget,
        spent: todayRecord.spent,
        currency: settings.currency,
        isVip: settings.isVip,
      });
    }
  }, [remaining, todayRecord, settings.currency, loading]);
  const spent = todayRecord?.spent ?? 0;
  const budget = todayRecord?.budget ?? settings.dailyBudget;

  // 計算血量百分比
  const spentPct = Math.min((spent / budget) * 100, 100);
  const remainPct = Math.max(0, 100 - spentPct);

  const { char, bubble, level } = getCharAndBubble(remainPct);

  // 確認花費
  const handleSpend = async () => {
    const amount = parseInt(input);
    if (isNaN(amount) || amount <= 0) return;
    await spend(amount);
    setInput('');
  };

  const handleQuick = async (amount: number) => {
    await spend(amount);
  };

  const handleUndo = async () => {
    if (!canUndo) return;
    await undoLast();
  };

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <Text style={s.loadingChar}>😸</Text>
        <Text style={s.loadingText}>載入中...</Text>
      </View>
    );
  }

  // 血條顏色
  const barColor = level === 'safe'
    ? '#4ade80'
    : level === 'warn'
    ? '#fbbf24'
    : '#f87171';

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* 頂部導航 */}
      <View style={s.topRow}>
        <Text style={s.dateText}>
          {formatDateDisplay(today)} {getWeekdayDisplay(today)}
        </Text>
        <View style={s.navRow}>
          <TouchableOpacity style={s.navBtn} onPress={onGoHistory}>
            <Text style={s.navBtnText}>歷史</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.navBtn} onPress={onGoSettings}>
            <Text style={s.navBtnText}>設定</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 角色區 */}
      <View style={s.heroArea}>
        <Text style={s.character}>{char}</Text>

        {/* 對話泡泡 */}
        <View style={s.bubbleWrap}>
          <View style={s.bubbleTip} />
          <View style={s.bubble}>
            <Text style={s.bubbleText}>{bubble}</Text>
          </View>
        </View>

        {/* 主要金額 */}
        <Text style={[s.remainingAmount, overBudget && s.overBudgetAmount]}>
          {overBudget ? '-' : ''}
          {formatAmount(remaining, settings.currency)}
        </Text>
        <Text style={s.remainingLabel}>今天還能花</Text>

        {/* 血條 */}
        <View style={s.hpWrap}>
          <View style={s.hpLabelRow}>
            <Text style={s.hpLabel}>❤️ 預算血量</Text>
            <Text style={s.hpPct}>剩餘 {remainPct.toFixed(1)}%</Text>
          </View>
          <View style={s.hpTrack}>
            <View
              style={[
                s.hpFill,
                { width: `${remainPct}%` as any, backgroundColor: barColor },
              ]}
            />
          </View>
        </View>
      </View>

      {/* 今日摘要 */}
      <View style={s.summaryRow}>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>今日預算</Text>
          <Text style={s.summaryVal}>
            {formatAmount(budget, settings.currency)}
          </Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>今日已花</Text>
          <Text style={s.summaryVal}>
            {formatAmount(spent, settings.currency)}
          </Text>
        </View>
      </View>

      {/* 輸入區 */}
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          placeholder="輸入金額"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={handleSpend}
        />
        <TouchableOpacity style={s.confirmBtn} onPress={handleSpend}>
          <Text style={s.confirmBtnText}>扣款 💸</Text>
        </TouchableOpacity>
      </View>

      {/* 快速扣款 */}
      <View style={s.quickRow}>
        {QUICK_AMOUNTS.map(amount => (
          <TouchableOpacity
            key={amount}
            style={s.quickBtn}
            onPress={() => handleQuick(amount)}
          >
            <Text style={s.quickBtnText}>
              {settings.currency}{amount}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 撤銷 */}
      <TouchableOpacity
        style={[s.undoBtn, !canUndo && s.undoBtnDisabled]}
        onPress={handleUndo}
        disabled={!canUndo}
      >
        <Text style={[s.undoBtnText, !canUndo && s.undoBtnTextDisabled]}>
          ↩ 撤銷上一筆
          {canUndo && todayRecord?.lastTransaction
            ? `（${formatAmount(todayRecord.lastTransaction, settings.currency)}）`
            : ''}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F8FAFC' },
  container: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingChar: { fontSize: 48, marginBottom: 12 },
  loadingText: { fontSize: 15, color: '#94A3B8' },

  // 頂部
  topRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  dateText: { fontSize: 13, color: '#94A3B8' },
  navRow: { flexDirection: 'row', gap: 8 },
  navBtn: {
    backgroundColor: '#F1F5F9', borderWidth: 0.5, borderColor: '#E2E8F0',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5,
  },
  navBtnText: { fontSize: 12, color: '#475569' },

  // 角色區
  heroArea: { alignItems: 'center', marginBottom: 20 },
  character: { fontSize: 56, lineHeight: 64, marginBottom: 4 },

  // 對話泡泡
  bubbleWrap: { alignItems: 'center', marginBottom: 16 },
  bubbleTip: {
    width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderBottomWidth: 7,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderBottomColor: '#E2E8F0',
    marginBottom: -0.5,
  },
  bubble: {
    backgroundColor: '#F8FAFC', borderWidth: 0.5, borderColor: '#E2E8F0',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 7,
  },
  bubbleText: { fontSize: 13, color: '#475569' },

  // 主金額
  remainingAmount: {
    fontSize: 68, fontWeight: '300', color: '#0F172A',
    letterSpacing: -3, lineHeight: 76,
  },
  overBudgetAmount: { color: '#EF4444' },
  remainingLabel: {
    fontSize: 12, color: '#94A3B8', marginTop: 4, marginBottom: 20,
  },

  // 血條
  hpWrap: { width: '100%' },
  hpLabelRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6,
  },
  hpLabel: { fontSize: 12, color: '#475569', fontWeight: '500' },
  hpPct: { fontSize: 12, color: '#94A3B8' },
  hpTrack: {
    width: '100%', height: 14, backgroundColor: '#F1F5F9',
    borderRadius: 99, borderWidth: 0.5, borderColor: '#E2E8F0', overflow: 'hidden',
  },
  hpFill: { height: '100%', borderRadius: 99 },

  // 摘要
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  summaryCard: {
    flex: 1, backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#E2E8F0',
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  summaryLabel: { fontSize: 11, color: '#94A3B8', marginBottom: 3 },
  summaryVal: { fontSize: 15, fontWeight: '500', color: '#1E293B' },

  // 輸入
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  input: {
    flex: 1, backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#E2E8F0',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 20, color: '#0F172A',
  },
  confirmBtn: {
    backgroundColor: '#3B82F6', borderRadius: 12,
    paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '500' },

  // 快速扣款
  quickRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  quickBtn: {
    flex: 1, backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#E2E8F0',
    borderRadius: 10, paddingVertical: 11, alignItems: 'center',
  },
  quickBtnText: { fontSize: 13, color: '#374151', fontWeight: '500' },

  // 撤銷
  undoBtn: { alignItems: 'center', paddingVertical: 12 },
  undoBtnDisabled: { opacity: 0.3 },
  undoBtnText: { fontSize: 13, color: '#3B82F6' },
  undoBtnTextDisabled: { color: '#94A3B8' },
});
