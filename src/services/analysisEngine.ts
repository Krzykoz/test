import {
  KeyVault,
  RoleDefinition,
  RoleAssignment,
  Identity,
  IdentityAnalysis,
  AnalysisResult,
  StrategyRecommendation,
  RoleCoverage,
} from '../types';
import { mapPermissionsToDataActions } from '../utils/permissionMapping';

const BUILTIN_KEY_VAULT_ROLES = [
  'Key Vault Administrator',
  'Key Vault Secrets Officer',
  'Key Vault Secrets User',
  'Key Vault Certificates Officer',
  'Key Vault Crypto Officer',
  'Key Vault Crypto User',
  'Key Vault Reader',
  'Key Vault Crypto Service Encryption User',
];

export class AnalysisEngine {
  private roleDefinitions: RoleDefinition[];

  constructor(roleDefinitions: RoleDefinition[], includeCustomRoles: boolean = false) {
    this.roleDefinitions = includeCustomRoles 
      ? roleDefinitions 
      : roleDefinitions.filter(role => 
          BUILTIN_KEY_VAULT_ROLES.includes(role.properties.roleName)
        );
  }

  analyzeVault(
    vault: KeyVault,
    identities: Map<string, Identity>,
    existingRoleAssignments: RoleAssignment[]
  ): AnalysisResult {
    const accessPolicies = vault.properties.accessPolicies || [];
    const identityAnalyses: IdentityAnalysis[] = [];

    // Group assignments by principal
    const assignmentsByPrincipal = new Map<string, RoleAssignment[]>();
    existingRoleAssignments.forEach(assignment => {
      const principalId = assignment.properties.principalId;
      if (!assignmentsByPrincipal.has(principalId)) {
        assignmentsByPrincipal.set(principalId, []);
      }
      assignmentsByPrincipal.get(principalId)!.push(assignment);
    });

    // Analyze each identity with an access policy
    accessPolicies.forEach(policy => {
      const identity = identities.get(policy.objectId);
      if (!identity) return;

      const requiredDataActions = mapPermissionsToDataActions(policy.permissions);
      const existingRoles = assignmentsByPrincipal.get(policy.objectId) || [];
      
      // Calculate existing coverage
      const existingCoverage = this.calculateExistingCoverage(
        requiredDataActions,
        existingRoles
      );

      // Generate recommendations
      const recommendations = this.generateRecommendations(requiredDataActions);

      identityAnalyses.push({
        identity,
        originalPermissions: policy.permissions,
        requiredDataActions,
        recommendations,
        existingRoles,
        existingCoverage,
      });
    });

    return {
      vaultName: vault.name,
      vaultId: vault.id,
      identityAnalyses,
      roleDefinitions: this.roleDefinitions,
      timestamp: new Date().toISOString(),
    };
  }

  private calculateExistingCoverage(
    requiredActions: string[],
    existingAssignments: RoleAssignment[]
  ): {
    covered: string[];
    missing: string[];
    isFull: boolean;
    isPartial: boolean;
  } {
    const coveredActions = new Set<string>();

    existingAssignments.forEach(assignment => {
      const role = this.roleDefinitions.find(
        r => r.id === assignment.properties.roleDefinitionId
      );
      if (role) {
        role.properties.permissions.forEach(perm => {
          (perm.dataActions || []).forEach(action => {
            // Handle wildcard matching
            if (action.includes('*')) {
              const pattern = action.replace(/\*/g, '.*');
              const regex = new RegExp(`^${pattern}$`);
              requiredActions.forEach(req => {
                if (regex.test(req)) {
                  coveredActions.add(req);
                }
              });
            } else {
              coveredActions.add(action);
            }
          });
        });
      }
    });

    const covered = requiredActions.filter(action => coveredActions.has(action));
    const missing = requiredActions.filter(action => !coveredActions.has(action));

    return {
      covered,
      missing,
      isFull: missing.length === 0 && requiredActions.length > 0,
      isPartial: covered.length > 0 && missing.length > 0,
    };
  }

  private generateRecommendations(requiredDataActions: string[]): StrategyRecommendation[] {
    const recommendations: StrategyRecommendation[] = [];

    // Strategy 1: Minimize Excess
    const minimizeExcess = this.findMinimalRoleSet(requiredDataActions);
    recommendations.push({
      strategy: 'Minimize Excess',
      ...minimizeExcess,
    });

    // Strategy 2: Balanced
    const balanced = this.findBalancedRoleSet(requiredDataActions);
    recommendations.push({
      strategy: 'Balanced',
      ...balanced,
    });

    // Strategy 3: Max Coverage
    const maxCoverage = this.findMaxCoverageRoleSet(requiredDataActions);
    recommendations.push({
      strategy: 'Max Coverage',
      ...maxCoverage,
    });

    return recommendations;
  }

