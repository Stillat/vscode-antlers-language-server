import { AntlersNode } from '../runtime/nodes/abstractNode';
import { Scope } from './scope/scope';

export interface IModifierReference {
    name: string;
    hasReference: boolean;
    manifestsType: string;
    ref: IModifier | null;
}

export interface IModifierMacro {
    name: string;
    modifiers: IModifierReference[];
    manifestsType: string;
}

export interface IModifier {
    /**
     * The name of the modifier.
     */
    name: string;
    /**
     * A list of expected types for the modifier.
     *
     * Allowed values are:
     *   *       - Any
     *   string  - string
     *   date    - date
     *   number  - numeric
     *   array   - array
     *   boolean - boolean
     */
    acceptsType: string[];
    /**
     * A list of return types for the modifier.
     *
     * Allowed values are:
     *   *       - Any
     *   string  - string
     *   date    - date
     *   number  - numeric
     *   array   - array
     *   boolean - boolean
     */
    returnsType: string[];
    /**
     * A user-friendly description of the modifier.
     */
    description: string;
    /**
     * A list of acceptable modifier parameters.
     */
    parameters: IModifierParameter[];
    /**
     * An optional web URI that will be displayed as part of the modifier suggestion.
     */
    docLink: string | null;
    /**
     * Indicates if the modifier can appear as a parameter suggestion for applicable variables.
     */
    canBeParameter: boolean;
	augmentScope?(symbol: AntlersNode, scope: Scope): Scope;
}

export interface IModifierParameter {
    /**
     * The name of the modifier parameter.
     */
    name: string;
    /**
     * A user-friendly description of the modifier parameter.
     */
    description: string;
}
