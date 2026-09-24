// 金額格式化（使用整數避免浮點誤差）
export function formatAmount(amount: number, currency: string): string {
  const rounded = Math.round(amount);
  const abs = Math.abs(rounded);
  return `${currency}${abs.toLocaleString()}`;
}

// 安全加法（避免浮點誤差）
export function safeAdd(a: number, b: number): number {
  return Math.round(a + b);
}

// 安全減法
export function safeSubtract(a: number, b: number): number {
  return Math.round(a - b);
}

// 判斷是否超支
export function isOverBudget(remaining: number): boolean {
  return remaining < 0;
}
