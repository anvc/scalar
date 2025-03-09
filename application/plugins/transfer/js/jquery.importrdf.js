/**
 * Scalar    
 * Copyright 2013 The Alliance for Networking Visual Culture.
 * http://scalar.usc.edu/scalar
 * Alliance4NVC@gmail.com
 *
 * Licensed under the Educational Community License, Version 2.0 
 * (the "License"); you may not use this file except in compliance 
 * with the License. You may obtain a copy of the License at
 * 
 * http://www.osedu.org/licenses/ECL-2.0 
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.       
 */  

/**
 * @projectDescription  Forked from Scalar's rdfimporter library, elaborates on combined page/version node import for Tensor; should some day be merged
 * @author				Craig Dietrich
 * @version				1.1
 */

(function($) {

	var defaults = {
			queue: {},
			relations: {},
			url_map: {},
			ontologies: {
				'rdf'       : 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
				'rdfs'      : 'http://www.w3.org/2000/01/rdf-schema#',
				'dc'        : 'http://purl.org/dc/elements/1.1/',
				'dcterms'   : 'http://purl.org/dc/terms/',
				'ctag'      : 'http://commontag.org/ns#',
				'art'       : 'http://simile.mit.edu/2003/10/ontologies/artstor#',
				'sioc'      : 'http://rdfs.org/sioc/ns#',
				'sioctypes' : 'http://rdfs.org/sioc/types#',
				'foaf'      : 'http://xmlns.com/foaf/0.1/',
				'owl'       : 'http://www.w3.org/2002/07/owl#',
				'ov'		: 'http://open.vocab.org/terms/',
				'oac'		: 'http://www.openannotation.org/ns/',
				'scalar'    : 'http://scalar.usc.edu/2012/01/scalar-ns#',
				'shoah'		: 'http://tempuri.org/',
				'prov'		: 'http://www.w3.org/ns/prov#',
				'exif'		: 'http://ns.adobe.com/exif/1.0/',
				'iptc'		: 'http://ns.exiftool.ca/IPTC/IPTC/1.0/',
				'bibo'		: 'http://purl.org/ontology/bibo/',
				'id3'		: 'http://id3.org/id3v2.4.0#',
				'dwc'		: 'http://rs.tdwg.org/dwc/terms/',
				'vra'		: 'http://purl.org/vra/',
				'cp'		: 'http://scalar.cdla.oxycreates.org/commonplace/terms/',
				'tk'		: 'http://localcontexts.org/tk/'  /* Temp */
			},
			additional_formats: [],
			check_for_existing_pages: true,
			existing: []
	};

	var opts = {};
	if ('undefined'!=typeof(Papa)) defaults.additional_formats.push('csv');

	var rdfimporter_methods = {
			
		init : function(options, callback) {
			opts = $.extend( {}, defaults, options );
			opts.queue = {};
			opts.url_map = {}
			opts.relations = {};
			opts.existing = {};
			return this.each(function() {
				var $this = $(this);
				opts['$this'] = $this;
				var go = function() {
					// Queue incoming RDF-JSON pages and relationships
			        $.fn.rdfimporter('queue', options, function() {	  
			        	// Once queued, save pages (which includes media-pages)
			        	$content_progress = $this.find('#content_progress'); 
			        	$content_progress_text = $content_progress.find('span');
			        	//console.log(opts);
			        	//return;
			        	$.fn.rdfimporter('pages', function(pagination, error_msg) {
			        		var progress = ((pagination.count/pagination.total)*100)+'%';
			        		$content_progress.css('width', progress);
			        		$content_progress_text.text('Content '+pagination.count + ' of '+pagination.total);
			        		if (pagination.error) $.fn.rdfimporter('error', {el:$content_progress,msg:error_msg});
			        		// Once pages are saved, save relationships
			        		if (pagination.count==pagination.total) {
					        	$relations_progress = $this.find('#relations_progress'); 
					        	$relations_progress_text = $relations_progress.find('span');
					        	$.fn.rdfimporter('relations', function(pagination, error_msg) {
					        		var progress = ((pagination.count/pagination.total)*100)+'%';
					        		$relations_progress.css('width', progress);
					        		$relations_progress_text.text('Relation '+pagination.count + ' of '+pagination.total);
					        		if (pagination.error) $.fn.rdfimporter('error', {el:$relations_progress,msg:error_msg});
					        		// Once complete, finish
					        		if (pagination.count==pagination.total) callback();
					        	});				        			
			        		};
			        	});			
			        });
				};
				if (opts.check_for_existing_pages) {
					$.fn.rdfimporter('existing', options, function() {
						go();
					});
				} else {
					go();
				};
			});	 
		},
		perms : function(options, callback) {
			var url = options.url.replace(/\/$/, "")+'/login_status';
			$.getJSON(url, function(status) {
				callback(status)
			}).fail(function() {
				callback({});
			});
		},
		book_rdf : function(options, callback) {
			var url = options.url.replace(/\/$/, "")+'/rdf?format=json&callback=?';
			$.getJSON(url, function(rdf) {
				for (var uri in rdf) break;  // First node
				if ('http://scalar.usc.edu/2012/01/scalar-ns#Book' != rdf[uri]['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'][0].value) {
					callback({err:'The returned RDF-JSON does not represent a Scalar book'});
					return;
				}
				callback({uri:uri,rdf:rdf[uri]});
			}).fail(function() {
			    callback({err:'The request to external RDF-JSON failed'});
			});
		},		
		rdf : function(options, callback) {
			// String
			if ('undefined'!=typeof(options.rdf)) {
				var rdf = options.rdf;
				try {
					rdf = $.fn.rdfimporter('format_to_json',rdf);
				} catch (e) {	
					callback({err:e});
					return;
				}
				callback({rdf:rdf});
			// URL to Scalar-formatted RDF-JSON
			} else if ('undefined'!=typeof(options.url)) {
				var url = options.url.replace(/\/$/, "")+'/rdf/instancesof/content?rec=1&ref=1&format=json&callback=?';
			    $.getJSON( url, function(rdf) {
			    	callback({rdf:rdf});
			    }).fail(function() {
			        callback({err:'Failed to get external RDF-JSON'});
			    });
			// File
			} else if ('undefined'!=typeof(options.file)) {
				if (!options.file.files.length) {
					callback({err:'No file selected'});
					return;
				}			
				var source_file = options.file.files[0];
				var textType = /text.*/;
				// Type is unpredictable so commenting out
				/*
				if (!source_file.type.match(textType)) {
					callback({err:'File is not a text file'});
					return;	
				}
				*/
				var reader = new FileReader();
				reader.onload = function(e) {
					var rdf = reader.result;
					try {
						rdf = $.fn.rdfimporter('format_to_json',rdf);
					} catch (e) {
						callback({err:e});
						return;
					}
					callback({rdf:rdf});
				}
				reader.readAsText(source_file);
			} else {
				callback({err:'Request was improperly formatted'});
			}
		},	
		queue : function(options, callback) {
			if ('function'==typeof(options)) callback = options;
			$.each(opts.rdf, function(key,value) {
				if ('number'==typeof(key)) key = '_:'+key.toString();  // bnode
				var entry_type = $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'});
				// Value is a relationship (oac:Annotation)
				if ('http://www.openannotation.org/ns/Annotation' == entry_type) {
					var hash = '';
					var target = value['http://www.openannotation.org/ns/hasTarget'][0].value;
					if (-1!=target.indexOf('#')) hash = target.substr(target.lastIndexOf('#')+1);
					var target_uri = (-1!=target.indexOf('#')) ? target.substr(0, target.indexOf('#')) : target;
					if (-1!==target_uri.search(/^(.*)\.[0-9]*$/)) target_uri = target_uri.match(/^(.*)\.[0-9]*$/)[1]; // remove .#
					if (!target_uri.length || target_uri == opts.source_url) return;  // Category rel node
					var rel_type = $.fn.rdfimporter('hash_to_rel_type', hash);
					var body_uri = value['http://www.openannotation.org/ns/hasBody'][0].value;
					if (-1!==body_uri.search(/^(.*)\.[0-9]*$/)) body_uri = body_uri.match(/^(.*)\.[0-9]*$/)[1]; // remove .#
					if ('undefined'==typeof(opts.relations[body_uri])) opts.relations[body_uri] = {};
					if ('undefined'==typeof(opts.relations[body_uri][rel_type])) opts.relations[body_uri][rel_type] = [];
					opts.relations[body_uri][rel_type].push({child:target_uri,hash:hash});
				// Value is a user node (foaf:Person)
				} else if (entry_type !== null && entry_type.search(/Person/) !== -1) {
					// This is handled in the nodes themselves
				// Value is a Scalar Page (scalar:Composite or scalar:Media)
				} else if (entry_type !== null && entry_type.search(/Media|Composite/) !== -1) {						
					if (opts.queue[key] === undefined) opts.queue[key] = {};
					// Required API handshake fields
 					opts.queue[key].action = 'ADD';
					opts.queue[key].native = 'true';
					opts.queue[key]['scalar:urn'] = '';
					opts.queue[key].id = opts.dest_id;
					opts.queue[key].api_key = '';
					opts.queue[key]['scalar:child_urn'] = opts.dest_urn;
					opts.queue[key]['scalar:child_type'] = 'http://scalar.usc.edu/2012/01/scalar-ns#Book';
					opts.queue[key]['scalar:child_rel'] = 'page';
					opts.queue[key]['urn:scalar:book'] = opts.dest_urn;
					opts.queue[key]['rdf:type'] = entry_type;
					// Extrapolated page fields
					opts.queue[key]['scalar:slug'] = key.substr(options.source_url.length+1);  // options.source_url is the book URL
					opts.queue[key]['scalar:thumbnail'] = $.fn.rdfimporter('abs_url', $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'}), options.source_url);
					opts.queue[key]['scalar:background'] = $.fn.rdfimporter('abs_url', $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://scalar.usc.edu/2012/01/scalar-ns#background'}), options.source_url);
					opts.queue[key]['scalar:audio'] = $.fn.rdfimporter('abs_url', $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://scalar.usc.edu/2012/01/scalar-ns#audio'}), options.source_url);
					opts.queue[key]['scalar:banner'] = $.fn.rdfimporter('abs_url', $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://scalar.usc.edu/2012/01/scalar-ns#banner'}), options.source_url);
					opts.queue[key]['scalar:custom_style'] = $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://scalar.usc.edu/2012/01/scalar-ns#customStyle'});
					opts.queue[key]['scalar:custom_scripts'] = $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://scalar.usc.edu/2012/01/scalar-ns#customScript'});
				// Value is a Scalar Version (scalar:Version)
				} else if (entry_type !== null && entry_type.search(/Version/) !== -1) {
				    // Use page url as key to the opts.queue by removing .# extension if it exists
				    var k = (-1!=key.indexOf('.') && key.lastIndexOf('.') > key.lastIndexOf('/')) ? key.match(/^(.*)\.[0-9]*$/)[1] : key.slice();
				    // Init queue if doesn't exist
				    if (opts.queue[k] === undefined) opts.queue[k] = {};
				    // Extrapolated version fields
				    opts.queue[k]['scalar:url'] = $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://simile.mit.edu/2003/10/ontologies/artstor#url'});
				    opts.queue[k]['scalar:default_view'] = $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://scalar.usc.edu/2012/01/scalar-ns#defaultView'});
				    // All other fields (including title, description, and additional metadata)
				    var disallowed = ['art:url','scalar:defaultView'];  // Items covered earlier
				    for (var p in value) {
				    	var pnode = $.fn.rdfimporter('pnode',p);
				    	if (null==pnode || -1!=disallowed.indexOf(pnode)) continue;
				    	opts.queue[k][pnode] = $.fn.rdfimporter('rdf_values',{rdf:value,p:p,collapse:true});
				    }
				    // Replace relative URLs with absolute URLs in the content area
				    if ('undefined'!=typeof(opts.queue[k]['sioc:content']) && opts.queue[k]['sioc:content']) {
				       	opts.queue[k]['sioc:content'] = opts.queue[k]['sioc:content'].replace(/(<(a|img)[^>]+(href|src)=")(?!http)([^"]+)/g, '$1'+options.source_url+'/$4');  // http://stackoverflow.com/questions/4882255/regular-expression-for-relative-links-only
				    }
				    // Reference relations
				    var references = $.fn.rdfimporter('rdf_values',{rdf:value,p:'http://purl.org/dc/terms/references'});
				    if (references) {
				        for (var j = 0; j < references.length; j++) {
				        	if ('undefined'==typeof(opts.relations[k])) opts.relations[k] = {};
				        	if ('undefined'==typeof(opts.relations[k]['reference'])) opts.relations[k]['reference'] = [];
				        	opts.relations[k]['reference'].push({child:references[j],hash:''});
				        }
				    }
				    delete opts.queue[k]['dcterms:references'];
				    // TODO: lens relations
					var _entry_type = 'http://scalar.usc.edu/2012/01/scalar-ns#Composite';
					if ( null!=$.fn.rdfimporter('rdf_value',{rdf:value,p:'http://simile.mit.edu/2003/10/ontologies/artstor#url'}) ) {
						_entry_type = 'http://scalar.usc.edu/2012/01/scalar-ns#Media';
					}
 					opts.queue[k].action = 'ADD';
					opts.queue[k].native = 'true';
					opts.queue[k]['scalar:urn'] = '';
					opts.queue[k].id = opts.dest_id;
					opts.queue[k].api_key = '';
					opts.queue[k]['scalar:child_urn'] = opts.dest_urn;
					opts.queue[k]['scalar:child_type'] = 'http://scalar.usc.edu/2012/01/scalar-ns#Book';
					opts.queue[k]['scalar:child_rel'] = 'page';
					opts.queue[k]['urn:scalar:book'] = opts.dest_urn;
					opts.queue[k]['rdf:type'] = _entry_type;
				// Value is a combined page/version node
				} else {
					if (opts.queue[key] === undefined) opts.queue[key] = {};
					// Page is either media or a composite
					var _entry_type = 'http://scalar.usc.edu/2012/01/scalar-ns#Composite';
					if ( null!=$.fn.rdfimporter('rdf_value',{rdf:value,p:'http://simile.mit.edu/2003/10/ontologies/artstor#url'}) ) {
						_entry_type = 'http://scalar.usc.edu/2012/01/scalar-ns#Media';
					}
					// Required API handshake fields
 					opts.queue[key].action = 'ADD';
					opts.queue[key].native = 'true';
					opts.queue[key]['scalar:urn'] = '';
					opts.queue[key].id = opts.dest_id;
					opts.queue[key].api_key = '';
					opts.queue[key]['scalar:child_urn'] = opts.dest_urn;
					opts.queue[key]['scalar:child_type'] = 'http://scalar.usc.edu/2012/01/scalar-ns#Book';
					opts.queue[key]['scalar:child_rel'] = 'page';
					opts.queue[key]['urn:scalar:book'] = opts.dest_urn;
					opts.queue[key]['rdf:type'] = _entry_type;
					// Slug
					if ($.fn.rdfimporter('rdf_value',{rdf:value,p:'http://scalar.usc.edu/2012/01/scalar-ns#slug'})) {
						opts.queue[key]['scalar:slug'] = $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://scalar.usc.edu/2012/01/scalar-ns#slug'});
					} else if (options.source_url && options.source_url.length) {
						var slug = key.replace(options.source_url,'');
						if ('/'==slug.substr(0,1)) slug = slug.substr(1);
						if ('_'==slug.substr(0,1)) slug = null;
						opts.queue[key]['scalar:slug'] = slug;
					};
					// Extrapolated other page fields
					opts.queue[key]['scalar:thumbnail'] = $.fn.rdfimporter('abs_url', $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'}), options.source_url);
					opts.queue[key]['scalar:background'] = $.fn.rdfimporter('abs_url', $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://scalar.usc.edu/2012/01/scalar-ns#background'}), options.source_url);
					opts.queue[key]['scalar:audio'] = $.fn.rdfimporter('abs_url', $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://scalar.usc.edu/2012/01/scalar-ns#audio'}), options.source_url);
					opts.queue[key]['scalar:banner'] = $.fn.rdfimporter('abs_url', $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://scalar.usc.edu/2012/01/scalar-ns#banner'}), options.source_url);
					if (key.search(/term/i) !== -1) opts.queue[key]['scalar:category'] = 'term';
					opts.queue[key]['scalar:url'] = $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://simile.mit.edu/2003/10/ontologies/artstor#url'});
				    // If check for existing pages is turned on, UPDATE rather than ADD if it exists
					if (opts.check_for_existing_pages) {
						for (var k = 0; k < opts.existing.length; k++) {	
							var pass = false;
							// URL is the same
							if ('undefined' != typeof(opts.queue[key]['scalar:url']) && opts.queue[key]['scalar:url'] &&  opts.existing[k].url.substr(opts.existing[k].url.indexOf('//')) == opts.queue[key]['scalar:url'].substr(opts.queue[key]['scalar:url'].indexOf('//'))) pass = true;
							// Slug is the same
							if ('undefined' != typeof(opts.queue[key]['scalar:slug']) && opts.queue[key]['scalar:slug'] && opts.existing[k].slug == opts.queue[key]['scalar:slug']) pass = true;
							if (!pass) continue;
							opts.queue[key]['scalar:slug'] = opts.existing[k].slug;
							opts.queue[key]['scalar:urn'] = opts.existing[k].urn;
							opts.queue[key].action = 'UPDATE';
							if ('undefined'!=typeof(opts.existing[k].referenced_by_urn) && opts.existing[k].referenced_by_urn.length) {
								for (var m = 0; m < opts.existing[k].referenced_by_urn.length; m++) {
									opts.url_map[ opts.existing[k].referenced_by_urn[m] ] = opts.existing[k].referenced_by_urn[m];
									if ('undefined'==typeof(opts.relations[ opts.existing[k].referenced_by_urn[m] ])) opts.relations[ opts.existing[k].referenced_by_urn[m] ] = {};
									if ('undefined'==typeof(opts.relations[ opts.existing[k].referenced_by_urn[m] ].reference)) opts.relations[ opts.existing[k].referenced_by_urn[m] ].reference = [];
									opts.relations[ opts.existing[k].referenced_by_urn[m] ].reference.push( {child:opts.existing[k].urn, hash:''} );
								};
							};
							if ('undefined'!=typeof(opts.existing[k].reference_of_urn) && opts.existing[k].reference_of_urn.length) {
								for (var m = 0; m < opts.existing[k].reference_of_urn.length; m++) {
									opts.url_map[ opts.existing[k].reference_of_urn[m] ] = opts.existing[k].reference_of_urn[m];
									if ('undefined'==typeof(opts.relations[ opts.existing[k].reference_of_urn[m] ])) opts.relations[ opts.existing[k].reference_of_urn[m] ] = {};
									if ('undefined'==typeof(opts.relations[ opts.existing[k].reference_of_urn[m] ].reference)) opts.relations[ opts.existing[k].reference_of_urn[m] ].reference = [];
									opts.relations[ opts.existing[k].reference_of_urn[m] ].reference.push( {child:opts.existing[k].urn, hash:''} );
								};
							};
							if ('undefined'!=typeof(opts.existing[k].lens_of) && opts.existing[k].lens_of.length) {
								opts.url_map[ opts.existing[k].urn ] = opts.existing[k].urn;
								if ('undefined'==typeof(opts.relations[ opts.existing[k].urn ])) opts.relations[ opts.existing[k].urn ] = {};
								opts.relations[ opts.existing[k].urn ].lens = [{child:'',hash:'',lens:opts.existing[k].lens_of}];
							};
							if ('undefined'!=typeof(opts.existing[k].relationships_by_urn)) {
								for (var rel in opts.existing[k].relationships_by_urn) {
									if (-1 != rel.indexOf('_by')) {
										var rel_type = rel.replace('_by', '');
										for (var m = 0; m < opts.existing[k].relationships_by_urn[rel].length; m++) {
											opts.url_map[ opts.existing[k].relationships_by_urn[rel][m]['urn'] ] = opts.existing[k].relationships_by_urn[rel][m]['urn'];
											if ('undefined'==typeof(opts.relations[ opts.existing[k].relationships_by_urn[rel][m]['urn'] ])) opts.relations[ opts.existing[k].relationships_by_urn[rel][m]['urn'] ] = {};
											if ('undefined'==typeof(opts.relations[ opts.existing[k].relationships_by_urn[rel][m]['urn'] ][rel_type])) opts.relations[ opts.existing[k].relationships_by_urn[rel][m]['urn'] ][rel_type] = [];
											opts.relations[ opts.existing[k].relationships_by_urn[rel][m]['urn'] ][rel_type].push( {child:opts.existing[k].urn, hash:opts.existing[k].relationships_by_urn[rel][m]['hash']} );
										};										
									} else if (-1 != rel.indexOf('_of')) {
										var rel_type = rel.replace('_of', '');
										for (var m = 0; m < opts.existing[k].relationships_by_urn[rel].length; m++) {
											opts.url_map[ opts.existing[k].relationships_by_urn[rel][m]['urn'] ] = opts.existing[k].relationships_by_urn[rel][m]['urn'];
											if ('undefined'==typeof(opts.relations[ opts.existing[k].relationships_by_urn[rel][m]['urn'] ])) opts.relations[ opts.existing[k].relationships_by_urn[rel][m]['urn'] ] = {};
											if ('undefined'==typeof(opts.relations[ opts.existing[k].relationships_by_urn[rel][m]['urn'] ][rel_type])) opts.relations[ opts.existing[k].relationships_by_urn[rel][m]['urn'] ][rel_type] = [];
											opts.relations[ opts.existing[k].relationships_by_urn[rel][m]['urn'] ][rel_type].push( {child:opts.existing[k].urn, hash:opts.existing[k].relationships_by_urn[rel][m]['hash']} );
										};	
									};
								};
							};
						};
					};
					// Extrapolated version fields
				    opts.queue[key]['scalar:default_view'] = $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://scalar.usc.edu/2012/01/scalar-ns#defaultView'});
				    if ($.fn.rdfimporter('rdf_value',{rdf:value,p:'http://www.w3.org/2000/01/rdf-schema#label'})) {
				      	opts.queue[key]['dcterms:title'] = $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://www.w3.org/2000/01/rdf-schema#label'});
				    }
				    if ($.fn.rdfimporter('rdf_value',{rdf:value,p:'http://xmlns.com/foaf/0.1/Page'})) {
				        opts.queue[key]['dcterms:source'] = $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://xmlns.com/foaf/0.1/Page'});
				    }	
				    if ($.fn.rdfimporter('rdf_value',{rdf:value,p:'http://www.w3.org/ns/prov#wasAttributedTo'})) {
				        var wasAttributedTo = $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://www.w3.org/ns/prov#wasAttributedTo'});
				        if ('undefined'!=typeof(opts.rdf[wasAttributedTo])) {
				            opts.queue[key]['dcterms:creator'] = $.fn.rdfimporter('rdf_value',{rdf:opts.rdf[wasAttributedTo],p:'http://xmlns.com/foaf/0.1/name'});;
				        }
				    }
				    var lat = $.fn.rdfimporter('rdf_value',{rdf:value,p:'latitude'});
				    var lng = $.fn.rdfimporter('rdf_value',{rdf:value,p:'longitude'});
				    if (null!==lat && null!==lng && 'undefined'==typeof(opts.queue[key]['dcterms:spatial'])) {
				    	opts.queue[key]['dcterms:spatial'] = lat+','+lng;
				    }
				    // All other fields (including title, description, and additional metadata)
				    var disallowed = ['art:url','scalar:defaultView','scalar:urn','scalar:author','scalar:baseType','cp:url'];
				    for (var p in value) {
				        var pnode = $.fn.rdfimporter('pnode',p);
				        if (null==pnode || -1!=disallowed.indexOf(pnode)) continue;
				        opts.queue[key][pnode] = $.fn.rdfimporter('rdf_values',{rdf:value,p:p,collapse:true});
				    }
				    // Replace relative URLs with absolute URLs in the content area
				    if (null!==opts.queue[key]['sioc:content'] && 'undefined'!=typeof(opts.queue[key]['sioc:content'])) {
				        opts.queue[key]['sioc:content'] = opts.queue[key]['sioc:content'].replace(/(<(a|img)[^>]+(href|src)=")(?!http)([^"]+)/g, '$1'+options.source_url+'/$4');  // http://stackoverflow.com/questions/4882255/regular-expression-for-relative-links-only
				    }							
				};
			});
			console.log(opts);
			callback();
		},
		pages : function(options, callback) {
			if ('function'==typeof(options)) callback = options;
			var page_count = 0;
			var page_total = 0;
			$.each(opts.queue,function(key,value) {
				console.log(value);
				page_total++;
				var url = opts.dest_url+'/api/'+value.action.toLowerCase();
				$.post(url, value, function(page_data) {
					if ('object'!=typeof(page_data)) return;
					$.each(page_data, function(k,v) {
						if ('/'==k.substr(k.length-1, 1)) k = k.substr(0, k.length-1);
						if ('UPDATE'==value.action) {
							opts.url_map[value['scalar:urn']] = v['http://scalar.usc.edu/2012/01/scalar-ns#urn'][0].value;
						} else {
							opts.url_map[key] = k.match(/^(.*)\.[0-9]*$/)[1];
						}
					});
				}).always(function(err) {
					page_count++;
					var msg = '';
					if ('object'!=typeof(err)) {
						var msg = 'URL isn\'t a Scalar Save API URL ['+url+'] for "'+value['dcterms:title']+'"';
					} else if ('error'==err.statusText) {
						var msg = 'There was an error resolving the Save API URL ['+url+'] for "'+value['dcterms:title']+'"';
					} else if ('Unauthorized'==err.statusText) {
						var msg = 'Could not save: you are logged out of the destination Scalar book or do not have permissions to edit';
					}
					callback({dest_url:opts.dest_url,url:url,count:page_count,total:page_total,error:((msg.length)?true:false)}, msg);
				});
				opts.queue = {};
			});
		},
		relations : function(callback) {
			var relate_count = 0;
			var relate_total = 0;
			var url = opts.dest_url+'/api/relate';
			if ($.isEmptyObject(opts.relations)) {
				callback({url:url,count:0,total:0,error:false}, '');	
			}
			for (var old_parent_url in opts.relations) {
				var parent_url = opts.url_map[old_parent_url];
				var urn = parent_url.replace(opts.dest_url,'');
				if ('/'==urn.substr(0,1)) urn = urn.substr(1);
				console.log(old_parent_url + ' ' + parent_url + ' '+urn);
				for (var rel_type in opts.relations[old_parent_url]) {
					for (var j in opts.relations[old_parent_url][rel_type]) {
						if ('object' != typeof(opts.relations[old_parent_url][rel_type][j])) continue;
						var post = {};
						post['action'] = 'RELATE';
						post['native'] = 'true';
						post['id'] = opts.dest_id;
						post['api_key'] = '';
						post['scalar:fullname'] = '';
						post['scalar:urn'] = urn;
						post['scalar:child_rel'] = $.fn.rdfimporter('child_rel', rel_type);
						// Write the relational values
						var hash = ('undefined'!=typeof(opts.relations[old_parent_url][rel_type][j].hash)) ? opts.relations[old_parent_url][rel_type][j].hash : '';
						jQuery.extend(post, $.fn.rdfimporter('hash_to_post', hash));
						var lens = ('undefined'!=typeof(opts.relations[old_parent_url][rel_type][j].lens)) ? opts.relations[old_parent_url][rel_type][j].lens : '';
						if (lens.length) post['scalar:contents'] = lens;
						var old_child_url = ('undefined'!=typeof(opts.relations[old_parent_url][rel_type][j].child)) ? opts.relations[old_parent_url][rel_type][j].child : '';
						var child_url = opts.url_map[old_child_url];
						if ('undefined' != typeof(child_url)) {
							var child_urn = child_url.replace(opts.dest_url, '');
							if ('/'==child_urn.substr(0,1)) child_urn = child_urn.substr(1);
							post['scalar:child_urn'] = child_urn;
						}
						relate_total++;
						$.post(url, post, function(relation_data){}).always(function(data) {
							relate_count++;
							var msg = '';
							if ('undefined'!=typeof(data.responseJSON)) {
								var msg = 'There was an error saving relationship for '+parent_urn+' > '+child_urn+': '+data.responseJSON.error.message[0].value;
							}
							callback({url:url,count:relate_count,total:relate_total,error:((msg.length)?true:false)}, msg);							
						});
					}
				}
			}
			/*
			opts.url_map = {}
			opts.relations = {};
			*/
		},
		existing : function(options, callback) {
			if ('function'==typeof(options)) callback = options;
			var url = opts.dest_url+'/rdf/instancesof/content?format=json&ref=1&rec=1&meta=0&callback=?';
			opts.existing = [];
			$('#existing_progress').fadeIn();
			if ($('link#base_url').length) $('<img src="'+$('link#base_url').attr('href')+'system/application/views/images/loading_dots.gif" />').appendTo($('#existing_progress > div'));
			$.getJSON(url, function(json) {
				for (var uri in json) {
					if ('undefined' == typeof(json[uri]['http://purl.org/dc/terms/isVersionOf'])) continue;
					var obj = {
						slug:json[uri]['http://purl.org/dc/terms/isVersionOf'][0].value.replace(opts.dest_url+'/',''),
						uri:json[uri]['http://purl.org/dc/terms/isVersionOf'][0].value,
						urn:json[uri]['http://scalar.usc.edu/2012/01/scalar-ns#urn'][0].value,
						url:('undefined'!=typeof(json[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#url'])) ? json[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#url'][0].value : '',
						title:json[uri]['http://purl.org/dc/terms/title'][0].value,
						urn:json[uri]['http://scalar.usc.edu/2012/01/scalar-ns#urn'][0].value
					};
					if ('undefined'!=typeof(json[uri]['http://purl.org/dc/terms/isReferencedBy'])) {
						obj.referenced_by_urn = [];
						for (var j = 0; j < json[uri]['http://purl.org/dc/terms/isReferencedBy'].length; j++) {
							var content_item = json[ json[uri]['http://purl.org/dc/terms/isReferencedBy'][j].value ];
							var version_item = json[ content_item['http://purl.org/dc/terms/hasVersion'][0].value ];
							obj.referenced_by_urn.push( version_item['http://scalar.usc.edu/2012/01/scalar-ns#urn'][0].value );
						};
					};
					if ('undefined'!=typeof(json[uri]['http://purl.org/dc/terms/isReferenceOf'])) {
						obj.reference_of_urn = [];
						for (var j = 0; j < json[uri]['http://purl.org/dc/terms/isReferenceOf'].length; j++) {
							var content_item = json[ json[uri]['http://purl.org/dc/terms/isReferenceOf'][j].value ];
							var version_item = json[ content_item['http://purl.org/dc/terms/hasVersion'][0].value ];
							obj.referenced_by_urn.push( version_item['http://scalar.usc.edu/2012/01/scalar-ns#urn'][0].value );
						};
					};
					if ('undefined'!=typeof(json[uri]['http://scalar.usc.edu/2012/01/scalar-ns#isLensOf'])) {
						obj.lens_of = json[uri]['http://scalar.usc.edu/2012/01/scalar-ns#isLensOf'][0].value;
					};
					for (var rel_uri in json) {
						if ('undefined'==typeof(json[rel_uri]['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'])) continue;
						if ('http://www.openannotation.org/ns/Annotation'!=json[rel_uri]['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'][0].value) continue;
						var body = json[rel_uri]['http://www.openannotation.org/ns/hasBody'][0].value;
						var target = json[rel_uri]['http://www.openannotation.org/ns/hasTarget'][0].value;
						var rel_type = '';
						var hash = '';
						if (-1 == target.indexOf('#')) {
							rel_type = 'tag';
						} else {
							var hash = target.substr(target.indexOf('#')+1);
							rel_type = $.fn.rdfimporter('hash_to_rel_type', hash);
							target = target.substr(0, target.indexOf('#'));
						};
						if (uri == target.substr(0, uri.length)) {  // has a parent
							rel_type += '_by';
							if ('undefined' == typeof(obj.relationships_by_urn)) obj.relationships_by_urn = {};
							if ('undefined' == typeof(obj.relationships_by_urn[rel_type])) obj.relationships_by_urn[rel_type] = [];
							var version_item = json[ body ];
							obj.relationships_by_urn[rel_type].push({urn:version_item['http://scalar.usc.edu/2012/01/scalar-ns#urn'][0].value,hash:hash});
						} else if (rel_uri == body) {  // has a child
							rel_type += '_of';
							// TODO
						};
					};
					opts.existing.push(obj);
				};
				if ($('#existing_progress').is(':visible')) $('#existing_progress').fadeOut().find('img').remove();
				callback();
			});
		},
		error : function(options) {
			$progress_log = $('#progress_log');
			options.el.addClass('progress-bar-danger');
			if ($progress_log.is(':hidden')) $progress_log.fadeIn();
			$progress_log.append(options.msg+"<br />");
		},
		uri : function(_pnode) {
			for (var prefix in defaults.ontologies) {
				var uri = defaults.ontologies[prefix];
				if (_pnode.substr(0,prefix.length+1)==prefix+':') {
					return _pnode.replace(prefix+':',uri);
				}
			}
			return null;			
		},
		pnode : function(_uri) {
			for (var prefix in defaults.ontologies) {
				var uri = defaults.ontologies[prefix];
				if (_uri.substr(0,uri.length)==uri) {
					return _uri.replace(uri,prefix+':');
				}
			}
			return null;
		},
		format_to_json : function(rdf) {
			// CSV
			if (-1!=defaults.additional_formats.indexOf('csv')) {
				try {
					var csv = Papa.parse(rdf);
					csv = ('undefined'!=typeof(csv.errors[0]) && csv.errors[0].code.length) ? null : csv.data;
				} catch(err) {
					alert(err);
				}
				if ('undefined'!=typeof(csv) && null!=csv) {
					var json = [];
					var fields = [];
					for (var j = 0; j < csv[0].length; j++) {
						var uri = $.fn.rdfimporter('uri',csv[0][j]);
						if (null === uri) uri = k;
						fields.push(uri);
					}
					csv.shift();
					for (var j = 0; j < csv.length; j++) {
						for (var k = 0; k < csv[j].length; k++) {
							if ('undefined'==typeof(json[j])) json[j] = {};
							var uri = fields[k];
							json[j][uri] = csv[j][k]; 
						}
					}
					for (var j = 0; j < json.length; j++) {  // Transform specific predicates
						if ('undefined'!=typeof(json[j]['http://purl.org/dc/terms/subject'])) {
							var values = json[j]['http://purl.org/dc/terms/subject'].split(',');
							for (var k = 0; k < values.length; k++) {
								values[k] = values[k].trim();
							}
							json[j]['http://purl.org/dc/terms/subject'] = values.slice();
						}
					}
					return json;
				}
			}
			// JSON string
			rdf = JSON.parse(rdf);
			return rdf;
		},
		valid_json : function(rdf) {
			return true;  // for now 
			// Check RDF-JSON string to make sure it's styled in valid Scalar format
			var content = 0;
			var versions = 0;
			for (var uri in rdf) {
				if ('undefined'!=typeof(rdf[uri]["http://purl.org/dc/terms/hasVersion"])) {  // Content node
					content++;
					continue;
				} else if ('undefined'!=typeof(rdf[uri]["http://purl.org/dc/terms/isVersionOf"])) {  // Version node
					versions++;
					continue;
				} else if ('undefined'!=typeof(rdf[uri]["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"]) && rdf[uri]["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"][0].value=='http://www.openannotation.org/ns/Annotation') {  // Relationship node ("annotation")
					continue;
				}
				throw "Not formatted for Scalar (each node should have a dcterms:hasVersion predicate, a dcterms:isVersionOf predicate, or a rdf:type oa:Annotation)";
			}	
			if (content != versions) throw "Number of content nodes does not match number of verion nodes";
			return true;
		},	
		hash_to_post : function(hash) {
			var hash_arr = hash.split('&');
			var fields = {};
			var ret = {};
			// First get field/value set
			for (var j = 0; j < hash_arr.length; j++) {
				var arr = hash_arr[j].split('=');
				fields[arr[0]] = arr[1];
			}
			// Map field to post field
			for (var field in fields) {
				switch (field) {
					case 't':
						var npt = fields[field].substr(fields[field].lastIndexOf(':')+1);
						var ts = npt.split(',');
						ret['scalar:start_seconds'] = ts[0];
						ret['scalar:end_seconds'] = ts[1];
						break;
					case 'line':
						var ts = fields[field].split(',');
						ret['scalar:start_line_num'] = ts[0];
						ret['scalar:end_line_num'] = ts[1];						
						break;
					case 'xywh':
						ret['scalar:points'] = fields[field];
						break;
					case 'datetime':
						ret['scalar:datetime'] = fields[field];
						break;
					case 'index':
						ret['scalar:sort_number'] = fields[field];
						break;
				}
			}
			return ret;
		},
		hash_to_rel_type : function(str) {
			var rel_type = '';
			if ('t'==str.substr(0,1)) rel_type = 'anno';
			if ('line'==str.substr(0,4)) rel_type = 'anno';
			if ('xywh'==str.substr(0,4)) rel_type = 'anno';
			if ('datetime'==str.substr(0,8)) rel_type = 'reply';
			if ('index'==str.substr(0,5)) rel_type = 'path';
			if (!rel_type.length) rel_type = 'tag';
			return rel_type;
		},
		source_url_from_rdf_fields : function(rdf) {
			var source_url = '';
			for (var uri in rdf) {
				// Get URL from user node in Scalar-formatted RDF
				if (
					'undefined'!=typeof(rdf[uri]['http://www.w3.org/ns/prov#wasAttributedTo']) && 
					'undefined'!=typeof(rdf[uri]['http://www.w3.org/ns/prov#wasAttributedTo'][0]) && 
					'undefined'!=typeof(rdf[uri]['http://www.w3.org/ns/prov#wasAttributedTo'][0].value) && 
					rdf[uri]['http://www.w3.org/ns/prov#wasAttributedTo'][0].value.indexOf('/users/') != -1
				   ) {
					var index = rdf[uri]['http://www.w3.org/ns/prov#wasAttributedTo'][0].value.indexOf('/users/');
					source_url = rdf[uri]['http://www.w3.org/ns/prov#wasAttributedTo'][0].value.substr(0, index);
					break;
				// Get URL from user node in Mediathread-formatted RDF
				} else if (
					'undefined'!=typeof(rdf[uri]['http://www.w3.org/ns/prov#wasAttributedTo']) && 
					'undefined'!=typeof(rdf[uri]['http://www.w3.org/ns/prov#wasAttributedTo'][0]) && 
					'undefined'!=typeof(rdf[uri]['http://www.w3.org/ns/prov#wasAttributedTo'][0].value) && 
					rdf[uri]['http://www.w3.org/ns/prov#wasAttributedTo'][0].value.indexOf('/user/') != -1
				) {
					var index = rdf[uri]['http://www.w3.org/ns/prov#wasAttributedTo'][0].value.indexOf('/user/');
					source_url = rdf[uri]['http://www.w3.org/ns/prov#wasAttributedTo'][0].value.substr(0, index);
					break;
				}
			}
			return source_url;
		},
		child_rel : function(rel_type) {
			switch (rel_type) {
				case 'path':
					return 'contained';
				case 'anno':
					return 'annotated';
				case 'reply':
					return 'replied';
				case 'tag':
					return 'tagged';
				case 'reference':
					return 'referenced';			
				case 'lens':
					return 'grouped';
			}
			return '';
		},
		rdf_values : function(options) {
			var rdf = options.rdf;
			var p = options.p;
			if('undefined' == typeof(rdf[p]) || !rdf[p]) return null;
			var values = [];
			if ('string'==typeof(rdf[p])) {
				values.push(rdf[p]);
			} else {
				for (var j = 0; j < rdf[p].length; j++) {
					if ('string'==typeof(rdf[p][j])) {
						values.push(rdf[p][j]);
					} else {
						values.push(rdf[p][j].value);
					}
				}
			}
			if (options.collapse) {
				if (1==values.length) return values[0];
			}
			return values;
		},	
		rdf_value : function(options) {
			var rdf = options.rdf;
			var p = options.p;
			if('undefined' == typeof(rdf[p]) || !rdf[p]) return null;
			if ('string'==typeof(rdf[p])) {
				return rdf[p];
			} else if ('string'==typeof(rdf[p][0])) {
				return rdf[p][0];
			} else if ('undefined'!=typeof(rdf[p][0].value)) {
				return rdf[p][0].value;
			}
			return null;
		},
		abs_url : function(url, prefix) {
			if (!url || !url.length) return url;
			if (!prefix || !prefix.length) return url;
			if (-1 != url.indexOf(':')) return url;
			if (prefix.substr(prefix.length-1,1)!='/') prefix = prefix+'/';
			return prefix+url;
		}
	};

	$.fn.rdfimporter = function(methodOrOptions) {		

		if ( rdfimporter_methods[methodOrOptions] ) {
			return rdfimporter_methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
			// Default to "init"
			return rdfimporter_methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.rdfimporter' );
		}    
		
	};
	
})(jQuery);
