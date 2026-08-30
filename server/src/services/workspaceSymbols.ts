import {
    CancellationToken,
    Range,
    SymbolInformation,
    SymbolKind,
    WorkspaceSymbolParams
} from "vscode-languageserver";
import ProjectManager, { ProjectManager as ProjectManagerType } from "../projects/projectManager.js";
import { IParsedBlueprint } from "../projects/structuredFieldTypes/types.js";
import { convertPathToUri } from "../utils/io.js";

const MAX_WORKSPACE_SYMBOLS = 250;
const startOfFile = Range.create(0, 0, 0, 0);

function matchesQuery(query: string, ...values: Array<string | undefined>): boolean {
    const terms = query
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length > 0);

    if (terms.length === 0) {
        return true;
    }

    const haystack = values
        .filter((value): value is string => value != null)
        .join(" ")
        .toLowerCase();

    return terms.every((term) => haystack.includes(term));
}

function blueprintContainerName(blueprint: IParsedBlueprint): string {
    const type = blueprint.type.trim();

    return type.length > 0 ? `Statamic ${type} blueprint` : "Statamic fieldset";
}

export function buildWorkspaceSymbols(
    params: WorkspaceSymbolParams,
    manager: ProjectManagerType | null = ProjectManager.instance,
    token?: CancellationToken
): SymbolInformation[] {
    if (manager == null || !manager.hasStructure()) {
        return [];
    }

    const symbols: SymbolInformation[] = [];
    const add = (symbol: SymbolInformation) => {
        if (symbols.length < MAX_WORKSPACE_SYMBOLS) {
            symbols.push(symbol);
        }
    };

    for (const view of manager.getStructure().getViews()) {
        if (token?.isCancellationRequested || symbols.length >= MAX_WORKSPACE_SYMBOLS) {
            return symbols;
        }

        const containerName = view.isPartial ? "Antlers partial" : "Statamic view";

        if (!matchesQuery(params.query, view.relativeDisplayName, view.templateName, containerName)) {
            continue;
        }

        add({
            name: view.relativeDisplayName,
            kind: view.isPartial ? SymbolKind.File : SymbolKind.Module,
            containerName,
            location: {
                uri: view.originalDocumentUri,
                range: startOfFile
            }
        });
    }

    for (const blueprint of manager.getAllStructuredBlueprints()) {
        if (token?.isCancellationRequested || symbols.length >= MAX_WORKSPACE_SYMBOLS) {
            return symbols;
        }

        if (blueprint.fileName == null || blueprint.fileName.trim().length === 0) {
            continue;
        }

        const uri = convertPathToUri(blueprint.fileName);
        const containerName = blueprintContainerName(blueprint);

        if (matchesQuery(params.query, blueprint.handle, blueprint.title, blueprint.collection, containerName)) {
            add({
                name: blueprint.handle,
                kind: SymbolKind.Struct,
                containerName,
                location: { uri, range: startOfFile }
            });
        }

        for (const field of blueprint.allFields) {
            if (token?.isCancellationRequested || symbols.length >= MAX_WORKSPACE_SYMBOLS) {
                return symbols;
            }

            if (!matchesQuery(params.query, field.handle, field.display, field.type, blueprint.handle)) {
                continue;
            }

            add({
                name: field.handle,
                kind: SymbolKind.Field,
                containerName: `${blueprint.handle} · ${field.type}`,
                location: { uri, range: startOfFile }
            });
        }
    }

    return symbols;
}
