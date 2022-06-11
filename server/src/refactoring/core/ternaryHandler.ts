import { CodeAction, CodeActionKind, TextEdit } from 'vscode-languageserver';
import ConditionAnalyzer from '../../runtime/analyzers/conditionAnalyzer';
import { ConditionPairAnalyzer } from '../../runtime/analyzers/conditionPairAnalyzer';
import { TagPairAnalyzer } from '../../runtime/analyzers/tagPairAnalyzer';
import { ConditionNode } from '../../runtime/nodes/abstractNode';
import ConditionTernaryRefactor, { TernaryRefactorMode } from '../../runtime/refactoring/conditionTernaryRefactor';
import IRefactorHandler from '../refactorHandler';
import IRefactoringRequest from '../refactoringRequest';

class TernaryHandler implements IRefactorHandler {
    private condition: ConditionNode | null = null;
    private isNestedConditions = false;
    private refactorStyle:TernaryRefactorMode = TernaryRefactorMode.Ternary;

    getName(request: IRefactoringRequest): string {
        if (this.refactorStyle == TernaryRefactorMode.GateKeeper) {
            return 'Convert Condition to Gatekeeper operator';
        }

        return 'Convert Condition to Ternary';
    }
    canHandle(request: IRefactoringRequest): boolean {
        if (request.selectedDocument.hasUnclosedStructures() || request.selectedDocument.hasUnclosedStructures()) {
            return false;
        }

        if (request.selectedDocument.errors.hasAny()) {
            return false;
        }

        const allNodes = request.selectedDocument.getAllAntlersNodes();
        const tagPairer = new TagPairAnalyzer();

        let closingTagCount = 0;
        let conditionalStructures = 0;

        for (let i = 0; i < allNodes.length; i++) {
            if (allNodes[i].isClosingTag) {
                if (ConditionPairAnalyzer.isConditionalStructure(allNodes[i])) {
                    conditionalStructures += 1;
                    continue;
                }
                
                closingTagCount += 1;

                if (closingTagCount > 1) {
                    return false;
                }
            }
        }

        const pairedNodes = tagPairer.associate(allNodes, request.ownerDocument.getDocumentParser());

        if (pairedNodes.length == 1 && pairedNodes[0] instanceof ConditionNode) {
            this.condition = pairedNodes[0];
            this.isNestedConditions = false;

            if (conditionalStructures > 1) {
                const isFlat = ConditionAnalyzer.isFlatCondition(this.condition);

                if (! isFlat) {
                    this.isNestedConditions = false;
                    return false;
                }

                this.isNestedConditions = true;
            }

            return true;
        }

        return false;
    }

    refactor(request: IRefactoringRequest): CodeAction[] {
        if (this.condition == null) { return []; }
        const actions: CodeAction[] = [];

        let isInterpolation = false;

        if (request.params.currentNode != null) {
            if (request.params.currentNode.getTagName() != 'if') {
                isInterpolation = true;
            }
        }

        const ternaryRefactor = new ConditionTernaryRefactor({
            isInInterpolation: isInterpolation,
            refactorNested: this.isNestedConditions
        }),
            refactoredCode = ternaryRefactor.refactor(this.condition);

        this.refactorStyle = ternaryRefactor.getRefactorMode();

        const conditionEdit: TextEdit = {
            range: request.actionParams.range,
            newText: refactoredCode
        };

        actions.push({
            title: this.getName(request),
            kind: CodeActionKind.RefactorRewrite,
            edit: {
                changes: {
                    [request.documentUri]: [conditionEdit]
                }
            }
        });

        return actions;
    }

}

export default TernaryHandler;
