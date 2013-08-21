<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
		
<? if (empty($book)): ?>
Please select a book to manage 
<? endif ?>		
		
<? 
if (!empty($book)): 
	$prefix = confirm_slash(base_url()).confirm_slash($book->slug).'rdf/';
	$load_short  = 'system/application/views/modules/dashboard/load_time_short.jpg';
	$load_medium = 'system/application/views/modules/dashboard/load_time_medium.jpg';
	$load_long   = 'system/application/views/modules/dashboard/load_time_long.jpg';
?>

<style>
table {margin-top:-10px;}
th {font-weight:bold; padding-top:16px;}
.load_time {height:10px;}
</style>

<p>Scalar offers an RDF-formatted API interface based on URLs &amp; GET variables for outside access to pages, media, and relationships.  
<ul>
<li>The API's RDF relationships follow the <a href="http://www.openannotation.org/spec/beta/">beta specification</a> (10 August 2011) of the <a href="http://openannotation.org/">Open Annotation Collaboration</a>.</li>
<li>If the book URL has not been made public (in the Book Properties tab), API URLs won't be available to external systems &mdash; login via the API is pending.</li>
<li>Some requests are more expensive than others, it is therefor recommended to use the request most specific to your requirements (returning all content with relationships can take several seconds).</li>
<li>GET VARS (e.g., "versions", "expand", "restrict_expand", "format") can be combined. For example, "format=json" can be combined with "expand=1" to return relationship results in RDF-JSON.</li>
<li>The URLs below are best viewed in Firefox (which has a built-in XML visualizer).</li>
<li>Also available is the <a target="_blank" href="http://scalar.usc.edu/tools/apiexplorer/">Scalar API Explorer</a>, an interactive tool to help you build API queries.</li>
</ul>
</p>

<table cellspacing="0" cellpadding="0">

<tr><th colspan="2">Book</th><th><small>Load time</small></th></tr>
<tr><td>All content:</td><td><a href="<?=$prefix?>"><?=$prefix?></a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>In RDF-JSON:</td><td><a href="<?=$prefix?>?format=json"><?=$prefix?>?format=json</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>In RDF-JSON, JSON-P:</td><td><a href="<?=$prefix?>?format=json&callback=parseResponse"><?=$prefix?>?format=json&callback=parseResponse</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>

<tr><th>Single content</th><th><small>URI-SEGMENT is the value listed in the URI field in the Pages and Media tabs</small></th><th><small>Load time</small></th></tr>
<tr><td>Single content:</td><td><?=$prefix?>node/<b>URI-SEGMENT</b></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>Single content w/ all versions:</td><td><?=$prefix?>node/<b>URI-SEGMENT</b>?versions=1</td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>Single content w/ relationships:</td><td><?=$prefix?>node/<b>URI-SEGMENT</b>?expand=1</td><td><?=img(array('src'=>$load_medium,'class'=>'load_time'))?></td></tr>
<tr><td>All content w/ limited rel. recursion:</td><td><?=$prefix?>node/<b>URI-SEGMENT</b>?restrict_expand=1</td><td><?=img(array('src'=>$load_medium,'class'=>'load_time'))?></td></tr>
<tr><td>In RDF-JSON:</td><td><?=$prefix?>node/<b>URI-SEGMENT</b>?format=json</td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>In RDF-JSON, JSON-P:</td><td><?=$prefix?>node/<b>URI-SEGMENT</b>?format=json&callback=parseResource</td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>Shortcut (RDF-XML):</td><td><?=confirm_slash(base_url()).confirm_slash($book->slug)?><b>URI-SEGMENT</b>.rdfxml</td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>Shortcut (RDF-JSON):</td><td><?=confirm_slash(base_url()).confirm_slash($book->slug)?><b>URI-SEGMENT</b>.rdfjson</td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>Shortcut (RDF-JSON, JSON-P):</td><td><?=confirm_slash(base_url()).confirm_slash($book->slug)?><b>URI-SEGMENT</b>.rdfjson?callback=parseResponse</td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>

<tr><th colspan="2">All content</th><th><small>Load time</small></th></tr>
<tr><td>All content:</td><td><a href="<?=$prefix?>instancesof/content"><?=$prefix?>instancesof/content</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>All content w/ all versions:</td><td><a href="<?=$prefix?>instancesof/content?versions=1"><?=$prefix?>instancesof/content?versions=1</a></td><td><?=img(array('src'=>$load_medium,'class'=>'load_time'))?></td></tr>
<tr><td>All content w/ relationships:</td><td><a href="<?=$prefix?>instancesof/content?expand=1"><?=$prefix?>instancesof/content?expand=1</a></td><td><?=img(array('src'=>$load_long,'class'=>'load_time'))?></td></tr>
<tr><td>In RDF-JSON:</td><td><a href="<?=$prefix?>instancesof/content?format=json"><?=$prefix?>instancesof/content?format=json</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>In RDF-JSON, JSON-P:</td><td><a href="<?=$prefix?>instancesof/content?format=json&callback=parseResponse"><?=$prefix?>instancesof/content?format=json&callback=parseResponse</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>

