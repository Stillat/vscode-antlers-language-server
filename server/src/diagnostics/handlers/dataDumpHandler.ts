import { getModifier } from '../../antlers/modifierFetcher';
import { IReportableError, ISymbol } from '../../antlers/types';
import { IDiagnosticsHandler } from '../diagnosticsManager';
import { symbolWarning } from '../utils';

const DataDumpTags: string[] = [
	'dump', 'dd', 'ddd'
];

const DataDumpHandler: IDiagnosticsHandler = {
	checkSymbol(symbol: ISymbol) {
		const errors: IReportableError[] = [];

		if (DataDumpTags.includes(symbol.name)) {
			errors.push(symbolWarning(symbol.name + ' exposes data and should be removed after debugging.', symbol));
		}

		const dumpModifier = getModifier(symbol, 'dump');

		if (dumpModifier != null) {
			errors.push(symbolWarning('dump modifier exposes data and should be removed after debugging.', symbol));
		}

		return errors;
	}
};

export default DataDumpHandler;
