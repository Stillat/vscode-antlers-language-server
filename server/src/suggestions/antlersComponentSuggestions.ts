import {
    CompletionItem,
    CompletionItemKind,
    InsertReplaceEdit,
    Position,
    Range,
    TextEdit,
} from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import TagManager from '../antlers/tagManagerInstance.js';
import { Scope } from '../antlers/scope/scope.js';
import { IProjectDetailsProvider } from '../projects/projectDetailsProvider.js';
import { makeProviderRequestForDocument } from '../providers/providerParameters.js';
import { AntlersDocument } from '../runtime/document/antlersDocument.js';
import { ISuggestionRequest } from './suggestionRequest.js';
import { SuggestionManager } from './suggestionManager.js';

interface IComponentContext {
    bodyStart: number;
    fragment: string;
    isClosing: boolean;
    isName: boolean;
    replaceStart: number;
    tagEnd: number | null;
}

interface IComponentCandidate {
    documentation: string;
    label: string;
}

function isEscaped(content: string, offset: number): boolean {
    let slashCount = 0;

    for (let index = offset - 1; index >= 0 && content[index] == '\\'; index--) {
        slashCount++;
    }

    return slashCount % 2 == 1;
}

function findTagEnd(content: string, tagStart: number): number | null {
    let quote: string | null = null;

    for (let index = tagStart + 1; index < content.length; index++) {
        const char = content[index];

        if (quote != null) {
            if (char == quote && !isEscaped(content, index)) {
                quote = null;
            }

            continue;
        }

        if (char == '"' || char == "'") {
            quote = char;
        } else if (char == '>') {
            return index;
        }
    }

    return null;
}

function getComponentContext(
    content: string,
    position: Position,
    document: TextDocument
): IComponentContext | null {
    const caretOffset = document.offsetAt(position);

    const resolvedPosition = document.positionAt(caretOffset);

    if (caretOffset < 0 ||
        resolvedPosition.line != position.line ||
        resolvedPosition.character != position.character) {
        return null;
    }

    let quote: string | null = null,
        tagStart: number | null = null;

    for (let index = 0; index < caretOffset; index++) {
        const char = content[index];

        if (tagStart == null) {
            if (char == '<') {
                tagStart = index;
            }

            continue;
        }

        if (quote != null) {
            if (char == quote && !isEscaped(content, index)) {
                quote = null;
            }

            continue;
        }

        if (char == '"' || char == "'") {
            quote = char;
        } else if (char == '>') {
            tagStart = null;
        } else if (char == '<') {
            tagStart = index;
        }
    }

    if (tagStart == null) {
        return null;
    }

    const tagBeforeCaret = content.slice(tagStart, caretOffset),
        match = tagBeforeCaret.match(/^<(\/?)((?:s|statamic))([-:])([a-zA-Z0-9_:-]*)([\s\S]*)$/i);

    if (match == null || (match[5]?.length ?? 0) > 0 && !/^\s/.test(match[5] ?? '')) {
        return null;
    }

    const brand = match[2] ?? '',
        separator = match[3] ?? '',
        fragment = match[4] ?? '',
        isClosing = match[1] == '/',
        bodyStart = tagStart + 1 + (isClosing ? 1 : 0) + brand.length + separator.length;

    return {
        bodyStart,
        fragment,
        isClosing,
        isName: (match[5]?.length ?? 0) == 0,
        replaceStart: caretOffset - fragment.length,
        tagEnd: findTagEnd(content, tagStart),
    };
}

function addDynamicCandidates(
    candidates: Map<string, IComponentCandidate>,
    project: IProjectDetailsProvider
) {
    const addNames = (tag: string, names: string[]) => {
        names.forEach((name) => {
            const label = `${tag}:${name}`;

            candidates.set(label, { label, documentation: '' });
        });
    };

    addNames('collection', project.getUniqueCollectionNames());
    addNames('form', project.getUniqueFormNames());
    addNames('get_site', project.getSiteNames());
    addNames('nav', project.getUniqueNavigationMenuNames());
    addNames('structure', project.getUniqueNavigationMenuNames());
    addNames('partial', project.getUniquePartialNames());
    addNames('taxonomy', project.getUniqueTaxonomyNames());
    addNames('oauth', project.getOAuthProviders());

    project.getCustomAntlersTags().forEach((tag) => {
        candidates.set(tag.tagName, { label: tag.tagName, documentation: '' });
    });
}

function canCloseCandidate(label: string, project: IProjectDetailsProvider): boolean {
    const tag = TagManager.instance?.findTag(label) ?? project.getCustomAntlersTags().find((candidate) => (
        candidate.tagName == label || label.startsWith(`${candidate.tagName}:`)
    ));

    return tag?.requiresClose == true || tag?.allowsContentClose == true;
}

function getNameSuggestions(
    context: IComponentContext,
    document: TextDocument,
    project: IProjectDetailsProvider
): CompletionItem[] {
    const candidates = new Map<string, IComponentCandidate>();

    TagManager.instance?.getVisibleTagsWithDocumentation().forEach((tag) => {
        candidates.set(tag.label, { label: tag.label, documentation: tag.documentation });
    });

    addDynamicCandidates(candidates, project);

    const normalizedFragment = context.fragment.toLowerCase(),
        range = {
            start: document.positionAt(context.replaceStart),
            end: document.positionAt(context.replaceStart + context.fragment.length),
        };

    return [...candidates.values()]
        .filter((candidate) => candidate.label.toLowerCase().startsWith(normalizedFragment))
        .filter((candidate) => context.isClosing == false || canCloseCandidate(candidate.label, project))
        .sort((left, right) => left.label.localeCompare(right.label))
        .map((candidate): CompletionItem => ({
            label: candidate.label,
            kind: CompletionItemKind.Function,
            documentation: candidate.documentation.length > 0 ? {
                kind: 'markdown',
                value: candidate.documentation,
            } : undefined,
            textEdit: TextEdit.replace(range, candidate.label),
        }));
}

