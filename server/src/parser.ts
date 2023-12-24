// Internal file to test the parser.

import { formatAntlers } from './test/testUtils/formatAntlers';

const input = `{{ $report->id() }}`

console.log(formatAntlers(input));

debugger;