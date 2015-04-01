/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	
	// %REMOVE_START%
	// The configuration options below are needed when running CKEditor from source files.
	config.plugins = 'dialogui,dialog,a11yhelp,basicstyles,blockquote,clipboard,panel,floatpanel,panelbutton,menu,button,toolbar,elementspath,enterkey,entities,wysiwygarea,indent,indentlist,list,maximize,pastetext,pastefromword,removeformat,sourcearea,specialchar,menubutton,undo,colorbutton,colordialog,codeTag,fakeobjects,iframe,scalar';
	config.skin = 'bootstrapck';
	config.extraAllowedContent = 'code pre a[*]';
	config.height = 350;
	config.font_defaultLabel = 'Lucida Grande';
	config.fontSize_defaultLabel = '12px';	
	config.enterMode = CKEDITOR.ENTER_BR;
	// %REMOVE_END%

	config.toolbar = 'Scalar';
	 
	config.toolbar_Scalar =
	[
		{ name: 'document', items : [ 'Source' ] },
		{ name: 'size', items : [ 'Maximize' ] },
		{ name: 'clipboard', items : [ 'PasteText','PasteFromWord','Undo','Redo' ] },
		{ name: 'basicstyles', items : [ 'Bold','Italic','Underline','TextColor', 'BGColor' ] },
		{ name: 'formatting', items : [ 'NumberedList','BulletedList','Blockquote','-','SpecialChar','Code','Iframe' ] },
		{ name: 'advanced', items : [ 'Scalar1', 'Scalar2', 'Scalar3', 'Scalar4', 'Scalar5', 'Scalar6', 'Scalar7' ] },
		{ name: 'clear', items : [ 'RemoveFormat' ] }
	];
	 

	// Remove some buttons provided by the standard plugins, which are
	// not needed in the Standard(s) toolbar.
	config.removeButtons = '';

	// Set the most common block elements.
	config.format_tags = 'p;h1;h2;h3;pre';

	// Simplify the dialog windows.
	config.removeDialogTabs = 'image:advanced;link:advanced';
};
