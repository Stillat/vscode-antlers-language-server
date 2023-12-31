import { AntlersSettings } from '../antlersSettings.js';
import InterleavedNodeHandler from '../diagnostics/handlers/interleavedNodes.js';
import { AntlersDocument } from '../runtime/document/antlersDocument.js';
import { TransformOptions } from '../runtime/document/transformOptions.js';
import { StructuralFragment } from '../runtime/nodes/abstractNode.js';
import { StringUtilities } from '../runtime/utilities/stringUtilities.js';
import { AsyncHTMLFormatter, AsyncPHPFormatter, HTMLFormatter, PHPFormatter, PreFormatter, YAMLFormatter } from './formatters.js';

export abstract class DocumentFormatter {
    private htmlFormatter: HTMLFormatter | null = null;
    private asyncHtmlFormatter: AsyncHTMLFormatter | null = null;
    private asyncPhpFormatter: AsyncPHPFormatter | null = null;
    private yamlFormatter: YAMLFormatter | null = null;
    private phpFormatter: PHPFormatter | null = null;
    private preFormatter: PreFormatter | null = null;
    private transformOptions: TransformOptions | null = null;
    protected createExtraVirtualStructures = false;

    withTransformOptions(options: TransformOptions) {
        this.transformOptions = options;

        return this;
    }

    withPreFormatter(preFormatter: PreFormatter | null) {
        this.preFormatter = preFormatter;

        return this;
    }

    withHtmlFormatter(formatter: HTMLFormatter) {
        this.htmlFormatter = formatter;

        return this;
    }

    withAsyncHtmlFormatter(formatter: AsyncHTMLFormatter) {
        this.asyncHtmlFormatter = formatter;

        return this;
    }

    withYamlFormatter(formatter: YAMLFormatter) {
        this.yamlFormatter = formatter;

        return this;
    }

    withPhpFormatter(formatter: PHPFormatter) {
        this.phpFormatter = formatter;

        return this;
    }

    withAsyncPhpFormatter(formatter: AsyncPHPFormatter) {
        this.asyncPhpFormatter = formatter;

        return this;
    }

    formatText(text: string, settings: AntlersSettings): string {
        const document = new AntlersDocument();
        document.getDocumentParser().withChildDocuments(true);
        document.loadString(text);

        return this.formatDocument(document, settings);
    }

    async formatTextAsync(text: string, settings: AntlersSettings): Promise<string> {
        const document = new AntlersDocument();
        document.getDocumentParser().withChildDocuments(true);
        document.loadString(text);

        return await this.formatDocumentAsync(document, settings);
    }

    async formatDocumentAsync(document: AntlersDocument, currentSettings: AntlersSettings): Promise<string> {
        if (!document.isFormattingEnabled()) {
            return document.getOriginalContent();
        }

        let documentToFormat = document;

        const structureFragments = document.getDocumentParser()
            .getFragmentsContainingStructures();

        const structureMapping: Map<string, StructuralFragment> = new Map();

        if (structureFragments.length > 0) {
            let formatText = document.getOriginalContent();

            structureFragments.forEach((fragment) => {
                const slug = StringUtilities.makeSlug(64);
                formatText = formatText.replace(fragment.outerContent, slug);

                structureMapping.set(slug, fragment);
            });

            documentToFormat = AntlersDocument.fromText(formatText);
        }

        if (this.preFormatter != null) {
            const preformatResult = this.preFormatter(documentToFormat);

            if (preformatResult != null) {
                return preformatResult;
            }
        }

        const antlersNodes = documentToFormat.getAllAntlersNodes();

        for (let i = 0; i < antlersNodes.length; i++) {
            if (InterleavedNodeHandler.checkNode(antlersNodes[i], currentSettings).length > 0) {
                return document.getOriginalContent();
            }
        }

        if (this.asyncHtmlFormatter == null || documentToFormat.isValid() == false) {
            return documentToFormat.getOriginalContent();
        }

        documentToFormat.transform()
            .withAsyncInlineFormatter((content: string) => this.formatTextAsync(content, currentSettings))
            .produceExtraStructuralPairs(this.createExtraVirtualStructures)
            .withAsyncHtmlFormatter(this.asyncHtmlFormatter)
            .withAsyncPhpFormatter(this.asyncPhpFormatter)
            .withYamlFormatter(this.yamlFormatter);

        if (this.transformOptions != null) {
            documentToFormat.transform().withOptions(this.transformOptions);
        }

        const structure = documentToFormat.transform().toStructure(),
            formatted = await this.asyncHtmlFormatter(structure);

        let formattedDocument = await documentToFormat.transform().fromStructureAsync(formatted);

        if (structureFragments.length > 0) {
            formattedDocument = documentToFormat
                .transform()
                .applyFragmentReplacements(
                    formattedDocument,
                    structureMapping,
                    this.transformOptions?.tabSize ?? 4
                );
        }

        return formattedDocument;
    }

    formatDocument(document: AntlersDocument, currentSettings: AntlersSettings): string {
        if (!document.isFormattingEnabled()) {
            return document.getOriginalContent();
        }

        let documentToFormat = document;

        const structureFragments = document.getDocumentParser()
            .getFragmentsContainingStructures();

        const structureMapping: Map<string, StructuralFragment> = new Map();

        if (structureFragments.length > 0) {
            let formatText = document.getOriginalContent();

            structureFragments.forEach((fragment) => {
                const slug = StringUtilities.makeSlug(64);
                formatText = formatText.replace(fragment.outerContent, slug);

                structureMapping.set(slug, fragment);
            });

            documentToFormat = AntlersDocument.fromText(formatText);
        }

        if (this.preFormatter != null) {
            const preformatResult = this.preFormatter(documentToFormat);

            if (preformatResult != null) {
                return preformatResult;
            }
        }

        const antlersNodes = documentToFormat.getAllAntlersNodes();

        for (let i = 0; i < antlersNodes.length; i++) {
            if (InterleavedNodeHandler.checkNode(antlersNodes[i], currentSettings).length > 0) {
                return document.getOriginalContent();
            }
        }

        if (this.htmlFormatter == null || documentToFormat.isValid() == false) {
            return documentToFormat.getOriginalContent();
        }

        documentToFormat.transform()
            .withInlineFormatter((content: string) => this.formatText(content, currentSettings))
            .produceExtraStructuralPairs(this.createExtraVirtualStructures)
            .withHtmlFormatter(this.htmlFormatter)
            .withPhpFormatter(this.phpFormatter)
            .withYamlFormatter(this.yamlFormatter);

        if (this.transformOptions != null) {
            documentToFormat.transform().withOptions(this.transformOptions);
        }

        const structure = documentToFormat.transform().toStructure(),
            formatted = this.htmlFormatter(structure);

        let formattedDocument = documentToFormat.transform().fromStructure(formatted);

        if (structureFragments.length > 0) {
            formattedDocument = documentToFormat
                .transform()
                .applyFragmentReplacements(
                    formattedDocument,
                    structureMapping,
                    this.transformOptions?.tabSize ?? 4
                );
        }

        return formattedDocument;
    }
}