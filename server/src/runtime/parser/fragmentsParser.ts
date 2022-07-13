import { FragmentNode, FragmentParameterNode, StructuralFragment } from '../nodes/abstractNode';
import { Position } from '../nodes/position';
import { StringUtilities } from '../utilities/stringUtilities';
import { DocumentOffset } from './documentOffset';
import { DocumentParser } from './documentParser';
import { IndexRange } from './indexRange';
import { isStartOfString } from './scanners/isStartOfString';
import { skipToEndOfLine } from './scanners/skipToEndOfLine';
import { skipToEndOfMultilineComment } from './scanners/skipToEndOfMultilineComment';
import { skipToEndOfString } from './scanners/skipToEndOfString';
import { StringIterator } from './stringIterator';

export class FragmentsParser implements StringIterator {
    private content = '';
    private nodeIndex: IndexRange[] = [];
    private fragmentStartIndex: number[] = [];
    private charLen = 0;
    private documentOffsets: Map<number, DocumentOffset> = new Map();
    private inputLen = 0;
    private seedOffset = 0;
    private shiftLine = 0;
    private chars: string[] = [];
    private currentIndex = 0;
    private lastDocumentOffsetKey: number | null = null;
    private cur: string | null = null;
    private next: string | null = null;
    private prev: string | null = null;
    private chunkSize = 5;
    private currentChunkOffset = 0;
    private fragments: FragmentNode[] = [];
    private isScript = false;
    private fragmentOpeningIndex: Map<number, number> = new Map();
    private indexedFragments: Map<number, FragmentNode> = new Map();
    private embeddedIndexedFragments: Map<number, FragmentNode> = new Map();

    updateIndex(index: number): void {
        this.currentIndex = index;
    }
    inputLength(): number {
        return this.inputLen;
    }
    incrementIndex(): void {
        this.currentIndex += 1;
    }
    getCurrentIndex(): number {
        return this.currentIndex;
    }
    getCurrent(): string | null {
        return this.cur;
    }
    getNext(): string | null {
        return this.next;
    }
    getPrev(): string | null {
        return this.prev;
    }
    pushChar(value: string) {
        return;
    }
    getChar(index: number) {
        return this.chars[index];
    }
    getSeedOffset(): number {
        return this.seedOffset;
    }
    setDocumentOffsets(offsets: Map<number, DocumentOffset>, lastOffsetIndex: number | null) {
        this.documentOffsets = offsets;
        this.lastDocumentOffsetKey = lastOffsetIndex;

        return this;
    }

    getClosingFragmentAfter(fragment: FragmentNode): FragmentNode | null {
        const lowerName = fragment.name.toLowerCase();

        for (let i = 0; i < this.fragments.length; i++) {
            const thisFragment = this.fragments[i];

            if (thisFragment.isClosingFragment && !thisFragment.isSelfClosing && thisFragment.name.toLowerCase() == lowerName && thisFragment.index > fragment.index) {
                return thisFragment;
            }
        }

        return null;
    }

    getContentSubstring(from: number, length: number): string {
        return this.content.substr(from, length);
    }

    private resetState() {
        this.fragments = [];
        this.inputLen = 0;
        this.fragmentStartIndex = [];
        this.fragmentOpeningIndex.clear();

        return this;
    }

    protected resetIntermediateState() {
        this.chars = [];
        this.charLen = 0;
        this.currentIndex = 0;
        this.seedOffset = 0;
        this.cur = null;
        this.next = null;
        this.prev = null;
    }

