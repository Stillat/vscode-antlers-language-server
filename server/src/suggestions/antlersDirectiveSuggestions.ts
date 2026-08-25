import {
    CompletionItem,
    CompletionItemKind,
    Position,
    TextEdit,
} from 'vscode-languageserver-protocol';

interface IDirective {
    description: string;
    name: string;
}

const directives: IDirective[] = [
    {
        name: 'props',
        description: 'Declares the properties accepted by an Antlers component. This directive requires arguments.',
    },
    {
        name: 'aware',
        description: 'Declares values inherited from a parent Antlers component. This directive requires arguments.',
    },
    {
        name: 'cascade',
        description: 'Makes values available to nested Antlers scopes. Arguments are optional.',
    },
];

function getLineAt(content: string, line: number): string | null {
    const lines = content.split(/\r?\n/);

    if (line < 0 || line >= lines.length) {
        return null;
    }

    return lines[line];
}

export function getAntlersDirectiveSuggestions(
    content: string,
    position: Position
): CompletionItem[] | null {
    const line = getLineAt(content, position.line);

    if (line == null || position.character < 0 || position.character > line.length) {
        return null;
    }

    const lineBeforeCaret = line.slice(0, position.character),
        match = lineBeforeCaret.match(/(^|[^a-zA-Z0-9_@])@([a-zA-Z_]*)$/);

    if (match == null) {
        return null;
    }

    const fragment = match[2] ?? '',
        normalizedFragment = fragment.toLowerCase(),
        replaceFrom = position.character - fragment.length - 1,
        range = {
            start: Position.create(position.line, replaceFrom),
            end: position,
        };

    return directives
        .filter((directive) => directive.name.startsWith(normalizedFragment))
        .map((directive): CompletionItem => ({
            label: `@${directive.name}`,
            kind: CompletionItemKind.Keyword,
            detail: 'Antlers directive',
            documentation: {
                kind: 'markdown',
                value: directive.description,
            },
            textEdit: TextEdit.replace(range, `@${directive.name}`),
        }));
}