  private findMinimalRoleSet(requiredDataActions: string[]): Omit<StrategyRecommendation, 'strategy'> {
    // Try to find the smallest set of roles that covers all required actions
    // with minimal excess permissions
    let bestCombination: {
      roles: RoleDefinition[];
      covered: Set<string>;
      excess: Set<string>;
      score: number;
    } | null = null;

    // Try single roles first
    for (const role of this.roleDefinitions) {
      const { covered, excess } = this.calculateRoleCoverage(role, requiredDataActions);
      const score = this.scoreMinimalExcess(new Set(covered), new Set(excess), requiredDataActions);
      
      if (!bestCombination || score > bestCombination.score) {
        bestCombination = {
          roles: [role],
          covered: new Set(covered),
          excess: new Set(excess),
          score,
        };
      }
    }

    // Try pairs of roles
    for (let i = 0; i < this.roleDefinitions.length; i++) {
      for (let j = i + 1; j < this.roleDefinitions.length; j++) {
        const roles = [this.roleDefinitions[i], this.roleDefinitions[j]];
        const { covered, excess } = this.calculateCombinedCoverage(roles, requiredDataActions);
        const score = this.scoreMinimalExcess(new Set(covered), new Set(excess), requiredDataActions);
        
        if (score > (bestCombination?.score || 0)) {
          bestCombination = {
            roles,
            covered: new Set(covered),
            excess: new Set(excess),
            score,
          };
        }
      }
    }

    if (!bestCombination) {
      return this.createEmptyRecommendation(requiredDataActions);
    }

    return this.formatRecommendation(
      bestCombination.roles,
      Array.from(bestCombination.covered),
      Array.from(bestCombination.excess),
      requiredDataActions,
      'Minimizes excess permissions while covering all required actions'
    );
  }

  private findBalancedRoleSet(requiredDataActions: string[]): Omit<StrategyRecommendation, 'strategy'> {
    // Balance between coverage and excess permissions
    let bestCombination: {
      roles: RoleDefinition[];
      covered: Set<string>;
      excess: Set<string>;
      score: number;
    } | null = null;

    // Try single roles first
    for (const role of this.roleDefinitions) {
      const { covered, excess } = this.calculateRoleCoverage(role, requiredDataActions);
      const score = this.scoreBalanced(new Set(covered), new Set(excess), requiredDataActions);
      
      if (!bestCombination || score > bestCombination.score) {
        bestCombination = {
          roles: [role],
          covered: new Set(covered),
          excess: new Set(excess),
          score,
        };
      }
    }

    // Try pairs
    for (let i = 0; i < this.roleDefinitions.length; i++) {
      for (let j = i + 1; j < this.roleDefinitions.length; j++) {
        const roles = [this.roleDefinitions[i], this.roleDefinitions[j]];
        const { covered, excess } = this.calculateCombinedCoverage(roles, requiredDataActions);
        const score = this.scoreBalanced(new Set(covered), new Set(excess), requiredDataActions);
        
        if (score > (bestCombination?.score || 0)) {
          bestCombination = {
            roles,
            covered: new Set(covered),
            excess: new Set(excess),
            score,
          };
        }
      }
    }

    if (!bestCombination) {
      return this.createEmptyRecommendation(requiredDataActions);
    }

    return this.formatRecommendation(
      bestCombination.roles,
      Array.from(bestCombination.covered),
      Array.from(bestCombination.excess),
      requiredDataActions,
      'Balances coverage completeness with limiting excess permissions'
    );
  }

  private findMaxCoverageRoleSet(requiredDataActions: string[]): Omit<StrategyRecommendation, 'strategy'> {
    // Prioritize complete coverage, even if it means more excess permissions
    let bestCombination: {
      roles: RoleDefinition[];
      covered: Set<string>;
      excess: Set<string>;
      score: number;
    } | null = null;

    // Try single roles first
    for (const role of this.roleDefinitions) {
      const { covered, excess } = this.calculateRoleCoverage(role, requiredDataActions);
      const score = this.scoreMaxCoverage(new Set(covered), new Set(excess), requiredDataActions);
      
      if (!bestCombination || score > bestCombination.score) {
        bestCombination = {
          roles: [role],
          covered: new Set(covered),
          excess: new Set(excess),
          score,
        };
      }
    }

    // Try pairs
    for (let i = 0; i < this.roleDefinitions.length; i++) {
      for (let j = i + 1; j < this.roleDefinitions.length; j++) {
        const roles = [this.roleDefinitions[i], this.roleDefinitions[j]];
        const { covered, excess } = this.calculateCombinedCoverage(roles, requiredDataActions);
        const score = this.scoreMaxCoverage(new Set(covered), new Set(excess), requiredDataActions);
        
        if (score > (bestCombination?.score || 0)) {
          bestCombination = {
            roles,
            covered: new Set(covered),
            excess: new Set(excess),
            score,
          };
        }
      }
    }

    if (!bestCombination) {
      return this.createEmptyRecommendation(requiredDataActions);
    }

    return this.formatRecommendation(
      bestCombination.roles,
      Array.from(bestCombination.covered),
      Array.from(bestCombination.excess),
      requiredDataActions,
      'Maximizes permission coverage, accepting higher excess permissions if needed'
    );
  }

