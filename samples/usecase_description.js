const itemStore = new rdforms.ItemStore();
import './common_comps.js';


const bundles = [
  ['usecase_description_bundle.json'],
/*  ['templates/foaf.json'],
  ['templates/skos.json'],
  ['templates/adms.json'],
  ['templates/vcard.json'],
  ['templates/dcat_props.json'],
  ['templates/dcat.json'],
  ['serviceDescriptionBundles.json'] */
];





let newk=Object.keys(window.graph._graph)[0];

rdforms.bundleLoader(itemStore, bundles, function(bundles) {
  new rdforms.Editor({
    graph,
    resource: newk,
    template: itemStore.getItem('UseCaseBasics'),
    compact: true,
    includeLevel: 'optional'
  }, 'node1');
});
