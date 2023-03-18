CREATE TABLE IF NOT EXISTS `scalar_db_books` (
  `book_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `subtitle` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci DEFAULT NULL,
  `slug` varchar(250) COLLATE utf8mb4_general_ci NOT NULL UNIQUE,
  `url_is_public` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `display_in_index` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `is_featured` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `editorial_is_on` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `thumbnail` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `background` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `template` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'cantaloupe',
  `stylesheet` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `custom_style` text COLLATE utf8mb4_general_ci DEFAULT NULL,
  `custom_js` text COLLATE utf8mb4_general_ci DEFAULT NULL,
  `scope` enum('book','article','project') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'book',
  `publisher` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `publisher_thumbnail` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `editions` text COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user` varchar(64) COLLATE utf8mb4_general_ci NOT NULL,
  `created` datetime NOT NULL,
  `terms_of_service` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `privacy_policy` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`book_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `scalar_db_content` (
  `content_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `book_id` int(10) unsigned NOT NULL DEFAULT '0',
  `recent_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  `slug` varchar(249) COLLATE utf8mb4_general_ci NOT NULL,
  `type` enum('composite','media') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'composite',
  `is_live` tinyint(1) unsigned NOT NULL DEFAULT '1',
  `paywall` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `thumbnail` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `background` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `banner` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `custom_style` text COLLATE utf8mb4_general_ci DEFAULT NULL,
  `custom_scripts` text COLLATE utf8mb4_general_ci DEFAULT NULL,
  `color` varchar(64) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `audio` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `category` enum('commentary','review','term') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user` varchar(64) COLLATE utf8mb4_general_ci NOT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`content_id`),
  KEY `book_id` (`book_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `scalar_db_rel_annotated` (
  `parent_version_id` int(10) unsigned DEFAULT '0',
  `child_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  `start_seconds` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0',
  `end_seconds` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0',
  `start_line_num` smallint(2) unsigned NOT NULL DEFAULT '0',
  `end_line_num` smallint(2) unsigned NOT NULL DEFAULT '0',
  `points` varchar(128) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `position_3d` varchar(128) COLLATE utf8mb4_general_ci DEFAULT NULL,
  KEY `parent_child` (`parent_version_id`,`child_version_id`),
  KEY `child_parent` (`child_version_id`,`parent_version_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `scalar_db_rel_contained` (
  `parent_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  `child_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  `sort_number` int(5) unsigned NOT NULL DEFAULT '0',
  KEY `parent_child` (`parent_version_id`,`child_version_id`),
  KEY `child_parent` (`child_version_id`,`parent_version_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `scalar_db_rel_referenced` (
  `parent_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  `child_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  `reference_text` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  KEY `parent_child` (`parent_version_id`,`child_version_id`),
  KEY `child_parent` (`child_version_id`,`parent_version_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `scalar_db_rel_replied` (
  `parent_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  `child_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  `paragraph_num` int(5) unsigned NOT NULL DEFAULT '0',
  `datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `parent_child` (`parent_version_id`,`child_version_id`),
  KEY `child_parent` (`child_version_id`,`parent_version_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `scalar_db_rel_tagged` (
  `parent_version_id` int(10) unsigned DEFAULT '0',
  `child_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  KEY `parent_child` (`parent_version_id`,`child_version_id`),
  KEY `child_parent` (`child_version_id`,`parent_version_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `scalar_db_rel_grouped` (
  `parent_version_id` int(10) unsigned DEFAULT '0',
  `contents` TEXT NOT NULL,
  KEY `parent` (`parent_version_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `scalar_db_resources` (
  `field` varchar(64) COLLATE utf8mb4_general_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_general_ci NOT NULL,
  KEY `field` (`field`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `scalar_db_sessions` (
  `session_id` varchar(40) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0',
  `ip_address` varchar(45) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0',
  `user_agent` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `last_activity` int(10) unsigned NOT NULL DEFAULT '0',
  `user_data` mediumtext COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`session_id`),
  KEY `last_activity_idx` (`last_activity`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `scalar_db_users` (
  `user_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `fullname` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reset_string` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_super` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `previous_passwords` text COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `scalar_db_user_books` (
  `user_id` int(10) unsigned NOT NULL DEFAULT '0',
  `book_id` int(10) unsigned NOT NULL DEFAULT '0',
  `relationship` enum('author','editor','commentator','reviewer','reader') COLLATE utf8mb4_general_ci NOT NULL,
  `list_in_index` tinyint(1) unsigned NOT NULL DEFAULT '1',
  `sort_number` int(10) unsigned NOT NULL DEFAULT '0',
  `api_key` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `whitelist` tinyint(1) unsigned NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `scalar_db_user_history` (
  `history_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) NOT NULL,
  `content_id` int(10) NOT NULL,
  `book_id` int(10) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `user_id` (`user_id`,`content_id`,`book_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `scalar_db_versions` (
  `version_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `content_id` int(10) unsigned NOT NULL DEFAULT '0',
  `version_num` int(10) unsigned NOT NULL DEFAULT '0',
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci NOT NULL,
  `content` mediumtext COLLATE utf8mb4_general_ci NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `default_view` varchar(64) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'plain',
  `continue_to_content_id` int(10) NOT NULL DEFAULT '0',
  `sort_number` smallint(2) unsigned NOT NULL DEFAULT '0',
  `editorial_state` enum('draft','edit','editreview','clean','ready','published') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'draft',
  `usage_rights` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `editorial_queries` TEXT DEFAULT NULL,
  `user` varchar(64) COLLATE utf8mb4_general_ci NOT NULL,
  `created` datetime NOT NULL,
  `attribution` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`version_id`),
  KEY `content_id` (`content_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `scalar_db_whitelist` (
  `book_id` int(10) unsigned NOT NULL DEFAULT '0',
  `domain` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  KEY `book_id` (`book_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
