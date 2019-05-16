<?php

/**
 * Local filesystem storage adapter.
 *
 * The default adapter; this stores files in the Scalar base directory as defined by
 * FCPATH (front controller path). This means it will create storage folders alongside
 * codeigniter.php, but can be set to point to a different path.
 *
 * @package Scalar\Storage\Adapter
 */
class Scalar_Storage_Adapter_Filesystem implements Scalar_Storage_Adapter_AdapterInterface {

    /**
     * Folder is where files are stored in $_localDir.
     *
     * @var string
     */
    private $_folder;

    /**
     * Local directory is where folders are created.
     *
     * @var string
     */
    private $_localDir;

    /**
     * Directory permissions assigned to directories via chmod().
     *
     * @var int
     */
    private $_dirMode = 0775;

    /**
     * File permissions assigned to "stored" files via chmod().
     *
     * @var int
     */
    private $_fileMode = 0664;

    /**
     * Set options for the storage adapter.
     *
     * Note that the only required option is "folder".
     *
     * @param array $options
     * @throws Scalar_Storage_Exception
     */
    public function __construct(array $options = array()) {

        foreach ($options as $key => $value) {
            switch ($key) {
                case 'localDir':
                    $this->_localDir = $value;
                    break;

                case 'dirMode':
                    $this->_dirMode = $value;
                    break;

                case 'fileMode':
                    $this->_fileMode = $value;
                    break;

                case 'folder':
                    $this->_folder = $value;
                    break;

                default:
                    throw new Scalar_Storage_Exception("Invalid option: '$key'");
                    break;
            }
        }

        // check that a valid local directory (absolute path) for file uploads has been provided
        if(!$this->_localDir) {
            $this->_localDir = FCPATH;
        }
        $this->_localDir = rtrim($this->_localDir, '/');

        // check that a valid folder has been provided
        if (empty($this->_folder)) {
            throw new Scalar_Storage_Exception("Folder name is required");
        }
    }

    /**
     * Creates the folder structure so that files can be stored there.
     *
     * @throws Scalar_Storage_Exception
     */
    public function setUp() {
        if(!is_dir($this->_localDir) || !is_writable($this->_localDir)) {
            throw new Scalar_Storage_Exception("Local dir '{$this->_localDir}' is not a writable directory");
        }

        $absPaths = array(
            "{$this->_localDir}/{$this->_folder}",
            "{$this->_localDir}/{$this->_folder}/media");

        foreach($absPaths as $absPath) {
            if(!is_dir($absPath)) {
                $this->_createDir($absPath);
                $this->_chmod($absPath);
            }
        }
    }

    /**
     * Removes the folder structure and any files within those folders.
     *
     * @throws Scalar_Storage_Exception
     */
    public function destroy() {
        $absPaths = array(
            "{$this->_localDir}/{$this->_folder}/media",
            "{$this->_localDir}/{$this->_folder}");

        foreach($absPaths as $absPath) {
            if(is_dir($absPath)) {
                $this->_deleteDir($absPath);
            }
        }
    }

    /**
     * Transfers stored files from one folder to another by renaming the original folder.
     *
     * @param string $destFolder
     * @return bool True if the rename was successful, false otherwise.
     * @throws Scalar_Storage_Exception
     */
    public function transferTo($destFolder)
    {
        if ($destFolder == $this->_folder) {
            return true;
        }

        $srcPath = "{$this->_localDir}/{$this->_folder}";
        if (!is_dir($srcPath)) {
            throw new Scalar_Storage_Exception("Unable to transfer {$this->_folder} because it does not exist.");
        }
        $destPath = "{$this->_localDir}/$destFolder";
        if (file_exists($destPath)) {
            throw new Scalar_Storage_Exception("Unable to transfer {$this->_folder} to $destFolder because it already exists.");
        }

        return $this->_rename($srcPath, $destPath);
    }

    /**
     * Check if the storage path is writable.
     *
     * @param string $path Storage path
     * @return bool True if files can be stored, otherwise False.
     */
    public function canStore($path) {
        $absPath = $this->_getAbsPath($path);
        return is_writable($absPath) ? true : false;
    }

    /**
     * Move a local file to "storage."
     *
     * @param string $source Local filesystem path to file.
     * @param string $dest Destination path in storage.
     * @throws Scalar_Storage_Exception
     */
    public function store($source, $dest) {
        $destAbsPath = $this->_getAbsPath($dest);
        $status = $this->_rename($source, $destAbsPath);
        if (!$status) {
            throw new Scalar_Storage_Exception('Unable to store file.');
        }
        $mode_changed = $this->_chmod($destAbsPath);
        if (!$mode_changed) {
            $file_mode_octal = decoct($this->_fileMode);
            throw new Scalar_Storage_Exception("Unable to set permissions on file to octal value $file_mode_octal");
        }
    }

    /**
     * Move a file between two storage locations.
     *
     * @param string $source Source storage path.
     * @param string $dest Destination storage path.
     * @throws Scalar_Storage_Exception
     */
    public function move($source, $dest) {
        $status = $this->_rename($this->_getAbsPath($source), $this->_getAbsPath($dest));
        if (!$status) {
            throw new Scalar_Storage_Exception('Unable to move file.');
        }
    }

