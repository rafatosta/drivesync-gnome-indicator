import GObject from 'gi://GObject';
import St from 'gi://St';
import Gio from 'gi://Gio';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as QuickSettings from 'resource:///org/gnome/shell/ui/quickSettings.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import {MockProvider, STATES} from './provider/mockProvider.js';

const APP_ID = 'com.rtosta.DriveSync.desktop';
const ICONS = {
    [STATES.SYNCED]: 'emblem-ok-symbolic',
    [STATES.UPLOADING]: 'folder-upload-symbolic',
    [STATES.DOWNLOADING]: 'folder-download-symbolic',
    [STATES.SYNCING]: 'view-refresh-symbolic',
    [STATES.ERROR]: 'dialog-warning-symbolic',
    [STATES.DISCONNECTED]: 'network-offline-symbolic',
};

function openDriveSync() {
    const app = Gio.DesktopAppInfo.new(APP_ID);
    if (app) {
        app.launch([], null);
        return;
    }
    Main.notify('DriveSync', `Application not found: ${APP_ID}`);
}

const DriveSyncMenu = GObject.registerClass(
class DriveSyncMenu extends QuickSettings.QuickMenuToggle {
    _init(onNextScenario) {
        super._init({
            title: 'DriveSync',
            subtitle: 'Loading status…',
            iconName: ICONS[STATES.SYNCED],
            toggleMode: false,
        });
        this.menu.setHeader(ICONS[STATES.SYNCED], 'DriveSync', 'Synchronization status');

        this._stateItem = new PopupMenu.PopupMenuItem('Loading…', {reactive: false});
        this.menu.addMenuItem(this._stateItem);
        this._accountItem = new PopupMenu.PopupMenuItem('', {reactive: false});
        this.menu.addMenuItem(this._accountItem);
        this._fileItem = new PopupMenu.PopupMenuItem('', {reactive: false});
        this.menu.addMenuItem(this._fileItem);
        this._progressItem = new PopupMenu.PopupMenuItem('', {reactive: false});
        this.menu.addMenuItem(this._progressItem);
        this._conflictsItem = new PopupMenu.PopupMenuItem('', {reactive: false});
        this.menu.addMenuItem(this._conflictsItem);
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        this.menu.addAction('Open DriveSync', openDriveSync);
        this.menu.addAction('Next scenario (simulation)', onNextScenario);
    }

    render(snapshot) {
        const icon = ICONS[snapshot.state] ?? 'dialog-question-symbolic';
        this.iconName = icon;
        this.subtitle = snapshot.message;
        this.menu.setHeader(icon, 'DriveSync', snapshot.message);
        this._stateItem.label.text = snapshot.message;
        this._accountItem.label.text = `Account: ${snapshot.account}`;
        this._fileItem.visible = Boolean(snapshot.file);
        this._fileItem.label.text = snapshot.file ? `File: ${snapshot.file}` : '';
        this._progressItem.visible = snapshot.progress !== null;
        this._progressItem.label.text = snapshot.progress !== null ? `Progress: ${snapshot.progress}%` : '';
        this._conflictsItem.visible = snapshot.conflicts > 0;
        this._conflictsItem.label.text = `Conflicts: ${snapshot.conflicts}`;
    }
});

const DriveSyncIndicator = GObject.registerClass(
class DriveSyncIndicator extends QuickSettings.SystemIndicator {
    _init(provider) {
        super._init();
        this._statusIcon = this._addIndicator();
        this._statusIcon.icon_name = ICONS[STATES.SYNCED];
        this._statusIcon.accessible_name = 'DriveSync';
        this._menuItem = new DriveSyncMenu(() => provider.nextScenario());
        this.quickSettingsItems.push(this._menuItem);

        // The hover label is part of the mock UI, not a source of truth.
        this._tooltip = new St.Label({style_class: 'dash-label', visible: false});
        Main.uiGroup.add_child(this._tooltip);
        this._enterId = this._statusIcon.connect('enter-event', () => this._showTooltip());
        this._leaveId = this._statusIcon.connect('leave-event', () => this._tooltip.hide());
        this._unsubscribe = provider.subscribe(snapshot => this._render(snapshot));
    }

    _showTooltip() {
        const [x, y] = this._statusIcon.get_transformed_position();
        const [width, height] = this._statusIcon.get_transformed_size();
        this._tooltip.set_position(Math.max(0, Math.round(x + width / 2 - 100)), Math.round(y + height + 8));
        this._tooltip.show();
    }

    _render(snapshot) {
        this._statusIcon.icon_name = ICONS[snapshot.state] ?? 'dialog-question-symbolic';
        this._statusIcon.accessible_name = `DriveSync: ${snapshot.message}`;
        this._tooltip.text = `${snapshot.message}${snapshot.file ? ` — ${snapshot.file}` : ''}${snapshot.progress !== null ? ` (${snapshot.progress}%)` : ''}`;
        this._menuItem.render(snapshot);
    }

    destroy() {
        this._unsubscribe?.();
        this._statusIcon.disconnect(this._enterId);
        this._statusIcon.disconnect(this._leaveId);
        this._tooltip.destroy();
        this.quickSettingsItems.forEach(item => item.destroy());
        super.destroy();
    }
});

export default class DriveSyncExtension extends Extension {
    enable() {
        this._provider = new MockProvider();
        this._indicator = new DriveSyncIndicator(this._provider);
        Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator);
    }

    disable() {
        this._indicator?.destroy();
        this._indicator = null;
        this._provider?.dispose();
        this._provider = null;
    }
}