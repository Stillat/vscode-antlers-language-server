import { IAntlersParameter } from '../../../tagManager.js';

const FormHandleParam: IAntlersParameter = {
    name: 'in',
    description: 'The form to use',
    acceptsVariableInterpolation: true,
    aliases: ['handle', 'is', 'form', 'formset'],
    allowsVariableReference: true,
    expectsTypes: ['string'],
    isDynamic: false,
    isRequired: false
};

export default FormHandleParam;