    /**
     * Remove a "stored" file.
     *
     * @param string $path Storage path.
     * @throws Scalar_Storage_Exception
     */
    public function delete($path) {
        $absPath = $this->_getAbsPath($path);
        $status = @unlink($absPath);

        if (!$status) {
            if (file_exists($absPath)) {
                throw new Scalar_Storage_Exception('Unable to delete file.');
            } else {
                $this->_log("Scalar_Storage_Adapter_Filesystem: Tried to delete missing file '$path'.");
            }
        }
    }

    /**
     * Get a URI for a "stored" file.
     *
     * Note that for filesystem storage, it is assumed that the paths are relative
     * to the containing folder, which is why the folder is omitted from the URI.
     *
     * Example with files stored in folder "bookone":
     *
     *     bookone/media/book_thumbnail.jpg => media/book_thumbnail.jpg
     *     bookone/example.png              => example.jpg
     *
     * @param string $path Storage path
     * @return string URI
     */
    public function getUri($path) {
        return $path;
    }

    /**
     * Get the options used to initialize the storage adapter.
     *
     * @return array
     */
    public function getOptions() {
        return array(
            'localDir' => $this->_localDir,
            'folder' => $this->_folder,
            'dirMode' => $this->_dirMode,
            'fileMode' => $this->_fileMode
        );
    }

    /**
     * Set the path of the local directory where folders are stored.
     *
     * @param string $dir Absolute path to the local directory on the filesystem
     */
    public function setLocalDir($dir) {
        $this->_localDir = $dir;
    }

    /**
     * Sets the name of the folder where files should be stored.
     *
     * @param string $folder Name of the folder
     */
    public function setFolder($folder)
    {
        $this->_folder = $folder;
    }

    /**
     * Convert a "storage" path to an absolute filesystem path.
     *
     * @param string $path Storage path.
     * @return string Absolute local filesystem path.
     */
    protected function _getAbsPath($path) {
        return "{$this->_localDir}/{$this->_folder}/$path";
    }

    /**
     * Renames a file.
     *
     * @param string $source Path to source file
     * @param string $dest Path to destination file
     * @return bool
     * @throws Scalar_Storage_Exception
     */
    protected function _rename($source, $dest) {
        $destDir = dirname($dest);
        if (!is_writable($destDir)) {
            throw new Scalar_Storage_Exception("Destination is not writable: '$destDir'.");
        }
        return rename($source, $dest);
    }

    /**
     * Set the permissions of a directory or file using chmod().
     *
     * @param string $absPath Path to file
     * @return bool True if chmod was successful, otherwise False.
     * @throws Scalar_Storage_Exception
     */
    protected function _chmod($absPath) {
        if(!file_exists($absPath)) {
            throw new Scalar_Storage_Exception("Destination does not exist: '$absPath'");
        }
        $mode_changed = false;
        if(is_dir($absPath)) {
            $mode_changed = @chmod($absPath, $this->_dirMode);
        } else if(is_file($absPath)) {
            $mode_changed = @chmod($absPath, $this->_fileMode);
        }
        return $mode_changed;
    }

    /**
     * Creates a directory on the local filesystem.
     *
     * @param string $absPath Path to file
     * @throws Scalar_Storage_Exception
     */
    protected function _createDir($absPath) {
        if(!is_dir($absPath)) {
            $made = @mkdir($absPath, $this->_dirMode, true);
            if (!$made || !is_readable($absPath)) {
                throw new Scalar_Storage_Exception("Error making directory: $absPath");
            }
        }
    }

    /**
     * Deletes a directory and any files contained within.
     *
     * Throws an exception if any nested directories are found.
     *
     * This function is intentionally not recursive to limit the
     * potential damage if things go awry and contains extra logging
     *
     *
     * @param string $absPath Path to local directory
     * @return bool True if directory was removed, otherwise False.
     * @throws Scalar_Storage_Exception
     */
    protected function _deleteDir($absPath) {
        $this->_log("Preparing to delete dir '$absPath'");
        if(!$absPath || $absPath == "/") {
            throw new Scalar_Storage_Exception("Directory is invalid: '$absPath'");
        }

        // Collect list of files in the directory to delete (if any)
        $files_to_delete = array();
        foreach(scandir($absPath) as $file) {
            if($file != "." && $file != "..") {
                if(is_dir($file)) {
                    throw new Scalar_Storage_Exception("Cannot delete '$absPath' because it contains sub-directory '$file'");
                }
                $files_to_delete[] = "$absPath/$file";
            }
        }

        // Delete the individual files in the directory
        foreach($files_to_delete as $file) {
            $this->_log("Deleting file '$file'");
            $unlinked = @unlink($file);
            if(!$unlinked) {
                throw new Scalar_Storage_Exception("Failed to delete '$file'");
            }
        }

        // Lastly, remove the directory itself now that it is empty
        $this->_log("Deleting dir '$absPath'");
        $removed = @rmdir($absPath);
        if(!$removed) {
            throw new Scalar_Storage_Exception("Failed to delete dir '$absPath'");
        }

        return $removed;
    }

    /**
     * Logs a message.
     */
    protected function _log($message) {
        error_log($message);
    }
}
