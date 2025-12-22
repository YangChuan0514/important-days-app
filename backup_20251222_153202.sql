-- MySQL dump 10.13  Distrib 9.3.0, for macos15.2 (arm64)
--
-- Host: localhost    Database: wx-day-app
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `important_days`
--

DROP TABLE IF EXISTS `important_days`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `important_days` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `name` varchar(100) NOT NULL COMMENT '日子名称',
  `date` date NOT NULL COMMENT '日期',
  `type` varchar(20) DEFAULT 'other' COMMENT '类型：birthday/anniversary/holiday/other',
  `note` text COMMENT '备注',
  `remind_days` int DEFAULT '7' COMMENT '提前提醒天数',
  `remind_time` time DEFAULT '09:00:00' COMMENT '提醒时间',
  `is_repeat` tinyint(1) DEFAULT '1' COMMENT '是否每年重复',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_date` (`user_id`,`date`),
  KEY `idx_date` (`date`),
  KEY `idx_user_active` (`user_id`,`is_active`),
  CONSTRAINT `important_days_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='重要日子表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `important_days`
--

LOCK TABLES `important_days` WRITE;
/*!40000 ALTER TABLE `important_days` DISABLE KEYS */;
INSERT INTO `important_days` VALUES (1,1,'1','2025-12-22','other','1',7,'09:00:00',1,1,'2025-12-22 03:13:10','2025-12-22 03:13:10'),(2,1,'2','2025-12-23','other','1',7,'10:00:00',1,1,'2025-12-22 03:13:49','2025-12-22 03:13:49'),(3,1,'3','2025-12-24','holiday','',7,'09:00:00',1,1,'2025-12-22 03:14:27','2025-12-22 03:14:27'),(4,1,'2','2025-10-21','other','',7,'09:00:00',1,0,'2025-12-22 05:49:09','2025-12-22 05:57:56');
/*!40000 ALTER TABLE `important_days` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `push_logs`
--

DROP TABLE IF EXISTS `push_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `push_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `day_id` bigint NOT NULL,
  `push_date` date NOT NULL COMMENT '推送日期',
  `push_time` datetime NOT NULL COMMENT '推送时间',
  `status` varchar(20) DEFAULT 'pending' COMMENT '状态：pending/sent/failed',
  `message` text COMMENT '推送内容',
  `error_msg` text COMMENT '错误信息',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_date` (`user_id`,`push_date`),
  KEY `idx_status` (`status`),
  KEY `idx_day` (`day_id`),
  CONSTRAINT `push_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `push_logs_ibfk_2` FOREIGN KEY (`day_id`) REFERENCES `important_days` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='推送记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `push_logs`
--

LOCK TABLES `push_logs` WRITE;
/*!40000 ALTER TABLE `push_logs` DISABLE KEYS */;
INSERT INTO `push_logs` VALUES (1,1,1,'2025-12-22','2025-12-22 14:56:01','sent','今天就是「1」，祝您愉快！🎉',NULL,'2025-12-22 06:56:01'),(2,1,2,'2025-12-22','2025-12-22 14:56:01','sent','明天就是「2」了，准备好了吗？',NULL,'2025-12-22 06:56:01'),(3,1,3,'2025-12-22','2025-12-22 14:56:01','sent','倒计时2天，「3」最后准备',NULL,'2025-12-22 06:56:01'),(4,1,1,'2025-12-22','2025-12-22 14:59:00','sent','今天就是「1」，祝您愉快！🎉',NULL,'2025-12-22 06:59:00'),(5,1,2,'2025-12-22','2025-12-22 14:59:00','sent','明天就是「2」了，准备好了吗？',NULL,'2025-12-22 06:59:00'),(6,1,3,'2025-12-22','2025-12-22 14:59:01','sent','倒计时2天，「3」最后准备',NULL,'2025-12-22 06:59:01'),(7,1,1,'2025-12-22','2025-12-22 15:00:01','sent','今天就是「1」，祝您愉快！🎉',NULL,'2025-12-22 07:00:01'),(8,1,2,'2025-12-22','2025-12-22 15:00:01','sent','明天就是「2」了，准备好了吗？',NULL,'2025-12-22 07:00:01'),(9,1,3,'2025-12-22','2025-12-22 15:00:01','sent','倒计时2天，「3」最后准备',NULL,'2025-12-22 07:00:01'),(10,1,1,'2025-12-22','2025-12-22 15:05:01','sent','今天就是「1」，祝您愉快！🎉',NULL,'2025-12-22 07:05:01'),(11,1,2,'2025-12-22','2025-12-22 15:05:01','sent','明天就是「2」了，准备好了吗？',NULL,'2025-12-22 07:05:01'),(12,1,3,'2025-12-22','2025-12-22 15:05:01','sent','倒计时2天，「3」最后准备',NULL,'2025-12-22 07:05:01'),(13,1,1,'2025-12-22','2025-12-22 15:06:01','sent','今天就是「1」，祝您愉快！🎉',NULL,'2025-12-22 07:06:01'),(14,1,2,'2025-12-22','2025-12-22 15:06:01','sent','明天就是「2」了，准备好了吗？',NULL,'2025-12-22 07:06:01'),(15,1,3,'2025-12-22','2025-12-22 15:06:01','sent','倒计时2天，「3」最后准备',NULL,'2025-12-22 07:06:01'),(16,1,1,'2025-12-22','2025-12-22 15:12:00','sent','今天就是「1」，祝您愉快！🎉',NULL,'2025-12-22 07:12:00'),(17,1,2,'2025-12-22','2025-12-22 15:12:01','sent','明天就是「2」了，准备好了吗？',NULL,'2025-12-22 07:12:01'),(18,1,3,'2025-12-22','2025-12-22 15:12:01','sent','倒计时2天，「3」最后准备',NULL,'2025-12-22 07:12:01');
/*!40000 ALTER TABLE `push_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `push_tasks`
--

DROP TABLE IF EXISTS `push_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `push_tasks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `day_id` bigint NOT NULL,
  `task_date` date NOT NULL COMMENT '任务日期',
  `task_time` datetime NOT NULL COMMENT '任务执行时间',
  `status` varchar(20) DEFAULT 'pending' COMMENT '状态：pending/processing/completed/failed',
  `retry_count` int DEFAULT '0' COMMENT '重试次数',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_task_time` (`task_time`,`status`),
  KEY `idx_user` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `day_id` (`day_id`),
  CONSTRAINT `push_tasks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `push_tasks_ibfk_2` FOREIGN KEY (`day_id`) REFERENCES `important_days` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=115 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='推送任务表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `push_tasks`
--

LOCK TABLES `push_tasks` WRITE;
/*!40000 ALTER TABLE `push_tasks` DISABLE KEYS */;
INSERT INTO `push_tasks` VALUES (109,1,1,'2025-12-22','2025-12-22 09:00:00','completed',0,'2025-12-22 07:11:51','2025-12-22 07:12:00'),(110,1,2,'2025-12-22','2025-12-22 10:00:00','completed',0,'2025-12-22 07:11:51','2025-12-22 07:12:01'),(111,1,2,'2025-12-23','2025-12-23 10:00:00','pending',0,'2025-12-22 07:11:51','2025-12-22 07:11:51'),(112,1,3,'2025-12-22','2025-12-22 09:00:00','completed',0,'2025-12-22 07:11:51','2025-12-22 07:12:01'),(113,1,3,'2025-12-23','2025-12-23 09:00:00','pending',0,'2025-12-22 07:11:51','2025-12-22 07:11:51'),(114,1,3,'2025-12-24','2025-12-24 09:00:00','pending',0,'2025-12-22 07:11:51','2025-12-22 07:11:51');
/*!40000 ALTER TABLE `push_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_settings`
--

DROP TABLE IF EXISTS `user_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `push_enabled` tinyint(1) DEFAULT '1' COMMENT '是否启用推送',
  `push_time` time DEFAULT '09:00:00' COMMENT '默认推送时间',
  `quiet_start` time DEFAULT NULL COMMENT '静音时段开始',
  `quiet_end` time DEFAULT NULL COMMENT '静音时段结束',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `user_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户设置表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_settings`
--

LOCK TABLES `user_settings` WRITE;
/*!40000 ALTER TABLE `user_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `openid` varchar(100) NOT NULL COMMENT '微信openid',
  `unionid` varchar(100) DEFAULT NULL COMMENT '微信unionid',
  `nickname` varchar(50) DEFAULT NULL COMMENT '昵称',
  `avatar_url` varchar(255) DEFAULT NULL COMMENT '头像',
  `phone` varchar(20) DEFAULT NULL COMMENT 'æ‰‹æœºå·',
  `default_remind_time` varchar(8) DEFAULT '09:00' COMMENT 'é»˜è®¤æé†’æ—¶é—´',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `openid` (`openid`),
  KEY `idx_openid` (`openid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'ocpVW4zzG5exqI3ZwOq2FL9bwkZM',NULL,'微信用户','https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',NULL,'09:03','2025-12-22 02:45:05','2025-12-22 07:28:46');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-22 15:32:08
