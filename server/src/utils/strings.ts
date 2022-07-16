/* eslint-disable no-useless-escape */
export function trimLeft(value: string, charList: string | null) {
    if (charList == null) {
        charList = "\s";
    }

    return value.replace(new RegExp("^[" + charList + "]+"), "");
}

export function replaceAllInString(value: string, oldString: string, newString: string): string {
    return value.replace(new RegExp(oldString, 'g'), newString);
}

export function trimRight(value: string, charList: string | null) {
    if (charList == null) {
        charList = "\s";
    }

    return value.replace(new RegExp("[" + charList + "]+$"), "");
}