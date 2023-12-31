import { createDefinitionAlias } from '../../alias.js';
import CollectionPrevious from './previous.js';

const CollectionOlder = createDefinitionAlias(CollectionPrevious, 'collection:older'),
    CollectionNewer = createDefinitionAlias(CollectionPrevious, 'collection:newer');

export { CollectionOlder, CollectionNewer };
