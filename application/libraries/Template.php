<?php  if (!defined('BASEPATH')) exit('No direct script access allowed');
/**
 * CodeIgniter
 *
 * An open source application development framework for PHP 4.3.2 or newer
 *
 * @package CodeIgniter
 * @author  ExpressionEngine Dev Team
 * @copyright  Copyright (c) 2006, EllisLab, Inc.
 * @license http://codeigniter.com/user_guide/license.html
 * @link http://codeigniter.com
 * @since   Version 1.0
 * @filesource
 */
// --------------------------------------------------------------------

/**
 * CodeIgniter Template Class
 *
 * This class is and interface to CI's View class. It aims to improve the
 * interaction between controllers and views. Follow @link for more info
 *
 * @package		CodeIgniter
 * @author		Colin Williams
 * @subpackage	Libraries
 * @category	Libraries
 * @link		http://www.williamsconcepts.com/ci/libraries/template/index.html
 * @copyright  Copyright (c) 2008, Colin Williams.
 * @version 1.4.1
 *
 */
class Template {

   var $CI;
   var $config;
   var $template;
   var $master;
   var $regions = array(
      '_scripts' => array(),
      '_styles' => array(),
      '_meta' => array(),
      '_links' => array(),
      '_html' => array()
   );
   var $output;
   var $js = array();
   var $css = array();
   var $meta = array();
   var $link = array();
   var $html = array();
   var $block = array();
   var $parser = 'parser';
   var $parser_method = 'parse';
   var $parse_template = FALSE;

   /**
    * Constructor
    *
    * Loads template configuration, template regions, and validates existence of
    * default template
    *
    * @access	public
    */
   function __construct() {
      // Copy an instance of CI so we can use the entire framework.
      $this->CI =& get_instance();

      // Load the template config file and setup our master template and regions
      include(APPPATH.'config/template'. '.php');
      if (isset($template)) {
         $this->config = $template;
         $this->set_template($template['active_template']);
      }
   }

   // --------------------------------------------------------------------

   /**
    * Use given template settings
    *
    * @access  public
    * @param   string   array key to access template settings
    * @return  void
    */
   function set_template($group) {
      if (isset($this->config[$group])) {
         $this->template = $this->config[$group];
      } else {
         show_error('The "'. $group .'" template group does not exist. Provide a valid group name or add the group first.');
      }
      $this->initialize($this->template);
   }

      // --------------------------------------------------------------------

   /**
    * Set master template
    *
    * @access  public
    * @param   string   filename of new master template file
    * @return  void
    */
   function set_master_template($filename) {
      if (file_exists(APPPATH .'views/'. $filename) or file_exists(APPPATH .'views/'. $filename . '.php')) {
         $this->master = $filename;
      } else {
         show_error('The filename provided does not exist in <strong>'. APPPATH .'views</strong>. Remember to include the extension if other than ".php"');
      }
   }

   // --------------------------------------------------------------------

   /**
    * Dynamically add a template and optionally switch to it
    *
    * @access  public
    * @param   string   array key to access template settings
    * @param   array properly formed
    * @return  void
    */
   function add_template($group, $template, $activate = FALSE) {
      if ( ! isset($this->config[$group])) {
         $this->config[$group] = $template;
         if ($activate === TRUE) {
            $this->initialize($template);
         }
      } else {
         show_error('The "'. $group .'" template group already exists. Use a different group name.');
      }
   }

   // --------------------------------------------------------------------

   /**
    * Initialize class settings using config settings
    *
    * @access  public
    * @param   array   configuration array
    * @return  void
    */
   function initialize($props) {
      // Set master template
      if (isset($props['template'])
         && (file_exists(APPPATH .'views/'. $props['template']) or file_exists(APPPATH .'views/'. $props['template'] . '.php'))) {
         $this->master = $props['template'];
      } else {
         // Master template must exist. Throw error.
         show_error('Either you have not provided a master template or the one provided does not exist in <strong>'. APPPATH .'views</strong>. Remember to include the extension if other than ".php"');
      }

      // Load our regions
      if (isset($props['regions'])) {
         $this->set_regions($props['regions']);
      }

      // Set parser and parser method
      if (isset($props['parser'])) {
         $this->set_parser($props['parser']);
      }
      if (isset($props['parser_method'])) {
         $this->set_parser_method($props['parser_method']);
      }

      // Set master template parser instructions
      $this->parse_template = isset($props['parse_template']) ? $props['parse_template'] : FALSE;
   }

   // --------------------------------------------------------------------

