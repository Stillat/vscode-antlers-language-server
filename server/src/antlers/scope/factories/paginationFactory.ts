import { AntlersNode } from '../../../runtime/nodes/abstractNode.js';
import { Scope } from '../scope.js';

export function checkNodeForPagination(node: AntlersNode, scope: Scope) {
    const paginateParam = node.findParameter("paginate");

    if (paginateParam != null) {
        if (
            paginateParam.value.toLowerCase() == "true" ||
            parseInt(paginateParam.value).toString() == paginateParam.value
        ) {
            const paginationItems = scope.makeNew(),
                linksScope = scope.makeNew(),
                allScope = scope.makeNew(),
                segmentsScope = scope.makeNew();

            paginationItems.addVariable({
                name: "next_page",
                dataType: "string",
                sourceName: "*internal.pagination",
                sourceField: null,
                introducedBy: node,
            });
            paginationItems.addVariable({
                name: "prev_page",
                dataType: "string",
                sourceName: "*internal.pagination",
                sourceField: null,
                introducedBy: node,
            });
            paginationItems.addVariable({
                name: "total_items",
                dataType: "integer",
                sourceName: "*internal.pagination",
                sourceField: null,
                introducedBy: node,
            });
            paginationItems.addVariable({
                name: "total_pages",
                dataType: "integer",
                sourceName: "*internal.pagination",
                sourceField: null,
                introducedBy: node,
            });
            paginationItems.addVariable({
                name: "current_page",
                dataType: "integer",
                sourceName: "*internal.pagination",
                sourceField: null,
                introducedBy: node,
            });
            paginationItems.addVariable({
                name: "auto_links",
                dataType: "string",
                sourceName: "*internal.pagination",
                sourceField: null,
                introducedBy: node,
            });

            allScope.addVariable({
                name: "url",
                dataType: "string",
                sourceField: null,
                sourceName: "*internal.pagination.all",
                introducedBy: node,
            });
            allScope.addVariable({
                name: "page",
                dataType: "integer",
                sourceField: null,
                sourceName: "*internal.pagination.all",
                introducedBy: node,
            });

            segmentsScope.addVariable({
                name: "first",
                dataType: "boolean",
                sourceName: "*internal.pagination.segments",
                sourceField: null,
                introducedBy: node,
            });
            segmentsScope.addVariable({
                name: "last",
                dataType: "boolean",
                sourceName: "*internal.pagination.segments",
                sourceField: null,
                introducedBy: node,
            });
            segmentsScope.addVariable({
                name: "slider",
                dataType: "boolean",
                sourceName: "*internal.pagination.segments",
                sourceField: null,
                introducedBy: node,
            });

            linksScope.addScopeList("all", allScope);
            linksScope.addScopeList("segments", segmentsScope);

            paginationItems.addScopeList("links", linksScope);

            scope.addScopeList("paginate", paginationItems);
        }
    }
}
