import assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { RuntimeBridge } from '../debug/runtimeBridge';

function removeDirectory(directory: string): void {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const entryPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            removeDirectory(entryPath);
        } else {
            fs.unlinkSync(entryPath);
        }
    }

    fs.rmdirSync(directory);
}

suite('Antlers Debug Runtime Bridge', () => {
    let temporaryRoot = '';

    setup(() => {
        temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'antlers-dap-'));
    });

    teardown(() => {
        if (temporaryRoot.length > 0 && fs.existsSync(temporaryRoot)) {
            removeDirectory(temporaryRoot);
        }
    });

    test('it owns and cleans up its session resources', async () => {
        const storageRoot = path.join(temporaryRoot, 'storage');
        const resourceRoot = path.join(temporaryRoot, 'resources');
        const templatePath = path.join(
            resourceRoot,
            'views',
            'example.antlers.html'
        );
        fs.mkdirSync(storageRoot, { recursive: true });

        const bridge = new RuntimeBridge(storageRoot + path.sep, resourceRoot);
        bridge.startSession();

        const keepAlivePath = path.join(
            storageRoot,
            'antlers',
            '_debug',
            'debug-session'
        );
        assert.strictEqual(fs.existsSync(keepAlivePath), true);
        assert.strictEqual(bridge.setBreakPoint(templatePath, 12).verified, true);

        await bridge.stopSession();

        assert.strictEqual(fs.existsSync(keepAlivePath), false);
    });

    test('it refuses to start outside a Statamic storage directory', () => {
        const bridge = new RuntimeBridge(
            path.join(temporaryRoot, 'missing-storage') + path.sep,
            path.join(temporaryRoot, 'resources')
        );

        assert.throws(
            () => bridge.startSession(),
            /storage directory was not found/
        );
    });
});