   /**
    * Set regions for writing to
    *
    * @access  public
    * @param   array   properly formed regions array
    * @return  void
    */
   function set_regions($regions) {
      if (count($regions)) {
          // Commenting this out allows a hook to, e.g., add_js() and have it stick
          // Edited by Craig, 4 February 2017
          /*
         $this->regions = array(
            '_scripts' => array(),
            '_styles' => array(),
            '_meta' => array(),
            '_links' => array(),
            '_html' => array()
         );
         */
         foreach ($regions as $key => $region) {
            // Regions must be arrays, but we take the burden off the template
            // developer and insure it here
            if ( ! is_array($region)) {
               $this->add_region($region);
            } else {
               $this->add_region($key, $region);
            }
         }
      }
   }

   // --------------------------------------------------------------------

   /**
    * Dynamically add region to the currently set template
    *
    * @access  public
    * @param   string   Name to identify the region
    * @param   array Optional array with region defaults
    * @return  void
    */
   function add_region($name, $props = array()) {
      if ( ! is_array($props)) {
         $props = array();
      }

      if ( ! isset($this->regions[$name])) {
         $this->regions[$name] = $props;
      } else {
         // Commenting this out allows a hook to, e.g., add_js() and have it stick
         // Edited by Craig, 4 February 2017
         // show_error('The "'. $name .'" region has already been defined.');
      }
   }

   // --------------------------------------------------------------------

   /**
    * Empty a region's content
    *
    * @access  public
    * @param   string   Name to identify the region
    * @return  void
    */
   function empty_region($name) {
      if (isset($this->regions[$name]['content'])) {
         $this->regions[$name]['content'] = array();
      } else {
         show_error('The "'. $name .'" region is undefined.');
      }
   }

   // --------------------------------------------------------------------

   /**
    * Set parser
    *
    * @access  public
    * @param   string   name of parser class to load and use for parsing methods
    * @return  void
    */
   function set_parser($parser, $method = NULL) {
      $this->parser = $parser;
      $this->CI->load->library($parser);

      if ($method) {
         $this->set_parser_method($method);
      }
   }

   // --------------------------------------------------------------------

   /**
    * Set parser method
    *
    * @access  public
    * @param   string   name of parser class member function to call when parsing
    * @return  void
    */
   function set_parser_method($method) {
      $this->parser_method = $method;
   }

   // --------------------------------------------------------------------

   /**
    * Write contents to a region
    *
    * @access	public
    * @param	string	region to write to
    * @param	string	what to write
    * @param	boolean	FALSE to append to region, TRUE to overwrite region
    * @return	void
    */
   function write($region, $content, $overwrite = FALSE) {
      if (isset($this->regions[$region])) {
         if ($overwrite === TRUE) { // Should we append the content or overwrite it
            $this->regions[$region]['content'] = array($content);
         } else {
            $this->regions[$region]['content'][] = $content;
         }
      }

      // Regions MUST be defined
      else {
         show_error("Cannot write to the '{$region}' region. The region is undefined.");
      }
   }

   // --------------------------------------------------------------------

   /**
    * Write content from a View to a region. 'Views within views'
    *
    * @access	public
    * @param	string	region to write to
    * @param	string	view file to use
    * @param	array	variables to pass into view
    * @param	boolean	FALSE to append to region, TRUE to overwrite region
    * @return	void
    */
   function write_view($region, $view, $data = NULL, $overwrite = FALSE) {
      $args = func_get_args();

      // Get rid of non-views
      unset($args[0], $args[2], $args[3]);

      // Do we have more view suggestions?
      if (count($args) > 1) {
         foreach ($args as $suggestion) {
            if (file_exists(APPPATH .'views/'. $suggestion . '.php') or file_exists(APPPATH .'views/'. $suggestion)) {
               // Just change the $view arg so the rest of our method works as normal
               $view = $suggestion;
               break;
            }
         }
      }

      $content = $this->CI->load->view($view, $data, TRUE);
      $this->write($region, $content, $overwrite);
   }

   // --------------------------------------------------------------------

   /**
    * Parse content from a View to a region with the Parser Class
    *
    * @access  public
    * @param   string   region to write to
    * @param   string   view file to parse
    * @param   array variables to pass into view for parsing
    * @param   boolean  FALSE to append to region, TRUE to overwrite region
    * @return  void
    */
   function parse_view($region, $view, $data = NULL, $overwrite = FALSE) {
      $this->CI->load->library('parser');

      $args = func_get_args();

      // Get rid of non-views
      unset($args[0], $args[2], $args[3]);

      // Do we have more view suggestions?
      if (count($args) > 1) {
         foreach ($args as $suggestion) {
            if (file_exists(APPPATH .'views/'. $suggestion . '.php') or file_exists(APPPATH .'views/'. $suggestion)) {
               // Just change the $view arg so the rest of our method works as normal
               $view = $suggestion;
               break;
            }
         }
      }

      $content = $this->CI->{$this->parser}->{$this->parser_method}($view, $data, TRUE);
      $this->write($region, $content, $overwrite);
   }

