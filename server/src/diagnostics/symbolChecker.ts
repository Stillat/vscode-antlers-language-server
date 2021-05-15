import { IReportableError, ISymbol } from '../antlers/types';
import { DiagnosticsManager } from './diagnosticsManager';

export function checkSymbolForIssues(symbol: ISymbol): IReportableError[] {
	let errors: IReportableError[] = [];

	for (let i = 0; i < DiagnosticsManager.handlers.length; i++) {
		errors = errors.concat(DiagnosticsManager.handlers[i].checkSymbol(symbol));
	}

	return errors;
}
