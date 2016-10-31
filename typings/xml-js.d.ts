// Type definitions for xml-js
// Project: https://github.com/nashwaan/xml-js
// Definitions by: Denis Carriere <https://github.com/DenisCarriere>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module "xml-js" {
    interface Attribute {
        [key: string]: string
    }

    type Types = "comment" | "element" | "cdata" | "text"

    export interface ElementCompact {
        [key: string]: any
        _cdata?: string
        _comment?: string
        _text?: string
        _declaration?: DeclarationCompact
        _attributes?: Attribute
    }

    interface DeclarationCompact {
        _attributes: {
            version: string
            encoding: string
        }
    }

    export interface Element {
        type?: Types
        declaration?: Declaration
        name?: string
        text?: string
        elements?: Array<Element>
        attributes?: Attribute
    }

    interface Declaration {
        attributes: {
            version: string
            encoding: string
        }
    }

    interface XML2JSOptions extends ChangingKeyNames, IgnoreOptions {
        compact?: boolean
        trim?: boolean
        sanitize?: boolean
        nativeType?: boolean
        addParent?: boolean
        alwaysChildren?: boolean
    }

    interface JS2XMLOptions extends ChangingKeyNames, IgnoreOptions {
        spaces?: number
        compact?: boolean
        fullTagEmptyElement?: boolean
    }

    interface IgnoreOptions {
        ignoreDeclaration?: boolean
        ignoreAttributes?: boolean
        ignoreComment?: boolean
        ignoreCdata?: boolean
        ignoreText?: boolean
    }

    interface ChangingKeyNames {
        declarationKey?: string
        attributesKey?: string
        textKey?: string
        cdataKey?: string
        commentKey?: string
        parentKey?: string
        typeKey?: string
        nameKey?: string
        elementsKey?: string
    }

    interface JS2XMLOptionsCompact extends JS2XMLOptions {
        compact: true
    }

    export function js2xml(json: ElementCompact, options?: JS2XMLOptionsCompact): string
    export function json2xml(json: ElementCompact, options?: JS2XMLOptionsCompact): string
    export function js2xml(json: Element, options?: JS2XMLOptions): string
    export function json2xml(json: Element, options?: JS2XMLOptions): string
}