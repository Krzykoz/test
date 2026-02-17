// Mapping from legacy Access Policy permissions to RBAC data actions
export const PERMISSION_MAPPING: Record<string, string[]> = {
  // Keys
  'Key Get': ['Microsoft.KeyVault/vaults/keys/read'],
  'Key List': ['Microsoft.KeyVault/vaults/keys/readMetadata/action'],
  'Key Update': ['Microsoft.KeyVault/vaults/keys/update/action'],
  'Key Create': ['Microsoft.KeyVault/vaults/keys/create'],
  'Key Import': ['Microsoft.KeyVault/vaults/keys/import/action'],
  'Key Delete': ['Microsoft.KeyVault/vaults/keys/delete'],
  'Key Recover': ['Microsoft.KeyVault/vaults/keys/recover/action'],
  'Key Backup': ['Microsoft.KeyVault/vaults/keys/backup/action'],
  'Key Restore': ['Microsoft.KeyVault/vaults/keys/restore/action'],
  'Key Decrypt': ['Microsoft.KeyVault/vaults/keys/decrypt/action'],
  'Key Encrypt': ['Microsoft.KeyVault/vaults/keys/encrypt/action'],
  'Key Unwrap': ['Microsoft.KeyVault/vaults/keys/unwrapKey/action'],
  'Key Wrap': ['Microsoft.KeyVault/vaults/keys/wrapKey/action'],
  'Key Verify': ['Microsoft.KeyVault/vaults/keys/verify/action'],
  'Key Sign': ['Microsoft.KeyVault/vaults/keys/sign/action'],
  'Key Purge': ['Microsoft.KeyVault/vaults/keys/purge/action'],
  'Key Release': ['Microsoft.KeyVault/vaults/keys/release/action'],
  'Key Rotate': ['Microsoft.KeyVault/vaults/keys/rotate/action'],
  'Key GetRotationPolicy': ['Microsoft.KeyVault/vaults/keys/getrotationpolicy/action'],
  'Key SetRotationPolicy': ['Microsoft.KeyVault/vaults/keys/setrotationpolicy/action'],

  // Secrets
  'Secret Get': ['Microsoft.KeyVault/vaults/secrets/getSecret/action'],
  'Secret List': ['Microsoft.KeyVault/vaults/secrets/readMetadata/action'],
  'Secret Set': ['Microsoft.KeyVault/vaults/secrets/setSecret/action'],
  'Secret Delete': ['Microsoft.KeyVault/vaults/secrets/delete'],
  'Secret Recover': ['Microsoft.KeyVault/vaults/secrets/recover/action'],
  'Secret Backup': ['Microsoft.KeyVault/vaults/secrets/backup/action'],
  'Secret Restore': ['Microsoft.KeyVault/vaults/secrets/restore/action'],
  'Secret Purge': ['Microsoft.KeyVault/vaults/secrets/purge/action'],

  // Certificates
  'Certificate Get': ['Microsoft.KeyVault/vaults/certificates/read'],
  'Certificate List': ['Microsoft.KeyVault/vaults/certificates/readMetadata/action'],
  'Certificate Update': ['Microsoft.KeyVault/vaults/certificates/update/action'],
  'Certificate Create': ['Microsoft.KeyVault/vaults/certificates/create/action'],
  'Certificate Import': ['Microsoft.KeyVault/vaults/certificates/import/action'],
  'Certificate Delete': ['Microsoft.KeyVault/vaults/certificates/delete'],
  'Certificate Recover': ['Microsoft.KeyVault/vaults/certificates/recover/action'],
  'Certificate Backup': ['Microsoft.KeyVault/vaults/certificates/backup/action'],
  'Certificate Restore': ['Microsoft.KeyVault/vaults/certificates/restore/action'],
  'Certificate Purge': ['Microsoft.KeyVault/vaults/certificates/purge/action'],
  'Certificate ManageContacts': ['Microsoft.KeyVault/vaults/certificates/managecontacts/action'],
  'Certificate ManageIssuers': ['Microsoft.KeyVault/vaults/certificates/manageissuers/action'],
  'Certificate GetIssuers': ['Microsoft.KeyVault/vaults/certificates/getissuers/action'],
  'Certificate ListIssuers': ['Microsoft.KeyVault/vaults/certificates/listissuers/action'],
  'Certificate SetIssuers': ['Microsoft.KeyVault/vaults/certificates/setissuers/action'],
  'Certificate DeleteIssuers': ['Microsoft.KeyVault/vaults/certificates/deleteissuers/action'],

  // Storage
  'Storage Get': ['Microsoft.KeyVault/vaults/storage/read'],
  'Storage List': ['Microsoft.KeyVault/vaults/storage/readMetadata/action'],
  'Storage Set': ['Microsoft.KeyVault/vaults/storage/write'],
  'Storage Update': ['Microsoft.KeyVault/vaults/storage/update/action'],
  'Storage Delete': ['Microsoft.KeyVault/vaults/storage/delete'],
  'Storage Recover': ['Microsoft.KeyVault/vaults/storage/recover/action'],
  'Storage Backup': ['Microsoft.KeyVault/vaults/storage/backup/action'],
  'Storage Restore': ['Microsoft.KeyVault/vaults/storage/restore/action'],
  'Storage Purge': ['Microsoft.KeyVault/vaults/storage/purge/action'],
  'Storage RegenerateKey': ['Microsoft.KeyVault/vaults/storage/regeneratekey/action'],
  'Storage GetSAS': ['Microsoft.KeyVault/vaults/storage/getsas/action'],
  'Storage ListSAS': ['Microsoft.KeyVault/vaults/storage/listsas/action'],
  'Storage SetSAS': ['Microsoft.KeyVault/vaults/storage/setsas/action'],
  'Storage DeleteSAS': ['Microsoft.KeyVault/vaults/storage/deletesas/action'],
};

