export interface XMLNodeAttributes {
  [key: string]: string;
}

export interface XMLNode {
  [key: string]: XMLList;
  ['#text']: string;
  [':@']: XMLNodeAttributes;
}

export type XMLList = XMLNode[];

declare module 'fast-xml-parser' {
  export class XMLParser {
    constructor(params: { preserveOrder: boolean } = {});
    parse(text: string): XMLList;
  }

  export class XMLBuilder {
    constructor(params = {});
    build(node: XMLNode): string;
  }
}
