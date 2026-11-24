import GLib from 'gi://GLib';

// Public read contract for the presenter. The real provider must preserve this shape.
export const STATES = Object.freeze({
    SYNCED: 'synced',
    UPLOADING: 'uploading',
    DOWNLOADING: 'downloading',
    SYNCING: 'syncing',
    PAUSED: 'paused',
    ERROR: 'error',
    DISCONNECTED: 'disconnected',
});

const EXAMPLES = [
    {state: STATES.SYNCED, message: 'All files are synchronized', account: 'Personal account', file: null, progress: null, conflicts: 0},
    {state: STATES.UPLOADING, message: 'Uploading file', account: 'Personal account', file: 'video.mp4', progress: 62, conflicts: 0},
    {state: STATES.DOWNLOADING, message: 'Downloading file', account: 'Personal account', file: 'document.pdf', progress: 38, conflicts: 0},
    {state: STATES.SYNCING, message: 'Checking for changes', account: 'Personal account', file: null, progress: null, conflicts: 0},
    {state: STATES.PAUSED, message: 'Synchronization paused', account: 'Personal account', file: null, progress: null, conflicts: 0},
    {state: STATES.ERROR, message: 'Synchronization error', account: 'Personal account', file: null, progress: null, conflicts: 2},
    {state: STATES.DISCONNECTED, message: 'Service disconnected', account: 'Personal account', file: null, progress: null, conflicts: 0},
];

export class MockProvider {
    constructor() {
        this._index = 0;
        this._listeners = new Set();
    }

    getSnapshot() {
        return {...EXAMPLES[this._index], timestamp: GLib.get_real_time()};
    }

    subscribe(callback) {
        this._listeners.add(callback);
        callback(this.getSnapshot());
        return () => this._listeners.delete(callback);
    }

    nextScenario() {
        this._index = (this._index + 1) % EXAMPLES.length;
        const snapshot = this.getSnapshot();
        for (const callback of this._listeners)
            callback(snapshot);
    }

    dispose() {
        this._listeners.clear();
    }
}