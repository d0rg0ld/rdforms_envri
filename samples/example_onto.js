import registerOntoChooser from './chooser/ontoChooser.js';
import rdfGraph from './rdf.js'; // import a rdfjson graph
const itemStore = new rdforms.ItemStore();
const graph = new rdfjson.Graph(rdfGraph);
const bundles = [
  ['templates/dcterms.json'],
  ['templates/foaf.json'],
  ['templates/skos.json'],
  ['templates/adms.json'],
  ['templates/vcard.json'],
  ['templates/dcat_props.json'],
  ['templates/dcat.json'],
  ['templateBundle4.json'],
];

registerOntoChooser();



rdforms.bundleLoader(itemStore, bundles, function(bundles) {
  new rdforms.Editor({
    graph,
    resource: 'http://example.org/about',
    template: itemStore.getItem('ENVRIClassification'),
    compact: true,
    includeLevel: 'optional'
  }, 'node');
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
