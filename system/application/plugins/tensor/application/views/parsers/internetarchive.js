(function( $ ) {
	
    $.fn.parse = function(options) {
    	var model = new $.fn.spreadsheet_model(options);
    	model.parse = parse;
    	model.fetch('html');  // Removes Safari erros below
    };
    
	function parse(data, archive) {
        var results = {};
        var resource_base = 'http://www.archive.org/details/';
        var download_base = 'http://www.archive.org/download/';
        var filetypes = [
                     	'MPEG4',
                    	'512Kb+MPEG4',
                    	'h.264',
                    	'WAVE',
                    	'QuickTime',
                    	'160Kbps+MP3',
                    	'128Kbps+MP3',
                    	'64Kbps+MP3',
                    	'56Kbps+MP3',
                    	'VBR+MP3',
                    	'JPEG',
                    	'JPEG+Thumb',
                    	'Item+Image',
                    	'Text+PDF'    
                    ];
        var thumbtypes = ['Thumbnail','JPEG+Thumb'];
        $(data).find('doc').each(function() {
        	var $this = $(this);
        	// Identifier is in the URI and thumbnail
        	var identifier = $this.find('[name="identifier"]').text();
        	var uri = '';
        	// Get the URI and thumbnail by comparing the list of formats to the precidence lists above
        	var formats = [];
        	$this.find('[name="format"] str').each(function() {
        		formats.push($(this).text().replace(' ','+'));
        	});
            for (var j = (filetypes.length-1); j >= 0; j--) {
            	if (formats.indexOf(filetypes[j]) != -1) {
            		uri = download_base+identifier+'/format='+filetypes[j];
            	}
            }
            if (!uri.length) return;
            var thumb = '';
            for (var j = (thumbtypes.length-1); j >= 0; j--) {
            	if (formats.indexOf(thumbtypes[j]) != -1) {
            		thumb = download_base+identifier+'/format='+thumbtypes[j];
            	}
            }           
            // Other fields
        	var coverage = $this.find('[name="coverage"] str:first').text();
        	var title = $this.find('[name="title"]').text();
        	var desc = $this.find('[name="description"]').html();
        	var contrib = $this.find('[name="creator"] str:first').text();
        	var publisher = $this.find('[name="source"]').text();
        	var date = $this.find('[name="date"]').text();
        	var license = $this.find('[name="licenseurl"]').text();
        	var type = $this.find('[name="mediatype"]').text();
        	// Write object
        	results[uri] = {};
        	results[uri]['http://purl.org/dc/terms/identifier'] = [{type:'uri',value:identifier}];
        	results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#sourceLocation'] = [{type:'uri',value:resource_base+identifier}];
        	if (thumb.length) results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail'] = [{type:'uri',value:thumb}];
        	results[uri]['http://simile.mit.edu/2003/10/ontologies/artstor#url'] = [{type:'uri',value:uri}];
        	if ('undefined'!=typeof(coverage) && coverage.length) results[uri]['http://purl.org/dc/terms/coverage'] = [{type:'uri',value:coverage}];
        	if ('undefined'!=typeof(title) && title.length) results[uri]['http://purl.org/dc/terms/title'] = [{type:'uri',value:title}];
        	if ('undefined'!=typeof(desc) && desc.length) results[uri]['http://purl.org/dc/terms/description'] = [{type:'uri',value:desc}];
        	if ('undefined'!=typeof(contrib) && contrib.length) results[uri]['http://purl.org/dc/terms/contributor'] = [{type:'uri',value:contrib}];
        	results[uri]['http://purl.org/dc/terms/source'] = [{type:'uri',value:archive.title}];
        	if ('undefined'!=typeof(publisher) && publisher.length) results[uri]['http://purl.org/dc/terms/publisher'] = [{type:'uri',value:publisher}];
        	if ('undefined'!=typeof(date) && date.length) results[uri]['http://purl.org/dc/terms/date'] = [{type:'uri',value:date}];
        	if ('undefined'!=typeof(license) && license.length) results[uri]['http://purl.org/dc/terms/license'] = [{type:'uri',value:license}];
        	if ('undefined'!=typeof(type) && type.length) results[uri]['http://purl.org/dc/terms/type'] = [{type:'uri',value:type}];
        });
        console.log(results);
        this.opts.complete_callback(results, archive);
	};
    
}( jQuery ));