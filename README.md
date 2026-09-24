# 今日可花 (Today Budget)

一個極簡的每日預算追蹤 App。每天只需要知道一件事：**今天還能花多少**。

基於 [Expo](https://expo.dev)（React Native + TypeScript）打造，支援 iOS / Android / Web 三個平台，所有資料儲存在裝置本機，不需要帳號、不需要網路。

## 功能特色

- **首次使用引導**：選擇幣別即可開始（免費版每日預算固定 1000 元）
- **今日剩餘**：主畫面大字顯示今天還能花多少，超支時會以紅色負數提醒
- **快速扣款**：一鍵扣除固定金額（50 / 100 / 200 / 500）
- **手動輸入**：輸入任意金額記錄花費
- **撤銷最後一筆**：手滑記錯不用怕，可立即復原
- **歷史紀錄**：查看過去每天的預算、已花、剩餘（或超支）金額
- **桌面 Widget**：顯示今日剩餘，每 30 分鐘自動更新、跨日自動切換新預算、點擊開啟 App
- **免費 / VIP 雙層**：免費版受限、VIP 解鎖（詳見下方說明）
- **設定**：隨時修改幣別（NT$ / USD / JPY / EUR / KRW）；每日預算為 VIP 專屬

## 技術棧

| 類別 | 技術 |
|---|---|
| 框架 | Expo SDK 57（React Native 0.79） |
| 語言 | TypeScript 5.6 |
| UI | React Native + react-native-web |
| 狀態管理 | React Hooks（自訂 `useBudget`） |
| 資料儲存 | @react-native-async-storage/async-storage |
| 桌面 Widget | [expo-widgets](https://docs.expo.dev/versions/latest/sdk/widgets/)（iOS）+ [react-native-android-widget](https://github.com/react-native-android-widget/react-native-android-widget)（Android） |

## 專案結構

```
today-budget/
├── App.tsx                 # App 入口：頁面路由、首次使用判斷、Widget handler 註冊
├── app.json                # Expo 專案設定（含 Widget plugin 設定）
├── src/
│   ├── hooks/
│   │   └── useBudget.ts    # 核心預算邏輯（花費、撤銷、剩餘計算、免費版限制）
│   ├── pages/
│   │   ├── Welcome.tsx     # 首次使用引導頁（幣別選擇）
│   │   ├── Home.tsx        # 主畫面（今日剩餘與記帳）
│   │   ├── History.tsx     # 歷史紀錄（免費版限 5 天）
│   │   └── Settings.tsx    # 設定頁（含會員方案切換）
│   ├── widgets/
│   │   ├── TodayBudgetWidget.tsx         # iOS Widget（expo-widgets / SwiftUI）
│   │   ├── AndroidTodayBudgetWidget.tsx  # Android 桌面 Widget 版面與重繪
│   │   └── registerWidgetTaskHandler.tsx # Android Widget headless task handler
│   ├── services/
│   │   ├── storage.ts      # AsyncStorage 封裝
│   │   └── widgetSync.tsx  # App → Widget 資料同步（雙平台）
│   ├── types/
│   │   └── budget.ts       # 型別定義與常數（含免費版限制常數）
│   └── utils/
│       ├── currency.ts     # 金額格式化與安全加減（避免浮點數誤差）
│       └── date.ts         # 日期工具
```

## 開始使用

### 環境需求

- [Node.js](https://nodejs.org) 18 以上
- [Expo Go](https://expo.dev/go) App（手機快速測試用）— 注意：**Widget 無法在 Expo Go 顯示**
- [Android Studio](https://developer.android.com/studio)（測試桌面 Widget 需開發版建置）

### 安裝與啟動

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm start
```

啟動後：

- **手機測試**：用 Expo Go 掃描終端機上的 QR Code（手機與電腦需在同一網路；若連不上可改用 `npx expo start --tunnel`）
- **網頁測試**：在終端機按 `w`，或執行 `npm run web`，瀏覽器開啟 `http://localhost:19006`

### 其他指令

```bash
npm run android   # 在 Android 裝置/模擬器執行（開發版建置）
npm run ios       # 在 iOS 裝置/模擬器執行（需 macOS）
eas build --platform android --profile preview #打包APK測試
```

## 桌面 Widget

Widget 顯示今日剩餘金額（超支變紅、VIP 金色邊框），具有以下行為：

- 每 30 分鐘系統自動更新
- 跨日（00:00 後）自動切換顯示新一天的預算
- 點擊 Widget 開啟 App
- 記帳 / 撤銷 / 改設定時立即同步更新

**Widget 需要開發版建置（Expo Go 不支援）**：

```bash
npm run android
```

建置完成後：長按桌面 → Widgets → 搜尋「今日可花」→ 拖到桌面。

iOS Widget 需 macOS 或 EAS 雲端建置 + Apple 開發者帳號。

## 免費 / VIP 雙層

| | 免費版（預設） | 👑 VIP |
|---|---|---|
| 歷史紀錄 | 最近 5 天 | 無限 |
| 每日預算 | 固定 1000 元 | 自訂任意金額 |
| 桌面 Widget | 標準外觀 | 金色邊框 |

VIP 切換位於「設定 → 會員方案」。注意：

- 付費流程尚未實作，目前開關僅供測試
- 歷史資料不會刪除，只是顯示限制 — 升級 VIP 後完整歷史立即出現
- 免費版強制規則於資料層執行（自訂金額一律被覆蓋為 1000）

## 資料儲存

所有資料（每日紀錄、設定）皆透過 AsyncStorage 儲存在裝置本機：

| Key | 內容 |
|---|---|
| `@today_budget:records` | 每日紀錄陣列（日期、預算、已花、最後一筆金額） |
| `@today_budget:settings` | App 設定（每日預算、幣別、結餘累積、VIP 狀態） |

不會上傳任何資料到雲端，清除 App 資料即會重置。

## 授權

Private project. All rights reserved.
