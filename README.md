Scalar
======

Congratulations on discovering Scalar, the next generation in media-rich, scholarly electronic publishing!

If you just want to create a Scalar project, the easiest route is to work from our servers.  You can register and learn more at http://scalar.usc.edu/scalar.  Using the version of Scalar that is hosted on our servers guarantees that you are working on the most up-to-date version of the software. During our beta phase, updates will continue to happen with some frequency as features are added, user feedback is incorporated and Scalar continues to broaden the horizons of electronic publishing. If you are technically inclined and decide to host your own version of Scalar, you’re free to customize and modify it in any way, but it’s up to you to download, install and troubleshoot updates as they become available.

We are also very grateful for all feedback based on your experiences using Scalar. We are especially interested to know where and how you are using it, innovative or unexpected uses of Scalar, requests for features, opportunities for future development, potential press, archive or scholarly society partnerships, as well as reports on any bugs or difficulties you may experience.
Learn more at http://scalar.usc.edu/scalar.

To install Scalar on your own server, you can download the most recent build from GitHub. Or, if you are concerned about downloading from the "live" GitHub codebase, we periodically create a GitHub Release. The code kept in a release can be assumed to be tested in both development and live environments (e.g., scalar.usc.edu).  For help installing Scalar, see either INSTALL.txt or UPDATE.txt in the project root folder.

As we update the software, we periodically make changes to Scalar's config files or database structure. If you have installed Scalar on your own server and are planning to update from GitHub, you'll likely need to make updates to your local config files or database. We're keeping track of the config changes on the wiki: https://github.com/anvc/scalar/wiki/Changes-to-config-files-over-time. 

## Setting up a local development server

DDEV is a helpful resource for setting up and managing a local development environment with Docker containers.

Prerequisites:
- [Docker](https://docs.docker.com/get-docker/)
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [DDEV](https://ddev.readthedocs.io/en/stable/users/install/ddev-installation/)

Clone the Scalar codebase and enter the directory
```bash
$ git clone https://github.com/anvc/scalar
$ cd scalar
```

Configure your local development for Scalar
```bash
$ ddev config --project-type php --php-version 7.4 --webserver-type apache-fpm 
--database mysql:5.7 --web-environment="SCALAR_ENCRYPTION_KEY=scalar,
SCALAR_DB_HOSTNAME=db,SCALAR_DB_USERNAME=db,SCALAR_DB_PASSWORD=db,
SCALAR_DB_DATABASE=db"
```

Start the DDEV containers
```bash
$ ddev start
```

DDEV will create a new folder titled `.ddev`, where additional configurations can be made. Update PHP's configuration to enable open short tags.
```bash
$ mkdir .ddev/php && echo 'short_open_tag = ON;' > .ddev/php/my-php.ini
```

Restart DDEV to initiate updated PHP configurations
```bash
$ ddev restart
```

Import the Scalar SQL database
```bash
$ ddev import-db --src=system/application/config/scalar_store.sql
```

Create an admin user
```bash
$ echo 'INSERT INTO db.scalar_db_users (email, fullname, password, is_super) VALUES
("admin@scalar.dev", "admin", SHA2("password", 512), 1)' | ddev mysql
```
Launch your browser to access the development server
```bash
$ ddev launch
```