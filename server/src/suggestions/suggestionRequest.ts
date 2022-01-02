import { Position } from 'vscode-languageserver';
import { IProjectDetailsProvider } from '../projects/projectDetailsProvider';
import { PositionContext } from '../runtime/document/contexts/positionContext';
import { AntlersNode } from '../runtime/nodes/abstractNode';

export interface ISuggestionRequest {
    /**
     * The adjusted document URI.
     */
    document: string;
    /**
     * Indicates if the user's caret is within an Antlers tag.
     */
    isCaretInTag: boolean;
    /**
     * The character to the left of the user's caret.
     */
    leftChar: string;
    /**
     * The word to the left of the user's caret.
     *
     * Calculated by consuming all characters until whitespace is encountered.
     * This word is adjusted by trimming important Antlers characters from the left and right.
     */
    leftWord: string;
    /**
     * The word to the left of the user's caret.
     *
     * Calculated by consuming all characters until whitespace, or the ':' character is encountered.
     */
    leftMeaningfulWord: string | null;
    /**
     * Same as leftWord, but no adjustments are made.
     */
    originalLeftWord: string;
    /**
     * The character to the right of the user's caret.
     */
    rightChar: string;
    /**
     * The word to the right of the user's caret.
     *
     * Calculated by consuming all characters until whitespace is encountered.
     */
    rightWord: string;
    /**
     * The position of the user's caret.
     */
    position: Position;
    /**
     * The active Statamic Project instance.
     */
    project: IProjectDetailsProvider;
    /**
     * The active symbol the caret is inside of, if any.
     */
    currentNode: AntlersNode | null;
    context: PositionContext | null;
    /**
     * A list of all symbols within the scope of the current position.
     *
     * This list only considers symbols that have appeared before the caret position.
     */
    nodesInScope: AntlersNode[];
    /**
     * Indicates if the user's caret is within Antlers braces ('{{' and '}}').
     */
    isInDoubleBraces: boolean;
    /**
     * Indicates if the user's caret is within a variable interpolation range.
     */
    isInVariableInterpolation: boolean;
    /**
     * The offset the variable interpolation range starts on, if applicable.
     */
    interpolationStartsOn: number | null;
    isPastTagPart: boolean;
}