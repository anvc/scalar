/**
 * @projectDescription		Methods for interacting with HTML RDFa via jquery.rdfquery.js
 * @author					Craig Dietrich
 * @version					1.1
 */

(function($) {
	$.fn.RDFa = function(options) {
		this.init = function() {
			this.$rdf = this.rdf();
			this.rdf = this.$rdf.databank.dump();
        };
        this.dump = function(format) {
        	if ('undefined'==typeof(format)) format = 'application/json';  // TODO
        	return this.rdf;
        }
        this.predicates = function(a,b) {
        	var node, predicate;
        	if ('undefined'!=typeof(b)) {
        		node = ('string'==typeof(a)) ? this.rdf[a] : a;
        		predicate = b;
        	} else {
        		node = this.rdf[this.options.subject];
        		predicate = a;
        	}        	
			return node[predicate];
        }
        this.predicate = function(a,b) {
        	return this.predicates(a,b)[0].value;
        };
        this.types = function(a) {
        	var node;
        	if ('undefined'!=typeof(a)) {
        		node = a;
        	} else {
        		node = this.rdf[this.options.subject];
        	} 
        	if ('undefined'==node.types) return '';
        	return node.types;
        }
        this.relations = function(dir) {
        	var valid_dirs = ['out','in'];
        	if (-1==valid_dirs.indexOf(dir)) dir = valid_dirs[0];
        	var obj = {};
        	var me = this;
        	var $q;
        	if ('out'==dir) {
	        	$q = this.$rdf
	        	.prefix('oac', 'http://www.openannotation.org/ns/')
	        	.prefix('dcterms', 'http://purl.org/dc/terms/')
	        	.prefix('sioc', 'http://rdfs.org/sioc/ns#')
	        	.prefix('art', 'http://simile.mit.edu/2003/10/ontologies/artstor#')
	        	.where('?o oac:hasBody <'+this.options.subject+'>')
	        	.where('?o oac:hasTarget ?s');
	        	$q.each(function() {
	        		var s = me.strbefore(this.s.value.toString(),"#");
	        		obj[s] = $.extend(me.rdf[s], {types:me.strafter(this.s.value.toString(),"#")});
	        	});	        	
        	} else if ('in'==dir) {  // Need to do this a roundabout way because the target (this.options.subject) might have an OAC suffix (#) & rdfquery doesn't support SPARQL functions
	        	$q = this.$rdf
	        	.prefix('oac', 'http://www.openannotation.org/ns/')
	        	.prefix('dcterms', 'http://purl.org/dc/terms/')
	        	.prefix('sioc', 'http://rdfs.org/sioc/ns#')
	        	.prefix('art', 'http://simile.mit.edu/2003/10/ontologies/artstor#')
	        	.where('?o a oac:Annotation')
	        	.where('?o oac:hasBody ?b')
	        	.where('?o oac:hasTarget ?s');
	        	$q.each(function() {
	        		var s = me.strbefore(this.s.value.toString(),"#");
	        		if (s != me.options.subject) return;
	        		var b = me.strbefore(this.b.value.toString(),"#");
	        		if ('undefined'==me.rdf[b]) return;
	        		obj[b] = $.extend(me.rdf[b], {types:me.strafter(this.s.value.toString(),"#")});
	        	});	   
        	}       	
        	obj.nodes_by_type = function(type) {
            	if ('undefined'==typeof(type)||!type.length) type = null;
            	var types = {};
            	for (var uri in this) {
            		if ('object'!=typeof(obj[uri])) continue;
            		if (!type && !this[uri].types.length) types[uri] = this[uri];
            		if (this.node_has_type(uri, type)) types[uri] = this[uri];
            	}
            	return types;
        	}
            obj.node_has_type = function(uri, type) {
            	var arr = this[uri].types.split('&');
            	for (var j = 0; j < arr.length; j++) {
            		if (type==arr[j].split('=')[0]) return true;
            	}
            	return false;
            }        	
        	return obj;
        }
        this.strbefore = function(str1, str2) {
        	if (-1==str1.indexOf(str2)) return str1;
        	return str1.substring(0, str1.indexOf(str2))
        }
        this.strafter = function(str1, str2) {
        	if (-1==str1.indexOf(str2)) return '';
        	return str1.substring((str1.indexOf(str2)+1));
        }        
        this.options = {subject:$('base:first').attr('href')};
        $.extend(this.options, options);
        this.init();
        return this;
    };
})(jQuery);