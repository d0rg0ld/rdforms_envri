const jQuery = require('jquery');
const fancytree = require('jquery.fancytree');
require('jquery.fancytree/dist/modules/jquery.fancytree.filter');
const xhr = require('dojo/request/xhr');
import data from './data.js';
//import { i18n, NLSMixin } from 'esi18n';
//import { escape } from 'lodash-es';
const template = '<div>OVERLAY</div>';
 
//https://www.neowin.net/forum/topic/1171139-make-a-floating-div-tag-in-javascript/
var divHeight = 400;
var divWidth = 512;

var active=false;
var treediv=null;

var curKey=null;
var curTitle=null;

function floatingDiv(parent, id) {
	if(!parent) 
		parent = "body";
	var x = window.innerWidth-divWidth;
	console.log(x);
	jQuery('<div/>', {
	    id: id,
	    text: '',
	    style:
		
		'position:absolute;'+
		
	    	'top:' + (window.innerHeight-divHeight)/2.0 + 'px;'+
		'left:' + (window.innerWidth-divWidth)/2.0 + 'px;'+
		
		'overflow:auto;'+
		'z-index:2;'+
	    	'width:'+divWidth+'px;'+
	    	'height:'+divHeight+'px;'
	}).appendTo(parent);
	/*
	jQuery('*:not(#'+id).click(function(e){
  		e.preventDefault();
	});*/
}

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


function choiceRoots(list) {
	let roots=[];
	for (let i in list) {
		var curVal=list[i]["value"]
		var isChild=false;
		for (let j in list) {
			for (let c in list[j]["children"])
				if (curVal==list[j]["children"][c]["_reference"])
					isChild=true;	
		}
		if (!isChild)
			roots.push(curVal);	
	}
	return roots;
}

function buildTree(list, root) {
        for (let i in list) {
		if (list[i]["value"]==root) {
			var entry={};
			entry["title"]= list[i]["label"]["en"];
                        entry["key"]=list[i]["value"];
			if ("children" in  list[i]) {
                        	entry["folder"]=true;
                        	entry["icon"]=true;
                        	entry["children"]=[];
				for (let child in list[i]["children"])
					entry["children"].push(buildTree(list, list[i]["children"][child]["_reference"]));			
			}
			return entry;
		}
        }
}

function onCancelSubmit(action, onselect=null) {
	if (action=="submit") {
		onselect({ "value": curKey, "label": { "en" : curTitle}});
	}
	if (action=="add") {
		var tree = jQuery.ui.fancytree.getTree("#tree"),
        	node = tree.getActiveNode(),
        	newData = {title: "New Node"},
        	newSibling = node.appendSibling(newData);
		return;
		//onselect({ "value": curKey, "label": { "en" : curTitle}});
	}
	var ele=document.getElementById("treeTest");
	ele.parentNode.removeChild(ele);
	active=false;
	curKey=null;
	curTitle=null;
	window.blockDiv.hide(100);
}

function setSelect(k, v, firstConstraint, pathExpr, union, querystring) {
			var filler="<"+k+">";
			if (pathExpr) {
				console.log("PATHEXPR");
				filler="("+filler+")*";
			};
			if (union) {
				if (!(firstConstraint))
					querystring=querystring + " UNION "	
				querystring=querystring + "{"
				firstConstraint=false;	
			}
			querystring=querystring + "?s " + filler + " <" + v + "> .";
			querystring=querystring + " ?s ?p ?l . FILTER ( ?p = <http://schema.org/name> || " +
				" ?p = <http://www.w3.org/2004/02/skos/core#label> || " +
				" ?p = <http://www.w3.org/2000/01/rdf-schema#label>) . OPTIONAL { ?par " + filler + " <" + v + ">. ?s <" + k + "> ?par . ?par ?pl ?parL . "  +	
			"FILTER ( ?pl = <http://schema.org/name> || " +
				" ?pl = <http://www.w3.org/2004/02/skos/core#label> || " +
				" ?pl = <http://www.w3.org/2000/01/rdf-schema#label>)} ." 	
			if (union)
				querystring=querystring + "}";
			return querystring;
	
}