    private positionFromOffset(offset: number, index: number, isRelativeOffset = false) {
        let lineToUse = 0,
            charToUse = 0;

        if (!this.documentOffsets.has(offset)) {
            if (this.documentOffsets.size == 0) {
                lineToUse = 1;
                charToUse = offset + 1;
            } else {
                let nearestOffset: DocumentOffset | null = null,
                    nearestOffsetIndex: number | null = null,
                    lastOffset: DocumentOffset | null = null,
                    lastOffsetIndex: number | null = null;

                for (const documentOffset of this.documentOffsets.keys()) {
                    if (documentOffset >= offset) {
                        if (lastOffsetIndex != null && offset > lastOffsetIndex) {
                            nearestOffset = lastOffset;
                            nearestOffsetIndex = lastOffsetIndex;
                        } else {
                            nearestOffset = this.documentOffsets.get(documentOffset) as DocumentOffset;
                            nearestOffsetIndex = documentOffset;
                        }
                        break;
                    }
                    lastOffset = this.documentOffsets.get(documentOffset) as DocumentOffset;
                    lastOffsetIndex = documentOffset;
                }

                if (nearestOffset == null) {
                    nearestOffset = lastOffset;
                    nearestOffsetIndex = lastOffsetIndex;
                }

                if (nearestOffset != null) {
                    if (isRelativeOffset) {
                        const tChar = offset - (nearestOffsetIndex ?? 0);

                        charToUse = tChar;
                        lineToUse = nearestOffset.line;

                        if (offset <= (nearestOffsetIndex ?? 0)) {
                            lineToUse = nearestOffset.line;
                            charToUse = offset + 1;
                        } else {
                            lineToUse = nearestOffset.line + 1;
                        }
                    } else {
                        const tChar = offset - (nearestOffsetIndex ?? 0);
                        charToUse = tChar;
                        lineToUse = nearestOffset.line;

                        if (offset <= (nearestOffsetIndex ?? 0)) {
                            lineToUse = nearestOffset.line;
                            charToUse = offset + 1;
                        } else {
                            lineToUse = nearestOffset.line + 1;
                        }
                    }
                } else {
                    if (this.lastDocumentOffsetKey != null) {
                        const lastOffset = this.documentOffsets.get(this.lastDocumentOffsetKey) as DocumentOffset;
                        lineToUse = lastOffset.line + 1;
                        charToUse = offset + this.lastDocumentOffsetKey;
                    }
                }
            }
        } else {
            const offsetDetails = this.documentOffsets.get(offset) as DocumentOffset;

            lineToUse = offsetDetails.line;
            charToUse = offsetDetails.char;
        }

        const position = new Position();

        position.index = index;
        position.offset = offset;
        position.line = lineToUse + this.shiftLine;
        position.char = charToUse;

        return position;
    }

    getFragments() {
        return this.fragments;
    }

    getFragmentsBetween(startIndex: number, endIndex: number): FragmentNode[] {
        const returnFragments: FragmentNode[] = [];

        this.fragments.forEach((fragment) => {
            const start = fragment.startPosition?.index ?? 0,
                end = fragment.endPosition?.index ?? 0;

            if (start > startIndex && end < endIndex) {
                returnFragments.push(fragment);
            }
        });

        return returnFragments;
    }

    getFragmentContaining(position: Position): FragmentNode | null {
        for (let i = 0; i < this.fragments.length; i++) {
            const thisFragment = this.fragments[i];

            if ((thisFragment.startPosition?.index ?? 0) < position.index && (thisFragment.endPosition?.index ?? 0) > position.index) {
                return thisFragment;
            }
        }
        return null;
    }

    checkCurrentOffsets() {
        if (this.currentIndex > this.chars.length) {
            this.cur = null;
            this.prev = null;
            this.next = null;
            return;
        }

        this.cur = this.chars[this.currentIndex];

        this.prev = null;
        this.next = null;

        if (this.currentIndex > 0) {
            this.prev = this.chars[this.currentIndex - 1];
        }

        if ((this.currentIndex + 1) < this.inputLen) {
            let doPeek = true;

            if (this.currentIndex == this.charLen - 1) {
                const nextChunk = StringUtilities.split(
                    StringUtilities.substring(this.content,
                        this.currentChunkOffset + this.chunkSize,
                        this.chunkSize
                    ));
                this.currentChunkOffset += this.chunkSize;

                if (this.currentChunkOffset == this.inputLen) {
                    doPeek = false;
                }

                nextChunk.forEach((nextChar) => {
                    this.chars.push(nextChar);
                    this.charLen += 1;
                });
            }

            if (doPeek && (this.currentIndex + 1) < this.chars.length) {
                this.next = this.chars[this.currentIndex + 1];
            }
        }
    }