<tr><th colspan="2" style="color:#6e1d7d;">Pages</th><th><small>Load time</small></th></tr>
<tr><td>All pages:</td><td><a href="<?=$prefix?>instancesof/page"><?=$prefix?>instancesof/page</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>All pages w/ all versions:</td><td><a href="<?=$prefix?>instancesof/page?versions=1"><?=$prefix?>instancesof/page?versions=1</a></td><td><?=img(array('src'=>$load_medium,'class'=>'load_time'))?></td></tr>
<tr><td>All pages w/ relationships:</td><td><a href="<?=$prefix?>instancesof/page?expand=1"><?=$prefix?>instancesof/page?expand=1</a></td><td><?=img(array('src'=>$load_long,'class'=>'load_time'))?></td></tr>
<tr><td>In RDF-JSON:</td><td><a href="<?=$prefix?>instancesof/page?format=json"><?=$prefix?>instancesof/page?format=json</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>In RDF-JSON, JSON-P:</td><td><a href="<?=$prefix?>instancesof/page?format=json&callback=parseResponse"><?=$prefix?>instancesof/page?format=json&callback=parseResponse</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>

<tr><th colspan="2" style="color:#6e1d7d;">Media</th><th><small>Load time</small></th></tr>
<tr><td>All media:</td><td><a href="<?=$prefix?>instancesof/media"><?=$prefix?>instancesof/media</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>All media w/ all versions:</td><td><a href="<?=$prefix?>instancesof/media?versions=1"><?=$prefix?>instancesof/media?versions=1</a></td><td><?=img(array('src'=>$load_medium,'class'=>'load_time'))?></td></tr>
<tr><td>All media w/ relationships:</td><td><a href="<?=$prefix?>instancesof/media?expand=1"><?=$prefix?>instancesof/media?expand=1</a></td><td><?=img(array('src'=>$load_long,'class'=>'load_time'))?></td></tr>
<tr><td>In RDF-JSON:</td><td><a href="<?=$prefix?>instancesof/media?format=json"><?=$prefix?>instancesof/media?format=json</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>In RDF-JSON, JSON-P:</td><td><a href="<?=$prefix?>instancesof/media?format=json&callback=parseResponse"><?=$prefix?>instancesof/media?format=json&callback=parseResponse</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>

<tr><th colspan="2" style="color:#6e1d7d;">Categories</th><th><small>Load time</small></th></tr>
<tr><td>Reviews:</td><td><a href="<?=$prefix?>instancesof/review"><?=$prefix?>instancesof/review</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>Commentaries:</td><td><a href="<?=$prefix?>instancesof/commentary"><?=$prefix?>instancesof/commentary</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>

<tr><th colspan="2" style="color:#7d2d1d;">Ordered relationships (paths)</th><th><small>Load time</small></th></tr>
<tr><td>Path relationships:</td><td><a href="<?=$prefix?>instancesof/path"><?=$prefix?>instancesof/path</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>Relationships w/ all versions:</td><td><a href="<?=$prefix?>instancesof/path?versions=1"><?=$prefix?>instancesof/path?versions=1</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>Relationships w/ relationships (recursive):</td><td><a href="<?=$prefix?>instancesof/path?expand=1"><?=$prefix?>instancesof/path?expand=1</a></td><td><?=img(array('src'=>$load_long,'class'=>'load_time'))?></td></tr>
<tr><td>All content w/ relationships (1 rec. level) :</td><td><a href="<?=$prefix?>instancesof/path?restrict_expand=1"><?=$prefix?>instancesof/path?restrict_expand=1</a></td><td><?=img(array('src'=>$load_medium,'class'=>'load_time'))?></td></tr>
<tr><td>In RDF-JSON:</td><td><a href="<?=$prefix?>instancesof/path?format=json"><?=$prefix?>instancesof/path?format=json</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>In RDF-JSON, JSON-P:</td><td><a href="<?=$prefix?>instancesof/path?format=json&callback=parseResponse"><?=$prefix?>instancesof/path?format=json&callback=parseResponse</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>

<tr><th colspan="2" style="color:#7d2d1d;">Unordered relationships (tags)</th><th><small>Load time</small></th></tr>
<tr><td>Tag relationships:</td><td><a href="<?=$prefix?>instancesof/tag"><?=$prefix?>instancesof/tag</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>Relationships w/ all versions:</td><td><a href="<?=$prefix?>instancesof/tag?versions=1"><?=$prefix?>instancesof/tag?versions=1</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>Relationships w/ relationships (recursive):</td><td><a href="<?=$prefix?>instancesof/tag?expand=1"><?=$prefix?>instancesof/tag?expand=1</a></td><td><?=img(array('src'=>$load_long,'class'=>'load_time'))?></td></tr>
<tr><td>All content w/ relationships (1 rec. level) :</td><td><a href="<?=$prefix?>instancesof/tag?restrict_expand=1"><?=$prefix?>instancesof/tag?restrict_expand=1</a></td><td><?=img(array('src'=>$load_medium,'class'=>'load_time'))?></td></tr>
<tr><td>In RDF-JSON:</td><td><a href="<?=$prefix?>instancesof/tag?format=json"><?=$prefix?>instancesof/tag?format=json</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>In RDF-JSON, JSON-P:</td><td><a href="<?=$prefix?>instancesof/tag?format=json&callback=parseResponse"><?=$prefix?>instancesof/tag?format=json&callback=parseResponse</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>

