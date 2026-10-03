import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, Platform,
} from 'react-native';
import { useBudget } from '../hooks/useBudget';
import { CURRENCY_OPTIONS, FREE_DAILY_BUDGET } from '../types/budget';

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
    const budget = settings.isVip ? parseInt(budgetInput) : FREE_DAILY_BUDGET;
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

  // VIP 買斷付費
  const [vipPrice, setVipPrice] = useState('NT$30');
  const [buying, setBuying] = useState(false);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // 載入 Play 商店實際定價 + 註冊 VIP 到手回呼
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { setVipGrantedHandler, getVipProduct } = await import('../services/purchase');
      if (!mounted) return;
      setVipGrantedHandler(async () => {
        if (!mounted) return;
        await updateSettings({ ...settingsRef.current, isVip: true });
        Alert.alert('VIP 已解鎖', '感謝購買！已解鎖：無限歷史紀錄 + 自訂每日預算');
      });
      const product = await getVipProduct();
      if (mounted && product?.displayPrice) setVipPrice(product.displayPrice);
    })();
    return () => {
      mounted = false;
      import('../services/purchase')
        .then(m => m.setVipGrantedHandler(null))
        .catch(() => {});
    };
  }, []);

  // 升級 VIP：已有買斷紀錄就直接還原，否則發起購買
  const handleUpgrade = async () => {
    setBuying(true);
    try {
      const { buyVip, restorePurchases } = await import('../services/purchase');
      const restored = await restorePurchases();
      if (restored) return; // handler 已處理授權與提示
      await buyVip();
    } catch (error) {
      console.error('[Settings] 升級失敗:', error);
      Alert.alert('無法開啟購買', '商品尚未上架或商店連線失敗，請稍後再試');
    } finally {
      setBuying(false);
    }
  };

  // 還原購買（重裝 App 後解鎖）
  const handleRestore = async () => {
    const { restorePurchases } = await import('../services/purchase');
    const restored = await restorePurchases();
    if (!restored) {
      Alert.alert('找不到購買紀錄', '此帳號沒有 VIP 買斷紀錄');
    }
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
              style={[s.input, !settings.isVip && s.inputDisabled]}
              value={settings.isVip ? budgetInput : FREE_DAILY_BUDGET.toString()}
              onChangeText={setBudgetInput}
              keyboardType="numeric"
              placeholder="1000"
              placeholderTextColor="#94A3B8"
              editable={settings.isVip}
            />
          </View>
          {!settings.isVip && (
            <Text style={s.vipLockHint}>🔒 VIP 專屬：升級解鎖自訂每日預算</Text>
          )}
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

        {/* 會員方案（VIP 買斷） */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>會員方案</Text>
          <View style={[s.vipCard, settings.isVip && s.vipCardActive]}>
            <View style={s.vipRow}>
              <View style={s.vipInfo}>
                <Text style={s.vipTitle}>
                  {settings.isVip ? '👑 VIP 會員' : '免費版'}
                </Text>
                <Text style={s.vipDesc}>
                  {settings.isVip
                    ? '無限歷史紀錄 + 自訂每日預算'
                    : '歷史紀錄 5 天 + 每日預算固定 1000'}
                </Text>
              </View>
              {!settings.isVip && (
                <TouchableOpacity
                  onPress={handleUpgrade}
                  disabled={buying}
                  style={s.vipBtn}
                >
                  <Text style={s.vipBtnText}>
                    {buying ? '處理中…' : '升級 VIP'}
                  </Text>
                </TouchableOpacity>
              )}
              {settings.isVip && <Text style={s.ownedBadge}>✓ 已解鎖</Text>}
            </View>
            {!settings.isVip && (
              <>
                <Text style={s.vipHint}>
                  一次性買斷 {vipPrice}，終身解鎖（Google Play 付費）
                </Text>
                <TouchableOpacity onPress={handleRestore} style={s.restoreBtn}>
                  <Text style={s.restoreLink}>已購買？還原購買</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
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
  inputDisabled: {
    color: '#94A3B8',
  },
  vipCard: {
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
  },
  vipCardActive: {
    borderColor: '#D97706',
    backgroundColor: '#FFFBEB',
  },
  vipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vipInfo: {
    flex: 1,
    marginRight: 12,
  },
  vipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  vipDesc: {
    fontSize: 13,
    color: '#64748B',
  },
  vipBtn: {
    backgroundColor: '#D97706',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  vipBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  vipLockHint: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
  },
  vipHint: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 10,
  },
  ownedBadge: {
    fontSize: 13,
    color: '#B45309',
    fontWeight: '600',
  },
  restoreBtn: {
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  restoreLink: {
    fontSize: 12,
    color: '#2563EB',
    textDecorationLine: 'underline',
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
