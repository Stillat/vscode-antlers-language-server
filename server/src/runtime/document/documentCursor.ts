import { AntlersDocument } from './antlersDocument';
import { PositionContext } from './contexts/positionContext';
import { NodeQueries } from './scanners/nodeQueries';
import { ContextResolver } from './contexts/contextResolver';
import { TagIdentifier } from '../nodes/tagIdentifier';
import { Scope } from '../../antlers/scope/scope';
import { AntlersNodeQueries } from './scanners/antlersNodeQueries';
import { AntlersNode, AbstractNode, StaticTracedAssignment } from '../nodes/abstractNode';

export class DocumentCursor {
    private doc: AntlersDocument;

    constructor(doc: AntlersDocument) {
        this.doc = doc;
    }

    getAncestorsAt(line: number, char: number): AntlersNode[] {
        const position = this.position(line, char);

        if (position == null) { return []; }

        return AntlersNodeQueries.findAncestorsBeforePosition(position, this.doc.getAllAntlersNodes());
    }

    getNameAt(line: number, char: number): TagIdentifier | null {
        const node = this.getNodeAt(line, char);

        if (node instanceof AntlersNode) {
            return node.name;
        }

        return null;
    }

    getScopeAt(line: number, char: number): Scope | null {
        const node = this.getNodeAt(line, char);

        if (node instanceof AntlersNode) {
            if (node.currentScope != null) {
                return node.currentScope;
            }
        }

        return null;
    }

    getFeaturesAt(line: number, char: number): PositionContext | null {
        const position = this.position(line, char),
            node = this.getNodeAt(line, char);

        return ContextResolver.resolveContext(position, node, this.doc, false, node);
    }

    getNodeAt(line: number, char: number): AbstractNode | null {
        return NodeQueries.findNodeAtPosition(this.position(line, char), this.doc.getDocumentParser().getNodes());
    }

    getNodeBefore(line: number, char: number): AbstractNode | null {
        return NodeQueries.findNodeBeforePosition(
            this.position(line, char),
            this.doc.getDocumentParser().getNodes()
        );
    }

    getNodeAfter(line: number, char: number): AbstractNode | null {
        return NodeQueries.findNodeAfterPosition(
            this.position(line, char),
            this.doc.getDocumentParser().getNodes()
        );
    }

    getNodesBefore(line: number, char: number): AbstractNode[] {
        return NodeQueries.findNodesBeforePosition(
            this.position(line, char),
            this.doc.getDocumentParser().getNodes()
        );
    }

    getAssignmentsBefore(line: number, char: number): StaticTracedAssignment[] {
        const assignments = this.doc.getDocumentParser().getLanguageParser().getRuntimeAssignments(),
            returnNodes: StaticTracedAssignment[] = [],
            pos = this.position(line, char);

        if (pos != null) {
            assignments.forEach((assignment) => {
                if (NodeQueries.isBefore(assignment.target, pos)) {
                    returnNodes.push(assignment);
                }
            });
        }

        return returnNodes;
    }

    getAssignmentsAfter(line: number, char: number): StaticTracedAssignment[] {
        const assignments = this.doc.getDocumentParser().getLanguageParser().getRuntimeAssignments(),
            returnNodes: StaticTracedAssignment[] = [],
            pos = this.position(line, char);

        if (pos != null) {
            assignments.forEach((assignment) => {
                if (NodeQueries.isAfter(assignment.target, pos)) {
                    returnNodes.push(assignment);
                }
            });
        }

        return returnNodes;
    }

    getNodesAfter(line: number, char: number): AbstractNode[] {
        return NodeQueries.findNodesAfterPosition(
            this.position(line, char),
            this.doc.getDocumentParser().getNodes()
        );
    }

    getIsWithinPairedNode(line: number, char: number) {
        const node = this.getNodeBefore(line, char);

        if (node == null) {
            return false;
        }

        return AntlersNodeQueries.isPairedNode(node);
    }

    position(line: number, char: number) {
        return this.doc.getDocumentParser().positionFromCursor(line, char);
    }

    charLeftAt(line: number, char: number) {
        return this.doc.getDocumentParser().charLeftAtCursor(line, char);
    }

    charAt(line: number, char: number) {
        return this.doc.getDocumentParser().charAtCursor(line, char);
    }

    charRightAt(line: number, char: number) {
        return this.doc.getDocumentParser().charRightAtCursor(line, char);
    }

    wordLeftAt(line: number, char: number, tabSize = 4) {
        return this.doc.getDocumentParser().wordLeftAtCursor(line, char, tabSize);
    }

    wordRightAt(line: number, char: number, tabSize = 4) {
        return this.doc.getDocumentParser().wordRightAtCursor(line, char, tabSize);
    }
    wordAt(line: number, char: number, tabSize = 4) {
        return this.doc.getDocumentParser().wordAtCursor(line, char, tabSize);
    }

    punctuationLeftAt(line: number, char: number, tabSize = 4) {
        return this.doc.getDocumentParser().punctuationLeftAtCursor(line, char, tabSize);
    }

    punctuationRightAt(line: number, char: number, tabSize = 4) {
        return this.doc.getDocumentParser().punctuationRightAtCursor(line, char, tabSize);
    }
}