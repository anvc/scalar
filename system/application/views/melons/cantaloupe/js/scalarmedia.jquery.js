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

(function($) {

	$.scalarmedia = function(m, e, options) {

		var mediaelement = m;
		var element = e;

		var _linkify = function(inputText) {  // http://stackoverflow.com/questions/37684/how-to-replace-plain-urls-with-links
		    if (-1!=inputText.indexOf('<a')) return inputText;
			var replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;  // URLs starting with http://, https://, or ftp://
		    var replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
		    var replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;  // URLs starting with www. (without // before it, or it'd re-link the ones done above)
		    var replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');
		    var replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;  // Change email addresses to mailto:: links
		    var replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
		    var replacePattern4 = /^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/;  // lat/lng, link to a map
		    var replacedText = replacedText.replace(replacePattern4, '<a href="https://www.google.com/maps?q=$1,$3" target="_blank">$1,$3</a>');
		    var maxLength = 95;  // Trim the length of a URL so it doesn't run off side of panel in some cases
		    if ($('<div>'+replacedText+'</div>').find('a').length && $('<div>'+replacedText+'</div>').find('a:first').text().length > maxLength) {
		    	var text = $('<div>'+replacedText+'</div>').find('a:first').text().substr(0,maxLength)+'...';
		    	var $obj = $('<div>'+replacedText+'</div>');
		    	$obj.find('a:first').text(text);
		    	var replacedText = $obj.html();
		    };
		    return replacedText;
		};
		
		var media = {

			options: $.extend({
				'shy':true,
				'details': null,
				'caption': 'description'
			}, options),

			showAnnotation: function(e, relation, m, forceShow) {

				// make sure this is the right mediaelement
				if ( mediaelement.model.id == m.model.id ) {

					// and that we already know about the annotation
					if (annotations.indexOf(relation) != -1) {
						var currentAnnotationTable = currentAnnotation.find('table');
						var annotationTable = annotationPane.find('table');

						// if the annotation isn't already highlighted or we're showing it no matter what, then
						if ((currentRelation != relation) || forceShow) {

							// if the annotation tab is hidden and this is not a spatial annotation, then show the single annotation display
							// (spatial annotations will be displayed directly over the image, so we don't need to show them here)
							if ((annotationPane.css('display') == 'none') && ( relation.target.current.mediaSource.contentType != 'image' )) {
								currentAnnotationTable.empty();

								var row = $('<tr><td>'+relation.startString+'</td><td></td></tr>').appendTo(currentAnnotationTable);
								media.addContentForAnnotationToContainer( "single-anno-", relation.body, row.find( 'td' ).eq( 1 ) );

								row.data('relation', relation);
								row.data('media',mediaelement);
								row.click(function( event ) {
									// only clicks on the background should cue up the annotation
									if ( $( event.target ).is( 'td,h4,div,p,tr' ) ) {
										var relation = $(this).data('relation');
										$(this).data('media').seek(relation);
										if (( relation.target.current.mediaSource.contentType != 'document' ) && ( relation.target.current.mediaSource.contentType != 'image' )) {
						       				setTimeout(function() {
						           				if(!$(this).data('media').is_playing()) {
													$(this).data('media').play();
						           				}
						       				},250);
										}
									}
								});

								currentAnnotation.slideDown();

							// otherwise, update the list of all annotations
							} else {

								$(annotationTable).find('tr').removeClass('current');
								$(annotationTable).find('tr').each(function() {

									var rowRelation = $(this).data('relation');
									var col = $(this).find('td').eq(1);


									if ( rowRelation != null ) {

										// show the content of the selected annotation
										if (rowRelation == relation) {

											$(this).addClass('current');

											// only rebuild the annotation content if it isn't already showing
											if ( $( '.media_annotations #anno-' + rowRelation.body.slug ).length == 0 ) {
												col.empty();
												media.addContentForAnnotationToContainer( "anno-", rowRelation.body, col );

											} else {
												col.find( 'h4' ).contents().wrap( '<a href="' + rowRelation.body.url + '"></a>' );
												col.find( 'h4' ).addClass( 'heading_weight' );
											}

											col.find('div').eq( 0 ).slideDown();

										// hide the content of all other annotations
										} else {
											col.find( 'h4 > a' ).contents().unwrap();
											col.find( 'h4' ).removeClass( 'heading_weight' );
											col.find( 'div' ).eq( 0 ).slideUp();
										}
									}
								});
							}

							currentRelation = relation;

						} else {
							if (annotationPane.css('display') == 'none') {
								currentAnnotationTable.find('td').eq(0).text( relation.startString );
							}
						}
					}
				}
			},

			hideAnnotation: function(e, relation, m, forceHide) {

				if ( mediaelement.model.id == m.model.id ) {
					//if ((currentRelation != null) || forceHide) {

						if (annotationPane) {

							//console.log('hide '+((relation == null) ? 'null' : relation.body.getDisplayTitle())+' for '+mediaelement.model.node.getDisplayTitle());

							if (annotationPane.css('display') == 'none') {
								if (currentRelation == relation) {
									currentAnnotation.slideUp();
									currentRelation = null;
								}
							} else if (relation != null) {
								var annotationTable = annotationPane.find('table');
								//$(annotationTable).find('tr').removeClass('current');
								$(annotationTable).find('tr').each(function() {
									var rowRelation = $(this).data('relation');
									if (rowRelation == relation) {
										$(this).removeClass('current');
										if (rowRelation.body.current.content != null) {
											var col = $(this).find('td').eq(1);
											col.find('h4 > a').contents().unwrap();
											col.find('h4').removeClass( 'heading_weight' );
											col.find('div').eq(0).slideUp();
										}
									}
								});
								if (currentRelation == relation) currentRelation = null;
							}
						}
					//}
				}
			},

			addContentForAnnotationToContainer: function( idPrefix, annotation, container ) {

				var content, tag, tags, tagBar, tagItem, labelClass, i, n;


				// add the title
				var header = $('<h4 class="heading_weight"><a href="' + annotation.url + '">'+ annotation.getDisplayTitle() +'</a></h4>');
				container.append(header);

				content = $( '<div id="' + idPrefix + annotation.slug +'"></div>' ).appendTo( container );

				var width = container.parents('.mediainfo').width() - container.parents('tr').children('td').first().width() - 60;
				var height = parseInt(container.parents('.media_annotations').css('max-height')) - container.parents('.media_annotations').innerHeight() - 10;
				if(content.parents('.right,.left').length > 0){
					height = null;
				}
				// add the annotation description
				var description = annotation.getDescription();
				if(description.length > 0){
					var temp = $('<div>'+description+'</div>').appendTo(content);

					$(page.getMediaLinks(temp)).each(function(){
						if($(this).hasClass('inline')){
							$(this).wrap('<div></div>').hide().removeClass('inline');
						}
					});

					wrapOrphanParagraphs(temp);

					temp.children('p:not(:last-child),div:not(:last-child)').wrap('<div class="paragraph_wrapper"></div>');

					if(content.parents('.slot.right,.slot.left').length > 0){
						height = null;
					}

					$(page.getMediaLinks(content)).each(function(){
						$(this).attr({
							'data-align':'',
							'data-size':'full',
							'data-annotations':'[]',
							'class':'media_link'
						});
						var parent = $(this).parent();
						page.addNoteOrAnnotationMedia($(this),parent,width,height);
					});
				}
				// get incoming tags and display them as buttons
				tags = annotation.getRelatedNodes( "tag", "incoming" );
				n = tags.length;
				if ( n > 0 ) {
					tagBar = $( '<div class="mini-tag-bar">Tags:&nbsp; </div>' ).appendTo( content );
				}
				for ( i = 0; i < n; i++ ) {
					tagBar.append( " " );
					tag = tags[ i ];
					tagItem = $( '<a href="javascript:;" id="anno-tag-' + tag.slug + '" class="anno-tag btn btn-xs btn-default">' + tag.getDisplayTitle() + '</a>' ).appendTo( tagBar );
					tagItem.data( 'tag', tag );

					// when a tag button is clicked, toggle it on and all the others off,
					// and show its content below
					tagItem.click( function( event ) {
						event.preventDefault();
						var me = $( this );
						if ( me.hasClass( 'btn-primary' ) ) {
							me.parent().find( '.anno-tag' ).removeClass( 'btn-primary' ).addClass( 'btn-default' );
							me.parent().parent().find( '.anno-tag-content' ).empty();
						} else {
							$( this ).parent().find( '.anno-tag' ).removeClass( 'btn-primary' ).addClass( 'btn-default' );
							$( this ).removeClass( 'btn-default' );
							$( this ).addClass( 'btn-primary' );
							var tag = $( this ).data( 'tag' );
							var nodeContent = me.parent().parent().find( '.anno-tag-content' ).empty();
							nodeContent.append( tag.getDescription() );
						}
					})
				}
				if ( n > 0 ) {
					content.append( '<p class="anno-tag-content"></p>' );
				}

				if(annotation.hasScalarType( 'media' ) && content.find('.annotation_media_'+annotation.slug).length == 0){
					var parent = $('<div class="node_media_'+node.slug+'"></div>').appendTo(content);
					var link = $( '<a href="'+annotation.current.sourceFile+'" data-annotations="[]" data-align="center" resource="'+annotation.slug+'"></a>' ).hide().appendTo(parent);
					page.addNoteOrAnnotationMedia(link,parent,width,height);
				}

			},

			minimizeAnnotationPane: function() {
				if (annotationPane) {
					var annotationTable = annotationPane.find('table');
					$(annotationTable).find('tr').each(function() {
						var rowRelation = $(this).data('relation');
						var col = $(this).find('td').eq(1);
						col.empty();
						col.append('<p>'+rowRelation.body.getDisplayTitle()+'</p>');
					});
				}
			},

			addMetadataTableForNodeToElement: function(node, element) {
				// custom method if applicable
				if ('undefined'!=typeof(window['customAddMetadataTableForNodeToElement'])) {
					customAddMetadataTableForNodeToElement(node, element, _linkify);
					return;
				}
				// basic Scalar properties
				var table = $( '<table></table>' ).appendTo(element);
				table.append('<tr><td>Scalar URL</td><td><a href="'+node.url+'">'+node.url+'</a> (version '+node.current.number+')</td></tr>');
				table.append('<tr><td>Source URL</td><td><a href="'+node.current.sourceFile+'" target="_blank">'+node.current.sourceFile+'</a> ('+node.current.mediaSource.contentType+'/'+node.current.mediaSource.name+')</td></tr>');
				table.append('<tr><td>dcterms:title</td><td>'+node.getDisplayTitle()+'</td></tr>');
				if (null!=node.current.description) table.append('<tr><td>dcterms:description</td><td>'+_linkify(node.current.description)+'</td></tr>');
				if (null!=node.current.source) {
					if ('undefined'!=typeof(node.current.properties['http://ns.exiftool.ca/IPTC/IPTC/1.0/By-line']) && node.current.source == node.current.properties['http://ns.exiftool.ca/IPTC/IPTC/1.0/By-line'][0].value) {
						table.append('<tr><td>iptc:By-line</td><td>'+_linkify(node.current.source)+'</td></tr>');
					} else if ('undefined'!=typeof(node.current.properties['http://purl.org/dc/terms/source']) && node.current.source == node.current.properties['http://purl.org/dc/terms/source'][0].value) {
						table.append('<tr><td>dcterms:source</td><td>'+_linkify(node.current.source)+'</td></tr>');
					}
				}
				if (null!=node.current.sourceLocation) table.append('<tr><td>art:sourceLocation</td><td>'+_linkify(node.current.sourceLocation)+'</td></tr>');
				// auxiliary properties
				for ( prop in node.current.auxProperties ) {
					for ( i in node.current.auxProperties[ prop ] ) {
						value = node.current.auxProperties[ prop ][ i ];
						table.append( '<tr><td>' + prop + '</td><td>' + _linkify(value) + '</td></tr>');
					}
				}
				// API links
				table.append('<tr><td>View as</td><td><a href="'+node.url+'.rdfxml">RDF-XML</a>, <a href="'+node.url+'.rdfjson">RDF-JSON</a>, or <a href="'+node.url+'.meta">HTML</a></td></tr>');				
			}
		}  //!var media

		var node = mediaelement.model.node;

		//if (node.current.description != null) mediaelement.view.footer.append('<div><a class="media_info" href="javascript:;">i</a> '+node.current.description+'</div>');

		if (element != null) {
			var currentAnnotation = $('<div class="current_annotation"><table></table></div>').appendTo(element);

			var currentRelation = null;

			var mediaTabs = $('<div class="media_tabs"></div>').appendTo(element);

			var foundAuxContent = false;

			var description;
			switch ( media.options.caption ) {

				case 'title':
				description = node.getDisplayTitle();
				break;

				case 'title-and-description':
				if ( node.current.description != null ) {
					description = '<strong>' + node.getDisplayTitle() + '</strong><br>' + node.current.description;
				} else {
					description = node.getDisplayTitle();
				}
				break;

				case 'metadata':
				description = $('<div></div>');
				media.addMetadataTableForNodeToElement(node, description);
				description.unwrap();
				break;

				default:
				description = node.current.description;
				if ( node.current.description == null ) {
					description = '<p><i>No description available.</i></p>';
				}
				break;

			}
			if ( media.options.caption != 'none' ) {
				var descriptionPane = $('<div class="media_description pane"></div>').appendTo(element);

				// add TK labels
            	var labels = node.current.properties['http://localcontexts.org/tk/hasLabel'];
            	if (labels != null) {
	                var popoverTemplate = '<div class="popover tk-help caption_font" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>';
	                var labelWrapper = $('<div class="tk-labels-media"></div>').appendTo(descriptionPane);
	                var $label, $img, labelNode, url, labelDescription;
	            	$(labels).each(function() {
	            		$label = $('<span resource="'+this.value+'" typeof="tk:TKLabel" style="display:inline-block;"></span>').appendTo(labelWrapper);
	            		labelNode = scalarapi.model.nodesByURL[this.value];
	            		url = labelNode.properties['http://simile.mit.edu/2003/10/ontologies/artstor#url'][0].value;
	            		labelDescription = labelNode.properties['http://purl.org/dc/terms/description'][0].value;
	            		$img = $('<img rel="art:url" src="'+url+'" data-toggle="popover" data-placement="top" />').appendTo($label);
	                    $img.popover({ 
	                        trigger: "click", 
	                        html: true, 
	                        template: popoverTemplate,
	                        content: '<img src="'+url+'" /><p class="supertitle">Traditional Knowledge</p><h3 class="heading_weight">'+labelNode.title+'</h3><p>'+labelDescription+'</p><p><a href="http://localcontexts.org/tk-labels/" target="_blank">More about Traditional Knowledge labels</a></p>'
	                    });
	            	});
            	}

				if (node.current.source != null) {
					if (media.options.caption != 'metadata') {
						description += '<br>Source: ' + _linkify(node.current.source);
					} else {
						descriptionPane.addClass('media_metadata');
					}
				}
				descriptionPane.append(description);
				var descriptionTab = $('<div class="media_tab select">Description</div>').appendTo(mediaTabs);
				descriptionTab.click(function() {
					$(this).parent().parent().find('.pane').hide();
					media.minimizeAnnotationPane();
					descriptionPane.show();
					$(this).parent().find('.media_tab').removeClass('select');
					descriptionTab.addClass('select');
					if (currentRelation != null) {
						media.showAnnotation(null, currentRelation, mediaelement, true);
					}
				});
				element.find('.media_description').show();
			}
			foundAuxContent = true;

			var i, annotation, row, prop, value;
			var annotations = node.getRelations('annotation', 'incoming', 'index');

			//filter out unwanted Annotations
			var annotationWhiteList = $(m.link).data('annotations');
			if($(m.link).is('[data-annotations]') || annotationWhiteList){
				if(!annotationWhiteList){
					annotationWhiteList = [];
				}else if(typeof annotationWhiteList === "string"){
					annotationWhiteList = annotationWhiteList.split(",");
				}
				var temp_annotations = [];
				for(var i = 0; i < annotations.length; i++){
					if(annotationWhiteList.indexOf(annotations[i].body.slug)!=-1){
						temp_annotations.push(annotations[i]);
					}
				}
				annotations = temp_annotations;
			}

			if (annotations.length > 0) {
				var annotationTab = $('<div class="media_tab">Annotations</div>').appendTo(mediaTabs);
				annotationTab.click(function() {
					$(this).parent().parent().find('.pane').hide();
					annotationPane.show();
					$(this).parent().find('.media_tab').removeClass('select');
					annotationTab.addClass('select');
					if (currentRelation != null) {
						currentAnnotation.slideUp();
						media.showAnnotation(null, currentRelation, mediaelement, true);
						//media.hideAnnotation(null, null, mediaelement, true);
					}
				});
				var annotationPane = $('<div class="media_annotations pane"></div>').appendTo(element);
				var table = $('<table></table>').appendTo(annotationPane);
				for (i in annotations) {
					annotation = annotations[i];
					row = $('<tr><td>'+annotation.startString+'</td><td><p>'+annotation.body.getDisplayTitle()+'</p></td></tr>').appendTo(table);
					row.data('relation', annotation);
					row.data('media',mediaelement);
					row.click(function( event ) {
						// only clicks on the background should cue up the annotation
						if ( $( event.target ).is( 'td,h4,div,p,tr' ) ) {
							var relation = $(this).data('relation');
							$(this).data('media').seek(relation);
							var me = this;
							if (( relation.target.current.mediaSource.contentType != 'document' ) && ( relation.target.current.mediaSource.contentType != 'image' )) {
	              				setTimeout(function() {
	                				if(!$(me).data('media').is_playing()) {
	      								$(me).data('media').play();
	                				}
	              				},250);
							}
						}

					});
				}
				if (!foundAuxContent) {
					element.find('.media_annotations').show();
					annotationTab.addClass('select');
					foundAuxContent = true;
				}
			}

			// hide metadata tab if the media's description tab includes the metadata
			if (media.options.caption != 'metadata') {
				var metadataTab = $('<div class="media_tab">Details</div>').appendTo(mediaTabs);
				var metadataPane = $('<div class="media_metadata pane"></div>').appendTo(element);
				metadataTab.click(function() {
					$(this).parent().parent().find('.pane').hide();
					media.minimizeAnnotationPane();
					metadataPane.show();
					$(this).parent().find('.media_tab').removeClass('select');
					metadataTab.addClass('select');
					if (currentRelation != null) {
						media.showAnnotation(null, currentRelation, mediaelement, true);
					}
				});
				media.addMetadataTableForNodeToElement(node, metadataPane);
				if (!foundAuxContent) {
					element.find('.media_metadata').show();
					metadataTab.addClass('select');
					foundAuxContent = true;
				}
			}

			if ('undefined'==typeof(scalarMediaHideCitationsTab) || scalarMediaHideCitationsTab) {
				var detailsTab = $( '<div class="media_tab">Citations</div>' ).appendTo( mediaTabs );
				detailsTab.click( function() {
					media.options[ 'details' ].show( node );
				} );
			}

			if ('undefined'==typeof(scalarMediaHideSourceFileTab) || scalarMediaHideSourceFileTab) {
				var sourceTab = $( '<div class="media_tab">Source file</div>' ).appendTo( mediaTabs );
				sourceTab.click( function() {
					window.open( node.current.sourceFile, 'popout' );
				} );
			}

			if (media.options.shy) {
				var wrapped_slot = mediaTabs.parents('.slot').hasClass('wrapped_slot');
				mediaelement.model.element.mouseenter(function() {
					var timeout = $(this).data('timeout');
					if (timeout != null) {
						clearTimeout(timeout);
					}
					mediaTabs.slideDown();
				})
				mediaelement.model.element.mouseleave(function() {
					if ( window.innerWidth > 480 ) {
						var timeout = $(this).data('timeout');
						if (timeout != null) {
							clearTimeout(timeout);
						}
						var timeout = setTimeout(function() { 
							mediaTabs.slideUp(); 
						}, 1000);
						$(this).data('timeout', timeout);
					}
				})
			} else {
				mediaTabs.show();
			}

			mediaelement.view.footer.find('.media_info').mouseenter(function(e) {
				var position = $(e.currentTarget).parent().parent().parent().offset();
				metadata.css({
					'right': (parseInt($(window).width()) - position.left + 10)+'px',
					'top': position.top+'px'
				});
				metadata.fadeIn();
			})

			$('body').bind('show_annotation', media.showAnnotation);

			$('body').bind('hide_annotation', media.hideAnnotation);

			element.addClass('caption_font');
			element.addClass('mediainfo');
		  	$('.media_metadata').addClass('caption_font');
		}

	}

})(jQuery);
