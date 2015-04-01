CKEDITOR.plugins.add( 'codeTag', {
  icons: 'code',
  init: function( editor ) {
    editor.addCommand( 'wrapCode', {
      exec: function( editor ) {
    	// Updated by Craig 1 April 2015 to add <pre>
        editor.insertHtml( '<pre><code>' + editor.getSelection().getSelectedText() + '</code></pre>' );
      }
    });
    editor.ui.addButton( 'Code', {
      label: 'Wrap code',
      command: 'wrapCode',
      toolbar: 'insert'
    });
  }
});
