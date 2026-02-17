import React, { useState } from 'react';
import { Upload, AlertCircle, ArrowLeft } from 'lucide-react';
import { KeyVault, RoleDefinition, RoleAssignment, Identity } from '../types';

interface OfflineModeScreenProps {
  onDataLoaded: (
    vault: KeyVault,
    roleDefinitions: RoleDefinition[],
    roleAssignments: RoleAssignment[],
    identities: Map<string, Identity>
  ) => void;
  onBack: () => void;
}

export const OfflineModeScreen: React.FC<OfflineModeScreenProps> = ({ onDataLoaded, onBack }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');

  const handleLoad = () => {
    setError('');

    try {
      const data = JSON.parse(jsonInput);

      // Validate structure
      if (!data.vault || !data.roleDefinitions) {
        throw new Error('Invalid JSON structure. Must include vault and roleDefinitions.');
      }

      const vault: KeyVault = data.vault;
      const roleDefinitions: RoleDefinition[] = data.roleDefinitions;
      const roleAssignments: RoleAssignment[] = data.roleAssignments || [];
      
      // Parse identities
      const identities = new Map<string, Identity>();
      if (data.identities) {
        Object.entries(data.identities).forEach(([objectId, identity]) => {
          identities.set(objectId, identity as Identity);
        });
      }

      // Also extract identities from access policies if not provided
      if (vault.properties.accessPolicies) {
        vault.properties.accessPolicies.forEach(policy => {
          if (!identities.has(policy.objectId)) {
            identities.set(policy.objectId, {
              objectId: policy.objectId,
              displayName: `Unknown (${policy.objectId.substring(0, 8)}...)`,
              type: 'Unknown',
            });
          }
        });
      }

      onDataLoaded(vault, roleDefinitions, roleAssignments, identities);
    } catch (err) {
      setError(`Failed to parse JSON: ${err}`);
    }
  };

  const exampleStructure = {
    vault: {
      id: '/subscriptions/{sub-id}/resourceGroups/{rg}/providers/Microsoft.KeyVault/vaults/{name}',
      name: 'my-keyvault',
      location: 'eastus',
      sku: 'Standard',
      properties: {
        accessPolicies: [
          {
            tenantId: '{tenant-id}',
            objectId: '{object-id}',
            permissions: {
              keys: ['get', 'list'],
              secrets: ['get', 'set'],
            },
          },
        ],
      },
    },
    roleDefinitions: [],
    roleAssignments: [],
    identities: {
      '{object-id}': {
        objectId: '{object-id}',
        displayName: 'User Name',
        type: 'User',
      },
    },
  };

  return (
    <div className="offline-container">
      <div className="offline-card">
        <button onClick={onBack} className="back-button">
          <ArrowLeft size={20} />
          Back to Login
        </button>

        <div className="offline-header">
          <Upload size={48} className="offline-icon" />
          <h1>Offline Mode</h1>
          <p className="offline-subtitle">
            Paste exported Azure Key Vault data for offline analysis
          </p>
        </div>

        <div className="offline-form">
          <div className="form-group">
            <label htmlFor="json-input">Vault Data (JSON)</label>
            <textarea
              id="json-input"
              placeholder="Paste JSON data here..."
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={15}
              className="json-input"
            />
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleLoad}
            disabled={!jsonInput}
            className="btn-primary"
          >
            Load Data
          </button>

          <div className="info-box">
            <h3>Expected JSON Structure:</h3>
            <pre className="code-block">
              {JSON.stringify(exampleStructure, null, 2)}
            </pre>
            <p className="help-text">
              You can export this data using Azure CLI, PowerShell, or the Azure Portal.
              The roleDefinitions and roleAssignments are optional but recommended for better analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