function getUnclosedQuote(content: string): string | null {
    let quote: string | null = null;

    for (let index = 0; index < content.length; index++) {
        const char = content[index];

        if (quote != null) {
            if (char == quote && !isEscaped(content, index)) {
                quote = null;
            }
        } else if (char == '"' || char == "'") {
            quote = char;
        }
    }

    return quote;
}

function mapRange(
    range: Range,
    syntheticDocument: TextDocument,
    sourceDocument: TextDocument,
    bodyStart: number
): Range {
    const mapPosition = (position: Position): Position => {
        const syntheticOffset = syntheticDocument.offsetAt(position),
            bodyOffset = Math.max(0, syntheticOffset - 3);

        return sourceDocument.positionAt(bodyStart + bodyOffset);
    };

    return {
        start: mapPosition(range.start),
        end: mapPosition(range.end),
    };
}

function mapCompletionItem(
    item: CompletionItem,
    syntheticDocument: TextDocument,
    sourceDocument: TextDocument,
    bodyStart: number
): CompletionItem {
    const mappedItem: CompletionItem = { ...item };

    if (item.textEdit != null) {
        if (TextEdit.is(item.textEdit)) {
            mappedItem.textEdit = {
                ...item.textEdit,
                range: mapRange(item.textEdit.range, syntheticDocument, sourceDocument, bodyStart),
            };
        } else {
            const edit = item.textEdit as InsertReplaceEdit;

            mappedItem.textEdit = {
                ...edit,
                insert: mapRange(edit.insert, syntheticDocument, sourceDocument, bodyStart),
                replace: mapRange(edit.replace, syntheticDocument, sourceDocument, bodyStart),
            };
        }
    }

    if (item.additionalTextEdits != null) {
        mappedItem.additionalTextEdits = item.additionalTextEdits.map((edit) => ({
            ...edit,
            range: mapRange(edit.range, syntheticDocument, sourceDocument, bodyStart),
        }));
    }

    return mappedItem;
}

function getAttributeSuggestions(
    content: string,
    position: Position,
    context: IComponentContext,
    sourceDocument: TextDocument,
    project: IProjectDetailsProvider,
    sourceRequest?: ISuggestionRequest
): CompletionItem[] {
    const caretOffset = sourceDocument.offsetAt(position),
        bodyEnd = context.tagEnd ?? caretOffset,
        caretInBody = caretOffset - context.bodyStart;
    let body = content.slice(context.bodyStart, bodyEnd);

    const selfClosingSlash = body.match(/\s+\/\s*$/);

    if (selfClosingSlash != null && selfClosingSlash.index != null && selfClosingSlash.index >= caretInBody) {
        body = body.slice(0, selfClosingSlash.index);
    }

    if (context.tagEnd == null) {
        const unclosedQuote = getUnclosedQuote(body);

        if (unclosedQuote != null) {
            body += unclosedQuote;
        }
    }

    const syntheticContent = `{{ ${body} }}\n`,
        syntheticDocument = TextDocument.create('inmemory://antlers-component', 'antlers', 1, syntheticContent),
        syntheticPosition = syntheticDocument.positionAt(3 + caretInBody),
        antlersDocument = AntlersDocument.fromText(syntheticContent),
        sourceNodes = sourceRequest?.nodesInScope ?? [];
    let sourceScope = sourceRequest?.currentNode?.currentScope ?? null;

    for (let index = sourceNodes.length - 1; index >= 0 && sourceScope == null; index--) {
        sourceScope = sourceNodes[index].currentScope;
    }

    const activeScope = sourceScope ?? new Scope(project);

    antlersDocument.documentUri = sourceRequest?.document ?? syntheticDocument.uri;
    antlersDocument.getAllAntlersNodes().forEach((node) => {
        node.currentScope = activeScope;
    });

    const syntheticRequest = makeProviderRequestForDocument(
        syntheticPosition,
        antlersDocument.documentUri,
        antlersDocument,
        project,
        sourceRequest?.showGeneralSnippets ?? true
    );

    if (syntheticRequest.context?.parameterContext == null) {
        const leftFragment = body.slice(0, caretInBody).match(/([a-zA-Z0-9_:-]+)$/)?.[1] ?? '';

        syntheticRequest.leftWord = leftFragment;
        syntheticRequest.originalLeftWord = leftFragment;
    }

    return SuggestionManager.getSuggestions(syntheticRequest).map((item) => (
        mapCompletionItem(item, syntheticDocument, sourceDocument, context.bodyStart)
    ));
}

export function getAntlersComponentSuggestions(
    content: string,
    position: Position,
    project: IProjectDetailsProvider,
    sourceRequest?: ISuggestionRequest
): CompletionItem[] | null {
    const sourceDocument = TextDocument.create(
            sourceRequest?.document ?? 'inmemory://antlers-component-source',
            'html',
            1,
            content
        ),
        context = getComponentContext(content, position, sourceDocument);

    if (context == null) {
        return null;
    }

    if (context.isName || context.isClosing) {
        return getNameSuggestions(context, sourceDocument, project);
    }

    return getAttributeSuggestions(
        content,
        position,
        context,
        sourceDocument,
        project,
        sourceRequest
    );
}
