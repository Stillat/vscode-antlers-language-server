import { AntlersNode } from '../nodes/abstractNode.js';

export class GlobalRuntimeState {
    static globalTagEnterStack: AntlersNode[] = [];
    static interpolatedVariables: string[] = [];
}