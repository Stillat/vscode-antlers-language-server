import { Md5 } from 'ts-md5/dist/md5';

export class NoParseManager {
    protected static noParseRegions: Map<string, string> = new Map();

    static regions() {
        return this.noParseRegions;
    }

    static clear() {
        this.noParseRegions.clear();
    }

    static registerNoParseContent(content: string) {
        const hash = Md5.hashStr(content);

        this.noParseRegions.set(hash, content);

        return hash;
    }
}