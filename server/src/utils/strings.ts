/* eslint-disable no-useless-escape */
export function trimLeft(value: string, charList: string | null) {
	if (charList == null) {
		charList = "\s";
	}

	return value.replace(new RegExp("^[" + charList + "]+"), "");
}

export function lastWord(value: string): string {
	const chars = value.split(''),
		wordChars = [];

	for (let i = chars.length; i >= 0; i--) {
		if (chars[i] == ' ') {
			break;
		}

		wordChars.push(chars[i]);
	}

	return wordChars.reverse().join();
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

export function trimString(value: string, charList: string | null) {
	return trimRight(trimLeft(value, charList), charList);
}

export function getTrimmedMatch(expression: RegExp, value: string, index: number): string | null {
	const match = expression.exec(value);

	if (match == null || match.length < index) {
		return null;
	}

	const candidate = match[index].trim();

	if (candidate.length == 0) {
		return null;
	}

	return candidate;
}

export function assertMatchIs(expression: RegExp, value: string, index: number, testValue: string): boolean {
	const candidate = getTrimmedMatch(expression, value, index);

	if (candidate != null && candidate == testValue) {
		return true;
	}

	return false;
}