    private processInputText(input: string) {
        this.content = input;
        this.inputLen = this.content.length;

        const fragmentCandidates = [...this.content.matchAll(/(<(?!\?[php|?=]))/gm)],
            newCandidates: number[] = [];

        fragmentCandidates.forEach((candidate) => {
            const candidateIndex = candidate.index ?? 0;

            for (let i = 0; i < this.nodeIndex.length; i++) {
                const thisIndex = this.nodeIndex[i];

                if (candidateIndex >= thisIndex.start && candidateIndex <= thisIndex.end) {
                    return;
                }
            }

            newCandidates.push(candidateIndex);
        });

        this.fragmentStartIndex = newCandidates;
    }

    setIndexRanges(index: IndexRange[]) {
        this.nodeIndex = index;

        return this;
    }

    private fetchAt(start: number, length: number) {
        return this.content.substr(start, length);
    }

    getFragmentsContainingStructures(): StructuralFragment[] {
        const structures: StructuralFragment[] = [];

        this.fragments.forEach((fragment) => {
            if (!fragment.isClosingFragment && !fragment.isSelfClosing && fragment.containsStructures) {
                const close = this.getClosingFragmentAfter(fragment);

                if (close != null) {
                    structures.push({
                        start: fragment,
                        end: close
                    });
                }
            }
        });

        return structures;
    }

    parse(text: string) {
        this.resetState().processInputText(text);

        const indexCount = this.fragmentStartIndex.length;

        if (indexCount == 0) {
            return [];
        }

        for (let i = 0; i < this.fragmentStartIndex.length; i++) {
            const offset = this.fragmentStartIndex[i];
            this.resetIntermediateState();

            this.seedOffset = offset;
            this.currentChunkOffset = offset;
            this.parseIntermediateText();

            if (this.isScript) {
                let didFind = false;
                for (let j = i + 1; j < this.fragmentStartIndex.length; j++) {
                    const checkIndex = this.fragmentStartIndex[j],
                        thisChunk = this.fetchAt(checkIndex, 8).toLowerCase();
                    if (thisChunk == '</script') {
                        i = j - 1;
                        this.isScript = false;
                        didFind = true;
                        break;
                    }
                }

                if (!didFind) {
                    // Break if we get to this point since the script is not closed.
                    break;
                }
            }
        }

        let fragmentIndex = 0,
            embeddedIndex = 0;

        this.fragments.forEach((fragment) => {
            const lowerName = fragment.name.toLowerCase();

            if (lowerName == 'script' || lowerName == 'style') {
                fragment.embeddedIndex = embeddedIndex;
                this.embeddedIndexedFragments.set(embeddedIndex, fragment);
                embeddedIndex += 1;
            }

            fragment.index = fragmentIndex;

            this.indexedFragments.set(fragmentIndex, fragment);
            fragmentIndex += 1;
        });

        return this.fragments;
    }

    getFragment(index: number): FragmentNode {
        return this.indexedFragments.get(index) as FragmentNode;
    }

    getEmbeddedFragment(index: number): FragmentNode {
        return this.embeddedIndexedFragments.get(index) as FragmentNode;
    }

    hasFragments() {
        return this.fragments.length > 0;
    }

    private skipToEndOfPhp() {
        for (this.currentIndex; this.currentIndex < this.inputLen; this.currentIndex += 1) {
            this.checkCurrentOffsets();

            if (isStartOfString(this.cur)) {
                skipToEndOfString(this);
            }

            if (this.cur == DocumentParser.Punctuation_ForwardSlash && this.next == DocumentParser.Punctuation_ForwardSlash) {
                skipToEndOfLine(this, true);
                continue;
            }

            if (this.cur == DocumentParser.Punctuation_ForwardSlash && this.next == DocumentParser.Punctuation_Asterisk) {
                skipToEndOfMultilineComment(this, true);
                continue;
            }

            if ((this.cur == DocumentParser.Punctuation_Question && this.next == DocumentParser.Punctuation_GreaterThan) || this.next == null) {
                break;
            }
        }
    }

