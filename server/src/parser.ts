// File used to debug internals.

import { AntlersFormatter, AntlersFormattingOptions } from './formatting/antlersFormatter';
import { IHTMLFormatConfiguration } from './formatting/htmlCompat';
import { AntlersDocument } from './runtime/document/antlersDocument';
import { HtmlFragments } from './runtime/parser/htmlFragments';

const template = `{{ "hello{"@@{world@@}"}" }}`;


//template = `<div>{{ hello:there():chained() }}</div>`;

    const doc = AntlersDocument.fromText(template);

const htmlOptions:IHTMLFormatConfiguration = {
    wrapLineLength: 180
};
const antlersOptions:AntlersFormattingOptions = {
    htmlOptions: htmlOptions,
    tabSize: 4,
    insertSpaces: true,
    formatFrontMatter: true,
    maxStatementsPerLine: 3
};

const formatter = new AntlersFormatter(antlersOptions);

const results = formatter.formatDocument(doc);
console.log(results);
console.log('hi');
const asdf= 'asdf';