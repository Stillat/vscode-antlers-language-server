export class LanguageKeywords {
    static readonly LogicalAnd = 'and';
    static readonly LogicalNot = 'not';
    static readonly LogicalOr = 'or';
    static readonly LogicalXor = 'xor';

    static readonly ConstTrue = 'true';
    static readonly ConstFalse = 'false';
    static readonly ConstNull = 'null';
    static readonly ArrList = 'list';
    static readonly ScopeAs = 'as';

    static isLanguageLogicalKeyword(value: string) {
        if (value == this.LogicalAnd || value == this.LogicalNot || value == this.LogicalOr || value == this.LogicalXor) {
            return true;
        }

        return false;
    }
}