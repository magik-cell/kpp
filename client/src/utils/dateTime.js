// Утилітні функції для роботи з датами та часом

export const formatDateTime = (timestamp) => {
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

export const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('uk-UA', {
    timeZone: 'Europe/Kiev',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('uk-UA', {
    timeZone: 'Europe/Kiev',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const getCurrentKyivTime = () => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Kiev' }));
};

export const isToday = (timestamp) => {
  const today = getCurrentKyivTime();
  const inputDate = new Date(timestamp);
  
  const todayStr = today.toLocaleDateString('uk-UA', { timeZone: 'Europe/Kiev' });
  const inputStr = inputDate.toLocaleDateString('uk-UA', { timeZone: 'Europe/Kiev' });
  
  return todayStr === inputStr;
};
