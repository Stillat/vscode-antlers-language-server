export class HtmlFragments {
    static endsWithFragment(text: string): boolean {
        const literalChars = text.split('');

        const leftAngleCount = 0,
            rightAngleCount = 0,
            quoteCount = 0,
            isInString = false;

        for (let i = 0; i < literalChars.length; i++) {
            const cur = literalChars[i];

            let prev: string | null = null,
                next: string | null = null;

            if (i > 0) {
                prev = literalChars[i - 1];
            }

            if (i + 1 < literalChars.length) {
                next = literalChars[i + 1];
            }

            if (cur == '<') {
                const result = HtmlFragments.scanToEndOfElemnt(literalChars, i);

                if (result < 0) {
                    return true;
                }
            }
        }

        return false;
    }

    static scanToEndOfElemnt(list: string[], index: number) {
        let isInString = false,
            foundOn = -1;

        for (let i = index + 1; i < list.length; i++) {

            const cur = list[i];

            let prev: string | null = null,
                next: string | null = null;

            if (i > 0) {
                prev = list[i - 1];
            }

            if (i + 1 < list.length) {
                next = list[i + 1];
            }

            if (cur == '"' && prev == '=') {
                isInString = true;
                continue;
            }

            if (cur == '"' && isInString) {
                isInString = false;
                continue;
            }

            if (!isInString && cur == '>') {
                foundOn = i;
                break;
            }
        }

        return foundOn;
    }
}