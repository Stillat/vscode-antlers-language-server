import { Position } from "vscode-languageserver-textdocument";
import { sessionDocuments } from '../languageService/documents';
import ProjectManager from '../projects/projectManager';
import { ISuggestionRequest } from '../suggestions/suggestionRequest';

export function makeProviderRequest(
    position: Position,
    documentUri: string
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
        activeStructure = ProjectManager.instance.getStructure(),
        scopeAncestors = document.cursor.getAncestorsAt(targetLine, targetChar);


    const suggestionRequest: ISuggestionRequest = {
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
        isPastTagPart: features?.isCursorInIdentifier == false,
    };

    return suggestionRequest;
}
