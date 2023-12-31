import { replaceAllInString } from '../../utils/strings.js';
import ConditionAnalyzer from '../analyzers/conditionAnalyzer.js';
import { AntlersNode, ConditionNode, LiteralNode } from '../nodes/abstractNode.js';

export enum TernaryRefactorMode {
    Ternary,
    GateKeeper
}

interface IConditionRefactoringRequest {
    isInInterpolation: boolean,
    refactorNested: boolean
}

export default class ConditionTernaryRefactor {
    private params: IConditionRefactoringRequest;
    private refactoredStyle:TernaryRefactorMode = TernaryRefactorMode.Ternary;

    constructor(params: IConditionRefactoringRequest) {
        this.params = params;
    }

    private isSimpleElse(node: ConditionNode): boolean {
        if (node.logicBranches.length == 2) {
            if (node.logicBranches[1].head?.getTagName() == 'else') {
                return true;
            }
        }

        return false;
    }

    getRefactorMode():TernaryRefactorMode {
        return this.refactoredStyle;
    }

    refactor(node: ConditionNode) {
        let baseText = '';

        if (this.params.refactorNested) {
            baseText = this.createdNestedGatekeeper(node);
            this.refactoredStyle = TernaryRefactorMode.GateKeeper;
        } else {
            if (node.logicBranches.length == 1) {
                baseText = this.createGatekeeper(node);
                this.refactoredStyle = TernaryRefactorMode.GateKeeper;
            } else if (this.isSimpleElse(node)) {
                baseText = this.createTernary(node);
                this.refactoredStyle = TernaryRefactorMode.Ternary;
            }
        }

        if (this.params.isInInterpolation) {
            return '{' + baseText + '}';
        }

        return '{{ ' + baseText + ' }}';
    }

    private createdNestedGatekeeper(condition:ConditionNode) {
        const unwrappedCondition = ConditionAnalyzer.unwrapFlattenedConditions(condition),
            conditionParts:string[] = [],
            bodyParts:string[] = [];

        unwrappedCondition.conditions.forEach((branch) => {
            let branchContent = branch.getContent().trim();

            if (branch.runtimeNodes.length > 1) {
                if (branchContent.startsWith('(') == false) {
                    branchContent = '(' + branchContent;
                }

                if (branchContent.endsWith(')') == false) {
                    branchContent = branchContent + ')';
                }

                if (this.shouldAddEndingParenthesis(branch)) {
                    branchContent += ')';
                }
            }

            conditionParts.push(branchContent);
        });

        unwrappedCondition.body.forEach((node) => {
            if (node instanceof AntlersNode) {
                bodyParts.push(node.getNodeDocumentText());
            } else if (node instanceof LiteralNode) {
                bodyParts.push(node.content);
            }
        });

        if (bodyParts.length > 0) {
            bodyParts[0] = bodyParts[0].trimLeft();
            bodyParts[bodyParts.length - 1] = bodyParts[bodyParts.length - 1].trimRight();
        }

        const conditionHead = conditionParts.join(' && '),
            bodyContent = bodyParts.join('');

        return '(' + conditionHead + ') ?= ' + this.convertToString(bodyContent);
    }

    private convertToString(text: string): string {
        let contentText = text;

        contentText = replaceAllInString(contentText, '{{', '{');
        contentText = replaceAllInString(contentText, '}}', '}');

        return '\'' + replaceAllInString(contentText, '\'', '\\\'') + '\'';
    }

    private createTernary(node: ConditionNode) {
        const head = node.logicBranches[0].head as AntlersNode,
            elseHead = node.logicBranches[1].head as AntlersNode,
            conditionContent = this.convertToString(head.getInnerDocumentText() ?? ''),
            elseContent = this.convertToString(elseHead.getInnerDocumentText()),
            headCondition = head.getContent().trim();

        let conditionOpen = headCondition;

        if (conditionOpen.startsWith('(') == false) {
            conditionOpen = '(' + conditionOpen;
        }

        if (conditionOpen.endsWith(')') == false) {
            conditionOpen = conditionOpen + ')';
        }

        if (this.shouldAddEndingParenthesis(head)) {
            conditionOpen += ')';
        }

        return conditionOpen + ' ? ' + conditionContent + ' : ' + elseContent;
    }

    private shouldAddEndingParenthesis(node: AntlersNode) {
        if (node.originalNode == null) { return false; }

        if (node.originalNode.getTagName() == 'unless') {
            return true;
        }

        return false;
    }

    private createGatekeeper(node: ConditionNode): string {
        const head = node.logicBranches[0].head as AntlersNode,
            innerText = head.getInnerDocumentText() ?? '',
            conditionContent = this.convertToString(innerText);

        let conditionOpen = '';

        if (head.runtimeNodes.length > 1) {
            conditionOpen = '(' + head.getContent().trim() + ')';
        } else {
            conditionOpen = head.getContent();
        }

        return conditionOpen.trim() + ' ?= ' + conditionContent;
    }
}