function loadChoices(item) {
		  //console.log(item); 

		/* get the broader */
		/*console.log(term);	*/



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
		var querystring="select distinct ?s ?l ?par ?parL where { ";
		console.log(item._source.styles);

		var pathExpr=false;
		var tree=false;
		var union=false;
		var firstConstraint=true;
		for (var i in item._source.styles) {
			if (!pathExpr)
				pathExpr=(item._source.styles[i] == "pathExpr");
			if (!tree)
				tree=(item._source.styles[i] == "tree");
			if (!union)
				union=(item._source.styles[i] == "union");
		}

		for ( var k in item._source.constraints) {
			console.log(k);
			var arr = item._source.constraints[k]
			if (!Array.isArray(arr))
				arr=[arr];
			for (var v in arr) {
				querystring=setSelect(k, arr[v], firstConstraint, pathExpr, union, querystring) 
			//console.log(item._source.constraints[k]);
				firstConstraint=false;
			}
		}
		querystring+="} order by ?par";
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
		var leafs=[];
		var transId=[];
		var leafId=[];
		xhr(requestUrl, xhrArgs).then(function(data) {
			//console.log(data);
			var oldPar="";
			var curPar="";
			var curParL="";
			var childList=[];
			//console.log(data["results"]["bindings"]);
			for (var i in data["results"]["bindings"]) {
				//console.log(i);
				if (curPar != "" && curPar != data["results"]["bindings"][i]["par"]["value"]) {
					//console.log( data["results"]["bindings"][i]["par"]["value"]);
					var pardata={"value": curPar, "label": { "en" : curParL }, "selectable":false, "top":true,"children":[]}
					//console.log(pardata);
					for (var j in childList) {
						pardata.children.push({"_reference":childList[j].value});
						leafs.push(childList[j]);
					}
					//console.log(pardata);
					transform.push(pardata);
					transId.push(curPar);
					childList=[];
				};
				if ("par" in data["results"]["bindings"][i]) {
					curPar= data["results"]["bindings"][i]["par"]["value"];
					curParL= data["results"]["bindings"][i]["parL"]["value"];
					childList.push({ "value": data["results"]["bindings"][i]["s"]["value"], 
							"label": { "en" : data["results"]["bindings"][i]["l"]["value"]}});
				} else {
					leafs.push({ "value": data["results"]["bindings"][i]["s"]["value"],
							"label": { "en" : data["results"]["bindings"][i]["l"]["value"]}});
				}
				//console.log(curPar);
			}
			//console.log(transform);
		}); 
		console.log(transform);
		
		for (let l in leafs) {
			if (!(transId.includes(leafs[l].value))) {
				transform.push(leafs[l]);
				transId.push(leafs[l].value);
			}
		}

		return transform;
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
	// Check existing
        console.log(item);
        console.log(value);
        for (let i in item._bundle._items) {
                if (item._bundle._items[i]._source.id==item._source.child) {
                        console.log("HIT");
                        console.log(item._bundle._items[i]._getLocalizedValue());
                }

        }
        var querystring="select distinct ?l where { ";
        for ( var k in item._source.constraints) {
                //console.log(k);
                //console.log(item._source.constraints[k]);
                querystring=querystring + "<" + value + "> ?p ?l . " +
                "FILTER ( ?p = <http://schema.org/name> || " +
                        " ?p = <http://www.w3.org/2004/02/skos/core#label> || " +
                        " ?p = <http://www.w3.org/2000/01/rdf-schema#label>)"
        }
        querystring+="} order by ?l";
        console.log(querystring);
        var xhrArgs={   "data" : "query="+encodeURIComponent(querystring).replace("%20", "+"),
                        "format": "xml",
                        "method":"POST",
                        "sync":"false",
                        "handleAs":"json",
                        //"headers":{ 'Content-Type': 'application/sparql-query;charset=UTF-8',
                        "headers":{ 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                                   'Accept':'application/sparql-results+json' }};
        var requestUrl="http://90.147.102.53/sparql";
        var transform=null;

        xhr(requestUrl, xhrArgs).then(function(data) {
                //console.log(data);
                for (var i in data["results"]["bindings"]) {
                        var res=data["results"]["bindings"][i]["l"]["value"]
                        console.log(res);
                        var out = { "value" : String(value), "label" : String(res) }
                        transform=out;
                        console.log("pushed");
                }
                //console.log(transform);
        });
     return transform;
     //return new Promise(resolve => resolve(transform));
        /*
     return {
       value,
       load(onSuccess)
     };
        */

	// Check existing
	/*
     return {
       value,
       load(onSuccess) 
     };
	*/
   },
 

  /**
   * You can hook here your own UI to select a choice. Once the selection has been made
   * onSelect should be called with the selected choice. This is triggered when the search icon is clicked
   *
   * @param binding
   * @param onSelect
   */

  show(binding, onSelect) {
	if (!active) {
		if (!(binding._item._internalId in window.choiceStore)) 
			window.choiceStore[binding._item._internalId]=loadChoices(binding._item);

		active=true;
		console.log(binding);

		/*
		var $body = jQuery(document.body);
		var $div = jQuery("<div id='dummyDiv'/>").hide().appendTo($body);
		$div.css({position:"absolute",  "z-index": 1, height: $body.height(), width: $body.width(), background: "#000", opacity: 0.5}).show(100);
		*/

		window.blockDiv.show(100);

		/*
		var body = document.getElementsByTagName("body")[0];
		var blockdiv = document.createElement("div");
		blockdiv.setAttribute('id', 'dummyDiv');
		blockdiv.setAttribute('style', 'position:"absolute";z-index:1;height:window.innerHeight;width:window.innerWidth;background:"#000";opacity:0.5;');
		body.appendChild(blockdiv);
		*/
		console.log(fancytree.version);
		floatingDiv(null, "treeTest");
		var treediv1 = document.getElementById("treeTest");
		var titleDiv = document.createElement("div");
		titleDiv.setAttribute("style", "background: white;");
		titleDiv.textContent=binding._item._source.label.en;
		treediv1.appendChild(titleDiv);


		var searchDiv = document.createElement("div");
		searchDiv.setAttribute("style", "background:white;width:" + divWidth + "px;");
		var searchDivInp =  document.createElement("input"); 
		searchDivInp.setAttribute("name", "search");
		searchDivInp.setAttribute("style", "height:30px;");
		var searchDivRes =  document.createElement("button"); 
		searchDivRes.setAttribute("id", "btnResetSearch");
		searchDivRes.setAttribute("style", "height:30px;width:30px;");
		var searchDivMat =  document.createElement("span"); 
		searchDivMat.setAttribute("id", "matches");

		searchDiv.appendChild(searchDivInp);
		searchDiv.appendChild(searchDivRes);
		searchDiv.appendChild(searchDivMat);

		treediv1.appendChild(searchDiv);

		var treediv = document.createElement("div");
		
		treediv.setAttribute('id', 'tree');
		treediv.setAttribute('style', 'height:300px;');
		treediv1.appendChild(treediv);


		// transform the selections
		var choices = window.choiceStore[binding._item._internalId]; 
		console.log(choices);

		var treeStruct = [];
		var roots =choiceRoots(choices);

		console.log(roots);

		for (let root in roots) {
			treeStruct.push(buildTree(choices, roots[root]));
		}

		console.log(treeStruct);

		var myt=fancytree.createTree(treediv,{
			extensions: ["filter"],
			quicksearch: true,
			icon: true,
			source: treeStruct,
			autoScroll: true,
			      filter: {
				autoApply: true,   // Re-apply last filter if lazy data is loaded
				autoExpand: false, // Expand all branches that contain matches while filtered
				counter: true,     // Show a badge with number of matching child nodes near parent icons
				fuzzy: false,      // Match single characters in order, e.g. 'fb' will match 'FooBar'
				hideExpandedCounter: false,  // Hide counter badge if parent is expanded
				hideExpanders: false,       // Hide expanders if all child nodes are hidden by filter
				highlight: true,   // Highlight matches by wrapping inside <mark> tags
				leavesOnly: false, // Match end nodes only
				nodata: true,      // Display a 'no data' status node if result is empty
				mode: "dimm"       // Grayout unmatched nodes (pass "hide" to remove unmatched node instead)
			},
			activate: function(event, data) {
				console.log("ACTIVATE");
				console.log(data);
				curKey=data.node.key;
				curTitle=data.node.title;
			},
			select: function(event, data) {
				console.log("SELECT");
				console.log(data);
			}
		});


		    jQuery("input[name=search]").on("keyup", function(e){
		      var n,
			tree = jQuery.ui.fancytree.getTree(),
			args = "autoApply autoExpand fuzzy hideExpanders highlight leavesOnly nodata".split(" "),
			opts = {},
			filterFunc = tree.filterNodes,
			match = jQuery(this).val();
			//opts["autoExpand"]=true;
			opts["counter"]=true;

		      	opts.mode = jQuery("#hideMode").is(":checked") ? "hide" : "dimm";

		      if(e && e.which === jQuery.ui.keyCode.ESCAPE || jQuery.trim(match) === ""){
			jQuery("button#btnResetSearch").click();
			return;
		      }
		      if(jQuery("#regex").is(":checked")) {
			// Pass function to perform match
			n = filterFunc.call(tree, function(node) {
			  return new RegExp(match, "i").test(node.title);
			}, opts);
		      } else {
			// Pass a string to perform case insensitive matching
			n = filterFunc.call(tree, match, opts);
		      }
		      jQuery("button#btnResetSearch").attr("disabled", false);
		      jQuery("span#matches").text("(" + n + " matches)");
		    }).focus();

		jQuery("button#btnResetSearch").click(function(e){
      			jQuery("input[name=search]").val("");
      			jQuery("span#matches").text("");
      			myt.clearFilter();
    		}).attr("disabled", true);
	
		var btnDiv = document.createElement("div");
		btnDiv.setAttribute('id', 'btnDiv');
		btnDiv.setAttribute('style', 'height:30px;');
		var cancelBtn = document.createElement("button");
		cancelBtn.setAttribute('style', 'height:30px;width:70px;');
		cancelBtn.textContent="Cancel";
		cancelBtn.onclick= function(e) {onCancelSubmit("cancel");};
		var addBtn = document.createElement("button");
		addBtn.setAttribute('style', 'height:30px;width:70px;');
		addBtn.textContent="Add";
		addBtn.onclick= function(e) {onCancelSubmit("add", onSelect);};
		var submitBtn = document.createElement("button");
		submitBtn.setAttribute('style', 'height:30px;width:70px;');
		submitBtn.textContent="Accept";
		submitBtn.onclick= function(e) {onCancelSubmit("submit", onSelect);};
		btnDiv.appendChild(cancelBtn);
		btnDiv.appendChild(addBtn);
		btnDiv.appendChild(submitBtn);
		treediv1.appendChild(btnDiv);
	}

  },
  /**
   * Supports creation of choices on the fly
   * @param binding
   * @returns {boolean}
   */
	
  supportsInlineCreate(binding) {
    console.log(binding);
    return true;
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
	
	
	var transform=[];
	if (!(item._internalId in window.choiceStore))
		window.choiceStore[item._internalId]=loadChoices(item);

	transform=window.choiceStore[item._internalId];
	/*console.log(requestUrl);*/	

		
	/*if (tree)
		return new Promise(resolve => resolve([]));
	else*/
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
