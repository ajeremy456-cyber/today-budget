// 取得今天日期字串（裝置本地時間，格式 YYYY-MM-DD）
export function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 格式化日期顯示（M/D）
export function formatDateDisplay(dateStr: string): string {
  const [, m, d] = dateStr.split('-');
  return `${parseInt(m)}/${parseInt(d)}`;
}

// 取得今天是星期幾
export function getWeekdayDisplay(dateStr: string): string {
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const date = new Date(dateStr + 'T00:00:00'); // 強制本地時間
  return `週${weekdays[date.getDay()]}`;
}
