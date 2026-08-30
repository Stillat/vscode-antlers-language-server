import {
    InlayHint,
    InlayHintKind,
    InlayHintParams
} from "vscode-languageserver";
import { sessionDocuments } from "../languageService/documents.js";
import ProjectManager, { ProjectManager as ProjectManagerType } from "../projects/projectManager.js";

const MAX_FIELD_TYPE_HINTS = 100;

function isInRequestedRange(
    line: number,
    character: number,
    params: InlayHintParams
): boolean {
    const { start, end } = params.range;

    if (line < start.line || line > end.line) {
        return false;
    }
    if (line === start.line && character < start.character) {
        return false;
    }
    if (line === end.line && character >= end.character) {
        return false;
    }

    return true;
}

export function buildFieldTypeInlayHints(
    params: InlayHintParams,
    enabled: boolean,
    manager: ProjectManagerType | null = ProjectManager.instance
): InlayHint[] {
    const documentPath = decodeURIComponent(params.textDocument.uri);

    if (
        !enabled ||
        manager == null ||
        !manager.hasStructure() ||
        !sessionDocuments.hasDocument(documentPath)
    ) {
        return [];
    }

    const project = manager.getStructure();
    const hints: InlayHint[] = [];

    for (const node of sessionDocuments.getDocument(documentPath).getAllAntlersNodes()) {
        if (hints.length >= MAX_FIELD_TYPE_HINTS) {
            break;
        }

        if (
            node.name == null ||
            node.nameStartsOn == null ||
            node.isComment ||
            node.isClosingTag ||
            node.isConditionNode ||
            node.isTagNode
        ) {
            continue;
        }

        const field = project.findAnyBlueprintField(node.name.compound);

        if (field == null || field.type.trim().length === 0) {
            continue;
        }

        const line = node.nameStartsOn.line - 1;
        const character = Math.max(
            0,
            node.nameStartsOn.char - 1 - node.rawStart.length
        ) + node.name.compound.length;

        if (!isInRequestedRange(line, character, params)) {
            continue;
        }

        hints.push({
            position: { line, character },
            label: ": " + field.type,
            kind: InlayHintKind.Type,
            paddingLeft: true,
            tooltip: field.displayName != null && field.displayName.trim().length > 0
                ? field.displayName + " (" + field.name + ")"
                : field.name
        });
    }

    return hints;
}
