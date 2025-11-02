import React, { useState } from 'react';
import apiService from '../services/api';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ username: false, password: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({ username: false, password: false });
    setIsLoading(true);

    const newFieldErrors = { username: false, password: false };
    
    if (!username.trim()) {
      setError('Введіть логін');
      newFieldErrors.username = true;
      setFieldErrors(newFieldErrors);
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Введіть пароль');
      newFieldErrors.password = true;
      setFieldErrors(newFieldErrors);
      setIsLoading(false);
      return;
    }

    if (username.trim().length < 3) {
      setError('Логін повинен містити принаймні 3 символи');
      newFieldErrors.username = true;
      setFieldErrors(newFieldErrors);
      setIsLoading(false);
      return;
    }

    if (password.length < 4) {
      setError('Пароль повинен містити принаймні 4 символи');
      newFieldErrors.password = true;
      setFieldErrors(newFieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiService.login({ 
        username: username.trim(), 
        password: password 
      });
      onLogin(response.user, response.token);
    } catch (err) {
      console.error('Login failed:', err);
      
      let errorMessage = 'Помилка входу в систему. Спробуйте ще раз.';
      let shouldHighlightFields = false;
      
      if (err.response?.status === 401) {
        errorMessage = err.response?.data?.error || 'Невірний логін або пароль';
        shouldHighlightFields = true;
      } else if (err.response?.status === 403) {
        errorMessage = 'Доступ заборонено';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Помилка сервера. Спробуйте пізніше.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
      
      if (shouldHighlightFields) {
        setFieldErrors({ username: true, password: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo-container">
            <img src="/images/logo.png" alt="Інститутський логотип" className="institute-logo" />
          </div>
          <h2>Система контролю КПП</h2>
          <p>Увійдіть до системи для продовження роботи</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Логін</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (fieldErrors.username) {
                  setFieldErrors(prev => ({ ...prev, username: false }));
                }
              }}
              required
              disabled={isLoading}
              placeholder="Введіть службовий логін"
              className={fieldErrors.username ? 'error' : ''}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors(prev => ({ ...prev, password: false }));
                }
              }}
              required
              disabled={isLoading}
              placeholder="Введіть службовий пароль"
              className={fieldErrors.password ? 'error' : ''}
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading || !username || !password}
          >
            {isLoading ? 'Вхід...' : 'Увійти'}
          </button>
        </form>

        <div className="login-info">
          <h3>Ролі користувачів:</h3>
          <ul>
            <li><strong>Черговий КПП</strong> - контроль проїзду транспорту</li>
            <li><strong>Черговий інституту</strong> - управління списком автомобілів</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
