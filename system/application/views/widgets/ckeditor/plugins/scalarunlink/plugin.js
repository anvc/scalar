/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

'use strict';

( function() {
	CKEDITOR.plugins.add( 'scalarunlink', {
		icons: 'unlink',
		hidpi: true,

		init: function( editor ) {

			// Add the unlink button.
			editor.addCommand( 'unlink', new CKEDITOR.unlinkCommand() );

			if ( editor.ui.addButton ) {
				editor.ui.addButton( 'Unlink', {
					label: 'Unlink',
					command: 'unlink',
					toolbar: 'links,20'
				} );
			}
		}
	} );

	CKEDITOR.unlinkCommand = function() {};
	CKEDITOR.unlinkCommand.prototype = {
		exec: function( editor ) {
			// IE/Edge removes link from selection while executing "unlink" command when cursor
			// is right before/after link's text. Therefore whole link must be selected and the
			// position of cursor must be restored to its initial state after unlinking. (https://dev.ckeditor.com/ticket/13062)
			if ( CKEDITOR.env.ie ) {
				var range = editor.getSelection().getRanges()[ 0 ],
					link = ( range.getPreviousEditableNode() && range.getPreviousEditableNode().getAscendant( 'a', true ) ) ||
							( range.getNextEditableNode() && range.getNextEditableNode().getAscendant( 'a', true ) ),
					bookmark;

				if ( range.collapsed && link ) {
					bookmark = range.createBookmark();
					range.selectNodeContents( link );
					range.select();
				}
			}

			var style = new CKEDITOR.style( { element: 'a', type: CKEDITOR.STYLE_INLINE, alwaysRemoveElement: 1 } );
			editor.removeStyle( style );

			if ( bookmark ) {
				range.moveToBookmark( bookmark );
				range.select();
			}
		},

		refresh: function( editor, path ) {
			// Despite our initial hope, document.queryCommandEnabled() does not work
			// for this in Firefox. So we must detect the state by element paths.

			var element = path.lastElement && path.lastElement.getAscendant( 'a', true );

			if ( element && element.getName() == 'a' && element.getAttribute( 'href' ) && !element.getAttribute( 'resource' ) && !element.getAttribute( 'data-widget' ) && element.getChildCount() )
				this.setState( CKEDITOR.TRISTATE_OFF );
			else
				this.setState( CKEDITOR.TRISTATE_DISABLED );
		},

		contextSensitive: 1,
		startDisabled: 1,
		requiredContent: 'a[href]',
		editorFocus: 1
	};

	CKEDITOR.tools.extend( CKEDITOR.config, {
		/**
		 * Whether to show the Advanced tab in the Link dialog window.
		 *
		 * @cfg {Boolean} [linkShowAdvancedTab=true]
		 * @member CKEDITOR.config
		 */
		linkShowAdvancedTab: true,

		/**
		 * Whether to show the Target tab in the Link dialog window.
		 *
		 * @cfg {Boolean} [linkShowTargetTab=true]
		 * @member CKEDITOR.config
		 */
		linkShowTargetTab: true

		/**
		 * Whether JavaScript code is allowed as a `href` attribute in an anchor tag.
		 * With this option enabled it is possible to create links like:
		 *
		 *		<a href="javascript:alert('Hello world!')">hello world</a>
		 *
		 * By default JavaScript links are not allowed and will not pass
		 * the Link dialog window validation.
		 *
		 * @since 4.4.1
		 * @cfg {Boolean} [linkJavaScriptLinksAllowed=false]
		 * @member CKEDITOR.config
		 */
	} );
} )();