<tr><th colspan="2" style="color:#7d2d1d;">Time-, line-, and spatial-based relationships (annotations)</th><th><small>Load time</small></th></tr>
<tr><td>Time/line/spacial relationships:</td><td><a href="<?=$prefix?>instancesof/annotation"><?=$prefix?>instancesof/annotation</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>Relationships w/ all versions:</td><td><a href="<?=$prefix?>instancesof/annotation?versions=1"><?=$prefix?>instancesof/annotation?versions=1</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>Relationships w/ relationships (recursive):</td><td><a href="<?=$prefix?>instancesof/annotation?expand=1"><?=$prefix?>instancesof/annotation?expand=1</a></td><td><?=img(array('src'=>$load_long,'class'=>'load_time'))?></td></tr>
<tr><td>All content w/ relationships (1 rec. level) :</td><td><a href="<?=$prefix?>instancesof/annotation?restrict_expand=1"><?=$prefix?>instancesof/annotation?restrict_expand=1</a></td><td><?=img(array('src'=>$load_medium,'class'=>'load_time'))?></td></tr>
<tr><td>In RDF-JSON:</td><td><a href="<?=$prefix?>instancesof/annotation?format=json"><?=$prefix?>instancesof/annotation?format=json</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>In RDF-JSON, JSON-P:</td><td><a href="<?=$prefix?>instancesof/annotation?format=json&callback=parseResponse"><?=$prefix?>instancesof/annotation?format=json&callback=parseResponse</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>

<tr><th colspan="2" style="color:#7d2d1d;">Response relationships (comments)</th><th><small>Load time</small></th></tr>
<tr><td>Comment relationships:</td><td><a href="<?=$prefix?>instancesof/reply"><?=$prefix?>instancesof/reply</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>Relationships w/ all versions:</td><td><a href="<?=$prefix?>instancesof/reply?versions=1"><?=$prefix?>instancesof/reply?versions=1</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>Relationships w/ relationships (recursive):</td><td><a href="<?=$prefix?>instancesof/reply?expand=1"><?=$prefix?>instancesof/reply?expand=1</a></td><td><?=img(array('src'=>$load_long,'class'=>'load_time'))?></td></tr>
<tr><td>All content w/ relationships (1 rec. level) :</td><td><a href="<?=$prefix?>instancesof/reply?restrict_expand=1"><?=$prefix?>instancesof/reply?restrict_expand=1</a></td><td><?=img(array('src'=>$load_medium,'class'=>'load_time'))?></td></tr>
<tr><td>In RDF-JSON:</td><td><a href="<?=$prefix?>instancesof/reply?format=json"><?=$prefix?>instancesof/reply?format=json</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>In RDF-JSON, JSON-P:</td><td><a href="<?=$prefix?>instancesof/reply?format=json&callback=parseResponse"><?=$prefix?>instancesof/reply?format=json&callback=parseResponse</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>

<tr><th colspan="2" style="color:#7d2d1d;">Reference relationships (HTML references another resource)</th><th><small>Load time</small></th></tr>
<tr><td>Reference relationships:</td><td><a href="<?=$prefix?>instancesof/reference"><?=$prefix?>instancesof/reference</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>Relationships w/ all versions:</td><td><a href="<?=$prefix?>instancesof/reference?versions=1"><?=$prefix?>instancesof/reference?versions=1</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>Relationships w/ relationships (recursive):</td><td><a href="<?=$prefix?>instancesof/reference?expand=1"><?=$prefix?>instancesof/reference?expand=1</a></td><td><?=img(array('src'=>$load_long,'class'=>'load_time'))?></td></tr>
<tr><td>All content w/ relationships (1 rec. level) :</td><td><a href="<?=$prefix?>instancesof/reference?restrict_expand=1"><?=$prefix?>instancesof/reference?restrict_expand=1</a></td><td><?=img(array('src'=>$load_medium,'class'=>'load_time'))?></td></tr>
<tr><td>In RDF-JSON:</td><td><a href="<?=$prefix?>instancesof/reference?format=json"><?=$prefix?>instancesof/reference?format=json</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>
<tr><td>In RDF-JSON, JSON-P:</td><td><a href="<?=$prefix?>instancesof/reference?format=json&callback=parseResponse"><?=$prefix?>instancesof/reference?format=json&callback=parseResponse</a></td><td><?=img(array('src'=>$load_short,'class'=>'load_time'))?></td></tr>


</table>

<? endif ?>