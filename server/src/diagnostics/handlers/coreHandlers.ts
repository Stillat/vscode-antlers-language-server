import { IDiagnosticsHandler } from '../diagnosticsHandler';
import DataDumpHandler from './dataDumpHandler';
import DoubleColonHandler from './doubleColonHandler';
import MixedModifierHandler from './mixedModifierHandler';
import ModifierRuntimeTypeHandler from './modifierRuntimeTypeHandler';

const CoreHandlers: IDiagnosticsHandler[] = [
    DataDumpHandler,
    MixedModifierHandler,
    ModifierRuntimeTypeHandler,
    DoubleColonHandler
];

export default CoreHandlers;
