// Цей код потрібно виконати в консолі браузера для очищення localStorage
// Відкрийте Developer Tools (F12) -> Console і вставте цей код:

localStorage.removeItem('authToken');
localStorage.removeItem('currentUser');
console.log('LocalStorage очищено. Перезавантажте сторінку та увійдіть заново.');

// Альтернативно, можете очистити весь localStorage:
// localStorage.clear();