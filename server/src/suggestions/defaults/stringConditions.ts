import { ICompletionCondition } from './conditionItems.js';

const StringConditionItems: ICompletionCondition[] = [
    { name: 'is', description: 'Tests if a field is equal to a value' },
    { name: 'equals', description: 'Tests if a field is equal to a value' },
    { name: 'not', description: 'Tests if a field is not equal to a value' },
    { name: 'isnt', description: 'Tests if a field is not equal to a value' },
    { name: 'exists', description: 'Tests if a field exists' },
    { name: 'isset', description: 'Tests if a field exists' },
    { name: 'doesnt_exist', description: 'Tests if a field does not exist' },
    { name: 'is_empty', description: 'Tests if a field does not exist' },
    { name: 'null', description: 'Tests if a field does not exist' },
    { name: 'contains', description: 'Tests if a field contains a value' },
    { name: 'doesnt_contain', description: 'Tests if a field does not contain a value' },
    { name: 'in', description: 'Tests if a value is in an array' },
    { name: 'not_in', description: 'Tests if an array does not contain a value' },
    { name: 'starts_with', description: 'Tests if a field starts with a value' },
    { name: 'doesnt_start_with', description: 'Tests if a field does not start with a value' },
    { name: 'ends_with', description: 'Tests if a field ends with a value' },
    { name: 'doesnt_end_with', description: 'Tests if a field does not end with a value' },
    { name: 'gt', description: 'Tests if a field is greater than a value' },
    { name: 'lt', description: 'Tests if a field is less than a value' },
    { name: 'gte', description: 'Tests if a field is greater than or equal to a value' },
    { name: 'lte', description: 'Tests if a field is less than or equal to a value' },
    { name: 'matches', description: 'Tests if a field matches a case insensitive regex' },
    { name: 'regex', description: 'Tests if a field matches a case insensitive regex' },
    { name: 'doesnt_match', description: 'Tests if a field does not match a case insensitive regex' },
    { name: 'is_alpha', description: 'Tests if a field contains only alphabetical characters' },
    { name: 'is_numeric', description: 'Tests if a field contains only numeric characters' },
    { name: 'is_alpha_numeric', description: 'Tests if a field contains only alpha-numeric characters' },
    { name: 'is_url', description: 'Tests if a field is a valid URL' },
    { name: 'is_embeddable', description: 'Tests if a field is an embeddable video URL' },
    { name: 'is_email', description: 'Tests if a field is a valid email address' },
    { name: 'is_after', description: 'Tests if a field is after a given date' },
    { name: 'is_before', description: 'Tests if a field is before a given date' },
];

export { StringConditionItems };
