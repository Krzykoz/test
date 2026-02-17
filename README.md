# Azure Key Vault RBAC Migrator

![Build macOS Universal App](https://github.com/Krzykoz/test/actions/workflows/build-macos.yml/badge.svg)

A desktop application built with Tauri and React that helps migrate Azure Key Vault access policies to RBAC (Role-Based Access Control).

## Features

- **Online Mode**: Connect to Azure with access tokens to automatically fetch subscriptions, vaults, and identities
- **Offline Mode**: Import JSON data for analysis without Azure connectivity
- **Smart Analysis**: Analyzes access policies and recommends appropriate RBAC roles
- **Multiple Strategies**: Choose from three recommendation strategies:
  - **Minimize Excess**: Minimal extra permissions
  - **Balanced**: Balance between coverage and excess
  - **Max Coverage**: Maximize permission coverage
- **Identity Resolution**: Automatically resolves user, group, and service principal identities
- **Export Options**: Export recommendations as CSV, JSON, or PowerShell scripts
- **Theme Support**: Light and dark mode
- **Migration Status**: Track fully migrated, partially migrated, and unmigrated identities

## Prerequisites

- Node.js 18+
- Rust 1.70+
- Linux: GTK 3, WebKit2GTK, libayatana-appindicator3
- macOS: Xcode Command Line Tools
- Windows: Microsoft Visual C++ Build Tools

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd azure-kv-rbac-migrator
```

2. Install dependencies:
```bash
npm install
```

3. Build the application:
```bash
npm run build
npm run tauri build
```

## Development

Run the application in development mode:
```bash
npm run tauri dev
```

## Building for Distribution

### macOS Universal Binary

The project includes a GitHub Actions workflow that automatically builds a universal macOS app (supporting both Intel and Apple Silicon):

**Automated Build**: The workflow runs on:
- Push to `main` or `release/**` branches
- Version tags (e.g., `v1.0.0`)
- Pull requests to `main`
- Manual trigger via GitHub Actions UI

**Build Artifacts**: The workflow produces:
- `.dmg` installer (universal binary)
- `.app` bundle (universal binary)

**Manual Build**:
```bash
# Install Rust targets for macOS universal binary
rustup target add aarch64-apple-darwin x86_64-apple-darwin

# Build frontend
npm run build

# Build universal binary
npm run tauri build -- --target universal-apple-darwin
```

The universal binary will be located at:
```
src-tauri/target/universal-apple-darwin/release/bundle/
```

## Usage

### Online Mode

1. **Get Access Tokens**: You'll need two tokens:
   - Azure Management API token (scope: `https://management.azure.com`)
   - Microsoft Graph API token (scope: `https://graph.microsoft.com`)
   
   Get tokens using Azure CLI:
   ```bash
   az account get-access-token --resource https://management.azure.com
   az account get-access-token --resource https://graph.microsoft.com
   ```

2. **Paste Tokens**: Enter both tokens in the login screen

3. **Select Vault**: Choose a subscription and key vault from the sidebar

4. **Analyze**: Review the analysis results and select your preferred strategy for each identity

5. **Export**: Export recommendations as PowerShell scripts, CSV, or JSON

### Offline Mode

1. Export vault data using Azure CLI or PowerShell:
```json
{
  "vault": {
    "id": "/subscriptions/{sub-id}/resourceGroups/{rg}/providers/Microsoft.KeyVault/vaults/{name}",
    "name": "my-keyvault",
    "location": "eastus",
    "sku": "Standard",
    "properties": {
      "accessPolicies": [...]
    }
  },
  "roleDefinitions": [...],
  "roleAssignments": [...],
  "identities": {
    "{object-id}": {
      "objectId": "{object-id}",
      "displayName": "User Name",
      "type": "User"
    }
  }
}
```

2. Paste the JSON data in offline mode

3. Analyze and export as in online mode

## Security

- **Tokens in memory only**: Access tokens are never persisted to disk
- **No external services**: All analysis is performed locally
- **Open source**: Full transparency of the codebase

## Built With

- **Tauri**: Cross-platform desktop application framework
- **React**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Recharts**: Data visualization
- **Lucide React**: Icon library

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
