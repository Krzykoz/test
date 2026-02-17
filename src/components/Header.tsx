import React from 'react';
import { Moon, Sun, LogOut, Key } from 'lucide-react';

interface HeaderProps {
  userName?: string;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userName, theme, onThemeToggle, onLogout }) => {
  return (
    <header className="app-header">
      <div className="header-left">
        <Key size={24} className="header-icon" />
        <h1 className="header-title">Azure Key Vault RBAC Migrator</h1>
      </div>

      <div className="header-right">
        {userName && (
          <div className="user-info">
            <span className="user-name">{userName}</span>
          </div>
        )}

        <button onClick={onThemeToggle} className="icon-button" title="Toggle theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {onLogout && (
          <button onClick={onLogout} className="icon-button" title="Logout">
            <LogOut size={20} />
          </button>
        )}
      </div>
    </header>
  );
};