    private parseIntermediateText() {
        this.chars = this.content.substr(this.currentChunkOffset, this.chunkSize).split('');
        this.charLen = this.chars.length;
        const fragmentStartedAt = this.currentIndex,
            potentialParameterRanges: FragmentParameterNode[] = [],
            nameChars: string[] = [];

        let hasFoundName = false,
            isClosingFragment = false;

        for (this.currentIndex = 0; this.currentIndex < this.inputLen; this.currentIndex += 1) {
            this.checkCurrentOffsets();

            if (StringUtilities.ctypeSpace(this.cur)) {
                hasFoundName = true;
            }

            if (this.next == DocumentParser.Punctuation_LessThan) {
                let shift = 1;

                if (this.cur == DocumentParser.Punctuation_ForwardSlash) {
                    shift = 2;
                }

                const curFetch = this.fetchAt(this.currentChunkOffset + shift, 5);

                if (curFetch.toLowerCase() == '<?php' || curFetch.startsWith('<?=')) {
                    this.skipToEndOfPhp();
                    continue;
                }
            }

            if (this.currentIndex > 0 && this.cur == DocumentParser.Punctuation_LessThan) {
                break;
            }

            if (this.next == null && this.cur != DocumentParser.Punctuation_GreaterThan) {
                break;
            }

            if (!hasFoundName && this.cur == DocumentParser.Punctuation_LessThan && this.next == DocumentParser.Punctuation_ForwardSlash) {
                isClosingFragment = true;
            }

            if (!hasFoundName && this.cur != DocumentParser.Punctuation_LessThan &&
                this.cur != DocumentParser.Punctuation_ForwardSlash &&
                this.cur != DocumentParser.Punctuation_GreaterThan) {
                nameChars.push(this.cur as string);
            }

            if (isStartOfString(this.cur)) {
                const stringStartedOn = this.currentIndex;
                skipToEndOfString(this);
                const fragmentParameter = new FragmentParameterNode();
                fragmentParameter.startPosition = this.positionFromOffset(stringStartedOn + this.seedOffset, stringStartedOn + this.seedOffset);
                fragmentParameter.endPosition = this.positionFromOffset(this.currentIndex + this.seedOffset, this.currentIndex + this.seedOffset);
                potentialParameterRanges.push(fragmentParameter);
                continue;
            }

            if (this.cur == DocumentParser.Punctuation_ForwardSlash && this.next == DocumentParser.Punctuation_GreaterThan) {
                const fragment = new FragmentNode();
                fragment.startPosition = this.positionFromOffset(fragmentStartedAt + this.seedOffset, fragmentStartedAt + this.seedOffset);
                fragment.endPosition = this.positionFromOffset(this.currentIndex + this.seedOffset + 1, this.currentIndex + this.seedOffset + 1);
                fragment.parameters = potentialParameterRanges;
                fragment.isSelfClosing = true;
                fragment.name = nameChars.join('');
                fragment.isClosingFragment = isClosingFragment;
                this.fragments.push(fragment);

                if (isClosingFragment) {
                    this.fragmentOpeningIndex.set(fragment.startPosition.index + 1, 1);
                } else {
                    this.fragmentOpeningIndex.set(fragment.startPosition.index, 1);
                }

                break;
            }

            if (this.cur == DocumentParser.Punctuation_GreaterThan) {
                const fragment = new FragmentNode();
                fragment.startPosition = this.positionFromOffset(fragmentStartedAt + this.seedOffset, fragmentStartedAt + this.seedOffset);
                fragment.endPosition = this.positionFromOffset(this.currentIndex + this.seedOffset, this.currentIndex + this.seedOffset);
                fragment.parameters = potentialParameterRanges;
                fragment.name = nameChars.join('');
                fragment.isClosingFragment = isClosingFragment;
                this.fragments.push(fragment);

                if (isClosingFragment) {
                    this.fragmentOpeningIndex.set(fragment.startPosition.index + 1, 1);
                } else {
                    this.fragmentOpeningIndex.set(fragment.startPosition.index, 1);
                }

                if (fragment.name.toLowerCase() == 'script' && fragment.isClosingFragment == false) {
                    this.isScript = true;
                }

                break;
            }
        }
    }
}