// Azure Resource Types
export interface AzureSubscription {
  subscriptionId: string;
  displayName: string;
  tenantId: string;
}

export interface KeyVault {
  id: string;
  name: string;
  location: string;
  sku: 'Standard' | 'Premium';
  properties: {
    accessPolicies?: AccessPolicy[];
    enableRbacAuthorization?: boolean;
  };
}

export interface AccessPolicy {
  tenantId: string;
  objectId: string;
  applicationId?: string;
  permissions: {
    keys?: string[];
    secrets?: string[];
    certificates?: string[];
    storage?: string[];
  };
}

export interface RoleDefinition {
  id: string;
  name: string;
  properties: {
    roleName: string;
    type: string;
    description: string;
    permissions: Array<{
      actions?: string[];
      notActions?: string[];
      dataActions?: string[];
      notDataActions?: string[];
    }>;
  };
}

export interface RoleAssignment {
  id: string;
  properties: {
    roleDefinitionId: string;
    principalId: string;
    scope: string;
  };
}

export interface Identity {
  objectId: string;
  displayName?: string;
  applicationId?: string;
  type: 'User' | 'Group' | 'ServicePrincipal' | 'Application' | 'Compound' | 'Unknown';
}

// Analysis Types
export interface RequiredPermission {
  category: 'keys' | 'secrets' | 'certificates' | 'storage';
  legacyPermission: string;
  dataAction: string;
}

export interface RoleCoverage {
  roleId: string;
  roleName: string;
  covered: string[];
  excess: string[];
}

export interface StrategyRecommendation {
  strategy: 'Minimize Excess' | 'Balanced' | 'Max Coverage';
  roles: string[];
  roleIds: string[];
  confidence: number;
  covered: string[];
  missing: string[];
  excess: string[];
  reasoning: string;
  perRoleBreakdown: RoleCoverage[];
}

export interface IdentityAnalysis {
  identity: Identity;
  originalPermissions: AccessPolicy['permissions'];
  requiredDataActions: string[];
  recommendations: StrategyRecommendation[];
  existingRoles?: RoleAssignment[];
  existingCoverage?: {
    covered: string[];
    missing: string[];
    isFull: boolean;
    isPartial: boolean;
  };
}

export interface AnalysisResult {
  vaultName: string;
  vaultId: string;
  identityAnalyses: IdentityAnalysis[];
  roleDefinitions: RoleDefinition[];
  timestamp: string;
}

// App State Types
export interface AppState {
  mode: 'online' | 'offline';
  managementToken?: string;
  graphToken?: string;
  currentUser?: {
    name: string;
    tenantName: string;
  };
  selectedSubscription?: AzureSubscription;
  selectedVault?: KeyVault;
  vaults: KeyVault[];
  subscriptions: AzureSubscription[];
  analysisResult?: AnalysisResult;
  theme: 'light' | 'dark';
  includeCustomRoles: boolean;
}

// Export Types
export interface ExportSelection {
  [identityObjectId: string]: {
    selected: boolean;
    selectedStrategy: string;
  };
}
