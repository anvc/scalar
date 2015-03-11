<?php
/**
 * @projectDescription	Plugin config for Scalar installations
*/

$config['plugins'] = array();

// Dashboard plugins (present the only supported plugin type)
$config['plugins']['dashboard'] = array();

// Add new Dashboard plugins below.  The value is the name of the folder in system/application/plugins + the name of
// <plugin-name>_pi.php contained in that folder.  It will also be the name of the class (capitalized first letter).
$config['plugins']['dashboard'][] = 'transfer';

