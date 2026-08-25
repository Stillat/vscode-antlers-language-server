import { AntlersDocument } from '../runtime/document/antlersDocument.js';
import TagManager from '../antlers/tagManagerInstance.js';
import { assertCount, assertFalse, assertTrue } from './testUtils/assertions.js';

suite("Tag Manager Tests", () => {
    test("it categorizes nodes", () => {
        const nodes = (AntlersDocument.fromText('{{ collection:articles }}{{ title }}{{ /collection:articles }}')).getAllAntlersNodes();

        assertCount(3, nodes);
        assertTrue(nodes[0].isTagNode);
        assertFalse(nodes[1].isTagNode);
        assertTrue(nodes[2].isTagNode);
    });

    test("it recognizes modern core tag forms", () => {
        const manager = TagManager.instance;

        assertTrue(manager?.isKnownTag('dictionary:countries') ?? false);
        assertTrue(manager?.isKnownTag('get_site:english') ?? false);
        assertTrue(manager?.isKnownTag('can:edit_entries') ?? false);
        assertTrue(manager?.isKnownTag('user:passkey_form') ?? false);
        assertFalse(manager?.isKnownTag('component_proxy') ?? true);
    });

    test("it reports pair requirements for explicit methods", () => {
        const manager = TagManager.instance;

        assertTrue(manager?.findTag('form:fields')?.requiresClose ?? false);
        assertTrue(manager?.findTag('glide:generate')?.requiresClose ?? false);
        assertFalse(manager?.findTag('glide:data_uri')?.requiresClose ?? true);
        assertFalse(manager?.findTag('vite:content')?.requiresClose ?? true);
    });

    test("it offers registered user methods", () => {
        const methods = TagManager.instance?.getPossibleTagMethods('user') ?? [];

        assertTrue(methods.includes('login_form'));
        assertTrue(methods.includes('passkey_form'));
        assertTrue(methods.includes('two_factor_setup_form'));
    });
});
