<?php  if (!defined('BASEPATH')) exit('No direct script access allowed');

    class File_Upload {

    	const THUMB_WIDTH = 120;

        public function __construct() {}

        public function uploadMedia($slug,$chmodMode,$versions=null) {
            if (empty($_FILES)) throw new Exception('Could not find uploaded file');
            $path =@ $_POST['slug_prepend'];
            $targetPath = confirm_slash(FCPATH).$slug.$path;
            if (!file_exists($targetPath)) mkdir($targetPath, $chmodMode, true);
            $tempFile = $_FILES['source_file']['tmp_name'];
            $name = $_FILES['source_file']['name'];
            if (!empty($_POST['replace']) && !empty($versions)) {
                $version_id = array_pop(explode(':',$_POST['replace']));  // replace is an urn
                $version = $versions->get($version_id);
                $name = $version->url;
                if (substr($name, 0, 6)=='media/') $name = substr($name, 6);  // Don't use ltrim() because of an apparent OS X bug (we have verifiable problems when a filename began with "em")
            }
            $targetFile = rtrim($targetPath,'/') . '/' . $name;
            $this->upload($tempFile,$targetFile,$chmodMode);
            $url = ((!empty($path))?confirm_slash($path):'').$name;
            return $url;
        }

        public function createMediaThumb($slug, $url, $chmod_mode) {
        	if (empty($_FILES)) return false;  // Error thrown by uploadMedia
            $sourcePath = confirm_slash(FCPATH).$slug.$url;
            $targetPath = confirm_slash(FCPATH).$slug.$url;
            $sourceName = basename($sourcePath);
            $targetName = substr_replace($sourceName, "_thumb", strrpos($sourceName, "."),0);  // Don't depend on tmp_name because it could be changed by 'replace' feature
            $sourcePath = dirname($sourcePath).'/'.$sourceName;
            $targetPath = dirname($targetPath).'/'.$targetName;
            if (!file_exists($sourcePath)) throw new Exception('Problem creating thumbnail. Source file not found.');
            copy($sourcePath,$targetPath);
            chmod($targetPath, $chmod_mode);
            try {
                $this->resize($targetPath,self::THUMB_WIDTH);
            } catch (Exception $e) {
                unlink($targetPath);
                return false;
            }
            $path = substr($targetPath, (strpos($targetPath, $slug)+strlen($slug)));
            return $path;
        }

        public function uploadPageThumb($slug,$chmodMode) {
            if (empty($_FILES)) throw new Exception('Could not find uploaded file');
            $tempFile = $_FILES['source_file']['tmp_name'];
            $targetPath = confirm_slash(FCPATH).confirm_slash($slug).'media';
           	$name = $_FILES['source_file']['name'];
            $targetName = substr_replace($name, "_thumb", strrpos($name, "."),0);
            $targetFile = $targetPath.'/'.$targetName;
            $this->upload($tempFile,$targetFile,$chmodMode);
            $this->resize($targetFile,self::THUMB_WIDTH);
            return 'media/'.$targetName;
        }        
        
        public function uploadThumb($slug,$chmodMode) {
            if (empty($_FILES)) throw new Exception('Could not find uploaded file');
            $tempFile = $_FILES['upload_thumb']['tmp_name'];
            $targetPath = confirm_slash(FCPATH).confirm_slash($slug).'media';
            $ext = pathinfo($_FILES['upload_thumb']['name'], PATHINFO_EXTENSION);
            $targetName = 'book_thumbnail.'.strtolower($ext);
            $targetFile = $targetPath.'/'.$targetName;
            $this->upload($tempFile,$targetFile,$chmodMode);
            $this->resize($targetFile,self::THUMB_WIDTH);
            return 'media/'.$targetName;
        }

        public function uploadPublisherThumb($slug,$chmodMode) {
            if (empty($_FILES)) throw new Exception('Could not find uploaded file');
            $tempFile = $_FILES['upload_publisher_thumb']['tmp_name'];
            $targetPath = confirm_slash(FCPATH).confirm_slash($slug).'media';
            $ext = pathinfo($_FILES['upload_publisher_thumb']['name'], PATHINFO_EXTENSION);
            $targetName = 'publisher_thumbnail.'.strtolower($ext);
            $targetFile = $targetPath.'/'.$targetName;
            $this->upload($tempFile,$targetFile,$chmodMode);
            $this->resize($targetFile,self::THUMB_WIDTH);
            return 'media/'.$targetName;
        }

        private function upload($tempFile,$targetFile,$chmodMode) {
            if (!move_uploaded_file($tempFile,$targetFile)) throw new Exception('Problem moving temp file. The file is likely larger than the system\'s max upload size ('.$this->getMaximumFileUploadSize().').');
            @chmod($targetFile, $chmodMode);
        }

        private function resize($targetFile,$width) {
            require confirm_slash(APPPATH).'libraries/wideimage/WideImage.php';
            WideImage::load($targetFile)->resize($width)->saveToFile($targetFile);
        }

		private function convertPHPSizeToBytes($sSize)  {  // http://stackoverflow.com/questions/13076480/php-get-actual-maximum-upload-size
		    if ( is_numeric( $sSize) ) {
		   		return $sSize;
		    }
		    $sSuffix = substr($sSize, -1);
		    $iValue = substr($sSize, 0, -1);
		    switch(strtoupper($sSuffix)){
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

		private function getMaximumFileUploadSize()  {  // http://stackoverflow.com/questions/13076480/php-get-actual-maximum-upload-size
    		$size = min($this->convertPHPSizeToBytes(ini_get('post_max_size')), $this->convertPHPSizeToBytes(ini_get('upload_max_filesize')));
    		$base = log($size) / log(1024);
			$suffixes = array("", "k", "M", "G", "T");
			$suffix = $suffixes[floor($base)];
			return pow(1024, $base - floor($base)) . $suffix;
		}

    }
?>