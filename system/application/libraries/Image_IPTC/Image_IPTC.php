<?php

/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */

/**
 * Photo IPTC interface
 *
 * PHP versions 4 and 5
 *
 * LICENSE: This source file is subject to version 3.0 of the PHP license
 * that is available through the world-wide-web at the following URI:
 * http://www.php.net/license/3_0.txt.  If you did not receive a copy of
 * the PHP License and are unable to obtain it through the web, please
 * send a note to license@php.net so we can mail you a copy immediately.
 *
 * @category   Image
 * @package    Image_IPTC
 * @author     Patrick O'Lone <polone@townnews.com>
 * @copyright  1997-2005 The PHP Group
 * @license    http://www.php.net/license/3_0.txt  PHP License 3.0
 * @version    CVS: NITF.php,v 1.9 2005/03/21 18:07:19 polone Exp
 * @link       http://pear.php.net/package/Image_IPTC/
 */


/**
* An abstraction layer for working with IPTC fields
*
* This class encapsulates the functions iptcparse() and iptcembed(). It provides
* the necessary methods for extracting, modifying, and saving IPTC data with
* image files (JPEG and TIFF files only).
*
* @author Patrick O'Lone <polone@townnews.com>
* @copyright 2003-2004 TownNews.com
* @version $Revision$
*/
class Image_IPTC
{
	// {{{ Properties

    /**
    * @var string
    * The name of the image file that contains the IPTC fields to extract and
    * modify.
    * @see Image_IPTC()
    * @access private
    */
    var $_sFilename = null;

    /**
    * @var array
    * The IPTC fields that were extracted from the image or updated by this
    * class.
    * @see getAllTags(), getTag(), setTag()
    * @access private
    */
    var $_aIPTC = array();

    /**
    * @var boolean
    * The state of the getimagesize() function. If the parsing was successful,
    * this value will be set to true if the APP header data could be obtained.
    * @see isValid()
    * @access private
    */
    var $_bIPTCParse = false;

	// }}}
	// {{{ Image_IPTC()

    /**
    * Constructor
    *
    * @param string
    * The name of the image file to access and extract IPTC information from.
    *
    * @access public
    */
    function __construct( $sFilename )
    {
        $this->_sFilename = $sFilename;

        // Added by Craig Dietrich 8 March 2015 to add external check
		$isURL = filter_var($this->_sFilename, FILTER_VALIDATE_URL);
		$exists = false;
   		if ($isURL) {
   			$header_response = get_headers($this->_sFilename, 1);
   			if (false===strpos($header_response[0],"404")) $exists = true;
        } elseif (!$isURL && is_file($this->_sFilename)) {
        	$exists = true;
        }

        if ($exists) {

           if (@getimagesize($this->_sFilename, $aAPP) && !empty($aAPP['APP13'])) {

               $this->_aIPTC = @iptcparse($aAPP['APP13']);
               $this->_bIPTCParse = true;

           }

        }

    }

	// }}}
	// {{{ isValid()

    /**
    * Returns the status of IPTC parsing during instantiation
    *
    * You'll normally want to call this method before trying to change or
    * get IPTC fields.
    *
    * @return boolean
    * Returns true if the getimagesize() function successfully extracted APP
    * information from the supplied file
    *
    * @access public
    */
    function isValid()
    {
        return $this->_bIPTCParse;
    }

	// }}}
	// {{{ setTag()

    /**
     * Set IPTC fields to a specific value or values
     *
     * @param mixed The field (by number or string) of the IPTC data you wish to update
     * @param mixed If the value supplied is scalar, then the block assigned will be set to the given value. If the value supplied is an array, then the entire tag will be given the value of the array.
     * @param integer The block to update. Most tags only use the 0th block, but certain tags, like the "keywords" tag, use a list of values. If set to a negative value, the entire tag block will be replaced by the value of the second parameter.
     * @access public
     */
    function setTag( $xTag, $xValue, $nBlock = 0 )
    {
        $sTagName = $this->_lookupTag($xTag);

        if (($nBlock < 0) || is_array($xValue)) {

            $this->_aIPTC[$sTagName] = $xValue;

        } else {

            $this->_aIPTC[$sTagName][$nBlock] = $xValue;

        }
    }

	// }}}
	// {{{ getTag()

    /**
    * Get a specific tag/block from the IPTC fields
    *
    * @return mixed
    * If the requested tag exists, a scalar value will be returned. If the block
    * is negative, the entire
    *
    * @param mixed
    * The tag name (by number or string) to access. For a list of possible string
    * values look at the _lookupTag() method.
    *
    * @param integer
    * The block to reference. Most fields only have one block (the 0th block),
    * but others, like the "keywords" block, are an array. If you want
    * to get the whole array, set this to a negative number like -1.
    *
    * @see _lookupTag()
    * @access public
    */
    function getTag( $xTag, $nBlock = 0 )
    {
        $sTagName = $this->_lookupTag($xTag);

        if (isset($this->_aIPTC[$sTagName]) && is_array($this->_aIPTC[$sTagName])) {

            if ($nBlock < 0) {

                return $this->_aIPTC[$sTagName];

            }

			if (isset($this->_aIPTC[$sTagName][$nBlock])) {

                return $this->_aIPTC[$sTagName][$nBlock];

            }

        }

        return null;
    }

