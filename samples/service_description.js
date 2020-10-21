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
});
