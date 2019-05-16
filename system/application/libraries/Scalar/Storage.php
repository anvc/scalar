<?php

require_once 'Storage/Exception.php';
require_once 'Storage/Adapter/AdapterInterface.php';
require_once 'Storage/Adapter/Filesystem.php';
require_once 'Storage/Adapter/S3.php';

/**
 * Class Scalar_Storage
 *
 * @package Scalar\Storage
 */
class Scalar_Storage {

    /**
     * Adapter instance.
     *
     * @var Scalar_Storage_Adapter_AdapterInterface
     */
    private $_adapter;

    /**
     * Temporary directory.
     *
     * @var string
     */
    private $_tempDir;

    /**
     * Scalar_Storage constructor.
     *
     * Allows storage options to be set immediately, which will be used to initialize an adapter.
     *
     * @param null $options
     */
    public function __construct($options = null) {
        if (isset($options)) {
            $this->setOptions($options);
        }
    }

    /**
     * Delegates calls directly to Scalar_Storage to the currently-set adapter.
     *
     * All of the methods of the adapter interface are available this way, as well as any additional methods
     * declared on the adapter.
     *
     * @param $name
     * @param $arguments
     * @return mixed
     * @throws Scalar_Storage_Exception
     */
    public function __call($name, $arguments) {
        if(!$this->_adapter) {
            throw new Scalar_Storage_Exception('Storage adapter not initialized');
        }

        $callback = array($this->_adapter, $name);

        if (is_callable($callback)) {
            return call_user_func_array($callback, $arguments);
        } else {
            throw new Scalar_Storage_Exception(sprintf('Storage adapter has no method "%s"', $name));
        }
    }

    /**
     * Sets the adapter as well as the options to be used.
     *
     * You can either pass a string with the adapter's class name, or an instance of the adapter directly.
     *
     * @param Scalar_Storage_Adapter_AdapterInterface|string $adapter Storage adapter to set.
     * @param array $options Options to pass to the adapter's constructor.
     * @throws Scalar_Storage_Exception
     */
    public function setAdapter($adapter, $options) {
        if (is_string($adapter) && class_exists($adapter)) {
            $adapter = new $adapter($options);
        }

        if ($adapter instanceof Scalar_Storage_Adapter_AdapterInterface) {
            $this->_adapter = $adapter;
        } else {
            throw new Scalar_Storage_Exception('Storage adapters must implement Scalar_Storage_Adapter_AdapterInterface');
        }

        return $this->_adapter;
    }

    /**
     * Get the current storage adapter.
     *
     * You generally need to use the adapter itself to perform any storage actions.
     *
     * @return Scalar_Storage_Adapter_AdapterInterface
     */
    public function getAdapter() {
        return $this->_adapter;
    }

    /**
     * Set global options for the storage system, as well as any adapter-specific options.
     *
     * @param array $options Storage options
     * @throws Scalar_Storage_Exception
     * @uses Scalar_Storage::setAdapter()
     */
    public function setOptions($options) {
        if(isset($options['adapter'])) {
            $adapterOptions = array();
            if(isset($options['adapterOptions'])) {
                $adapterOptions = $options['adapterOptions'];
            }
            if (isset($options['folder'])) {
                $adapterOptions['folder'] = $options['folder'];
            }
            $this->setAdapter($options['adapter'], $adapterOptions);
        }
        if(isset($options['tempDir'])) {
            $this->setTempDir($options['tempDir']);
        }
    }

    /**
     * Set the temporary file storage directory path.
     *
     * @param string $dir Local path to directory.
     */
    public function setTempDir($dir) {
        $this->_tempDir = $dir;
    }

    /**
     * Get the temporary file storage directory path.
     *
     * @return string Local path to directory.
     */
    public function getTempDir() {
        if (!$this->_tempDir) {
            $this->_tempDir = sys_get_temp_dir();
        }

        return $this->_tempDir;
    }
}
