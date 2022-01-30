import { IBlueprintField } from '../../projects/blueprints/fields';
import { AntlersNode } from '../../runtime/nodes/abstractNode';
import { Scope } from './scope';

export interface IPristineSnapshot {
    introducedScope: string,
    parentCopy: Scope,
    introducedFields: IBlueprintField[]
}

export interface IScopeVariable {
    /**
     * The name of the variable.
     */
    name: string,
    /**
     * The inferred runtime data type of the variable reference.
     */
    dataType: string,
    /**
     * The blueprint field underlying the variable, if any.
     */
    sourceField: IBlueprintField | null,
    /**
     * Provides a reference to where/how the variable was introduced.
     * 
     * Internal providers will be prefixed with '*internal'.
     */
    sourceName: string,
    /**
     * The symbol that introduced the variable.
     * 
     * An example would be the collection tag introducing a 'posts' array.
     */
    introducedBy: AntlersNode | null
}