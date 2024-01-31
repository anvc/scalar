<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

class File_Upload {

    /**
     * Storage object used to store files.
     *
     * @var Scalar_Storage
     */
    public $storage;

    /**
     * Holds the book "slug" which is used for storing files in the appropriate folder.
     *
     * @var string
     */
    public $slug;

    const THUMB_WIDTH = 240;
    const PDF_URL = 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Pdf_by_mimooh.svg';
    const DOC_URL = 'https://upload.wikimedia.org/wikipedia/commons/8/88/MS_word_DOC_icon.svg';
    const FILE_NAME_NOT_ALLOWED = 'Can not upload a file with that filename. The filename contains protected characters, has a disallowed file extension, or has no file extension.';

    public function __construct($params) {
        $this->slug = $params['slug'];
        $this->storage = $this->getStorage($params['slug'], $params['adapter'], $params['adapterOptions']);
        $this->storage->setUp();
    }

    // Raises an exception if the file upload is invalid
    public function assertValidFileUpload($file) {
        if (empty($file)) {
            throw new Exception('File upload is missing.');
        }
        if (!$this->is_allowed($file['name'])) {
            throw new Exception(FILE_NAME_NOT_ALLOWED);
        }
    }

    // Upload media file and its thumbnail image
    public function uploadMedia($file, $versions = null, $base_uri = '') {
        $this->assertValidFileUpload($file);

        // check the path that is prepended to the source file name is valid (no prepend or "media")
        $path = @ $_POST['slug_prepend'];
        if (!in_array($path, array('', 'media'))) {
            throw new Exception("Invalid path prepend: $path");
        }

        // determine the file name to use, depending on whether the user is replacing an existing file or not
        $sourceFile = $file['tmp_name'];
        $sourceName = $file['name'];
        if (!empty($_POST['replace']) && !empty($versions)) {
            $arr = explode(':', $_POST['replace']);  // replace is an urn
            $version_id = array_pop($arr);
            $version = $versions->get($version_id, null, false);
            $sourceName = $version->url;
            if (!empty($base_uri) && substr($sourceName, 0, strlen($base_uri)) == $base_uri) $sourceName = substr($sourceName, strlen($base_uri));
            if (substr($sourceName, 0, 6) == 'media/') $sourceName = substr($sourceName, 6);  // Don't use ltrim() because of an apparent OS X bug (we have verifiable problems when a filename began with "em")
            if (!$this->is_allowed($sourceName)) {
                throw new Exception(FILE_NAME_NOT_ALLOWED);
            }
        }

        // upload thumb
        $thumbName = $this->getThumbName($sourceName);
        $thumbUrl = $this->uploadThumb($file, $thumbName);
        if (!$thumbUrl) {
            $thumbUrl = $this->getIconUrl($sourceFile);
        }

        // upload source
        $targetFile = "$path/$sourceName";
        $sourceUrl = $this->upload($sourceFile, $targetFile);

        return array('url' => $sourceUrl, 'thumbUrl' => $thumbUrl);
    }

    // Thumbnail for a page
    public function uploadPageThumb($file) {  // Note that this feature is offline for now, since the iframe method was causing logouts
        $this->assertValidFileUpload($file);
        $thumbName = $this->_getThumbName($file['name']);
        $thumbUrl = $this->uploadThumb($file, $thumbName);
        return $thumbUrl;
    }

    // Thumbnail for a book
    public function uploadBookThumb($file) {
        $this->assertValidFileUpload($file);
        $thumbName = "book_thumbnail." . $this->getFileExtension($file['name']);
        $thumbUrl = $this->uploadThumb($file, $thumbName);
        return $thumbUrl;
    }

    // Thumbnail for the publisher of the book
    public function uploadPublisherThumb($file) {
        $this->assertValidFileUpload($file);
        $thumbName = "publisher_thumbnail." . $this->getFileExtension($file['name']);
        $thumbUrl = $this->uploadThumb($file, $thumbName);
        return $thumbUrl;
    }

    // Upload a thumbnail
    private function uploadThumb($file, $thumbName) {
        $targetFile = "media/$thumbName";

        // upload the thumbnail
        try {
            $thumbFile = $this->resize($file['tmp_name'], self::THUMB_WIDTH);
            $thumbUrl = $this->upload($thumbFile, $targetFile);
            @unlink($thumbFile);
        } catch (Exception $e) {
            error_log($e->getMessage());
            return false;
        }

        return $thumbUrl;
    }

    // Upload the file given a temporary file (local) and a target path to a file, which may or may not be local
    private function upload($tempFile, $targetFile) {
        try {
            $this->storage->store($tempFile, $targetFile);
        } catch (Scalar_Storage_Exception $e) {
        	throw new Exception('Problem moving temp file. '.$e->getMessage().' The file is likely larger than the system\'s max upload size (' . $this->getMaximumFileUploadSize() . ').');
        }
        return $this->storage->getUri($targetFile);
    }

