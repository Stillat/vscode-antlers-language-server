import { ISuggestionRequest } from '../../../../suggestions/suggestionManager';
import { Scope } from '../../../scope/engine';
import { exclusiveResultList, IAntlersParameter, IAntlersTag } from '../../../tagManager';
import { ISymbol } from '../../../types';
import FormHandleParam from './formHandleParam';
import { HandleParams } from './parameterCompletions';
import { resolveFormSetReference } from './resolveFormSetReference';
import { getFormHandle } from './utils';

const FormSubmission: IAntlersTag = {
	tagName: 'form:submission',
	requiresClose: true,
	allowsContentClose: false,
	allowsArbitraryParameters: false,
	hideFromCompletions: false,
	injectParentScope: false,
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
		const formHandle = getFormHandle(symbol);

		if (formHandle.length > 0) {
			const formFields = scope.statamicProject.getFormBlueprintFields(formHandle);

			scope.addBlueprintFields(symbol, formFields);
		}

		return scope;
	}
};

export default FormSubmission;
