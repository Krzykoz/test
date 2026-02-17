import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { AnalysisEngine } from '../services/analysisEngine';
import { KeyVault, RoleDefinition, RoleAssignment, Identity, AnalysisResult, ExportSelection } from '../types';
import { IdentityTable } from '../components/IdentityTable';
import { ExportPanel } from '../components/ExportPanel';

interface OfflineWorkspaceScreenProps {
  vault: KeyVault;
  roleDefinitions: RoleDefinition[];
  roleAssignments: RoleAssignment[];
  identities: Map<string, Identity>;
  onBack: () => void;
  includeCustomRoles: boolean;
  onToggleCustomRoles: (value: boolean) => void;
}

export const OfflineWorkspaceScreen: React.FC<OfflineWorkspaceScreenProps> = ({
  vault,
  roleDefinitions,
  roleAssignments,
  identities,
  onBack,
  includeCustomRoles,
  onToggleCustomRoles,
}) => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selection, setSelection] = useState<ExportSelection>({});

  useEffect(() => {
    performAnalysis();
  }, [includeCustomRoles]);

  const performAnalysis = () => {
    const engine = new AnalysisEngine(roleDefinitions, includeCustomRoles);
    const result = engine.analyzeVault(vault, identities, roleAssignments);
    setAnalysisResult(result);

    // Initialize selection
    const initialSelection: ExportSelection = {};
    result.identityAnalyses.forEach(ia => {
      initialSelection[ia.identity.objectId] = {
        selected: true,
        selectedStrategy: 'Balanced',
      };
    });
    setSelection(initialSelection);
  };

  if (!analysisResult) {
    return null;
  }

  return (
    <div className="workspace-container">
      <div className="workspace-header">
        <div className="workspace-title">
          <h1>{vault.name}</h1>
          <p className="vault-details">
            {vault.location} • {vault.sku} SKU • Offline Mode
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
          <button onClick={onBack} className="btn-secondary">
            Back
          </button>
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
