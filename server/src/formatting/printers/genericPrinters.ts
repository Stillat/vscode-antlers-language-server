export class GenericPrinters {
    static frontMatterBlock(text: string) {
        return "---\n" + text + "\n---\n\n";
    }
}