    // Disallow certain files
    private function is_allowed($file) {

        if (stristr($file, '../')) return false;
        if (stristr($file, './')) return false;
        if ('.' == substr($file, 0, 1)) return false;
        if ('google' == substr($file, 0, 6)) return false;
        if (preg_match('/[\'^£$%&}{<>]/', $file)) return false; // Control characters
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if (empty($ext)) return false; // Require a file extension
        if ('gif' == $ext || 'gif' == substr($ext, 0, 3)) return true;
        if ('kml' == $ext || 'kml' == substr($ext, 0, 3)) return true;
        if ('m4v' == $ext || 'm4v' == substr($ext, 0, 3)) return true;
        if ('mp3' == $ext || 'mp3' == substr($ext, 0, 3)) return true;
        if ('mp4' == $ext || 'mp4' == substr($ext, 0, 3)) return true;
        if ('pdf' == $ext || 'pdf' == substr($ext, 0, 3)) return true;
        if ('png' == $ext || 'png' == substr($ext, 0, 3)) return true;
        if ('jpg' == $ext || 'jpg' == substr($ext, 0, 3)) return true;
        if ('jpeg' == $ext || 'jpeg' == substr($ext, 0, 4)) return true;
        if ('txt' == $ext || 'txt' == substr($ext, 0, 3)) return true;
        if ('wav' == $ext || 'wav' == substr($ext, 0, 3)) return true;
        if ('3gp' == $ext || '3gp' == substr($ext, 0, 3)) return true;
        if ('aif' == $ext || 'aif' == substr($ext, 0, 3)) return true;
        if ('mov' == $ext || 'mov' == substr($ext, 0, 3)) return true;
        if ('oga' == $ext || 'oga' == substr($ext, 0, 3)) return true;
        if ('tif' == $ext || 'tif' == substr($ext, 0, 3)) return true;
        if ('webm' == $ext || 'webm' == substr($ext, 0, 4)) return true;
        if ('webp' == $ext || 'webp' == substr($ext, 0, 4)) return true;
        return false;

    }

    // Resizes an image returning a new file
    private function resize($file, $newwidth) {
        list($width, $height, $type) = getimagesize($file);
        if (!$width || !$height) throw new Exception('Image not of proper type');
        $r = $width / $height;
        $newheight = $newwidth / $r;
        switch ($type) {
            case 1:
                $src_im = imagecreatefromgif($file);
                break;
            case 2:
                $src_im = imagecreatefromjpeg($file);
                break;
            case 3:
                $src_im = imagecreatefrompng($file);
                break;
            case 18:
                $src_im = imagecreatefromwebp($file);
                break;
            default:
                throw new Exception('Image not of proper type');
        }

        $dst_im = imagecreatetruecolor($newwidth, $newheight);
        imagecopyresampled($dst_im, $src_im, 0, 0, 0, 0, $newwidth, $newheight, $width, $height);

        $resized_file = tempnam(sys_get_temp_dir(), 'scalarimage');
        switch ($type) {
            case 1:
                imagegif($dst_im, $resized_file);
                break;
            case 2:
                imagejpeg($dst_im, $resized_file);
                break;
            case 3:
                imagepng($dst_im, $resized_file);
                break;
            case 18:
                imagewebp($dst_im, $resized_file);
                break;
        }
        imagedestroy($dst_im); // free memory

        return $resized_file;
    }

    // Display formatted, e.g., max upload size
    private function convertPHPSizeToBytes($sSize) {  // http://stackoverflow.com/questions/13076480/php-get-actual-maximum-upload-size
        if (is_numeric($sSize)) {
            return $sSize;
        }
        $sSuffix = substr($sSize, -1);
        $iValue = substr($sSize, 0, -1);
        switch (strtoupper($sSuffix)) {
            case 'P':
                $iValue *= 1024;
            case 'T':
                $iValue *= 1024;
            case 'G':
                $iValue *= 1024;
            case 'M':
                $iValue *= 1024;
            case 'K':
                $iValue *= 1024;
                break;
        }
        return $iValue;
    }

    // Get the max upload size from PHP
    private function getMaximumFileUploadSize() {  // http://stackoverflow.com/questions/13076480/php-get-actual-maximum-upload-size
        $size = min($this->convertPHPSizeToBytes(ini_get('post_max_size')), $this->convertPHPSizeToBytes(ini_get('upload_max_filesize')));
        $base = log($size) / log(1024);
        $suffixes = array("", "k", "M", "G", "T");
        $suffix = $suffixes[floor($base)];
        return pow(1024, $base - floor($base)) . $suffix;
    }

    // Returns a filename with "_thumb" appended before the file extension
    private function getThumbName($filename) {
        return substr_replace($filename, "_thumb", strrpos($filename, "."), 0);
    }

    // Returns the lowercase file extension
    private function getFileExtension($filename) {
        $ext = pathinfo($filename, PATHINFO_EXTENSION);
        if ($ext === NULL) {
            $ext = '';
        }
        return strtolower($ext);
    }

    // Returns a URL to an icon based on a filename's extension
    private function getIconUrl($filename) {
        $ext = pathinfo($filename, PATHINFO_EXTENSION);
        if (!$ext) {
            return false;
        }
        switch (strtolower($ext)) {
            case 'pdf':
                return self::PDF_URL;
            case 'doc':
            case 'docx':
                return self::DOC_URL;
        }
        return false;
    }

    // Returns storage
    private function getStorage($bookSlug, $adapter, $adapterOptions) {
        require_once 'Scalar/Storage.php';
        return new Scalar_Storage(array(
            'folder' => $bookSlug,
            'adapter' => $adapter,
            'adapterOptions' => $adapterOptions,
        ));
    }
}

?>
