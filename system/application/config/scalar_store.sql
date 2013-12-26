--
-- Database: `scalar_store`
--

-- --------------------------------------------------------

--
-- Table structure for table `scalar_db_books`
--

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

-- --------------------------------------------------------

--
-- Table structure for table `scalar_db_content`
--

CREATE TABLE IF NOT EXISTS `scalar_db_content` (
  `content_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `book_id` int(10) unsigned NOT NULL DEFAULT '0',
  `recent_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  `slug` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `type` enum('composite','media','citation') COLLATE utf8_unicode_ci NOT NULL,
  `is_live` tinyint(1) unsigned NOT NULL DEFAULT '1',
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

-- --------------------------------------------------------

--
-- Table structure for table `scalar_db_rel_annotated`
--

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

-- --------------------------------------------------------

--
-- Table structure for table `scalar_db_rel_contained`
--

CREATE TABLE IF NOT EXISTS `scalar_db_rel_contained` (
  `parent_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  `child_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  `sort_number` int(5) unsigned NOT NULL DEFAULT '0',
  KEY `parent_child` (`parent_version_id`,`child_version_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `scalar_db_rel_referenced`
--

CREATE TABLE IF NOT EXISTS `scalar_db_rel_referenced` (
  `parent_version_id` int(10) unsigned NOT NULL,
  `child_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  `reference_text` varchar(255) DEFAULT NULL,
  KEY `parent_child` (`parent_version_id`,`child_version_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `scalar_db_rel_replied`
--

CREATE TABLE IF NOT EXISTS `scalar_db_rel_replied` (
  `parent_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  `child_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  `paragraph_num` int(5) NOT NULL DEFAULT '0',
  `datetime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  KEY `parent_child` (`parent_version_id`,`child_version_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `scalar_db_rel_tagged`
--

CREATE TABLE IF NOT EXISTS `scalar_db_rel_tagged` (
  `parent_version_id` int(10) unsigned NOT NULL,
  `child_version_id` int(10) unsigned NOT NULL DEFAULT '0',
  KEY `parent_child` (`parent_version_id`,`child_version_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `scalar_db_resources`
--

CREATE TABLE IF NOT EXISTS `scalar_db_resources` (
  `field` varchar(64) NOT NULL,
  `value` mediumtext NOT NULL,
  KEY `field` (`field`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `scalar_db_sessions`
--

CREATE TABLE IF NOT EXISTS `scalar_db_sessions` (
  `session_id` varchar(40) NOT NULL DEFAULT '0',
  `ip_address` varchar(16) NOT NULL DEFAULT '0',
  `user_agent` varchar(120) NOT NULL,
  `last_activity` int(10) unsigned NOT NULL DEFAULT '0',
  `user_data` text NOT NULL,
  PRIMARY KEY (`session_id`),
  KEY `last_activity_idx` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `scalar_db_users`
--

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

-- --------------------------------------------------------

--
-- Table structure for table `scalar_db_user_books`
--

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

-- --------------------------------------------------------

--
-- Table structure for table `scalar_db_user_history`
--

CREATE TABLE IF NOT EXISTS `scalar_db_user_history` (
  `history_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) NOT NULL,
  `content_id` int(10) NOT NULL,
  `book_id` int(10) NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `user_id` (`user_id`,`content_id`,`book_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `scalar_db_versions`
--

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

-- --------------------------------------------------------

--
-- Table structure for table `scalar_db_whitelist`
--

CREATE TABLE IF NOT EXISTS `scalar_db_whitelist` (
  `book_id` int(10) unsigned NOT NULL,
  `domain` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `scalar_store_g2t`
--

CREATE TABLE IF NOT EXISTS `scalar_store_g2t` (
  `g` mediumint(8) unsigned NOT NULL,
  `t` mediumint(8) unsigned NOT NULL,
  UNIQUE KEY `gt` (`g`,`t`),
  KEY `tg` (`t`,`g`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci DELAY_KEY_WRITE=1;

-- --------------------------------------------------------

--
-- Table structure for table `scalar_store_id2val`
--

CREATE TABLE IF NOT EXISTS `scalar_store_id2val` (
  `id` mediumint(8) unsigned NOT NULL,
  `misc` tinyint(1) NOT NULL DEFAULT '0',
  `val` text COLLATE utf8_unicode_ci NOT NULL,
  `val_type` tinyint(1) NOT NULL DEFAULT '0',
  UNIQUE KEY `id` (`id`,`val_type`),
  KEY `v` (`val`(64))
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci DELAY_KEY_WRITE=1;

-- --------------------------------------------------------

--
-- Table structure for table `scalar_store_o2val`
--

CREATE TABLE IF NOT EXISTS `scalar_store_o2val` (
  `id` mediumint(8) unsigned NOT NULL,
  `misc` tinyint(1) NOT NULL DEFAULT '0',
  `val_hash` char(32) COLLATE utf8_unicode_ci NOT NULL,
  `val` text COLLATE utf8_unicode_ci NOT NULL,
  UNIQUE KEY `id` (`id`),
  KEY `vh` (`val_hash`),
  KEY `v` (`val`(64))
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci DELAY_KEY_WRITE=1;

-- --------------------------------------------------------

--
-- Table structure for table `scalar_store_s2val`
--

CREATE TABLE IF NOT EXISTS `scalar_store_s2val` (
  `id` mediumint(8) unsigned NOT NULL,
  `misc` tinyint(1) NOT NULL DEFAULT '0',
  `val_hash` char(32) COLLATE utf8_unicode_ci NOT NULL,
  `val` text COLLATE utf8_unicode_ci NOT NULL,
  UNIQUE KEY `id` (`id`),
  KEY `vh` (`val_hash`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci DELAY_KEY_WRITE=1;

-- --------------------------------------------------------

--
-- Table structure for table `scalar_store_setting`
--

CREATE TABLE IF NOT EXISTS `scalar_store_setting` (
  `k` char(32) COLLATE utf8_unicode_ci NOT NULL,
  `val` text COLLATE utf8_unicode_ci NOT NULL,
  UNIQUE KEY `k` (`k`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci DELAY_KEY_WRITE=1;

-- --------------------------------------------------------

--
-- Table structure for table `scalar_store_triple`
--

CREATE TABLE IF NOT EXISTS `scalar_store_triple` (
  `t` mediumint(8) unsigned NOT NULL,
  `s` mediumint(8) unsigned NOT NULL,
  `p` mediumint(8) unsigned NOT NULL,
  `o` mediumint(8) unsigned NOT NULL,
  `o_lang_dt` mediumint(8) unsigned NOT NULL,
  `o_comp` char(35) COLLATE utf8_unicode_ci NOT NULL,
  `s_type` tinyint(1) NOT NULL DEFAULT '0',
  `o_type` tinyint(1) NOT NULL DEFAULT '0',
  `misc` tinyint(1) NOT NULL DEFAULT '0',
  UNIQUE KEY `t` (`t`),
  KEY `sp` (`s`,`p`),
  KEY `os` (`o`,`s`),
  KEY `po` (`p`,`o`),
  KEY `misc` (`misc`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci DELAY_KEY_WRITE=1;

