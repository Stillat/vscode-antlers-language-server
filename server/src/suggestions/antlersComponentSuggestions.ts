import {
    CompletionItem,
    CompletionItemKind,
    Position,
    TextEdit,
} from 'vscode-languageserver-protocol';
import TagManager from '../antlers/tagManagerInstance.js';
import { IProjectDetailsProvider } from '../projects/projectDetailsProvider.js';

interface IComponentPrefix {
    fragment: string;
    isClosing: boolean;
    replaceFrom: number;
}

interface IComponentCandidate {
    documentation: string;
    label: string;
}

function getLineAt(content: string, line: number): string | null {
    const lines = content.split(/\r?\n/);

    if (line < 0 || line >= lines.length) {
        return null;
    }

    return lines[line];
}

function getComponentPrefix(content: string, position: Position): IComponentPrefix | null {
    const line = getLineAt(content, position.line);

    if (line == null || position.character < 0 || position.character > line.length) {
        return null;
    }

    const lineBeforeCaret = line.slice(0, position.character),
        match = lineBeforeCaret.match(/<(\/?)(?:(?:s|statamic)(?:-|:))([a-zA-Z0-9_:-]*)$/i);

    if (match == null) {
        return null;
    }

    const fragment = match[2] ?? '';

    return {
        fragment,
        isClosing: match[1] == '/',
        replaceFrom: position.character - fragment.length,
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

export function getAntlersComponentSuggestions(
    content: string,
    position: Position,
    project: IProjectDetailsProvider
): CompletionItem[] | null {
    const prefix = getComponentPrefix(content, position);

    if (prefix == null) {
        return null;
    }

    const candidates = new Map<string, IComponentCandidate>();

    TagManager.instance?.getVisibleTagsWithDocumentation().forEach((tag) => {
        candidates.set(tag.label, { label: tag.label, documentation: tag.documentation });
    });

    addDynamicCandidates(candidates, project);

    const normalizedFragment = prefix.fragment.toLowerCase(),
        range = {
            start: Position.create(position.line, prefix.replaceFrom),
            end: position,
        };

    return [...candidates.values()]
        .filter((candidate) => candidate.label.toLowerCase().startsWith(normalizedFragment))
        .filter((candidate) => prefix.isClosing == false || canCloseCandidate(candidate.label, project))
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
