import { SessionVariableContext } from '../antlers/tags/core/session';

export class SessionVariableManager {
	static knownVariables: Map<string, Map<string, SessionVariableContext>> = new Map();

	static registerDocumentSessionVariables(fileContext: string, contexts: SessionVariableContext[]) {
		if (!this.knownVariables.has(fileContext)) {
			this.knownVariables.set(fileContext, new Map());
		}

		const fileVars = this.knownVariables.get(fileContext) as Map<string, SessionVariableContext>;
		fileVars.clear();

		for (let i = 0; i < contexts.length; i++) {
			const symbol = contexts[i].symbol;

			if (symbol.parameterCache != null) {
				for (let j = 0; j < symbol.parameterCache.length; j++) {
					const thisParam = symbol.parameterCache[j];

					fileVars.set(thisParam.name, contexts[i]);
				}
			}
		}
	}

	static getKnownSessionVariableNames(): string[] {
		const variableNames: string[] = [];

		this.knownVariables.forEach((mapping: Map<string, SessionVariableContext>) => {
			mapping.forEach((val: SessionVariableContext, name: string) => {
				if (variableNames.includes(name) == false) {
					variableNames.push(name);
				}
			});
		});

		return variableNames;
	}

}
