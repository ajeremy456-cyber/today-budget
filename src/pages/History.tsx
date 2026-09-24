import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import { useBudget } from '../hooks/useBudget';
import { formatAmount, isOverBudget } from '../utils/currency';
import { formatDateDisplay, getWeekdayDisplay } from '../utils/date';

interface HistoryProps {
  onBack: () => void;
}

export default function History({ onBack }: HistoryProps) {
  const { historyRecords, settings } = useBudget();

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backBtnText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={s.title}>歷史紀錄</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {historyRecords.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyText}>還沒有歷史紀錄</Text>
          </View>
        ) : (
          historyRecords.map(record => {
            const remaining = record.budget - record.spent;
            const over = isOverBudget(remaining);
            return (
              <View key={record.date} style={s.card}>
                {/* 日期 */}
                <View style={s.cardHeader}>
                  <Text style={s.cardDate}>
                    {formatDateDisplay(record.date)} {getWeekdayDisplay(record.date)}
                  </Text>
                  <Text style={[s.cardRemaining, over && s.overText]}>
                    {over ? '超支 ' : '剩餘 '}
                    {formatAmount(remaining, settings.currency)}
                  </Text>
                </View>

                {/* 摘要 */}
                <View style={s.cardBody}>
                  <View style={s.cardItem}>
                    <Text style={s.cardLabel}>預算</Text>
                    <Text style={s.cardValue}>
                      {formatAmount(record.budget, settings.currency)}
                    </Text>
                  </View>
                  <View style={s.cardItem}>
                    <Text style={s.cardLabel}>已花</Text>
                    <Text style={s.cardValue}>
                      {formatAmount(record.spent, settings.currency)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
        {!settings.isVip && (
          <Text style={s.vipHint}>
            免費版顯示最近 5 天 · 升級 VIP 查看完整歷史
          </Text>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backBtn: {
    width: 60,
  },
  backBtnText: {
    fontSize: 15,
    color: '#2563EB',
  },
  title: {
    fontSize: 17,
    fontWeight: '500',
    color: '#0F172A',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 15,
    color: '#94A3B8',
  },
  vipHint: {
    textAlign: 'center',
    fontSize: 13,
    color: '#94A3B8',
    marginHorizontal: 20,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardDate: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
  },
  cardRemaining: {
    fontSize: 15,
    fontWeight: '500',
    color: '#059669',
  },
  overText: {
    color: '#EF4444',
  },
  cardBody: {
    flexDirection: 'row',
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  cardLabel: {
    fontSize: 13,
    color: '#94A3B8',
    marginRight: 6,
  },
  cardValue: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
});
