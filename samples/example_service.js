import registerOntoChooser from './chooser/ontoChooser.js';
import rdfGraph from './service_rdf.js'; // import a rdfjson graph
const itemStore = new rdforms.ItemStore();
//const graph = new rdfjson.Graph(rdfGraph);


var parastring = document.URL.replace(/^[^\?]+\??/,'');

var params = parseQuery( parastring );

function parseQuery ( query ) {
   var Params = new Object ();
   if ( ! query ) return Params; // return empty object
   var Pairs = query.split(/[;&]/);
   for ( var i = 0; i < Pairs.length; i++ ) {
      var KeyVal = Pairs[i].split('=');
      if ( ! KeyVal || KeyVal.length != 2 ) continue;
      var key = unescape( KeyVal[0] );
      var val = unescape( KeyVal[1] );
      val = val.replace(/\+/g, ' ');
      Params[key] = val;
   }
   return Params;
}

function Get(yourUrl){
	var Httpreq = new XMLHttpRequest(); // a new request
	Httpreq.open("GET",yourUrl,false);
	Httpreq.send(null);
	return Httpreq.responseText;
}

function initGraph(rdfGraph) {
	var graph=new rdfjson.Graph(rdfGraph);
	//get current key name
	let keyname=Object.keys(graph._graph)[0];

	let newk=keyname + uuidv4();

	graph._graph[newk] = graph._graph[keyname];

	delete(graph._graph[keyname]);

	return graph
}

var graph = null;
if ("uri" in params) {
	//var query = "http://90.147.102.53/sparql?default-graph-uri=&query=select+%28%3C" + params["uri"] + "%3E+as+%3Fs%29+%3Fp+%3Fo+isiri%28%3Fo%29+where+%7B+%3C" + params["uri"] + "%3E+%3Fp+%3Fo+%7D&format=text%2Ftab-separated-values&timeout=0&debug=on&run=+Run+Query+"
	//var query = "http://90.147.102.53/sparql?default-graph-uri=&query=select+%28%3C" + params["uri"] + "%3E+as+%3Fs%29+%3Fp+%3Fo+isiri%28%3Fo%29+where+%7B+%3C" + params["uri"] + "%3E+%3Fp+%3Fo+%20+%2E+%20+%20+%7D&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on&run=+Run+Query+"
	var query = "http://90.147.102.53/sparql?default-graph-uri=&query=select+%3Fs+%3Fp+%3Fo+where+%7B+%7B+%3C" + params["uri"] + "%3E+%3Fp+%3Fo+.+%3Fs+%3Fp+%3Fo+.+FILTER+%28%3Fs+%3D+%3C" + params["uri"] + "%3E+%29%7D+%0D%0AUNION+%7B+<http%3A%2F%2Fenvri.eu%2Fservice%2Fa44dc3f9-ab08-49c1-826f-59f0c471371a>+%3Fp1+%3Fs+.+%3Fs+%3Fp+%3Fo+.+FILTER+%28isBlank%28%3Fs%29%29+%7D+%7D&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on&run=+Run+Query+"
	var rdfdata_raw=JSON.parse(Get(query));
	var res=rdfdata_raw["results"]["bindings"];
	if (res.length > 0) {
		graph=new rdfjson.Graph({});
		for (var i = 1; i < res.length; i++) {
			//var elements_raw=rdfdata_raw[i];
			//var elements=elements_raw.split("\t");
			//try {
			
				if (res[i]["o"]["type"]=="uri" || res[i]["o"]["type"]=="bnode")
					graph.add(res[i]["s"]["value"], 
						  res[i]["p"]["value"],
						  res[i]["o"]["value"]);
				else
					graph.addL(res[i]["s"]["value"], 
						   res[i]["p"]["value"],
						   res[i]["o"]["value"]);
			//}
			//catch (e) {
			//	console.log("FAILED STATEMENT FOR " + elements);
			//}
		} 
	}  else graph=initGraph(rdfGraph);
}  else graph=initGraph(rdfGraph);


console.log(graph);

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

let newk=Object.keys(graph._graph)[0];

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
