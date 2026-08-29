import assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { getDirectFiles, getFiles } from '../projects/fileSystemProvider/fileScanner.js';

function removeDirectory(directory: string) {
    fs.readdirSync(directory).forEach((entry) => {
        const entryPath = path.join(directory, entry),
            stat = fs.lstatSync(entryPath);

        if (stat.isDirectory() && !stat.isSymbolicLink()) {
            removeDirectory(entryPath);
        } else {
            fs.unlinkSync(entryPath);
        }
    });
    fs.rmdirSync(directory);
}

suite('Project File Scanner', () => {
    let tempDirectory = '';

    setup(() => {
        tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'antlers-scanner-'));
    });

    teardown(() => {
        removeDirectory(tempDirectory);
    });

    test('directory symlinks are skipped safely', () => {
        const viewsDirectory = path.join(tempDirectory, 'views'),
            linkedDirectory = path.join(tempDirectory, 'linked-views'),
            symlinkPath = path.join(viewsDirectory, 'linked.html');

        fs.mkdirSync(viewsDirectory);
        fs.mkdirSync(linkedDirectory);
        fs.writeFileSync(path.join(viewsDirectory, 'local.antlers.html'), 'local');
        fs.writeFileSync(path.join(linkedDirectory, 'linked.antlers.html'), 'linked');
        fs.symlinkSync(linkedDirectory, symlinkPath, process.platform == 'win32' ? 'junction' : 'dir');

        assert.deepStrictEqual(
            getFiles(viewsDirectory, '.html'),
            [path.join(viewsDirectory, 'local.antlers.html')]
        );
    });

    test('broken entries do not stop scanning', () => {
        const viewsDirectory = path.join(tempDirectory, 'views'),
            brokenPath = path.join(viewsDirectory, 'broken');

        fs.mkdirSync(viewsDirectory);
        fs.writeFileSync(path.join(viewsDirectory, 'local.antlers.html'), 'local');
        fs.symlinkSync(
            path.join(tempDirectory, 'missing'),
            brokenPath,
            process.platform == 'win32' ? 'junction' : 'dir'
        );

        assert.deepStrictEqual(
            getFiles(viewsDirectory, '.html'),
            [path.join(viewsDirectory, 'local.antlers.html')]
        );
    });

    test('direct scans respect the requested filter', () => {
        const linkedDirectory = path.join(tempDirectory, 'linked-files');

        fs.writeFileSync(path.join(tempDirectory, 'collection.yaml'), 'title: Collection');
        fs.writeFileSync(path.join(tempDirectory, 'notes.txt'), 'notes');
        fs.mkdirSync(path.join(tempDirectory, 'nested'));
        fs.writeFileSync(path.join(tempDirectory, 'nested', 'nested.yaml'), 'title: Nested');
        fs.mkdirSync(linkedDirectory);
        fs.symlinkSync(
            linkedDirectory,
            path.join(tempDirectory, 'linked.yaml'),
            process.platform == 'win32' ? 'junction' : 'dir'
        );

        assert.deepStrictEqual(
            getDirectFiles(tempDirectory, '.yaml'),
            [path.join(tempDirectory, 'collection.yaml')]
        );
    });
});