// Get all data actions for a category when "all" is specified
export const ALL_KEY_ACTIONS = [
  'Microsoft.KeyVault/vaults/keys/read',
  'Microsoft.KeyVault/vaults/keys/readMetadata/action',
  'Microsoft.KeyVault/vaults/keys/update/action',
  'Microsoft.KeyVault/vaults/keys/create',
  'Microsoft.KeyVault/vaults/keys/import/action',
  'Microsoft.KeyVault/vaults/keys/delete',
  'Microsoft.KeyVault/vaults/keys/recover/action',
  'Microsoft.KeyVault/vaults/keys/backup/action',
  'Microsoft.KeyVault/vaults/keys/restore/action',
  'Microsoft.KeyVault/vaults/keys/decrypt/action',
  'Microsoft.KeyVault/vaults/keys/encrypt/action',
  'Microsoft.KeyVault/vaults/keys/unwrapKey/action',
  'Microsoft.KeyVault/vaults/keys/wrapKey/action',
  'Microsoft.KeyVault/vaults/keys/verify/action',
  'Microsoft.KeyVault/vaults/keys/sign/action',
  'Microsoft.KeyVault/vaults/keys/purge/action',
  'Microsoft.KeyVault/vaults/keys/release/action',
  'Microsoft.KeyVault/vaults/keys/rotate/action',
  'Microsoft.KeyVault/vaults/keys/getrotationpolicy/action',
  'Microsoft.KeyVault/vaults/keys/setrotationpolicy/action',
];

export const ALL_SECRET_ACTIONS = [
  'Microsoft.KeyVault/vaults/secrets/getSecret/action',
  'Microsoft.KeyVault/vaults/secrets/readMetadata/action',
  'Microsoft.KeyVault/vaults/secrets/setSecret/action',
  'Microsoft.KeyVault/vaults/secrets/delete',
  'Microsoft.KeyVault/vaults/secrets/recover/action',
  'Microsoft.KeyVault/vaults/secrets/backup/action',
  'Microsoft.KeyVault/vaults/secrets/restore/action',
  'Microsoft.KeyVault/vaults/secrets/purge/action',
];

