const jquery = require('jquery');
const xhr = require('dojo/request/xhr');
import data from './data.js';
//import { i18n, NLSMixin } from 'esi18n';
//import { escape } from 'lodash-es';
const template = '<div>OVERLAY</div>';

let firstSearch=true;
 

function findNested(obj, key) {
  // Base case
  if (key in obj) {
    return obj[key];
  } else {
    for (var i = 0, len = Object.keys(obj).length; i < len; i++) {
      if (typeof obj[i] == 'object') {
        var found = this.findNested(obj[i], key);
        if (found) {
          // If the object was found in the recursive call, bubble it up.
          return found;
        }
      }
    }
  }
}

const renderingContext = window.rdforms.renderingContext;

const entryChooser = {
	templateString: template,
	binding: null,
	onSelect: null,
	show(binding, onSelect) {
		this.binding = binding;
		this.onSelect = onSelect;
		this.dialog.show();
	}	
};



/**
 * A chooser is a handler for a select input in RDForms choice items.
 * A chooser can manage the searching, presentation and selection of a select (choice) item.
 *  The user registration happens via the renderingContext. See the default exported funciton
 */

/**
 *
 * @type {{show(*, *): void, search(*, *): *}}
 */
const chooserConfiguration = {
  /**
   * Returns a choice object containing a value and a label.
   * Override this function to provide specific loading of a choice.
   * If you need to do this asynchonously provide a "load" method on the returned choice object.
   *
   * @param item
   * @param value
   * @returns {{value: *, load(*)}}
   */

   


   getChoice(item, value) {
   },



  /**
   * You can hook here your own UI to select a choice. Once the selection has been made
   * onSelect should be called with the selected choice. This is triggered when the search icon is clicked
   *
   * @param binding
   * @param onSelect
   */

  show(binding, onSelect) {
	alert('Implement a UI for this chooser');
  }, 
  /**
   * Supports creation of choices on the fly
   * @param binding
   * @returns {boolean}
   */
	
  supportsInlineCreate(binding) {
    return false;
  },
	
  /**
   * Fetches the choice options.
   * Returns a promise which resolves to an array of objects. See './data' for the structure of the object.
   * Here one can hook to a 3rd party and resolve (after converting if necessary) the response into a chooser object.
   * @param item
   * @param term
   * @returns {Promise<Array>}
  t*/
  search(item, term) {

 	  //console.log(item); 

	/* get the broader */
	/*console.log(term);	*/

	
  //		jquery('select.select2-hidden-accessible.mismatch').on("select2:select", function(params) { console.log(params)});
	if (firstSearch) {
		console.log("REGISTER SELECT CALLBACK");
		firstSearch=false;
	}
/**		console.log(getValuePathInObject( item, "http://eosc.eu/Agricultural%20Sciences", false, 20));	*/
	try {
 	} catch (e) {
		console.log("error");
	}
    /** console.log(term);  */

	/** TRY QUERY TRIPLESTORE */


	/** Collect local constraints **/
	var localConstraints=[];
	for ( var k in item._source.constraints) {
		if (item._source.constraints[k] ==  "http://envri.eu/form/localconstraint"){
			localConstraints.push(k);
		}
	}

	//console.log(item._source.constraints);
	var querystring="select distinct ?s ?l where { ";
	for ( var k in item._source.constraints) {
		var target=item._source.constraints[k];
		var pathExpr="";
		if (target == "http://envri.eu/form/localconstraint") 
			continue;
		if ((localConstraints.includes(item._source.constraints[k]))){ 
			var g=window.graph.find(null, item._source.constraints[k], null);
			target=g[0].getValue();
			pathExpr="+";
		}
		//console.log(k);
		//console.log(item._source.constraints[k]);
		querystring=querystring + "?s (<" + k + ">)" + pathExpr + " <" + target + "> .";
		querystring=querystring + " ?s ?p ?l . " +
		"FILTER ( ?p = <http://schema.org/name> || " +
			" ?p = <http://www.w3.org/2004/02/skos/core#label> || " +
			" ?p = <http://www.w3.org/2000/01/rdf-schema#label>)" 	
	}
	querystring+="} order by ?l";
	console.log(querystring);
	var xhrArgs={	"data" : "query="+encodeURIComponent(querystring).replace("%20", "+"), 
			"format": "xml", 
			"method":"POST",
			"sync":"false",
			"handleAs":"json",
			//"headers":{ 'Content-Type': 'application/sparql-query;charset=UTF-8',
			"headers":{ 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
				   'Accept':'application/sparql-results+json' }};
	var requestUrl="http://90.147.102.53/sparql"; 
	var transform=[];
	xhr(requestUrl, xhrArgs).then(function(data) {
		//console.log(data);
		for (var i in data["results"]["bindings"]) {
			transform.push({ "value": data["results"]["bindings"][i]["s"]["value"],
					 "label": { "en" : data["results"]["bindings"][i]["l"]["value"]}});
		}
		//console.log(transform);
	}); 
	
	/*console.log(requestUrl);*/	

	
	    

    return new Promise(resolve => resolve(transform));
  },
}


export default () => {
  // Super Brute Force override
  /*
  var origSetValue=ChoiceBinding.setValue;
  ChoiceBinding.setValue = function (value, choice, silent) {
	system.log("CAUGHT")
	origSetValue(value, choice, silent);
  } 
  */
  renderingContext.chooserRegistry.itemtype('choice').register(chooserConfiguration);
};
