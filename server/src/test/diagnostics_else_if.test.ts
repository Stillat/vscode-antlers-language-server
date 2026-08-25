import assert from 'assert';
import { AntlersSettings } from '../antlersSettings.js';
import CoreHandlers from '../diagnostics/handlers/coreHandlers.js';
import ElseIfSyntaxHandler from '../diagnostics/handlers/elseIfSyntaxHandler.js';
import { AntlersDocument } from '../runtime/document/antlersDocument.js';
import { ErrorLevel } from '../runtime/errors/antlersError.js';
import { AntlersErrorCodes } from '../runtime/errors/antlersErrorCodes.js';

const settings: AntlersSettings = {
    formatFrontMatter: false,
    showGeneralSnippetCompletions: true,
    diagnostics: {
        warnOnDynamicCssClassNames: true,
        validateTagParameters: true,
        reportDiagnostics: true
    },
    trace: { server: 'off' },
    formatterIgnoreExtensions: [],
    languageVersion: 'runtime'
};

function getBranchNode(template: string, runtimeName: string) {
    return AntlersDocument.fromText(template)
        .getAllAntlersNodes()
        .find((node) => node.runtimeName() == runtimeName);
}

suite('Else If Diagnostics', () => {
    test('the handler is registered', () => {
        assert.strictEqual(CoreHandlers.includes(ElseIfSyntaxHandler), true);
    });

    test('else if is reported as invalid syntax', () => {
        const node = getBranchNode(
            '{{ if test }}\n{{ else if not_test }}\n{{ /if }}',
            'else'
        );

        assert.notStrictEqual(node, undefined);

        const errors = ElseIfSyntaxHandler.checkNode(node!, settings);

        assert.strictEqual(errors.length, 1);
        assert.strictEqual(errors[0].errorCode, AntlersErrorCodes.LINT_ELSE_IF_SYNTAX);
        assert.strictEqual(errors[0].message, 'Use `elseif` instead of `else if`.');
        assert.strictEqual(errors[0].level, ErrorLevel.Error);
        assert.strictEqual(errors[0].node, node);
    });

    test('whitespace variations are reported', () => {
        for (const branch of ['else\tif not_test', 'else\nif not_test']) {
            const node = getBranchNode(
                `{{ if test }}\n{{ ${branch} }}\n{{ /if }}`,
                'else'
            );

            assert.notStrictEqual(node, undefined);
            assert.strictEqual(ElseIfSyntaxHandler.checkNode(node!, settings).length, 1);
        }
    });

    test('valid branches and similar names are not reported', () => {
        const templates = [
            ['{{ if test }}\n{{ elseif not_test }}\n{{ /if }}', 'elseif'],
            ['{{ if test }}\n{{ else }}\n{{ /if }}', 'else'],
            ['{{ if test }}\n{{ else iffy }}\n{{ /if }}', 'else'],
            ['{{ if test }}\n{{ else:index }}\n{{ /if }}', 'else:index']
        ];

        for (const [template, runtimeName] of templates) {
            const node = getBranchNode(template, runtimeName);

            assert.notStrictEqual(node, undefined);
            assert.deepStrictEqual(ElseIfSyntaxHandler.checkNode(node!, settings), []);
        }
    });
});
