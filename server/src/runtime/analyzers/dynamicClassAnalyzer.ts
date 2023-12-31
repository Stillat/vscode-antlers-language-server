import { AntlersDocument } from '../document/antlersDocument.js';
import { AbstractNode, AntlersNode, ConditionNode, ExecutionBranch, FragmentPosition, LiteralNode, PathNode, VariableReference } from '../nodes/abstractNode.js';
import * as yaml from 'js-yaml';

export interface ClassSearchResults {
    node: AbstractNode,
    classNames: string[],
    patterns: string[],
    prefix: string,
    suffix: string
}

export class DynamicClassAnalyzer {
    private yamlData: any | null = null;

    private isInClassParmaeter(node: ConditionNode | AbstractNode): boolean {
        let analysisNode: AntlersNode | null = null;

        if (node instanceof ConditionNode && node.logicBranches.length > 0 && node.logicBranches[0].head != null) {
            analysisNode = node.logicBranches[0].head;
        } else if (node instanceof AntlersNode) {
            analysisNode = node;
        }

        if (analysisNode != null) {
            if (analysisNode.fragmentPosition == FragmentPosition.InsideFragmentParameter &&
                analysisNode.fragmentParameter != null && analysisNode.fragmentParameter.name.toLowerCase() == 'class') {
                return true;
            }
        }


        return false;
    }

    private getPrefix(node: AntlersNode): string {
        if (node.prev == null) { return ''; }
        if (node.prev instanceof LiteralNode == false) { return ''; }
        if (node.prev.content.trimRight().length != node.prev.content.length) { return ''; }

        const firstGroup = node.prev.content.split('"') as string[];

        if (firstGroup.length == 0) { return ''; }

        const secondGroup = firstGroup[firstGroup.length - 1].split(' ') as string[];

        if (secondGroup.length == 0) { return ''; }

        return secondGroup[secondGroup.length - 1].trim();
    }

    private getSuffix(node: AntlersNode): string {
        if (node.next == null) { return ''; }
        if (node.next instanceof LiteralNode == false) { return ''; }
        if (node.next.content.trimLeft().length != node.next.content.length) { return ''; }

        const firstGroup = node.next.content.split('"') as string[];

        if (firstGroup.length == 0) { return ''; }

        const secondGroup = firstGroup[0].split(' ') as string[];

        if (secondGroup.length == 0) { return ''; }

        return secondGroup[0].trim();
    }

    analyze(doc: AntlersDocument): ClassSearchResults[] {
        const nodes = doc.getDocumentParser().getRenderNodes();

        if (doc.hasFrontMatter()) {
            try {
                this.yamlData = yaml.load(doc.getFrontMatter());
            } catch (err) { }
        }

        return this.analyzeNodes(nodes);
    }

    private analyzeNodes(nodes: AbstractNode[]): ClassSearchResults[] {
        let results: ClassSearchResults[] = []

        nodes.forEach((node) => {
            let classNames: string[] = [],
                patternNames: string[] = [],
                classPrefix = '',
                classSuffix = '';

            if (this.isInClassParmaeter(node)) {
                const nestedClassParts: string[] = [];

                if (node instanceof ConditionNode) {
                    if (node.logicBranches.length == 0) { return; }
                    const firstBranch = node.logicBranches[0],
                        lastBranch = node.logicBranches[node.logicBranches.length - 1];
                    if (firstBranch.head == null || lastBranch.head == null) { return; }
                    if (lastBranch.head.isClosedBy == null) { return; }
                    const regionClose = lastBranch.head.isClosedBy as AntlersNode,
                        regionOpen = firstBranch.head as AntlersNode;
                    classPrefix = this.getPrefix(regionOpen);
                    classSuffix = this.getSuffix(regionClose);

                    node.logicBranches.forEach((branch) => {
                        if (branch.head == null) { return; }
                        if (branch.head.children.length != 2) { return; }
                        if (branch.head.children[0] instanceof LiteralNode == false) { return; }

                        const literalContent = branch.head.children[0].content;

                        if (literalContent.trim().length != literalContent.length) { return; }
                        if (!nestedClassParts.includes(literalContent)) {
                            nestedClassParts.push(literalContent);
                        }
                    });
                } else if (node instanceof AntlersNode) {
                    if (node.isPaired()) {
                        results = results.concat(this.analyzeNodes(node.getStructuralChildren()));
                        return;
                    }
                    classPrefix = this.getPrefix(node);
                    classSuffix = this.getSuffix(node);
                }

                // First check if we can extract any data from the view.
                if (this.yamlData != null && nestedClassParts.length == 0 && (classPrefix.length + classSuffix.length) > 0) {
                    const nParser = node.getParser();

                    if (typeof nParser !== 'undefined' && nParser !== null) {
                        const langParser = nParser.getLanguageParser();
                        
                        if (typeof langParser !== 'undefined' && langParser !== null) {
                            const variables = langParser.getCreatedVariables();

                            variables.forEach((createdVariable) => {
                                if (createdVariable.variableReference == null || createdVariable.variableReference.pathParts.length != 3) { return; }
                                if (createdVariable.variableReference.pathParts[0] instanceof PathNode == false) { return; }
                                if (createdVariable.variableReference.pathParts[1] instanceof PathNode == false) { return; }
                                if (createdVariable.variableReference.pathParts[2] instanceof VariableReference == false) { return; }

                                const firstPath = createdVariable.variableReference.pathParts[0] as PathNode,
                                    secondPath = createdVariable.variableReference.pathParts[1] as PathNode;

                                if (firstPath.name != 'view') { return; }

                                if (typeof this.yamlData[secondPath.name] === 'undefined') { return; }
                                const loadedData = this.yamlData[secondPath.name],
                                    tempValues: string[] = [],
                                    yamlKeys = Object.keys(loadedData);

                                let isValid = true;

                                for (let i = 0; i < yamlKeys.length; i++) {
                                    const tempValue = loadedData[yamlKeys[i]];

                                    if (typeof tempValue !== 'string') {
                                        isValid = false;
                                        break;
                                    }

                                    tempValues.push(tempValue as string);
                                }

                                if (isValid) {
                                    tempValues.forEach((value) => {
                                        if (!nestedClassParts.includes(value)) {
                                            nestedClassParts.push(value);
                                        }
                                    });
                                }
                            });
                        }
                    }
                }

                // Create a dynamic pattern.
                if (nestedClassParts.length == 0 && (classPrefix.length + classSuffix.length) > 0) {
                    let pattern = '/';

                    if (classPrefix.length > 0) {
                        pattern += classPrefix;
                    }

                    pattern += '(.*)';

                    if (classSuffix.length > 0) {
                        pattern += classSuffix;
                    }

                    pattern += '/';

                    patternNames.push(pattern);
                } else if (nestedClassParts.length > 0) {
                    nestedClassParts.forEach((classPart) => {
                        const constructedName = `${classPrefix}${classPart}${classSuffix}`;

                        classNames.push(constructedName);
                    });
                }
            } else if (node instanceof AntlersNode && node.isPaired()) {
                results = results.concat(this.analyzeNodes(node.getImmediateChildren()));
            }

            if ((classSuffix.length > 0 || classPrefix.length > 0) && (classNames.length > 0 || patternNames.length > 0)) {
                results.push({
                    classNames: classNames,
                    patterns: patternNames,
                    node: node,
                    suffix: classSuffix,
                    prefix: classPrefix
                });
            }
        });

        return results;
    }
}