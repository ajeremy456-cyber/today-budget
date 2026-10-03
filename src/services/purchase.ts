// Google Play 一次性買斷付費（react-native-iap）
import { Platform } from 'react-native';
import {
  initConnection,
  fetchProducts,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  getAvailablePurchases,
  finishTransaction,
  type Purchase,
  type PurchaseError,
  type Product,
} from 'react-native-iap';
import { load, save, KEYS } from './storage';
import { type AppSettings } from '../types/budget';

// VIP 商品 ID（需與 Play Console 建立的一次性商品 ID 一致）
export const VIP_PRODUCT_ID = 'daybudget_vip_lifetime';
export const VIP_FALLBACK_PRICE = 'NT$30';

// VIP 到手回呼（由 UI 註冊，購買／還原成功時通知畫面更新）
type VipGrantedHandler = () => void;
let vipGrantedHandler: VipGrantedHandler | null = null;

export function setVipGrantedHandler(handler: VipGrantedHandler | null) {
  vipGrantedHandler = handler;
}

// 寫入 isVip（只在已有設定時寫入，避免跳過 Welcome 引導流程）
async function grantVip() {
  const savedSettings = await load<AppSettings>(KEYS.SETTINGS);
  if (!savedSettings || savedSettings.isVip) return;
  await save(KEYS.SETTINGS, { ...savedSettings, isVip: true });
  vipGrantedHandler?.();
}

// 確保商店連線（重複呼叫時 initConnection 可能拋錯，忽略）
async function ensureConnection() {
  try {
    await initConnection();
  } catch {
    // 已連線，忽略
  }
}

let attached = false;

// 初始化內購：連線、掛事件監聽、還原已買斷的 VIP（App 啟動時呼叫一次）
export async function initIap() {
  if (attached) return;
  attached = true;

  await ensureConnection();

  purchaseUpdatedListener(async (purchase: Purchase) => {
    if (purchase.productId !== VIP_PRODUCT_ID) return;
    if (purchase.purchaseState !== 'purchased') return;
    try {
      // 買斷型商品：finishTransaction 同時完成 acknowledge
      await finishTransaction({ purchase, isConsumable: false });
    } catch (error) {
      console.error('[purchase] finishTransaction 失敗:', error);
    }
    await grantVip();
  });

  purchaseErrorListener((error: PurchaseError) => {
    if (error.code === 'user-cancelled') return; // 使用者取消，不提示
    console.error('[purchase] 購買失敗:', error.code, error.message);
  });

  await restorePurchases();
}

// 還原購買：查詢此帳號未完成的買斷紀錄（重裝 App 用）
export async function restorePurchases(): Promise<boolean> {
  try {
    await ensureConnection();
    const purchases = await getAvailablePurchases();
    const owned = purchases.some(
      p => p.productId === VIP_PRODUCT_ID && p.purchaseState === 'purchased'
    );
    if (!owned) return false;
    await grantVip();
    return true;
  } catch (error) {
    console.error('[purchase] 還原購買失敗:', error);
    return false;
  }
}

// 取得商品資訊（顯示 Play 商店實際定價）
export async function getVipProduct(): Promise<Product | null> {
  try {
    await ensureConnection();
    const products = (await fetchProducts({
      skus: [VIP_PRODUCT_ID],
      type: 'in-app',
    })) as Product[] | null;
    return products?.[0] ?? null;
  } catch (error) {
    console.error('[purchase] 取得商品失敗:', error);
    return null;
  }
}

// 發起購買（成功後由 purchaseUpdatedListener 完成授權）
export async function buyVip(): Promise<void> {
  await ensureConnection();
  if (Platform.OS === 'ios') {
    await requestPurchase({ request: { apple: { sku: VIP_PRODUCT_ID } }, type: 'in-app' });
  } else {
    await requestPurchase({ request: { google: { skus: [VIP_PRODUCT_ID] } }, type: 'in-app' });
  }
}
