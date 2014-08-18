CREATE TABLE IF NOT EXISTS `scalar_db_books` (
  `book_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `subtitle` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `description` text COLLATE utf8_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `url_is_public` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `display_in_index` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `is_featured` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `thumbnail` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `background` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `template` varchar(64) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'honeydew',
  `stylesheet` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `custom_style` text COLLATE utf8_unicode_ci NOT NULL,
  `custom_js` text COLLATE utf8_unicode_ci NOT NULL,
  `scope` enum('book','article','project') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'book',
  `publisher` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `publisher_thumbnail` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`book_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `scalar_db_content` (
  `content_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `book_id` int(10) unsigned NOT NULL DEFAULT '0',
  `recent_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  `slug` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `type` enum('composite','media','citation') COLLATE utf8_unicode_ci NOT NULL,
  `is_live` tinyint(1) unsigned NOT NULL DEFAULT '1',
  `paywall` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `thumbnail` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `background` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `custom_style` text COLLATE utf8_unicode_ci NOT NULL,
  `custom_scripts` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `color` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `audio` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `category` enum('commentary','review') COLLATE utf8_unicode_ci DEFAULT NULL,
  `user` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`content_id`),
  KEY `book_id` (`book_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `scalar_db_rel_annotated` (
  `parent_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  `child_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  `start_seconds` varchar(64) NOT NULL DEFAULT '0',
  `end_seconds` varchar(64) NOT NULL DEFAULT '0',
  `start_line_num` smallint(2) unsigned NOT NULL DEFAULT '0',
  `end_line_num` smallint(2) unsigned NOT NULL DEFAULT '0',
  `points` varchar(128) DEFAULT NULL,
  KEY `parent_child` (`parent_version_id`,`child_version_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `scalar_db_rel_contained` (
  `parent_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  `child_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  `sort_number` int(5) unsigned NOT NULL DEFAULT '0',
  KEY `parent_child` (`parent_version_id`,`child_version_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `scalar_db_rel_referenced` (
  `parent_version_id` int(10) unsigned NOT NULL,
  `child_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  `reference_text` varchar(255) DEFAULT NULL,
  KEY `parent_child` (`parent_version_id`,`child_version_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `scalar_db_rel_replied` (
  `parent_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  `child_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  `paragraph_num` int(5) NOT NULL DEFAULT '0',
  `datetime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  KEY `parent_child` (`parent_version_id`,`child_version_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `scalar_db_rel_tagged` (
  `parent_version_id` int(10) unsigned NOT NULL,
  `child_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  KEY `parent_child` (`parent_version_id`,`child_version_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `scalar_db_resources` (
  `field` varchar(64) NOT NULL,
  `value` mediumtext NOT NULL,
  KEY `field` (`field`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `scalar_db_sessions` (
  `session_id` varchar(40) NOT NULL DEFAULT '0',
  `ip_address` varchar(16) NOT NULL DEFAULT '0',
  `user_agent` varchar(120) NOT NULL,
  `last_activity` int(10) unsigned NOT NULL DEFAULT '0',
  `user_data` text NOT NULL,
  PRIMARY KEY (`session_id`),
  KEY `last_activity_idx` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `scalar_db_users` (
  `user_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `fullname` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `reset_string` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `url` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `is_super` tinyint(1) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`user_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `scalar_db_user_books` (
  `user_id` int(10) unsigned NOT NULL DEFAULT '0',
  `book_id` int(10) unsigned NOT NULL DEFAULT '0',
  `relationship` enum('author','commentator','reviewer','reader') COLLATE utf8_unicode_ci NOT NULL,
  `list_in_index` tinyint(1) unsigned NOT NULL DEFAULT '1',
  `sort_number` int(10) unsigned NOT NULL DEFAULT '0',
  `api_key` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `whitelist` tinyint(1) unsigned NOT NULL,
  KEY `user_book` (`user_id`,`book_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `scalar_db_user_history` (
  `history_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) NOT NULL,
  `content_id` int(10) NOT NULL,
  `book_id` int(10) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `user_id` (`user_id`,`content_id`,`book_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `scalar_db_versions` (
  `version_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `content_id` int(10) unsigned NOT NULL DEFAULT '0',
  `version_num` int(10) unsigned NOT NULL DEFAULT '0',
  `title` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `description` text COLLATE utf8_unicode_ci NOT NULL,
  `content` mediumtext COLLATE utf8_unicode_ci NOT NULL,
  `url` varchar(500) COLLATE utf8_unicode_ci NOT NULL,
  `default_view` varchar(64) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'plain',
  `continue_to_content_id` int(10) NOT NULL DEFAULT '0',
  `sort_number` smallint(2) unsigned NOT NULL DEFAULT '0',
  `user` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `created` datetime NOT NULL,
  `attribution` varchar(500) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`version_id`),
  KEY `content_id` (`content_id`),
  KEY `version_num` (`version_num`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `scalar_db_whitelist` (
  `book_id` int(10) unsigned NOT NULL,
  `domain` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
