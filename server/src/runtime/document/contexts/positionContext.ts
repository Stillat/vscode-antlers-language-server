import { Position } from '../../nodes/position';
import { GeneralContext } from './generalContext';
import { ModifierContext } from './modifierContext';
import { ParameterContext } from './parameterContext';
import { v4 as uuidv4 } from 'uuid';
import { IdentifierContext } from './identifierContext';
import { AntlersNode, AbstractNode } from '../../nodes/abstractNode';
import { VariableContext } from './variableContext';

export class PositionContext {
    public refId = '';
    public node: AntlersNode | null = null;
    public leftPunctuation: string | null = null;
    public rightPunctuation: string | null = null;

    public leftChar: string | null = null;
    public rightChar: string | null = null;

    public word: string | null = null;
    public char: string | null = null;
    public interpolatedContext = false;
    public leftWord: string | null = null;
    public rightWord: string | null = null;

    public isCursorInIdentifier = false;
    public root: AbstractNode | null = null;

    public identifierContext: IdentifierContext | null = null;

    public position: Position | null = null;
    public feature: AbstractNode | null = null;
    public isInParameter = false;

    public subContext: PositionContext | null = null;
    public parameterContext: ParameterContext | null = null;
    public modifierContext: ModifierContext | null = null;
    public generalContext: GeneralContext | null = null;
    public variableContext: VariableContext | null = null;

    public cursorContext: CursorContext = CursorContext.Unknown;

    constructor() {
        this.refId = uuidv4();
    }
}

export enum CursorContext {
    Unknown = 0,
    Variable = 1,
    Modifier = 2,
    Parameter = 3,
    General = 4,
    LanguageOperator = 5,
}