import { jwtDecode } from 'jwt-decode';
import {
  AzureSubscription,
  KeyVault,
  RoleDefinition,
  RoleAssignment,
  Identity,
} from '../types';

interface JwtPayload {
  name?: string;
  unique_name?: string;
  upn?: string;
  tid?: string;
  [key: string]: unknown;
}

const MANAGEMENT_API_BASE = 'https://management.azure.com';
const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0';

export class AzureApiService {
  private managementToken: string;
  private graphToken: string;

  constructor(managementToken: string, graphToken: string) {
    this.managementToken = managementToken;
    this.graphToken = graphToken;
  }

  validateTokens(): { isValid: boolean; userName?: string; tenantName?: string; error?: string } {
    try {
      const decoded = jwtDecode<JwtPayload>(this.managementToken);
      const userName = decoded.name || decoded.unique_name || decoded.upn || 'Unknown User';
      const tenantName = decoded.tid || 'Unknown Tenant';

      const exp = decoded.exp as number | undefined;
      if (exp && exp * 1000 < Date.now()) {
        return { isValid: false, error: 'Management token has expired' };
      }

      const graphDecoded = jwtDecode<JwtPayload>(this.graphToken);
      const graphExp = graphDecoded.exp as number | undefined;
      if (graphExp && graphExp * 1000 < Date.now()) {
        return { isValid: false, error: 'Graph token has expired' };
      }

      return { isValid: true, userName, tenantName };
    } catch (error) {
      return { isValid: false, error: `Invalid token format: ${error}` };
    }
  }

  async listSubscriptions(): Promise<AzureSubscription[]> {
    const url = `${MANAGEMENT_API_BASE}/subscriptions?api-version=2020-01-01`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.managementToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list subscriptions: ${response.statusText}`);
    }

    const data = await response.json();
    return data.value.map((sub: any) => ({
      subscriptionId: sub.subscriptionId,
      displayName: sub.displayName,
      tenantId: sub.tenantId,
    }));
  }

  async listKeyVaults(subscriptionId: string): Promise<KeyVault[]> {
    const url = `${MANAGEMENT_API_BASE}/subscriptions/${subscriptionId}/providers/Microsoft.KeyVault/vaults?api-version=2023-02-01`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.managementToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list key vaults: ${response.statusText}`);
    }

    const data = await response.json();
    return data.value;
  }

  async getKeyVault(vaultId: string): Promise<KeyVault> {
    const url = `${MANAGEMENT_API_BASE}${vaultId}?api-version=2023-02-01`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.managementToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get key vault: ${response.statusText}`);
    }

    return await response.json();
  }

  async listRoleDefinitions(scope: string): Promise<RoleDefinition[]> {
    const url = `${MANAGEMENT_API_BASE}${scope}/providers/Microsoft.Authorization/roleDefinitions?api-version=2022-04-01&$filter=type eq 'Microsoft.Authorization/roleDefinitions'`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.managementToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list role definitions: ${response.statusText}`);
    }

    const data = await response.json();
    return data.value;
  }

  async listRoleAssignments(scope: string): Promise<RoleAssignment[]> {
    const url = `${MANAGEMENT_API_BASE}${scope}/providers/Microsoft.Authorization/roleAssignments?api-version=2022-04-01&$filter=atScope()`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.managementToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list role assignments: ${response.statusText}`);
    }

    const data = await response.json();
    return data.value;
  }

  async resolveIdentity(objectId: string): Promise<Identity> {
    try {
      // Try to get as service principal first
      let url = `${GRAPH_API_BASE}/servicePrincipals/${objectId}`;
      let response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.graphToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          objectId,
          displayName: data.displayName,
          applicationId: data.appId,
          type: 'ServicePrincipal',
        };
      }

      // Try as user
      url = `${GRAPH_API_BASE}/users/${objectId}`;
      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.graphToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          objectId,
          displayName: data.displayName,
          type: 'User',
        };
      }

      // Try as group
      url = `${GRAPH_API_BASE}/groups/${objectId}`;
      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.graphToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          objectId,
          displayName: data.displayName,
          type: 'Group',
        };
      }

      // If all fail, return unknown
      return {
        objectId,
        displayName: `Unknown (${objectId.substring(0, 8)}...)`,
        type: 'Unknown',
      };
    } catch (error) {
      return {
        objectId,
        displayName: `Error resolving (${objectId.substring(0, 8)}...)`,
        type: 'Unknown',
      };
    }
  }

  async resolveIdentities(objectIds: string[]): Promise<Map<string, Identity>> {
    const identities = new Map<string, Identity>();
    
    // Resolve in parallel but limit concurrency
    const batchSize = 10;
    for (let i = 0; i < objectIds.length; i += batchSize) {
      const batch = objectIds.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(id => this.resolveIdentity(id))
      );
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          identities.set(result.value.objectId, result.value);
        } else {
          // Log warning for failed resolutions
          console.warn(`Failed to resolve identity ${batch[index]}:`, result.reason);
          // Add as Unknown identity
          identities.set(batch[index], {
            objectId: batch[index],
            type: 'Unknown',
          });
        }
      });
    }

    return identities;
  }
}
