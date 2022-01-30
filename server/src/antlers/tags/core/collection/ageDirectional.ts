import { createDefinitionAlias } from '../../alias';
import CollectionPrevious from './previous';

const CollectionOlder = createDefinitionAlias(CollectionPrevious, 'collection:older'),
    CollectionNewer = createDefinitionAlias(CollectionPrevious, 'collection:newer');

export { CollectionOlder, CollectionNewer };
