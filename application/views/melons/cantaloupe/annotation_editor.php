
		<div class="annobuilder">
			<form action="<?=$base_uri.$page->slug?>" method="post">
				<input type="hidden" name="action" value="add" />
				<input type="hidden" name="native" value="1" />
				<input type="hidden" name="scalar:urn" value="" />
				<input type="hidden" name="id" value="<?=@$login->email?>" />
				<input type="hidden" name="api_key" value="" />
				<input type="hidden" name="scalar:child_urn" value="<?=$page->versions[$page->version_index]->urn?>" />
				<input type="hidden" name="scalar:child_type" value="http://scalar.usc.edu/2012/01/scalar-ns#Media" />
				<input type="hidden" name="scalar:child_rel" value="annotated" />
			</form>
		</div>
