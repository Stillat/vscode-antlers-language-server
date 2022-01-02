import { TagIdentifier } from '../nodes/tagIdentifier';

export class TagIdentifierAnalyzer {
    static getIdentifier(input: string) {
        const identifier = new TagIdentifier();
        identifier.content = input.trim();

        const parts = input.split(':');

        if (parts.length == 1) {
            identifier.name = parts[0].trim();
            identifier.methodPart = null;
            identifier.compound = identifier.name;
        } else if (parts.length > 1) {
            const name = parts.shift() ?? '',
                methodPart = parts.join(':');

            identifier.name = name.trim();
            identifier.methodPart = methodPart.trim();
            identifier.compound = identifier.name + ':' + identifier.methodPart;
        } else {
            identifier.name = input.trim();
            identifier.methodPart = '';
        }

        if (identifier.name.startsWith('/')) {
            identifier.name = identifier.name.substr(1);
            identifier.compound = identifier.compound.substr(1);
        }

        return identifier;
    }
}