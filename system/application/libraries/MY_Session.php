<?php
class MY_Session extends CI_Session {

    /**
     * Update an existing session
     *
     * @access    public
     * @return    void
    */
    function sess_update() {
       // Skip session update if this is an AJAX call. This is a bug in CI, see https://github.com/bcit-ci/CodeIgniter/issues/154
       if ( !isset($_SERVER['HTTP_X_REQUESTED_WITH']) || strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) != 'xmlhttprequest' ) {
       		parent::sess_update();
       }
    }
}
?>