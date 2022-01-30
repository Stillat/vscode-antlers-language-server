export class TagIdentifier {
    public name = '';
    public compound = '';
    public methodPart: string | null = '';
    public content = '';
    public cachedCompoundTagName: string | null = null;

    tagPartIs(check: string): boolean {
        check = check.toLowerCase().trim();
        const checkAgainst = this.name.toLowerCase().trim();

        return checkAgainst == check;
    }

    isCompound() {
        if (this.methodPart == null) {
            return false;
        }

        return this.methodPart.length > 0;
    }

    getMethodName() {
        if (this.methodPart == '') {
            return 'index';
        }

        if (this.methodPart == 'null') {
            return '';
        }

        return this.methodPart;
    }

    getRuntimeMethodName() {
        // Not Implemented in TS version.
    }

    getCompoundTagName() {
        if (this.cachedCompoundTagName == null) {
            const methodName = this.getMethodName();

            this.cachedCompoundTagName = this.name;

            if (methodName != null && methodName != '') {
                this.cachedCompoundTagName = this.cachedCompoundTagName + ':' + methodName;
            }
        }

        return this.cachedCompoundTagName;
    }
}