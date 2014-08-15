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
 * http://www.osedu.org/licenses /ECL-2.0 
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.       
 */  

var scalarapi = new ScalarAPI();

function is_array(input){
  return typeof(input)=='object'&&(input instanceof Array);
}

/**
 * Creates a new instance of the API utility. You do not need to
 * call this constructor; the utility calls it itself and places
 * the resulting instance in the global variable scalarapi.
 * @class 		A jQuery-dependent JavaScript library which allows easy access to the Scalar API.
 * @author		<a href="mailto:erik@song.nu">Erik Loyer</a>
 * @version		1.0
 */
function ScalarAPI() {

	var me = this;
	
	this.model = new ScalarModel({
		parent_uri: $('link#parent').attr('href'),
		logged_in: $('link#logged_in').attr('href'),
		user_level: $('link#user_level').attr('href')
	});
	
	/**
	 * Browser detection script from http://www.quirksmode.org/js/detect.html
	 * Last revised 8/2011
	 * @private
	 *
	 * User agent sniffing is notoriously unreliable, but at the moment it's the best way to tell
	 * which media types (not which objects) a browser supports.
	 */
	this.browserDetect = {
		init: function () {
			this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
			this.version = this.searchVersion(navigator.userAgent)
				|| this.searchVersion(navigator.appVersion)
				|| "an unknown version";
			this.OS = this.searchString(this.dataOS) || "an unknown OS";
		},
		searchString: function (data) {
			for (var i=0;i<data.length;i++)	{
				var dataString = data[i].string;
				var dataProp = data[i].prop;
				this.versionSearchString = data[i].versionSearch || data[i].identity;
				if (dataString) {
					if (dataString.indexOf(data[i].subString) != -1)
						return data[i].identity;
				}
				else if (dataProp)
					return data[i].identity;
			}
		},
		searchVersion: function (dataString) {
			var index = dataString.indexOf(this.versionSearchString);
			if (index == -1) return;
			return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
		},
		dataBrowser: [
			{
				string: navigator.userAgent,
				subString: "Chrome",
				identity: "Chrome"
			},
			{ 	string: navigator.userAgent,
				subString: "OmniWeb",
				versionSearch: "OmniWeb/",
				identity: "OmniWeb"
			},
			{
				string: navigator.vendor,
				subString: "Apple",
				identity: "Safari",
				versionSearch: "Version"
			},
			{
				prop: window.opera,
				identity: "Opera",
				versionSearch: "Version"
			},
			{
				string: navigator.vendor,
				subString: "iCab",
				identity: "iCab"
			},
			{
				string: navigator.vendor,
				subString: "KDE",
				identity: "Konqueror"
			},
			{
				string: navigator.userAgent,
				subString: "Firefox",
				identity: "Firefox"
			},
			{
				string: navigator.vendor,
				subString: "Camino",
				identity: "Camino"
			},
			{		// for newer Netscapes (6+)
				string: navigator.userAgent,
				subString: "Netscape",
				identity: "Netscape"
			},
			{
				string: navigator.userAgent,
				subString: "MSIE",
				identity: "Explorer",
				versionSearch: "MSIE"
			},
			{
				string: navigator.userAgent,
				subString: "Gecko",
				identity: "Mozilla",
				versionSearch: "rv"
			},
			{ 		// for older Netscapes (4-)
				string: navigator.userAgent,
				subString: "Mozilla",
				identity: "Netscape",
				versionSearch: "Mozilla"
			}
		],
		dataOS : [
			{
				string: navigator.platform,
				subString: "Win",
				identity: "Windows"
			},
			{
				string: navigator.platform,
				subString: "Mac",
				identity: "Mac"
			},
			{
				   string: navigator.userAgent,
				   subString: "iPhone",
				   identity: "iPhone/iPod"
		    },
			{
				string: navigator.platform,
				subString: "Linux",
				identity: "Linux"
			}
		]
	
	};	
	
	this.browserDetect.init();
	
	switch (this.browserDetect.browser) {
	
		case 'Safari':
		if (this.browserDetect.OS != 'Mac') {
			this.scalarBrowser = 'MobileSafari';
		} else {
			this.scalarBrowser = 'Safari';
		}
		break;
		
		case 'Chrome':
		case 'Explorer':
		case 'Mozilla':
		this.scalarBrowser = this.browserDetect.browser;
		break;
		
		default:
		this.scalarBrowser = 'Other';
		break;
	
	}
	
	var prismSrcExt = ['js','java','xml','css','php','c','cpp','cs','html','php','py','rb'];
	var otherSrcExt = ['txt','code','4th','actionscript','as','adt','agl','asm','asi','hla','asp','aspx','bas','b','bash','bat','bsh','cbl','cgi','cl','class','cmd','cob','cobol','csh','dot','el','erl','f','f03','f40','f77','f90','f95','fcg','fcgi','for','forth','fpp','gcl','gemfile','graphml','gv','h','has','hrl','i6','i7','inc','inf','json','ksh','lisp','lsp','lua','m','mak','make','mk','nt','p','pas','pat','pd','pl','pls','ps','qlb','r','rake','rakefile','scheme','scm','scpt','AppleScript','sh','sql','ss','t','taf','vb','vbs','vbscript','zsh'];
	
	this.mediaSources = {
		'3GPP': {
			name:'3GPP', 
			extensions:['3gp'],
			isProprietary:false,
			contentType:'video',
			browserSupport: {
				'Mozilla': {extensions:['mov'], format:'QuickTime', player:'QuickTime', specifiesDimensions:true},
				'Explorer': {extensions:['mov'], format:'QuickTime', player:'QuickTime', specifiesDimensions:true},
				'MobileSafari': {extensions:['mov'], format:'QuickTime', player:'native', specifiesDimensions:true},
				'Safari': {extensions:['mov'], format:'QuickTime', player:'QuickTime', specifiesDimensions:true},
				'Chrome': {extensions:['mov'], format:'QuickTime', player:'QuickTime', specifiesDimensions:true},
				'Other': {extensions:['mov'], format:'QuickTime', player:'QuickTime', specifiesDimensions:true}
			}},
		'AIFF': {
			name:'AIFF',
			extensions:['aif','aiff'],
			isProprietary:false,
			contentType:'audio',
			browserSupport: {
				'Mozilla': {extensions:['aif','aiff'], format:'AIFF', player:'QuickTime', specifiesDimensions:false},
				'Explorer': {extensions:['aif','aiff'], format:'AIFF', player:'QuickTime', specifiesDimensions:false},
				'MobileSafari': {extensions:['aif','aiff'], format:'AIFF', player:'native', specifiesDimensions:false},
				'Safari': {extensions:['aif','aiff'], format:'AIFF', player:'native', specifiesDimensions:false},
				'Chrome': {extensions:['aif','aiff'], format:'AIFF', player:'QuickTime', specifiesDimensions:false},
				'Other': {extensions:['aif','aiff'], format:'AIFF', player:'QuickTime', specifiesDimensions:false}
			}},
		'CriticalCommons-LegacyVideo': {
			name:'CriticalCommons-LegacyVideo',
			extensions:['mp4'],
			isProprietary:false,
			contentType:'video',
			browserSupport: {
				'Mozilla': {extensions:['mp4'], format:'MPEG-4', player:'Flash', specifiesDimensions:true},
				'Explorer': {extensions:['mp4'], format:'MPEG-4', player:'native', specifiesDimensions:true},
				'MobileSafari': {extensions:['mp4'], format:'MPEG-4', player:'native', specifiesDimensions:true},
				'Safari': {extensions:['mp4'], format:'MPEG-4', player:'native', specifiesDimensions:true},
				'Chrome': {extensions:['mp4'], format:'MPEG-4', player:'Flash', specifiesDimensions:true},
				'Other': {extensions:['mp4'], format:'MPEG-4', player:'Flash', specifiesDimensions:true}
			}},
		'CriticalCommons-Video': {
			name:'CriticalCommons-Video',
			extensions:['mp4','webm'],
			isProprietary:false,
			contentType:'video',
			browserSupport: {
				'Mozilla': {extensions:['webm'], format:'WebM', player:'native', specifiesDimensions:true},
				'Explorer': {extensions:['mp4'], format:'MPEG-4', player:'native', specifiesDimensions:true},
				'MobileSafari': {extensions:['mp4'], format:'MPEG-4', player:'native', specifiesDimensions:true},
				'Safari': {extensions:['mp4'], format:'MPEG-4', player:'native', specifiesDimensions:true},
				'Chrome': {extensions:['webm'], format:'WebM', player:'native', specifiesDimensions:true},
				'Other': {extensions:['webm'], format:'WebM', player:'native', specifiesDimensions:true}
			}},
		'Deep Zoom Image': {
			name:'DeepZoomImage', 
			extensions:['dzi'],
			isProprietary:false,
			contentType:'tiledImage',
			browserSupport: {
				'Mozilla': {extensions:['dzi'], format:'DZI', player:'OpenSeadragon', specifiesDimensions:false},
				'Explorer': {extensions:['dzi'], format:'DZI', player:'OpenSeadragon', specifiesDimensions:false},
				'MobileSafari': {extensions:['dzi'], format:'DZI', player:'OpenSeadragon', specifiesDimensions:false},
				'Safari': {extensions:['dzi'], format:'DZI', player:'OpenSeadragon', specifiesDimensions:false},
				'Chrome': {extensions:['dzi'], format:'DZI', player:'OpenSeadragon', specifiesDimensions:false},
				'Other': {extensions:['dzi'], format:'DZI', player:'OpenSeadragon', specifiesDimensions:false}
			}},
		'FlashVideo': {
			name:'FlashVideo', 
			extensions:['flv'],
			isProprietary:false,
			contentType:'video',
			browserSupport: {
				'Mozilla': {extensions:['flv'], format:'Flash Video', player:'Flash', specifiesDimensions:false},
				'Explorer': {extensions:['flv'], format:'Flash Video', player:'Flash', specifiesDimensions:false},
				'Safari': {extensions:['flv'], format:'Flash Video', player:'Flash', specifiesDimensions:false},
				'Chrome': {extensions:['flv'], format:'Flash Video', player:'Flash', specifiesDimensions:false},
				'Other': {extensions:['flv'], format:'Flash Video', player:'Flash', specifiesDimensions:false}
			}},
		'GIF': {
			name:'GIF', 
			extensions:['gif'],
			isProprietary:false,
			contentType:'image',
			browserSupport: {
				'Mozilla': {extensions:['gif'], format:'GIF', player:'native', specifiesDimensions:true},
				'Explorer': {extensions:['gif'], format:'GIF', player:'native', specifiesDimensions:true},
				'MobileSafari': {extensions:['gif'], format:'GIF', player:'native', specifiesDimensions:true},
				'Safari': {extensions:['gif'], format:'GIF', player:'native', specifiesDimensions:true},
				'Chrome': {extensions:['gif'], format:'GIF', player:'native', specifiesDimensions:true},
				'Other': {extensions:['gif'], format:'GIF', player:'native', specifiesDimensions:true}
			}},
		'HIDVL': {
			name:'HIDVL',
			extensions:['mp4'],
			isProprietary:true,
			contentType:'video',
			browserSupport: {
				'Mozilla': {extensions:['mp4'], format:'MPEG-4', player:'proprietary', specifiesDimensions:false},
				'Explorer': {extensions:['mp4'], format:'MPEG-4', player:'proprietary', specifiesDimensions:false},
				'Safari': {extensions:['mp4'], format:'MPEG-4', player:'proprietary', specifiesDimensions:false},
				'MobileSafari': {extensions:['mp4'], format:'MPEG-4', player:'proprietary', specifiesDimensions:true},
				'Chrome': {extensions:['mp4'], format:'MPEG-4', player:'proprietary', specifiesDimensions:false},
				'Other': {extensions:['mp4'], format:'MPEG-4', player:'proprietary', specifiesDimensions:false}
			}},
		'HTML': {
			name:'HTML', 
			extensions:['htm','html','php','com','org','net'],
			isProprietary:false,
			contentType:'document',
			browserSupport: {
				'Mozilla': {extensions:['htm','html','php','com','org','net'], format:'HTML', player:'native', specifiesDimensions:false},
				'Explorer': {extensions:['htm','html','php','com','org','net'], format:'HTML', player:'native', specifiesDimensions:false},
				'MobileSafari': {extensions:['htm','html','php','com','org','net'], format:'HTML', player:'native', specifiesDimensions:false},
				'Safari': {extensions:['htm','html','php','com','org','net'], format:'HTML', player:'native', specifiesDimensions:false},
				'Chrome': {extensions:['htm','html','php','com','org','net'], format:'HTML', player:'native', specifiesDimensions:false},
				'Other': {extensions:['htm','html','php','com','org','net'], format:'HTML', player:'native', specifiesDimensions:false}
			}},
		'HyperCities': {
			name:'HyperCities',
			extensions:[],
			isProprietary:true,
			contentType:'map',
			browserSupport: {
				'Mozilla': {extensions:[], format:'HyperCities Collection', player:'proprietary', specifiesDimensions:false},
				'Explorer': {extensions:[], format:'HyperCities Collection', player:'proprietary', specifiesDimensions:false},
				'Safari': {extensions:[], format:'HyperCities Collection', player:'proprietary', specifiesDimensions:false},
				'Chrome': {extensions:[], format:'HyperCities Collection', player:'proprietary', specifiesDimensions:false},
				'Other': {extensions:[], format:'HyperCities Collection', player:'proprietary', specifiesDimensions:false}
			}},
		'JPEG': {
			name:'JPEG', 
			extensions:['jpg','jpeg'],
			isProprietary:false,
			contentType:'image',
			browserSupport: {
				'Mozilla': {extensions:['jpg','jpeg'], format:'JPEG', player:'native', specifiesDimensions:true},
				'Explorer': {extensions:['jpg','jpeg'], format:'JPEG', player:'native', specifiesDimensions:true},
				'MobileSafari': {extensions:['jpg','jpeg'], format:'JPEG', player:'native', specifiesDimensions:true},
				'Safari': {extensions:['jpg','jpeg'], format:'JPEG', player:'native', specifiesDimensions:true},
				'Chrome': {extensions:['jpg','jpeg'], format:'JPEG', player:'native', specifiesDimensions:true},
				'Other': {extensions:['jpg','jpeg'], format:'JPEG', player:'native', specifiesDimensions:true}
			}},
		'KML': {
			name:'KML', 
			extensions:['kml','kmz'],
			isProprietary:false,
			contentType:'map',
			browserSupport: {
				'Mozilla': {extensions:['kml','kmz'], format:'KML', player:'proprietary', specifiesDimensions:false},
				'Explorer': {extensions:['kml','kmz'], format:'KML', player:'proprietary', specifiesDimensions:false},
				'MobileSafari': {extensions:['kml','kmz'], format:'KML', player:'proprietary', specifiesDimensions:false},
				'Safari': {extensions:['kml','kmz'], format:'KML', player:'proprietary', specifiesDimensions:false},
				'Chrome': {extensions:['kml','kmz'], format:'KML', player:'proprietary', specifiesDimensions:false},
				'Other': {extensions:['kml','kmz'], format:'KML', player:'proprietary', specifiesDimensions:false}
			}},
		'M4V': {
			name:'M4V',
			extensions:['m4v'],
			isProprietary:false,
			contentType:'video',
			browserSupport: {
				'Mozilla': {extensions:['m4v'], format:'M4V', player:'QuickTime', specifiesDimensions:true},
				'Explorer': {extensions:['m4v'], format:'M4V', player:'native', specifiesDimensions:true},
				'MobileSafari': {extensions:['m4v'], format:'M4V', player:'native', specifiesDimensions:true},
				'Safari': {extensions:['m4v'], format:'M4V', player:'native', specifiesDimensions:true},
				'Chrome': {extensions:['m4v'], format:'M4V', player:'QuickTime', specifiesDimensions:true},
				'Other': {extensions:['m4v'], format:'M4V', player:'QuickTime', specifiesDimensions:true}
			}},
		'MPEG-1': {
			name:'MPEG-1',
			extensions:['mpg'],
			isProprietary:false,
			contentType:'video',
			browserSupport: {
				'Mozilla': {extensions:['mpg'], format:'MPEG-1', player:'QuickTime', specifiesDimensions:false},
				'Explorer': {extensions:['mpg'], format:'MPEG-1', player:'native', specifiesDimensions:false},
				'Safari': {extensions:['mpg'], format:'MPEG-1', player:'native', specifiesDimensions:false},
				'Chrome': {extensions:['mpg'], format:'MPEG-1', player:'QuickTime', specifiesDimensions:false},
				'Other': {extensions:['mpg'], format:'MPEG-1', player:'QuickTime', specifiesDimensions:false}
			}},
		'MPEG-2': {
			name:'MPEG-2',
			extensions:['mpg'],
			isProprietary:false,
			contentType:'video',
			browserSupport: {
				'Mozilla': {extensions:['mpg'], format:'MPEG-2', player:'QuickTime', specifiesDimensions:false},
				'Explorer': {extensions:['mpg'], format:'MPEG-2', player:'native', specifiesDimensions:false},
				'Safari': {extensions:['mpg'], format:'MPEG-2', player:'native', specifiesDimensions:false},
				'Chrome': {extensions:['mpg'], format:'MPEG-2', player:'QuickTime', specifiesDimensions:false},
				'Other': {extensions:['mpg'], format:'MPEG-2', player:'QuickTime', specifiesDimensions:false}
			}},
		'MPEG-3': {
			name:'MPEG-3',
			extensions:['mp3'],
			isProprietary:false,
			contentType:'audio',
			browserSupport: {
				'Mozilla': {extensions:['mp3'], format:'MPEG-3', player:'jPlayer', specifiesDimensions:false},
				'Explorer': {extensions:['mp3'], format:'MPEG-3', player:'jPlayer', specifiesDimensions:false},
				'MobileSafari': {extensions:['mp3'], format:'MPEG-3', player:'jPlayer', specifiesDimensions:false},
				'Safari': {extensions:['mp3'], format:'MPEG-3', player:'jPlayer', specifiesDimensions:false},
				'Chrome': {extensions:['mp3'], format:'MPEG-3', player:'jPlayer', specifiesDimensions:false},
				'Other': {extensions:['mp3'], format:'MPEG-3', player:'jPlayer', specifiesDimensions:false}
			}},
		'MPEG-4': {
			name:'MPEG-4',
			extensions:['mp4'],
			isProprietary:false,
			contentType:'video',
			browserSupport: {
				'Mozilla': {extensions:['mp4'], format:'MPEG-4', player:'Flash', specifiesDimensions:true},
				'Explorer': {extensions:['mp4'], format:'MPEG-4', player:'native', specifiesDimensions:true},
				'MobileSafari': {extensions:['mp4'], format:'MPEG-4', player:'native', specifiesDimensions:true},
				'Safari': {extensions:['mp4'], format:'MPEG-4', player:'native', specifiesDimensions:true},
				'Chrome': {extensions:['mp4'], format:'MPEG-4', player:'Flash', specifiesDimensions:true},
				'Other': {extensions:['mp4'], format:'MPEG-4', player:'Flash', specifiesDimensions:true}
			}},
		'Ogg-Audio': {
			name:'OGA', 
			extensions:['oga'],
			isProprietary:false,
			contentType:'audio',
			browserSupport: {
				'Mozilla': {extensions:['oga'], format:'Ogg', player:'native', specifiesDimensions:false},
				'Safari': {extensions:['oga'], format:'Ogg', player:'QuickTime', specifiesDimensions:false},
				'Chrome': {extensions:['oga'], format:'Ogg', player:'native', specifiesDimensions:false},
				'Other': {extensions:['oga'], format:'Ogg', player:'native', specifiesDimensions:false}
			}},
		'Ogg-Video': {
			name:'OGG', 
			extensions:['ogg','ogv'],
			isProprietary:false,
			contentType:'video',
			browserSupport: {
				'Mozilla': {extensions:['ogg','ogv'], format:'Ogg', player:'native', specifiesDimensions:true},
				'Safari': {extensions:['ogg','ogv'], format:'Ogg', player:'QuickTime', specifiesDimensions:true},
				'Chrome': {extensions:['ogg','ogv'], format:'Ogg', player:'native', specifiesDimensions:true},
				'Other': {extensions:['ogg','ogv'], format:'Ogg', player:'native', specifiesDimensions:true}
			}},
		'PDF': {
			name:'PDF', 
			extensions:['pdf'],
			isProprietary:true,
			contentType:'document',
			browserSupport: {
				'Mozilla': {extensions:['pdf'], format:'PDF', player:'native', specifiesDimensions:false},
				'Explorer': {extensions:['pdf'], format:'PDF', player:'native', specifiesDimensions:false},
				'MobileSafari': {extensions:['pdf'], format:'PDF', player:'native', specifiesDimensions:false},
				'Safari': {extensions:['pdf'], format:'PDF', player:'native', specifiesDimensions:false},
				'Chrome': {extensions:['pdf'], format:'PDF', player:'native', specifiesDimensions:false},
				'Other': {extensions:['pdf'], format:'PDF', player:'native', specifiesDimensions:false}
			}},
		'PNG': {
			name:'PNG', 
			extensions:['png'],
			isProprietary:false,
			contentType:'image',
			browserSupport: {
				'Mozilla': {extensions:['png'], format:'PNG', player:'native', specifiesDimensions:true},
				'Explorer': {extensions:['png'], format:'PNG', player:'native', specifiesDimensions:true},
				'MobileSafari': {extensions:['png'], format:'PNG', player:'native', specifiesDimensions:true},
				'Safari': {extensions:['png'], format:'PNG', player:'native', specifiesDimensions:true},
				'Chrome': {extensions:['png'], format:'PNG', player:'native', specifiesDimensions:true},
				'Other': {extensions:['png'], format:'PNG', player:'native', specifiesDimensions:true}
			}},
		'Prezi': {
			name:'Prezi',
			extensions:[],
			isProprietary:true,
			contentType:'document',
			browserSupport: {
				'Mozilla': {extensions:[], format:'Prezi', player:'proprietary', specifiesDimensions:false},
				'Explorer': {extensions:[], format:'Prezi', player:'proprietary', specifiesDimensions:false},
				'Safari': {extensions:[], format:'Prezi', player:'proprietary', specifiesDimensions:false},
				'Chrome': {extensions:[], format:'Prezi', player:'proprietary', specifiesDimensions:false},
				'Other': {extensions:[], format:'Prezi', player:'proprietary', specifiesDimensions:false}
			}},
		'QuickTime': {
			name:'QuickTime', 
			extensions:['mov'],
			isProprietary:false,
			contentType:'video',
			browserSupport: {
				'Mozilla': {extensions:['mov'], format:'QuickTime', player:'QuickTime', specifiesDimensions:true},
				'Explorer': {extensions:['mov'], format:'QuickTime', player:'QuickTime', specifiesDimensions:true},
				'MobileSafari': {extensions:['mov'], format:'QuickTime', player:'native', specifiesDimensions:true},
				'Safari': {extensions:['mov'], format:'QuickTime', player:'native', specifiesDimensions:true},
				'Chrome': {extensions:['mov'], format:'QuickTime', player:'QuickTime', specifiesDimensions:true},
				'Other': {extensions:['mov'], format:'QuickTime', player:'QuickTime', specifiesDimensions:true}
			}},
		'QuickTimeStreaming': {
			name:'QuickTimeStreaming', 
			extensions:['mp4'],
			isProprietary:false,
			contentType:'video',
			browserSupport: {
				'Mozilla': {extensions:['mp4'], format:'QuickTime', player:'QuickTime', specifiesDimensions:true},
				'Explorer': {extensions:['mp4'], format:'QuickTime', player:'QuickTime', specifiesDimensions:true},
				'Chrome': {extensions:['mp4'], format:'QuickTime', player:'QuickTime', specifiesDimensions:true},
				'Other': {extensions:['mp4'], format:'QuickTime', player:'QuickTime', specifiesDimensions:true}
			}},
		'TIFF': {
			name:'TIFF', 
			extensions:['tif','tiff'],
			isProprietary:false,
			contentType:'image',
			browserSupport: {
				'Mozilla': {extensions:['tif','tiff'], format:'TIFF', player:'QuickTime', specifiesDimensions:true},
				'Explorer': {extensions:['tif','tiff'], format:'TIFF', player:'QuickTime', specifiesDimensions:true},
				'Safari': {extensions:['tif','tiff'], format:'TIFF', player:'QuickTime', specifiesDimensions:true},
				'Chrome': {extensions:['tif','tiff'], format:'TIFF', player:'QuickTime', specifiesDimensions:true},
				'Other': {extensions:['tif','tiff'], format:'TIFF', player:'QuickTime', specifiesDimensions:true}
			}},
		'PlainText': {
			name:'PlainText', 
			extensions:otherSrcExt,
			isProprietary:false,
			contentType:'document',
			browserSupport: {
				'Mozilla': {extensions:otherSrcExt, format:'PlainText', player:'native', specifiesDimensions:false},
				'Explorer': {extensions:otherSrcExt, format:'PlainText', player:'native', specifiesDimensions:false},
				'MobileSafari': {extensions:otherSrcExt, format:'PlainText', player:'native', specifiesDimensions:false},
				'Safari': {extensions:otherSrcExt, format:'PlainText', player:'native', specifiesDimensions:false},
				'Chrome': {extensions:otherSrcExt, format:'PlainText', player:'native', specifiesDimensions:false},
				'Other': {extensions:otherSrcExt, format:'PlainText', player:'native', specifiesDimensions:false}
			}},
		'SoundCloud': {
			name:'SoundCloud', 
			extensions:[],
			isProprietary:true,
			contentType:'audio',
			browserSupport: {
				'Mozilla': {extensions:[], format:'', player:'proprietary', specifiesDimensions:false},
				'Explorer': {extensions:[], format:'', player:'proprietary', specifiesDimensions:false},
				'MobileSafari': {extensions:[], format:'', player:'proprietary', specifiesDimensions:false},
				'Safari': {extensions:[], format:'', player:'proprietary', specifiesDimensions:false},
				'Chrome': {extensions:[], format:'', player:'proprietary', specifiesDimensions:false},
				'Other': {extensions:[], format:'', player:'proprietary', specifiesDimensions:false}
			}},
		'SourceCode': {
			name:'SourceCode', 
		    extensions:prismSrcExt,
		    isProprietary:false,
		    contentType:'document',
		    browserSupport: {
				'Mozilla': {extensions:prismSrcExt, format:'PlainText', player:'native', specifiesDimensions:false},
				'Explorer': {extensions:prismSrcExt, format:'PlainText', player:'native', specifiesDimensions:false},
				'MobileSafari': {extensions:prismSrcExt, format:'PlainText', player:'native', specifiesDimensions:false},
				'Safari': {extensions:prismSrcExt, format:'PlainText', player:'native', specifiesDimensions:false},
				'Chrome': {extensions:prismSrcExt, format:'PlainText', player:'native', specifiesDimensions:false},
				'Other': {extensions:prismSrcExt, format:'PlainText', player:'native', specifiesDimensions:false}
			}},
		'Unsupported': {
			name:'Unsupported', 
			extensions:[],
			isProprietary:false,
			contentType:'other',
			browserSupport: {
				'Mozilla': {extensions:[], format:'Unsupported', player:'native', specifiesDimensions:false},
				'Explorer': {extensions:[], format:'Unsupported', player:'native', specifiesDimensions:false},
				'MobileSafari': {extensions:[], format:'Unsupported', player:'native', specifiesDimensions:false},
				'Safari': {extensions:[], format:'Unsupported', player:'native', specifiesDimensions:false},
				'Chrome': {extensions:[], format:'Unsupported', player:'native', specifiesDimensions:false},
				'Other': {extensions:[], format:'Unsupported', player:'native', specifiesDimensions:false}
			}},
		'Vimeo': {
			name:'Vimeo', 
			extensions:['flv'],
			isProprietary:true,
			contentType:'video',
			browserSupport: {
				'Mozilla': {extensions:['flv'], format:'Flash Video', player:'proprietary', specifiesDimensions:false},
				'Explorer': {extensions:['flv'], format:'Flash Video', player:'proprietary', specifiesDimensions:false},
				'MobileSafari': {extensions:['mp4'], format:'MPEG-4', player:'proprietary', specifiesDimensions:false},
				'Safari': {extensions:['mp4'], format:'MPEG-4', player:'proprietary', specifiesDimensions:false},
				'Chrome': {extensions:['flv'], format:'Flash Video', player:'proprietary', specifiesDimensions:false},
				'Other': {extensions:['flv'], format:'Flash Video', player:'proprietary', specifiesDimensions:false}
			}},
		'WAV': {
			name:'WAV', 
			extensions:['wav'],
			isProprietary:false,
			contentType:'audio',
			browserSupport: {
				'Mozilla': {extensions:['wav'], format:'WAV', player:'QuickTime', specifiesDimensions:false},
				'Explorer': {extensions:['wav'], format:'WAV', player:'jPlayer', specifiesDimensions:false},
				'MobileSafari': {extensions:['wav'], format:'WAV', player:'native', specifiesDimensions:false},
				'Safari': {extensions:['wav'], format:'WAV', player:'native', specifiesDimensions:false},
				'Chrome': {extensions:['wav'], format:'WAV', player:'QuickTime', specifiesDimensions:false},
				'Other': {extensions:['wav'], format:'WAV', player:'jPlayer', specifiesDimensions:false}
			}},
		'WebM': {
			name:'WebM',
			extensions:['webm'],
			isProprietary:false,
			contentType:'video',
			browserSupport: {
				'Mozilla': {extensions:['webm'], format:'WebM', player:'native', specifiesDimensions:true},
				'Safari': {extensions:['webm'], format:'WebM', player:'QuickTime', specifiesDimensions:true},
				'Chrome': {extensions:['webm'], format:'WebM', player:'native', specifiesDimensions:true},
				'Other': {extensions:['webm'], format:'WebM', player:'native', specifiesDimensions:true}
			}},
		'YouTube': {
			name:'YouTube', 
			extensions:['flv'],
			isProprietary:true,
			contentType:'video',
			browserSupport: {
				'Mozilla': {extensions:['flv'], format:'Flash Video', player:'proprietary', specifiesDimensions:false},
				'Explorer': {extensions:['flv'], format:'Flash Video', player:'proprietary', specifiesDimensions:false},
				'MobileSafari': {extensions:['mp4'], format:'MPEG-4', player:'proprietary', specifiesDimensions:false},
				'Safari': {extensions:['mp4'], format:'MPEG-4', player:'proprietary', specifiesDimensions:false},
				'Chrome': {extensions:['flv'], format:'Flash Video', player:'proprietary', specifiesDimensions:false},
				'Other': {extensions:['flv'], format:'Flash Video', player:'proprietary', specifiesDimensions:false}
			}}
	}
	
	// TODO: loadPageStatus could eventually get very large if they store status data for
	// each page request permanently. Could be an issue for pages with editors that the user might
	// stay on for a long time--may need to limit numbers of stored items.
	
	this.loadPageStatus = {};
	this.loadCurrentPageStatus = {isLoading:false, queuedSuccessCallbacks:[], queuedErrorCallbacks:[]};
	this.loadBookStatus = {isLoading:false, queuedSuccessCallbacks:[], queuedErrorCallbacks:[]};
	this.loadPagesByTypeStatus = {isLoading:false, queuedSuccessCallbacks:[], queuedErrorCallbacks:[]};
	this.untitledNodeString = '(No title)';

}

