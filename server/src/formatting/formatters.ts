import { AntlersDocument } from '../runtime/document/antlersDocument.js';

export type HTMLFormatter = (input: string) => string;
export type AsyncHTMLFormatter = (input: string) => Promise<string>;
export type YAMLFormatter = (input: string) => string;
export type PHPFormatter = (input: string) => string;
export type AsyncPHPFormatter = (input: string) => Promise<string>;
export type PreFormatter = (document: AntlersDocument) => string | null;