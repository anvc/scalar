# Developer Notes


## Composer 

Composer is only set up here for codesniffer and phpcompatibility.  It is not used by the primary application.


## CodeSniffer and PHPCompatibility

### Documentation for CodeSniffer and PHPCompatibility

* [CodeSniffer](https://github.com/squizlabs/PHP_CodeSniffer)
* [PHPCompatibility](https://github.com/PHPCompatibility/PHPCompatibility)

### Quick Start

#### Prereqs

1. PHP XML extension (WAMP should have a menu option to install extensions)
2. [Composer](https://getcomposer.org/)

#### Installing CodeSniffer/PHPCompatibility

1. composer install
2. run `vendor/bin/phpcs -i` or `vendor\bin\phpcs.bat -i` to test

#### Running tests

1. vendor\bin\phpcs.bat -p system --standard=PHPCompatibility

