import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const getRoleName = (role: string) => {
    switch (role) {
      case 'kpp_officer':
        return 'Черговий КПП';
      case 'unit_officer':
        return 'Черговий частини';
      default:
        return role;
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1>Система контролю КПП</h1>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <span className="user-name">{user.fullName}</span>
            <span className="user-role">({getRoleName(user.role)})</span>
          </div>
          
          <button 
            onClick={onLogout}
            className="logout-button"
            title="Вийти з системи"
          >
            Вихід
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;