export const ALL_CERTIFICATE_ACTIONS = [
  'Microsoft.KeyVault/vaults/certificates/read',
  'Microsoft.KeyVault/vaults/certificates/readMetadata/action',
  'Microsoft.KeyVault/vaults/certificates/update/action',
  'Microsoft.KeyVault/vaults/certificates/create/action',
  'Microsoft.KeyVault/vaults/certificates/import/action',
  'Microsoft.KeyVault/vaults/certificates/delete',
  'Microsoft.KeyVault/vaults/certificates/recover/action',
  'Microsoft.KeyVault/vaults/certificates/backup/action',
  'Microsoft.KeyVault/vaults/certificates/restore/action',
  'Microsoft.KeyVault/vaults/certificates/purge/action',
  'Microsoft.KeyVault/vaults/certificates/managecontacts/action',
  'Microsoft.KeyVault/vaults/certificates/manageissuers/action',
  'Microsoft.KeyVault/vaults/certificates/getissuers/action',
  'Microsoft.KeyVault/vaults/certificates/listissuers/action',
  'Microsoft.KeyVault/vaults/certificates/setissuers/action',
  'Microsoft.KeyVault/vaults/certificates/deleteissuers/action',
];

export const ALL_STORAGE_ACTIONS = [
  'Microsoft.KeyVault/vaults/storage/read',
  'Microsoft.KeyVault/vaults/storage/readMetadata/action',
  'Microsoft.KeyVault/vaults/storage/write',
  'Microsoft.KeyVault/vaults/storage/update/action',
  'Microsoft.KeyVault/vaults/storage/delete',
  'Microsoft.KeyVault/vaults/storage/recover/action',
  'Microsoft.KeyVault/vaults/storage/backup/action',
  'Microsoft.KeyVault/vaults/storage/restore/action',
  'Microsoft.KeyVault/vaults/storage/purge/action',
  'Microsoft.KeyVault/vaults/storage/regeneratekey/action',
  'Microsoft.KeyVault/vaults/storage/getsas/action',
  'Microsoft.KeyVault/vaults/storage/listsas/action',
  'Microsoft.KeyVault/vaults/storage/setsas/action',
  'Microsoft.KeyVault/vaults/storage/deletesas/action',
];

// Helper function to convert access policy permissions to data actions
export function mapPermissionsToDataActions(permissions: {
  keys?: string[];
  secrets?: string[];
  certificates?: string[];
  storage?: string[];
}): string[] {
  const dataActions: string[] = [];

  // Process keys
  if (permissions.keys) {
    if (permissions.keys.includes('all') || permissions.keys.includes('*')) {
      dataActions.push(...ALL_KEY_ACTIONS);
    } else {
      permissions.keys.forEach(perm => {
        const key = `Key ${perm}`;
        if (PERMISSION_MAPPING[key]) {
          dataActions.push(...PERMISSION_MAPPING[key]);
        }
      });
    }
  }

  // Process secrets
  if (permissions.secrets) {
    if (permissions.secrets.includes('all') || permissions.secrets.includes('*')) {
      dataActions.push(...ALL_SECRET_ACTIONS);
    } else {
      permissions.secrets.forEach(perm => {
        const key = `Secret ${perm}`;
        if (PERMISSION_MAPPING[key]) {
          dataActions.push(...PERMISSION_MAPPING[key]);
        }
      });
    }
  }

  // Process certificates
  if (permissions.certificates) {
    if (permissions.certificates.includes('all') || permissions.certificates.includes('*')) {
      dataActions.push(...ALL_CERTIFICATE_ACTIONS);
    } else {
      permissions.certificates.forEach(perm => {
        const key = `Certificate ${perm}`;
        if (PERMISSION_MAPPING[key]) {
          dataActions.push(...PERMISSION_MAPPING[key]);
        }
      });
    }
  }

  // Process storage
  if (permissions.storage) {
    if (permissions.storage.includes('all') || permissions.storage.includes('*')) {
      dataActions.push(...ALL_STORAGE_ACTIONS);
    } else {
      permissions.storage.forEach(perm => {
        const key = `Storage ${perm}`;
        if (PERMISSION_MAPPING[key]) {
          dataActions.push(...PERMISSION_MAPPING[key]);
        }
      });
    }
  }

  // Remove duplicates
  return [...new Set(dataActions)];
}
