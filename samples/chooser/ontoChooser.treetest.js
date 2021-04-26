const jQuery = require('jquery');
const fancytree = require('jquery.fancytree');
require('jquery.fancytree/dist/modules/jquery.fancytree.filter');
require('jquery.fancytree/dist/modules/jquery.fancytree.edit');
const xhr = require('dojo/request/xhr');
import data from './data.js';
//import { i18n, NLSMixin } from 'esi18n';
//import { escape } from 'lodash-es';
const template = '<div>OVERLAY</div>';
import { Get } from '../common_comps.js'; 
//https://www.neowin.net/forum/topic/1171139-make-a-floating-div-tag-in-javascript/
var divHeight = 400;
var divWidth = 512;

var active=false;
var treediv=null;
var btnDiv=null;

var curKey=null;
var curTitle=null;

var newNodes=[];

var curItem=null;

var myt=null;

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
			entry["data"]={};
			entry["data"]["new"]=list[i]["new"];
			if (list[i]["new"])
				entry["extraclasses"]="fancytree-newnode";	
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

function createTreeSource(item) {
		// transform the selections
		var choices = window.choiceStore[item._internalId]; 
		console.log(choices);

		var treeStruct = [];
		var roots =choiceRoots(choices);

		console.log(roots);

		for (let root in roots) {
			treeStruct.push(buildTree(choices, roots[root]));
		}
		return treeStruct;
};

