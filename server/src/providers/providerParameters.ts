import { Position } from "vscode-languageserver-textdocument";
import { sessionDocuments } from '../languageService/documents.js';
import ProjectManager from '../projects/projectManager.js';
import { AntlersNode } from '../runtime/nodes/abstractNode.js';
import { ISuggestionRequest } from '../suggestions/suggestionRequest.js';
import * as antlr from '../runtime/nodes/position.js';

function getInterpolatedAncestors(node: AntlersNode, startPosition: antlr.Position): AntlersNode[] {
    let nodesToReturn: AntlersNode[] = [];

    if (node.processedInterpolationRegions.size > 0) {
        node.processedInterpolationRegions.forEach((region, regionName) => {
            for (let i = 0; i < region.length; i++) {
                const thisRegionNode = region[i];

                if (thisRegionNode instanceof AntlersNode && startPosition.isWithin(thisRegionNode.startPosition, thisRegionNode.endPosition)) {
                    if (thisRegionNode.currentScope == null) {
                        if (node.parent?.currentScope != null) {
                            thisRegionNode.currentScope = node.parent.currentScope;
                        } else {
                            thisRegionNode.currentScope = node.currentScope;
                        }
                    }
                    nodesToReturn.push(thisRegionNode);

                    if (thisRegionNode.processedInterpolationRegions.size > 0) {
                        nodesToReturn = nodesToReturn.concat(getInterpolatedAncestors(thisRegionNode, startPosition));
                    }

                    break;
                }
            }
        });
    }

    return nodesToReturn;
}

export function makeProviderRequest(
    position: Position,
    documentUri: string,
    showGeneralSnippetCompletions = true
): ISuggestionRequest | null {


    if (!sessionDocuments.hasDocument(documentUri)) {
        return null;
    }

    if (ProjectManager.instance == null) {
        return null;
    }

    if (ProjectManager.instance.hasStructure() == false) {
        return null;
    }

    const document = sessionDocuments.getDocument(documentUri),
        targetLine = position.line + 1,
        targetChar = position.character + 1,
        features = document.cursor.getFeaturesAt(targetLine, targetChar),
        targetPos = document.cursor.position(targetLine, targetChar),
        activeStructure = ProjectManager.instance.getStructure(),
        scopeAncestors = document.cursor.getAncestorsAt(targetLine, targetChar);

    if (targetPos != null && scopeAncestors.length > 0) {
        const lastScopeItem = scopeAncestors[scopeAncestors.length - 1];

        getInterpolatedAncestors(lastScopeItem, targetPos).forEach((antlersNode) => {
            scopeAncestors.push(antlersNode);
        });
    }

    let isPastTagPart = features?.isCursorInIdentifier == false;

    if (isPastTagPart == false && (features?.leftChar ?? '') == ' ') {
        isPastTagPart = true;
    }

    const suggestionRequest: ISuggestionRequest = {
        hasFrontMatter: document.hasFrontMatter(),
        antlersDocument: document,
        frontMatterEndsOn: document.getDocumentParser().getFrontMatterEndLine(),
        document: documentUri,
        leftMeaningfulWord: features?.leftWord ?? null,
        leftChar: features?.leftChar ?? '',
        leftWord: features?.leftWord?.trim() ?? '',
        originalLeftWord: features?.leftWord ?? '',
        rightWord: features?.rightWord ?? '',
        rightChar: features?.rightChar ?? '',
        context: features,
        position: position,
        project: activeStructure,
        nodesInScope: scopeAncestors,
        isInDoubleBraces: features?.node?.rawStart == '{{',
        isInVariableInterpolation: features?.interpolatedContext ?? false,
        interpolationStartsOn: null,
        currentNode: features?.node ?? null,
        isCaretInTag: features?.node != null,
        isPastTagPart: isPastTagPart,
        showGeneralSnippets: showGeneralSnippetCompletions
    };

    return suggestionRequest;
}
