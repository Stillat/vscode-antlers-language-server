export function makeTagDocWithCodeSample(title: string, description: string, code: string, docLink: string | null) {
    let docs = '**' + title + '**  ';

    docs += "\n";

    docs += description + '  ';

    docs += "\n```antlers\n";

    docs += code;

    docs += "\n```";

    if (docLink != null) {
        docs += "\n\n";
        docs += '[Documentation Reference](' + docLink + ')';
    }

    return docs;
}

export function makeTagDoc(title: string, description: string, docLink: string | null) {
    let docs = '**' + title + '**  ';

    docs += "\n";

    docs += description + '  ';

    if (docLink != null) {
        docs += "\n\n";
        docs += '[Documentation Reference](' + docLink + ')';
    }

    return docs;
}
