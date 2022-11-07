import { ScopeEngine } from '../../antlers/scope/engine';
import { Scope } from '../../antlers/scope/scope';
import TagManager from '../../antlers/tagManagerInstance';
import { resolveTypedTree } from '../../antlers/tags';
import { IEnvironmentHelper, parseIdeHelper } from '../../idehelper/parser';
import { IProjectDetailsProvider } from '../../projects/projectDetailsProvider';
import { AbstractNode, AntlersNode, ChildDocument } from '../nodes/abstractNode';
import { Position } from "../nodes/position";
import { TagIdentifier } from "../nodes/tagIdentifier";
import { DocumentIndex } from '../parser/documentIndex';
import { DocumentParser } from "../parser/documentParser";
import { ContextResolver } from "./contexts/contextResolver";
import { PositionContext } from "./contexts/positionContext";
import { DocumentCursor } from "./documentCursor";
import { DocumentErrors } from "./documentErrors";
import { FrontMatterParser } from './frontMatter/frontMatterParser';
import { NodeScanner } from "./scanners/nodeScanner";
import { RangeScanner } from "./scanners/rangeScanner";
import { Transformer } from './transformer';
import { YamlDocument } from "./yamlDocument";

export class AntlersDocument {
    private documentParser: DocumentParser = new DocumentParser();
    private transformer: Transformer | null = null;
    private originalText: string = '';

    public readonly ranges: RangeScanner = new RangeScanner(this);
    public readonly nodes: NodeScanner = new NodeScanner(this);
    public readonly cursor: DocumentCursor = new DocumentCursor(this);
    public readonly errors: DocumentErrors = new DocumentErrors(this);
    public project: IProjectDetailsProvider | null = null;
    public documentUri = "";

    static fromText(text: string, project?: IProjectDetailsProvider | null) {
        const document = new AntlersDocument();

        if (typeof project != "undefined") {
            document.project = project;
        }

        return document.loadString(text);
    }

    static childFromText(text: string, seedPosition: Position | null = null): ChildDocument {
        const document = new AntlersDocument();
        
        if (seedPosition != null) {
            document.getDocumentParser().setSeedPosition(seedPosition);
        }

        document.getDocumentParser().withChildDocuments(true);
        document.loadString(text);

        return {
            renderNodes: document.getDocumentParser().getRenderNodes(),
            content: text,
            document: document
        };
    }

    isValid() {
        if (this.hasInvalidControlFlowStructures() || this.hasUnclosedStructures()) {
            return false;
        }

        return true;
    }

    getDocumentOptions(): IEnvironmentHelper | null {
        const nodes = this.getAllNodes();

        if (nodes.length == 0 || (nodes[0] instanceof AntlersNode) == false) {
            return null;
        }

        const checkNode = nodes[0] as AntlersNode;

        if (checkNode.isComment == false) {
            return null;
        }

        return parseIdeHelper(this.documentUri, checkNode);
    }

    isFormattingEnabled(): boolean {
        const options = this.getDocumentOptions();

        if (options == null) { return true; }

        return options.formatterEnabled;
    }

    hasInvalidControlFlowStructures() {
        return this.documentParser.hasUnclosedIfStructures();
    }

    hasUnclosedStructures() {
        return this.documentParser.hasUnclosedStructures();
    }

    getFrontMatterDoc(): YamlDocument | null {
        if (this.hasFrontMatter()) {
            const yamlDoc = new YamlDocument();
            yamlDoc.loadString(this.getFrontMatter());

            return yamlDoc;
        }

        return null;
    }

    hasFrontMatter() {
        return this.documentParser.getFrontMatter().trim().length > 0;
    }

    getFrontMatter() {
        return this.documentParser.getFrontMatter();
    }

    getFrontMatterScope(): Scope | null {
        if (this.project == null) {
            return null;
        }

        const frontMatterParser = new FrontMatterParser(this.project);
        frontMatterParser.parse(this.getFrontMatter());

        return frontMatterParser.getScope();
    }

    updateProject(project: IProjectDetailsProvider) {
        this.project = project;
        this.updateProjectDetails();
    }

