import assert = require('assert');
import { TagPairAnalyzer } from '../runtime/analyzers/tagPairAnalyzer';
import { AntlersDocument } from '../runtime/document/antlersDocument';
import { ConditionNode } from '../runtime/nodes/abstractNode';
import ConditionTernaryRefactor from '../runtime/refactoring/conditionTernaryRefactor';

function refactor(template: string, isInterpolation = false, isNested = false) {
    const refactor = new ConditionTernaryRefactor({
        isInInterpolation: isInterpolation,
        refactorNested: isNested
    });

    const doc = AntlersDocument.fromText(template),
        pairer = new TagPairAnalyzer();

    const pairedNodes = pairer.associate(doc.getAllAntlersNodes(), doc.getDocumentParser()),
        condition = pairedNodes[0] as ConditionNode;

    return refactor.refactor(condition);
}

suite("Condition Refactor Test", () => {
    test('it can refactor to ternary', () => {
        const template = `{{ if this }}yes{{ else }}no{{ /if }}`;

        assert.strictEqual(refactor(template), "{{ (this) ? 'yes' : 'no' }}");
    });

    test('it can refactor to gate keeper operator', () => {
        assert.strictEqual(refactor('{{ if this }} yes {{ /if }}'), "{{ this ?= ' yes ' }}");
        assert.strictEqual(refactor('{{ if this }}yes{{ /if }}'), "{{ this ?= 'yes' }}");
    });

    test('it can refactor nested conditions', () => {
        const template = `{{ if this }}
{{ if another_thing == 'true' && 5 < 10 }}
    {{ if segment_1 == title }}Start {{ title }} End{{ /if }}
{{ /if }}
{{ /if }}`;
        assert.strictEqual(refactor(template, false, true), "{{ (this && (another_thing == 'true' && 5 < 10) && (segment_1 == title)) ?= 'Start { title } End' }}");
        assert.strictEqual(refactor(template, true, true), "{(this && (another_thing == 'true' && 5 < 10) && (segment_1 == title)) ?= 'Start { title } End'}");
    });

    test('it can refactor single quotes', () => {
        const template = "{{ if this }} start' {{ else }} 'end' {{ /if }}";
        assert.strictEqual(refactor(template), `{{ (this) ? ' start\\' ' : ' \\'end\\' ' }}`);
    });

    test('it can refactor unless', () => {
        let template = `{{ unless first }}branch-one{{ else }}branch-two{{ /unless }}`;
        assert.strictEqual(refactor(template), "{{ (!( first )) ? 'branch-one' : 'branch-two' }}");

        template = `{{ unless first && 5 < 10 }}{{ if no_results != true }}yes{{ /if }}{{ /if }}`;
        assert.strictEqual(refactor(template, false, true), `{{ ((!( first && 5 < 10 )) && (no_results != true)) ?= 'yes' }}`);
    });
});