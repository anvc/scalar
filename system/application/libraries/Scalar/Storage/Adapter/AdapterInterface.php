<?php

interface Scalar_Storage_Adapter_AdapterInterface {

    /**
     * Set options for the storage adapter.
     *
     * @param array $options
     */
    public function __construct(array $options = array());

    /**
     * Follow any necessary steps to setup storage prior to use.
     *
     * For the filesystem adapter, this would include creating any directories
     * that did not exist. For S3, this may include creating a new bucket if it did not
     * exist.
     *
     * @throws Scalar_Storage_Exception
     */
    public function setUp();

    /**
     * Follow any necessary steps to destroy storage.
     *
     * For the filesystem adapter, this would include removing directories and their contents.
     * For S3, this may include removing a bucket.
     *
     * Note: this method should be used with care!
     *
     * @throws Scalar_Storage_Exception
     */
    public function destroy();

    /*
     * Perform a transfer of an indeterminate number of files from the currently-set folder
     * to another folder.
     *
     * For the filesystem adapter, this may include renaming a directory on the filesystem.
     * For S3, this may include creating a new bucket and copying all of the files to it, and deleting the old bucket.
     *
     * @param string $folder The destination folder.
     */
    public function transferTo($destFolder);

    /**
     * Check whether the adapter is set up correctly to be able to store files.
     *
     * @param string $path
     * @return bool
     */
    public function canStore($path);

    /**
     * Move a local file to "storage."
     *
     * @param string $source Local filesystem path to file.
     * @param string $dest Destination path.
     */
    public function store($source, $dest);

    /**
     * Move a file between two storage locations.
     *
     * @param string $source Original storage path.
     * @param string $dest Destination storage path.
     */
    public function move($source, $dest);

    /**
     * Remove a "stored" file.
     *
     * @param string $path Storage path
     */
    public function delete($path);

    /**
     * Get a URI for a "stored" file.
     *
     * @param string $path Storage path
     * @return string URI
     */
    public function getUri($path);
}