import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, Platform,
} from 'react-native';
import { useBudget } from '../hooks/useBudget';
import { CURRENCY_OPTIONS } from '../types/budget';

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const { settings, updateSettings } = useBudget();
  const [budgetInput, setBudgetInput] = useState(
    settings.dailyBudget.toString()
  );
  const [selectedCurrency, setSelectedCurrency] = useState(settings.currency);

  const handleSave = async () => {
    const budget = parseInt(budgetInput);
    if (isNaN(budget) || budget <= 0) {
      Alert.alert('請輸入有效的每日預算');
      return;
    }
    await updateSettings({
      ...settings,
      dailyBudget: budget,
      currency: selectedCurrency,
    });
    Alert.alert('已儲存', '設定已更新', [
      { text: '確定', onPress: onBack },
    ]);
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backBtnText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={s.title}>設定</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={s.scroll}>

        {/* 每日預算 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>每日預算</Text>
          <View style={s.inputRow}>
            <Text style={s.currencyPrefix}>{selectedCurrency}</Text>
            <TextInput
              style={s.input}
              value={budgetInput}
              onChangeText={setBudgetInput}
              keyboardType="numeric"
              placeholder="1000"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* 幣別 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>幣別</Text>
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
        </View>

        {/* 儲存 */}
        <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
          <Text style={s.saveBtnText}>儲存設定</Text>
        </TouchableOpacity>

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
  scroll: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#94A3B8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencyPrefix: {
    fontSize: 20,
    color: '#64748B',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 20,
    color: '#0F172A',
    paddingVertical: 14,
  },
  currencyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
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
  saveBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
