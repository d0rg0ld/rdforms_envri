var jQuery = require('jquery');





function Get(yourUrl){
                        var Httpreq = new XMLHttpRequest(); // a new request
                        Httpreq.open("GET",yourUrl,false);
                        Httpreq.send(null);
                        return Httpreq.responseText;
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

        let newk=Get("http://90.147.102.53/uuid_create/create?prefix="+keyname);

        graph._graph[newk] = graph._graph[keyname];

        delete(graph._graph[keyname]);

        return graph
}




window.choiceStore = {};

var body = jQuery(document.body);
window.blockDiv=jQuery("<div id='dummyDiv'/>").hide();
body.prepend(window.blockDiv);
window.blockDiv.css({position:"absolute",  "z-index": 1, height: body.height(), width: body.width(), background: "#000", opacity: 0.5});
jQuery(window).on('load resize', function(){
    jQuery('#dummyDiv').width(jQuery(this).width());
    jQuery('#dummyDiv').height(jQuery(this).height());
});

