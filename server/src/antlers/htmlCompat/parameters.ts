import { IAntlersParameter } from '../tagManager.js';

function makeHtmlParam(name: string, description: string, mdnReference: string): IAntlersParameter {
    return {
        name: name,
        acceptsVariableInterpolation: true,
        aliases: [],
        allowsVariableReference: true,
        description: description,
        expectsTypes: ['string'],
        isDynamic: true,
        isRequired: false,
        documentationLink: mdnReference,
        docLinkName: 'MDN Reference'
    };
}

const HtmlClassParameter: IAntlersParameter = makeHtmlParam(
    'class', 'A space-separated list of the classes of the element.',
    'https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class'
);

const HtmlStyleParameter: IAntlersParameter = makeHtmlParam(
    'style', 'Contains CSS styling declarations to be applied to the element. Note that it is recommended for styles to be defined in a separate file or files.',
    'https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/style'
);

export {
    HtmlClassParameter, HtmlStyleParameter
};
