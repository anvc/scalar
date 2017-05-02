<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?$this->template->add_css('system/application/views/widgets/ckeditor/custom.css')?>
<?$this->template->add_css('system/application/views/widgets/spectrum/spectrum.css')?>
<?$this->template->add_css('system/application/views/widgets/edit/content_selector.css')?>
<?$this->template->add_js('system/application/views/widgets/ckeditor/ckeditor.js')?>
<? $this->template->add_js('if ( window.CKEDITOR && ( !CKEDITOR.env.ie || CKEDITOR.env.version > 7 ) ){CKEDITOR.env.isCompatible = true;}','embed'); ?>
<?$this->template->add_js('system/application/views/widgets/edit/jquery-ui-custom/jquery-ui.min.js')?>
<?$this->template->add_js('system/application/views/widgets/edit/jquery.ui.touch-punch.min.js')?>
<?$this->template->add_js('system/application/views/widgets/edit/jquery.select_view.js')?>
<?$this->template->add_js('system/application/views/widgets/edit/jquery.add_metadata.js')?>
<?$this->template->add_js('system/application/views/widgets/edit/jquery.content_selector_bootstrap.js')?>
<?$this->template->add_js('system/application/views/widgets/edit/jquery.predefined.js')?>
<?$this->template->add_js('system/application/views/widgets/spectrum/spectrum.js')?>
<?$this->template->add_js('system/application/views/widgets/spinner/spin.min.js')?>