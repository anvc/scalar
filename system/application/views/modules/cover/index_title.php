<?if (!defined('BASEPATH')) exit('No direct script access allowed')?>
<?
$this->template->add_css(path_from_file(__FILE__).'title.css');

echo '<h2 class="title">Welcome to '.$cover_title.'.</h2>';
echo '<p>';
echo '<a href="http://scalar.usc.edu/scalar" target="_blank">More about Scalar</a> | ';
echo '<a href="http://scalar.usc.edu/works/guide" target="_blank">User\'s Guide</a> | ';
echo '<a href="http://scalar.usc.edu/scalar/showcase/" target="_blank">Featured projects</a>';
echo '</p>';
?>
