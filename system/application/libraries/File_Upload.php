<?php  if (!defined('BASEPATH')) exit('No direct script access allowed');

    class File_Upload {

    	const THUMB_WIDTH = 120;

        public function __construct() {

        }
        private function upload($tempFile,$targetFile,$chmodMode) {
            if (!move_uploaded_file($tempFile,$targetFile)) throw new Exception('Problem moving temp file. The file could be too large.');
            @chmod($targetFile, $chmodMode);
        }

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

        private function resize($targetFile,$width) {
            require confirm_slash(APPPATH).'libraries/wideimage/WideImage.php';
            WideImage::load($targetFile)->resize($width)->saveToFile($targetFile);
        }
    }
?>