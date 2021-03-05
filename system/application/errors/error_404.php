<html>
<head>
<title>404 Page Not Found</title>
<style type="text/css">
@import url(//fonts.googleapis.com/css?family=Lato:400,900,400italic,900italic);

body {
	margin: 0px 0px 0px 0px;
	font-family: 'Lato', Arial, sans-serif;
	color: #000000;
	font-size: 0.8em;
	background-color: #ffffff;
	background: url('<?=confirm_slash(base_url())?>/system/application/views/arbors/admin/images/background.png') no-repeat center top #f8f8f8;
}

.panel {
	background-color: white;
	border: solid 1px #e7e5e0;
	padding: 10px;
	margin-bottom: 6px;
}

.login_wrapper {
	font-family: 'Lato', Arial, sans-serif;
	width: 300px;
	position: absolute;
	top: 28px;
	left: 50%;
	margin-left: -150px;
	font-size: 100%;
}

.login_wrapper h4 {
	font-size:13px;
}

.login_header {
	vertical-align: middle;
	padding-bottom: 10px;
	text-align: center;
}

.login_footer {
	font-size: 12px;
	text-align: center;
	padding-top: 6px;
}
a {
	text-decoration: none;
	color: #026697;
}
.form_fields td {
	padding: 6px 10px 6px 10px;
}
</style>
</head>
<body>
<div class="system_wrapper">
	<div class="content">
		<div class="login_wrapper">
			<table class="panel form_fields">
				<tbody>
					<tr>
						<td class="login_header" colspan="2">
							<img src="<?=confirm_slash(base_url())?>/system/application/views/modules/login/scalar_logo.png" alt="Scalar logo" width="75" height="68">
							<h4><?php echo $heading; ?></h4>
							<?php echo $message; ?>
						</td>
					</tr>
				</tbody>
			</table>
			<div class="login_footer">
				<a href="<?=base_url()?>">Return to index</a> |
				<a href="http://scalar.usc.edu/terms-of-service/" target="_blank">Terms of Service</a>
			</div>
		</div>
		<br clear="both">
	</div>
	<br clear="both">
</div>
</html>
