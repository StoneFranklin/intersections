// Get today's date string for storage key
export function getTodayKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

// Get yesterday's date key
export function getYesterdayKey(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;
}

// Get today's date in zero-padded YYYY-MM-DD format (local time, not UTC)
// Use this for DB comparisons to avoid UTC midnight rollover issues
export function getTodayDate(): string {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${mm}-${dd}`;
}

// Get yesterday's date in zero-padded YYYY-MM-DD format (local time, not UTC)
export function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
  const dd = String(yesterday.getDate()).padStart(2, '0');
  return `${yesterday.getFullYear()}-${mm}-${dd}`;
}

