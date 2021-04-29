// Created by Doron Goldfarb, Environment Agency Austria, 2020
// This code has been created in the context of the ENVRI-FAIR project.
// ENVRI-FAIR received funding from the European Union’s Horizon 2020 research and innovation programme under grant agreement No 824068.

import './common_comps.js';
const itemStore = new rdforms.ItemStore();

const bundles = [
/*
  ['templates/dcterms.json'],
  ['templates/foaf.json'],
  ['templates/skos.json'],
  ['templates/adms.json'],
  ['templates/vcard.json'],
  ['templates/dcat_props.json'],
  ['templates/dcat.json'],*/
  ['software_description_bundle.json'],
];

let newk=Object.keys(window.graph._graph)[0];

rdforms.bundleLoader(itemStore, bundles, function(bundles) {
  new rdforms.Editor({
    graph,
    resource: newk,
    template: itemStore.getItem('SWOSoftwareBasics'),
    compact: true,
    includeLevel: 'optional'
  }, 'node1');
  new rdforms.Editor({
    graph,
    resource: newk,
    template: itemStore.getItem('SWOSoftwareDevelPublish'),
    compact: true,
    includeLevel: 'optional'
  }, 'node2');
  new rdforms.Editor({
    graph,
    resource: newk,
    template: itemStore.getItem('SWOSoftwareTechFeatures'),
    compact: true,
    includeLevel: 'optional'
  }, 'node3');
  new rdforms.Editor({
    graph,
    resource: newk,
    template: itemStore.getItem('SWOSoftwareFeatures'),
    compact: true,
    includeLevel: 'optional'
  }, 'node4');
});