   // --------------------------------------------------------------------

   /**
    * Block a resource from being added
    *
    * Added by Craig Dietrich, 10 September 2018
    *
    * @access  public
    * @param   string identifier to block
    * @param   string the array to remove from (js, css, meta, link)
    */
   function block($id, $from) {
      if (!isset($this->block[$from])) $this->block[$from] = array();
      $this->block[$from][] = $id;

      return TRUE;
   }

   /**
    * Dynamically include javascript in the template
    *
    * NOTE: This function does NOT check for existence of .js file
    *
    * @access  public
    * @param   string   script to import or embed
    * @param   string  'import' to load external file or 'embed' to add as-is
    * @param   boolean  TRUE to use 'defer' attribute, FALSE to exclude it
    * @return  TRUE on success, FALSE otherwise
    */
   function add_js($script, $type = 'import', $defer = FALSE) {
      $success = TRUE;
      $js = NULL;

      if (isset($this->block['js']) && in_array($script, $this->block['js'])) return FALSE;

      $this->CI->load->helper('url');

      switch ($type) {
         case 'import':
            $filepath = base_url() . $script;
            $js = '<script type="text/javascript" src="'. $filepath .'"';
            if ($defer) {
               $js .= ' defer="defer"';
            }
            $js .= "></script>\n";
            break;

         case 'embed':
            $js = '<script type="text/javascript"';
            if ($defer) {
               $js .= ' defer="defer"';
            }
            $js .= ">";
            $js .= $script;
            $js .= '</script>'."\n";
            break;

         default:
            $success = FALSE;
            break;
      }

      // Add to js array if it doesn't already exist
      if ($js != NULL && !in_array($js, $this->js)) {
         $this->js[] = $js;
         $this->write('_scripts', $js);
      }

      return $success;
   }

   // --------------------------------------------------------------------

   /**
    * Dynamically include CSS in the template
    *
    * NOTE: This function does NOT check for existence of .css file
    *
    * @access  public
    * @param   string   CSS file to link, import or embed
    * @param   string  'link', 'import' or 'embed'
    * @param   string  media attribute to use with 'link' type only, FALSE for none
    * @return  TRUE on success, FALSE otherwise
    */
   function add_css($style, $type = 'link', $media = FALSE) {
      $success = TRUE;
      $css = NULL;

      if (isset($this->block['css']) && in_array($style, $this->block['css'])) return FALSE;

      $this->CI->load->helper('url');
      $filepath = base_url() . $style;

      switch ($type) {
         case 'link':
            $css = '<link type="text/css" rel="stylesheet" href="'. $filepath .'"';
            if ($media) {
               $css .= ' media="'. $media .'"';
            }
            $css .= ' />'."\n";
            break;

         case 'import':
            $css = '<style type="text/css">@import url('. $filepath .');</style>';
            break;

         case 'embed':
            $css = '<style type="text/css">';
            $css .= $style;
            $css .= '</style>'."\n";
            break;

         default:
            $success = FALSE;
            break;
      }

      // Add to js array if it doesn't already exist
      if ($css != NULL && !in_array($css, $this->css)) {
         $this->css[] = $css;
         $this->write('_styles', $css);
      }

      return $success;
   }

   /**
    * Dynamically include <meta> in the template
    *
    * Added by Craig Dietrich, 1 May 2014
    *
    * @access  public
    * @param   string  value for the name="" attribute
    * @param   string  value for the content="" attribute
    * @return  TRUE on success, FALSE otherwise
    */
   function add_meta($name='', $content='') {
      $success = TRUE;
      $meta = NULL;

      if (isset($this->block['meta']) && in_array($name, $this->block['meta'])) return FALSE;

      $this->CI->load->helper('url');

     $meta = '<meta name="'.$name.'" content="'.$content.'">';

      if ($meta != NULL) {
         $this->meta[] = $meta;
         $this->write('_meta', $meta);
      }
      return $success;
   }

