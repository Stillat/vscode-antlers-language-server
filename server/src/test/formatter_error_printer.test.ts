import assert = require('assert');
import { AntlersDocument } from '../runtime/document/antlersDocument';
import { ErrorPrinter } from '../runtime/document/printers/errorPrinter';

suite('Error Printer', () => {
    test('it can pretty print errors', () => {
        const errorTemplate = `asdf
asdfasdfasdf

asdf

asdfasdfasdf
asdf
{{ if something }}
    asdf
    asdf`;

        const doc = AntlersDocument.fromText(errorTemplate),
            firstError = doc.errors.getFirstStructureError(),
            lines = doc.getLinesAround((firstError.node?.startPosition?.line ?? 1)),
            printed = ErrorPrinter.printError(firstError, lines).trim();

        assert.strictEqual(printed, `[ANTLR_008] Unclosed "if" control structure.

  05| 
  06| asdfasdfasdf
  07| asdf
 >08| {{ if something }}
  09|     asdf
  10|     asdf`);
    });
});