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
 * @projectDescription  Transfer RDF-JSON from a source Scalar book to a destination book
 * @author				Craig Dietrich
 * @author				Michael Lynch
 * @version             1.1
 */

(function($) {

	var defaults = {
			queue: {},
			relations: {},
			url_map: {},
			ontologies: {
				'dc':'http://purl.org/dc/elements/1.1/',
				'dcterms':'http://purl.org/dc/terms/',
				'art':'http://simile.mit.edu/2003/10/ontologies/artstor#',
				'sioc':'http://rdfs.org/sioc/ns#',
				'sioctypes':'http://rdfs.org/sioc/types#',
				'ov':'http://open.vocab.org/terms/',
				'scalar':'http://scalar.usc.edu/2012/01/scalar-ns#',
				'exif':'http://ns.adobe.com/exif/1.0/',
				'iptc':'http://ns.exiftool.ca/IPTC/IPTC/1.0/'
			}
	};

	var opts = {};

	var rdfimporter_methods = {
			
		init : function(options, callback) {
			opts = $.extend( {}, defaults, options );
			opts.queue = {};
			opts.url_map = {}
			opts.relations = {};			
			return this.each(function() {
				var $this = $(this);
				opts['$this'] = $this;
				// Queue incoming RDF-JSON pages and relationships
		        $.fn.rdfimporter('queue', options, function() {	  
		        	// Once queued, save pages
		        	$content_progress = $this.find('#content_progress'); 
		        	$content_progress_text = $content_progress.find('span');
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
			// RDF-JSON string
			if ('undefined'!=typeof(options.rdf)) {
				var rdf = options.rdf;
				try {
					rdf = JSON.parse(rdf);
					$.fn.rdfimporter('valid_scalar_rdf',rdf);
				} catch (e) {	
					callback({err:e});
					return;
				}
				callback({rdf:rdf});
			// URL to RDF-JSON
			} else if ('undefined'!=typeof(options.url)) {
				var url = options.url.replace(/\/$/, "")+'/rdf/instancesof/content?rec=1&ref=1&format=json&callback=?';
			    $.getJSON( url, function(rdf) {
			    	callback({rdf:rdf});
			    }).fail(function() {
			        callback({err:'Failed to get external RDF-JSON'});
			    });
			// File to RDF-JSON
			} else if ('undefined'!=typeof(options.file)) {
				if (!options.file.files.length) {
					callback({err:'No file selected'});
					return;
				}			
				var source_file = options.file.files[0];
				var textType = /text.*/;
				// Type is unpredictable so commenting out for now
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
						rdf = JSON.parse(rdf);
						$.fn.rdfimporter('valid_scalar_rdf',rdf);
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
							if (opts.queue[key] === undefined) {
								opts.queue[key] = {};
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
							opts.queue[key]['rdf:type'] = entry_type;
							// Extrapolated page fields
							opts.queue[key]['scalar:slug'] = key.substr(options.source_url.length+1);  // options.source_url is the book URL
							opts.queue[key]['scalar:thumbnail'] = $.fn.rdfimporter('abs_url', $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'}), options.source_url);
							opts.queue[key]['scalar:background'] = $.fn.rdfimporter('abs_url', $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://scalar.usc.edu/2012/01/scalar-ns#background'}), options.source_url);
							opts.queue[key]['scalar:audio'] = $.fn.rdfimporter('abs_url', $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://scalar.usc.edu/2012/01/scalar-ns#audio'}), options.source_url);
							opts.queue[key]['scalar:banner'] = $.fn.rdfimporter('abs_url', $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://scalar.usc.edu/2012/01/scalar-ns#banner'}), options.source_url);
						// Value is a Scalar Version (scalar:Version)
						} else if (entry_type !== null && entry_type.search(/Version/) !== -1) {
				            // Use page url as key to the opts.queue by removing .# extension 
				            var k = key.match(/^(.*)\.[0-9]*$/)[1];
				            // Init queue if doesn't exist
				            if (opts.queue[k] === undefined) {
				            	opts.queue[k] = {};
				            }
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
				            if ('undefined'!=typeof(opts.queue[k]['sioc:content'])) {
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
						// Value is a combined page/version node
						} else {
							if (opts.queue[key] === undefined) {
								opts.queue[key] = {};
							}
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
							// Extrapolated page fields
							var slug = $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://scalar.usc.edu/2012/01/scalar-ns#slug'});
							if (slug==null) {
								var slug = key.replace(options.source_url,'');
								if ('/'==slug.substr(0,1)) slug = slug.substr(1);
							}
							opts.queue[key]['scalar:slug'] = slug;
							opts.queue[key]['scalar:thumbnail'] = $.fn.rdfimporter('abs_url', $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'}), options.source_url);
							opts.queue[key]['scalar:background'] = $.fn.rdfimporter('abs_url', $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://scalar.usc.edu/2012/01/scalar-ns#background'}), options.source_url);
							opts.queue[key]['scalar:audio'] = $.fn.rdfimporter('abs_url', $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://scalar.usc.edu/2012/01/scalar-ns#audio'}), options.source_url);
							opts.queue[key]['scalar:banner'] = $.fn.rdfimporter('abs_url', $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://scalar.usc.edu/2012/01/scalar-ns#banner'}), options.source_url);
							if (key.search(/term/i) !== -1) opts.queue[key]['scalar:category'] = 'term';
				            // Extrapolated version fields
				            opts.queue[key]['scalar:url'] = $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://simile.mit.edu/2003/10/ontologies/artstor#url'});
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
				            // All other fields (including title, description, and additional metadata)
				            var disallowed = ['art:url','scalar:defaultView'];  // Items covered earlier
				            for (var p in value) {
				            	var pnode = $.fn.rdfimporter('pnode',p);
				            	if (null==pnode || -1!=disallowed.indexOf(pnode)) continue;
				            	opts.queue[key][pnode] = $.fn.rdfimporter('rdf_values',{rdf:value,p:p,collapse:true});
				            }
				            // Replace relative URLs with absolute URLs in the content area
				            if ('undefined'!=typeof(opts.queue[key]['sioc:content'])) {
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
				page_total++;
				var url = opts.dest_url+'/api/add';
				$.post(url, value, function(page_data) {
					if ('object'!=typeof(page_data)) return;
					$.each(page_data, function(k,v) {
						if ('/'==k.substr(k.length-1, 1)) k = k.substr(0, k.length-1);
						opts.url_map[key] = k.match(/^(.*)\.[0-9]*$/)[1];
					});
				}).always(function(err) {
					page_count++;
					var msg = '';
					if ('object'!=typeof(err)) {
						var msg = 'URL isn\'t a Scalar Save API URL ['+url+'] for "'+value['dcterms:title']+'"';
					} else if ('error'==err.statusText) {
						var msg = 'There was an error resolving the Save API URL ['+url+'] for "'+value['dcterms:title']+'"';
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
			if (jQuery.isEmptyObject(opts.relations)) {
				callback({url:url,count:relate_count,total:relate_total,error:false},'');	
				return;
			}
			for (var old_parent_url in opts.relations) {
				var parent_url = opts.url_map[old_parent_url];
				var urn = parent_url.replace(opts.dest_url,'');
				if ('/'==urn.substr(0,1)) urn = urn.substr(1);
				console.log(old_parent_url + ' ' + parent_url + ' '+urn);
				for (var rel_type in opts.relations[old_parent_url]) {
					for (var j in opts.relations[old_parent_url][rel_type]) {
						var post = {};
						post['action'] = 'RELATE';
						post['native'] = 'true';
						post['id'] = opts.dest_id;
						post['api_key'] = '';
						post['scalar:fullname'] = '';
						post['scalar:urn'] = urn;
						post['scalar:child_rel'] = $.fn.rdfimporter('child_rel', rel_type);
						// Write the relational values
						relate_total++;
						var old_child_url = opts.relations[old_parent_url][rel_type][j].child;
						var hash = opts.relations[old_parent_url][rel_type][j].hash;
						var child_url = opts.url_map[old_child_url];
						var child_urn = child_url.replace(opts.dest_url, '');
						if ('/'==child_urn.substr(0,1)) child_urn = child_urn.substr(1);
						post['scalar:child_urn'] = child_urn;
						jQuery.extend(post, $.fn.rdfimporter('hash_to_post', hash));
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
			console.log(opts);
			/*
			opts.url_map = {}
			opts.relations = {};
			*/
		},
		error : function(options) {
			$progress_log = opts['$this'].find('#progress_log');
			options.el.addClass('progress-bar-danger');
			if ($progress_log.is(':hidden')) $progress_log.fadeIn();
			$progress_log.append(options.msg+"<br />");
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
		valid_scalar_rdf : function(rdf) {
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
					rdf[uri]['http://www.w3.org/ns/prov#wasAttributedTo'][0].value.indexOf('/users/') != -1
				   ) {
					var index = rdf[uri]['http://www.w3.org/ns/prov#wasAttributedTo'][0].value.indexOf('/users/');
					source_url = rdf[uri]['http://www.w3.org/ns/prov#wasAttributedTo'][0].value.substr(0, index);
					break;
				// Get URL from user node in Mediathread-formatted RDF
				} else if (
					'undefined'!=typeof(rdf[uri]['http://www.w3.org/ns/prov#wasAttributedTo']) && 
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
			}
			return '';
		},
		rdf_values : function(options) {
			var rdf = options.rdf;
			var p = options.p;
			if('undefined' == typeof(rdf[p]) || !rdf[p]) return null;
			var values = [];
			for (var j = 0; j < rdf[p].length; j++) {
				values.push(rdf[p][j].value);
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
			var value = rdf[p][0].value;
			return value;
		},
		abs_url : function(url, prefix) {
			if (!url || !url.length) return url;
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
