import { ISuggestionRequest } from '../../../../suggestions/suggestionManager';
import { Scope } from '../../../scope/engine';
import { exclusiveResultList, IAntlersParameter, IAntlersTag } from '../../../tagManager';
import { ISymbol } from '../../../types';
import FormHandleParam from './formHandleParam';
import { HandleParams } from './parameterCompletions';
import { resolveFormSetReference } from './resolveFormSetReference';
import { getFormHandle } from './utils';

const FormSubmissions: IAntlersTag = {
	tagName: 'form:submissions',
	allowsArbitraryParameters: false,
	allowsContentClose: false,
	hideFromCompletions: false,
	injectParentScope: false,
	requiresClose: true,
	parameters: [
		FormHandleParam
	],
	resolveSpecialType: resolveFormSetReference,
	resovleParameterCompletionItems: (parameter: IAntlersParameter, params: ISuggestionRequest) => {
		if (HandleParams.includes(parameter.name)) {
			return exclusiveResultList(params.project.getUniqueFormNames());
		}

		return null;
	},
	augmentScope: (symbol: ISymbol, scope: Scope) => {
		if (symbol.tagPart.startsWith('/')) {
			return scope;
		}

		const formHandle = getFormHandle(symbol);

		if (formHandle.length > 0) {
			const formFields = scope.statamicProject.getFormBlueprintFields(formHandle);

			scope.addBlueprintFields(symbol, formFields);
		}

		scope.addVariable({ name: 'date', dataType: 'date', sourceField: null, sourceName: '*internal.forms.submissions', introducedBy: symbol });
		scope.addVariable({ name: 'no_results', dataType: 'boolean', sourceField: null, sourceName: '*internal.forms.submissions', introducedBy: symbol });
		scope.addVariable({ name: 'total_results', dataType: 'number', sourceField: null, sourceName: '*internal.forms.submissions', introducedBy: symbol });

		return scope;
	}
};

export default FormSubmissions;
