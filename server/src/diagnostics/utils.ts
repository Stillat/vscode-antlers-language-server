import { DiagnosticSeverity } from "vscode-languageserver-types";
import { IReportableError } from "../antlers/types.js";
import { AntlersNode, ParameterNode } from '../runtime/nodes/abstractNode.js';

export function parameterError(message: string, symbol: AntlersNode, parameter: ParameterNode): IReportableError {
    return {
        endLine: parameter.valuePosition?.end?.line ?? 0,
        startLine: parameter.namePosition?.start?.line ?? 0,
        endPos: parameter.valuePosition?.end?.char ?? 0,
        startPos: parameter.namePosition?.start?.char ?? 0,
        message: message,
        severity: DiagnosticSeverity.Error,
    };
}
