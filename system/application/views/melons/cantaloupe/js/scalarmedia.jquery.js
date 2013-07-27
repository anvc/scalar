(function($) {

	$.scalarmedia = function(l, options) {
	
		var link = l;
		var mediaelement = link.data('mediaelement');
		
		var media = {
		
			options: $.extend({}, options),
			
			showAnnotation: function(e, relation, m, forceShow) {
				
				if (annotations.indexOf(relation) != -1) {
					var currentAnnotationTable = currentAnnotation.find('table');
					var annotationTable = annotationPane.find('table');
					if ((currentRelation != relation) || forceShow) {
					
						/*if (currentRelation != null) {
							console.log(currentRelation.body.getDisplayTitle()+' '+relation.body.getDisplayTitle()+' '+forceShow);
						} else {
							console.log(currentRelation+' '+relation.body.getDisplayTitle()+' '+forceShow);
						}
						
						console.log('show '+relation.body.getDisplayTitle());*/
					
						if (annotationPane.css('display') == 'none') {
							currentAnnotationTable.empty();
							var row;
							if (relation.body.current.content != null) {
								row = $('<tr><td>'+relation.startString+'</td><td><h4>'+relation.body.getDisplayTitle()+'</h4><p>'+relation.body.current.content+'</p></td></tr>').appendTo(currentAnnotationTable);
							} else {
								row = $('<tr><td>'+relation.startString+'</td><td><p>'+relation.body.getDisplayTitle()+'</p></td></tr>').appendTo(currentAnnotationTable);
							}
							currentAnnotation.slideDown();
							
						} else {
							$(annotationTable).find('tr').removeClass('current');
							$(annotationTable).find('tr').each(function() {
								var rowRelation = $(this).data('relation');
								if (rowRelation == relation) {
									$(this).addClass('current');
									if (rowRelation.body.current.content != null) {
										var col = $(this).find('td').eq(1);
										col.empty();
										col.append('<h4>'+relation.body.getDisplayTitle()+'</h4>');
										col.append('<p style="display:none;">'+relation.body.current.content+'</p>');
										col.find('p').slideDown();
									}
								}
							});
						}
						
						currentRelation = relation;
						
					} else {
						if (annotationPane.css('display') == 'none') {
							currentAnnotationTable.find('td').eq(0).text(scalarapi.decimalSecondsToHMMSS(mediaelement.getCurrentTime()));
						}
					}
				}
			},
			
			hideAnnotation: function(e, relation, m, forceHide) {
				//if ((currentRelation != null) || forceHide) {
				
					if (annotationPane) {
					
						//console.log('hide '+((relation == null) ? 'null' : relation.body.getDisplayTitle())+' for '+mediaelement.model.node.getDisplayTitle());
						
						if (annotationPane.css('display') == 'none') {
							currentAnnotation.slideUp();
							if (currentRelation == relation) currentRelation = null;
						} else if (relation != null) {
							var annotationTable = annotationPane.find('table');
							//$(annotationTable).find('tr').removeClass('current');
							$(annotationTable).find('tr').each(function() {
								var rowRelation = $(this).data('relation');
								if (rowRelation == relation) {
									$(this).removeClass('current');
									if (rowRelation.body.current.content != null) {
										console.log(this);
										var col = $(this).find('td').eq(1);
										col.empty();
										col.append('<p>'+rowRelation.body.getDisplayTitle()+'</p>');
										col.append('<p>'+rowRelation.body.current.content+'</p>');
										col.find('p').eq(1).slideUp();
									}
								}
							});
							if (currentRelation == relation) currentRelation = null;
						}
					}
				//}		
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
			}
			
		}
		
		var node = mediaelement.model.node;
		
		//if (node.current.description != null) mediaelement.view.footer.append('<div><a class="media_info" href="javascript:;">i</a> '+node.current.description+'</div>');
		
		var currentAnnotation = $('<div class="current_annotation"><table></table></div>').appendTo(mediaelement.view.footer);
		
		var currentRelation = null;
		
		var mediaTabs = $('<div class="media_tabs"></div>').appendTo(mediaelement.view.footer);
		
		var foundAuxContent = false;
		
		if (node.current.description != null) {
			var descriptionPane = $('<div class="media_description pane">'+node.current.description+'</div>').appendTo(mediaelement.view.footer);
			var descriptionTab = $('<div class="media_tab select">Caption</div>').appendTo(mediaTabs);
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
			mediaelement.view.footer.find('.media_description').show();
			foundAuxContent = true;
		}
		
		var i;
		var annotation;
		var row;
		var annotations = node.getRelations('annotation', 'incoming', 'index');
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
			var annotationPane = $('<div class="media_annotations pane"></div>').appendTo(mediaelement.view.footer);
			var table = $('<table></table>').appendTo(annotationPane);
			for (i in annotations) {
				annotation = annotations[i];
				row = $('<tr><td>'+annotation.startString+'</td><td><p>'+annotation.body.getDisplayTitle()+'</p></td></tr>').appendTo(table);
				row.data('relation', annotation);
				row.click(function() {
					var relation = $(this).data('relation');
					mediaelement.seek(relation.properties.start); // TODO - handle other media types
					mediaelement.play();
				});
			}
			if (!foundAuxContent) {
				mediaelement.view.footer.find('.media_annotations').show();
				annotationTab.addClass('select');
				foundAuxContent = true;
			}
		}
		
		var metadataTab = $('<div class="media_tab">Metadata</div>').appendTo(mediaTabs);
		var metadataPane = $('<div class="media_metadata pane"></div>').appendTo(mediaelement.view.footer);
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
		var table = $('<table></table>').appendTo(metadataPane);
		table.append('<tr><td>title</td><td>'+node.getDisplayTitle()+'</td></tr>');
		table.append('<tr><td>version number</td><td>'+node.current.number+'</td></tr>');
		table.append('<tr><td>url</td><td>'+node.current.url+'</td></tr>');
		table.append('<tr><td>created</td><td>'+node.current.created+'</td></tr>');
		table.append('<tr><td>content type</td><td>'+node.current.mediaSource.contentType+' ('+node.current.mediaSource.name+')</td></tr>');
		if (!foundAuxContent) {
			mediaelement.view.footer.find('.media_metadata').show();
			metadataTab.addClass('select');
			foundAuxContent = true;
		}
		
		mediaelement.model.element.mouseenter(function() {
			var timeout = $(this).data('timeout');
			if (timeout != null) {
				clearTimeout(timeout);
			}
			mediaTabs.slideDown();
		})
		mediaelement.model.element.mouseleave(function() {
			var timeout = $(this).data('timeout');
			if (timeout != null) {
				clearTimeout(timeout);
			}
			var timeout = setTimeout(function() { mediaTabs.slideUp(); }, 1000)
			$(this).data('timeout', timeout);
		})
		
		/*mediaelement.view.footer.find('.media_info').mouseenter(function(e) {
			var position = $(e.currentTarget).parent().parent().parent().offset();
			metadata.css({
				'right': (parseInt($(window).width()) - position.left + 10)+'px',
				'top': position.top+'px'
			});
			metadata.fadeIn();
		})*/
		
		$('body').bind('show_annotation', media.showAnnotation);
		
		$('body').bind('hide_annotation', media.hideAnnotation);

		link.addClass('texteo_icon');
		link.addClass('texteo_icon_'+mediaelement.model.node.current.mediaSource.contentType);
		
	  	$('.mediaElementFooter, .media_metadata').addClass('caption_font');
		
	}
	
})(jQuery);