import { DocumentParser } from '../documentParser.js';
import { StringIterator } from '../stringIterator.js';

export function skipToEndOfString(iterator: StringIterator) {
    const stringInitializer = iterator.getCurrent() as string;
    iterator.incrementIndex();

    for (iterator.getCurrentIndex(); iterator.getCurrentIndex() < iterator.inputLength(); iterator.incrementIndex()) {
        iterator.checkCurrentOffsets();

        if (iterator.getCurrent() == stringInitializer && iterator.getPrev() != DocumentParser.String_EscapeCharacter) {
            break;
        }
    }
}
