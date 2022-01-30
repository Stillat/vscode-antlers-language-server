import { AntlersNode } from '../nodes/abstractNode';

export class GlobalRuntimeState {
    static globalTagEnterStack: AntlersNode[] = [];
    static interpolatedVariables: string[] = [];
}