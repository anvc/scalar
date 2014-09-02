<?php  if (!defined('BASEPATH')) exit('No direct script access allowed');

	/**
	 * Requires Tinypass library
	 * @author Craig Dietrich
	 * @version 1.0
	 */

    class Tinypass_Helper {
    	
    	private $tinypass_lib_path;
    	private $sandbox;
    	private $aid;
    	private $private_key;
    	private $rid;
    	private $rname;
    	
        public function __construct($config) {

        	$this->tinypass_lib_path = dirname(__FILE__).'/tinypass/TinyPass.php';
        	$this->sandbox = $config['sandbox'];
        	$this->aid = $config['aid'];
        	$this->private_key = $config['private_key'];
        	$this->rid = $config['rid'];
        	$this->rname = $config['rname'];
        	
        	if (!file_exists($this->tinypass_lib_path)) throw new Exception("Can't find TinyPass library");
        	if (!isset($this->sandbox)) throw new Exception('Invalid Sandbox');
        	if (empty($this->aid)) throw new Exception('Invalid Account ID');
        	if (empty($this->private_key)) throw new Exception('Invalid Private Key');
        	if (empty($this->rid)) throw new Exception('Invalid Resource ID');
        	if (empty($this->rname)) throw new Exception('Invalid Resource Name');
        	
        }
        
        public function accessGranted() {

        	require_once $this->tinypass_lib_path;

			TinyPass::$SANDBOX = $this->sandbox;
			TinyPass::$AID = $this->aid;
			TinyPass::$PRIVATE_KEY = $this->private_key;
	
			$store = new TPAccessTokenStore();
			$store->loadTokensFromCookie($_COOKIE);
			$token = $store->getAccessToken($this->rid);
        	
			if($token->isAccessGranted()) {
			    return true;
			} else { 
				return false;
			}			
			
        }
        
        public function getHTML() {
        	
			$resource = new TPResource($this->rid, $this->rname);
			 
			// TODO: loop through $config['payment']
			$po1 = new TPPriceOption("1.00", "");
			$offer = new TPOffer($resource, array($po1));
			 
			$request = new TPPurchaseRequest($offer);
			$buttonHTML = $request->setCallback("myFunction")->generateTag();
			    
			return $buttonHTML;
        	
        }

    }

?>