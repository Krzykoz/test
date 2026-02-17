import React, { useState } from 'react';
import { ChevronDown, ChevronRight, User, Users, Cog, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { AnalysisResult, ExportSelection, IdentityAnalysis } from '../types';
import { CoverageChart } from './CoverageChart';

interface IdentityTableProps {
  analysisResult: AnalysisResult;
  selection: ExportSelection;
  onSelectionChange: (selection: ExportSelection) => void;
}

export const IdentityTable: React.FC<IdentityTableProps> = ({
  analysisResult,
  selection,
  onSelectionChange,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [groupBy, setGroupBy] = useState<'none' | 'type' | 'status'>('type');

  const toggleRow = (objectId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(objectId)) {
      newExpanded.delete(objectId);
    } else {
      newExpanded.add(objectId);
    }
    setExpandedRows(newExpanded);
  };

  const toggleSelection = (objectId: string) => {
    const newSelection = { ...selection };
    newSelection[objectId] = {
      ...newSelection[objectId],
      selected: !newSelection[objectId]?.selected,
    };
    onSelectionChange(newSelection);
  };

  const changeStrategy = (objectId: string, strategy: string) => {
    const newSelection = { ...selection };
    newSelection[objectId] = {
      ...newSelection[objectId],
      selectedStrategy: strategy,
    };
    onSelectionChange(newSelection);
  };

  const getIdentityIcon = (type: string) => {
    switch (type) {
      case 'User':
        return <User size={16} />;
      case 'Group':
        return <Users size={16} />;
      case 'ServicePrincipal':
      case 'Application':
        return <Cog size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getStatusIcon = (ia: IdentityAnalysis) => {
    if (ia.existingCoverage?.isFull) {
      return <CheckCircle size={16} className="status-full" />;
    } else if (ia.existingCoverage?.isPartial) {
      return <AlertTriangle size={16} className="status-partial" />;
    }
    return <AlertCircle size={16} className="status-none" />;
  };

  const getStatusLabel = (ia: IdentityAnalysis) => {
    if (ia.existingCoverage?.isFull) return 'Fully Migrated';
    if (ia.existingCoverage?.isPartial) return 'Partially Migrated';
    return 'Not Migrated';
  };

  const groupIdentities = () => {
    const groups = new Map<string, IdentityAnalysis[]>();
    
    analysisResult.identityAnalyses.forEach(ia => {
      let key = 'All';
      
      if (groupBy === 'type') {
        key = ia.identity.type;
      } else if (groupBy === 'status') {
        key = getStatusLabel(ia);
      }
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(ia);
    });
    
    return groups;
  };

  const groups = groupIdentities();

  return (
    <div className="identity-table-container">
      <div className="table-header">
        <h2>Identity Analysis</h2>
        <div className="table-controls">
          <label>
            Group by:
            <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as any)}>
              <option value="none">None</option>
              <option value="type">Identity Type</option>
              <option value="status">Migration Status</option>
            </select>
          </label>
        </div>
      </div>

      <div className="identity-table">
        {Array.from(groups.entries()).map(([groupName, identities]) => (
          <div key={groupName} className="identity-group">
            {groupBy !== 'none' && (
              <div className="group-header">
                <h3>{groupName}</h3>
                <span className="group-count">{identities.length} identities</span>
              </div>
            )}

            {identities.map((ia) => {
              const isExpanded = expandedRows.has(ia.identity.objectId);
              const isSelected = selection[ia.identity.objectId]?.selected;
              const selectedStrategy = selection[ia.identity.objectId]?.selectedStrategy || 'Balanced';
              const recommendation = ia.recommendations.find(r => r.strategy === selectedStrategy);

              return (
                <div key={ia.identity.objectId} className="identity-row-wrapper">
                  <div className={`identity-row ${isExpanded ? 'expanded' : ''}`}>
                    <div className="row-main">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(ia.identity.objectId)}
                        className="row-checkbox"
                      />

                      <button
                        onClick={() => toggleRow(ia.identity.objectId)}
                        className="expand-button"
                      >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>

                      <div className="identity-info">
                        <div className="identity-name">
                          {getIdentityIcon(ia.identity.type)}
                          <span>{ia.identity.displayName || 'Unknown'}</span>
                        </div>
                        <div className="identity-meta">
                          {ia.identity.type} • {ia.identity.objectId}
                        </div>
                      </div>

                      <div className="status-info">
                        {getStatusIcon(ia)}
                        <span>{getStatusLabel(ia)}</span>
                      </div>

                      <div className="strategy-selector">
                        <select
                          value={selectedStrategy}
                          onChange={(e) => changeStrategy(ia.identity.objectId, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="Minimize Excess">Minimize Excess</option>
                          <option value="Balanced">Balanced</option>
                          <option value="Max Coverage">Max Coverage</option>
                        </select>
                      </div>

                      <div className="recommendation-preview">
                        {recommendation && (
                          <>
                            <div className="recommended-roles">
                              {recommendation.roles.join(', ')}
                            </div>
                            <div className="coverage-badge">
                              {(recommendation.confidence * 100).toFixed(0)}% coverage
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && recommendation && (
                    <div className="identity-details">
                      <div className="details-section">
                        <h4>Original Permissions</h4>
                        <div className="permissions-grid">
                          {Object.entries(ia.originalPermissions).map(([category, perms]) => (
                            perms && perms.length > 0 && (
                              <div key={category} className="permission-category">
                                <strong>{category}:</strong> {perms.join(', ')}
                              </div>
                            )
                          ))}
                        </div>
                      </div>

                      <div className="details-section">
                        <h4>Recommended Roles</h4>
                        <div className="roles-list">
                          {recommendation.perRoleBreakdown.map((role) => (
                            <div key={role.roleId} className="role-item">
                              <div className="role-name">{role.roleName}</div>
                              <div className="role-stats">
                                <span className="role-stat-item">
                                  ✓ {role.covered.length} covered
                                </span>
                                {role.excess.length > 0 && (
                                  <span className="role-stat-item excess">
                                    + {role.excess.length} excess
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="details-section">
                        <h4>Coverage Analysis</h4>
                        <CoverageChart
                          covered={recommendation.covered.length}
                          missing={recommendation.missing.length}
                          excess={recommendation.excess.length}
                        />
                        <div className="coverage-details">
                          <div className="coverage-stat">
                            <span className="stat-label">Covered:</span>
                            <span className="stat-value">{recommendation.covered.length}</span>
                          </div>
                          <div className="coverage-stat">
                            <span className="stat-label">Missing:</span>
                            <span className="stat-value">{recommendation.missing.length}</span>
                          </div>
                          <div className="coverage-stat">
                            <span className="stat-label">Excess:</span>
                            <span className="stat-value">{recommendation.excess.length}</span>
                          </div>
                        </div>
                      </div>

                      {ia.existingRoles && ia.existingRoles.length > 0 && (
                        <div className="details-section">
                          <h4>Existing Role Assignments</h4>
                          <div className="existing-roles">
                            {ia.existingRoles.map((assignment) => {
                              const role = analysisResult.roleDefinitions.find(
                                r => r.id === assignment.properties.roleDefinitionId
                              );
                              return (
                                <div key={assignment.id} className="existing-role-item">
                                  {role?.properties.roleName || 'Unknown Role'}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="details-section">
                        <h4>Strategy Reasoning</h4>
                        <p className="reasoning-text">{recommendation.reasoning}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
