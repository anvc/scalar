

function curriculumexplorer(node) {
	
	$('article h1').css('font-size','3.5rem');
	var $wrapper = $('<div class="curriculum_explorer paragraph_wrapper"><div style="text-align:center;">Loading...</div></div>').appendTo("span[property='sioc:content']");
	if (!node.current.sourceFile || !node.current.sourceFile.length) {
		alert('A JSON file needs to be present as the page\'s Media URL for this view to operate.');
		return;
	};
	var base = $('link#parent').attr('href');
	var paths = ['territory','colonialism','community','wellness'];  // TODO
	var empty_img = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
	$.ajax({
	  dataType: "json",
	  url: node.current.sourceFile,
	  error: function(err) {
		$wrapper.html('<div class="container-fluid"></div>');
		alert('There was an error trying to access the JSON file: '+err.statusText);
	  },
	  success: function(json) {
  		if ('undefined'==typeof(json.connections) || !json.connections.length) {
			alert('The JSON file kept in the Media URL for this page is improperly formatted.');
			return;
		};
		$wrapper.html('<div class="container-fluid" style="padding-left:0px;padding-right:0px;"></div>');
		var html = '';
		html += '<div class="row">';
		// Section 1: grade and subject
		html += '  <div class="col-xs-12 col-md-3">';
		html += '    <div class="panel panel-default"><div class="panel-heading" style="line-height:1.25;"><strong class="small">1. Choose a grade level and subject(s).</strong></div></div>';
		html += '    <label class="small"><b>Grade level</b></label><br />';
		html += '    <div class="btn-group">';
		html += '      <button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"><span id="ce-select-grade">Select a grade</span> <span class="caret"></span></button>';
		html += '      <ul id="ce-grades" class="dropdown-menu" aria-labelledby="dropdownMenu1"><li data-index=""><a href="javascript:void(null);" data-index="">Select a grade</a></li></ul>';
		html += '    </div><br />';
		html += '    <label class="small" style="margin-top:10px;"><b>Subject</b></label>';
		html += '    <div id="ce-subjects" class="form-group">';
		html += '    </div>';
		html += '  </div>';
		// Section 2: path and page
		html += '  <div class="col-xs-12 col-md-9">';
		html += '    <div class="panel panel-default"><div class="panel-heading" style="line-height:1.25;"><strong class="small">2. Choose a chapter and page(s) to see related curriculum.</strong></div></div>';
		html += '    <label class="small"><b>Book content</b></label><br />';
		html += '    <div class="btn-group btn-group-inline">';
		html += '      <button class="btn btn-default dropdown-toggle" style="width:130px;text-align:left;" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"><span id="ce-select-path">Select a path</span> <span class="caret" style="position:absolute;right:12px;top:45%;"></span></button>';
		html += '      <ul id="ce-paths" class="dropdown-menu" aria-labelledby="dropdownMenu1"></ul>';
		html += '    </div>&nbsp; &nbsp; ';
		html += '    <div class="btn-group btn-group-inline">';
		html += '      <button class="btn btn-default dropdown-toggle" style="width:400px;text-align:left;" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"><span id="ce-select-page">All pages</span> <span class="caret" style="position:absolute;right:12px;top:45%;"></span></button>';
		html += '      <ul id="ce-pages" class="dropdown-menu" aria-labelledby="dropdownMenu1"></ul>';
		html += '    </div><br />';
		html += '    <div id="ce-content" style="margin-top:18px;">';
		html += '      <img src="'+empty_img+'" alt="" id="ce-content-image" class="img-thumbnail" style="width:190px;height:165px;margin-right:20px;" align="left">';
		html += '      <h4 style="margin-top:0px;margin-bottom:8px;"><a href="" id="ce-content-title">&nbsp;</a></h4>';
		html += '      <div id="ce-content-desc" style="font-size:14px;line-height:1.45;"></div>';
		html += '      <a id="ce-content-button" class="btn btn-default btn-sm" style="margin-top:12px;display:none;" href="">Go to page</a>';
		html += '    </div>';
		html += '  </div>';
		html += '</div>';
		// Section 3: goal
		html += '<div class="row">';
		html += '  <div class="col-xs-12">';
		html += '    <div class="panel panel-default"><div class="panel-heading" style="line-height:1.25;"><strong class="small">3. View curriculum connections.</strong></div></div>';
		html += '    <div id="ce-goals" style="line-height:1.45;"></div>';
		html += '  </div>';
		html += '</div>';
		$wrapper.find('.container-fluid').html(html);
		// UI
		$wrapper.find('.row:first .panel-heading:last').css('min-height', $wrapper.find('.row:first .panel-heading:first').innerHeight());
		// Propagate
		for (var j = 0; j < json.grades.length; j++) {
			$('#ce-grades').append('<li data-index="'+j+'"><a href="javascript:void(null);" data-index="'+j+'">'+json.grades[j]+'</a></li>');
		};
		var num_to_asterisk = 2;
		for (var j = 0; j < json.subjects.length; j++) {
			$('#ce-subjects').append('<div class="checkbox" style="margin:0px 0px 0px 0px;"><label class="small"><input type="checkbox" name="subjects" value="'+j+'">'+json.subjects[j]+'</label></div>');
			if ((j+1) <= num_to_asterisk) $('#ce-subjects').find('label:last').append('<span>*</span>');
			if ((j+1) == num_to_asterisk) $('<hr style="background-color:#cccccc;color:#cccccc;height:1px;overflow:hidden;margin:7px 0px 6px 0px;padding:0px;border:0;" />').insertAfter($('#ce-subjects').find('label:last'));
		};
		$('#ce-subjects').append('<div style="margin:6px 0px 0px 0px;font-size:10px;line-height:1.2;">*Curriculum connections for these subjects are provided in extensive detail. Connections with other subjects are more suggestive than exhaustive.</div>');
		for (var j = 0; j < paths.length; j++) {
			$('#ce-paths').append('<li data-index="'+j+'"><a href="javascript:void(null);" data-index="'+j+'">'+paths[j].charAt(0).toUpperCase()+paths[j].slice(1)+'</a></li>');
		};
		// Events
		$('#ce-grades').find('a').click(function() {
			var $this = $(this);
			$('#ce-select-grade').html( $this.html()).data('index', $(this).data('index') );
			$('#ce-grades').find('li').removeClass('active');
			$this.parent().addClass('active');
			set_subjects();
			set_pages();
			set_goals();
		});
		$('#ce-subjects').find('input[type="checkbox"]').change(function() {
			set_pages();
			set_goals();
		});
		$('#ce-paths').find('a').click(function() {
			var path_index = parseInt($(this).data('index'));
			commit_path(path_index);
		});
		// Actions
		var set_subjects = function() {
			var grade_index = parseInt($('#ce-select-grade').data('index'));
			$('#ce-subjects').find('input[type="checkbox"]').each(function() {  // Enable all subjects
				$(this).removeProp('disabled').parent().css('color','initial').css('cursor','pointer').css('-webkit-text-fill-color','initial');
			});
			if (isNaN(grade_index)) return;
			$('#ce-subjects').find('input[type="checkbox"]').each(function() {  // Disable all subjects
				$(this).prop('disabled',true).parent().css('color','#aaaaaa').css('cursor','not-allowed').css('-webkit-text-fill-color','#aaaaaa');
			});
			for (var j = 0; j < json.connections.length; j++) {  // Enable subjects connected to the chosen grade
				if (grade_index != json.connections[j].gradeIndex) continue;
				$('#ce-subjects').find('input[type="checkbox"][value="'+json.connections[j].subjectIndex+'"]').removeProp('disabled').parent().css('color','initial').css('cursor','pointer').css('-webkit-text-fill-color','initial');
			};
			$('#ce-subjects').find('input[type="checkbox"][disabled]').removeProp('checked');
		}
		var set_pages = function() {
			$('#ce-pages').find('li').removeClass('disabled');
			var subjectIndexes = [];
			$('#ce-subjects').find('input[type="checkbox"]:checked').each(function() {
				subjectIndexes.push(parseInt($(this).val()));
			});
			if (!subjectIndexes.length) return;
			$('#ce-pages').find('li').addClass('disabled').each(function() {  // Disable pages that don't match the selected subject
				var $this = $(this);
				var slug = $this.data('slug');
				if (!slug.length) {
					$this.removeClass('disabled');
					return;
				};
				var passed = [];
				for (n = 0; n < json.connections.length; n++) {
					if (slug != json.connections[n].slug) continue;
					if (-1 == subjectIndexes.indexOf(json.connections[n].subjectIndex)) continue;
					$this.removeClass('disabled');
				};
			});
			var $disabled_and_active = $('#ce-pages').find('li.disabled.active');  // If an active page becomes disabled, revert to All
			if ($disabled_and_active.length) {
				$('#ce-pages').find('a:first').click();
			}
		};
		var set_goals = function() {
			var $goals = $('#ce-goals').empty();
			var slug = $('#ce-pages').find('li.active').data('slug');  // Chosen page
			if ('undefined' != typeof(slug) && slug.length) {
				var slugs = [slug];
			} else {
				var slugs = [];
				$('#ce-pages').find('li').each(function() {
					var $this = $(this);
					if ($this.data('slug').length) slugs.push($this.data('slug')); 
				});
			};
			var gradeIndex = parseInt($('#ce-select-grade').data('index'));  // Chosen grade
			if (!isNaN(gradeIndex)) {
				var gradeIndexes = [gradeIndex];
			} else {
				var gradeIndexes = [];
    			$('#ce-grades').find('li').each(function() {
					var $this = $(this);
					if (!isNaN(parseInt($this.data('index')))) gradeIndexes.push(parseInt($this.data('index'))); 
    			});                     				
			};
			var subjectIndexes = [];  // Chosen subjects
			$('#ce-subjects').find('input[type="checkbox"]:checked').each(function() {
				subjectIndexes.push(parseInt($(this).val()));
			});
			console.log('-----');
			console.log(slugs);
			console.log(gradeIndexes);
			console.log(subjectIndexes);
			if (!subjectIndexes.length) return;  // Must have at least one subject
			var alphabetized_subjects = json.subjects.slice();
			alphabetized_subjects.sort();
			// Level 1: Grades
			var obj = {};
			for (var j = 0; j < gradeIndexes.length; j++) {
				if ('undefined' == typeof(obj[gradeIndexes[j]])) obj[gradeIndexes[j]] = {};
				// Level 2: Subjects
				for (var k = 0; k < subjectIndexes.length; k++) {
					var subject = json.subjects[subjectIndexes[k]];
					if ('undefined' == typeof(obj[gradeIndexes[j]][subject])) obj[gradeIndexes[j]][subject] = {};
					// Level 3: Categories
					for (m = 0; m < json.categories.length; m++) {
						// Level 4: Courses and Teaching Goals based on Pages
						for (n = 0; n < json.connections.length; n++) {
							if (json.connections[n].gradeIndex != gradeIndexes[j]) continue;
							if (json.connections[n].subjectIndex != subjectIndexes[k]) continue;
							if (json.connections[n].categoryIndex != m) continue;
							if (slugs.indexOf(json.connections[n].slug) == -1) continue;
							var course = json.connections[n].course;
							if ('undefined' == typeof(obj[gradeIndexes[j]][subject][course])) obj[gradeIndexes[j]][subject][course] = {};
							if ('undefined' == typeof(obj[gradeIndexes[j]][subject][course][m])) obj[gradeIndexes[j]][subject][course][m] = [];
							var teachingGoal = json.teachingGoals[json.connections[n].teachingGoalIndex];
							obj[gradeIndexes[j]][subject][course][m].push(teachingGoal);
						};
					};
					for (var course in obj[gradeIndexes[j]][subject]) {
						for (var m in obj[gradeIndexes[j]][subject][course]) {
							obj[gradeIndexes[j]][subject][course][m] = unique(obj[gradeIndexes[j]][subject][course][m]);
						};
					};
				};
			};
			console.log(obj);
			for (var gradeIndex in obj) {
				var pass = false;
				for (var subject in obj[gradeIndex]) {
					if (!$.isEmptyObject(obj[gradeIndex][subject])) pass = true;
				};
				if (!pass) continue;
				var grade = json.grades[gradeIndex];
				$goals.append('<h3 style="font-weight:normal;margin:0px;padding:0.5rem 0px 1rem 0px;">'+grade+'</h3>');
				for (var a = 0; a < alphabetized_subjects.length; a++) {
					var subject = alphabetized_subjects[a];
					if ('undefined' == typeof(obj[gradeIndex][subject])) continue;
					if ($.isEmptyObject(obj[gradeIndex][subject])) continue;
					$goals.append('<h4 style="font-weight:bold;margin:0px;padding:0px 0px 1.5rem 0px;">'+subject+'</h4>');
					var courses_alphabetized = Object.keys(obj[gradeIndex][subject]).sort();
					for (var b = 0; b < courses_alphabetized.length; b++) {
						var course = courses_alphabetized[b];
						if ('undefined' == typeof(obj[gradeIndex][subject][course])) continue;
						if (course.length) $goals.append('<h5 style="font-weight:bold;margin:0px;padding:0rem 0px 1.25rem 0px;">Course: "'+course+'"</h5>');
						for (categoryIndex in obj[gradeIndex][subject][course]) {
							var category = json.categories[categoryIndex];
							$goals.append('<h5 style="font-weight:normal;font-style:italic;margin:0px 0px 1rem 0px;padding:0px 0px 4px 0px;border-bottom:solid 1px #000000;">'+ucwords(category)+'</h5>');
							var $list = $('<ul></ul>').appendTo($goals);
							for (var j = 0; j < obj[gradeIndex][subject][course][categoryIndex].length; j++) {
								var goal = obj[gradeIndex][subject][course][categoryIndex][j];
								$list.append('<li style="font-size:14px;padding:0px 0px 0px 0px;margin:0px 0px 0px 0px;">'+goal+'</li>');
							};
						};
						$goals.append('<h5 style="font-weight:normal;margin:0px 0px -8px 0px;padding:0px;">&nbsp;</h5>');  // Spacer
					};
				};
				$goals.append('<h5 style="font-weight:normal;margin:0px 0px 0px 0px;padding:0px;">&nbsp;</h5>');  // Spacer
			};
		};
		var commit_path = function(path_index) {
			var path_ucwords = paths[path_index].charAt(0).toUpperCase()+paths[path_index].slice(1);
			$('#ce-select-path').text(path_ucwords);
			$('#ce-paths').find('li').removeClass('active').eq(path_index).addClass('active');
			$('#ce-pages').empty();
			$('#ce-select-page').text('Loading pages...');
			$('#ce-content-image').prop('src', empty_img);
			$('#ce-content-title, #ce-content-desc').html('&nbsp;');
			$('#ce-content-button').hide();
			$('#ce-goals').empty();
    		$.getJSON(base+'rdf/node/'+paths[path_index]+'.rdfjson?rec=1&res=path', function(pages) {
    			$('#ce-pages').append('<li data-slug=""><a href="javascript:void(null);" data-slug="">All pages</a></li>').find('li').eq(0).addClass('active');
    			$('#ce-select-page').text( $('#ce-pages').find('li:first a').text() );
    			for (var uri in pages) {
        			if ('undefined' == typeof(pages[uri]['http://purl.org/dc/terms/isVersionOf'])) continue;
        			var obj = {};
        			obj.version_uri = uri;
        			obj.content_uri = pages[uri]['http://purl.org/dc/terms/isVersionOf'][0].value;
        			obj.slug = obj.content_uri.replace(base,'');
        			if ('index' == obj.slug) continue;
        			obj.title = pages[uri]['http://purl.org/dc/terms/title'][0].value;
        			if (-1 != paths.indexOf(obj.slug)) obj.title += ' home page';
        			obj.description = ('undefined' != typeof(pages[uri]['http://purl.org/dc/terms/description'])) ? pages[uri]['http://purl.org/dc/terms/description'][0].value : '';
        			obj.content = ('undefined' != typeof(pages[uri]['http://rdfs.org/sioc/ns#content'])) ? pages[uri]['http://rdfs.org/sioc/ns#content'][0].value : '';
        			obj.banner = ('undefined' != typeof(pages[obj.content_uri]['http://scalar.usc.edu/2012/01/scalar-ns#banner'])) ? pages[obj.content_uri]['http://scalar.usc.edu/2012/01/scalar-ns#banner'][0].value : '';
        			var $el = $('<li data-slug="'+obj.slug+'"><a href="javascript:void(null);" data-slug="'+obj.slug+'">'+obj.title.replace(/(<([^>]+)>)/ig,"")+'</a></li>').appendTo('#ce-pages');
        			$el.data('fields', obj);
        		};
        		set_pages();
        		set_goals();
        		$('#ce-pages').find('a').click(function() {
        			var $this = $(this);
        			if ($this.parent().hasClass('disabled')) return;
        			$('#ce-content-image').prop('src', empty_img);
        			$('#ce-pages').find('li').removeClass('active');
        			$this.parent().addClass('active');
        			var fields = $this.parent().data('fields');
        			if ('undefined' == typeof(fields)) {
            			$('#ce-select-page').text('All pages');
            			$('#ce-content-image').prop('src', empty_img);
            			$('#ce-content-title, #ce-content-desc').html('&nbsp;');
            			$('#ce-content-button').hide();
        			} else {
        				$('#ce-select-page').html($this.html()).data('slug', fields.slug);
        				$('#ce-content-image').prop('src', fields.banner);
        				$('#ce-content-title').html(fields.title.replace(/(<([^>]+)>)/ig,"")).attr('href', fields.content_uri);
        				var desc = (fields.description.length > fields.content.length) ? fields.description.replace(/(<([^>]+)>)/ig,"") : fields.content.replace(/(<([^>]+)>)/ig,"");
        				if (desc.length > 250) desc = desc.substr(0, 250) + '...';
        				$('#ce-content-desc').html(desc);
        				$('#ce-content-button').show().attr('href', fields.content_uri);
        			};
        			set_pages();
        			set_goals();
        		});
    		});
		};
        commit_path(0);
        var ucwords = function(str) {  // http://locutus.io/php/ucwords/
          return (str + '').replace(/^(.)|\s+(.)/g, function ($1) {
            return $1.toUpperCase()
          });
        };
        var unique = function(array) {
          return array.filter(function(el, index, arr) {
            return index == arr.indexOf(el);
          });
        };
	  }
	});
	
};