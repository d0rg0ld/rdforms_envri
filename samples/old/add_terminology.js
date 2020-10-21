import registerOntoChooser from './chooser/termChooser.js';
import rdfGraph from './add_terminology_rdf.js'; // import a rdfjson graph
const jquery = require('jquery');
///const json = require('json3');
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

window.graph = null;
if ("uri" in params) {
	//var query = "http://90.147.102.53/sparql?default-graph-uri=&query=select+%28%3C" + params["uri"] + "%3E+as+%3Fs%29+%3Fp+%3Fo+isiri%28%3Fo%29+where+%7B+%3C" + params["uri"] + "%3E+%3Fp+%3Fo+%7D&format=text%2Ftab-separated-values&timeout=0&debug=on&run=+Run+Query+"
	//var query = "http://90.147.102.53/sparql?default-graph-uri=&query=select+%28%3C" + params["uri"] + "%3E+as+%3Fs%29+%3Fp+%3Fo+isiri%28%3Fo%29+where+%7B+%3C" + params["uri"] + "%3E+%3Fp+%3Fo+%20+%2E+%20+%20+%7D&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on&run=+Run+Query+"
	//var query = "http://90.147.102.53/sparql?default-graph-uri=&query=select+%3Fs+%3Fp+%3Fo+where+%7B+%7B+%3C" + params["uri"] + "%3E+%3Fp+%3Fo+.+%3Fs+%3Fp+%3Fo+.+FILTER+%28%3Fs+%3D+%3C" + params["uri"] + "%3E+%29%7D+%0D%0AUNION+%7B+<http%3A%2F%2Fenvri.eu%2Fservice%2Fa44dc3f9-ab08-49c1-826f-59f0c471371a>+%3Fp1+%3Fs+.+%3Fs+%3Fp+%3Fo+.+FILTER+%28isBlank%28%3Fs%29%29+%7D+%7D&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on&run=+Run+Query+"
	var query = "http://90.147.102.53/sparql?default-graph-uri=&query=select+%3Fs+%3Fp+%3Fo+where+%7B+%7B+%3C" + params["uri"] + "%3E+%3Fp+%3Fo+.+%3Fs+%3Fp+%3Fo+.+FILTER+%28%3Fs+%3D+%3C" + params["uri"] + "%3E+%29%7D+%0D%0AUNION+%7B+%3C" + params["uri"] + "%3E+%3Fp1+%3Fs+.+%3Fs+%3Fp+%3Fo+.+FILTER+%28isBlank%28%3Fs%29%29+%7D+%7D&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on&run=+Run+Query+"
	var rdfdata_raw=JSON.parse(Get(query));
	var res=rdfdata_raw["results"]["bindings"];
	if (res.length > 0) {
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


console.log(window.graph);

const bundles = [
  ['templates/dcterms.json'],
  ['templates/foaf.json'],
  ['templates/skos.json'],
  ['templates/adms.json'],
  ['templates/vcard.json'],
  ['templates/dcat_props.json'],
  ['templates/dcat.json'],
  ['addTerminologyTemplate.json'],
];




registerOntoChooser();

let newk=Object.keys(window.graph._graph)[0];

//import templateTemplate from './addTerminologyTemplate.json';
const templateTemplate = `
{
  "root": "TermrootEnvri2",
  "namespaces": {
    "ex": "http://example.com/",
    "cc": "http://creativecommons.org/licenses/"
  },
  "templates": [
    {
      "id": "TerminologyRoot2",
      "type": "group",
      "items": [
        {
          "id":"termroot2",
          "type": "choice",
          "nodetype": "RESOURCE",
          "property": "http://tempadmin/root",
          "cardinality": {
            "min": 1,
            "max": 1,
            "pref": "1"
          },
          "constraints": {},
          "OntologyUrl": "http://localhost:8080/eosc_voc.rdf",
          "parentProperty": "http://www.w3.org/2004/02/skos/core#narrower",
          "hierarchyProperty": "http://www.w3.org/2004/02/skos/core#broader",
          "label": {
            "en": "Term root"
          },
          "description": {
            "en": "The root for the term to be added"
          },
                  "styles": [
            "multiline"
          ]
        }
        ]
    }
  ]
}
`;

var counter=1;
var curPar="root-term";
function addChild (params) {
	console.log(params.params.data);
	var bundle = JSON.parse(templateTemplate);
	bundle.templates[0].id="level"+counter;
	counter+=1;
	bundle.templates[0].constraints={"http://www.w3.org/2000/01/rdf-schema#subClassOf":params.params.data.id}
	console.log(bundle);
	var parent = document.getElementById(curPar);
	var gridItem=document.createElement("div");
	gridItem.setAttribute("class", "grid-item");
	gridItem.setAttribute("style", "width:640px;grid-column:" + (counter) + ";");
	var gridNode=document.createElement("div");
	gridNode.setAttribute("id", "node"+ (counter));
	gridItem.appendChild(gridNode);
	parent.appendChild(gridItem);
	var bundleReg = itemStore.registerBundle({source: bundle});
  	new rdforms.Editor({
  	  graph,
  	  resource: newk,
  	  template: itemStore.getItem(bundle.templates[0].id),
  	  compact: true,
  	  includeLevel: 'optional'
  	}, 'node'+(counter));

	
};

rdforms.bundleLoader(itemStore, bundles, function(bundles) {
  new rdforms.Editor({
    graph,
    resource: newk,
    template: itemStore.getItem('TerminologyRoot'),
    compact: true,
    includeLevel: 'optional'
  }, 'node1');
  var ta = document.getElementById('output');
  var updateOutput = function() {
    // Export RDF/XML
    ta.value = rdfjson.converters.rdfjson2rdfxml(window.graph);

    // Export RDF/JSON
    // ta.value = JSON.stringify(graph.exportRDFJSON(), null, "  ");
  };
  updateOutput();
  window.graph.onChange = updateOutput;

  //jquery("select.select2-hidden-accessible.mismatch").on("select2:select", (params) => { console.log(params)});  
  jquery("select.select2-hidden-accessible").on("select2:select", (params) => { addChild(params)});  

});



