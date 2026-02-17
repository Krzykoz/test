import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { AnalysisResult, ExportSelection } from '../types';

export class ExportService {
  static async exportToCSV(
    analysis: AnalysisResult,
    selection: ExportSelection
  ): Promise<void> {
    const lines: string[] = [
      'Identity Name,Identity Type,Object ID,Selected Strategy,Assigned Roles,Coverage %,Missing Permissions,Excess Permissions'
    ];

    analysis.identityAnalyses.forEach(identityAnalysis => {
      const selected = selection[identityAnalysis.identity.objectId];
      if (!selected?.selected) return;

      const recommendation = identityAnalysis.recommendations.find(
        r => r.strategy === selected.selectedStrategy
      );
      if (!recommendation) return;

      const coveragePercent = (recommendation.confidence * 100).toFixed(1);
      
      lines.push([
        `"${identityAnalysis.identity.displayName || 'Unknown'}"`,
        identityAnalysis.identity.type,
        identityAnalysis.identity.objectId,
        selected.selectedStrategy,
        `"${recommendation.roles.join(', ')}"`,
        coveragePercent,
        recommendation.missing.length.toString(),
        recommendation.excess.length.toString(),
      ].join(','));
    });

    const csvContent = lines.join('\n');
    
    const filePath = await save({
      filters: [{
        name: 'CSV',
        extensions: ['csv']
      }],
      defaultPath: `rbac-migration-${analysis.vaultName}-${Date.now()}.csv`
    });

    if (filePath) {
      await writeTextFile(filePath, csvContent);
    }
  }

  static async exportToJSON(
    analysis: AnalysisResult,
    selection: ExportSelection
  ): Promise<void> {
    const exportData = {
      vaultName: analysis.vaultName,
      vaultId: analysis.vaultId,
      timestamp: analysis.timestamp,
      recommendations: analysis.identityAnalyses
        .filter(ia => selection[ia.identity.objectId]?.selected)
        .map(ia => {
          const selected = selection[ia.identity.objectId];
          const recommendation = ia.recommendations.find(
            r => r.strategy === selected.selectedStrategy
          );
          
          return {
            identity: ia.identity,
            selectedStrategy: selected.selectedStrategy,
            recommendedRoles: recommendation?.roles || [],
            roleIds: recommendation?.roleIds || [],
            coverage: {
              covered: recommendation?.covered || [],
              missing: recommendation?.missing || [],
              excess: recommendation?.excess || [],
              confidence: recommendation?.confidence || 0,
            },
            originalPermissions: ia.originalPermissions,
          };
        }),
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    
    const filePath = await save({
      filters: [{
        name: 'JSON',
        extensions: ['json']
      }],
      defaultPath: `rbac-migration-${analysis.vaultName}-${Date.now()}.json`
    });

    if (filePath) {
      await writeTextFile(filePath, jsonContent);
    }
  }

  static async exportToPowerShell(
    analysis: AnalysisResult,
    selection: ExportSelection
  ): Promise<void> {
    const lines: string[] = [
      '# Azure Key Vault RBAC Migration Script',
      `# Generated: ${new Date().toISOString()}`,
      `# Vault: ${analysis.vaultName}`,
      `# Vault ID: ${analysis.vaultId}`,
      '',
      '# Connect to Azure (uncomment if needed)',
      '# Connect-AzAccount',
      '',
      '# Variables',
      `$vaultId = "${analysis.vaultId}"`,
      '$scope = $vaultId',
      '',
      '# Role Assignments',
      '',
    ];

    analysis.identityAnalyses.forEach(identityAnalysis => {
      const selected = selection[identityAnalysis.identity.objectId];
      if (!selected?.selected) return;

      const recommendation = identityAnalysis.recommendations.find(
        r => r.strategy === selected.selectedStrategy
      );
      if (!recommendation) return;

      lines.push(`# ${identityAnalysis.identity.displayName || 'Unknown'} (${identityAnalysis.identity.type})`);
      lines.push(`# Strategy: ${selected.selectedStrategy}`);
      lines.push(`# Coverage: ${(recommendation.confidence * 100).toFixed(1)}%`);
      
      if (recommendation.missing.length > 0) {
        lines.push(`# Missing ${recommendation.missing.length} permission(s)`);
      }
      
      recommendation.roles.forEach((roleName) => {
        lines.push(
          `New-AzRoleAssignment -ObjectId "${identityAnalysis.identity.objectId}" ` +
          `-RoleDefinitionName "${roleName}" ` +
          `-Scope $scope`
        );
      });
      
      lines.push('');
    });

    lines.push('# After verifying the role assignments work correctly,');
    lines.push('# you can disable access policies on the vault:');
    lines.push('# Update-AzKeyVault -VaultName "<vault-name>" -EnableRbacAuthorization $true');
    
    const psContent = lines.join('\n');
    
    const filePath = await save({
      filters: [{
        name: 'PowerShell',
        extensions: ['ps1']
      }],
      defaultPath: `rbac-migration-${analysis.vaultName}-${Date.now()}.ps1`
    });

    if (filePath) {
      await writeTextFile(filePath, psContent);
    }
  }
}
