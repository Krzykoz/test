import React, { useState } from 'react';
import { Key, AlertCircle } from 'lucide-react';
import { AzureApiService } from '../services/azureApi';

interface LoginScreenProps {
  onLogin: (service: AzureApiService, userName: string, tenantName: string) => void;
  onOfflineMode: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onOfflineMode }) => {
  const [managementToken, setManagementToken] = useState('');
  const [graphToken, setGraphToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const service = new AzureApiService(managementToken, graphToken);
      const validation = service.validateTokens();

      if (!validation.isValid) {
        setError(validation.error || 'Invalid tokens');
        setLoading(false);
        return;
      }

      onLogin(service, validation.userName!, validation.tenantName!);
    } catch (err) {
      setError(`Login failed: ${err}`);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <Key size={48} className="login-icon" />
          <h1>Azure Key Vault RBAC Migrator</h1>
          <p className="login-subtitle">
            Migrate from Access Policies to RBAC with intelligent role recommendations
          </p>
        </div>

        <div className="login-form">
          <div className="form-group">
            <label htmlFor="mgmt-token">Azure Management Token</label>
            <textarea
              id="mgmt-token"
              placeholder="Paste Azure Management API token (https://management.azure.com)"
              value={managementToken}
              onChange={(e) => setManagementToken(e.target.value)}
              rows={4}
              className="token-input"
            />
            <small className="help-text">
              Get token for: <code>https://management.azure.com</code>
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="graph-token">Microsoft Graph Token</label>
            <textarea
              id="graph-token"
              placeholder="Paste Microsoft Graph API token (https://graph.microsoft.com)"
              value={graphToken}
              onChange={(e) => setGraphToken(e.target.value)}
              rows={4}
              className="token-input"
            />
            <small className="help-text">
              Get token for: <code>https://graph.microsoft.com</code>
            </small>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={!managementToken || !graphToken || loading}
            className="btn-primary"
          >
            {loading ? 'Validating...' : 'Connect to Azure'}
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <button onClick={onOfflineMode} className="btn-secondary">
            Use Offline Mode
          </button>

          <div className="info-box">
            <p><strong>Online Mode:</strong> Connect to Azure to automatically fetch subscriptions, vaults, and identities.</p>
            <p><strong>Offline Mode:</strong> Paste exported JSON data for analysis without Azure connectivity.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
