CKEDITOR._scalar = {
	selectcontent : function(options) {
		$('<div></div>').content_selector(options);
	},
	external_link : function(editor, options) {
		CKEDITOR.dialog.add( 'external_link', function(editor) {
			return {
				title : 'Insert External Link',
				width : 500,
				minHeight : 100,
				contents : [{
					id : 'general',
					label : 'External Link',
					elements : [{
						type : 'html',
						html : 'Add a hyperlink to an external site. Scalar will maintain a header bar that allows easy navigation back to your book (unless disallowed by the external site).'		
					},{
						type : 'text',
						id : 'href',
						label : 'URL',
						'default' : 'http://',
						validate : CKEDITOR.dialog.validate.notEmpty( 'URL is a required field' ),
						required : true,
						setup : function(element) {
							if (null!==element.getAttribute('href')) this.setValue(element.getAttribute('href'));
						},
						commit : function(data) {
							data.href = this.getValue();
						}						
					},{
						type : 'checkbox',
						id : 'target_blank',
						label : 'Open in a new browser window',
						'default' : false,
						setup : function(element) {
							if ('_blank'==element.getAttribute('target')) this.setValue('checked');
						},						
						commit : function(data) {
							data.target = (this.getValue()) ? '_blank' : false;
						}						
					}]
				}],
				onShow : function() {
					var sel = editor.getSelection(), element = sel.getStartElement();
					if (sel.getRanges()[0].collapsed) {
						alert('Please select text to become a link');
					    ckCancel = this._.buttons['cancel'],
					    ckCancel.click();
						return;
					}
					this.element = editor.document.createElement('a');
					this.element.setHtml(sel.getSelectedText());				
					if (element) element = element.getAscendant('a', true);
					// Browsers won't allow href attribute to be re-written, so doing this round-about by always creating a new <a> but propogating it with the existing element's values if it exists
					if (!element || element.getName() != 'a' || element.data('cke-realelement' )) {
						this.setupContent(this.element);
					} else {
						this.setupContent(element);
					}
				},				
				onOk : function() {
					var dialog = this, data = {};
					this.commitContent(data);
					if (data.href.length) this.element.setAttribute('href', data.href);
					if (data.target) this.element.setAttribute('target', data.target);
					editor.insertElement(this.element);	
				}
			};
		});		
		var _command = new CKEDITOR.dialogCommand('external_link');
		editor.addCommand('_external_link_dialog', _command);
		editor.execCommand("_external_link_dialog");
	}
};

CKEDITOR.plugins.add( 'scalar', {
    icons: 'scalar1,scalar2,scalar3,scalar4,scalar5,scalar6,scalar7',
    requires: 'dialog',
    init: function( editor ) {
        editor.addCommand( 'insertScalar1', {
            exec: function( editor ) {
        		CKEDITOR._scalar.selectcontent({type:'media',changeable:false,multiple:false,msg:'Insert Scalar Media Link'});
            }
        });
        editor.addCommand( 'insertScalar2', {
            exec: function( editor ) {
        		CKEDITOR._scalar.selectcontent({type:'media',changeable:false,multiple:false,msg:'Insert Inline Scalar Media Link'});
            }
        });
        editor.addCommand( 'insertScalar3', {
            exec: function( editor ) {
        		CKEDITOR._scalar.selectcontent({type:'annotation',changeable:false,multiple:false,msg:'Insert Scalar Annotation'});
            }
        });     
        editor.addCommand( 'insertScalar4', {
            exec: function( editor ) {
        		CKEDITOR._scalar.selectcontent({type:'annotation',changeable:false,multiple:false,msg:'Insert Inline Scalar Annotation'});
            }
        });   
        editor.addCommand( 'insertScalar5', {
            exec: function( editor ) {
        		CKEDITOR._scalar.selectcontent({changeable:true,multiple:false,msg:'Insert Inline Scalar Media Link'});
            }
        });   
        editor.addCommand( 'insertScalar6', {
            exec: function( editor ) {
        		CKEDITOR._scalar.selectcontent({changeable:true,multiple:false,msg:'Insert Link to a Scalar Page'});
            }
        });     
        editor.addCommand( 'insertScalar7', {  // External link
            exec: function( editor ) {
        		CKEDITOR._scalar.external_link(editor, {});
            }
        });         
        editor.ui.addButton( 'Scalar1', {
            label: 'Insert Scalar Media Link',
            command: 'insertScalar1',
            toolbar: 'links'
        });
        editor.ui.addButton( 'Scalar2', {
            label: 'Insert Inline Scalar Media Link',
            command: 'insertScalar2',
            toolbar: 'links'
        });   
        editor.ui.addButton( 'Scalar3', {
            label: 'Insert Scalar Annotation',
            command: 'insertScalar3',
            toolbar: 'links'
        });   
        editor.ui.addButton( 'Scalar4', {
            label: 'Insert Inline Scalar Annotation',
            command: 'insertScalar4',
            toolbar: 'links'
        });
        editor.ui.addButton( 'Scalar5', {
            label: 'Insert Scalar Note',
            command: 'insertScalar5',
            toolbar: 'links'
        });   
        editor.ui.addButton( 'Scalar6', {
            label: 'Insert Link to a Scalar Page',
            command: 'insertScalar6',
            toolbar: 'links'
        });    
        editor.ui.addButton( 'Scalar7', {
            label: 'Insert External Link',
            command: 'insertScalar7',
            toolbar: 'links'
        });           
    }
});

