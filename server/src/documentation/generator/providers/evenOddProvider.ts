import { IDocumentationSnippet } from '../types';

export class EvenOddProvider {
    static generate(handle: string):IDocumentationSnippet[] {
        const snippets:IDocumentationSnippet[] = [];

        snippets.push({
            overview: `Alternating between even and odd rows, starting at the second row`,
            snippet: `<ul>
    {{ ${handle} }}
    <li class="{ (count % 2 == 0) ? 'even' : 'odd' }">
        {{ value }}
    </li>
    {{ /${handle} }}
</ul>`
        });

        snippets.push({
            overview: `Alternating between even and odd rows, starting at the first row`,
            snippet: `<ul>
    {{ ${handle} }}
    <li class="{ (count % 2 == 0) ? 'odd' : 'even' }">
        {{ value }}
    </li>
    {{ /${handle} }}
</ul>`
        });

        return snippets;
    }
}