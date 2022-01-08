import { AntlersError, ErrrorLevel } from '../../runtime/errors/antlersError';
import { AntlersErrorCodes } from '../../runtime/errors/antlersErrorCodes';
import { AntlersNode } from '../../runtime/nodes/abstractNode';
import { IDiagnosticsHandler } from '../diagnosticsHandler';

const RelateTagHandler: IDiagnosticsHandler = {
	checkNode(node: AntlersNode) {
		const errors: AntlersError[] = [];

		if (node.isTagNode && node.name != null && node.getTagName() == 'relate') {
			errors.push(AntlersError.makeSyntaxError(
				AntlersErrorCodes.LINT_REMOVE_RELATE_TAG,
				node,
				'The `relate` tag is not necessary here, and can be removed.',
				ErrrorLevel.Warning
			));
		}

		return errors;
	}	
};

export default RelateTagHandler;
