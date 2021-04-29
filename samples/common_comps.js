// Created by Doron Goldfarb, Environment Agency Austria, 2020
// This code has been created in the context of the ENVRI-FAIR project.
// ENVRI-FAIR received funding from the European Union’s Horizon 2020 research and innovation programme under grant agreement No 824068.
import registerOntoChooser from './chooser/ontoChooser.js';
var jQuery = require('jquery');

export function Get(yourUrl){
                        var Httpreq = new XMLHttpRequest(); // a new request
                        Httpreq.open("GET",yourUrl,false);
                        Httpreq.send(null);
                        return Httpreq.responseText;
                }

function loadOptions(graph, type) {
	var options=JSON.parse(Get( window.SPARQLURI+"?default-graph-uri=" + graph + "&query=construct+%7B+%3Fs+rdfs%3Alabel+++%3Fl+%7D+where+%7B+%3Fs+rdf%3Atype+%3C" + type + "%3E+.+%3Fs+rdfs%3Alabel+%3Fl+%7D&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on&run=+Run+Query+"));
	var keys=options["results"]["bindings"];
	var selEle=document.getElementById('uri');
	selEle.size=1;
	//selEle.size=keys.length;
	for (var i=0; i < keys.length; i++) {
		selEle.options[i]=new Option(keys[i]["o"]["value"], keys[i]["s"]["value"]);
	}
}

export function parseQuery ( query ) {
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



export function initGraph(rdfGraph) {
        var graph=new rdfjson.Graph(rdfGraph);
        //get current key name
        let keyname=Object.keys(graph._graph)[0];

        let newk=Get(window.idSrvURI+"/create?prefix="+keyname);

        graph._graph[newk] = graph._graph[keyname];

        delete(graph._graph[keyname]);

        return graph
}


var loaderResetter=jQuery('#loader_resetter').load('common/common_html_loadReset.html');
jQuery(function() {
	jQuery("#loadExistingInstForm").click(function(){
        	               return loadOptions(window.contentGraphname, window.contentType);
	});
});
var submitRdfSection=jQuery('#submitRdfSection').load('common/common_html_submitRdf.html');
/*
jQuery(function() {
	jQuery("#submitRdfForm").click(function(){
        	               return submitRdf();
	});
});
*/

var parastring = document.URL.replace(/^[^\?]+\??/,'');

window.params = parseQuery( parastring );
window.uri=null;

window.graph = null;
window.termgraph =  new rdfjson.Graph({}) ;

// Load the default 
var jstext=Get(window.rdfSkele);
window.rdfGraph=JSON.parse(jstext);

if ("uri" in window.params) {
        var query = window.SPARQLURI + "?default-graph-uri=&query=select+%3Fs+%3Fp+%3Fo+where+%7B+%7B+%3C" + window.params["uri"] + "%3E+%3Fp+%3Fo+.+%3Fs+%3Fp+%3Fo+.+FILTER+%28%3Fs+%3D+%3C" + window.params["uri"] + "%3E+%29%7D+%0D%0AUNION+%7B+%3C" + window.params["uri"] + "%3E+%3Fp1+%3Fs+.+%3Fs+%3Fp+%3Fo+.+FILTER+%28isBlank%28%3Fs%29%29+%7D+%7D&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on&run=+Run+Query+"
        var rdfdata_raw=JSON.parse(Get(query));
        var res=rdfdata_raw["results"]["bindings"];
        if (res.length > 0) {
                window.uri=window.params["uri"];
                window.graph=new rdfjson.Graph({});
                for (var i = 0; i < res.length; i++) {
                                if (res[i]["o"]["type"]=="uri" || res[i]["o"]["type"]=="bnode")
                                        window.graph.add(res[i]["s"]["value"],
                                                  res[i]["p"]["value"],
                                                  res[i]["o"]["value"]);
                                else
                                        window.graph.addL(res[i]["s"]["value"],
                                                   res[i]["p"]["value"],
                                                   res[i]["o"]["value"]);
                }
        }  else window.graph=initGraph(window.rdfGraph);
}  else window.graph=initGraph(window.rdfGraph);


console.log(window.graph);

// do some additional init stuff


window.choiceStore = {};

var body = jQuery(document.body);
window.blockDiv=jQuery("<div id='dummyDiv'/>").hide();
body.prepend(window.blockDiv);
window.blockDiv.css({position:"absolute",  "z-index": 1, height: body.height(), width: body.width(), background: "#000", opacity: 0.5});
jQuery(window).on('load resize', function(){
    jQuery('#dummyDiv').width(jQuery(this).width());
    jQuery('#dummyDiv').height(jQuery(this).height());
});

registerOntoChooser();
jQuery(function(){

 	//var ta = document.getElementById('output');
  	var updateOutput = function() {
    		// Export RDF/XML
	
		try {	
			if(window.graph!=null)
    				jQuery('#output').val(rdfjson.converters.rdfjson2rdfxml(window.graph));
		} catch (e) {
			console.log("updateOutput error: " + e);
		}
  	};
  	//var term_ta = document.getElementById('termoutput');
  	var updateTermOutput = function() {
    	// Export RDF/XML
		try {
			if(window.termgraph!=null)
    				jQuery('#termoutput').val(rdfjson.converters.rdfjson2rdfxml(window.termgraph));
		} catch (e) {
			console.log("updateTermOutput error: " + e);
		}
    		// Export RDF/JSON
    		// ta.value = JSON.stringify(graph.exportRDFJSON(), null, "  ");
  	};
  	window.graph.onChange = updateOutput;
  	window.termgraph.onChange = updateTermOutput;
  	updateOutput();
  	updateTermOutput();
});
/*
jQuery(function(){
	jQuery("#submitRdfForm").click(function(){
        	               return submitRdf();
	});
});
*/

