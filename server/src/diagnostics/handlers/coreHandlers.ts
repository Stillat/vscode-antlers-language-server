import { IDiagnosticsHandler } from '../diagnosticsHandler.js';
import DataDumpHandler from './dataDumpHandler.js';
import DeprecatedModifierHandler from './deprecatedModifierHandler.js';
import FieldTypeModifierSequenceHandler from './fieldTypeModifierSequenceHandler.js';
import InterleavedNodeHandler from './interleavedNodes.js';
import InvalidParameterHandler from './invalidParameterHandler.js';
import MixedModifierHandler from './mixedModifierHandler.js';
import ModifierRuntimeTypeHandler from './modifierRuntimeTypeHandler.js';
import ParameterValidatorHandler from './parameterValidatorHandler.js';
import PartialParametersHandler from './partialParametersHandler.js';
import QueryBuildersHandler from './queryBuildersHandler.js';
import RelateTagHandler from './relateHandler.js';
import ShorthandModifierHandler from './shorthandModifierHandler.js';
import StatamicVersionHandler from './statamicVersionHandler.js';
import TagsThatErrorHandler from './tagsThatErrorHandler.js';

const CoreHandlers: IDiagnosticsHandler[] = [
    DataDumpHandler,
    MixedModifierHandler,
    ModifierRuntimeTypeHandler,
    FieldTypeModifierSequenceHandler,
    DeprecatedModifierHandler,
    RelateTagHandler,
    TagsThatErrorHandler,
    ShorthandModifierHandler,
    StatamicVersionHandler,
    InterleavedNodeHandler,
    InvalidParameterHandler,
    PartialParametersHandler,
    ParameterValidatorHandler,
    QueryBuildersHandler
];

export default CoreHandlers;
