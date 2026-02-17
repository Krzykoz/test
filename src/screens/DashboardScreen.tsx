import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle, ChevronRight, Key, FolderOpen } from 'lucide-react';
import { AzureApiService } from '../services/azureApi';
import { AzureSubscription, KeyVault } from '../types';

interface DashboardScreenProps {
  apiService: AzureApiService;
  onVaultSelected: (subscription: AzureSubscription, vault: KeyVault) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  apiService,
  onVaultSelected,
}) => {
  const [subscriptions, setSubscriptions] = useState<AzureSubscription[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<AzureSubscription | null>(null);
  const [vaults, setVaults] = useState<KeyVault[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVaults, setLoadingVaults] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const subs = await apiService.listSubscriptions();
      setSubscriptions(subs);
      setError('');
    } catch (err) {
      setError(`Failed to load subscriptions: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionClick = async (subscription: AzureSubscription) => {
    setSelectedSubscription(subscription);
    setLoadingVaults(true);
    setError('');

    try {
      const vaultList = await apiService.listKeyVaults(subscription.subscriptionId);
      setVaults(vaultList);
    } catch (err) {
      setError(`Failed to load key vaults: ${err}`);
      setVaults([]);
    } finally {
      setLoadingVaults(false);
    }
  };

  const handleVaultClick = (vault: KeyVault) => {
    if (selectedSubscription) {
      onVaultSelected(selectedSubscription, vault);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loader className="spinner" size={48} />
        <p>Loading subscriptions...</p>
      </div>
    );
  }

  if (error && subscriptions.length === 0) {
    return (
      <div className="dashboard-error">
        <AlertCircle size={48} />
        <p>{error}</p>
        <button onClick={loadSubscriptions} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Select Key Vault</h2>
        </div>

        <div className="sidebar-section">
          <h3>Subscriptions</h3>
          <div className="subscription-list">
            {subscriptions.map((sub) => (
              <div
                key={sub.subscriptionId}
                className={`subscription-item ${
                  selectedSubscription?.subscriptionId === sub.subscriptionId ? 'active' : ''
                }`}
                onClick={() => handleSubscriptionClick(sub)}
              >
                <FolderOpen size={16} />
                <div className="subscription-info">
                  <div className="subscription-name">{sub.displayName}</div>
                  <div className="subscription-id">{sub.subscriptionId}</div>
                </div>
                <ChevronRight size={16} />
              </div>
            ))}
          </div>
        </div>

        {selectedSubscription && (
          <div className="sidebar-section">
            <h3>Key Vaults</h3>
            {loadingVaults ? (
              <div className="vaults-loading">
                <Loader className="spinner" size={24} />
                <span>Loading vaults...</span>
              </div>
            ) : vaults.length === 0 ? (
              <div className="no-vaults">No key vaults found</div>
            ) : (
              <div className="vault-list">
                {vaults.map((vault) => (
                  <div
                    key={vault.id}
                    className="vault-item"
                    onClick={() => handleVaultClick(vault)}
                  >
                    <Key size={16} />
                    <div className="vault-info">
                      <div className="vault-name">{vault.name}</div>
                      <div className="vault-location">{vault.location}</div>
                    </div>
                    <ChevronRight size={16} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="dashboard-content">
        <div className="welcome-message">
          <Key size={64} className="welcome-icon" />
          <h1>Welcome to Azure Key Vault RBAC Migrator</h1>
          <p>Select a subscription and key vault from the sidebar to begin analysis.</p>
          
          <div className="feature-list">
            <div className="feature-item">
              <h3>Smart Analysis</h3>
              <p>Automatically analyzes access policies and recommends appropriate RBAC roles</p>
            </div>
            <div className="feature-item">
              <h3>Multiple Strategies</h3>
              <p>Choose from three recommendation strategies based on your security requirements</p>
            </div>
            <div className="feature-item">
              <h3>Easy Export</h3>
              <p>Export recommendations as CSV, JSON, or PowerShell scripts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
