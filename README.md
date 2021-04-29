## RDForms data entry service

This set of interactive Web pages is dedicated to providing forms for describing ENVRI related services, software, documents and use cases in form of native RDF. They are currently available via the URLs below. A brief description of the current state of the system is provided in ENVRI-FAIR Deliverable 7.3 (https://envri.eu/wp-content/uploads/2021/04/ENVRI-FAIR-D-7-3.pdf).

https://envri-fair.lab.uvalight.net/rdforms/samples/software_description.html

https://envri-fair.lab.uvalight.net/rdforms/samples/service_description.html

https://envri-fair.lab.uvalight.net/rdforms/samples/document_description.html

https://envri-fair.lab.uvalight.net/rdforms/samples/usecase_description.html

The four forms cover the entities and their mutual relationships as present in the data model shown in the Figure below. The used properties have mainly been derived from the eInfraCentral EOSC catalogue schema and classification scheme 2.0 available via https://github.com/eInfraCentral/docs as well as from the descriptions of the ENVRIplus service portfolio available via https://confluence.egi.eu/display/EC/ENVRIplus+Service+Portfolios and https://de.slideshare.net/EUDAT/data-for-science-service-portfolio

![image](https://user-images.githubusercontent.com/2720790/116233554-b9713a00-a75b-11eb-9bcc-a0090b52dc1b.png)


### Repository
The repo for the Envri forms is https://github.com/d0rg0ld/rdforms_envri

## Tech info

### Approach
The client side is based on the RDForms js Lib - https://rdforms.org/#!index.md. User entries and existing data loaded from the Triplestore are stored as RDF in the browser memory.

The server side is based on an Ontowiki installation (currently available via https://envri-fair.lab.uvalight.net/OntoWiki/index.php) configured on top of a Triplestore (OpenLink Virtuoso, available via https://envri-fair.lab.uvalight.net/sparql). While reading existing data takes place directly via the SPARQL endpoint of the underlying Triplestore, writing is routed via Ontowikis update service, which provides a basic authentication mechanism.

While newly added statements are written to and read from a named graph whose name is stored in the browser variable *window.contentGraphname* as specified in the html file for each form (It should be consistent across all forms), newly added terminology (via the custom chooser described below) is read from and written to a separate named graph stored in *window.userTermGraphName*.

New entities require a unique ID. A separate service "identifierservice", whose code resides in the folder of similar name, provides a simple, uuid.uui4() based hash appended to an arbitrarily passed URI prefix. It is called on each reload of a form and used to initialize the RDF subject for the to-be-created set of triples.

### Installation + Startup

This repo should be cloned into a folder on the target server made available via HTTP, including its subdirectories. The forms are in the samples directory and can be loaded via the respective html files there.

An Ontowiki instance must be properly configured on top of a Triplestore (There is an existing adapter for Openlink Virtuoso, https://docs.ontowiki.net/VirtuosoBackend.html). It should contain two empty (or imported) Knowledge Bases, one for the "content" and one for user provided terminology. As described above, the resource IRIs of these two KBs shoould be passed to the *window.contentGraphname* and *window.userTermGraphName* variables in each form's html code. The current state of these two KBs is stored in this repo as files **envri_service_portfolio.rdf** and **envri_user_terminology.rdf** which can be imported for convenience. Futhermore, the Ontowiki installation should include the ontologies used to populate the controlled vocabulary for form values as separate knowledge bases. Currently used resources are the SWO (https://github.com/allysonlister/swo) and EDAM (http://edamontology.org/page) ontologies from the OBO domain, as well as the terminology derived from eInfraCentral, made available in this repository in file **envri_terminology.rdf**. In order for term labels to become visible in the Ontowiki viewer, the Onwotiki KB IRIs for these resources should be imported into the "content" knowledge base via owl:imports.

In order to filter the imported resources from the class view in the Ontowiki Viewer, Ontowiki's "Navigation Module" extension should be configured with hidden Namespaces:

> config/classes/hiddenNS/0/"http://www.w3.org/1999/02/22-rdf-syntax-ns#"
> 
> config/classes/hiddenNS/1/"http://www.w3.org/2000/01/rdf-schema#"
> 
> config/classes/hiddenNS/2/"http://www.w3.org/2002/07/owl#"
> 
> config/classes/hiddenNS/3/"http://edamontology.org/"
> 
> config/classes/hiddenNS/4/"http://purl.obolibrary.org/obo/"
> 
> config/classes/hiddenNS/5/"http://www.geneontology.org/formats/oboInOwl#"
> 
> config/classes/hiddenNS/6/"http://kt.ijs.si/panovp/OntoDM#"
> 
> config/classes/hiddenNS/7/"http://www.ebi.ac.uk/swo/"

The ID Service must be started by running the **runit.sh** bash script in the identifierservice folder from a separate terminal.

Besides the graph names in *window.contentGraphname* and *window.userTermGraphName*, each form's html file contains additional variables that must be set accordingly. The URL of the ID Service must be provided via *window.idSrvURI*, the URL of Ontowiki in *window.ontoWikiURI* and of the Triplestore's SPARQL service via *window.SPARQLURI*.

### Structure of the code

The structure of the code is currently directly based on the checked out rdforms library folder (https://bitbucket.org/metasolutions/rdforms/src), the files for specifying the forms are currently stored in the "samples" folder there.

Important components for all forms are:

- The chooser for selecting terms from a controlled vocabulary as specified in the individual form's bundle file. It is implemented in samples/chooser/ontoChooser.treetest.js and symlinked as ontoChooser.js.
- Common js and html snippets are located in samples/common

Each form "app" is composed of five individual files

- The **[software|service|document|usecase]_description.html** file contains the basic layout of the form, imports the used libs and css files and initializes a number of important browser variables, such as the Graph Names for the content and the terminology triples loaded/updated from/to the Triplestore.

- The **[software|service|document|usecase]_description.css** file contains custom css code for each form

- The **[software|service|document|usecase]_description.js** file contains the Javascript code used to initialize RDFforms with respect to the overall layout specified in the html file.

- The **[software|service|document|usecase]_description_bundle.json** file contains the  JSON structure with the form specification as defined by RDForms. It is loaded from the Javascript initialization code. 

- The **[software|service|document|usecase]_description_rdf.json** file contains the RDF stub used for initializing the RDF to be populated by the form

For conveniently creating new forms, the script "createNewForm.sh" can be used to create a set of files described above with a new name and correct mutual references set accordingly.

### Extensions to classic RDForms

The main functionality of the code is consistent with the RDForms approach. Extensions have been implemented in the context of dynamic SPARQL queries against the Triplestore for retrieving controlled vocabulary for option menus. The extensions comply with the RDForms "plugin" architecture for choosers, see for example "example7" from the original RDForms samples. In the context of the forms implemented here, the extended chooser implementation is in the above mentioned **samples/chooser/ontoChooser.treetest.js** file. The registration of this chooser in the context of the RDForms framework takes place in file **common_comps.js**: "import registerOntoChooser from './chooser/ontoChooser.js';"

The custom chooser features the construction of a dynamic SPARQL query for option menu values based on constraints specified in the RDForms specification (in the **[software|service|document|usecase]_description_bundle.json**) for the respective RDF statement to be generated via the form. The example below, taken from **software_description_bundle.json**, represents a typical specification for such contraints. In principle, constraints are formulated as SPARQL expressions of the form 

**?s \<contraintProperty\> \<constraintObject\>**, 

allowing to query for all entities ?s fulfilling that constraint. Typically, constraint properties represent some form of "subClassOf", "broader" or "type" relation while constraint objects are the respective superclasses, broader terms or types. Both are specified under the dedicated "contraints" key, whose value is a dictionary of key-value pairs. Each key of this dictionary represents a constraintProperty, while the value(s) associated with that key represent the constraintObjects. Per default, multiple constraints expressed that way are interpreted as "intersection", i.e. the specification of a constraint "http://www.w3.org/2000/01/rdf-schema#subClassOf" with two associated values, as given below, would only return those subjects being subclass of both. In many cases, however, the union of constraint is desired instead. This can be achieved via an extended style value "union" as shown in the example below under the list of style options specified via the "styles" key. Additional extended options in the regard include "pathExpr", which results in the SPARQL query to search for transitive constraints of variable lengths (e.g. "?s \<contraintProperty\> ?intermediate . ?intermediate \<contraintProperty\> ?intermediateN . ?intermediateN \<contraintProperty\> \<contraintObject\>") and "tree", which notifies the chooser to represent transitive results in tree form.

> {
> 
>          "type": "choice",
>          
>          "nodetype": "RESOURCE",
>          
>          "property":  "http://www.ebi.ac.uk/swo/SWO_0004005",
>          
>          "cardinality": {
>          
>            "pref": "1"
>            
>         },
>         
>          "constraints": {      "http://www.w3.org/2000/01/rdf-schema#subClassOf":  ["http://purl.obolibrary.org/obo/OBI_0200000","http://www.oil-e.net/ontology/oil-base.owl#IV_Action"]},
>          
>          "OntologyUrl": "http://90.147.102.53/OntoWiki/index.php/EnvriServicePortfoliowithexternalTerminology/",
>          
>          "label": {
>          
>            "en": "Application Scenario"
>            
>          },
>          
>          "description": {
>          
>            "en": "What process does this software support?"
>            
>          },
>          
>                  "styles": [
>                  
>            "multiline", "pathExpr", "tree", "union"
>            
>          ]
>          
>        },

### The custom chooser

The constraint extensions described above serve the dynamic retrieval of controlled vocabulary for assigning valid URIs to objects of to-be-created RDF statements. This is achieved by leveraging the existing RDForms feature of provinding a custom chooser for option menus, which are used in the forms for lists of pre-defined values. As mentioned above, the chooser is implemented in a separate Javascript file, in this implementation it is the file **samples/chooser/ontoChooser.treetest.js** which is also symlinked as **samples/chooser/ontoChooser.js**. 

The chooser is registered globally via the statement *import registerOntoChooser from './chooser/ontoChooser.js';* in the Javascript file **samples/common_comps.js** which is sourced from each form. It allows the specification of the functions *getChoice*, *show* and *search* which are automatically mapped to each optioin menu generated by RDForms. Each click on such a customized option menu triggers the customized *search* function which triggers the corresponding SPARQL query based on the specified constraints, returning the resulting list from the Triplestore which is then shown in the menu. Many allowed-value-sets for different properties used in the forms, however, contain hundreds of values, making the option menu approach not very convenient in these cases. 

A custom GUI element therefore extends the custom chooser even further, it can be invoked by clicking the "loupe" symbol next to each option menu. This opens a separate dialog which is realized using the Fancytree Javascript extension. This allows to display hierarchies in tree form with many convenient features such as collapse/expand. Moreover, the custom dialog allows to search for terms in the result set and to filter the displayed hierarchy accordingly. Last but not least, it also allows users to add their own Terms in case they are not present in the controlled vocabulary, these "user added terms" are stored in the separate Ontowiki graph specified in the browser variable *window.userTermGraphName* when the metadata description is submitted to Ontowiki. The Figure below shows a snapshot of the custom GUI element.

![image](https://user-images.githubusercontent.com/2720790/116607478-5259ae00-a932-11eb-948c-0688e0ae627f.png)


**Below is the original Readme of the RDForms distribution**
# RDForms
RDForms ("RDF Forms") is a JavaScript library that provides a way to declarative describe how editors and presentation
views of RDF should look like. The configuration mechanism eliminates the need for programming once the library has
been deployed into an environment.

# Preliminaries

Before you can use RDForms you need to make sure all the dependencies are loaded:

    $ cd path_to_rdforms
    $ yarn
    $ yarn build

This requires that you have [nodejs](http://nodejs.org/), [npm](https://www.npmjs.org/) and [yarn](https://yarnpkg.com/) already available in your system.

# Development

It is recommended to experiment with the development version as it gives you very good debugging and inspection tools
to understand what is going on (especially firebug in firefox and the built in debugging tools in Chrome).
Furthermore, you do not have to deploy the rdforms library on a web server, you can point your browser to the
sample directory using file: address, for instance file:///path_to_rdforms/samples/example1.html.

# Samples

A good way to start is to take a look at the samples. To be able to run the samples smoothly you can use the webpack 
dev server to spin up a local http server which will *watch* your code changes and re-bundle automatically. 

```
cd path_to_rdforms
yarn dev
```

Now you can access your sample in your browsers at [http://localhost:8080/samples/](http://localhost:8080/samples/). 
For all the following examples their respective `.js` files control which are the data and how the forms are rendered.  

## [example1.html](http://localhost:8080/samples/example1.html) - Simple Editor

1. Loads the library and its CSS.
2. Creates a minimal RDF graph manually.
3. Creates a minimal RDForms template manually.
4. Creates the editor UI from the RDF graph, a given resource, a template and an HTML node.

Check [example1.js](http://localhost:8080/samples/example1.js) for more.

## [example2.html](http://localhost:8080/samples/example2.html) - Editor in Bootstrap

Different from example1 in the sense that it loads the graph and template from separate files.

Check [example2.js](http://localhost:8080/samples/example2.js) for more.

## [example2-bmd.html](http://localhost:8080/samples/example2-bmd.html) - Editor using Material design

Same as example 2 but with a material design theme for bootstrap.

Check [example2.js](http://localhost:8080/samples/example2.js) for more.

## [example3.html](http://localhost:8080/samples/example3.html) - Presenter using material design

Different from example2 in how it loads the template form a separate file and how to depend on files not part of the build.
See the next section for a longer explanation about the build.

Check [example3.js](http://localhost:8080/samples/example3.js) for more.

## [example4.html](http://localhost:8080/samples/example4.html) - Validation presenter using material design

This examples shows how RDForms can be used as a form validator rather than just an editor. 
Take a look at the validation report  inside the form presenter.

Check [example4.js](http://localhost:8080/samples/example4.js) for more.

## [example5.html](http://localhost:8080/samples/example5.html) - Building on default templates

This examples utilizes pre-made templates to render forms. It can serve as a very good start for extending them and creating your
own custom forms.

Check [example5.js](http://localhost:8080/samples/example5.js) for more.

## [example6.html](http://localhost:8080/samples/example6.html) - RDF output from editor (Template is for Dataset according to DCAT-AP)

This example provides a ready output to check your form RDF output live.

Check [example6.js](http://localhost:8080/samples/example6.js) for more.

## [example7.html](http://localhost:8080/samples/example7.html) - RDForm editor with a registered chooser

This is a more advanced example providing some guidance on how to create your own choosers and register them to show on 
select fields in your forms. You can even have your data be fetched across the network.

Check [example7.js](http://localhost:8080/samples/example7.js) for more.


# A note on how to use the built version
The build process uses webpack and outputs the bundled result into the dist folder. The result is babelified into JavaScript ES5
and you should be able to use the library by simply including the dist/rdforms.js. Check the examples above for more info on 
the library's API or feel free to explore the `src/` directory.
