import { YieldContext } from '../antlers/tags/core/sections/yield';

export class SectionManager {
	static knownSections: Map<string, Map<string, YieldContext>> = new Map();

	static registerDocumentSections(fileContext: string, contexts: YieldContext[]) {
		if (!this.knownSections.has(fileContext)) {
			this.knownSections.set(fileContext, new Map());
		}

		const fileSections = this.knownSections.get(fileContext) as Map<string, YieldContext>;
		fileSections.clear();

		for (let i = 0; i < contexts.length; i++) {
			const contextRef = contexts[i];

			if (contextRef.symbol.methodName != null) {
				fileSections.set(contextRef.symbol.methodName, contextRef);
			}
		}
	}

	static getKnownSectionNames(): string[] {
		const sectionNames: string[] = [];

		this.knownSections.forEach((mapping: Map<string, YieldContext>) => {
			mapping.forEach((val: YieldContext, name: string) => {
				if (sectionNames.includes(name) == false) {
					sectionNames.push(name);
				}
			});
		});

		return sectionNames;
	}

}
