import { SessionVariableContext } from '../antlers/tags/core/contexts/sessionContext';

class SessionVariableManager {
    private knownVariables: Map<string, Map<string, SessionVariableContext>> =
        new Map();

    public static instance: SessionVariableManager | null = null;

    registerDocumentSessionVariables(
        fileContext: string,
        contexts: SessionVariableContext[]
    ) {
        if (!this.knownVariables.has(fileContext)) {
            this.knownVariables.set(fileContext, new Map());
        }

        const fileVars = this.knownVariables.get(fileContext) as Map<
            string,
            SessionVariableContext
        >;
        fileVars.clear();

        for (let i = 0; i < contexts.length; i++) {
            const node = contexts[i].node;

            if (node.hasParameters) {
                for (let j = 0; j < node.parameters.length; j++) {
                    const thisParam = node.parameters[j];

                    fileVars.set(thisParam.name, contexts[i]);
                }
            }
        }
    }

    getKnownSessionVariableNames(): string[] {
        const variableNames: string[] = [];

        this.knownVariables.forEach(
            (mapping: Map<string, SessionVariableContext>) => {
                mapping.forEach((val: SessionVariableContext, name: string) => {
                    if (variableNames.includes(name) == false) {
                        variableNames.push(name);
                    }
                });
            }
        );

        return variableNames;
    }
}

if (typeof SessionVariableManager.instance == 'undefined' || SessionVariableManager.instance == null) {
    SessionVariableManager.instance = new SessionVariableManager();
}

export default SessionVariableManager;
