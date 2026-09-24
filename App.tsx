import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { load, save, KEYS } from './src/services/storage';
import { type AppSettings, DEFAULT_SETTINGS } from './src/types/budget';
import Home from './src/pages/Home';
import History from './src/pages/History';
import Settings from './src/pages/Settings';
import Welcome from './src/pages/Welcome';

type Page = 'home' | 'history' | 'settings';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null); // null = 還在載入

  // 檢查是否第一次使用
  useEffect(() => {
    async function checkFirstTime() {
      const savedSettings = await load<AppSettings>(KEYS.SETTINGS);
      setIsFirstTime(savedSettings === null);
    }
    checkFirstTime();
  }, []);

  // 完成引導，儲存設定
  const handleWelcomeComplete = async (settings: AppSettings) => {
    await save(KEYS.SETTINGS, settings);
    setIsFirstTime(false);
  };

  // 還在載入
  if (isFirstTime === null) return null;

  // 第一次使用，顯示引導頁
  if (isFirstTime) {
    return (
      <>
        <StatusBar style="dark" />
        <Welcome onComplete={handleWelcomeComplete} />
      </>
    );
  }

  // 正常使用
  return (
    <>
      <StatusBar style="dark" />
      {page === 'home' && (
        <Home
          onGoHistory={() => setPage('history')}
          onGoSettings={() => setPage('settings')}
        />
      )}
      {page === 'history' && (
        <History onBack={() => setPage('home')} />
      )}
      {page === 'settings' && (
        <Settings onBack={() => setPage('home')} />
      )}
    </>
  );
}
