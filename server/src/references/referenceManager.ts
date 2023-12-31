import { AntlersNode } from "../runtime/nodes/abstractNode.js";

class ReferenceManager {
    private partialReferences: Map<string, AntlersNode[]> = new Map();
    private cacheReferences: Map<string, AntlersNode[]> = new Map();
    private removesPageScope: Map<string, AntlersNode> = new Map();

    public static instance: ReferenceManager | null = null;

    clearAllReferences(documentUri: string) {
        this.clearPartialReferences(documentUri);
        this.clearCacheReferences(documentUri);
    }

    registerPartialReferences(documentUri: string, nodes: AntlersNode[]) {
        if (this.partialReferences.has(documentUri) == false) {
            this.partialReferences.set(documentUri, []);
        }

        this.partialReferences.set(documentUri, nodes);
    }

    registerCacheReferences(documentUri: string, nodes: AntlersNode[]) {
        if (this.cacheReferences.has(documentUri) == false) {
            this.cacheReferences.set(documentUri, []);
        }

        this.cacheReferences.set(documentUri, nodes);
    }

    clearPartialReferences(documentUri: string) {
        if (this.partialReferences.has(documentUri)) {
            this.partialReferences.set(documentUri, []);
        }
    }

    clearRemovesPageScope(documentUri: string) {
        if (this.removesPageScope.has(documentUri)) {
            this.removesPageScope.delete(documentUri);
        }
    }

    pageScopeDisabled(documentUri: string): boolean {
        return this.removesPageScope.has(documentUri);
    }

    clearCacheReferences(documentUri: string) {
        if (this.cacheReferences.has(documentUri)) {
            this.cacheReferences.set(documentUri, []);
        }
    }

    setRemovesPageScope(documentUri: string, node: AntlersNode) {
        this.removesPageScope.set(documentUri, node);
    }

    getPartialReferences(documentUri: string): AntlersNode[] {
        if (this.partialReferences.has(documentUri) == false) {
            return [];
        }

        return this.partialReferences.get(documentUri) as AntlersNode[];
    }

    getCacheReferencnes(documentUri: string): AntlersNode[] {
        if (this.cacheReferences.has(documentUri) == false) {
            return [];
        }

        return this.cacheReferences.get(documentUri) as AntlersNode[];
    }

    hasPartialReferences(documentPath: string) {
        return this.partialReferences.has(documentPath);
    }

    hasCacheReferences(documentPath: string) {
        return this.cacheReferences.has(documentPath);
    }
}

if (
    typeof ReferenceManager.instance == "undefined" ||
    ReferenceManager.instance == null
) {
    ReferenceManager.instance = new ReferenceManager();
}

export default ReferenceManager;
