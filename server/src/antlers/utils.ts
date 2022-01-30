export function getPotentialTagName(value: string) {
    if (value.includes(":")) {
        return value.split(":")[0].trim();
    }

    return value.trim();
}

export function getPotentialMethodName(value: string) {
    if (value.includes(":")) {
        return value.split(":").slice(1).join(":").trim();
    }

    return "";
}
