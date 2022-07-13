// ctype regexes adapted from: https://github.com/locutusjs/locutus/blob/master/src/php/strings/setlocale.js

import { is_numeric } from './isNumeric';

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
        return char?.search(/^[\f\n\r\t\v ]+$/g) !== -1;
    }

    static ctypeAlpha(char: string | null) {
        return char?.search(/^[A-Za-z]+$/g) !== -1;
    }

    static ctypeDigit(char: string | null) {
        return char?.search(/^[\d]+$/g) !== -1;
    }

    static ctypePunct(char: string | null) {
        return char?.search(/^[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E]+$/g) !== -1;
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