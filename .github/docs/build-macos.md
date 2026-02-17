# macOS Universal App Build Workflow

This document describes the GitHub Actions workflow for building a macOS universal binary of the Azure Key Vault RBAC Migrator application.

## Overview

The workflow builds a universal macOS application that runs natively on both Intel (x86_64) and Apple Silicon (aarch64) Macs.

## Workflow Configuration

**File**: `.github/workflows/build-macos.yml`

**Name**: Build macOS Universal App

## Triggers

The workflow runs on:

1. **Push events** to:
   - `main` branch
   - `release/**` branches
   - Version tags (e.g., `v1.0.0`, `v1.2.3-beta`)

2. **Pull requests** targeting `main` branch

3. **Manual dispatch** via GitHub Actions UI

## Build Process

### 1. Environment Setup
- **Runner**: macOS latest (GitHub-hosted)
- **Node.js**: Version 20 with npm caching
- **Rust**: Stable toolchain with targets:
  - `aarch64-apple-darwin` (Apple Silicon)
  - `x86_64-apple-darwin` (Intel)

### 2. Build Steps

```yaml
1. Checkout repository
2. Setup Node.js (v20)
3. Install Rust with universal targets
4. Cache Rust dependencies
5. Install npm dependencies (npm ci)
6. Build frontend (npm run build)
7. Build Tauri universal binary
8. Upload DMG artifact
9. Upload App bundle artifact
```

### 3. Build Command

```bash
npm run tauri build -- --target universal-apple-darwin
```

This command:
- Builds the frontend React app
- Compiles Rust code for both architectures
- Creates a universal binary using `lipo`
- Bundles the app with all necessary resources
- Generates a DMG installer

## Artifacts

The workflow uploads two artifacts:

1. **azure-kv-rbac-migrator-macos-universal**
   - DMG installer file
   - Path: `src-tauri/target/universal-apple-darwin/release/bundle/dmg/*.dmg`

2. **azure-kv-rbac-migrator-macos-app**
   - App bundle
   - Path: `src-tauri/target/universal-apple-darwin/release/bundle/macos/*.app`

## Code Signing (Optional)

The workflow supports code signing via GitHub secrets:

- `TAURI_SIGNING_PRIVATE_KEY`: Your Apple Developer certificate
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`: Certificate password

To enable code signing:

1. Generate an Apple Developer certificate
2. Export the certificate as a `.p12` file
3. Base64 encode the certificate
4. Add the base64 string as `TAURI_SIGNING_PRIVATE_KEY` secret
5. Add the password as `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` secret

## Local Testing

To test the build locally on macOS:

```bash
# Install required Rust targets
rustup target add aarch64-apple-darwin x86_64-apple-darwin

# Install dependencies
npm ci

# Build frontend
npm run build

# Build universal binary
npm run tauri build -- --target universal-apple-darwin
```

The universal app will be created at:
```
src-tauri/target/universal-apple-darwin/release/bundle/macos/Azure Key Vault RBAC Migrator.app
```

To verify it's a universal binary:
```bash
lipo -archs "src-tauri/target/universal-apple-darwin/release/bundle/macos/Azure Key Vault RBAC Migrator.app/Contents/MacOS/azure-kv-rbac-migrator"
```

Expected output:
```
x86_64 arm64
```

## Caching

The workflow uses caching to speed up builds:

1. **npm cache**: Managed by `actions/setup-node@v4`
2. **Rust cache**: Managed by `Swatinem/rust-cache@v2`
   - Caches compiled dependencies
   - Workspace: `src-tauri`

## Troubleshooting

### Build fails with missing targets

Ensure Rust targets are properly installed:
```yaml
- name: Install Rust stable
  uses: dtolnay/rust-toolchain@stable
  with:
    targets: aarch64-apple-darwin,x86_64-apple-darwin
```

### DMG not created

Check that the Tauri configuration has DMG enabled:
```json
{
  "bundle": {
    "active": true,
    "targets": "all"
  }
}
```

### Code signing issues

- Verify the certificate is valid
- Check that secrets are properly configured
- Ensure the certificate includes the app's bundle identifier

## Performance

Typical build times on GitHub Actions:
- Frontend build: ~30-60 seconds
- Rust compilation (first run): ~10-15 minutes
- Rust compilation (cached): ~3-5 minutes
- Total (cached): ~5-8 minutes

## References

- [Tauri Documentation](https://tauri.app)
- [Tauri Building for macOS](https://tauri.app/v1/guides/building/macos)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Rust Cross Compilation](https://rust-lang.github.io/rustup/cross-compilation.html)
