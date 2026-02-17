import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle, Settings } from 'lucide-react';
import { AzureApiService } from '../services/azureApi';
import { AnalysisEngine } from '../services/analysisEngine';
import { AzureSubscription, KeyVault, AnalysisResult, ExportSelection } from '../types';
import { IdentityTable } from '../components/IdentityTable';
import { ExportPanel } from '../components/ExportPanel';

interface WorkspaceScreenProps {
  apiService?: AzureApiService;
  subscription?: AzureSubscription;
  vault: KeyVault;
  onBack: () => void;
  includeCustomRoles: boolean;
  onToggleCustomRoles: (value: boolean) => void;
}

export const WorkspaceScreen: React.FC<WorkspaceScreenProps> = ({
  apiService,
  vault,
  onBack,
  includeCustomRoles,
  onToggleCustomRoles,
}) => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selection, setSelection] = useState<ExportSelection>({});

  useEffect(() => {
    performAnalysis();
  }, [vault, includeCustomRoles]);

  const performAnalysis = async () => {
    setLoading(true);
    setError('');

    try {
      let roleDefinitions, roleAssignments, identitiesMap;

      if (apiService) {
        // Online mode
        [roleDefinitions, roleAssignments] = await Promise.all([
          apiService.listRoleDefinitions(vault.id),
          apiService.listRoleAssignments(vault.id),
        ]);

        // Get unique object IDs
        const objectIds = new Set<string>();
        vault.properties.accessPolicies?.forEach(policy => {
          objectIds.add(policy.objectId);
        });

        identitiesMap = await apiService.resolveIdentities(Array.from(objectIds));
      } else {
        // Offline mode - this should have been set externally
        throw new Error('Offline mode not properly initialized');
      }

      const engine = new AnalysisEngine(roleDefinitions, includeCustomRoles);
      const result = engine.analyzeVault(vault, identitiesMap, roleAssignments);

      setAnalysisResult(result);

      // Initialize selection with default strategy
      const initialSelection: ExportSelection = {};
      result.identityAnalyses.forEach(ia => {
        initialSelection[ia.identity.objectId] = {
          selected: true,
          selectedStrategy: 'Balanced',
        };
      });
      setSelection(initialSelection);
    } catch (err) {
      setError(`Analysis failed: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="workspace-loading">
        <Loader className="spinner" size={48} />
        <p>Analyzing vault access policies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workspace-error">
        <AlertCircle size={48} />
        <p>{error}</p>
        <button onClick={onBack} className="btn-secondary">
          Go Back
        </button>
      </div>
    );
  }

  if (!analysisResult) {
    return null;
  }

  return (
    <div className="workspace-container">
      <div className="workspace-header">
        <div className="workspace-title">
          <h1>{vault.name}</h1>
          <p className="vault-details">
            {vault.location} • {vault.sku} SKU
          </p>
        </div>

        <div className="workspace-actions">
          <div className="settings-toggle">
            <Settings size={16} />
            <label>
              <input
                type="checkbox"
                checked={includeCustomRoles}
                onChange={(e) => onToggleCustomRoles(e.target.checked)}
              />
              Include Custom Roles
            </label>
          </div>
        </div>
      </div>

      <div className="workspace-stats">
        <div className="stat-card">
          <div className="stat-value">{analysisResult.identityAnalyses.length}</div>
          <div className="stat-label">Identities</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {analysisResult.identityAnalyses.filter(ia => ia.existingCoverage?.isFull).length}
          </div>
          <div className="stat-label">Already Migrated</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {analysisResult.identityAnalyses.filter(ia => ia.existingCoverage?.isPartial).length}
          </div>
          <div className="stat-label">Partially Migrated</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {analysisResult.identityAnalyses.filter(ia => !ia.existingCoverage?.isFull && !ia.existingCoverage?.isPartial).length}
          </div>
          <div className="stat-label">Not Migrated</div>
        </div>
      </div>

      <IdentityTable
        analysisResult={analysisResult}
        selection={selection}
        onSelectionChange={setSelection}
      />

      <ExportPanel
        analysisResult={analysisResult}
        selection={selection}
      />
    </div>
  );
};
