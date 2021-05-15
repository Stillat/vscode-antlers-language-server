import { IReportableError, ISymbol } from '../../antlers/types';
import { IDiagnosticsHandler } from '../diagnosticsManager';
import { symbolError } from '../utils';

const DoubleColonHandler: IDiagnosticsHandler = {
	checkSymbol(symbol: ISymbol) {
		const errors: IReportableError[] = [];

		if (symbol.runtimeName.includes('::')) {
			errors.push(symbolError(':: in tag part leads to ErrorException call_user_func() runtime exception.', symbol));
		}

		return errors;
	}
};

export default DoubleColonHandler;