ScalarAPI.prototype.model = null;
ScalarAPI.prototype.scalarBrowser = null;
ScalarAPI.prototype.mediaSources = null;
ScalarAPI.prototype.loadPageStatus = null;
ScalarAPI.prototype.loadCurrentPageStatus = null;
ScalarAPI.prototype.loadBookStatus = null;
ScalarAPI.prototype.loadPagesByTypeStatus = null;
ScalarAPI.prototype.browserDetect = null;
ScalarAPI.prototype.nodeExistsCallback = null;
ScalarAPI.prototype.untitledNodeString = null;

/**
 * Returns the specified uri without any extraneous trailing content (getVars, etc.)
 *
 * @return	The modified uri.
 */
ScalarAPI.prototype.stripAllExtensions = function(uri) {

	var orig;
	var array;
	
	//if (uri.charAt(uri.length - 1) == '#') uri = uri.substr(0, uri.length - 1);
	array = uri.split('#');
	uri = array[0];
	
	array = uri.split('?');
	uri = array[0];
	
	orig = array = uri.split('/');
	var segment = array[array.length - 1];
	
	array = segment.split('.');
	if (array.length == 1) return uri;
	
	if (array[array.length - 1] == parseFloat(array[array.length - 1])) return uri;
	
	array.pop();
	orig.pop();
	if (orig.length == 0) return array.join('.');
	return orig.join('/')+'/'+array.join('.');
}	

/**
 * Returns the extension of the specified uri.
 *
 * @return	The uri's extension, if any.
 */
