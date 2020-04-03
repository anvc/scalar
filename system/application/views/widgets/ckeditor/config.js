/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * Convert \n to <br /> when pasting into the 'source' mode
 * @author 	Craig Dietrich
 * @version	1.1 (refactor \n => <br /> on paste due to changes in CKEditor's bubbling
 */
var codemirror_cke_1_previous_changes = [];  // Global
$(document).on('paste', 'textarea', function (e, c) {
	if ('undefined' == typeof(codemirror_cke_1) || !codemirror_cke_1) return;  // Not in Source view
	if (codemirror_cke_1_previous_changes.length >= 2 && codemirror_cke_1_previous_changes[0].length) return;  // There is existing text
	var val = codemirror_cke_1.getValue();
	val = val.replace(/^\s+|\s+$/g, '');  // Trim line breaks from beginning and end
	if (-1 == val.indexOf('<br')) {  // Already has break tags
		val = val.replace(new RegExp('\r?\n','g'), "<br />\n");
	};
	setTimeout(function() {
		codemirror_cke_1.setValue(val);
	}, 10);
});
CKEDITOR.on('instanceReady', function(evt){
	var editor = evt.editor;
	editor.on('mode', function() {
		codemirror_cke_1_previous_changes = [];
	});
	editor.on('change', function(e) {
		if ('undefined' == typeof(codemirror_cke_1) || !codemirror_cke_1) return;  // Not in Source view
		var value = codemirror_cke_1.getValue();
		codemirror_cke_1_previous_changes.push(value);
		if (codemirror_cke_1_previous_changes.length > 2) codemirror_cke_1_previous_changes.shift();
	});
});

// Editor config
CKEDITOR.editorConfig = function( config ) {

    config.plugins = 
            'dialogui,'+
            'dialog,'+
            'a11yhelp,'+
            'basicstyles,'+
            'blockquote,'+
            'clipboard,'+
            'panel,'+
            'floatpanel,'+
            'panelbutton,'+
            'listblock,'+
            'richcombo,'+
            'format,'+
            'menu,'+
            'button,'+
            'toolbar,'+
            'elementspath,'+
            'enterkey,'+
            'entities,'+
            'wysiwygarea,'+
            'indent,'+
            'indentlist,'+
            'list,'+
            'maximize,'+
            'pastetext,'+
            'pastefromword,'+
            'removeformat,'+
            'sourcearea,'+
            'specialchar,'+
            'menubutton,'+
            'undo,'+
            'colorbutton,'+
            'colordialog,'+
            'codeTag,'+
            'fakeobjects,'+
            'iframe,'+
            'codemirror,'+
            'scalarunlink,'+
            'scalar,'+
            'floatingspace';
	config.skin = 'bootstrapck';
	config.allowedContent = true;
	config.extraAllowedContent = 'code pre a[*]';
	config.disableNativeSpellChecker = false;
	config.height = 350;
	config.font_defaultLabel = 'Lucida Grande';
	config.fontSize_defaultLabel = '12px';
	config.enterMode = CKEDITOR.ENTER_BR;
	
	config.entities_greek = false;
	config.entities_latin = false;

	config.toolbar = 'Scalar';
	config.toolbar_Scalar =
	[
		{ name: 'document', items : [ 'Source' ] },
		/* { name: 'size', items : [ 'Maximize' ] }, */
		{ name: 'clipboard', items : [ 'PasteText','PasteFromWord','Undo','Redo' ] },
		{ name: 'basicstyles', items : [ 'Bold','Italic','Underline','TextColor', 'BGColor' ] },
		{ name: 'clear', items : [ 'RemoveFormat','Unlink' ] },
		{ name: 'formatting', items : [ 'Format','NumberedList','BulletedList','Blockquote','-','SpecialChar','Code','Iframe' ] },
		{ name: 'advanced', items : [ 'Scalar1', 'Scalar2', 'Scalar5', 'Scalar10', 'Scalar8', 'Scalar9', 'Scalar6', 'Scalar7' ] },
		{ name: 'editorial', items:['editorialTools']}
	];
	config.toolbar_ScalarInline =
	[
		{ name: 'document', items : [ 'Source' ] },
		/* { name: 'size', items : [ 'Maximize' ] }, */
		{ name: 'clipboard', items : [ 'PasteText','PasteFromWord','Undo','Redo' ] },
		{ name: 'basicstyles', items : [ 'Bold','Italic','Underline','TextColor', 'BGColor'] },
		{ name: 'clear', items : [ 'RemoveFormat' ] },
		{ name: 'formatting', items : [ 'Format','NumberedList','BulletedList','Blockquote','-','SpecialChar','Code','Iframe' ]},
		'/',
		{ name: 'advanced', items : [ 'Scalar1', 'Scalar2', 'Scalar5', 'Scalar10', 'Scalar8', 'Scalar9', 'Scalar6', 'Scalar7' ] }
		
	];

	// Remove some buttons provided by the standard plugins, which are not needed in the Standard(s) toolbar.
	config.removeButtons = '';

	// Set the most common block elements.
	config.format_tags = 'h1;h2;h3;h4;h5;h6';

	// Simplify the dialog windows.
	config.removeDialogTabs = 'image:advanced;link:advanced';

	config.codemirror = {
		    // Set this to the theme you wish to use (codemirror themes)
		    theme: 'default',
		    // Whether or not you want to show line numbers
		    lineNumbers: false,
		    // Whether or not you want to use line wrapping
		    lineWrapping: true,
		    // Whether or not you want to highlight matching braces
		    matchBrackets: true,
		    // Whether or not you want tags to automatically close themselves
		    autoCloseTags: false,
		    // Whether or not you want Brackets to automatically close themselves
		    autoCloseBrackets: false,
		    // Whether or not to enable search tools, CTRL+F (Find), CTRL+SHIFT+F (Replace), CTRL+SHIFT+R (Replace All), CTRL+G (Find Next), CTRL+SHIFT+G (Find Previous)
		    enableSearchTools: false,
		    // Whether or not you wish to enable code folding (requires 'lineNumbers' to be set to 'true')
		    enableCodeFolding: false,
		    // Whether or not to enable code formatting
		    enableCodeFormatting: true,
		    // Whether or not to automatically format code should be done when the editor is loaded
		    autoFormatOnStart: true,
		    // Whether or not to automatically format code should be done every time the source view is opened
		    autoFormatOnModeChange: true,
		    // Whether or not to automatically format code which has just been uncommented
		    autoFormatOnUncomment: true,
		    // Define the language specific mode 'htmlmixed' for html including (css, xml, javascript), 'application/x-httpd-php' for php mode including html, or 'text/javascript' for using java script only
		    mode: 'htmlmixed',
		    // Whether or not to show the search Code button on the toolbar
		    showSearchButton: false,
		    // Whether or not to show Trailing Spaces
		    showTrailingSpace: true,
		    // Whether or not to highlight all matches of current word/selection
		    highlightMatches: false,
		    // Whether or not to show the format button on the toolbar
		    showFormatButton: false,
		    // Whether or not to show the comment button on the toolbar
		    showCommentButton: false,
		    // Whether or not to show the uncomment button on the toolbar
		    showUncommentButton: false,
		    // Whether or not to show the showAutoCompleteButton button on the toolbar
		    showAutoCompleteButton: false,
		    // Whether or not to highlight the currently active line
		    styleActiveLine: true
		};

};
CKEDITOR.dtd.$removeEmpty['a'] = false;
CKEDITOR.dtd.$removeEmpty['i'] = false;
