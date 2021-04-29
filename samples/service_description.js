// Created by Doron Goldfarb, Environment Agency Austria, 2020
// This code has been created in the context of the ENVRI-FAIR project.
// ENVRI-FAIR received funding from the European Union’s Horizon 2020 research and innovation programme under grant agreement No 824068.

//import registerOntoChooser from './chooser/ontoChooser.js';
import './common_comps.js';
const itemStore = new rdforms.ItemStore();

const bundles = [
  ['service_description_bundles.json'],
];

//registerOntoChooser();

let newk=Object.keys(window.graph._graph)[0];

rdforms.bundleLoader(itemStore, bundles, function(bundles) {
  new rdforms.Editor({
    graph,
    resource: newk,
    template: itemStore.getItem('ENVRIBasics'),
    compact: true,
    includeLevel: 'optional'
  }, 'node1');
  new rdforms.Editor({
    graph,
    resource: newk,
    template: itemStore.getItem('ENVRIClassification'),
    compact: true,
    includeLevel: 'optional'
  }, 'node2');
  new rdforms.Editor({
    graph,
    resource: newk,
    template: itemStore.getItem('ENVRIstatus'),
    compact: true,
    includeLevel: 'optional'
  }, 'node3');
  new rdforms.Editor({
    graph,
    resource: newk,
    template: itemStore.getItem('ENVRIorder'),
    compact: true,
    includeLevel: 'optional'
  }, 'node4');
  new rdforms.Editor({
    graph,
    resource: newk,
    template: itemStore.getItem('ENVRIsupport'),
    compact: true,
    includeLevel: 'optional'
  }, 'node5');
  new rdforms.Editor({
    graph,
    resource: newk,
    template: itemStore.getItem('ENVRIcontact'),
    compact: true,
    includeLevel: 'optional'
  }, 'node6');

//openGroup(null, 'node1');
});
