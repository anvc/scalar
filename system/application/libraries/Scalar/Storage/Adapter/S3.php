<?php

require_once APPPATH.'libraries/amazon-s3-php-class/S3.php';

/**
 * S3 Storage Adapter.
 *
 * Stores files in a single S3 bucket.
 *
 * Prerequisites:
 *
 *  - S3 Bucket created with public/read access to anonymous users.
 *  - AWS credentials configured with read/write access to the bucket.
 *
 * Assumptions:
 *
 *  - The AWS credentials will either be configured directly in local_settings.php, or will be obtained indirectly
 *    through the host machine's "instance profile".
 *  - The "folder" will be used as the top-level prefix for files in the bucket. This is generally assumed
 *    to be the name of the book.
 *
 * Additional Notes:
 *
 * - AWS limits accounts to 100 buckets, which is why all files are stored in one bucket instead of multiple buckets.
 *   See also: https://docs.aws.amazon.com/AmazonS3/latest/dev/BucketRestrictions.html
 * - Virtual host style URLs are used by default, since path-based URLs are being phased out
 *   (e.g. {bucket}.s3.amazonaws.com instead of s3.amazonaws.com/{bucket).
 * - S3 URLs can be customized CNAMEs provided the bucket name and CNAME are configured appropriately.
 *   Just set the "hostname" to use, otherwise it defaults to {bucket}.s3.amazonaws.com.
 *   See also: https://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html#VirtualHostingCustomURLs
 *
 */
class Scalar_Storage_Adapter_S3 implements Scalar_Storage_Adapter_AdapterInterface  {

    /**
     * Name of the bucket where files will be stored.
     *
     * @var string
     */
    private $_bucket;

    /**
     * Folder is the prefix used for object names (e.g. top-level folder in the bucket).
     *
     * @var string
     */
    private $_folder;

    /**
     * AWS Access Key ID.
     *
     * @var string
     */
    private $_awsAccessKey;
    /**
     * AWS Secret Key
     *
     * @var string
     */
    private $_awsSecretKey;

    /**
     * Endpoint that the S3 client should use when storing files in the S3 bucket.
     *
     * @var string
     */
    private $_endpoint;

    /**
     * Force SSL for URLs (defaults to false)
     *
     * @var string
     */
    private $_forceSSL;

    /**
     * The hostname to use for the S3 URLs.
     *
     * @var string
     */
    private $_hostname;

    /**
     * Holds instance of the S3 client library.
     *
     * @var S3
     */
    private $_s3;

    /**
     * Set options for the storage adapter.
     *
     * @param array $options
     * @throws Scalar_Storage_Exception
     */
    public function __construct(array $options = array()) {
        foreach ($options as $key => $value) {
            switch ($key) {
                case 'awsAccessKey':
                    $this->_awsAccessKey = $value;
                    break;

                case 'awsSecretKey':
                    $this->_awsSecretKey = $value;
                    break;

                case 'bucket':
                    $this->_bucket = $value;
                    break;

                case 'folder':
                    $this->_folder = $value;
                    break;

                case 'endpoint':
                    $this->_endpoint = $value;
                    break;

                case 'forceSSL':
                    $this->_forceSSL = $value;
                    break;

                case 'hostname':
                    $this->_hostname = $value;
                    break;

                default:
                    throw new Scalar_Storage_Exception("Invalid option: '$key'");
                    break;
            }
        }

        // check for AWS credentials
        if(empty($this->_awsAccessKey) && empty($this->_awsSecretKey)) {
            // try to get credentials from the instance
            $credentials = $this->_getInstanceCredentials();
            if($credentials) {
                $this->_awsAccessKey = $credentials[0];
                $this->_awsSecretKey = $credentials[1];
            } else {
                throw new Scalar_Storage_Exception("Failed to retrieve AWS credentials from instance metadata.");
            }
        } else if(empty($this->_awsAccessKey) || empty($this->_awsSecretKey)) {
            throw new Scalar_Storage_Exception("AWS access key and secret key are both required for S3 access.");
        }

        // check for required parameters
        if(empty($this->_bucket)) {
            throw new Scalar_Storage_Exception("Bucket name is required for S3");
        }
        if(empty($this->_folder)) {
            throw new Scalar_Storage_Exception("Folder name is required");
        }

        // assign defaults for optional parameters
        if(empty($this->_endpoint)) {
            $this->_endpoint = "s3.amazonaws.com";
        }
        if(empty($this->_hostname)) {
            $this->_hostname = "{$this->_bucket}.s3.amazonaws.com";
        }

        $this->_s3 = $this->_getS3Service();
        $this->_s3->setExceptions(true);
    }
    /**
     * Setup S3 bucket.
     *
     * Since the bucket should already be setup and configured with a public access policy,
     * this is a "no-op".
     *
     * @throws Scalar_Storage_Exception
     */
    public function setUp() {}

    /**
     * Removes all objects with the designated folder prefix.
     *
     * @throws Scalar_Storage_Exception
     */
    public function destroy() {
        try {
            $prefix = $this->_folder . '/';
            $objects_to_delete = $this->_s3->getBucket($this->_bucket, $prefix);
            $this->_log("Preparing to delete objects from S3 folder '{$this->_folder}'");
            $this->_log(var_export($objects_to_delete, 1));

            foreach($objects_to_delete as $key => $object) {
                $this->_log("Deleting S3 object: $key");
                $this->_s3->deleteObject($this->_bucket, $key);
            }

            $this->_log("Finished deleting objects.");
        } catch(S3Exception $e) {
            $this->_log($e->getMessage());
            throw new Scalar_Storage_Exception("Unable to delete objects in bucket.");
        }
    }

