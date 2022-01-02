import { DocumentParser } from '../../runtime/parser/documentParser';
import { PathParser } from '../../runtime/parser/pathParser';
import { toAntlers } from './assertions';

export function parseNodes(text: string) {
    const documentParser = new DocumentParser();
    documentParser.parse(text);

    return documentParser.getNodes();
}

export function parseRenderNodes(text: string) {
    const documentParser = new DocumentParser();
    documentParser.parse(text);

    return documentParser.getRenderNodes();
}

export function getParsedRuntimeNodes(text: string) {
    const documentParser = new DocumentParser();
    documentParser.parse(text);

    const nodes = documentParser.getNodes();

    return toAntlers(nodes[0]).parsedRuntimeNodes;
}

export function parsePath(path: string) {
    const pathParser = new PathParser();

    return pathParser.parse(path);
}