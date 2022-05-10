/**
 * Insert scalarfootnotes elements into CKEditor editing area.
 *
 * Version 0.1.0-mvp
 * https://github.com/UIUCLibrary/scalarfootnotes
 */

(function($) {
    'use strict';

    CKEDITOR.plugins.add('scalarfootnotes', {
        footnote_ids: [],
        requires: 'widget',
        icons: 'scalarfootnotes',

        init: function(editor) {

            // Check for jQuery
            // @TODO - remove if/when JQ dep. is removed.
            if (typeof(window.jQuery) == 'undefined') {
                console.warn('jQuery required but undetected so quitting scalarfootnotes.');
                return false;
            }

            // Allow `cite` to be editable:
            CKEDITOR.dtd.$editable['cite'] = 1;

            // Add some CSS tweaks:
            var css = '.scalarfootnotes{background:#eee; padding:1px 15px;} .scalarfootnotes cite{font-style: normal;}';
            CKEDITOR.addCss(css);

            var $this = this;

            // Force a reorder on startup to make sure all vars are set: (e.g. footnotes store):
            editor.on('instanceReady', function(evt) {
                $this.reorderMarkers(editor);
            });

            // Add the reorder change event:
            editor.on('change', function(evt) {
                // Copy the scalarfootnotes_store as we may be doing a cut:
                if(!evt.editor.scalarfootnotes_tmp) {
                    evt.editor.scalarfootnotes_tmp = evt.editor.scalarfootnotes_store;
                }

                // Prevent no selection errors:
                if (!evt.editor.getSelection().getStartElement()) {
                    return;
                }
                // Don't reorder the markers if editing a cite:
                var footnote_div = evt.editor.getSelection().getStartElement().getAscendant('div');
                if (footnote_div && footnote_div.$.className.indexOf('scalarfootnotes') != -1) {
                    return;
                }
                // SetTimeout seems to be necessary (it's used in the core but can't be 100% sure why)
                setTimeout(function(){
                        $this.reorderMarkers(editor);
                    },
                    0
                );
            });
            // Build the initial scalarfootnotes widget editables definition:
            var prefix = editor.config.scalarfootnotesPrefix ? '-' + editor.config.scalarfootnotesPrefix : '';
            var def = {
                header: {
                    selector: 'header > *',
                    //allowedContent: ''
                    allowedContent: 'strong em span sub sup;'
                }
            };
            var contents = $('<div>' + editor.element.$.textContent + '</div>')
                , l = contents.find('.scalarfootnotes li').length
                , i = 1;
            for (i; i <= l; i++) {
                def['footnote_' + i] = {selector: '#footnote' + prefix + '-' + i + ' cite', allowedContent: 'a[href]; cite[*](*); strong em span br'};
            }

            // Register the scalarfootnotes widget.
            editor.widgets.add('scalarfootnotes', {

                // Minimum HTML which is required by this widget to work.
                requiredContent: 'div(scalarfootnotes)',

                // Check the elements that need to be converted to widgets.
                upcast: function(element) {
                    return element.name == 'div' && element.hasClass('scalarfootnotes');
                },

                editables: def
            });

            // Register the footnotemarker widget.
            editor.widgets.add('footnotemarker', {

                // Minimum HTML which is required by this widget to work.
                requiredContent: 'sup[data-footnote-id]',

                // Check the elements that need to be converted to widgets.
                upcast: function(element) {
                    return element.name == 'sup' && element.attributes['data-footnote-id'] != 'undefined';
                },
            });

            // Define an editor command that opens our dialog.
            editor.addCommand('scalarfootnotes', new CKEDITOR.dialogCommand('scalarfootnotesDialog', {
                // @TODO: This needs work:
                allowedContent: 'div[*](*);header[*](*);li[*];a[*];cite(*)[*];sup[*]',
                requiredContent: 'div[*](*);header[*](*);li[*];a[*];cite(*)[*];sup[*]'
            }));

            // Create a toolbar button that executes the above command.
            editor.ui.addButton('scalarfootnotes', {

                // The text part of the button (if available) and tooptip.
                label: 'Insert Footnote',

                // The command to execute on click.
                command: 'scalarfootnotes',

                // The button placement in the toolbar (toolbar group name).
                toolbar: 'insert'
            });

            // Register our dialog file. this.path is the plugin folder path.
            CKEDITOR.dialog.add('scalarfootnotesDialog', this.path + 'dialogs/scalarfootnotes.js');
        },
        build: function(footnote, editor) {
            var footnote_id = this.generateFootnoteId();

            // Insert the marker with dummy content:
            var footnote_marker = '<sup data-footnote-id="' + footnote_id + '">X</sup>';

            editor.insertHtml(footnote_marker);

            editor.fire('lockSnapshot');
            this.addFootnote(this.buildFootnote(footnote_id, footnote, false, editor), editor);
            editor.fire('unlockSnapshot');

            this.reorderMarkers(editor);
        },

        buildFootnote: function(footnote_id, footnote_text, data, editor) {
            var links   = '',
                footnote,
                order   = data ? data.order.indexOf(footnote_id) + 1 : 1,
                prefix  = editor.config.scalarfootnotesPrefix ? '-' + editor.config.scalarfootnotesPrefix : '';
            footnote = '<li id="footnote' + prefix + '-' + order + '" data-footnote-id="' + footnote_id + '"><cite>' + footnote_text + '</cite>' + links + '</li>';
            return footnote;
        },

        addFootnote: function(footnote, editor) {
            var $contents  = $(editor.editable().$);
            var $scalarfootnotes = $contents.find('.scalarfootnotes');

            //if this is the first footnote, build the footnotes section
            if ($scalarfootnotes.length == 0) {
                var header_title = editor.config.scalarfootnotesTitle ? editor.config.scalarfootnotesTitle : 'Footnotes';
                var header_els = ['<h2>', '</h2>'];//editor.config.editor.config.scalarfootnotesHeaderEls
                if (editor.config.scalarfootnotesHeaderEls) {
                    header_els = editor.config.scalarfootnotesHeaderEls;
                }
                var container = '<div class="scalarfootnotes"><hr aria-label="footnotes below"><header>' + header_els[0] + header_title + header_els[1] + '</header><ol>' + footnote + '</ol></div>';
                // Move cursor to end of content:
                var range = editor.createRange();
                range.moveToElementEditEnd(range.root);
                editor.getSelection().selectRanges([range]);
                // Insert the container:
                editor.insertHtml(container);
            } else {
                $scalarfootnotes.find('ol').append(footnote);
            }
        },

        generateFootnoteId: function() {
            var id = Math.random().toString(36).substr(2, 5);
            while ($.inArray(id, this.footnote_ids) != -1) {
                id = String(this.generateFootnoteId());
            }
            this.footnote_ids.push(id);
            return id;
        },

        reorderMarkers: function(editor) {
            editor.fire('lockSnapshot');
            var prefix  = editor.config.scalarfootnotesPrefix ? '-' + editor.config.scalarfootnotesPrefix : '';
            var $contents = $(editor.editable().$);
            var data = {
                order: []
            };

            // Check that there's a scalarfootnotes div. If it's been deleted the markers are useless:
            if ($contents.find('.scalarfootnotes').length == 0) {
                $contents.find('sup[data-footnote-id]').remove();
                editor.fire('unlockSnapshot');
                return;
            }

            // Find all the markers in the document:
            var $markers = $contents.find('sup[data-footnote-id]');
            // If there aren't any, remove the scalarfootnotes container:
            if ($markers.length == 0) {
                $contents.find('.scalarfootnotes').parent().remove();
                editor.fire('unlockSnapshot');
                return;
            }

            // Otherwise reorder the markers:
            $markers.each(function(){
                var footnote_id = $(this).attr('data-footnote-id')
                    , marker_ref = data.order.indexOf(footnote_id);
                    data.order.push(footnote_id);
                // Replace the marker contents:
                var marker = '<a href="#footnote' + prefix + '-' + n + '" id="footnote-marker' + prefix + '-' + marker_ref + '" rel="footnote">' + n + '</a>';
                $(this).html(marker);
            });

            // Prepare the scalarfootnotes_store object:
            editor.scalarfootnotes_store = {};

            // Then rebuild the scalarfootnotes content to match marker order:
            var scalarfootnotes     = ''
                , footnote_text = ''
                , footnote_id
                , i = 0
                , l = data.order.length;
            for (i; i < l; i++) {
                footnote_id   = data.order[i];
                footnote_text = $contents.find('.scalarfootnotes [data-footnote-id=' + footnote_id + '] cite').html();
                // If the scalarfootnotes text can't be found in the editor, it may be in the tmp store
                // following a cut:
                if (!footnote_text) {
                    footnote_text = editor.scalarfootnotes_tmp[footnote_id];
                }
                scalarfootnotes += this.buildFootnote(footnote_id, footnote_text, data, editor);
                // Store the scalarfootnotes for later use (post cut/paste):
                editor.scalarfootnotes_store[footnote_id] = footnote_text;
            }

            // Insert the scalarfootnotes into the list:
            $contents.find('.scalarfootnotes ol').html(scalarfootnotes);

            // Next we need to reinstate the 'editable' properties of the scalarfootnotes.
            // (we have to do this individually due to Widgets 'fireOnce' for editable selectors)
            var el = $contents.find('.scalarfootnotes')
                , n
                , footnote_widget;
            // So first we need to find the right Widget instance:
            // (I hope there's a better way of doing this but I can't find one)
            for (i in editor.widgets.instances) {
                if (editor.widgets.instances[i].name == 'scalarfootnotes') {
                    footnote_widget = editor.widgets.instances[i];
                    break;
                }
            }
            // Then we `initEditable` each footnote, giving it a unique selector:
            for (i in data.order) {
                n = parseInt(i) + 1;
                footnote_widget.initEditable('footnote_' + n, {selector: '#footnote' + prefix + '-' + n +' cite', allowedContent: 'a[href]; cite[*](*); em strong span'});
            }

            editor.fire('unlockSnapshot');
            console.log(data)
        }


    });
}(window.jQuery));