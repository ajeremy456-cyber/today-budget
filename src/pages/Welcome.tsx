import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Platform, ScrollView,
} from 'react-native';
import { CURRENCY_OPTIONS, type AppSettings } from '../types/budget';

interface WelcomeProps {
  onComplete: (settings: AppSettings) => void;
}

export default function Welcome({ onComplete }: WelcomeProps) {
  const [budgetInput, setBudgetInput] = useState('1000');
  const [selectedCurrency, setSelectedCurrency] = useState('NT$');
  const [step, setStep] = useState<1 | 2>(1);

  const handleNext = () => {
    const budget = parseInt(budgetInput);
    if (isNaN(budget) || budget <= 0) return;
    setStep(2);
  };

  const handleStart = () => {
    const budget = parseInt(budgetInput);
    if (isNaN(budget) || budget <= 0) return;
    onComplete({
      dailyBudget: budget,
      currency: selectedCurrency,
      rollover: false,
    });
  };

  return (
    <ScrollView
      contentContainerStyle={s.container}
      keyboardShouldPersistTaps="handled"
    >
      {step === 1 ? (
        <>
          <View style={s.topArea}>
            <Text style={s.emoji}>💰</Text>
            <Text style={s.title}>今日可花</Text>
            <Text style={s.subtitle}>
              每天只需要知道一件事{'\n'}今天還能花多少
            </Text>
          </View>

          <View style={s.formArea}>
            <Text style={s.label}>設定每日預算</Text>
            <Text style={s.hint}>你每天想花多少錢？</Text>

            <View style={s.inputRow}>
              <Text style={s.currencyPrefix}>{selectedCurrency}</Text>
              <TextInput
                style={s.input}
                value={budgetInput}
                onChangeText={setBudgetInput}
                keyboardType="numeric"
                placeholder="1000"
                placeholderTextColor="#94A3B8"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleNext}
              />
            </View>

            <View style={s.presetRow}>
              {[500, 1000, 1500, 2000].map(amount => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    s.presetBtn,
                    budgetInput === amount.toString() && s.presetBtnActive,
                  ]}
                  onPress={() => setBudgetInput(amount.toString())}
                >
                  <Text style={[
                    s.presetBtnText,
                    budgetInput === amount.toString() && s.presetBtnTextActive,
                  ]}>
                    {amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                s.nextBtn,
                (!budgetInput || parseInt(budgetInput) <= 0) && s.nextBtnDisabled,
              ]}
              onPress={handleNext}
              disabled={!budgetInput || parseInt(budgetInput) <= 0}
            >
              <Text style={s.nextBtnText}>下一步</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={s.topArea}>
            <Text style={s.emoji}>🌏</Text>
            <Text style={s.title}>選擇幣別</Text>
            <Text style={s.subtitle}>預設為新台幣</Text>
          </View>

          <View style={s.formArea}>
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

            <TouchableOpacity style={s.backBtn} onPress={() => setStep(1)}>
              <Text style={s.backBtnText}>← 修改預算</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  currencyPrefix: {
    fontSize: 22,
    color: '#64748B',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 28,
    color: '#0F172A',
    fontWeight: '300',
    paddingVertical: 16,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  presetBtnActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  presetBtnText: {
    fontSize: 14,
    color: '#64748B',
  },
  presetBtnTextActive: {
    color: '#2563EB',
    fontWeight: '500',
  },
  nextBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  nextBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backBtnText: {
    fontSize: 14,
    color: '#2563EB',
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
