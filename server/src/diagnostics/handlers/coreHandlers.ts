import { IDiagnosticsHandler } from '../diagnosticsHandler';
import DataDumpHandler from './dataDumpHandler';
import DeprecatedModifierHandler from './deprecatedModifierHandler';
import DoubleColonHandler from './doubleColonHandler';
import FieldTypeModifierSequenceHandler from './fieldTypeModifierSequenceHandler';
import InterleavedNodeHandler from './interleavedNodes';
import InvalidParameterHandler from './invalidParameterHandler';
import MinCountHandler from './minCountHandlers';
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
    FieldTypeModifierSequenceHandler,
    DeprecatedModifierHandler,
    DoubleColonHandler,
    RelateTagHandler,
    TagsThatErrorHandler,
    ShorthandModifierHandler,
    StatamicVersionHandler,
    InterleavedNodeHandler,
    InvalidParameterHandler,
    PartialParametersHandler,
    ParameterValidatorHandler,
    MinCountHandler
];

export default CoreHandlers;
