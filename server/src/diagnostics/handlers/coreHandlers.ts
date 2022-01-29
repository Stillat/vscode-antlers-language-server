import { IDiagnosticsHandler } from '../diagnosticsHandler';
import DataDumpHandler from './dataDumpHandler';
import DoubleColonHandler from './doubleColonHandler';
import MixedModifierHandler from './mixedModifierHandler';
import ModifierRuntimeTypeHandler from './modifierRuntimeTypeHandler';
import RelateTagHandler from './relateHandler';
import ShorthandModifierHandler from './shorthandModifierHandler';
import StatamicVersionHandler from './statamicVersionHandler';
import TagsThatErrorHandler from './tagsThatErrorHandler';

const CoreHandlers: IDiagnosticsHandler[] = [
    DataDumpHandler,
    MixedModifierHandler,
    ModifierRuntimeTypeHandler,
    DoubleColonHandler,
	RelateTagHandler,
	TagsThatErrorHandler,
	ShorthandModifierHandler,
	StatamicVersionHandler
];

export default CoreHandlers;
