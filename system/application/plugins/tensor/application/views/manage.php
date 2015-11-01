<div id="loading"><div>Loading</div></div>

<div class="container-fluid">

	<div class="sheet row">
		<div id="spreadsheet" class="spreadsheet col-lg-9 col-md-9 col-sm-9 col-xs-9">
			<div id="spreadsheet_gradient"></div>
			<div id="collection_bar">
				<div class="l">
					<div class="btn-group" role="group" id="collection_view">
					  <button type="button" class="btn btn-primary btn-xs" value="view"><span class="glyphicon glyphicon-list"></span> View collection</button>
					  <button type="button" class="btn btn-default btn-xs" value="edit"><span class="glyphicon glyphicon-plus"></span> Add / remove items</button>
					</div>
				</div>
				<div class="r">
					<button class="btn btn-xs" id="edit_collection_link" data-toggle="modal" data-target="#edit_collection">Edit</button>
					<button class="btn btn-xs" id="delete_collection_link">Delete</button>
				</div>
				<div class="m"></div>
			</div>
			<div id="spreadsheet_content"></div>
		</div><!-- spreadsheet -->
		<div class="collections col-lg-3 col-md-3 col-sm-3 col-xs-3">
			<div>
			  <form id="filter_collections_form">
			    <div class="right-inner-addon">
			      <input name="search" class="form-control" placeholder="Filter Collections" />
			      <a href="javascript:void(null);" class="glyphicon glyphicon-search"></a>
			    </div>
			  </form>
			  <div class="advanced">Collections<a href="javascript:void(null);" id="advanced_collections_link"><span class="glyphicon glyphicon glyphicon-cog" aria-hidden="true"></span> Manage Collections</a></div>
			  <form id="collections_form">
			    <div class="notice"><a href="javascript:void(null);" data-toggle="modal" data-target="#create_collection"><span class="glyphicon glyphicon-plus"></span> Create a New Collection</a></div>
				<div class="collection all">
					<div class="color" style="background-color:#ffffff;"></div>
					<h5>All imported media</h5>
				    <div class="desc">View all media imported from the search screen</div>
				</div>
			  </form>
			</div>
		</div><!-- /collections -->
	</div><!-- /sheet -->

</div><!-- /container -->

<div id="footer" class="footer-center">
	<div class="btn-group view-buttons" role="group">
		<a class="page prev-page"><span class="glyphicon glyphicon-chevron-left"></span> Page <span class="num"></span></a>
		<button type="button" class="btn btn-xs btn-primary" id="icon"><img src="<?php echo base_url().APPPATH ?>views/images/icon_icon.jpg" />Icon</button>
	  	<button type="button" class="btn btn-xs btn-default" id="tile"><img src="<?php echo base_url().APPPATH ?>views/images/tile_icon.jpg" />Tile</button>
	  	<button type="button" class="btn btn-xs btn-default" id="list"><img src="<?php echo base_url().APPPATH ?>views/images/list_icon.jpg" />List</button>
	  	<button type="button" class="btn btn-xs btn-default" id="detail"><img src="<?php echo base_url().APPPATH ?>views/images/detail_icon.jpg" />Detail</button>
	  	<a class="page next-page">Page <span class="num"></span> <span class="glyphicon glyphicon-chevron-right"></span></a>
	</div>
	<div class="left-buttons">
	  	<button id="pegboard_link" type="button" class="btn btn-xs btn-default" data-toggle="modal"><span class="glyphicon glyphicon-search" aria-hidden="true"></span>&nbsp; Search archives</button>
	  	&nbsp; &nbsp;<b class="num_results">0</b> results
	</div>
	<div class="right-buttons">
	    <b class="num_imported">0</b> imported&nbsp; &nbsp;
		<button id="manage_link" type="button" class="btn btn-xs btn-primary" data-toggle="modal"><span class="glyphicon glyphicon-book" aria-hidden="true"></span>&nbsp; Manage content</button>
	</div>
</div>

<div class="modal fade" id="create_collection">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">Create Collection</h4>
      </div>
      <div class="modal-body">
        <form id="create_collection_form">
		  <div class="form-group">
		    <label>Title</label>
		    <input type="text" class="form-control" name="title" placeholder="My new collection">
		  </div>
		  <div class="form-group">
		    <label>Description</label>
		    <input type="text" class="form-control" name="description" placeholder="A collection of imported media">
		  </div>
		  <div class="form-group">
		  	<label>Color</label><br />
		  	<input type="text" name="color">
		  </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary">Create collection</button>
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->

<div class="modal fade" id="edit_collection">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">Edit Collection</h4>
      </div>
      <div class="modal-body">
        <form id="create_collection_form">
		  <div class="form-group">
		    <label>Title</label>
		    <input type="text" class="form-control" name="title" placeholder="My new collection">
		  </div>
		  <div class="form-group">
		    <label>Description</label>
		    <input type="text" class="form-control" name="description" placeholder="A collection of imported media">
		  </div>
		  <div class="form-group">
		  	<label>Color</label><br />
		  	<input type="text" name="color">
		  </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary">Save collection</button>
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->

<div class="modal fade" id="error">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
        <h4 class="modal-title">Error</h4>
      </div>
      <div class="modal-body"></div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->