   /**
    * Dynamically include <link> in the template
    *
    * Added by Craig Dietrich, 4 January 2017
    *
    * @access  public
    * @param   string  value for the id="" attribute
    * @param   string  value for the href="" attribute
    * @return  TRUE on success, FALSE otherwise
    */
   function add_link($id='', $href='') {
      $success = TRUE;
      $link = NULL;

      if (isset($this->block['link']) && in_array($id, $this->block['link'])) return FALSE;

      $this->CI->load->helper('url');

      $link = '<link id="'.$id.'" href="'.$href.'">';

      if ($link != NULL) {
         $this->link[] = $link;
         $this->write('_links', $link);
      }
      return $success;
   }

   /**
    * Dynamically include HTML
    *
    * Added by Craig Dietrich, 3 April 2015
    *
    * @access  public
    * @param   string the HTML
    * @param   string to be placed into <div class="">
    * @return  TRUE on success, FALSE otherwise
    */
   function add_html($content='', $class='') {
      $success = TRUE;
      $html = NULL;

      $this->CI->load->helper('url');

      $html = '<div class="ci-template-html'.((!empty($class))?' '.$class:'').'">'.$content.'</div>'."\n";

      if ($html != NULL) {
         $this->html[] = $html;
         $this->write('_html', $html);
      }

      return $success;
   }

   /**
    * Render the master template or a single region
    *
    * @access	public
    * @param	string	optionally opt to render a specific region
    * @param	boolean	FALSE to output the rendered template, TRUE to return as a string. Always TRUE when $region is supplied
    * @return	void or string (result of template build)
    */

   function render($region = NULL, $buffer = FALSE, $parse = FALSE) {
      // Just render $region if supplied
      if ($region) { // Display a specific regions contents
         if (isset($this->regions[$region])) {
            $output = $this->_build_content($this->regions[$region]);
         } else {
            show_error("Cannot render the '{$region}' region. The region is undefined.");
         }
      }

      // Build the output array
      else {
         foreach ($this->regions as $name => $region) {
            $this->output[$name] = $this->_build_content($region);
         }

         if ($this->parse_template === TRUE or $parse === TRUE) {
            // Use provided parser class and method to render the template
            $output = $this->CI->{$this->parser}->{$this->parser_method}($this->master, $this->output, TRUE);

            // Parsers never handle output, but we need to mimick it in this case
            if ($buffer === FALSE) {
               $this->CI->output->set_output($output);
            }
         } else {
            // Use CI's loader class to render the template with our output array
            $output = $this->CI->load->view($this->master, $this->output, $buffer);
         }
      }

      return $output;
   }

   // --------------------------------------------------------------------

   /**
    * Load the master template or a single region
    *
    * DEPRECATED!
    *
    * Use render() to compile and display your template and regions
    */
    function load($region = NULL, $buffer = FALSE) {
       $region = NULL;
       $this->render($region, $buffer);
    }

   // --------------------------------------------------------------------

   /**
    * Build a region from its contents. Apply wrapper if provided
    *
    * @access	private
    * @param	string	region to build
    * @param	string	HTML element to wrap regions in; like '<div>'
    * @param	array	Multidimensional array of HTML elements to apply to $wrapper
    * @return	string	Output of region contents
    */
   function _build_content($region, $wrapper = NULL, $attributes = NULL) {
      $output = NULL;

      // Can't build an empty region. Exit stage left
      if ( ! isset($region['content']) or ! count($region['content'])) {
         return FALSE;
      }

      // Possibly overwrite wrapper and attributes
      if ($wrapper) {
         $region['wrapper'] = $wrapper;
      }
      if ($attributes) {
         $region['attributes'] = $attributes;
      }

      // Open the wrapper and add attributes
      if (isset($region['wrapper'])) {
         // This just trims off the closing angle bracket. Like '<p>' to '<p'
         $output .= substr($region['wrapper'], 0, strlen($region['wrapper']) - 1);

         // Add HTML attributes
         if (isset($region['attributes']) && is_array($region['attributes'])) {
            foreach ($region['attributes'] as $name => $value) {
               // We don't validate HTML attributes. Imagine someone using a custom XML template..
               $output .= " $name=\"$value\"";
            }
         }

         $output .= ">";
      }

      // Output the content items.
      foreach ($region['content'] as $content) {
         $output .= $content;
      }

      // Close the wrapper tag
      if (isset($region['wrapper'])) {
         // This just turns the wrapper into a closing tag. Like '<p>' to '</p>'
         $output .= str_replace('<', '</', $region['wrapper']) . "\n";
      }

      return $output;
   }

}
// END Template Class

/* End of file Template.php */
/* Location: ./application/libraries/Template.php */
