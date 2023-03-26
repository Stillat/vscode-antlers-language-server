import { AntlersSettings } from '../antlersSettings';
import InterleavedNodeHandler from '../diagnostics/handlers/interleavedNodes';
import { AntlersDocument } from '../runtime/document/antlersDocument';
import { TransformOptions } from '../runtime/document/transformOptions';
import { HTMLFormatter, PHPFormatter, PreFormatter, YAMLFormatter } from './formatters';

export abstract class DocumentFormatter {
    private htmlFormatter: HTMLFormatter | null = null;
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

    withYamlFormatter(formatter: YAMLFormatter) {
        this.yamlFormatter = formatter;

        return this;
    }

    withPhpFormatter(formatter: PHPFormatter) {
        this.phpFormatter = formatter;

        return this;
    }

    formatText(text: string, settings: AntlersSettings): string {
        const document = new AntlersDocument();
        document.getDocumentParser().withChildDocuments(true);
        document.loadString(text);

        return this.formatDocument(document, settings);
    }

    formatDocument(document: AntlersDocument, currentSettings: AntlersSettings): string {
        if (!document.isFormattingEnabled()) {
            return document.getOriginalContent();
        }

        if (this.preFormatter != null) {
            const preformatResult = this.preFormatter(document);

            if (preformatResult != null) {
                return preformatResult;
            }
        }

        const antlersNodes = document.getAllAntlersNodes();

        for (let i = 0; i < antlersNodes.length; i++) {
            if (InterleavedNodeHandler.checkNode(antlersNodes[i], currentSettings).length > 0) {
                return document.getOriginalContent();
            }
        }

        if (this.htmlFormatter == null || document.isValid() == false) {
            return document.getOriginalContent();
        }

        document.transform()
            .withInlineFormatter((content: string) => this.formatText(content, currentSettings))
            .produceExtraStructuralPairs(this.createExtraVirtualStructures)
            .withHtmlFormatter(this.htmlFormatter)
            .withPhpFormatter(this.phpFormatter)
            .withYamlFormatter(this.yamlFormatter);

        if (this.transformOptions != null) {
            document.transform().withOptions(this.transformOptions);
        }

        const structure = document.transform().toStructure(),
            formatted = this.htmlFormatter(structure);

        return document.transform().fromStructure(formatted);
    }
}