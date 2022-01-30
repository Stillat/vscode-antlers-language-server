
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ctype = require('locutus/php/ctype');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const is_numeric = require('locutus/php/var/is_numeric');

export class StringUtilities {
    static normalizeLineEndings(string: string, to = "\n") {
        return string.replace(/\r?\n/g, to);
    }
    static split(text: string) {
        return text.split('');
    }

    static substring(text: string, start: number, length: number) {
        return text.substr(start, length);
    }

    static ctypeSpace(char: string | null) {
        return ctype.ctype_space(char);
    }

    static ctypeAlpha(char: string | null) {
        return ctype.ctype_alpha(char);
    }

    static ctypeDigit(char: string | null) {
        return ctype.ctype_digit(char);
    }

    static ctypePunct(char: string | null) {
        return ctype.ctype_punct(char);
    }

    static trimLeft(value: string, charList = "\\s") {
        return value.replace(new RegExp("^[" + charList + "]+"), '');
    }

    static trimRight(value: string, charList = "\\s") {
        return value.replace(new RegExp("[" + charList + "]+$"), '');
    }

    static isNumeric(string: string) {
        return is_numeric(string);
    }

    static substringCount(haystack: string, needle: string) {
        const subStr = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return (haystack.match(new RegExp(subStr, 'gi')) || []).length;
    }
}