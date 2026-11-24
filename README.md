# DriveSync GNOME Indicator

Experimental GNOME Shell extension that places a **DriveSync status icon alongside the native Quick Settings indicators**.

> **v0.1: mock-only prototype.** The extension does not connect to DriveSync, access files, synchronize data, or communicate with its engine. Its current purpose is to validate the GNOME UI.

## Features

- Native GNOME Quick Settings `SystemIndicator`.
- Six simulated states: synchronized, uploading, downloading, syncing, error, and disconnected.
- Status tooltip and Quick Settings details (account, file, progress percentage, conflicts).
- **Next scenario (simulation)** menu action to switch between sample states.
- **Open DriveSync** action using the desktop application ID `com.rtosta.DriveSync.desktop`.

## Requirements

- GNOME Shell 48, 49, or 50, as declared in `metadata.json` (**not yet runtime-verified**).
- The `gnome-extensions` CLI for the commands below.
- DriveSync installed only if you want to test **Open DriveSync**; otherwise the mock extension works independently.

## Install from source (per user)

```bash
git clone https://github.com/rafatosta/drivesync-gnome-indicator.git
cd drivesync-gnome-indicator
UUID=drivesync-indicator@rtosta.com
TARGET="$HOME/.local/share/gnome-shell/extensions/$UUID"
mkdir -p "$TARGET"
cp -r extension.js metadata.json provider "$TARGET/"
```

**First install:** Log out and log back in (especially on Wayland) to allow GNOME Shell to discover the new extension. Then enable it:

```bash
gnome-extensions enable drivesync-indicator@rtosta.com
gnome-extensions info drivesync-indicator@rtosta.com
```

You can also enable it using the GNOME **Extensions** app. The indicator should appear in the same system grouping as the built-in Quick Settings indicators.

## Test the mock UI

Open Quick Settings and select the **DriveSync** entry. Use **Next scenario (simulation)** to cycle through all six states. Check the icon, hover tooltip, status, file, progress and conflict count. The **Open DriveSync** action launches the installed desktop app when available.

## Update

From your local checkout, pull the latest version and reinstall its files:

```bash
git pull --ff-only
UUID=drivesync-indicator@rtosta.com
TARGET="$HOME/.local/share/gnome-shell/extensions/$UUID"
gnome-extensions disable "$UUID" || true
mkdir -p "$TARGET"
cp -r extension.js metadata.json provider "$TARGET/"
gnome-extensions enable "$UUID"
```

Log out/in if the Shell does not reload the updated code on your GNOME session.

## Disable or remove

**Disable only** (keeps files):

```bash
gnome-extensions disable drivesync-indicator@rtosta.com
```

**Remove** the user-local installation:

```bash
gnome-extensions disable drivesync-indicator@rtosta.com || true
rm -rf "$HOME/.local/share/gnome-shell/extensions/drivesync-indicator@rtosta.com"
```

Log out and back in if the icon persists. These commands **do not uninstall DriveSync** or change its data.

## Troubleshooting

```bash
gnome-shell --version
gnome-extensions list
gnome-extensions info drivesync-indicator@rtosta.com
journalctl --user -b | grep -iE 'gnome-shell|drivesync-indicator'
```

If the extension does not appear, confirm the exact UUID directory, the three installed paths (`extension.js`, `metadata.json`, `provider/mockProvider.js`), Shell version, and try a new login session.

## Architecture and adapter contract

`extension.js` renders the UI; `provider/mockProvider.js` supplies simulated read-only snapshots. The future D-Bus provider should implement:

```ts
type Snapshot = {
  state: 'synced' | 'uploading' | 'downloading' | 'syncing' | 'error' | 'disconnected';
  message: string;
  account: string;
  file: string | null;
  progress: number | null; // 0–100
  conflicts: number;
  timestamp: number;
};

interface Provider {
  getSnapshot(): Snapshot;
  subscribe(callback: (snapshot: Snapshot) => void): () => void;
  dispose(): void;
}
```

The extension must **not** read the DriveSync database or depend on the internal engine architecture. The presentation layer consumes a lightweight snapshot and change notifications.

## Development and release policy

The GNOME Extensions release ZIP is the primary distribution target. Debian, RPM and Arch packaging will be added and validated independently. Pull requests should validate the extension; pushes to `main` may create development artifacts; version tags will produce releases once CI workflows are ready. **No automated packaging or publishing pipeline is claimed in v0.1.**

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please report your GNOME Shell version, distribution, steps to reproduce, expected/actual behavior, and logs without credentials or private file paths. Keep changes small and verifiable.

## Current limitations

- GNOME Shell runtime tests are pending; compatibility with declared versions is not yet guaranteed.
- Mock states are manually cycled; upload/download progress is text-only.
- The hover tooltip and visuals need accessibility and layout testing.
- Icons use available symbolic icon names; custom DriveSync symbolic icons are pending.
- D-Bus/Flatpak integration, packaging and GNOME Extensions publication are **not implemented** yet.