ScalarAPI.prototype.getFileExtension = function(uri) {
	var basename = this.basename(uri);
	if (basename.indexOf('.') == -1) return '';
	var ext = basename.substr(basename.indexOf('.') + 1);
	if (ext == parseFloat(ext)) return '';
	if (ext.charAt(ext.length - 1) == '#') ext = ext.substr(0, ext.length - 1);
	return ext;
}	
	
/**
 * Removes HTML markup from the specified string.
 *
 * @return	The modified string.
 */
ScalarAPI.prototype.removeMarkup = function( string ) {
	return string.replace(/<\/?[^>]+>/gi, '');
}

/**
 * Returns the type of media pointed to by the specified uri.
 *
 * TODO: Move this up a level (and other utils?), return icon name
 *
 * @return	The media type.
 */
ScalarAPI.prototype.parseMediaSource = function(uri) {

	var source = this.mediaSources['Unsupported'];
	
	if (uri != null) {
		var tempPath = uri.toLowerCase();
		var url_segments = tempPath.split('/');                                                 // Only operate on the last URL segment (the basename)
		var file_segments = url_segments[url_segments.length-1].split('.');                     // Split filename to look for file extension
		var ext = (file_segments.length>1) ? file_segments[file_segments.length-1] : ''; 		// File extension is the last file segment
		ext = ext.split('?')[0];
		
		if (((uri.indexOf('criticalcommons.org') != -1) || (uri.indexOf('criticalcommons.usc.edu') != -1)) && ((ext == 'mp4') || (ext == 'flv') || (ext == 'webm')))  {
			if (uri.indexOf('prod-flv-criticalcommons') == -1) {
				source = this.mediaSources['CriticalCommons-Video']; 
			} else {
				source = this.mediaSources['CriticalCommons-LegacyVideo']; 
			}
			// only CC video needs special handling, because we transform the URL to get the WebM version;
			// audio and images can be handled normally
		
		// override if the path makes reference to YouTube
		} else if ((uri.indexOf('//youtube.com') != -1) || (uri.indexOf('//www.youtube.com') != -1)) {
			source = this.mediaSources['YouTube'];
			
		// override if the path makes reference to YouTube via Google API
		} else if ((uri.indexOf('//youtube.googleapis.com') != -1)) {
			source = this.mediaSources['YouTube'];			
			
		// override if the path makes reference to Vimeo
		} else if ((uri.indexOf('//vimeo.com') != -1) || (uri.indexOf('//www.vimeo.com') != -1) || (uri.indexOf('//player.vimeo.com') != -1)) {
			source = this.mediaSources['Vimeo'];
	
		// override if the path makes reference to the Hemispheric Institute archive
		} else if (uri.indexOf('nyu.edu/video') != -1) {
			source = this.mediaSources['HIDVL'];
	
		// override if the path makes reference to HyperCities
		} else if (uri.indexOf('hypercities.ats.ucla.edu') != -1) {
			source = this.mediaSources['HyperCities'];
			
		} else if (uri.indexOf('prezi.com') != -1) {
			source = this.mediaSources['Prezi'];
			
		} else if (uri.indexOf('http://soundcloud.com') != -1) {
			source = this.mediaSources['SoundCloud'];
			
		} else if (uri.indexOf('soundcloud.com') != -1) {
			source = this.mediaSources['SoundCloud'];
			
		} else if (uri.indexOf('output=kml') != -1) {
			source = this.mediaSources['KML'];
			
		// override if the path makes reference to Interent Archive		
		} else if (uri.substr(uri.length - 4) == 'h264') {
			source = this.mediaSources['MPEG-4'];
		
		} else if (uri.substr(uri.length - 5) == 'MPEG4') { 
			source = this.mediaSources['MPEG-4'];

		} else if (uri.substr(uri.length - 11) == '512Kb+MPEG4') { 
			source = this.mediaSources['MPEG-4'];
			
		} else if (uri.substr(uri.length - 5) == 'h.264') { 
			source = this.mediaSources['MPEG-4'];
	
		} else if (uri.substr(uri.length - 15) == 'QuickTime+350Kb') {
			source = this.mediaSources['QuickTime'];
	
		} else if (uri.substr(uri.length - 14) == 'QuickTime+60Kb') {
			source = this.mediaSources['QuickTime'];
	
		} else if (uri.substr(uri.length - 9) == 'QuickTime') {
			source = this.mediaSources['QuickTime'];
	
		} else if (uri.substr(uri.length - 11) == '160Kbps+MP3') {
			source = this.mediaSources['MPEG-3'];
	
		} else if (uri.substr(uri.length - 11) == '128Kbps+MP3') {
			source = this.mediaSources['MPEG-3'];
	
		} else if (uri.substr(uri.length - 10) == '64Kbps+MP3') {
			source = this.mediaSources['MPEG-3'];
	
		} else if (uri.substr(uri.length - 10) == '56Kbps+MP3') {
			source = this.mediaSources['MPEG-3'];

		} else if (uri.substr(uri.length - 7) == 'VBR+MP3') { 
			source = this.mediaSources['MPEG-3'];
	
		} else if (uri.substr(uri.length - 4) == 'WAVE') {
			source = this.mediaSources['WAV'];
	
		} else if (uri.substr(uri.length - 4) == 'JPEG' || uri.substr(uri.length - 10) == 'Item+Image') {
			source = this.mediaSources['JPEG'];
			
		} else if (uri.substr(uri.length - 3) == 'PDF') {
			source = this.mediaSources['PDF'];			
	
		// no special cases; handle normally
		} else {
			var currentSource;
			for (var sourceName in this.mediaSources) {
				currentSource = this.mediaSources[sourceName];
				//if (!currentSource.isProprietary) {
					if (currentSource.extensions.indexOf(ext) != -1) {
						if ((currentSource == 'MPEG-4') && (uri.indexOf('rtsp://') != -1)) {
							source = this.mediaSources['QuickTimeStreaming'];
						} else {
							source = currentSource;
						}
						break;
					}
				//}
			}
		}
	}

	return source;
}

/**
 * Returns the anchor portion of the specified uri.
 *
 * @return	The anchor portion of the uri.
 */
ScalarAPI.prototype.getAnchorSegment = function(uri) {
	var temp = uri.split('#');
	if (temp.length > 1) {
		return temp[temp.length - 1];
	}
	return '';
}

ScalarAPI.prototype.getQuerySegment = function(uri) {
	var temp = uri.split('?');
	if (temp.length > 1) {
		temp = temp[ temp.length - 1 ].split( '#' );
		return temp[ 0 ];
	}
	return '';
}

/**
 * Returns an object the properties of which match 
 * the variables specified in the anchor portion of the given uri.
 *
 * @return	An object populated with the anchor variable properties.
 */
ScalarAPI.prototype.getAnchorVars = function(uri) {

	var obj = null;
	var varChunks;
	var propChunks;
	
	var anchorSeg = scalarapi.getAnchorSegment(uri);
	
	if (anchorSeg != '') {
	
		obj = {};
		varChunks = anchorSeg.split('&');
		
		var i;
		var n = varChunks.length;
		for (i=0; i<n; i++) {
			propChunks = varChunks[i].split('=');
			obj[propChunks[0]] = propChunks[1];
		}
	}

	return obj;
}

ScalarAPI.prototype.getQueryVars = function(uri) {

	var obj = {};
	var varChunks;
	var propChunks;
	
	var querySeg = scalarapi.getQuerySegment(uri);
	
	if (querySeg != '') {
	
		obj = {};
		varChunks = querySeg.split('&');
		
		var i;
		var n = varChunks.length;
		for (i=0; i<n; i++) {
			propChunks = varChunks[i].split('=');
			obj[propChunks[0]] = propChunks[1];
		}
	}

	return obj;
}

/**
 * When passed a uri to a version of a node,
 * returns the uri to the node itself (without the version number).
 *
 * @return	The de-versioned uri.
 */
ScalarAPI.prototype.stripVersion = function(versionURI) {
	var temp = versionURI.split('.');
	if (temp.length > 1) {
		temp.splice(temp.length - 1, 1);
		var uri = temp.join('.');
		return uri;
	}
	return versionURI;
}
 
