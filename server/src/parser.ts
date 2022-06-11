// File used to debug internals.

import { AntlersFormatter, AntlersFormattingOptions } from './formatting/antlersFormatter';
import { AntlersDocument } from './runtime/document/antlersDocument';
import ConditionTernaryRefactor from './runtime/refactoring/conditionTernaryRefactor';

const antlersOptionsDefault: AntlersFormattingOptions = {
    htmlOptions: {},
    tabSize: 4,
    insertSpaces: true,
    formatFrontMatter: true,
    maxStatementsPerLine: 3,
    formatExtensions: []
};
const input = `
{{ if true }}Hello, world {{ /if }}
`;

const doc = AntlersDocument.fromText(input);
const nodes =doc.getAllAntlersNodes();
const condition = nodes[0];

console.log(nodes);
const what = 'isit?!';