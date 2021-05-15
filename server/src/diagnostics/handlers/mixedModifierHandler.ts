import { IReportableError, ISymbol } from '../../antlers/types';
import { IDiagnosticsHandler } from '../diagnosticsManager';
import { symbolError } from '../utils';

const MixedModifierHandler: IDiagnosticsHandler = {
	checkSymbol(symbol: ISymbol) {
		const errors: IReportableError[] = [];

		if (symbol.modifiers != null) {
			if (symbol.modifiers.hasMixedStyles) {
				errors.push(symbolError('Mixed modifier styles is not supported', symbol));
			}
		}

		return errors;
	}
};

export default MixedModifierHandler;
