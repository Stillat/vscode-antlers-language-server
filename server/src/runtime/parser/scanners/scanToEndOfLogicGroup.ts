import { DocumentParser } from '../documentParser';
import { LogicGroupScanResults } from '../scanResults';
import { StringIterator } from '../stringIterator';
import { isStartOfString } from './isStartOfString';
import { skipToEndOfLine } from './skipToEndOfLine';
import { skipToEndOfMultilineComment } from './skipToEndOfMultilineComment';
import { skipToEndOfString } from './skipToEndOfString';

export function scanToEndOfLogicGroup(iterator: StringIterator): LogicGroupScanResults {
    const groupStartedOn = iterator.getCurrentIndex() + iterator.getSeedOffset();
    let groupEndsOn = 0,
        groupOpenCount = 0;

    // Advance over the initial "(".
    iterator.incrementIndex();

    for (iterator.getCurrentIndex(); iterator.getCurrentIndex() < iterator.inputLength(); iterator.incrementIndex()) {
        iterator.checkCurrentOffsets();

        if (isStartOfString(iterator.getCurrent())) {
            skipToEndOfString(iterator);
            continue;
        }

        if (iterator.getCurrent() == DocumentParser.Punctuation_ForwardSlash && iterator.getNext() == DocumentParser.Punctuation_Asterisk) {
            skipToEndOfMultilineComment(iterator, false);
            continue;
        }

        if (iterator.getCurrent() == DocumentParser.Punctuation_ForwardSlash && iterator.getNext() == DocumentParser.Punctuation_ForwardSlash) {
            skipToEndOfLine(iterator, false);
            continue;
        }

        if (iterator.getCurrent() == DocumentParser.LeftParen) {
            groupOpenCount += 1;
            continue;
        }

        if (iterator.getCurrent() == DocumentParser.RightParent) {
            if (groupOpenCount > 0) {
                groupOpenCount -= 1;
                continue;
            }

            groupEndsOn = iterator.getCurrentIndex() + iterator.getSeedOffset() + 1;
            break;
        }

        if (iterator.getCurrent() == null) { break; }
    }

    const groupContent = iterator.getContentSubstring(groupStartedOn, groupEndsOn - groupStartedOn);

    return {
        start: groupStartedOn,
        end: groupEndsOn,
        content: groupContent
    };
}