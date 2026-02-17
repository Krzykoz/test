import { useState, useEffect } from 'react';
import './App.css';
import { Header } from './components/Header';
import { Breadcrumb } from './components/Breadcrumb';
import { LoginScreen } from './screens/LoginScreen';
import { OfflineModeScreen } from './screens/OfflineModeScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { WorkspaceScreen } from './screens/WorkspaceScreen';
import { OfflineWorkspaceScreen } from './screens/OfflineWorkspaceScreen';
import { AzureApiService } from './services/azureApi';
import { AzureSubscription, KeyVault, RoleDefinition, RoleAssignment, Identity } from './types';

type AppScreen = 
  | { type: 'login' }
  | { type: 'offline-mode' }
  | { type: 'dashboard' }
  | { type: 'workspace'; subscription: AzureSubscription; vault: KeyVault }
  | { type: 'offline-workspace'; vault: KeyVault; roleDefinitions: RoleDefinition[]; roleAssignments: RoleAssignment[]; identities: Map<string, Identity> };

function App() {
  const [screen, setScreen] = useState<AppScreen>({ type: 'login' });
  const [apiService, setApiService] = useState<AzureApiService | null>(null);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [includeCustomRoles, setIncludeCustomRoles] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogin = (service: AzureApiService, user: string, _tenant: string) => {
    setApiService(service);
    setUserName(user);
    setScreen({ type: 'dashboard' });
  };

  const handleOfflineMode = () => {
    setScreen({ type: 'offline-mode' });
  };

  const handleOfflineDataLoaded = (
    vault: KeyVault,
    roleDefinitions: RoleDefinition[],
    roleAssignments: RoleAssignment[],
    identities: Map<string, Identity>
  ) => {
    setScreen({ type: 'offline-workspace', vault, roleDefinitions, roleAssignments, identities });
  };

  const handleVaultSelected = (subscription: AzureSubscription, vault: KeyVault) => {
    setScreen({ type: 'workspace', subscription, vault });
  };

  const handleLogout = () => {
    setApiService(null);
    setUserName(undefined);
    setScreen({ type: 'login' });
  };

  const handleBackToDashboard = () => {
    setScreen({ type: 'dashboard' });
  };

  const handleBackToLogin = () => {
    setScreen({ type: 'login' });
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const getBreadcrumbItems = () => {
    if (screen.type === 'login') return [];
    if (screen.type === 'offline-mode') return [{ label: 'Offline Mode' }];
    if (screen.type === 'dashboard') return [{ label: 'Select Vault' }];
    if (screen.type === 'workspace') {
      return [
        { label: 'Select Vault', onClick: handleBackToDashboard },
        { label: screen.subscription.displayName, onClick: handleBackToDashboard },
        { label: screen.vault.name },
      ];
    }
    if (screen.type === 'offline-workspace') {
      return [
        { label: 'Offline Mode', onClick: handleBackToLogin },
        { label: screen.vault.name },
      ];
    }
    return [];
  };

  return (
    <div className="app">
      {screen.type !== 'login' && (
        <Header
          userName={userName}
          theme={theme}
          onThemeToggle={toggleTheme}
          onLogout={screen.type === 'dashboard' || screen.type === 'workspace' ? handleLogout : undefined}
        />
      )}

      {screen.type !== 'login' && getBreadcrumbItems().length > 0 && (
        <Breadcrumb items={getBreadcrumbItems()} />
      )}

      <main className="app-main">
        {screen.type === 'login' && (
          <LoginScreen onLogin={handleLogin} onOfflineMode={handleOfflineMode} />
        )}

        {screen.type === 'offline-mode' && (
          <OfflineModeScreen
            onDataLoaded={handleOfflineDataLoaded}
            onBack={handleBackToLogin}
          />
        )}

        {screen.type === 'dashboard' && apiService && (
          <DashboardScreen
            apiService={apiService}
            onVaultSelected={handleVaultSelected}
          />
        )}

        {screen.type === 'workspace' && apiService && (
          <WorkspaceScreen
            apiService={apiService}
            subscription={screen.subscription}
            vault={screen.vault}
            onBack={handleBackToDashboard}
            includeCustomRoles={includeCustomRoles}
            onToggleCustomRoles={setIncludeCustomRoles}
          />
        )}

        {screen.type === 'offline-workspace' && (
          <OfflineWorkspaceScreen
            vault={screen.vault}
            roleDefinitions={screen.roleDefinitions}
            roleAssignments={screen.roleAssignments}
            identities={screen.identities}
            onBack={handleBackToLogin}
            includeCustomRoles={includeCustomRoles}
            onToggleCustomRoles={setIncludeCustomRoles}
          />
        )}
      </main>
    </div>
  );
}

export default App;
