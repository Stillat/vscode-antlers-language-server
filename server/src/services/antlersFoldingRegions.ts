import {
    FoldingRange,
    FoldingRangeParams,
} from "vscode-languageserver-protocol";
import { sessionDocuments } from '../languageService/documents';
import {
    multilineCommentToFoldingRange,
    nodePairToFoldingRange,
} from "../utils/conversions";

export function handleFoldingRequest(_foldingParams: FoldingRangeParams): FoldingRange[] {
    const docPath = decodeURIComponent(_foldingParams.textDocument.uri);

    if (sessionDocuments.hasDocument(docPath)) {
        const doc = sessionDocuments.getDocument(docPath),
            regions = doc.ranges.getAllPairedNodes(),
            multiLineComments = doc.nodes.getMultiLineComments(),
            multiLineNodes = doc.nodes.getMultilineNodes(),
            ranges: FoldingRange[] = [];

        if (regions.length > 0) {
            regions.forEach((node) => {
                if (node.startPosition?.line == node.isClosedBy?.startPosition?.line) {
                    return;
                }

                const convertedRegion = nodePairToFoldingRange(node);

                if (convertedRegion != null) {
                    ranges.push(convertedRegion);
                }
            });
        }

        if (multiLineComments.length > 0) {
            multiLineComments.forEach((comment) => {
                const convertedRegion = multilineCommentToFoldingRange(comment);

                if (convertedRegion != null) {
                    ranges.push(convertedRegion);
                }
            });
        }

        if (multiLineNodes.length > 0) {
            multiLineNodes.forEach((node) => {
                if (node.isClosedBy != null) {
                    return;
                }

                const convertedRegion = multilineCommentToFoldingRange(node);

                if (convertedRegion != null) {
                    ranges.push(convertedRegion);
                }
            });
        }

        return ranges;
    }

    return [];
}
