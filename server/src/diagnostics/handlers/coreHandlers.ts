import { IDiagnosticsHandler } from '../diagnosticsHandler';
import DataDumpHandler from './dataDumpHandler';
import DeprecatedModifierHandler from './deprecatedModifierHandler';
import DoubleColonHandler from './doubleColonHandler';
import InterleavedNodeHandler from './interleavedNodes';
import MixedModifierHandler from './mixedModifierHandler';
import ModifierRuntimeTypeHandler from './modifierRuntimeTypeHandler';
import ParameterValidatorHandler from './parameterValidatorHandler';
import PartialParametersHandler from './partialParametersHandler';
import RelateTagHandler from './relateHandler';
import ShorthandModifierHandler from './shorthandModifierHandler';
import StatamicVersionHandler from './statamicVersionHandler';
import TagsThatErrorHandler from './tagsThatErrorHandler';

const CoreHandlers: IDiagnosticsHandler[] = [
    DataDumpHandler,
    MixedModifierHandler,
    ModifierRuntimeTypeHandler,
    DeprecatedModifierHandler,
    DoubleColonHandler,
    RelateTagHandler,
    TagsThatErrorHandler,
    ShorthandModifierHandler,
    StatamicVersionHandler,
    InterleavedNodeHandler,
    PartialParametersHandler,
    ParameterValidatorHandler,
];

export default CoreHandlers;