ScalarAPI.prototype.basename = function(path, suffix) {
    // Returns the filename component of the path  
    // 
    // version: 1103.1210
    // discuss at: http://phpjs.org/functions/basename
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Ash Searle (http://hexmen.com/blog/)
    // +   improved by: Lincoln Ramsay
    // +   improved by: djmix
    // *     example 1: basename('/www/site/home.htm', '.htm');
    // *     returns 1: 'home'
    // *     example 2: basename('ecra.php?p=1');
    // *     returns 2: 'ecra.php?p=1'
    var b = path.replace(/^.*[\/\\]/g, '');
 
    if (typeof(suffix) == 'string' && b.substr(b.length - suffix.length) == suffix) {
        b = b.substr(0, b.length - suffix.length);
    }
 
    return b;
}

ScalarAPI.prototype.basepath = function(path) {
	path = this.stripAllExtensions(path);
	var arr = path.split('://');
	var str;
	if (arr.length > 1) {
		str = arr[1];
	} else {
		str = arr[0];
	}
	arr = str.split('/');
	arr.splice(0, 3);
	return arr.join('/');
}
	 		
/**
 * Returns the string with all non-alphabetizing initial characters stripped.
 * @return	The modified string.
 */
ScalarAPI.prototype.stripInitialNonAlphabetics = function(string) {
	var reA = new RegExp("^\"|^\'");
	string = string.replace(/[^a-zA-Z 0-9]+/g, '');
	string = string.replace(/^the /i, '');
	string = string.replace(/^a /i, '');
	string = string.replace(reA, '');
	string = string.charAt(0).toUpperCase() + string.substr(1);
	return string;
}

/**
 * Converts decimal representations of time (in seconds) to [H]:MM:SS
 *
 * @param {Number} seconds				Decimal seconds to be converted.
 * @param {Boolean} showMilliseconds	If true, include milliseconds in the returned string.
 * @return								A string representing the converted amount.
 */
ScalarAPI.prototype.decimalSecondsToHMMSS = function(seconds, showMilliseconds) {

	if (showMilliseconds == null) {
		showMilliseconds = false;
	}

	var h;
	var m;
	var s;
	var ms;
	var mString;
	var sString;
	var msString;

	h = Math.floor(seconds / 3600);
	seconds -= (h * 3600);
	m = Math.floor(seconds / 60);
	seconds -= (m * 60);
	s = Math.floor(seconds);
	seconds -= s;
	ms = Math.round(seconds * 1000);

	mString = m + '';
	if (mString.length == 1) mString = '0' + mString;
	sString = s + '';
	if (sString.length == 1) sString = '0' + sString;
	msString = ms + '';
	while (msString.length < 3) { msString = msString + '0'; }

	if (showMilliseconds) {
		return h + ':' + mString + ':' + sString + '.' + msString;
	} else {
		return h + ':' + mString + ':' + sString;
	}
	
	//return h + 'h ' + mString + 'm ' + sString + 's';
}

/**
 * saveManyRelations, queueManyRelations, runManyRelations
 * A basic Ajax queue for saving relationships, as the save API presently saves one relationship at a time
 */
ScalarAPI.prototype.saveManyRelations = function(data, completeCallback) {

	version_urn = 'urn:blah:1';
	var self = this;

	// Queue container_of 
	$(data['container_of']).each(function(indexInArray) {
		self.queueManyRelations({
			action:data['action'],'native':data['native'],'id':data['id'],api_key:data['api_key'],
			'scalar:urn':data['scalar:urn'], 
			'scalar:child_urn':$(this).val(), 
			'scalar:child_rel':'contained', 
			'scalar:sort_number':(indexInArray+1)	
		});
	});
	// Queue reply_of 
	$(data['reply_of']).each(function(indexInArray) {
		self.queueManyRelations({
			action:data['action'],'native':data['native'],'id':data['id'],api_key:data['api_key'],
			'scalar:urn':data['scalar:urn'], 
			'scalar:child_urn':$(this).val(), 
			'scalar:child_rel':'replied', 
			'scalar:paragraph_num':$(data['reply_of_paragraph_num'][indexInArray]).val()
		});
	});	
	// Queue annotation_of 
	$(data['annotation_of']).each(function(indexInArray) {
		self.queueManyRelations({
			action:data['action'],'native':data['native'],'id':data['id'],api_key:data['api_key'],
			'scalar:urn':data['scalar:urn'], 
			'scalar:child_urn':$(this).val(), 
			'scalar:child_rel':'annotated', 
			'scalar:start_seconds':$(data['annotation_of_start_seconds'][indexInArray]).val(),
			'scalar:end_seconds':$(data['annotation_of_end_seconds'][indexInArray]).val(),
			'scalar:start_line_num':$(data['annotation_of_start_line_num'][indexInArray]).val(),
			'scalar:end_line_num':$(data['annotation_of_end_line_num'][indexInArray]).val(),
			'scalar:points':$(data['annotation_of_points'][indexInArray]).val(),
		});
	});	
	// Queue tag_of 
	$(data['tag_of']).each(function() {
		self.queueManyRelations({
			action:data['action'],'native':data['native'],'id':data['id'],api_key:data['api_key'],
			'scalar:urn':data['scalar:urn'], 
			'scalar:child_urn':$(this).val(), 
			'scalar:child_rel':'tagged'
		});
	});	
	// Queue references 
	$(data['references']).each(function() {
		self.queueManyRelations({
			action:data['action'],'native':data['native'],'id':data['id'],api_key:data['api_key'],
			'scalar:urn':data['scalar:urn'], 
			'scalar:child_urn':$(this).val(), 
			'scalar:child_rel':'referenced',
			'scalar:reference_text':'', /* todo */
		});
	});		
	
	// Queue has_container
	$(data['has_container']).each(function(indexInArray) {
		self.queueManyRelations({
			action:data['action'],'native':data['native'],'id':data['id'],api_key:data['api_key'],
			'scalar:urn':$(this).val(), 
			'scalar:child_urn':data['scalar:urn'],
			'scalar:child_rel':'contained', 
			'scalar:sort_number':$(data['has_container_sort_number'][indexInArray]).val()	
		});
	});
	// Queue has_reply 
	$(data['has_reply']).each(function(indexInArray) {
		self.queueManyRelations({
			action:data['action'],'native':data['native'],'id':data['id'],api_key:data['api_key'],
			'scalar:urn':$(this).val(), 
			'scalar:child_urn':data['scalar:urn'], 
			'scalar:child_rel':'replied', 
			'scalar:paragraph_num':$(data['has_reply_paragraph_num'][indexInArray]).val(),
			'scalar:datetime':$(data['has_reply_datetime'][indexInArray]).val()
		});
	});	
	// Queue has_annotation 
	$(data['has_annotation']).each(function(indexInArray) {
		self.queueManyRelations({
			action:data['action'],'native':data['native'],'id':data['id'],api_key:data['api_key'],
			'scalar:urn':$(this).val(), 
			'scalar:child_urn':data['scalar:urn'], 
			'scalar:child_rel':'annotated', 
			'scalar:start_seconds':$(data['has_annotation_start_seconds'][indexInArray]).val(),
			'scalar:end_seconds':$(data['has_annotation_end_seconds'][indexInArray]).val(),
			'scalar:start_line_num':$(data['has_annotation_start_line_num'][indexInArray]).val(),
			'scalar:end_line_num':$(data['has_annotation_end_line_num'][indexInArray]).val(),
			'scalar:points':$(data['has_annotation_points'][indexInArray]).val()
		});
	});	
	// Queue has_tag 
	$(data['has_tag']).each(function() {
		self.queueManyRelations({
			action:data['action'],'native':data['native'],'id':data['id'],api_key:data['api_key'],
			'scalar:urn':$(this).val(), 
			'scalar:child_urn':data['scalar:urn'], 
			'scalar:child_rel':'tagged'
		});
	});		
	// Queue has_reference 
	$(data['has_reference']).each(function() {
		self.queueManyRelations({
			action:data['action'],'native':data['native'],'id':data['id'],api_key:data['api_key'],
			'scalar:urn':$(this).val(), 
			'scalar:child_urn':data['scalar:urn'], 
			'scalar:child_rel':'referenced',
			'scalar:reference_text':'' /* todo */
		});
	});		

	self.runManyRelations(completeCallback);

}

/**
 * @private
 */
 ScalarAPI.prototype.queueManyRelations = function(data) {
 
	if ('undefined'==typeof(this.relate_queue)) this.relate_queue = [];  
	this.relate_queue.push(data);
	
}

/**
 * @private
 */
ScalarAPI.prototype.runManyRelations = function(completeCallback, errorCallback) {

	if ('undefined'==typeof(this.relate_queue) || !this.relate_queue.length) {
		completeCallback();
		return;
	}

	var self = this;

	this.saveRelate(this.relate_queue[0], function() {
		// Success running individual relate
		self.runManyRelations(completeCallback);
	}, function(jqXHR) {
		// Error running individual relate
		// TODO: At this point, fail gracefully
		self.runManyRelations(completeCallback);
	});
	this.relate_queue.shift();
	
}

/**
 * Establish page relationships through the API
 *
 * @param	data				The fields/values to save (requires a certain formatting based on the current version of the api)
 * @param	successCallback		Handler to be called when the data has successfully loaded.
 * @param	errorCallback		Handler to be called when the data failed to load.
 * @return						A string indicating the state of the request.
 */
ScalarAPI.prototype.saveRelate = function(data, successCallback, errorCallback) {

	var action_types = ['RELATE'];
	var required_fields = ['action', 'native', 'id', 'api_key', 'scalar:urn', 'scalar:child_urn', 'scalar:child_rel'];
	var self = this;

	try {

		// Validate action
		data['action'] = jQuery.trim(data['action'].toUpperCase());
		if (-1==action_types.indexOf(data['action'])) throw ('Invalid action');			
	
		// Validate user permissions
		data['native'] = (data['native']) ? true : false;
		data['id'] = jQuery.trim(data['id']);
		data['scalar:fullname'] = jQuery.trim(data['scalar:fullname']);
		data['api_key'] = jQuery.trim(data['api_key']);
		if (!data['id'].length) throw "Empty required user field 'id'";
		if (!data['native'] && !tosend['api_key'].length) throw "Empty required user field 'api_key'";
	
		$.ajax({
			url: this.model.urlPrefix+'api/'+data['action'].toLowerCase(),
			data: data,
			type: "POST",
			dataType: 'json',
			success: function(json) {
				successCallback(json);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				errorCallback(jqXHR);
			}
		});	
		
	} catch (e) {
		errorCallback ('ScalarAPI save page error: '+e);
	}
	return false;	

}

/**
 * modifyManyPages, queueManyPages, runManyPages
 * A basic Ajax queue for saving pages, as the save API presently saves one page at a time. Note that the name "modify" indicates that these routines will preserve existing content and relationships
 *
 * @param {Array} dataArr					Array of data, each entry represents one call to savePage.
 * @param {Function} completeCallback		Function to be called when the queue finishes running.
 */
ScalarAPI.prototype.modifyManyPages = function(dataArr, completeCallback) {
	
	$(dataArr).each(function() {
		scalarapi.queueManyPages(this);
	});

	this.runManyPages(completeCallback);

}

/**
 * Adds a single item to the save pages queue.
 * @private
 *
 * @param {Object} data			Data that will be used to populate a single call to savePage.
 */
ScalarAPI.prototype.queueManyPages = function(data) {

	if ('undefined'==typeof(this.savePageQueue)) this.savePageQueue = [];  
	this.savePageQueue.push(data);
	
}

/**
 * Runs a single iteration of the save pages queue.
 * @private
 *
 * @param {Function} completeCallback		Function to be called when the queue finishes running.
 */
ScalarAPI.prototype.runManyPages = function(completeCallback) {

	if ('undefined'==typeof(this.savePageQueue) || !this.savePageQueue.length) {
		completeCallback(true);
		return;
	}

	var self = this;
	var data = this.savePageQueue[0];

	this.modifyPageAndRelations(data.baseProperties, data.pageData, data.relationData, function(json) {
		self.runManyPages(completeCallback);
	}, function(e) {
		completeCallback(false);
	});
	this.savePageQueue.shift();
	
}

ScalarAPI.prototype.modifyPageAndRelations = function(baseProperties, pageData, relationData, completeCallback, errorCallback) {

	var me = this;
	
	this.loadPage(pageData.uriSegment, true, function(json) {
	
		var node = scalarapi.model.nodesByURL[scalarapi.model.urlPrefix+pageData.uriSegment];
		
		// gather data from existing node
		var completePageData = {
			'dcterms:title': node.current.title,
			'dcterms.description': node.current.description,
			'sioc:content': node.current.content,
			'rdf:type': node.baseType,
			'scalar:urn': node.current.urn,
			'scalar:url': node.current.sourceFile,
			'scalar:default_view': node.current.defaultView,
			'scalar:continue_to_content_id': node.current.continueTo,
			'scalar:sort_number': node.current.sortNumber
		};
		
		// add base properties
		for (var property in baseProperties) {
			completePageData[property] = baseProperties[property];
		};
		// overwrite with new data
		for (var property in pageData) {
			completePageData[property] = pageData[property];
		};
		
		scalarapi.savePage(completePageData, function(json) {
		
			var node;
			// this should only iterate once
			for (var property in json) { 
				node = scalarapi.model.nodesByURL[me.stripVersion(property)];
			}
			
		    for (var version_uri in json) break;
		    var version_urn = json[version_uri]['http://scalar.usc.edu/2012/01/scalar-ns#urn'][0].value;
			
			// gather relations from existing node
			var completeRelationData = {};
			
			$(node.outgoingRelations).each(function() {
				
				switch(this.type.id) {
				
					case 'path':
					completeRelationData['container_of'] = {
						action: 'RELATE',
						native: baseProperties.native,
						id: baseProperties.id,
						api_key: baseProperties.api_key,
						'scalar:urn': version_urn,
						'scalar:child_urn': this.target.current.urn,
						'scalar:child_rel': 'contained',
						'scalar:sort_number': this.index
					};
					break;
					
					case 'comment':
					completeRelationData['reply_of'] = {
						action: 'RELATE',
						native: baseProperties.native,
						id: baseProperties.id,
						api_key: baseProperties.api_key,
						'scalar:urn': version_urn,
						'scalar:child_urn': this.target.current.urn,
						'scalar:child_rel': 'replied',
						'scalar:paragraph_num': 0
					};
					// 'scalar:paragraph_num' is not currently supported in Scalar
					break;
					
					case 'annotation':
					switch (this.subType) {
					
						case 'temporal':
						completeRelationData['annotation_of'] = {
							action: 'RELATE',
							native: baseProperties.native,
							id: baseProperties.id,
							api_key: baseProperties.api_key,
							'scalar:urn': version_urn,
							'scalar:child_urn': this.target.current.urn,
							'scalar:child_rel': 'annotated',
							'scalar:start_seconds': this.properties.start,
							'scalar:end_seconds': this.properties.end,
							'scalar:start_line_num': '',
							'scalar:end_line_num': '',
							'scalar:points': ''
						};
						break;
						
						case 'textual':
						completeRelationData['annotation_of'] = {
							action: 'RELATE',
							native: baseProperties.native,
							id: baseProperties.id,
							api_key: baseProperties.api_key,
							'scalar:urn': version_urn,
							'scalar:child_urn': this.target.current.urn,
							'scalar:child_rel': 'annotated',
							'scalar:start_seconds': '',
							'scalar:end_seconds': '',
							'scalar:start_line_num': this.properties.start,
							'scalar:end_line_num': this.properties.end,
							'scalar:points': ''
						};
						break;
						
						case 'spatial':
						completeRelationData['annotation_of'] = {
							action: 'RELATE',
							native: baseProperties.native,
							id: baseProperties.id,
							api_key: baseProperties.api_key,
							'scalar:urn': version_urn,
							'scalar:child_urn': this.target.current.urn,
							'scalar:child_rel': 'annotated',
							'scalar:start_seconds': '',
							'scalar:end_seconds': '',
							'scalar:start_line_num': '',
							'scalar:end_line_num': '',
							'scalar:points': this.properties.x+','+this.properties.y+','+this.properties.w+','+this.properties.h
						};
						break;
						
					}
					break;
					
					case 'tag':
					completeRelationData['tag_of'] = {
						action: 'RELATE',
						native: baseProperties.native,
						id: baseProperties.id,
						api_key: baseProperties.api_key,
						'scalar:urn': version_urn,
						'scalar:child_urn': this.target.current.urn,
						'scalar:child_rel': 'tagged'
					};
					break;
					
					case 'referee':
					completeRelationData['references'] = {
						action: 'RELATE',
						native: baseProperties.native,
						id: baseProperties.id,
						api_key: baseProperties.api_key,
						'scalar:urn': version_urn,
						'scalar:child_urn': this.body.current.urn,
						'scalar:child_rel': 'referenced',
						'scalar:reference_text': null
					};
					// TODO: 'scalar:reference_text' is not currently being sent - this property will be wiped out when update occurs
					break;
				
				}
				
			});
			
			$(node.incomingRelations).each(function() {
				
				switch(this.type.id) {
				
					case 'path':
					completeRelationData['has_container'] = {
						action: 'RELATE',
						native: baseProperties.native,
						id: baseProperties.id,
						api_key: baseProperties.api_key,
						'scalar:urn': this.body.current.urn,
						'scalar:child_urn': version_urn,
						'scalar:child_rel': 'contained',
						'scalar:sort_number': this.index
					};
					break;
					
					case 'comment':
					completeRelationData['has_reply'] = {
						action: 'RELATE',
						native: baseProperties.native,
						id: baseProperties.id,
						api_key: baseProperties.api_key,
						'scalar:urn': this.body.current.urn,
						'scalar:child_urn': version_urn,
						'scalar:child_rel': 'replied',
						'scalar:sort_number': 0
					};
					break;
					
					case 'annotation':
					switch (this.subType) {
					
						case 'temporal':
						completeRelationData['has_annotation'] = {
							action: 'RELATE',
							native: baseProperties.native,
							id: baseProperties.id,
							api_key: baseProperties.api_key,
							'scalar:urn': this.body.current.urn,
							'scalar:child_urn': version_urn,
							'scalar:child_rel': 'annotated',
							'scalar:start_seconds': this.properties.start,
							'scalar:end_seconds': this.properties.end,
							'scalar:start_line_num': '',
							'scalar:end_line_num': '',
							'scalar:points': ''
						};
						break;
						
						case 'textual':
						completeRelationData['has_annotation'] = {
							action: 'RELATE',
							native: baseProperties.native,
							id: baseProperties.id,
							api_key: baseProperties.api_key,
							'scalar:urn': this.body.current.urn,
							'scalar:child_urn': version_urn,
							'scalar:child_rel': 'annotated',
							'scalar:start_seconds': '',
							'scalar:end_seconds': '',
							'scalar:start_line_num': this.properties.start,
							'scalar:end_line_num': this.properties.end,
							'scalar:points': ''
						};
						break;
						
						case 'spatial':
						completeRelationData['has_annotation'] = {
							action: 'RELATE',
							native: baseProperties.native,
							id: baseProperties.id,
							api_key: baseProperties.api_key,
							'scalar:urn': this.body.current.urn,
							'scalar:child_urn': version_urn,
							'scalar:child_rel': 'annotated',
							'scalar:start_seconds': '',
							'scalar:end_seconds': '',
							'scalar:start_line_num': '',
							'scalar:end_line_num': '',
							'scalar:points': this.properties.x+','+this.properties.y+','+this.properties.w+','+this.properties.h
						};
						break;
						
					}
					break;
					
					case 'tag':
					completeRelationData['has_tag'] = {
						action: 'RELATE',
						native: baseProperties.native,
						id: baseProperties.id,
						api_key: baseProperties.api_key,
						'scalar:urn': this.body.current.urn,
						'scalar:child_urn': version_urn,
						'scalar:child_rel': 'tagged',
					};
					break;
					
					case 'referee':
					completeRelationData['has_reference'] = {
						action: 'RELATE',
						native: baseProperties.native,
						id: baseProperties.id,
						api_key: baseProperties.api_key,
						'scalar:urn': this.body.current.urn,
						'scalar:child_urn': version_urn,
						'scalar:child_rel': 'referenced',
						'scalar:reference_text': null
					};
					// TODO: 'scalar:reference_text' is not currently being sent - this property will be wiped out when update occurs
					break;
					
				}
				
			});
			
			// overwrite with new data
			var property;
			var subproperty;
			for (property in relationData) {
				// add base properties
				if (completePageData[property] == undefined) {
					completePageData[property] = {};
				}
				completePageData[property].action = 'RELATE';
				for (subproperty in baseProperties) {
					completePageData[property][subproperty] = baseProperties[subproperty];
				};
				// add the new properties
				for (subproperty in relationData[property]) {
					if (subproperty != 'scalar:urn') {
						completeRelationData[property][subproperty] = relationData[property][subproperty];
					}
				}
			};
			for (property in completeRelationData) {
				scalarapi.queueManyRelations(completeRelationData[property]);
			}
			
			scalarapi.runManyRelations(function(e) {
				completeCallback(true);
			});
			
		}, function(e) {
			errorCallback( e );
		});
		
	}, null, 1, true)

}

/**
 * savePages, queueSavePages, runSavePages
 * A basic Ajax queue for saving pages, as the save API presently saves one page at a time. Note that the name "modify" indicates that these routines will preserve existing content and relationships
 *
 * @param {Array} dataArr					Array of data, each entry represents one call to savePage.
 * @param {Function} completeCallback		Function to be called when the queue finishes running.
 */
ScalarAPI.prototype.savePages = function(dataArr, completeCallback, errorCallback) {
	
	this.savePageQueue = [];
	this.savePageResults = [];
	
	for (var j in dataArr) {
		scalarapi.queueSavePages(dataArr[j]);
	};

	this.runSavePages(completeCallback, errorCallback);	
	
}

/**
 * Adds a single item to the save pages queue.
 * @private
 *
 * @param {Object} data			Data that will be used to populate a single call to savePage.
 */
ScalarAPI.prototype.queueSavePages = function(data) {

	if ('undefined'==typeof(this.savePageQueue)) this.savePageQueue = [];  
	this.savePageQueue.push(data);
	
}

/**
 * Runs a single iteration of the save pages queue.
 * @private
 *
 * @param {Function} completeCallback		Function to be called when the queue finishes running.
 */
ScalarAPI.prototype.runSavePages = function(completeCallback, errorCallback) {
	
	if ('undefined'==typeof(this.savePageQueue) || !this.savePageQueue.length) {
		
		completeCallback(this.savePageResults);
		
	} else {
		
		var self = this;
		var data = this.savePageQueue[0];
		this.savePageQueue.shift();
		
		this.savePage(data, function(json) {	
			self.savePageResults.push(json);
			self.runSavePages(completeCallback, errorCallback);
		}, function(e) {
			errorCallback(e);
		});
		
	}
	
}

/**
 * Saves a page through the API
 *
 * @param	data				The fields/values to save (requires a certain formatting based on the current version of the api)
 * @param	successCallback		Handler to be called when the data has successfully loaded.
 * @param	errorCallback		Handler to be called when the data failed to load.
 * @return						A string indicating the state of the request.
 */
ScalarAPI.prototype.savePage = function(data, successCallback, errorCallback) {
	
	var action_types = ['ADD', 'UPDATE', 'DELETE', 'UNDELETE'];  // As the DELETE command doesn't actually delete but sets is_live=0, 'saving' makes semantic sense
	var required_fields = ['action', 'native', 'id', 'api_key'];
	var add_update_required_fields = ['rdf:type', 'sioc:content', 'dcterms:title'];
	var tosend = {};
	var tosend_formatted = [];
	
	try {

		// Validate action
		tosend['action'] = jQuery.trim(data['action'].toUpperCase());
		if (-1==action_types.indexOf(tosend['action'])) throw ('Invalid action');

		// Validate required fields
		for (var j in required_fields) {
			if (!data.hasOwnProperty(required_fields[j])) throw "Missing required field '"+required_fields[j]+"'";
		}	
		if ('ADD'==tosend['action'] || 'UPDATE'==tosend['action']) {
			for (var j in add_update_required_fields) {
				if (!data.hasOwnProperty(add_update_required_fields[j])) throw "Missing "+tosend['action']+" required field '"+add_update_required_fields[j]+"'";
			}			
		} 	
		if ('UPDATE'==tosend['action']) {  // TODO: DELETE, etc?
			if (!data.hasOwnProperty('scalar:urn')||!data['scalar:urn'].length) throw "Missing required data field 'scalar:urn'";
		}							

		// Validate user permissions
		tosend['native'] = (parseInt(data['native'])) ? true : false;
		tosend['id'] = jQuery.trim(data['id']);
		tosend['api_key'] = jQuery.trim(data['api_key']);
		if (tosend['native'] && !tosend['id'].length) throw "Empty required user field 'id'";
		if (!tosend['native'] && !tosend['api_key'].length) throw "Empty required user field 'api_key'";			
		if ('http://'==data['scalar:url']) data['scalar:url'] = '';  // default value
		
		// Add additional metadata being passed through
		for (var j in data) {
			if (tosend.hasOwnProperty(j)) continue;
			if (-1==j.indexOf(':')) continue;  // Simple test for a pnode
			tosend[j] = data[j];
		}
		
		// Reformat the save object to a name/value array to support more than one value for a field
		for (var j in tosend) {
			if (is_array(tosend[j])) {
				for (var k in tosend[j]) {
					var value = tosend[j][k];
					if ('undefined'!=typeof(tosend[j][k].value)) value = tosend[j][k].value;
					tosend_formatted.push({name: j+'[]', value: jQuery.trim(value)});
				}
			} else {			
				tosend_formatted.push({name: j, value: jQuery.trim(tosend[j])});
			}		
		}
		// Save
		// TODO: use JSONP if native=false
		$.ajax({
		  url: this.model.urlPrefix+'api/'+data['action'].toLowerCase(),
		  data: tosend_formatted,
		  type: "POST",
		  dataType: 'json',
	   	  success: function(json) {
	   	  	successCallback(json);
	      },
	      error: function(obj) {
	    	var error = jQuery.parseJSON(obj.responseText);
	    	errorCallback(error.error.message[0].value);
	      }
		});		
	} catch (e) {
		errorCallback(e);
	}
	return false;

}


/**
 * Checks to see if the specified page exists. Calls the callback with the results.
 *
 * @param	uriSegment			URI segment identifying the page to be loaded.
 * @param	callback			Handler to be called when the results are in.
 */ 
ScalarAPI.prototype.checkNodeExists = function(uriSegment, callback) {

	this.nodeExistsCallback = callback;

	if (this.loadPage(uriSegment, false, this.handleNodeExistsSuccess, this.handleNodeExistsError, 0, false) == 'loaded') {
		this.nodeExistsCallback(true);
	}

}

/**
 * Handles errors when checking to see if a node exists.
 * NOTE: This doesn't seem to get called even if the node doesn't exist, it just calls the
 * success handler with empty data.
 * @private
 */
ScalarAPI.prototype.handleNodeExistsError = function(XMLHttpRequest, textStatus, errorThrown) {
	scalarapi.nodeExistsCallback(false);
}


/**
 * Parses data for the the page and calls the callback with the results of whether the requested node exists.
 * @private
 *
 * @param	json		JSON data about the loaded page.
 */
ScalarAPI.prototype.handleNodeExistsSuccess = function(json) {
	var propCount = 0;
	for (var property in json) {
		propCount++;
	}
	scalarapi.nodeExistsCallback(propCount > 0);
}

// TODO: Provide rudimentary jsonp error handling (it's not supported via jQuery),
// perhaps using this: http://code.google.com/p/jquery-jsonp/

/**
 * Loads data about the specified page.
 *
 * @param	uriSegment			URI segment identifying the page to be loaded.
 * @param	forceReload			If true, forces the data to be reloaded whether it was loaded previously or not.
 * @param	successCallback		Handler to be called when the data has successfully loaded.
 * @param	errorCallback		Handler to be called when the data failed to load.
 * @param	depth				Number of levels of recursion to use in gathering data.
 * @param	references			If true, will return 'references' relationships
 * @param	relation			If populated, will return only relations of the specified type
 * @param	start				Result number to start with
 * @param	results				Number of results to return
 * @return						A string indicating the state of the request.
 */
ScalarAPI.prototype.loadNode = ScalarAPI.prototype.loadPage = function(uriSegment, forceReload, successCallback, errorCallback, depth, references, relation, start, results) {

	var url = this.model.urlPrefix+uriSegment;
	var node = this.model.nodesByURL[this.model.urlPrefix+uriSegment];
	
	var queryString = 'format=json';
	if (depth == undefined) depth = 0;
	queryString += '&rec='+depth;
	var ref;
	if (references == undefined) {
		ref = 0;
	} else {
		ref = references ? 1 : 0;
	}
	queryString += '&ref='+ref;
	if (relation !== null) {
		queryString += '&res='+relation;
	}
	if (start != undefined) {
		queryString += '&start='+start;
	}
	if (results != undefined) {
		queryString += '&results='+results;
	}

	if (this.loadPageStatus[url] == undefined) {
		this.loadPageStatus[url] = {isLoading:false, queuedSuccessCallbacks:[], queuedErrorCallbacks:[]};
	}
	
	// if we're forcing the data to load, or if the data hasn't already been loaded, then
	if (forceReload || (node == undefined)) {
	
		// if the data isn't already loading, then load it
		if (!this.loadPageStatus[url].isLoading) {
			$.ajax({
				type:"GET",
				url:this.model.urlPrefix+'rdf/node/'+uriSegment+'?'+queryString,
				dataType:"jsonp",
				context:this,
				success:[this.parsePage, successCallback],
				error:[this.handleLoadPageError, errorCallback]
			});
			this.loadPageStatus[url].isLoading = true;
			return 'loading';
			
		// otherwise, add the callbacks to the list of those to be called when the load completes
		} else {
			this.loadPageStatus[url].queuedSuccessCallbacks.push(successCallback);
			this.loadPageStatus[url].queuedErrorCallbacks.push(successCallback);
			return 'queued';
		}
		
	} else {
		return 'loaded';
	}
	
}

/**
 * Handles errors when loading data for a page.
 * @private
 */
ScalarAPI.prototype.handleLoadPageError = function(XMLHttpRequest, textStatus, errorThrown) {
	/*
	TODO: Currently we can't handle this error properly because we don't know the url of the page
	we attempted to load
	var i;
	var n = this.loadPageStatus[url].queuedErrorCallbacks.length;
	for (i=0; i<n; i++) {
		this.loadPageStatus[url].queuedErrorCallbacks[i](XMLHttpRequest, textStatus, errorThrown);
	}*/
}

/**
 * Parses data for the the loaded page.
 * @private
 *
 * @param	json		JSON data about the loaded page.
 */
ScalarAPI.prototype.parsePage = function(json) {
	//this.model.deleteRelationsForNodes(this.model.urlPrefix+this.basepath(document.location.href));
	
	var nodes = scalarapi.model.parseNodes(json);
	scalarapi.model.parseRelations(json);

	var i, n, node;
	for (var j in nodes) {
		node = nodes[j];
		var url = node.url;
		if (scalarapi.loadPageStatus[url] != undefined) {
			scalarapi.loadPageStatus[url].isLoading = false;
			n = scalarapi.loadPageStatus[url].queuedSuccessCallbacks.length;
			for (i=0; i<n; i++) {
				scalarapi.loadPageStatus[url].queuedSuccessCallbacks[i](json);
			}
			scalarapi.loadPageStatus[url].queuedSuccessCallbacks = [];
			scalarapi.loadPageStatus[url].queuedErrorCallbacks = [];
		}
	}
}

/**
 * Loads data about the current page.
 *
 * @param	forceReload			If true, forces the data to be reloaded whether it was loaded previously or not.
 * @param	successCallback		Handler to be called when the data has successfully loaded.
 * @param	errorCallback		Handler to be called when the data failed to load.
 * @param	depth				Number of levels of recursion to use in gathering data.
 * @param	references			If true, will return 'references' relationships
 * @param	relation			If true, will return only relations of the named type
 * @return						A string indicating the state of the request.
 */
ScalarAPI.prototype.loadCurrentNode = ScalarAPI.prototype.loadCurrentPage = function(forceReload, successCallback, errorCallback, depth, references, relation) {

	// TODO: Potentially rejigger this to call loadPage or loadMedia
	
	var queryString = 'format=json';
	if (depth == undefined) depth = 0;
	queryString += '&rec='+depth;
	var ref;
	if (references == undefined) {
		ref = 0;
	} else {
		ref = references ? 1 : 0;
	}
	queryString += '&ref='+ref;
	if (relation != undefined) {
		queryString += '&res='+relation;
	}
	
	// if we're forcing the data to load, or if the data hasn't already been loaded, then
	if (forceReload || (this.model.currentPageNode == null)) {
	
		// if the data isn't already loading, then load it
		if (!this.loadCurrentPageStatus.isLoading) {
			$.ajax({
				type:"GET",
				url:this.model.urlPrefix+'rdf/node/'+this.stripVersion(this.basepath(document.location.href))+'?'+queryString,
				dataType:"jsonp",
				context:this,
				success:[this.parseCurrentPage, successCallback],
				error:[this.handleLoadCurrentPageError, errorCallback]
			});
			this.loadCurrentPageStatus.isLoading = true;
			return 'loading';
			
		// otherwise, add the callbacks to the list of those to be called when the load completes
		} else {
			this.loadCurrentPageStatus.queuedSuccessCallbacks.push(successCallback);
			this.loadCurrentPageStatus.queuedErrorCallbacks.push(successCallback);
			return 'queued';
		}
		
	} else {
		return 'loaded';
	}
	
}

/**
 * Handles errors when loading data for the current page.
 * @private
 */
ScalarAPI.prototype.handleLoadCurrentPageError = function(XMLHttpRequest, textStatus, errorThrown) {
	var i;
	var n = scalarapi.loadCurrentPageStatus.queuedErrorCallbacks.length;
	for (i=0; i<n; i++) {
		scalarapi.loadCurrentPageStatus.queuedErrorCallbacks[i](XMLHttpRequest, textStatus, errorThrown);
	}
}

/**
 * Parses data for the current page.
 * @private
 *
 * @param	json		JSON data about the current page.
 */
ScalarAPI.prototype.parseCurrentPage = function(json) {
	this.model.deleteRelationsForNodes(this.model.urlPrefix+this.basepath(document.location.href));
	scalarapi.loadCurrentPageStatus.isLoading = false;
	var nodes = this.model.parseNodes(json);
	if (nodes.length > 0) scalarapi.model.currentPageNode = nodes[0];
	scalarapi.model.parseRelations(json);
	var i;
	var n = scalarapi.loadCurrentPageStatus.queuedSuccessCallbacks.length;
	for (i=0; i<n; i++) {
		scalarapi.loadCurrentPageStatus.queuedSuccessCallbacks[i](json);
	}
	scalarapi.loadCurrentPageStatus.queuedSuccessCallbacks = [];
	scalarapi.loadCurrentPageStatus.queuedErrorCallbacks = [];
}

/**
 * Returns the node identified by the supplied URI or slug.
 *
 * @param	uriOrSlug			Either the URI or the slug identifying the node.
 * @return						The node for the desired page, if found.
 */
ScalarAPI.prototype.getNode = function(uriOrSlug) {
	if ( uriOrSlug != null ) {
		if (uriOrSlug.indexOf('http://') != -1) {
			return this.model.nodesByURL[uriOrSlug];
		}
		return this.model.nodesByURL[this.model.urlPrefix+uriOrSlug];
	}
	return null;
}

/**
 * Sets the urlPrefix to be used in subsequent calls to the API to the book
 * referenced in the supplied URL. (NOTE: this will fail if the Scalar install
 * has a non-standard URL structure).
 *
 * @param	scalarURL			A URL from a Scalar book.
 */
ScalarAPI.prototype.setBook = function(scalarURL) {
	this.model.urlPrefix = scalarURL.split('/').slice(0,5).join('/')+'/';
}

/**
 * Loads data about the current book.
 *
 * @param	forceReload			If true, forces the data to be reloaded whether it was loaded previously or not.
 * @param	successCallback		Handler to be called when the data has successfully loaded.
 * @param	errorCallback		Handler to be called when the data failed to load.
 * @return						A string indicating the state of the request.
 */
ScalarAPI.prototype.loadBook = function(forceReload, successCallback, errorCallback) {

	// TODO: Potentially rejigger this to call loadPage
	
	var node = this.model.nodesByURL[this.model.urlPrefix];

	// if we're forcing the data to load, or if the data hasn't already been loaded, then
	if (forceReload || (this.model.bookNode == null)) {
	
		// if the data isn't already loading, then load it
		if (!this.loadBookStatus.isLoading) {
			$.ajax({
				type:"GET",
				url:this.model.urlPrefix+'rdf?format=json',
				dataType:"jsonp",
				context:this,
				success:[this.parseBook, successCallback],
				error:[this.handleLoadBookError, errorCallback]
			});
			this.loadBookStatus.isLoading = true;
			return 'loading';
			
		// otherwise, add the callbacks to the list of those to be called when the load completes
		} else {
			this.loadBookStatus.queuedSuccessCallbacks.push(successCallback);
			this.loadBookStatus.queuedErrorCallbacks.push(successCallback);
			return 'queued';
		}
		
	} else {
		return 'loaded';
	}
	
}

/**
 * Handles errors when loading data for the book.
 * @private
 */
ScalarAPI.prototype.handleLoadBookError = function(XMLHttpRequest, textStatus, errorThrown) {
	var i;
	var n = scalarapi.loadBookStatus.queuedErrorCallbacks.length;
	for (i=0; i<n; i++) {
		scalarapi.loadBookStatus.queuedErrorCallbacks[i](XMLHttpRequest, textStatus, errorThrown);
	}
}

/**
 * Parses data for the book.
 * @private
 *
 * @param	json		JSON data about the book.
 */
ScalarAPI.prototype.parseBook = function(json) {
	this.model.deleteRelationsForNodes(this.model.urlPrefix);
	scalarapi.loadBookStatus.isLoading = false;
	var nodes = scalarapi.model.parseNodes(json);
	scalarapi.model.bookNode = nodes[0];
	scalarapi.model.parseRelations(json);
	var i;
	var n = scalarapi.loadBookStatus.queuedSuccessCallbacks.length;
	for (i=0; i<n; i++) {
		scalarapi.loadBookStatus.queuedSuccessCallbacks[i](json);
	}
	scalarapi.loadBookStatus.queuedSuccessCallbacks = [];
	scalarapi.loadBookStatus.queuedErrorCallbacks = [];
}

/**
 * Loads data for pages of the given type.
 *
 * @param	type				The type of pages to load.
 * @param	forceReload			If true, forces the data to be reloaded whether it was loaded previously or not.
 * @param	successCallback		Handler to be called when the data has successfully loaded.
 * @param	errorCallback		Handler to be called when the data failed to load.
 * @param	references			If true, will return 'references' relationships
 * @param	relation			If true, will return only relations of the named type
 * @param	start				Result number to start with
 * @param	results				Number of results to return
 * @return						A string indicating the state of the request.
 */
ScalarAPI.prototype.loadNodesByType = ScalarAPI.prototype.loadPagesByType = function(type, forceReload, successCallback, errorCallback, depth, references, relation, start, results, hidden) {

	var nodes = this.model.getNodesWithProperty('scalarType', type);
	
	var queryString = 'format=json';
	if (depth == undefined) depth = 0;
	queryString += '&rec='+depth;
	var ref;
	if (references == undefined) {
		ref = 0;
	} else {
		ref = references ? 1 : 0;
	}
	queryString += '&ref='+ref;
	if (relation != null) {
		queryString += '&res='+relation;
	}
	if (start != null) {
		queryString += '&start='+start;
	}
	if (results != null) {
		queryString += '&results='+results;
	}
	if (hidden != null) {  // Added by Craig 21 July 2014
		queryString += '&hidden='+hidden;
	}

	// if we're forcing the data to load, no nodes of the given type have already been loaded, or pagination settings are active, then
	if (forceReload || (nodes.length == 0) || (start != null) || (results != null)) {
	
		// NOTE: Removed queueing functionality because it wasn't properly handling the multiple
		// content types and a better solution couldn't be devised quickly
		
		// if the data isn't already loading, then load it
		//if (!this.loadPagesByTypeStatus.isLoading) {
			$.ajax({
				type:"GET",
				url:this.model.urlPrefix+'rdf/instancesof/'+type+'?'+queryString,
				dataType:"jsonp",
				context:{type:type},
				success:[this.parsePagesByType, successCallback],
				error:[this.handleLoadPagesByTypeError, errorCallback]
			});
			this.loadPagesByTypeStatus.isLoading = true;
			return 'loading';
			
		// otherwise, add the callbacks to the list of those to be called when the load completes
		/*} else {
			this.loadPagesByTypeStatus.queuedSuccessCallbacks.push(successCallback);
			this.loadPagesByTypeStatus.queuedErrorCallbacks.push(successCallback);
			this.loadPagesByTypeStatus.queuedTypes.push(successCallback);
			return 'queued';
		}*/
		
	} else {
		return 'loaded';
	}
	
}

/**
 * Loads data for nodes matching the specified search query.
 *
 * @param	sq					Search string
 * @param	successCallback		Handler to be called when the data has successfully loaded.
 * @param	errorCallback		Handler to be called when the data failed to load.
 * @param	references			If true, will return 'references' relationships
 * @param	relation			If true, will return only relations of the named type
 * @param	start				Result number to start with
 * @param	results				Number of results to return
 * @param	hidden				Include results where live is set to 0
 * @param	type				Only search in specific content types
 * @return						A string indicating the state of the request.
 */
ScalarAPI.prototype.nodeSearch = function(sq, successCallback, errorCallback, depth, references, relation, start, results, hidden, type) {

	var queryString = 'sq='+encodeURIComponent(sq)+'&format=json';

	if (depth == undefined) depth = 0;
	queryString += '&rec='+depth;
	var ref;
	if (references == undefined) {
		ref = 0;
	} else {
		ref = references ? 1 : 0;
	}
	queryString += '&ref='+ref;
	if (relation) {
		queryString += '&res='+relation;
	}
	if (start != undefined) {
		queryString += '&start='+start;
	}
	if (results != undefined) {
		queryString += '&results='+results;
	}
	if (hidden != undefined) {  // Added by Craig 21 July 2014
		queryString += '&hidden='+hidden;
	}
	
	if ( type == null ) {
		type = 'content';
	}
	
	$.ajax({
		type:"GET",
		url:this.model.urlPrefix+'rdf/instancesof/' + type + '?'+queryString,
		dataType:"jsonp",
		success:[this.parsePagesByType, successCallback],
		error:[this.handleLoadPagesByTypeError, errorCallback]
	});
	
}

/**
 * Handles errors when loading data for pages of a given type.
 * @private
 */
ScalarAPI.prototype.handleLoadPagesByTypeError = function(XMLHttpRequest, textStatus, errorThrown) {
	var i;
	var n = scalarapi.loadPagesByTypeStatus.queuedErrorCallbacks.length;
	for (i=0; i<n; i++) {
		scalarapi.loadPagesByTypeStatus.queuedErrorCallbacks[i](XMLHttpRequest, textStatus, errorThrown);
	}
}

/**
 * Parses data for pages of a given type.
 * @private
 *
 * @param	json		JSON data about the pages.
 */
ScalarAPI.prototype.parsePagesByType = function(json) {
	// turned this off because it's too indiscriminate
	// scalarapi.model.deleteRelationsForNodes(this.type);
	scalarapi.loadPagesByTypeStatus.isLoading = false;
	scalarapi.model.parseNodes(json);
	scalarapi.model.parseRelations(json);
	var i;
	var n = scalarapi.loadPagesByTypeStatus.queuedSuccessCallbacks.length;
	for (i=0; i<n; i++) {
		scalarapi.loadPagesByTypeStatus.queuedSuccessCallbacks[i](json);
	}
	scalarapi.loadPagesByTypeStatus.queuedSuccessCallbacks = [];
	scalarapi.loadPagesByTypeStatus.queuedErrorCallbacks = [];
}
			
/**
 * Creates a new instance of the model.
 * @class 	Stores all Scalar data.
 *
 * @param 	{Object} options	An object containing relevant data for the plug-in.
 */
function ScalarModel(options) {
	
	var me = this;

	this.urlPrefix;								// home page of the book
	this.parent_uri = options['parent_uri'];	// parent uri of the book
	this.logged_in = options['logged_in'];		// is the user currently logged in
	this.user_level = options['user_level'];	// level of the current user
	this.nodes = [];							// all known nodes
	this.nodesByURL = {};						// all known nodes, indexed by their URLs
	this.nodesByURN = {};						// all known nodes, indexed by their URNs
	this.relationsById = {};					// all known relations, indexed by their ids
	this.crossDomain = false;					// are we making cross-domain requests for testing purposes?
	
	// one-shot properties which can be pulled automatically from node data
	this.nodePropertyMap = [
		{property:'created', uri:'http://purl.org/dc/terms/created', type:'string'},
		{property:'baseType', uri:'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', type:'string'},
		{property:'color', uri:'http://scalar.usc.edu/2012/01/scalar-ns#color', type:'string'},
		{property:'title', uri:'http://purl.org/dc/terms/title', type:'string'},
		{property:'thumbnail', uri:'http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail', type:'string'},
		{property:'tableOfContents', uri:'http://purl.org/dc/terms/tableOfContents', type:'string'},
		{property:'name', uri:'http://xmlns.com/foaf/0.1/name', type:'string'},
		{property:'homepage', uri:'http://xmlns.com/foaf/0.1/homepage', type:'string'},
		{property:'urn', uri:'http://scalar.usc.edu/2012/01/scalar-ns#urn', type:'string'},
		{property:'background', uri:'http://scalar.usc.edu/2012/01/scalar-ns#background', type:'string'},
		{property:'audio', uri:'http://scalar.usc.edu/2012/01/scalar-ns#audio', type:'string'},
		{property:'isLive', uri:'http://scalar.usc.edu/2012/01/scalar-ns#isLive', type:'string'},  // Add by Craig 21 July 2014
		{property:'paywall', uri:'http://scalar.usc.edu/2012/01/scalar-ns#paywall', type:'string'}  // Add by Craig 15 August 2014
	];
	
	// one-shot properties which can be pulled automatically from version data
	this.versionPropertyMap = [
		{property:'number', uri:'http://open.vocab.org/terms/versionnumber', type:'int'},
		{property:'created', uri:'http://purl.org/dc/terms/created', type:'string'},
		{property:'description', uri:'http://purl.org/dc/terms/description', type:'string'},
		{property:'isReplacedBy', uri:'http://purl.org/dc/terms/isReplacedBy', type:'string'},
		{property:'isVersionOf', uri:'http://purl.org/dc/terms/isVersionOf', type:'string'},
		{property:'title', uri:'http://purl.org/dc/terms/title', type:'string'},
		{property:'content', uri:'http://rdfs.org/sioc/ns#content', type:'string'},
		{property:'defaultView', uri:'http://scalar.usc.edu/2012/01/scalar-ns#defaultView', type:'string'},
		{property:'baseType', uri:'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', type:'string'},
		{property:'sourceFile', uri:'http://simile.mit.edu/2003/10/ontologies/artstor#url', type:'string'},
		{property:'creator', uri:'http://purl.org/dc/terms/creator', type:'string'},
		{property:'contributor', uri:'http://purl.org/dc/terms/contributor', type:'string'},
		{property:'source', uri:'http://purl.org/dc/terms/source', type:'string'},
		{property:'thumbnail', uri:'http://simile.mit.edu/2003/10/ontologies/artstor#thumbnail', type:'string'},
		{property:'thumbnail', uri:'artstor:thumbnail', type:'string'},
		{property:'sourceLocation', uri:'http://simile.mit.edu/2003/10/ontologies/artstor#sourceLocation', type:'string'},
		{property:'urn', uri:'http://scalar.usc.edu/2012/01/scalar-ns#urn', type:'string'},
		{property:'sortNumber', uri:'http://scalar.usc.edu/2012/01/scalar-ns#sort_number', type:'int'},
		{property:'continueTo', uri:'http://scalar.usc.edu/2012/01/scalar-ns#continue_to_content_id', type:'int'},
		{property:'isLive', uri:'http://scalar.usc.edu/2012/01/scalar-ns#isLive', type:'int'},  // Add by Craig 21 July 2014
		{property:'paywall', uri:'http://scalar.usc.edu/2012/01/scalar-ns#paywall', type:'string'}  // Add by Craig 15 August 2014
	];
	
	this.auxPropertyMap = [
		{property:'abstract', uri:'http://purl.org/dc/terms/abstract', type:'string'},
		{property:'accessRights', uri:'http://purl.org/dc/terms/accessRights', type:'string'},
		{property:'accrualMethod', uri:'http://purl.org/dc/terms/accrualMethod', type:'string'},
		{property:'accrualPeriodicity', uri:'http://purl.org/dc/terms/accrualPeriodicity', type:'string'},
		{property:'accrualPolicy', uri:'http://purl.org/dc/terms/accrualPolicy', type:'string'},
		{property:'alternative', uri:'http://purl.org/dc/terms/alternative', type:'string'},
		{property:'audience', uri:'http://purl.org/dc/terms/audience', type:'string'},
		{property:'authority', uri:'artstor:authority', type:'string'},
		{property:'available', uri:'http://purl.org/dc/terms/available', type:'string'},
		{property:'bibliographicCitation', uri:'http://purl.org/dc/terms/bibliographicCitation', type:'string'},
		{property:'conformsTo', uri:'http://purl.org/dc/terms/conformsTo', type:'string'},
		{property:'contributor', uri:'http://purl.org/dc/terms/contributor', type:'string'},
		{property:'coverage', uri:'http://purl.org/dc/terms/coverage', type:'string'},
		{property:'date', uri:'http://purl.org/dc/terms/date', type:'string'},
		{property:'dateAccepted', uri:'http://purl.org/dc/terms/dateAccepted', type:'string'},
		{property:'dateCopyrighted', uri:'http://purl.org/dc/terms/dateCopyrighted', type:'string'},
		{property:'dateSubmitted', uri:'http://purl.org/dc/terms/dateSubmitted', type:'string'},
		{property:'educationLevel', uri:'http://purl.org/dc/terms/educationLevel', type:'string'},
		{property:'extent', uri:'http://purl.org/dc/terms/extent', type:'string'},
		{property:'format', uri:'http://purl.org/dc/terms/format', type:'string'},
		{property:'geographic', uri:'artstor:geographic', type:'string'},
		{property:'hasFormat', uri:'http://purl.org/dc/terms/hasFormat', type:'string'},
		{property:'hasMediaFile', uri:'artstor:hasMediaFile', type:'string'},
		{property:'height', uri:'artstor:height', type:'string'},
		{property:'identifier', uri:'http://purl.org/dc/terms/identifier', type:'string'},
		{property:'imageId', uri:'artstor:imageId', type:'string'},
		{property:'imageSource', uri:'artstor:imageSource', type:'string'},
		{property:'inCollection', uri:'artstor:inCollection', type:'string'},
		{property:'instructionalMethod', uri:'http://purl.org/dc/terms/instructionalMethod', type:'string'},
		{property:'isFormatOf', uri:'http://purl.org/dc/terms/isFormatOf', type:'string'},
		{property:'isRequiredBy', uri:'http://purl.org/dc/terms/isRequiredBy', type:'string'},
		{property:'issued', uri:'http://purl.org/dc/terms/issued', type:'string'},
		{property:'language', uri:'http://purl.org/dc/terms/language', type:'string'},
		{property:'license', uri:'http://purl.org/dc/terms/license', type:'string'},
		{property:'lps', uri:'artstor:lps', type:'string'},
		{property:'lpsid', uri:'artstor:lpsid', type:'string'},
		{property:'mediafileFormat', uri:'artstor:mediafileFormat', type:'string'},
		{property:'mediator', uri:'http://purl.org/dc/terms/mediator', type:'string'},
		{property:'medium', uri:'http://purl.org/dc/terms/medium', type:'string'},
		{property:'metadataCreationDate', uri:'artstor:metadataCreationDate', type:'string'},
		{property:'metadataUpdateDate', uri:'artstor:metadataUpdateDate', type:'string'},
		{property:'modified', uri:'http://purl.org/dc/terms/modified', type:'string'},
		{property:'nationality', uri:'artstor:nationality', type:'string'},
		{property:'objectId', uri:'artstor:objectId', type:'string'},
		{property:'provenance', uri:'http://purl.org/dc/terms/provenance', type:'string'},
		{property:'publisher', uri:'http://purl.org/dc/terms/publisher', type:'string'},
		{property:'relation', uri:'http://purl.org/dc/terms/relation', type:'string'},
		{property:'requires', uri:'http://purl.org/dc/terms/requires', type:'string'},
		{property:'resolution', uri:'artstor:resolution', type:'string'},
		{property:'rights', uri:'http://purl.org/dc/terms/rights', type:'string'},
		{property:'rightsHolder', uri:'http://purl.org/dc/terms/rightsHolder', type:'string'},
		{property:'serverurl', uri:'artstor:serverurl', type:'string'},
		{property:'source', uri:'http://purl.org/dc/terms/source', type:'string'},
		{property:'sourceLocation', uri:'artstor:sourceLocation', type:'string'},
		{property:'spatial', uri:'http://purl.org/dc/terms/spatial', type:'string'},
		{property:'subject', uri:'http://purl.org/dc/terms/subject', type:'string'},
		{property:'temporal', uri:'http://purl.org/dc/terms/temporal', type:'string'},
		{property:'topic', uri:'artstor:topic', type:'string'},
		{property:'type', uri:'http://purl.org/dc/terms/type', type:'string'},
		{property:'vitalDates', uri:'artstor:vitalDates', type:'string'},
		{property:'valid', uri:'http://purl.org/dc/terms/valid', type:'string'},
		{property:'width', uri:'artstor:width', type:'string'}
	];
	
	// metadata about each relation type
	this.relationTypes = {
		'tag':{id:'tag', body:'tag', bodyPlural:'tags', target:'item', targetPlural:'items', incoming:'has', outgoing:'tags'},
		'path':{id:'path', body:'path', bodyPlural:'paths', target:'item', targetPlural:'items', incoming:'contained by', outgoing:'contains'},
		'referee':{id:'referee', body:'item', bodyPlural:'items', target:'media file', targetPlural:'media files', incoming:'referenced by', outgoing:'references'},
		'annotation':{id:'annotation', body:'annotation', bodyPlural:'annotations', target:'item', targetPlural:'items', incoming:'annotated by', outgoing:'annotates'},
		'comment':{id:'comment', body:'comment', bodyPlural:'comments', target:'item', targetPlural:'items', incoming:'has', outgoing:'is a comment on'},
		'commentary':{id:'commentary', body:'commentary', bodyPlural:'commentaries', target:'item', targetPlural:'items', incoming:'has', outgoing:'is a commentary on'},
		'review':{id:'review', body:'review', bodyPlural:'reviews', target:'item', targetPlural:'items', incoming:'has', outgoing:'is a review of'},
		'author':{id:'author', body:'book', bodyPlural:'books', target:'author', targetPlural:'authors', incoming:'written by', outgoing:'has written'},
		'commentator':{id:'commentator', body:'book', bodyPlural:'book', target:'commentator', targetPlural:'commentators', incoming:'responded to by', outgoing:'has responded to'},
		'reviewer':{id:'reviewer', body:'book', bodyPlural:'books', target:'reviewer', targetPlural:'reviewers', incoming:'reviewed by', outgoing:'has reviewed'},
		'unknown':{id:'unknown', body:'item', bodyPlural:'items', target:'item', targetPlural:'items', incoming:'linked to', outgoing:'linked to'}
	}
	
	this.scalarTypes = {
		'book':{id:'book', singular:'book', plural:'books'},
		'page':{id:'page', singular:'page', plural:'pages'},
		'defaultPage':{id:'page', singular:'page', plural:'pages'},
		'video':{id:'video', singular:'video', plural:'videos'},
		'audio':{id:'audio', singular:'audio', plural:'audio files'},
		'image':{id:'image', singular:'image', plural:'images'},
		'map':{id:'map', singular:'map', plural:'maps'},
		'document':{id:'document', singular:'document', plural:'documents'},
		'item':{id:'item', singular:'item', plural:'items'},
		'path':{id:'path', singular:'path', plural:'paths'},
		'media':{id:'media', singular:'media', plural:'media files'},
		'tag':{id:'tag', singular:'tag', plural:'tags'},
		'annotation':{id:'annotation', singular:'annotation', plural:'annotations'},
		'commentary':{id:'commentary', singular:'commentary', plural:'commentaries'},
		'comment':{id:'reply', singular:'comment', plural:'comments'},
		'person':{id:'person', singular:'person', plural:'people'},
		'review':{id:'review', singular:'review', plural:'reviews'},
		'author':{id:'author', singular:'author', plural:'authors'},
		'commentator':{id:'commentator', singular:'commentator', plural:'commentators'},
		'reviewer':{id:'reviewer', singular:'reviewer', plural:'reviewers'},
		'other':{id:'other', singular:'file', plural:'files'}
	}
	
	this.userTypes = ['author','commentator','reviewer'];
	
	// figure out where we are
	if (!this.crossDomain) {
		this.urlPrefix = options['parent_uri'];
	}

	// scrape book title from page
	this.book_title = $('h2.cover_title').html();
	
	// if RDFa utility is present, grab RDFa from the page
	//if ($.RDFa) {
		// TODO: write this
	//}

}

ScalarModel.prototype.urlPrefix = null;
ScalarModel.prototype.logged_in = null;
ScalarModel.prototype.user_level = null;
ScalarModel.prototype.nodes = null;
ScalarModel.prototype.nodesByURL = null;
ScalarModel.prototype.nodesByURN = null;
ScalarModel.prototype.relationsById = null;
ScalarModel.prototype.crossDomain = null;
ScalarModel.prototype.nodePropertyMap = null;
ScalarModel.prototype.versionPropertyMap = null;
ScalarModel.prototype.auxPropertyMap = null;
ScalarModel.prototype.currentPageNode = null;
ScalarModel.prototype.bookNode = null;
ScalarModel.prototype.scalarTypes = null;
ScalarModel.prototype.relationTypes = null;
ScalarModel.prototype.userTypes = null;
		
/**
 * Parses the specified json, creating/updating any referenced nodes.
 * @private
 *
 * @param {Object} json		The data to be parsed.
 * @return					The nodes that were created/updated.
 */
ScalarModel.prototype.parseNodes = function(json) {

	var resultNodes = [];
	var property;
	var versionProperty;
	var versionUrl;
	var versionData;
	var node;
	var i;
	var n;
	var isNode;

	for (property in json) {
	
		isNode = true;
		if (json[property]['http://www.w3.org/1999/02/22-rdf-syntax-ns#type']) {
			if (json[property]['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'][0].value == 'http://scalar.usc.edu/2012/01/scalar-ns#Version') {
				isNode = false;
			}
		}
		if (json[property]['http://www.openannotation.org/ns/hasBody'] || json[property]['http://purl.org/dc/terms/isVersionOf']) {
			isNode = false;
		}
	
		// make sure we're processing only nodes and not versions
		if (isNode) {
			
			// gather all versions of the node contained in the current data
			versionData = [];
			if (json[property]['http://purl.org/dc/terms/hasVersion']) {
				n = json[property]['http://purl.org/dc/terms/hasVersion'].length;
				for (i=0; i<n; i++) {
					versionUrl = json[property]['http://purl.org/dc/terms/hasVersion'][i].value;
					versionData.push({url:versionUrl, json:json[versionUrl]});
				}
			}
	
			// if this node has already been created, then update it
			if (this.nodesByURL[property]) {
				node = this.nodesByURL[property];
				node.parseData(json[property], versionData);
				
			// otherwise, create the node and store it
			} else {
			
				node = new ScalarNode(property, json[property], versionData);
				this.addNode(node);
			}
		
			resultNodes.push(node);
			
		}
		
	}	

	return resultNodes;
	
}	
		
/**
 * Parses the specified json, creating any referenced relations.
 * @private
 *
 * @param {Object} json		The data to be parsed.
 * @return					The relations that were created.
 */
ScalarModel.prototype.parseRelations = function(json) {

	var property;
	var relation;
	//var resultRelations = [];

	// parse OA-formatted relations
	for (property in json) {
		if (json[property]['http://www.openannotation.org/ns/hasBody'] != null) {
			relation = new ScalarRelation(json[property]);
			//this.relations.push(relation);
			this.relationsById[relation.id] = relation;
			//resultRelations.push(relation);
		}
	}
	
	// TODO: This may be inefficient--parsing all relations instead of newly added ones
	
	// parse other relations (like 'references')
	var i;
	var n = this.nodes.length;
	for (i=0; i<n; i++) {
		this.nodes[i].parseRelations();
		if (this.nodes[i].current) this.nodes[i].current.parseRelations();
	}
	
	//return resultRelations;
}	
		
/**
 * Deletes all relations that refer to the specified node(s).
 * @private
 *
 * @param {Object} nodeRefSpec		Reference to a node or nodes.
 */
ScalarModel.prototype.deleteRelationsForNodes = function(nodeRefSpec) {

	var ref;
	var nodeRefs;

	if (typeof nodeRefSpec === 'array') {
		nodeRefs = nodeRefSpec;
	} else if (typeof nodeRefSpec === 'string') {
		nodeRefs = [nodeRefSpec];
	}
	
	var i;
	var j;
	var n;
	var o = nodeRefs.length;
	var relation;
	var index;
	var shouldDelete;
	
	for (var id in this.relationsById) {
	
		relation = this.relationsById[id];
		
		if ((relation != null) && relation.body && relation.target) {
			shouldDelete = false;
			
			for (j=0; j<o; j++) {
			
				ref = nodeRefs[j];
					
				// if the ref is a string, then
				if (typeof ref === 'string') {
				
					// if the string matches one of the relation types, assume that we want to
					// delete all relations of that type (TODO: protect against case where
					// a node has the same name as one of our relation types)
					if (relation.body.scalarTypes[ref] || relation.target.scalarTypes[ref]) {
						shouldDelete = true;
						
					// otherwise, assume the string is a node url
					} else if ((relation.body.url == ref) || (relation.target.url == ref)) {
						shouldDelete = true;
					}
					
				// otherwise, assume it is itself a node
				} else {
					if ((relation.body == ref) || (relation.target == ref)) shouldDelete = true;
				}
	
				if (shouldDelete) {
					index = relation.body.outgoingRelations.indexOf(relation);
					relation.body.outgoingRelations.splice(index, 1);
					index = relation.target.incomingRelations.indexOf(relation);
					relation.target.incomingRelations.splice(index, 1);
					this.relationsById[relation.id] = null;
					break;
				}
			}
		}

	}

}

/**
 * Adds the specified node to the model.
 * @private
 *
 * @param {Object} node		The node to be added.
 */
ScalarModel.prototype.addNode = function(node) {

	// if this node hasn't already been added, then
	if (!this.nodesByURL[node.url]) {
	
		this.nodes.push(node);
		this.nodesByURL[node.url] = node;
		this.nodesByURN[node.urn] = node;
		
		if (node.url == this.urlPrefix+scalarapi.basepath(document.location.href)) {
			this.currentPageNode = node;
		}
		
	}
	
}

ScalarModel.prototype.removeNodes = function() {
	
	this.nodes = [];							// all known nodes
	this.nodesByURL = {};						// all known nodes, indexed by their URLs
	this.nodesByURN = {};						// all known nodes, indexed by their URNs
	this.relationsById = {};					// all known relations, indexed by their ids
	
}

/**
 * Returns all nodes.
 *
 * @param	sort		The type of sorting to perform on the nodes returned.
 * @return				The matching nodes.
 */
ScalarModel.prototype.getNodes = function(sort) {

	var results = [];
	
	var i;
	var n = this.nodes.length;
	var node;
	for (i=0; i<n; i++) {
		node = this.nodes[i];
		results.push(node);
	}
	
	n = results.length;
	switch (sort) {
	
		case 'alphabetical':
		results.sort(function(a,b) {
			var nameA = a.getSortTitle().toLowerCase();
			var nameB = b.getSortTitle().toLowerCase();
			/*
			if (a.current) {
				nameA = a.getSortTitle().toLowerCase();
			} else {
				nameA = a.title;
			}
			if (b.current) {
				nameB = b.current.sortTitle.toLowerCase();
			} else {
				nameB = b.title;
			}*/
			if ('undefined'==typeof(nameA)) nameA = scalarapi.untitledNodeString;
			if ('undefined'==typeof(nameB)) nameB = scalarapi.untitledNodeString;
			if (nameA < nameB) return -1;
			if (nameA > nameB) return 1;
		})
		break;
	
	}

	return results;
}

/**
 * Returns all nodes for which the specified property matches the specified value.
 *
 * @param	property	The name of the node property to test.
 * @param	value		The value to test against.
 * @param	sort		The type of sorting to perform on the nodes returned.
 * @return				The matching nodes.
 */
ScalarModel.prototype.getNodesWithProperty = function(property, value, sort) {

	var results = [];
	
	var i;
	var n = this.nodes.length;
	var node;
	
	// 'content' returns everything
	if ((property == 'scalarType') && (value == 'content')) {
		results = this.nodes.concat();
		
	} else {
		for (i=0; i<n; i++) {
			node = this.nodes[i];
			switch (property) {
			
				case 'scalarType':
				if (value == 'reply') value = 'comment'; // internally called 'reply', colloquially called 'comment'; handle both
				if (node.scalarTypes[value]) results.push(node);
				break;
				
				case 'dominantScalarType':
				if (node.getDominantScalarType() == this.scalarTypes[value]) results.push(node);
				break;
				
				case 'mediaSource':
				if (node.scalarTypes.media && (node.current.mediaSource.name == value)) results.push(node);
				break;
				
				case 'contentType':
				if (node.scalarTypes.media && (node.current.mediaSource.contentType == value)) results.push(node);
				break;
				
				default:
				if (node[property] == value) results.push(node);
				break;
				
			}
		}
	}
	
	n = results.length;
	switch (sort) {
	
		case 'alphabetical':
		results.sort(function(a,b) {
			var nameA = a.getSortTitle().toLowerCase();
			var nameB = b.getSortTitle().toLowerCase();
			/*
			if (a.current) {
				nameA = a.current.sortTitle.toLowerCase();
			} else {
				nameA = a.title;
			}
			if (b.current) {
				nameB = b.current.sortTitle.toLowerCase();
			} else {
				nameB = b.title;
			}*/
			if (nameA < nameB) return -1;
			if (nameA > nameB) return 1;
		})
		break;
	
	}

	return results;
}

/**
 * Returns the main menu node, if one can be found.
 *
 * @return				The main menu node.
 */
ScalarModel.prototype.getMainMenuNode = function() {
	return this.nodesByURL[this.urlPrefix+'toc'];
}

/**
 * Returns the book node, if one can be found.
 *
 * @return				The book node.
 */
ScalarModel.prototype.getBookNode = function() {
	return this.bookNode;
}

/**
 * Returns the node for the current page, if one can be found.
 *
 * @return				The book node.
 */
ScalarModel.prototype.getCurrentPageNode = function() {
	return this.currentPageNode;
}
	
/**
 * Creates a new ScalarNode.
 * @constructor Represents a Scalar content node.
 *
 * @param {String} url					URL of the node.
 * @param {Object} json					JSON data describing the node.
 * @param {Object} versionData			Data describing versions of the node.
 */
function ScalarNode(url, json, versionData) {

	var me = this;
	
	this.data = json;
	this.url = url;
	if (scalarapi.model.urlPrefix != null) {
		this.slug = scalarapi.stripAllExtensions(url).substr(scalarapi.model.urlPrefix.length);
	}
	this.incomingRelations = [];
	this.outgoingRelations = [];
	this.scalarTypes = {};
	
	this.parseData(json, versionData);
	
}

ScalarNode.prototype.data = null;
ScalarNode.prototype.url = null;
ScalarNode.prototype.slug = null;
ScalarNode.prototype.title = null;
ScalarNode.prototype.created = null;
ScalarNode.prototype.baseType = null;
ScalarNode.prototype.incomingRelations = null;
ScalarNode.prototype.outgoingRelations = null;
ScalarNode.prototype.scalarTypes = null;
ScalarNode.prototype.defaultView = null;
ScalarNode.prototype.color = null;
ScalarNode.prototype.thumbnail = null;
ScalarNode.prototype.tableOfContents = null;
ScalarNode.prototype.name = null;
ScalarNode.prototype.homepage = null;
ScalarNode.prototype.current = null;
ScalarNode.prototype.versions = null;
ScalarNode.prototype.properties = null;

/**
 * Parses the data for the node, updating properties as needed.
 * @private
 *
 * @param {Object} json					JSON data describing the node.
 * @param {Object} versionData			Data describing versions of the node (optional).
 */
ScalarNode.prototype.parseData = function(json, versionData) {
	
	// collect various pre-approved properties
	var i, propertyData,
		n = scalarapi.model.nodePropertyMap.length;
	for ( i = 0; i < n; i++ ) {
		propertyData = scalarapi.model.nodePropertyMap[i];
		if (json[propertyData.uri]) {
			if (propertyData.type == 'int') {
				this[propertyData.property] = parseInt(json[propertyData.uri][0].value);
			} else {
				this[propertyData.property] = json[propertyData.uri][0].value;
			}
		}
	}
	
	// store all properties by uri
	this.properties = {};
	var prop;
	for (prop in json) {
		this.properties[prop] = json[prop];
	}
	
	if (versionData) {
	
		// if version data is included, replace all known versions
		this.versions = [];
	
		var i;
		var n = versionData.length;
		for (i=0; i<n; i++) {
			this.versions.push(new ScalarVersion(versionData[i], this));
		}
		
		// sort versions by version number, descending
		this.versions.sort(function(a,b) {
			return parseFloat(b.versionNumber) - parseFloat(a.versionNumber);
		});
		
		this.current = this.versions[0];
		
	}
	
	// kick off the node's collection of types by parsing its baseType
	switch (this.baseType) {
	
		case 'http://scalar.usc.edu/2012/01/scalar-ns#Composite':
		this.scalarTypes.page = scalarapi.model.scalarTypes.page;
		break;
		
		case 'http://scalar.usc.edu/2012/01/scalar-ns#Media':
		this.scalarTypes.media = scalarapi.model.scalarTypes.media;
		break;
		
		case 'http://scalar.usc.edu/2012/01/scalar-ns#Book':
		this.scalarTypes.book = scalarapi.model.scalarTypes.book;
		break;
		
		case 'http://scalar.usc.edu/2012/01/scalar-ns#Page':
		this.scalarTypes.defaultPage = scalarapi.model.scalarTypes.defaultPage;
		break;
		
		case 'http://xmlns.com/foaf/0.1/Person':
		this.scalarTypes.person = scalarapi.model.scalarTypes.person;
		this.title = this.name;
		break;
	
	}
					
}

/**
 * Parses all non-OA relations for the node. Must be run after
 * all nodes have been parsed to work correctly.
 * @private
 */
ScalarNode.prototype.parseRelations = function() {

	var arr;
	var anchorVars;
	var relation;
	var body;
	var target;
	
	// for table of contents
	arr = this.data['http://purl.org/dc/terms/references'];
	if (arr) {
		n = arr.length;
		for (i=0; i<n; i++) {
			body = this;
			target = scalarapi.model.nodesByURL[scalarapi.stripAllExtensions(arr[i].value)];
			anchorVars = scalarapi.getAnchorVars(arr[i].value);
			if ((body && target) && (scalarapi.model.relationsById[body.url+target.url] == undefined)) {
				relation = new ScalarRelation(null, body, target, scalarapi.model.relationTypes.referee);
				//scalarapi.model.relations.push(relation);
				scalarapi.model.relationsById[relation.id] = relation;
				for (var prop in anchorVars) {
					relation.properties[prop] = anchorVars[prop];
					if (prop == 'index') relation.index = anchorVars[prop];
				}
			}
		}
	}

	// for people
	var relationType;
	arr = this.data['http://rdfs.org/sioc/ns#has_owner'];
	if (arr) {
		n = arr.length;
		for (i=0; i<n; i++) {
			body = this;
			target = scalarapi.model.nodesByURL[scalarapi.stripAllExtensions(arr[i].value)];
			anchorVars = scalarapi.getAnchorVars(arr[i].value);
			switch (anchorVars.role) {
			
				case 'author':
				relationType = scalarapi.model.relationTypes.author;
				break;
			
				case 'commentator':
				relationType = scalarapi.model.relationTypes.commentator;
				break;
			
				case 'reviewer':
				relationType = scalarapi.model.relationTypes.reviewer;
				break;
			
			}
			if (body && target) {
				relation = new ScalarRelation(null, body, target, relationType);
				scalarapi.model.relationsById[relation.id] = relation;
				//scalarapi.model.relations.push(relation);
				for (var prop in anchorVars) {
					relation.properties[prop] = anchorVars[prop];
				}
			}
		}
	}

}

/**
 * Adds the specified relation to the node's list of relations, and uses the relation type
 * to populate the node's list of Scalar types.
 * @private
 *
 * @param {Object} relation			The relation to be added.
 */
ScalarNode.prototype.addRelation = function(relation) { 

	var i;
	var n;
	var foundExisting = false;

	if (relation.body == this) {
		
		// don't add duplicates; replace instead
		if (this.outgoingRelations.indexOf(relation) == -1) {
			n = this.outgoingRelations.length;
			for (i=0; i<n; i++) {
				if (this.outgoingRelations[i].id == relation.id) {
					this.outgoingRelations[i] = relation;
					foundExisting = true;
				}
			}
			if (!foundExisting) {
				this.outgoingRelations.push(relation);
			}
			
			// 'referee' is not a Scalar type, so don't track it
			// the 'author', 'commentator' and 'reviewer' types all get assigned
			// to the target, not the body
			if ((relation.type.id != 'referee') && (relation.type.id != 'author') && (relation.type.id != 'commentator') && (relation.type.id != 'reviewer') && (!this.scalarTypes[relation.type.id])) {
				this.scalarTypes[relation.type.id] = scalarapi.model.scalarTypes[relation.type.id];
			}
			
		}
	} else if (relation.target == this) {
	
		// don't add duplicates; replace instead
		if (this.incomingRelations.indexOf(relation) == -1) {
		
			n = this.incomingRelations.length;
			for (i=0; i<n; i++) {
				if (this.incomingRelations[i].id == relation.id) {
					this.incomingRelations[i] = relation;
					foundExisting = true;
				}
			}
			if (!foundExisting) {
				this.incomingRelations.push(relation);
			}
		}
		
		// the 'author', 'commentator' and 'reviewer' types all get assigned
		// to the target, not the body
		if (((relation.type.id == 'author') || (relation.type.id == 'commentator') || (relation.type.id == 'reviewer')) && (!this.scalarTypes[relation.type.id])) {
			this.scalarTypes[relation.type.id] = scalarapi.model.scalarTypes[relation.type.id];
		}
	}
	
}

/**
 * Returns the display title of the node.
 *
 * @return	A string containing the node's display title.
 */
ScalarNode.prototype.getDisplayTitle = function( removeMarkup ) {

	var displayTitle = scalarapi.untitledNodeString;
	if (this.current) {
		if (this.current.title) {
			displayTitle = this.current.title;
		}
	} else if (this.title) {
		displayTitle = this.title;
	}
	
	if ( removeMarkup ) {
		displayTitle = scalarapi.removeMarkup( displayTitle );
	}
	
	// add parenthetical numbering if we suspect this media node is a duplicate
	/*if (this.baseType == 'http://scalar.usc.edu/2012/01/scalar-ns#Media') {
		var temp = this.slug.split('-');
		if (!isNaN(temp[temp.length-1])) {
			displayTitle += ' (' + temp[temp.length-1] +')';
		}
	}*/

	return displayTitle;
	
}

/**
 * Returns the sort title of the node.
 *
 * @return	A string containing the node's sort title.
 */
ScalarNode.prototype.getSortTitle = function() {
	var sortTitle = this.getDisplayTitle();
	if (sortTitle != scalarapi.untitledNodeString) {
		sortTitle = scalarapi.stripInitialNonAlphabetics(sortTitle);
	}
	return sortTitle;
}

/**
 * Returns the dominant Scalar type for the node.
 *
 * @return	A scalar type object representing the dominant type.
 */
ScalarNode.prototype.getDominantScalarType = function() {

	var dominantType = '';

	for (var prop in this.scalarTypes) {
	
		switch (prop) {
		
			// page and media only win if no other types are present
			case 'page':
			case 'media':
			if (dominantType == '') dominantType = this.scalarTypes[prop];
			break;
			
			// path always wins
			case 'path':
			dominantType = this.scalarTypes[prop];
			break;
			
			case 'reference':
			case 'referee':
			// ignore
			break;
			
			// anything else wins only over page and media
			default:
			if ((dominantType == '') || (dominantType.id == 'page') || (dominantType.id == 'media')) {
				dominantType = this.scalarTypes[prop];
			}
			break;
			
		}
	
	}

	return dominantType;
}

/**
 * Returns true if the node is of the Scalar type.
 *
 * @param {String} typeName		The name of the type to look for.
 * @return						A boolean indicating if the type is associated with the node.
 */
ScalarNode.prototype.hasScalarType = function(typeName) {
	return (this.scalarTypes[typeName] != undefined);
}

/**
 * Returns an array of nodes related to this node with the specified relation
 * type and in the specified direction.
 *
 * @param	type					The type of relation to look for.
 * @param	direction				The direction of the desired relations.
 * @param	includeNonPages			If true, results will include non-page content.
 * @return	Array of matching nodes.
 */
ScalarNode.prototype.getRelatedNodes = function(type, direction, includeNonPages) {

	var i;
	var n;
	var relation;
	var relations = [];
	var results = [];
	
	if (includeNonPages == undefined) includeNonPages = false;
	
	/*for (i=0; i<n; i++) {
		relation = scalarapi.model.relations[i];
		if (relation.type.id == type) {
			if ((direction == 'outgoing') && (relation.body == this)) {
				results.push(relation.target);
			} else if ((direction == 'incoming') && (relation.target == this)) {
				results.push(relation.body);
			}
		}
	}*/
	
	switch (direction) {
	
		case 'incoming':
		n = this.incomingRelations.length;
		for (i=0; i<n; i++) {
			relation = this.incomingRelations[i];
			if (relation.type.id == type) {
				if (includeNonPages || (!includeNonPages && relation.body.current && relation.target.current)) {
					relations.push(relation);
				}
			}
		}
		break;
		
		case 'outgoing':
		n = this.outgoingRelations.length;
		for (i=0; i<n; i++) {
			relation = this.outgoingRelations[i];
			if (relation.type.id == type) {
				if (includeNonPages || (!includeNonPages && relation.body.current && relation.target.current)) {
					relations.push(relation);
				}
			}
		}
		break;
	
	}
	
	relations.sort(function(a,b) {
		if (parseInt(a.index) < parseInt(b.index)) return -1;
		if (parseInt(a.index) > parseInt(b.index)) return 1;
	})
	
	n = relations.length;
	for (i=0; i<n; i++) {
		switch (direction) {
		
			case 'incoming':
			results.push(relations[i].body);
			break;
			
			case 'outgoing':
			results.push(relations[i].target);
			break;
			
		}
	}
	
	return results;
}

/**
 * Returns an array of relations with the specified relation type and direction.
 *
 * @param	type					The type of relation to look for.
 * @param	direction				The direction of the desired relations.
 * @param	sort					The relation property to use in sorting the results.
 * @param	includeNonPages			If true, results will include non-page content.
 * @return	Array of matching nodes.
 */
ScalarNode.prototype.getRelations = function(type, direction, sort, includeNonPages) {

	var i;
	var n;
	var relation;
	var results = [];
	
	if (includeNonPages == undefined) includeNonPages = false;
	
	switch (direction) {
	
		case 'incoming':
		n = this.incomingRelations.length;
		for (i=0; i<n; i++) {
			relation = this.incomingRelations[i];
			if (relation.type.id == type) {
				if (includeNonPages || (!includeNonPages && relation.body.current && relation.target.current)) {
					results.push(relation);
				}
			}
		}
		break;
		
		case 'outgoing':
		n = this.outgoingRelations.length;
		for (i=0; i<n; i++) {
			relation = this.outgoingRelations[i];
			if (relation.type.id == type) {
				if (includeNonPages || (!includeNonPages && relation.body.current && relation.target.current)) {
					results.push(relation);
				}
			}
		}
		break;
	
	}
	
	n = results.length;
	switch (sort) {
	
		case 'index':
		results.sort(function(a,b) {
			if (parseInt(a.index) < parseInt(b.index)) return -1;
			if (parseInt(a.index) > parseInt(b.index)) return 1;
		})
		break;
		
		case 'reverseindex':
		results.sort(function(a,b) {
			if (parseInt(a.index) > parseInt(b.index)) return -1;
			if (parseInt(a.index) < parseInt(b.index)) return 1;
		})
		break;
	
	}	
	
	return results;
}
	
/**
 * Creates a new ScalarVersion.
 * @constructor Represents a single version of a Scalar node.
 *
 * @param {Object} data					Data describing the version
 * @param {Object} node					The node this object is a version of.
 */
function ScalarVersion(data, node) {

	var me = this;
	
	this.auxProperties = {};
	
	this.parseData(data, node);
	
}

ScalarVersion.prototype.url = null;
ScalarVersion.prototype.data = null;
ScalarVersion.prototype.title = null;
ScalarVersion.prototype.description = null;
ScalarVersion.prototype.baseType = null;
ScalarVersion.prototype.content = null;
ScalarVersion.prototype.sourceFile = null;
ScalarVersion.prototype.mediaSource = null;
ScalarVersion.prototype.extension = null;
ScalarVersion.prototype.created = null;
ScalarVersion.prototype.isVersionOf = null;
ScalarVersion.prototype.number = null;
ScalarVersion.prototype.defaultView = null;
ScalarVersion.prototype.color = null;
ScalarVersion.prototype.properties = null;
ScalarVersion.prototype.auxProperties = null;

/**
 * Parses the data for the version, updating properties as needed.
 * @private
 *
 * @param {Object} data					Data describing the version.
 * @param {Object} node					The node this object is a version of.
 */
ScalarVersion.prototype.parseData = function(data, node) {

	this.data = data;
	this.url = data.url;
	
	// populate pre-approved properties
	var i,
		n = scalarapi.model.versionPropertyMap.length;
	var propertyData;
	for (i=0; i<n; i++) {
		propertyData = scalarapi.model.versionPropertyMap[i];
		if (data.json[propertyData.uri]) {
			if (propertyData.type == 'int') {
				this[propertyData.property] = parseInt(data.json[propertyData.uri][0].value);
			} else {
				this[propertyData.property] = data.json[propertyData.uri][0].value;
			}
		}
	}
	
	// populate auxiliary properties
	n = scalarapi.model.auxPropertyMap.length;
	for ( i = 0; i < n; i++ ) {
		propertyData = scalarapi.model.auxPropertyMap[i];
		if (data.json[propertyData.uri]) {
			if (propertyData.type == 'int') {
				this.auxProperties[propertyData.property] = parseInt(data.json[propertyData.uri][0].value);
			} else {
				this.auxProperties[propertyData.property] = data.json[propertyData.uri][0].value;
			}
		}
	}
	
	// store all properties by uri
	this.properties = {};
	var prop;
	for (prop in data.json) {
		this.properties[prop] = data.json[prop];
	}

	if (node.baseType == 'http://scalar.usc.edu/2012/01/scalar-ns#Media') {
	
		this.mediaSource = scalarapi.parseMediaSource(this.sourceFile);
		
		// if we couldn't parse the media type from the URL, look for dc:type
		if (this.mediaSource == scalarapi.mediaSources.Unsupported) {
			var dctype;
			if (this.properties['http://purl.org/dc/terms/type']) dctype = this.properties['http://purl.org/dc/terms/type'][0].value;
			if (dctype != undefined) {
				if (dctype.indexOf('image') != -1) {
					this.mediaSource = scalarapi.mediaSources.JPEG;
				} else if (dctype.indexOf('sound') != -1) {
					this.mediaSource = scalarapi.mediaSources.MP3;
				} else if (dctype.indexOf('text') != -1) {
					this.mediaSource = scalarapi.mediaSources.PlainText;
				}
			}
		}
		
	} else {
		this.mediaSource = scalarapi.mediaSources.HTML;
	}
	
}

/**
 * Parses all non-OA relations for the version. Must be run after
 * all nodes have been parsed to work correctly.
 * @private
 */
ScalarVersion.prototype.parseRelations = function() {

	var relation;
	var body;
	var target;
	
	var arr = this.data.json['http://purl.org/dc/terms/references'];
	if (arr) {
		n = arr.length;
		for (i=0; i<n; i++) {
			body = scalarapi.model.nodesByURL[this.isVersionOf];
			target = scalarapi.model.nodesByURL[arr[i].value];
			if (body && target) {
				relation = new ScalarRelation(null, body, target, scalarapi.model.relationTypes.referee);
				//scalarapi.model.relations.push(relation);
				scalarapi.model.relationsById[relation.id] = relation;
			}
		}
	}

	arr = this.data.json['http://purl.org/dc/terms/isReferencedBy'];
	if (arr) {
		n = arr.length;
		for (i=0; i<n; i++) {
			body = scalarapi.model.nodesByURL[arr[i].value];
			target = scalarapi.model.nodesByURL[this.isVersionOf];
			if (body && target) {
				relation = new ScalarRelation(null, body, target, scalarapi.model.relationTypes.referee);
				//scalarapi.model.relations.push(relation);
				scalarapi.model.relationsById[relation.id] = relation;
			}
		}
	}

}
	
/**
 * Creates a new ScalarRelation.
 * @constructor Represents a relation between two Scalar nodes. The structure of the object is
 * derived from the Open Annotation spec, but is used here to represent non-OA relations
 * within Scalar as well.
 *
 * @param {Object} json					OA-formatted JSON describing the relation.
 *										If this is specified, other parameters are ignored.
 * @param {Object} body					Body (source) node.
 * @param {Object} target				Target (destination) node.
 * @param {Object} type					Data describing the relation.
 */
function ScalarRelation(json, body, target, type) {

	this.properties = {};

	// parse OA-formatted JSON to create the relation
	if (json) {

		this.id = scalarapi.stripAllExtensions(json['http://www.openannotation.org/ns/hasBody'][0].value)+scalarapi.stripAllExtensions(json['http://www.openannotation.org/ns/hasTarget'][0].value);
		this.body = scalarapi.model.nodesByURL[scalarapi.stripVersion(json['http://www.openannotation.org/ns/hasBody'][0].value)];
		this.target = scalarapi.model.nodesByURL[scalarapi.stripVersion(scalarapi.stripAllExtensions(json['http://www.openannotation.org/ns/hasTarget'][0].value))];
		
		// parse the relation type and populate extents (if any)
		var anchorVars = scalarapi.getAnchorVars(json['http://www.openannotation.org/ns/hasTarget'][0].value);
		
		var temp;
		if (anchorVars == null) {
			this.type = scalarapi.model.relationTypes.tag;
		} else {
			
			for (var prop in anchorVars) {
				
				switch (prop) {
				
					case 't':
					
					// we use this construction here and below so that if the 'title' var
					// is specified first it won't get overwritten
					if (!this.type) this.type = scalarapi.model.relationTypes.annotation;
					
					temp = anchorVars[prop].slice(4).split(',');
					this.properties.start = parseFloat(temp[0]);
					this.properties.end = parseFloat(temp[1]);
					this.startString = scalarapi.decimalSecondsToHMMSS(this.properties.start);
					this.endString = scalarapi.decimalSecondsToHMMSS(this.properties.end);
					this.separator = ' - ';
					this.subType = 'temporal';
					this.index = this.properties.start;
					break;
					
					case 'line':
					if (!this.type) this.type = scalarapi.model.relationTypes.annotation;
					temp = anchorVars[prop].split(',');
					this.properties.start = parseInt(temp[0]);
					this.properties.end = parseInt(temp[1]);
					this.startString = 'Line '+this.properties.start;
					if (this.properties.start == this.properties.end) {
						this.separator = '';
						this.endString = '';
					} else {
						this.separator = ' - ';
						this.endString = this.properties.end;				
					}
					this.subType = 'textual';
					this.index = this.properties.start;
					break;
					
					case 'xywh':
					if (!this.type) this.type = scalarapi.model.relationTypes.annotation;
					temp = anchorVars[prop].split(',');
					this.properties.x = temp[0];
					this.properties.y = temp[1];
					this.properties.width = temp[2];
					this.properties.height = temp[3];
					this.startString = 'x:'+this.properties.x+' y:'+this.properties.y;
					if ((this.properties.width == 0) && (this.properties.height == 0)) {
						this.endString = '';
					} else {
						this.endString = 'w:'+this.properties.width+' h:'+this.properties.height;
					}
					this.separator = ' ';
					this.subType = 'spatial';
					this.index = parseFloat(this.properties.x) * parseFloat(this.properties.y);
					break;
					
					case 'index':
					if (!this.type) this.type = scalarapi.model.relationTypes.path;
					this.properties.index = parseInt(anchorVars[prop]);
					this.startString = 'Page '+this.properties.index;
					this.endString = '';
					this.separator = '';
					this.index = this.properties.index;
					break;
					
					case 'datetime':
					if (!this.type) this.type = scalarapi.model.relationTypes.comment;
					this.properties.datetime = anchorVars[prop];
					var date = new Date(this.properties.datetime);
					this.startString = date.toDateString();
					this.endString = '';
					this.separator = '';
					this.index = date.getTime();
					break;
					
					// explicitly specified title -- store
					case 'type':
					switch (anchorVars[prop]) {
					
						case 'commentary':
						this.type = scalarapi.model.relationTypes.commentary;
						break;
					
						case 'review':
						this.type = scalarapi.model.relationTypes.review;
						break;
						
					}
					break;
				
				}				
			
			}

		}
		
	// for relations that are specified directly instead of through OA-formatted JSON
	} else {
		this.body = body;
		this.target = target;
		this.id = this.body.url+this.target.url;
		if (type != undefined) {
			this.type = type;
		} else {
			this.type = scalarapi.model.relationTypes.unknown;
		}
	}
	
	if (this.body && this.target){
		this.body.addRelation(this);
		this.target.addRelation(this);
	}

}

ScalarRelation.prototype.id = null;
ScalarRelation.prototype.body = null;
ScalarRelation.prototype.target = null;
ScalarRelation.prototype.type = null;
ScalarRelation.prototype.subType = null;
ScalarRelation.prototype.properties = null;
ScalarRelation.prototype.index = null;
ScalarRelation.prototype.startString = null;
ScalarRelation.prototype.endString = null;
ScalarRelation.prototype.separator = null;

