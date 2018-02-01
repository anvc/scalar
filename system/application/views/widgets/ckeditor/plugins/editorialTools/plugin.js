CKEDITOR.plugins.add( 'editorialTools', {
    //icons: 'editorialTools',
    init: function( editor ) {
        var pluginDirectory = this.path;
        var $editorialToolsPanel;
        var addedEditorialToolsPanel = false;
        var expandedEditorWidth;

        editor.addContentsCss( pluginDirectory + 'css/editorialTools.css' );
	    
	    editor.on('mode',function(e){
            $(editor.container.$).find('.cke_button.cke_button__editorialtools').removeClass('active');
            $(editor.container.$).find('.cke_inner').removeClass('editorialToolsExpanded');
            if(!addedEditorialToolsPanel){
                $editorialToolsPanel = $('<div class="editorialToolsPanel clearfix">test</div>').insertAfter($(editor.container.$).find('.cke_contents'));
                $editorialToolsPanel.height($(editor.container.$).find('.cke_contents').height());
                addedEditorialToolsPanel = true;
            }else{
                $editorialToolsPanel.height($(editor.container.$).find('.cke_contents').height());
            }
        });

        editor.addCommand( 'toggleEditorialTools', {
            exec: function( editor ) {
                $(editor.container.$).find('.cke_inner').toggleClass('editorialToolsExpanded');
                $(editor.container.$).find('.cke_button.cke_button__editorialtools').toggleClass('active');
                expandedEditorWidth = $(editor.container.$).find('.cke_inner ').outerWidth();
                $editorialToolsPanel.width((expandedEditorWidth*.25)-10);
            }
        });

        editor.ui.addButton( 'editorialTools', {
            label: 'Editorial Tools',
            command: 'toggleEditorialTools',
            toolbar: 'formatting'
        });
    }
});