  private calculateRoleCoverage(
    role: RoleDefinition,
    requiredActions: string[]
  ): { covered: string[]; excess: string[] } {
    const roleActions = new Set<string>();
    
    role.properties.permissions.forEach(perm => {
      (perm.dataActions || []).forEach(action => {
        if (action.includes('*')) {
          // Handle wildcard
          const pattern = action.replace(/\*/g, '.*');
          const regex = new RegExp(`^${pattern}$`);
          requiredActions.forEach(req => {
            if (regex.test(req)) {
              roleActions.add(req);
            }
          });
        } else {
          roleActions.add(action);
        }
      });
    });

    const covered = requiredActions.filter(action => roleActions.has(action));
    const allRoleActions = new Set<string>();
    
    role.properties.permissions.forEach(perm => {
      (perm.dataActions || []).forEach(action => {
        allRoleActions.add(action);
      });
    });

    const excess = Array.from(allRoleActions).filter(
      action => !requiredActions.some(req => {
        if (action.includes('*')) {
          const pattern = action.replace(/\*/g, '.*');
          const regex = new RegExp(`^${pattern}$`);
          return regex.test(req);
        }
        return action === req;
      })
    );

    return { covered, excess };
  }

  private calculateCombinedCoverage(
    roles: RoleDefinition[],
    requiredActions: string[]
  ): { covered: string[]; excess: string[] } {
    const coveredSet = new Set<string>();
    const excessSet = new Set<string>();

    roles.forEach(role => {
      const { covered, excess } = this.calculateRoleCoverage(role, requiredActions);
      covered.forEach(a => coveredSet.add(a));
      excess.forEach(a => excessSet.add(a));
    });

    return {
      covered: Array.from(coveredSet),
      excess: Array.from(excessSet),
    };
  }

  private scoreMinimalExcess(
    covered: Set<string>,
    excess: Set<string>,
    required: string[]
  ): number {
    const coverageRatio = covered.size / required.length;
    const excessPenalty = excess.size / 100;
    
    // Heavily penalize incomplete coverage
    if (coverageRatio < 1.0) {
      return coverageRatio * 0.5 - excessPenalty;
    }
    
    // Reward full coverage with minimal excess
    return 10 + coverageRatio - excessPenalty * 2;
  }

  private scoreBalanced(
    covered: Set<string>,
    excess: Set<string>,
    required: string[]
  ): number {
    const coverageRatio = covered.size / required.length;
    const excessRatio = excess.size / (required.length || 1);
    
    return coverageRatio * 10 - excessRatio * 2;
  }

  private scoreMaxCoverage(
    covered: Set<string>,
    excess: Set<string>,
    required: string[]
  ): number {
    const coverageRatio = covered.size / required.length;
    const excessPenalty = excess.size / 200;
    
    // Heavily prioritize coverage
    return coverageRatio * 20 - excessPenalty;
  }

  private formatRecommendation(
    roles: RoleDefinition[],
    covered: string[],
    excess: string[],
    required: string[],
    reasoning: string
  ): Omit<StrategyRecommendation, 'strategy'> {
    const missing = required.filter(action => !covered.includes(action));
    const confidence = covered.length / required.length;

    const perRoleBreakdown: RoleCoverage[] = roles.map(role => {
      const { covered: roleCovered, excess: roleExcess } = this.calculateRoleCoverage(role, required);
      return {
        roleId: role.id,
        roleName: role.properties.roleName,
        covered: roleCovered,
        excess: roleExcess,
      };
    });

    return {
      roles: roles.map(r => r.properties.roleName),
      roleIds: roles.map(r => r.id),
      confidence,
      covered,
      missing,
      excess,
      reasoning,
      perRoleBreakdown,
    };
  }

  private createEmptyRecommendation(required: string[]): Omit<StrategyRecommendation, 'strategy'> {
    return {
      roles: [],
      roleIds: [],
      confidence: 0,
      covered: [],
      missing: required,
      excess: [],
      reasoning: 'No suitable roles found',
      perRoleBreakdown: [],
    };
  }
}
