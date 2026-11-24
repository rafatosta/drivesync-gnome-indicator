# Contributing to DriveSync GNOME Indicator

Thank you for contributing. This project is an **experimental, mock-only GNOME Shell extension** until its interface has been validated.

## Before you start

1. Search existing issues and pull requests.
2. Open an issue for major behavior or API changes before implementing them.
3. Prefer small, focused pull requests that can be tested in a real GNOME Shell session.
4. Do not add direct database access or make the indicator depend on DriveSync engine internals.

## Local development

Follow the [installation steps](README.md#install-from-source-per-user).

After changing code, reinstall and reload it in a new GNOME session if required. Test all six scenarios with **Next scenario (simulation)** and verify that disabling the extension removes the icon and tooltip without errors.

Useful diagnostics:

```bash
gnome-shell --version
gnome-extensions info drivesync-indicator@rtosta.com
journalctl --user -b | grep -iE 'gnome-shell|drivesync-indicator'
```

## Code boundaries

- `extension.js`: presentation, lifecycle, GNOME Shell integration.
- `provider/mockProvider.js`: simulated data and notifications.
- Future real provider: same `getSnapshot()`, `subscribe(callback)`, and `dispose()` contract.

Do not open network connections or read DriveSync local data from the mock provider. Avoid polling when a signal or callback can be used.

## Pull requests

- Use English for commit messages and code comments.
- Describe motivation, scope, GNOME Shell version, Linux distribution, tests performed, and known limitations.
- Include screenshots for visual/layout changes where possible.
- Test installation, enabling, all states, disabling, and removal.
- Never include tokens, private file paths, email addresses or other user data in diagnostics.

## Release priorities

1. Correct operation and GNOME Extensions compatibility.
2. Validation of user-facing layout and accessibility.
3. Reproducible source and distro packages (RPM, DEB and Arch), incrementally.

The team will add CI and release packaging once each target is independently validated.
