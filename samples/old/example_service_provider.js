import registerOntoChooser from './chooser/ontoChooser.js';
import rdfGraph from './serviceprovider_rdf.js'; // import a rdfjson graph
const itemStore = new rdforms.ItemStore();
//const graph = new rdfjson.Graph(rdfGraph);
const graph = new rdfjson.Graph(rdfGraph);

const bundles = [
  ['templates/dcterms.json'],
  ['templates/foaf.json'],
  ['templates/skos.json'],
  ['templates/adms.json'],
  ['templates/vcard.json'],
  ['templates/dcat_props.json'],
  ['templates/dcat.json'],
  ['templateBundle3.json'],
];

registerOntoChooser();

//get current key name
let keyname=Object.keys(graph._graph)[0];

let newk=keyname + uuidv4();

graph._graph[newk] = graph._graph[keyname];

delete(graph._graph[keyname]);



rdforms.bundleLoader(itemStore, bundles, function(bundles) {
  new rdforms.Editor({
    graph,
    resource: newk,
    template: itemStore.getItem('ENVRIProvider'),
    compact: true,
    includeLevel: 'optional'
  }, 'node1');
  var ta = document.getElementById('output');
  var updateOutput = function() {
    // Export RDF/XML
    ta.value = rdfjson.converters.rdfjson2rdfxml(graph);

    // Export RDF/JSON
    // ta.value = JSON.stringify(graph.exportRDFJSON(), null, "  ");
  };
  updateOutput();
  graph.onChange = updateOutput;
});
