<?php
/**
 * @projectDescription		RDF API controller for displaying RDF graphs based on REST (GET) queries
 * @return					On success outputs RDF-JSON or RDF-XML; errors are processed as HTTP response codes
 * @author					Craig Dietrich
 * @version					3.0
 */

class Rdf extends MY_Controller {
	
	/**
	 * URL information and load the current book
	 */
	
	public function __construct() {
		
		parent::__construct();
		$this->load->model( 'book_model', 'books' );
		$this->load->model( 'page_model', 'pages' );
		$this->load->model( 'version_model', 'versions' );
		$this->load->model( 'reference_model', 'references' );
		$this->load->model( 'annotation_model', 'annotations' );
		$this->load->model( 'path_model', 'paths' );
		$this->load->model( 'tag_model', 'tags' );
		$this->load->model( 'reply_model', 'replies' );	
		$this->load->library( 'RDF_Object', 'rdf_object' );	
		$this->load->library( 'statusCodes' );
		$this->load->helper( 'inflector' );
		$this->models = $this->config->item('rel');
		
		// Determine the current book being asked for (if applicable)
		$this->scope = (strtolower(get_class($this)) == strtolower($this->uri->segment('1'))) ? null : strtolower($this->uri->segment('1'));
		if (empty($this->scope)) {  // TODO: For now, don't allow queries across all books
			header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_UNAUTHORIZED));  
			exit;
		}
		// Load book beind asked for (if applicable)
		$this->data['book'] = (!empty($this->scope)) ? $this->books->get_by_slug($this->scope) : null;
		if (empty($this->data['book'])) {  // Book couldn't be found
			header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_NOT_FOUND));  
			exit;			
		}
		// Protect book; TODO: provide api_key authentication like api.php
		$this->set_user_book_perms(); 
		if (!$this->data['book']->url_is_public && !$this->login_is_book_admin('reader')) {
			header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_NOT_FOUND));  
			exit;				
		};
		// Format (e.g., 'xml', 'json')
		$allowable_formats = array('xml'=>'xml', 'json'=>'json','rdfxml'=>'xml','rdfjson'=>'json');
		$this->data['format'] = (isset($_REQUEST['format']) && array_key_exists($_REQUEST['format'],$allowable_formats)) ? $allowable_formats[$_REQUEST['format']] : $allowable_formats[key($allowable_formats)];
		$ext = get_ext($this->uri->uri_string());
		$this->data['format'] = (!empty($ext) && array_key_exists($ext,$allowable_formats)) ? $allowable_formats[$ext] : $this->data['format'];
		// Recursion level
		$this->data['recursion'] = (isset($_REQUEST['rec']) && is_numeric($_REQUEST['rec'])) ? (int) $_REQUEST['rec'] : 0;
		// Display references?
		$this->data['references'] = (isset($_REQUEST['ref']) && $_REQUEST['ref']) ? true : false;
		// Restrict relationships to a certain relationship?
		$this->data['restrict'] = (isset($_REQUEST['res']) && in_array(plural(strtolower($_REQUEST['res'])), $this->models)) ? (string) plural(strtolower($_REQUEST['res'])) : null;		
		// Display all versions?	
		$this->data['versions'] = (isset($_REQUEST['versions']) && $_REQUEST['versions']) ? true : false;		
		// Base URI (require a book to be present)
		$this->data['base_uri'] = confirm_slash(base_url()).confirm_slash($this->data['book']->slug);
		
	}
	
	/**
	 * Output information about the book including table of contents
	 */
	
	public function index() {
		
		if (empty($this->data['book'])) {
			header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_NOT_FOUND));
			exit;
		}
		try {		
			$this->rdf_object->book(
									$this->data['content'], 
									$this->data['book'], 
									$this->users->get_all($this->data['book']->book_id, true), 
									$this->data['base_uri']
								   );
			$this->rdf_object->serialize($this->data['content'], $this->data['format']);					   
		} catch (Exception $e) {
			throw new Exception(StatusCodes::httpHeaderFor(StatusCodes::HTTP_INTERNAL_SERVER_ERROR));
		}
		$this->template->set_template('blank');
		$this->template->write_view('content', 'modules/data/'.$this->data['format'], $this->data);
		$this->template->render();		
		
	}
	
	/**
	 * Output information about a page
	 */
	
	public function node() {

		if (empty($this->data['book'])) {
			header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_NOT_FOUND));
			exit;
		}
		try {	
			$slug = implode('/',array_slice($this->uri->segments, array_search(__FUNCTION__, $this->uri->segments)));
			$slug = no_version(no_ext(str_replace($this->data['book']->slug.'/', '', $slug))); 
			$content = $this->pages->get_by_slug($this->data['book']->book_id, $slug);
			if (empty($content)) {
				// Don't throw an error here, let through to return empty RDF			
			}
			if (!empty($content) && !$content->is_live && !$this->login_is_book_admin($this->data['book']->book_id)) $content = null; // Protect				
			$this->rdf_object->index(
			                         $this->data['content'], 
			                         $this->data['book'], 
			                         $content, 
			                         $this->data['base_uri'],
			                         $this->data['restrict'],
			                         RDF_Object::REL_ALL,
			                         (($this->data['versions'])?RDF_Object::VERSIONS_ALL:RDF_Object::VERSIONS_MOST_RECENT),
			                         (($this->data['references'])?RDF_Object::REFERENCES_ALL:RDF_Object::REFERENCES_NONE),
			                         $this->data['recursion']
			                        );
			$this->rdf_object->serialize($this->data['content'], $this->data['format']);
		} catch (Exception $e) {
			header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_INTERNAL_SERVER_ERROR));
			exit;
		}		
		$this->template->set_template('blank');
		$this->template->write_view('content', 'modules/data/'.$this->data['format'], $this->data);
		$this->template->render();			
		
	} 
	
	/**
	 * Output information about a group of pages based on class name
	 */
	
	public function instancesof($class='') {

		try {
			$class = no_ext($class);
			$type = $category = null;
			$rel = RDF_Object::REL_CHILDREN_ONLY;
			switch ($class) {
				case 'content':			
					$model = 'pages';
 					break;								
				case 'page':
				case 'composite':
					$model = 'pages';
					$type = 'composite';		
					break;
				case 'file':
				case 'media':
					$model = 'pages';
					$type = 'media';
					break;
 				case 'review':
				case 'commentary':	
					$model = 'pages';
 					$category = $class;
 					break;						
				case 'annotation':
				case 'reply':
				case 'tag':
				case 'path':
				case 'reference':
					$this->load->model($class.'_model', plural($class));
					$model = plural($class);
					break;
				default:
					header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_NOT_FOUND));  
					exit;		
			}
			$content = $this->$model->get_all($this->data['book']->book_id, $type, $category, true);
			$this->rdf_object->index(
			                         $this->data['content'], 
			                         $this->data['book'], 
			                         $content, 
			                         $this->data['base_uri'],
			                         $this->data['restrict'],
			                         $rel,
			                         (($this->data['versions'])?RDF_Object::VERSIONS_ALL:RDF_Object::VERSIONS_MOST_RECENT),
			                         (($this->data['references'])?RDF_Object::REFERENCES_ALL:RDF_Object::REFERENCES_NONE),
			                         $this->data['recursion']
			                        );
			$this->rdf_object->serialize($this->data['content'], $this->data['format']);			
		} catch (Exception $e) {
			header(StatusCodes::httpHeaderFor(StatusCodes::HTTP_INTERNAL_SERVER_ERROR));
			exit;
		}
		
		$this->template->set_template('blank');
		$this->template->write_view('content', 'modules/data/'.$this->data['format'], $this->data);
		$this->template->render();	

	}

} 
?>
