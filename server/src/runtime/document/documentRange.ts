import { Position } from '../nodes/position.js';

export class DocumentRange {
    public start: Position | null = null;
    public end: Position | null = null;

    static readonly Empty: DocumentRange = new DocumentRange();
}