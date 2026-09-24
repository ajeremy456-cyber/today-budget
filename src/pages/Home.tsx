import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, Platform,
} from 'react-native';
import { useBudget } from '../hooks/useBudget';
import { formatAmount, isOverBudget } from '../utils/currency';
import { getTodayString, formatDateDisplay, getWeekdayDisplay } from '../utils/date';
import { QUICK_AMOUNTS } from '../types/budget';

interface HomeProps {
  onGoHistory: () => void;
  onGoSettings: () => void;
}

export default function Home({ onGoHistory, onGoSettings }: HomeProps) {
  const { settings, todayRecord, remaining, spend, undoLast, canUndo, loading } = useBudget();
  const [input, setInput] = useState('');

  const today = getTodayString();
  const overBudget = isOverBudget(remaining);

  // 確認花費
  const handleSpend = async () => {
    const amount = parseInt(input);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('請輸入有效金額');
      return;
    }
    await spend(amount);
    setInput('');
  };

  // 快速扣款
  const handleQuick = async (amount: number) => {
    await spend(amount);
  };

  // 撤銷
  const handleUndo = async () => {
    if (!canUndo) return;
    await undoLast();
  };

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <Text style={s.loadingText}>載入中...</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* 日期 */}
      <View style={s.dateRow}>
        <Text style={s.dateText}>
          {formatDateDisplay(today)} {getWeekdayDisplay(today)}
        </Text>
        <View style={s.navRow}>
          <TouchableOpacity onPress={onGoHistory} style={s.navBtn}>
            <Text style={s.navBtnText}>歷史</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onGoSettings} style={s.navBtn}>
            <Text style={s.navBtnText}>設定</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 主要金額 */}
      <View style={s.mainArea}>
        {overBudget && (
          <Text style={s.overBudgetLabel}>今日超支</Text>
        )}
        <Text style={[s.remainingAmount, overBudget && s.overBudgetAmount]}>
          {overBudget ? '-' : ''}
          {formatAmount(remaining, settings.currency)}
        </Text>
        <Text style={s.remainingLabel}>今天還能花</Text>
      </View>

      {/* 今日摘要 */}
      <View style={s.summaryRow}>
        <View style={s.summaryItem}>
          <Text style={s.summaryLabel}>今日預算</Text>
          <Text style={s.summaryValue}>
            {formatAmount(todayRecord?.budget ?? 0, settings.currency)}
          </Text>
        </View>
        <View style={s.summaryDivider} />
        <View style={s.summaryItem}>
          <Text style={s.summaryLabel}>今日已花</Text>
          <Text style={s.summaryValue}>
            {formatAmount(todayRecord?.spent ?? 0, settings.currency)}
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
          <Text style={s.confirmBtnText}>扣款</Text>
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
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#94A3B8',
  },

  // 頂部
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 15,
    color: '#64748B',
  },
  navRow: {
    flexDirection: 'row',
  },
  navBtn: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  navBtnText: {
    fontSize: 13,
    color: '#475569',
  },

  // 主金額
  mainArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overBudgetLabel: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
    marginBottom: 8,
    letterSpacing: 1,
  },
  remainingAmount: {
    fontSize: 80,
    fontWeight: '300',
    color: '#0F172A',
    letterSpacing: -2,
    lineHeight: 90,
  },
  overBudgetAmount: {
    color: '#EF4444',
  },
  remainingLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    letterSpacing: 0.5,
  },

  // 摘要
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 0.5,
    backgroundColor: '#E2E8F0',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1E293B',
  },

  // 輸入
  inputRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 20,
    color: '#0F172A',
    marginRight: 10,
  },
  confirmBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },

  // 快速扣款
  quickRow: {
    flexDirection: 'row',
    marginLeft: -4,
    marginRight: -4,
    marginBottom: 16,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 4,
    marginRight: 4,
  },
  quickBtnText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },

  // 撤銷
  undoBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 24,
  },
  undoBtnDisabled: {
    opacity: 0.3,
  },
  undoBtnText: {
    fontSize: 14,
    color: '#2563EB',
  },
  undoBtnTextDisabled: {
    color: '#94A3B8',
  },
});
