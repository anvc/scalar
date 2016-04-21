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

	$.scalarwidgets = function(e, options) {

		var widgets = {

			options: $.extend({}, options),

			cardData: {},

			setupCards: function() {
				$('div[data-widget="card"]').each(function() {
					$(this).empty();
					$(this).append('<br clear="both"/>');
					var i, n, nodes;
					var target = $(this).attr("data-target");
					var extent = $(this).attr("data-extent");
					target = "self";
					widgets.cardData[target] = extent;
					if (target == "self") {
						var currentPageNode = scalarapi.model.getCurrentPageNode();
						switch (extent) {

							case "self":
							widgets.buildCardFromNode($(this), currentPageNode);
							break;

							case "path":
							nodes = currentPageNode.getRelatedNodes("path", "outgoing");
							n = nodes.length;
							for (i=(n-1); i>=0; i--) {
								widgets.buildCardFromNode($(this), nodes[i]);
							}
							break;
							
						}
					}
					/*if (extent == "self") {
						if (scalarapi.loadNode(target, false, widgets.onCardNodeLoaded) == "loaded") {
							buildCard(target, extent);
						}
					}*/
				});
			},

			onCardNodeLoaded: function(json) {
				console.log(json);
			},

			buildCardFromSlug: function(element, slug) {
				var node = scalarapi.getNode(slug);
				widgets.buildCardFromNode(element, node);
			},

			buildCardFromNode: function(element, node) {
				var markup = '<div class="col-md-4"><div class="thumbnail">';
				if (node.thumbnail != null) {
					markup += '<img src="' + node.thumbnail + '" alt="">';
				}
				markup += '<div class="caption"><h4 class="heading_font heading_weight">' + node.getDisplayTitle() + '</h4>';
				if (node.current.description != null) {
					markup += '<p class="description-sm caption_font">' + node.current.description + '</p>';
				}
				markup += '<a href="' + node.url + '" class="btn btn-primary" role="button">Go there</a></div>' +
						'</div>' +
					'</div></div>';
				element.prepend(markup);
			},

			buildMediaObjectFromNode: function(element, node) {
				var markup = '<div class="media">';
				if (node.thumbnail != null) {
					markup += '<div class="media-left">' +
							'<a href="#">' +
								'<img class="media-object pull-left" src="' + node.thumbnail + '" alt="">' +
							'</a>' +
						'</div>';
				}
				markup += '<div class="media-body">' +
					'<h4 class="media-heading heading_font heading_weight">' + node.getDisplayTitle() + '</h4>';
				if (node.current.description != null) {
					markup += '<p class="description-sm caption_font">' + node.current.description + '</p>';
				}
				markup += '<a href="' + node.url + '" class="btn btn-primary" role="button">Go there</a>' +
						'</div>' +
					'</div>';
				element.prepend(markup);
			}

			/*<div class="media">
  <div class="media-left">
    <a href="#">
      <img class="media-object" src="..." alt="...">
    </a>
  </div>
  <div class="media-body">
    <h4 class="media-heading">Media heading</h4>
    ...
  </div>
</div>*/

		};

		widgets.setupCards();

		return widgets;

	}

})(jQuery);