function onCancelSubmit(action, onselect=null) {
	if (action=="submit") {
		if (newNodes.length>0) {
			// Assume the followinga

			// newly added "top level" node -> shouldnt be possible, but
			// currently is.  in this case would have to get parent from somewhere

			// if only one constraint its simple. problematic if multiple.


			// child of top level -> top level ones should (if not newly created) always have URI. 
			// Use this URI as parent . how to use name of relationship? get from constraints
			// child of child of toplevel:-> get up to child of toplevel, create uri, trickle down

			// MUCH BETTER IDEA: CREATE RIGHT KEY AT EDIT TIME!!!

			for (var n in newNodes) {
				console.log(newNodes[n]); 
				console.log("<"+newNodes[n].key + ">	rdfs:subClassOf	<" + newNodes[n].parent.key+">" )
				window.termgraph.add(newNodes[n].key, 'http://www.w3.org/2000/01/rdf-schema#subClassOf', newNodes[n].parent.key);
				window.termgraph.addL(newNodes[n].key, 'http://www.w3.org/2000/01/rdf-schema#label', newNodes[n].title);
				//we must add the stuff to the choiceStore as well
				for (var e in  window.choiceStore[curItem._internalId]) 
					if (window.choiceStore[curItem._internalId][e].value==newNodes[n].parent.key) {
						if (!("children" in window.choiceStore[curItem._internalId][e]))
							window.choiceStore[curItem._internalId][e]["children"]=[];
						window.choiceStore[curItem._internalId][e].children.push({ _reference: newNodes[n].key});
						break;
					}
				window.choiceStore[curItem._internalId].push({ value: newNodes[n].key, label: { en: newNodes[n].title}, new: true });
			}

		}
		console.log(curKey);
		onselect({ "value": curKey, "label": { "en" : curTitle}});
	}
	if (action=="add") {
		var tree = jQuery.ui.fancytree.getTree("#tree");
        	var node = tree.getActiveNode();
        	var newData = {title: "New Node"};
		var newNode=null;
		if (node) {
			if (!(node.folder))
				node.folder=true;
			newNode=node.editCreateNode("child", newData);
		} else
			newNode=tree.rootNode.editCreateNode("child",  newData);
		return;
		//onselect({ "value": curKey, "label": { "en" : curTitle}});
	}
	var ele=document.getElementById("treeTest");
	ele.parentNode.removeChild(ele);
	active=false;
	curKey=null;
	curTitle=null;
	curItem=null;
	newNodes=[];
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
				" ?p = <http://www.w3.org/2000/01/rdf-schema#label>) . " + 
				"OPTIONAL { ?par " + filler + " <" + v + ">. ?s <" + k + "> ?par . " + 
				"OPTIONAL { ?par ?pl ?parL . "  +	
			"FILTER ( ?pl = <http://schema.org/name> || " +
				" ?pl = <http://www.w3.org/2004/02/skos/core#label> || " +
				" ?pl = <http://www.w3.org/2000/01/rdf-schema#label>)}} ." 	
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
		var querystring="select distinct ?s (sample(?l) as ?l) ?par (sample(?parL) as ?parL) where { ";
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
		querystring+="} group by ?s ?par order by ?par";
		console.log(querystring);
		var xhrArgs={	"data" : "query="+encodeURIComponent(querystring).replace("%20", "+"), 
				"format": "xml", 
				"method":"POST",
				"sync":"false",
				"handleAs":"json",
				//"headers":{ 'Content-Type': 'application/sparql-query;charset=UTF-8',
				"headers":{ 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
					   'Accept':'application/sparql-results+json' }};
		var requestUrl="https://envri-fair.lab.uvalight.net/sparql"; 
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
					var pardata={"value": curPar, "label": { "en" : curParL }, new: false, "selectable":false, "top":true,"children":[]}
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
					if ("parL" in data["results"]["bindings"][i])
						curParL= data["results"]["bindings"][i]["parL"]["value"];
					else
						curParL=curPar;
					childList.push({ "value": data["results"]["bindings"][i]["s"]["value"], 
							"label": { "en" : data["results"]["bindings"][i]["l"]["value"]}, new: false});
				} else {
					leafs.push({ "value": data["results"]["bindings"][i]["s"]["value"],
							"label": { "en" : data["results"]["bindings"][i]["l"]["value"]}, new: false});
				}
				//console.log(curPar);
			}
			pardata={"value": curPar, "label": { "en" : curParL }, new: false, "selectable":false, "top":true,"children":[]}
                                        //console.log(pardata);
                                        for (var j in childList) {
                                                pardata.children.push({"_reference":childList[j].value});
                                                leafs.push(childList[j]);
                                        }
                                        //console.log(pardata);
			if (childList.length>0) {
                                        transform.push(pardata);
                                        transId.push(curPar);
                                        childList=[];
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
        var requestUrl="https://envri-fair.lab.uvalight.net//sparql";
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

		curItem=binding._item;

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
		var reloadBtn =  document.createElement("button");
		reloadBtn.setAttribute("id", "reloadBtn");
		reloadBtn.setAttribute("style", "height:30px;width:60px;");
		reloadBtn.textContent="Reload";
		reloadBtn.onclick= function(e) {
			window.choiceStore[curItem._internalId]=loadChoices(curItem);
			myt.reload(createTreeSource(curItem));	
		};
		var searchDivInp =  document.createElement("input"); 
		searchDivInp.setAttribute("name", "search");
		searchDivInp.setAttribute("style", "height:30px;");
		var searchDivResLab =  document.createElement("label");
		searchDivResLab.setAttribute("for",  "btnResetSearch");
		searchDivResLab.innerHTML="Reset";
		var searchDivRes =  document.createElement("button"); 
		searchDivRes.setAttribute("id", "btnResetSearch");
		searchDivRes.setAttribute("style", "height:20px;width:20px;");
		var searchDivMat =  document.createElement("span"); 
		searchDivMat.setAttribute("id", "matches");
		var hideCheckLab =  document.createElement("label");
		hideCheckLab.setAttribute("for",  "hideMode");
		hideCheckLab.innerHTML="Hide";
		var hideCheck = document.createElement("input");
		hideCheck.setAttribute("id", "hideMode");
		hideCheck.setAttribute("type", "checkbox");
		hideCheck.setAttribute("style", "height:20px;width:20px;");

		searchDiv.appendChild(reloadBtn);
		searchDiv.appendChild(searchDivInp);
		searchDiv.appendChild(searchDivResLab);
		searchDiv.appendChild(searchDivRes);
		searchDiv.appendChild(hideCheckLab);
		searchDiv.appendChild(hideCheck);
		searchDiv.appendChild(searchDivMat);

		if (("styles" in binding._item._source) && !(binding._item._source.styles.includes("immutable"))) {
			var addBtn = document.createElement("button");
			addBtn.setAttribute('style', 'height:30px;width:40px;right:10px;position:absolute;');
			addBtn.textContent="Add";
			addBtn.onclick= function(e) {onCancelSubmit("add", onSelect);};
			searchDiv.appendChild(addBtn);
		}

		treediv1.appendChild(searchDiv);

		var treediv = document.createElement("div");
		
		treediv.setAttribute('id', 'tree');
		treediv.setAttribute('style', 'height:300px;');
		treediv1.appendChild(treediv);


		/*
		// transform the selections
		var choices = window.choiceStore[binding._item._internalId]; 
		console.log(choices);

		var treeStruct = [];
		var roots =choiceRoots(choices);

		console.log(roots);

		for (let root in roots) {
			treeStruct.push(buildTree(choices, roots[root]));
		}
		*/
		var treeStruct=createTreeSource(curItem); 

		console.log(treeStruct);

		myt=fancytree.createTree(treediv,{
			extensions: ["filter", "edit"],
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
			expand: function(data) {
				jQuery(".fancytree-newnode").children(".fancytree-title").css({ 'background': 'pink' });
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
				curKey=data.node.key;
				curTitle=data.node.title;
			},
			edit: {
				triggerStart: ["dblclick"],
				beforeEdit: function(event, data){ 
					if (!(data.node.title == "New Node" || newNodes.includes(data.node)))
					//if (!(data.node.title == "New Node") )
						return false;
					console.log(data.node.parent.key);
					
					//treediv.filterNodes.call(treediv, data.node.title, {});

					//retrieve new IDENTIFIER
					data.node.key=Get("https://envri-fair.lab.uvalight.net/uuid_create/create?prefix="+ "http://envri.eu/ontology/terminology%23");
					console.log(data.node.key);

					jQuery('#btnDiv').find('*').attr('disabled', true);
					data.node.setActive();
					console.log("before edit"); 
					
				},
				/*
				edit: function(event, data) {
					//var flt=data.tree.filterNodes.call(data.tree, data.node.title, {});
					console.log(data.input);
				},*/
				close: function(event, data){
					jQuery('#btnDiv').find('*').attr('disabled', false);
					if (data.node==null)
						return;	
					if (data.node.title == "New Node" || (data.node.title == data.orgTitle && data.dirty)) {
						if (data.node.parent.children.length==1)
							data.node.parent.folder=false;
						data.node.remove();
					} else {
						jQuery("#"+data.node.li.id).css({"background-color":"pink"});
						newNodes.push(data.node);
					}
					curKey=data.node.key;
					curTitle=data.node.title;
				}
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
	
		jQuery("#hideMode").click(function(e){
			console.log("hideMode Click");
			myt.clearFilter();
			jQuery("input[name=search]").keyup();
                });

		jQuery("button#btnResetSearch").click(function(e){
      			jQuery("input[name=search]").val("");
      			jQuery("span#matches").text("");
      			myt.clearFilter();
    		}).attr("disabled", true);
	
		btnDiv = document.createElement("div");
		btnDiv.setAttribute('id', 'btnDiv');
		btnDiv.setAttribute('style', 'height:30px;');
		var cancelBtn = document.createElement("button");
		cancelBtn.setAttribute('style', 'height:30px;width:70px;');
		cancelBtn.textContent="Cancel";
		cancelBtn.onclick= function(e) {onCancelSubmit("cancel");};
		btnDiv.appendChild(cancelBtn);
		var submitBtn = document.createElement("button");
		submitBtn.setAttribute('style', 'height:30px;width:70px;');
		submitBtn.textContent="Accept";
		submitBtn.onclick= function(e) {onCancelSubmit("submit", onSelect);};
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
