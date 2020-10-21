const jQuery = require('jquery');
import registerOntoChooser from './chooser/ontoChooser.js';
import rdfGraph from './swosoftware_rdf.js'; // import a rdfjson graph
import './common_comps.js';
import { parseQuery, initGraph } from './common_comps.js';
const itemStore = new rdforms.ItemStore();
//const graph = new rdfjson.Graph(rdfGraph);


var parastring = document.URL.replace(/^[^\?]+\??/,'');

var params = parseQuery( parastring );
window.uri=null;
/*
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
*/
/*
function Get(yourUrl){
	var Httpreq = new XMLHttpRequest(); // a new request
	Httpreq.open("GET",yourUrl,false);
	Httpreq.send(null);
	return Httpreq.responseText;
}
*/
/*
function initGraph(rdfGraph) {
	var graph=new rdfjson.Graph(rdfGraph);
	//get current key name
	let keyname=Object.keys(graph._graph)[0];

	let newk=keyname + uuidv4();

	graph._graph[newk] = graph._graph[keyname];

	delete(graph._graph[keyname]);

	return graph
}*/

window.graph = null;
window.termgraph = new rdfjson.Graph({});
if ("uri" in params) {
	//var query = "http://90.147.102.53/sparql?default-graph-dri=&query=select+%28%3C" + params["uri"] + "%3E+as+%3Fs%29+%3Fp+%3Fo+isiri%28%3Fo%29+where+%7B+%3C" + params["uri"] + "%3E+%3Fp+%3Fo+%7D&format=text%2Ftab-separated-values&timeout=0&debug=on&run=+Run+Query+"
	//var query = "http://90.147.102.53/sparql?default-graph-uri=&query=select+%28%3C" + params["uri"] + "%3E+as+%3Fs%29+%3Fp+%3Fo+isiri%28%3Fo%29+where+%7B+%3C" + params["uri"] + "%3E+%3Fp+%3Fo+%20+%2E+%20+%20+%7D&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on&run=+Run+Query+"
	//var query = "http://90.147.102.53/sparql?default-graph-uri=&query=select+%3Fs+%3Fp+%3Fo+where+%7B+%7B+%3C" + params["uri"] + "%3E+%3Fp+%3Fo+.+%3Fs+%3Fp+%3Fo+.+FILTER+%28%3Fs+%3D+%3C" + params["uri"] + "%3E+%29%7D+%0D%0AUNION+%7B+<http%3A%2F%2Fenvri.eu%2Fservice%2Fa44dc3f9-ab08-49c1-826f-59f0c471371a>+%3Fp1+%3Fs+.+%3Fs+%3Fp+%3Fo+.+FILTER+%28isBlank%28%3Fs%29%29+%7D+%7D&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on&run=+Run+Query+"
	var query = "http://90.147.102.53/sparql?default-graph-uri=&query=select+%3Fs+%3Fp+%3Fo+where+%7B+%7B+%3C" + params["uri"] + "%3E+%3Fp+%3Fo+.+%3Fs+%3Fp+%3Fo+.+FILTER+%28%3Fs+%3D+%3C" + params["uri"] + "%3E+%29%7D+%0D%0AUNION+%7B+%3C" + params["uri"] + "%3E+%3Fp1+%3Fs+.+%3Fs+%3Fp+%3Fo+.+FILTER+%28isBlank%28%3Fs%29%29+%7D+%7D&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on&run=+Run+Query+"
	var rdfdata_raw=JSON.parse(Get(query));
	var res=rdfdata_raw["results"]["bindings"];
	if (res.length > 0) {
		window.uri=params["uri"];
		window.graph=new rdfjson.Graph({});
		for (var i = 1; i < res.length; i++) {
			//var elements_raw=rdfdata_raw[i];
			//var elements=elements_raw.split("\t");
			//try {
			
				if (res[i]["o"]["type"]=="uri" || res[i]["o"]["type"]=="bnode")
					window.graph.add(res[i]["s"]["value"], 
						  res[i]["p"]["value"],
						  res[i]["o"]["value"]);
				else
					window.graph.addL(res[i]["s"]["value"], 
						   res[i]["p"]["value"],
						   res[i]["o"]["value"]);
			//}
			//catch (e) {
			//	console.log("FAILED STATEMENT FOR " + elements);
			//}
		} 
	}  else window.graph=initGraph(rdfGraph);
}  else window.graph=initGraph(rdfGraph);

window.is=itemStore;

/*
window.choiceStore = {};

var body = jQuery(document.body);
window.blockDiv=jQuery("<div id='dummyDiv'/>").hide();
body.prepend(window.blockDiv);
window.blockDiv.css({position:"absolute",  "z-index": 1, height: body.height(), width: body.width(), background: "#000", opacity: 0.5});
jQuery(window).on('load resize', function(){
    jQuery('#dummyDiv').width(jQuery(this).width());
    jQuery('#dummyDiv').height(jQuery(this).height());
});
*/

console.log(window.graph);

const bundles = [
  ['templates/dcterms.json'],
  ['templates/foaf.json'],
  ['templates/skos.json'],
  ['templates/adms.json'],
  ['templates/vcard.json'],
  ['templates/dcat_props.json'],
  ['templates/dcat.json'],
  ['softwareTemplate.json'],
];




registerOntoChooser();

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
  var ta = document.getElementById('output');
  var updateOutput = function() {
    // Export RDF/XML
    ta.value = rdfjson.converters.rdfjson2rdfxml(window.graph);

    // Export RDF/JSON
    // ta.value = JSON.stringify(graph.exportRDFJSON(), null, "  ");
  };
  var term_ta = document.getElementById('termoutput');
  var updateTermOutput = function() {
    // Export RDF/XML
    term_ta.value = rdfjson.converters.rdfjson2rdfxml(window.termgraph);

    // Export RDF/JSON
    // ta.value = JSON.stringify(graph.exportRDFJSON(), null, "  ");
  };
  updateOutput();
  window.graph.onChange = updateOutput;
  updateTermOutput();
  window.termgraph.onChange = updateTermOutput;
});
