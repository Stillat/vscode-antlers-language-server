import { IAntlersTag } from '../../../tagManager';
import FormHandleParam from './formHandleParam';
import { resolveFormParameterCompletions } from './parameterCompletions';

const FormSetTag: IAntlersTag = {
	tagName: 'form:set',
	allowsArbitraryParameters: false,
	allowsContentClose: false,
	requiresClose: true,
	hideFromCompletions: false,
	injectParentScope: false,
	parameters: [
		FormHandleParam
	],
	resovleParameterCompletionItems: resolveFormParameterCompletions
};

export default FormSetTag;
