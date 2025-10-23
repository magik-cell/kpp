// Утилітні функції для роботи з датами та часом

/**
 * Форматує дату і час для відображення в UI (за київським часом)
 * @param timestamp - ISO строка або Date об'єкт
 * @returns Відформатована строка дати і часу
 */
export const formatDateTime = (timestamp: string | Date): string => {
  return new Date(timestamp).toLocaleString('uk-UA', {
    timeZone: 'Europe/Kiev',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Форматує тільки дату для відображення в UI (за київським часом)
 * @param timestamp - ISO строка або Date об'єкт
 * @returns Відформатована строка дати
 */
export const formatDate = (timestamp: string | Date): string => {
  return new Date(timestamp).toLocaleDateString('uk-UA', {
    timeZone: 'Europe/Kiev',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Форматує тільки час для відображення в UI (за київським часом)
 * @param timestamp - ISO строка або Date об'єкт
 * @returns Відформатована строка часу
 */
export const formatTime = (timestamp: string | Date): string => {
  return new Date(timestamp).toLocaleTimeString('uk-UA', {
    timeZone: 'Europe/Kiev',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Повертає поточну дату і час в київській часовій зоні
 * @returns Date об'єкт для поточного часу в Києві
 */
export const getCurrentKyivTime = (): Date => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Kiev' }));
};

/**
 * Перевіряє, чи є дата сьогоднішньою (за київським часом)
 * @param timestamp - ISO строка або Date об'єкт
 * @returns true якщо дата сьогоднішня
 */
export const isToday = (timestamp: string | Date): boolean => {
  const today = getCurrentKyivTime();
  const inputDate = new Date(timestamp);
  
  const todayStr = today.toLocaleDateString('uk-UA', { timeZone: 'Europe/Kiev' });
  const inputStr = inputDate.toLocaleDateString('uk-UA', { timeZone: 'Europe/Kiev' });
  
  return todayStr === inputStr;
};