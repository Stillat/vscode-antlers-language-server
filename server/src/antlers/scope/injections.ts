import { IProjectDetailsProvider } from '../../projects/projectDetailsProvider.js';
import { AntlersNode } from '../../runtime/nodes/abstractNode.js';
import { trimLeft } from "../../utils/strings.js";
import { Scope } from './scope.js';

class InjectionManager {
    private fileInjections: Map<string, Map<string, AntlersNode[]>> = new Map();
    private project: IProjectDetailsProvider | null = null;

    public static instance: InjectionManager | null = null;

    updateProject(project: IProjectDetailsProvider) {
        this.project = project;
    }

    registerInjections(fileName: string, nodes: AntlersNode[]) {
        if (nodes.length == 0) {
            return;
        }

        // Only register nodes that have items in the parameter cache.
        const newNodes: AntlersNode[] = [];

        for (let i = 0; i < nodes.length; i++) {
            const thisNode = nodes[i];

            if (thisNode.hasParameters) {
                newNodes.push(thisNode);
            }
        }

        if (newNodes.length > 0) {
            const partialName = newNodes[0].getMethodNameValue();

            if (partialName != null && this.project != null) {
                const projectPartial = this.project.findPartial(partialName);

                if (projectPartial != null) {
                    if (!this.fileInjections.has(projectPartial.documentUri)) {
                        this.fileInjections.set(projectPartial.documentUri, new Map());
                    }

                    const partialFiles = this.fileInjections.get(
                        projectPartial.documentUri
                    ) as Map<string, AntlersNode[]>;

                    partialFiles.set(fileName, newNodes);
                }
            }
        }
    }

    hasAvailableInjections(documentUri: string): boolean {
        return this.fileInjections.has(documentUri);
    }

    getScopeInjection(
        documentUri: string,
        project: IProjectDetailsProvider
    ): Scope {
        const newScope = new Scope(project);

        newScope.name = "*injection*";

        const injections = this.fileInjections.get(documentUri) as Map<
            string,
            AntlersNode[]
        >;

        injections.forEach((nodes: AntlersNode[], file: string) => {
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];

                if (node.hasParameters) {
                    for (let j = 0; j < node.parameters.length; j++) {
                        const thisParam = node.parameters[j];

                        if (thisParam.containsSimpleValue()) {
                            newScope.addVariable({
                                dataType: "string",
                                name: thisParam.name,
                                sourceField: null,
                                sourceName: "scope.injection",
                                introducedBy: node,
                            });
                        } else if (thisParam.isVariableReference) {
                            if (node.currentScope != null) {
                                if (node.currentScope.hasListInHistory(thisParam.value)) {
                                    const injectList = node.currentScope.findNestedScope(
                                        thisParam.value
                                    );

                                    if (injectList != null) {
                                        const adjustedName = trimLeft(thisParam.name, ":"),
                                            nestedInjection = injectList.copy();

                                        nestedInjection.name = adjustedName;
                                        newScope.addScopeList(adjustedName, injectList);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return newScope;
    }
}

if (typeof InjectionManager.instance == 'undefined' || InjectionManager.instance == null) {
    InjectionManager.instance = new InjectionManager();
}

export default InjectionManager;