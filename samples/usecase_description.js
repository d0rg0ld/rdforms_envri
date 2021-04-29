// Created by Doron Goldfarb, Environment Agency Austria, 2020
// This code has been created in the context of the ENVRI-FAIR project.
// ENVRI-FAIR received funding from the European Union’s Horizon 2020 research and innovation programme under grant agreement No 824068.

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