    /**
     * Transfers stored files from one folder to another.
     *
     * Since S3 has no concept of "renaming" folders, objects have to be copied one by one.
     * The end result is that the objects have the new key prefix.
     *
     * @param string $destFolder
     * @return bool True if the transfer was successful, false otherwise.
     * @throws Scalar_Storage_Exception
     */
    public function transferTo($destFolder) {
        try {
            $prefix = $this->_folder . '/';
            $objects_to_copy = $this->_s3->getBucket($this->_bucket, $prefix);
            $this->_log("Preparing to transfer S3 objects from folder '{$this->_folder}' to '$destFolder'");
            $this->_log(var_export($objects_to_copy, 1));

            foreach($objects_to_copy as $key => $object) {
                $destKey = $destFolder . '/' . substr($key, strlen($prefix));
                $this->_log("Copying object: $key => $destKey");
                $this->_s3->copyObject($this->_bucket, $key, $this->_bucket, $destKey);
                $this->delete($key);
            }

            $this->_log("Finished transfer.");
        } catch(S3Exception $e) {
            $this->_log($e->getMessage());
            throw new Scalar_Storage_Exception("Unable to transfer objects in bucket.");
        }

        return true;
    }
    /**
     * Check whether the adapter is set up correctly to be able to store files.
     *
     * @param string $path
     * @return bool
     */
    public function canStore($path) {
        // Try a HEAD request on the bucket to see if it exists and we have permission to access it.
        try {
            $result = $this->_s3->getObjectInfo($this->_bucket, '/');
        } catch(S3Exception $e) {
            $this->_log($e->getMessage());
            throw new Scalar_Storage_Exception("Error accessing S3 bucket {$this->_bucket}");
        }
        return $result ? true : false;
    }

    /**
     * Move a local file to "storage."
     *
     * @param string $source Local filesystem path to file.
     * @param string $dest Destination path.
     */
    public function store($source, $dest) {
        try {
            $acl = S3::ACL_PRIVATE; // bucket policy should override this to make the object publicly available
            $metaHeaders = array(); // optional x-amz-meta-* headers
            $contentType = mime_content_type($source); // ensure we set th correct mime type on the object
            $status = $this->_s3->putObjectFile($source, $this->_bucket, $this->_getObjectName($dest), $acl, $metaHeaders, $contentType);
        } catch(S3Exception $e) {
            $this->_log($e->getMessage());
            throw new Scalar_Storage_Exception('Unable to store file.');
        }
    }

    /**
     * Move a file between two storage locations.
     *
     * @param string $source Original storage path.
     * @param string $dest Destination storage path.
     */
    public function move($source, $dest) {
        try {
            $status = $this->_s3->copyObject($this->_bucket, $this->_getObjectName($source), $this->_bucket, $this->_getObjectName($dest));
        } catch(S3Exception $e) {
            $this->_log($e->getMessage());
            throw new Scalar_Storage_Exception('Unable to move file.');
        }
    }

    /**
     * Remove a "stored" file.
     *
     * @param string $path Storage path
     */
    public function delete($path) {
        try {
            $status = $this->_s3->deleteObject($this->_bucket, $this->_getObjectName($path));
        } catch(S3Exception $e) {
            $this->_log($e->getMessage());
            throw new Scalar_Storage_Exception('Unable to delete file.');
        }
    }

    /**
     * Get a URI for a "stored" file.
     *
     * @param string $path Storage path
     * @return string URI
     */
    public function getUri($path) {
        $objectName = $this->_getObjectName($path);
        $scheme = ($this->_forceSSL ? "https:" : "http:");
        $uri = "$scheme//{$this->_hostname}/$objectName";
        return $uri;
    }

    /**
     * Get an instance of the S3 library/service.
     *
     * @return S3
     */
    protected function _getS3Service() {
        return new S3($this->_awsAccessKey, $this->_awsSecretKey, false, $this->_endpoint);
    }

    /**
     * Get the full object name.
     *
     * @param $path Storage path
     * @return string
     */
    protected function _getObjectName($path) {
        return "{$this->_folder}/$path";
    }

    /**
     * Get the S3 endpoint (e.g. <bucket>.s3.amazonaws.com).
     *
     * @return string
     */
    protected function _getEndpoint() {
        return $this->_endpoint;
    }

    /**
     * Returns temporary AWS credentials from the EC2 instance using instance metadata.
     *
     * @returns array|bool False if unsuccessful, or an array with the key and secret.
     */
    protected function _getInstanceCredentials() {
        $credentials = false;
        $url = "http://169.254.169.254/latest/meta-data/identity-credentials/ec2/security-credentials/ec2-instance";
        $ctx = stream_context_create(array('http'=> array('timeout' => 1))); // ensure a quick timeout if this fails
        $output = file_get_contents($url, false, $ctx);
        if($output !== FALSE) {
            $data = json_decode($output);
            if(isset($data) && $data->AccessKeyId && $data->SecretAccessKey) {
                $credentials = array($data->AccessKeyId, $data->SecretAccessKey);
            }
        }
        return $credentials;
    }
    
    /**
     * Logs a message.
     */
    protected function _log($message) {
        error_log($message);
    }
}
