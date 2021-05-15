import { hasParamAndMatches, ISymbol } from '../../types';
import { Scope } from '../engine';

export function checkSymbolForPagination(symbol: ISymbol, scope: Scope) {
	if (hasParamAndMatches(symbol, 'paginate', 'true')) {
		const paginationItems = scope.makeNew(),
			linksScope = scope.makeNew(),
			allScope = scope.makeNew(),
			segmentsScope = scope.makeNew();

		paginationItems.addVariable({ name: 'next_page', dataType: 'string', sourceName: '*internal.pagination', sourceField: null, introducedBy: symbol });
		paginationItems.addVariable({ name: 'prev_page', dataType: 'string', sourceName: '*internal.pagination', sourceField: null, introducedBy: symbol });
		paginationItems.addVariable({ name: 'total_items', dataType: 'integer', sourceName: '*internal.pagination', sourceField: null, introducedBy: symbol });
		paginationItems.addVariable({ name: 'total_pages', dataType: 'integer', sourceName: '*internal.pagination', sourceField: null, introducedBy: symbol });
		paginationItems.addVariable({ name: 'current_page', dataType: 'integer', sourceName: '*internal.pagination', sourceField: null, introducedBy: symbol });
		paginationItems.addVariable({ name: 'auto_links', dataType: 'string', sourceName: '*internal.pagination', sourceField: null, introducedBy: symbol });

		allScope.addVariable({ name: 'url', dataType: 'string', sourceField: null, sourceName: '*internal.pagination.all', introducedBy: symbol });
		allScope.addVariable({ name: 'page', dataType: 'integer', sourceField: null, sourceName: '*internal.pagination.all', introducedBy: symbol });

		segmentsScope.addVariable({ name: 'first', dataType: 'boolean', sourceName: '*internal.pagination.segments', sourceField: null, introducedBy: symbol });
		segmentsScope.addVariable({ name: 'last', dataType: 'boolean', sourceName: '*internal.pagination.segments', sourceField: null, introducedBy: symbol });
		segmentsScope.addVariable({ name: 'slider', dataType: 'boolean', sourceName: '*internal.pagination.segments', sourceField: null, introducedBy: symbol });

		linksScope.addScopeList('all', allScope);
		linksScope.addScopeList('segments', segmentsScope);

		paginationItems.addScopeList('links', linksScope);

		scope.addScopeList('paginate', paginationItems);
	}
}