	// }}}
	// {{{ getAllTags()

    /**
    * Get a copy of all IPTC tags extracted from the image
    *
    * @return array
    * An array of IPTC fields as it extracted by the iptcparse() function
    *
    * @access public
    */
    function getAllTags()
    {
        return $this->_aIPTC;
    }

	// }}}
	// {{{ save()

    /**
    * Save the IPTC block to an image file
    *
    * @return boolean
    *
    * @param string
    * If supplied, the altered IPTC block and image data will be saved to another
    * file instead of the same file.
    *
    * @access public
    */
    function save( $sOutputFile = null )
    {
        if (empty($sOutputFile)) {

           $sOutputFile = $this->_sFilename;

        }

        $sIPTCBlock = $this->_getIPTCBlock();
        $sImageData = @iptcembed($sIPTCBlock, $this->_sFilename, 0);

        $hImageFile = @fopen($sOutputFile, 'wb');
        if (is_resource($hImageFile)) {

           flock($hImageFile, LOCK_EX);
           fwrite($hImageFile, $sImageData);
           flock($hImageFile, LOCK_UN);
           return fclose($hImageFile);

        }

        return false;
    }

	// }}}
	// {{{ output()

    /**
    * Embed IPTC data block and output to standard output
    *
    * @access public
    */
    function output()
    {
        $sIPTCBlock = $this->_getIPTCBlock();
        @iptcembed($sIPTCBlock, $this->_sFilename, 2);
    }

	// }}}
	// {{{ _lookupTag()

    /**
     * Return the numeric code of an IPTC field name
     *
     * @param string A field name representing the type of tag to return
     * @return integer Returns a numeric code corresponding to the name of the IPTC field that was supplied.
     * @access private
     */
    function _lookupTag( $sTag )
    {
        $nTag = -1;
        $sTag = strtolower(str_replace(' ','_',$sTag));

        switch($sTag) {

          case 'object_name':
             $nTag = 5;
             break;

          case 'edit_status':
             $nTag = 7;
             break;

          case 'priority':
             $nTag = 10;
             break;

          case 'category':
             $nTag = 15;
             break;

          case 'supplementary_category':
             $nTag = 20;
             break;

          case 'fixture_identifier':
             $nTag = 22;
             break;

          case 'keywords':
             $nTag = 25;
             break;

          case 'release_date':
             $nTag = 30;
             break;

          case 'release_time':
             $nTag = 35;
             break;

          case 'special_instructions':
             $nTag = 40;
             break;

          case 'reference_service':
             $nTag = 45;
             break;

          case 'reference_date':
             $nTag = 47;
             break;

          case 'reference_number':
             $nTag = 50;
             break;

          case 'created_date':
             $nTag = 55;
             break;

          case 'originating_program':
             $nTag = 64;
             break;

          case 'program_version':
             $nTag = 70;
             break;

          case 'object_cycle':
             $nTag = 75;
             break;

          case 'byline':
             $nTag = 80;
             break;

          case 'byline_title':
             $nTag = 85;
             break;

          case 'city':
             $nTag = 90;
             break;

          case 'province_state':
             $nTag = 95;
             break;

          case 'country_code':
             $nTag = 100;
             break;

          case 'country':
             $nTag = 101;
             break;

          case 'original_transmission_reference':
             $nTag = 103;
             break;

          case 'headline':
             $nTag = 105;
             break;

          case 'credit':
             $nTag = 110;
             break;

          case 'source':
             $nTag = 115;
             break;

          case 'copyright_string':
             $nTag = 116;
             break;

          case 'caption':
             $nTag = 120;
             break;

          case 'local_caption':
             $nTag = 121;
             break;

        }

        if ($nTag > 0) {

           return sprintf('2#%03d', $nTag);

        }

        return 0;
    }

	// }}}
	// {{{ _getIPTCBlock()

    /**
    * Generate an IPTC block from the current tags
    *
    * @return string
    * Returns a binary string that contains the new IPTC block that can be used
    * in the iptcembed() function call
    *
    * @access private
    */
    function &_getIPTCBlock()
    {
        $sIPTCBlock = null;

        foreach($this->_aIPTC as $sTagID => $aTag) {

            $sTag = str_replace('2#', null, $sTagID);
            for($ci = 0; $ci < sizeof($aTag); $ci++) {

                $nLen = strlen($aTag[$ci]);

                // The below code is based on code contributed by Thies C. Arntzen
                // on the PHP website at the URL: http://www.php.net/iptcembed

                $sIPTCBlock .= pack('C*', 0x1C, 2, $sTag);

                if ($nLen < 32768) {

                    $sIPTCBlock .= pack('C*', $nLen >> 8, $nLen & 0xFF);

                } else {

                    $sIPTCBlock .= pack('C*', 0x80, 0x04);
                    $sIPTCBlock .= pack('C', $nLen >> 24 & 0xFF);
                    $sIPTCBlock .= pack('C', $nLen >> 16 & 0xFF);
                    $sIPTCBlock .= pack('C', $nLen >> 8 & 0xFF);
                    $sIPTCBlock .= pack('C', $nLen & 0xFF);

                }

                $sIPTCBlock .= $aTag[$ci];
            }
        }

        return $sIPTCBlock;
    }

	// }}}

}

?>