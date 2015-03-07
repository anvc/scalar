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
 * @version             1.0
 */

(function($) {

	var defaults = {
			queue: {},
			relations: {},
			urn_map: {},
			ontologies: {
				'dc':'http://purl.org/dc/elements/1.1/',
				'dcterms':'http://purl.org/dc/terms/',
				'art':'http://simile.mit.edu/2003/10/ontologies/artstor#',
				'sioc':'http://rdfs.org/sioc/ns#',
				'sioctypes':'http://rdfs.org/sioc/types#',
				'ov':'http://open.vocab.org/terms/',
				'scalar':'http://scalar.usc.edu/2012/01/scalar-ns#'		
			}
	};

	var opts = {};

	var rdfimporter_methods = {
			
		init : function(options, callback) {
			opts = $.extend( {}, defaults, options );
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
			} else {
				callback({err:'Request was improperly formatted'});
			}
		},	
		queue : function(options, callback) {
			if ('function'==typeof(options)) callback = options;
			$.each(opts.rdf, function(key,value) {
	            // Value is a Relation
				var res = key.match(/urn:scalar:([a-zA-Z]*?):([0-9]+?):([0-9]+)/);
				if(res !== null) {
					// 0:urn 1:type 2:parent 3:child
					var hash = '';
					var target = value['http://www.openannotation.org/ns/hasTarget'][0].value;
					if (-1!=target.indexOf('#')) hash = target.substr(target.lastIndexOf('#')+1);
					if ('undefined'==typeof(opts.relations[res[2]])) opts.relations[res[2]] = {};
					if ('undefined'==typeof(opts.relations[res[2]][res[1]])) opts.relations[res[2]][res[1]] = [];
					opts.relations[res[2]][res[1]].push({child:res[3],hash:hash});
				} else {
					var entry_type = $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'});
					if(entry_type !== null) {
						// Value is a Page
						if(entry_type.match(/Media|Composite/) !== null) {
							if(opts.queue[key] === undefined) {
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
							opts.queue[key]['scalar:slug'] = key.substr(key.lastIndexOf('/')+1); // Orig author might have a multi-segmented URL slug, but no good way to determine that if key is coming from cut-and-paste
							opts.queue[key]['scalar:thumbnail'] = $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'});
							opts.queue[key]['scalar:background'] = $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://scalar.usc.edu/2012/01/scalar-ns#background'});
							opts.queue[key]['scalar:audio'] = $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://scalar.usc.edu/2012/01/scalar-ns#audio'});
						// Value is a Version
						} else if(entry_type.match(/Version/) !== null) {
				            // Use page url as key to the opts.queue
				            var k = key.match(/^(.*)\.[0-9]*$/)[1];
				            // Init queue if doesn't exist
				            if(opts.queue[k] === undefined) {
				            	opts.queue[k] = {};
				            }
				            // Extrapolated version fields
				            opts.queue[k]['scalar:url'] = $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://simile.mit.edu/2003/10/ontologies/artstor#url'});
				            // All other fields (including title, description, and additional metadata)
				            var disallowed = ['art:url'];  // Items covered earlier
				            for (var p in value) {
				            	var pnode = $.fn.rdfimporter('pnode',p);
				            	if (null==pnode || -1!=disallowed.indexOf(pnode)) continue;
				            	opts.queue[k][pnode] = $.fn.rdfimporter('rdf_values',{rdf:value,p:p,collapse:true});
				            }
				            // Reference relations
				            var references = $.fn.rdfimporter('rdf_values',{rdf:value,p:'http://purl.org/dc/terms/references'});
				            if (references) {
					            for (var j = 0; j < references.length; j++) {
					            	var old_parent_id = $.fn.rdfimporter('rdf_value',{rdf:value,p:'http://scalar.usc.edu/2012/01/scalar-ns#urn'}).split(':').pop();
					            	if ('undefined'==typeof(opts.relations[old_parent_id])) opts.relations[old_parent_id] = {};
									if ('undefined'==typeof(opts.relations[old_parent_id]['reference'])) opts.relations[old_parent_id]['reference'] = [];	
									opts.relations[old_parent_id]['reference'].push({child:'',hash:'',url:references[j]});
					            }
				            }
				        }
				    }
				}
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
				var parent_urn = value['scalar:urn'];
				$.post(url, value, function(page_data) {
					if ('object'!=typeof(page_data)) return;
					$.each(page_data, function(k,v) {
						var version_urn = $.fn.rdfimporter('rdf_value',{rdf:v,p:'http://scalar.usc.edu/2012/01/scalar-ns#urn'});
						opts.urn_map[parent_urn] = version_urn  // map old version urn to new version URN
						opts.urn_map[key] = version_urn;  // map old URL to new version URN
					});
				}).always(function(err) {
					page_count++;
					var msg = '';
					if ('object'!=typeof(err)) {
						var msg = 'URL isn\'t a Scalar Save API URL ['+url+'] for "'+value['dcterms:title']+'"';
					} else if ('error'==err.statusText) {
						var msg = 'There was an error resolving the Save API URL ['+url+'] for "'+value['dcterms:title']+'"';
					}
					callback({dest_url:dest_url,url:url,count:page_count,total:page_total,error:((msg.length)?true:false)}, msg);
				});
				opts.queue = {};
			});
		},
		relations : function(callback) {
			var relate_count = 0;
			var relate_total = 0;
			var url = opts.dest_url+'/api/relate';
			var post = {};
			post['action'] = 'RELATE';
			post['native'] = 'true';
			post['id'] = opts.dest_id;
			post['api_key'] = '';
			post['scalar:fullname'] = '';

			for (var old_parent_id in opts.relations) {
				var parent_urn = opts.urn_map['urn:scalar:version:'+old_parent_id];
				post['scalar:urn'] = parent_urn;
				for (var rel_type in opts.relations[old_parent_id]) {
					post['scalar:child_rel'] = $.fn.rdfimporter('child_rel', rel_type);
					for (var j in opts.relations[old_parent_id][rel_type]) {
						relate_total++;
						var old_child_id = opts.relations[old_parent_id][rel_type][j].child;
						var old_child_url = opts.relations[old_parent_id][rel_type][j].url;
						var child_urn = ('undefined'!=typeof(old_child_url)) ? opts.urn_map[old_child_url] : opts.urn_map['urn:scalar:version:'+old_child_id];
						var hash = opts.relations[old_parent_id][rel_type][j].hash;
						jQuery.extend(post, $.fn.rdfimporter('hash_to_post', hash));
						post['scalar:child_urn'] = child_urn;
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
			opts.urn_map = {}
			opts.relations = {};
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
		map_relations : function(rels) {
			for (var rel_type in rels) {
				for (var rel in rels[rel_type]) {
					rels[rel_type][rel]['parent_urn'] = 'urn:craig';
					rels[rel_type][rel]['child_urn'] = 'urn:robyn';
				}
			}
			return rels;
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
