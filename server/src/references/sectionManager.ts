import { YieldContext } from "../antlers/tags/core/sections/yield.js";

class SectionManager {
    private knownSections: Map<string, Map<string, YieldContext>> = new Map();

    public static instance: SectionManager | null = null;

    registerDocumentSections(
        fileContext: string,
        contexts: YieldContext[]
    ) {
        if (!this.knownSections.has(fileContext)) {
            this.knownSections.set(fileContext, new Map());
        }

        const fileSections = this.knownSections.get(fileContext) as Map<
            string,
            YieldContext
        >;
        fileSections.clear();

        for (let i = 0; i < contexts.length; i++) {
            const contextRef = contexts[i];

            if (contextRef.node.hasMethodPart()) {
                fileSections.set(contextRef.node.getMethodNameValue(), contextRef);
            }
        }
    }

    getKnownSectionNames(): string[] {
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

if (typeof SectionManager.instance == 'undefined' || SectionManager.instance == null) {
    SectionManager.instance = new SectionManager();
}

export default SectionManager;
