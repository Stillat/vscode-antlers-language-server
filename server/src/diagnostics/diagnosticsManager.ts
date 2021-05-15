import { IReportableError, ISymbol } from '../antlers/types';
import CoreHandlers from './handlers/coreHandlers';

export interface IDiagnosticsHandler {
	/**
	 * Checks a symbol for any issues.
	 * 
	 * @param {ISymbol} symbol The symbol being analyzed.
	 */
	checkSymbol(symbol: ISymbol): IReportableError[]
}

export class DiagnosticsManager {
	static fileDiagnostics: Map<string, IReportableError[]> = new Map();
	static handlers: IDiagnosticsHandler[] = [];

	static registerHandler(handler: IDiagnosticsHandler) {
		this.handlers.push(handler);
	}

	static registerHandlers(handlers: IDiagnosticsHandler[]) {
		for (let i = 0; i < handlers.length; i++) {
			this.registerHandler(handlers[i]);
		}
	}

	static registerCoreHandlers() {
		this.registerHandlers(CoreHandlers);
	}

	static hasDiagnosticsIssues(documentUri: string): boolean {
		if (this.fileDiagnostics.has(documentUri) == false) {
			return false;
		}

		const docIssues = this.fileDiagnostics.get(documentUri) as IReportableError[];

		return docIssues.length > 0;
	}

	static registerDiagnostics(documentUri: string, issues: IReportableError[]) {
		this.fileDiagnostics.set(documentUri, issues);
	}

	static clearIssues(documentUri: string) {
		this.fileDiagnostics.set(documentUri, []);
	}

	static getDiagnostics(documentUri: string): IReportableError[] {
		if (this.hasDiagnosticsIssues(documentUri)) {
			return this.fileDiagnostics.get(documentUri) as IReportableError[];
		}

		return [];
	}

	static getAllDiagnostics(): IReportableError[] {
		const allErrors: IReportableError[] = [];

		this.fileDiagnostics.forEach((value: IReportableError[], key: string) => {
			for (let i = 0; i < value.length; i++) {
				allErrors.push(value[i]);
			}
		});

		return allErrors;
	}

}
