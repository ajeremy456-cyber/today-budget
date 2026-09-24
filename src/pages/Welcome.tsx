import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Platform, ScrollView,
} from 'react-native';
import {
  CURRENCY_OPTIONS, FREE_DAILY_BUDGET, type AppSettings,
} from '../types/budget';

interface WelcomeProps {
  onComplete: (settings: AppSettings) => void;
}

export default function Welcome({ onComplete }: WelcomeProps) {
  const [selectedCurrency, setSelectedCurrency] = useState('NT$');

  // 免費版每日預算固定 1000（VIP 可在設定頁自訂）
  const handleStart = () => {
    onComplete({
      dailyBudget: FREE_DAILY_BUDGET,
      currency: selectedCurrency,
      rollover: false,
      isVip: false,
    });
  };

  return (
    <ScrollView
      contentContainerStyle={s.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={s.topArea}>
        <Text style={s.emoji}>💰</Text>
        <Text style={s.title}>今日可花</Text>
        <Text style={s.subtitle}>
          每天只需要知道一件事{'\n'}今天還能花多少
        </Text>
      </View>

      <View style={s.formArea}>
        <Text style={s.label}>選擇幣別</Text>
        <Text style={s.hint}>
          每日預算固定 {FREE_DAILY_BUDGET} 元（VIP 可自訂）
        </Text>

        {CURRENCY_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              s.currencyOption,
              selectedCurrency === option.value && s.currencyOptionActive,
            ]}
            onPress={() => setSelectedCurrency(option.value)}
          >
            <Text style={[
              s.currencyOptionText,
              selectedCurrency === option.value && s.currencyOptionTextActive,
            ]}>
              {option.label}
            </Text>
            {selectedCurrency === option.value && (
              <Text style={s.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={s.nextBtn} onPress={handleStart}>
          <Text style={s.nextBtnText}>開始使用</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  topArea: {
    alignItems: 'center',
    marginBottom: 48,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  formArea: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: '#94A3B8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  hint: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 14,
  },
  nextBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  currencyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  currencyOptionActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  currencyOptionText: {
    fontSize: 15,
    color: '#374151',
  },
  currencyOptionTextActive: {
    color: '#2563EB',
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 16,
    color: '#2563EB',
  },
});
