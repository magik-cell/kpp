import React, { useState } from 'react';
import { User } from '../types';
import apiService from '../services/api';

interface LoginPageProps {
  onLogin: (user: User, token: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiService.login({ username, password });
      onLogin(response.user, response.token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка входу в систему');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Система контролю КПП</h1>
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
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Введіть ваш логін"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Введіть ваш пароль"
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
            <li><strong>Черговий частини</strong> - управління списком автомобілів</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;