    protected updateProjectDetails() {
        try {
            if (this.project != null) {
                const scopeEngine = new ScopeEngine(this.project, this.documentUri, this),
                    analysisNodes = this.documentParser.antlersNodes();

                analysisNodes.forEach((node) => {
                    if (this.project != null && TagManager.instance?.canResolveSpecialTypes(node.getTagName())) {
                        const specialResults = TagManager.instance?.resolveSpecialType(
                            node.getTagName(),
                            node,
                            this.project
                        );

                        if (specialResults.context != null) {
                            node.reference = specialResults.context;
                        }
                    }
                });

                scopeEngine.analyzeScope(analysisNodes);

                for (let i = 0; i < analysisNodes.length; i++) {
                    const node = analysisNodes[i];

                    if (node.hasParameters) {
                        for (let j = 0; j < node.parameters.length; j++) {
                            const thisParam = node.parameters[j];

                            if (thisParam.hasInterpolations()) {
                                for (let l = 0; l < thisParam.interpolations.length; l++) {
                                    const thisInterpolation = thisParam.interpolations[l];

                                    if (node.processedInterpolationRegions.has(thisInterpolation)) {
                                        const tInterpolation = node.processedInterpolationRegions.get(
                                            thisInterpolation
                                        ) as AbstractNode[];

                                        tInterpolation.forEach((interpolationNode) => {
                                            if (interpolationNode instanceof AntlersNode) {
                                                interpolationNode.currentScope = node.currentScope;
                                            }
                                        });
                                    }
                                }
                            }
                        }
                    }
                }

                resolveTypedTree(this);
            }
        } catch (err) {
            console.log(err);
        }
    }

    loadString(text: string) {
        this.originalText = text;
        this.documentParser.parse(text);

        this.updateProjectDetails();

        return this;
    }

    getDocumentParser() {
        return this.documentParser;
    }

    getParsedContent() {
        return this.documentParser.getParsedContent();
    }

    getAllNodes() {
        return this.documentParser.getNodes();
    }

    getAllAntlersNodes() {
        return this.documentParser.antlersNodes();
    }

    /**
     * Extracts all literal text from the Antlers document.
     */
    extractText(): string {
        const parts: string[] = [];

        this.nodes.getAllLiteralNodes().forEach((node) => {
            parts.push(node.content);
        });

        return parts.join("");
    }

    getNameAt(position: Position): TagIdentifier | null {
        const node = this.nodes.getNodeAt(position);

        if (node instanceof AntlersNode) {
            return node.name;
        }

        return null;
    }
    
    getLinesAround(line: number): Map<number, string> {
        return this.documentParser.getLinesAround(line);
    }

    getContent() {
        return this.documentParser.getContent();
    }

    getOriginalContent() {
        return this.documentParser.getOriginalContent();
    }

    reloadDocument() {
        this.loadString(this.originalText);
    }

    getFeaturesAt(position: Position | null): PositionContext | null {
        const node = this.nodes.getNodeAt(position);

        return ContextResolver.resolveContext(position, node, this, false, node);
    }

    getText(start: number, end: number) {
        return this.documentParser.getText(start, end);
    }

    charLeftAt(position: Position | null) {
        return this.documentParser.charLeftAt(position);
    }

    charAt(position: Position | null) {
        return this.documentParser.charAt(position);
    }

    charRightAt(position: Position | null) {
        return this.documentParser.charRightAt(position);
    }

    getLineIndex(lineNumber: number): DocumentIndex | null {
        return this.documentParser.getLineIndex(lineNumber);
    }

    getLineText(lineNumber: number): string | null {
        return this.documentParser.getLineText(lineNumber);
    }

    wordAt(position: Position | null, tabSize = 4) {
        return this.documentParser.wordAt(position, tabSize);
    }

    wordLeftAt(position: Position | null, tabSize = 4) {
        return this.documentParser.wordLeftAt(position, tabSize);
    }

    wordRightAt(position: Position | null, tabSize = 4) {
        return this.documentParser.wordRightAt(position, tabSize);
    }

    punctuationLeftAt(position: Position | null, tabSize = 4) {
        return this.documentParser.punctuationLeftAt(position, tabSize);
    }

    punctuationRightAt(position: Position | null, tabSize = 4) {
        return this.documentParser.punctuationRightAt(position, tabSize);
    }

    getLineChars(lineNumber: number): string[] | null {
        const lineText = this.getLineText(lineNumber);

        if (lineText != null) {
            return lineText.split("");
        }

        return null;
    }

    transform() {
        if (this.transformer == null) {
            this.transformer = new Transformer(this);
        }

        return this.transformer;
    }
}
