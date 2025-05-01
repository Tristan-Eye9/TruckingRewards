-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: cpsc4911.cobd8enwsupz.us-east-1.rds.amazonaws.com    Database: Team22DB
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `action` varchar(50) DEFAULT NULL,
  `description` text,
  `sponsorCompanyID` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sponsorCompanyID` (`sponsorCompanyID`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`sponsorCompanyID`) REFERENCES `sponsor_companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,'trisha316andres@gmail.com','login_attempt','Login successful',NULL,'2025-04-20 15:27:00'),(2,'trisha316andres@gmail.com','login_attempt','Login successful',NULL,'2025-04-20 15:29:02'),(3,'trisha316andres@gmail.com','login_attempt','Login successful',1,'2025-04-20 15:34:45'),(4,'trisha316andres@gmail.com','login_attempt','Login successful',2,'2025-04-20 15:34:45'),(5,'trisha316andres@gmail.com','login_attempt','Login successful',3,'2025-04-20 15:34:45'),(6,'trishaa@g.clemson.edu','login_attempt','Login successful',NULL,'2025-04-20 15:35:09'),(7,'admin@gmail.com','login_attempt','Login successful',NULL,'2025-04-20 15:44:38'),(8,'admin@gmail.com','login_attempt','Login successful',NULL,'2025-04-20 16:03:57'),(9,'trisha316andres@gmail.com','login_attempt','Login successful',1,'2025-04-20 16:15:13'),(10,'trisha316andres@gmail.com','login_attempt','Login successful',2,'2025-04-20 16:15:13'),(11,'trisha316andres@gmail.com','login_attempt','Login successful',3,'2025-04-20 16:15:13'),(12,'trisha316andres@gmail.com','password_change','User changed their password',1,'2025-04-20 16:15:42'),(13,'trisha316andres@gmail.com','password_change','User changed their password',2,'2025-04-20 16:15:42'),(14,'trisha316andres@gmail.com','password_change','User changed their password',3,'2025-04-20 16:15:42'),(15,'trishaa@g.clemson.edu','login_attempt','Login successful',NULL,'2025-04-20 16:16:14'),(16,'admin@gmail.com','login_attempt','Login successful',NULL,'2025-04-20 16:16:56'),(17,'trishaa@g.clemson.edu','login_attempt','Login successful',NULL,'2025-04-20 16:37:19'),(18,'admin@gmail.com','login_attempt','Login successful',NULL,'2025-04-20 17:00:10'),(19,'ggelasc@clemson.edu','login_attempt','Login successful',NULL,'2025-04-20 18:06:13'),(20,'georgiagelasco@gmail.com','login_attempt','Login successful',1,'2025-04-20 18:16:04'),(21,'georgiagelasco@gmail.com','login_attempt','Login successful',1,'2025-04-20 18:16:27'),(22,'ggelasc@clemson.edu','login_attempt','Login successful',NULL,'2025-04-20 18:17:00'),(23,'georgiagelasco@gmail.com','login_attempt','Login successful',1,'2025-04-20 18:31:42'),(24,'jkthomp@clemson.edu','login_attempt','Login successful',1,'2025-04-20 18:50:33'),(25,'jkthomp@clemson.edu','login_attempt','Login successful',1,'2025-04-20 19:05:58'),(26,'admin@gmail.com','login_attempt','Login successful',NULL,'2025-04-20 19:06:04'),(27,'ggelasc@clemson.edu','login_attempt','Login successful',NULL,'2025-04-20 19:06:25'),(28,'ggelasc@clemson.edu','login_attempt','Login successful',NULL,'2025-04-20 19:54:28'),(29,'admin@gmail.com','login_attempt','Login successful',NULL,'2025-04-20 19:54:36'),(30,'admin@gmail.com','login_attempt','Login successful',NULL,'2025-04-20 20:04:56'),(31,'jkthomp@clemson.edu','login_attempt','Login successful',1,'2025-04-20 20:06:46'),(32,'admin@gmail.com','login_attempt','Login successful',NULL,'2025-04-20 20:18:24'),(33,'ggelasc@clemson.edu','login_attempt','Login successful',NULL,'2025-04-20 20:18:35'),(34,'trishaa@g.clemson.edu','login_attempt','Login successful',NULL,'2025-04-20 20:32:07'),(35,'ggelasc@clemson.edu','login_attempt','Login successful',NULL,'2025-04-20 21:15:19'),(36,'admin@gmail.com','login_attempt','Login successful',NULL,'2025-04-20 21:18:43'),(37,'ggelasc@clemson.edu','login_attempt','Login successful',NULL,'2025-04-20 21:46:48'),(38,'admin@gmail.com','login_attempt','Login successful',NULL,'2025-04-20 21:47:00'),(39,'admin@gmail.com','login_attempt','Login successful',NULL,'2025-04-20 22:00:13'),(40,'admin@gmail.com','login_attempt','Login successful',NULL,'2025-04-20 22:09:33'),(41,'georgiagelasco@gmail.com','login_attempt','Login successful',1,'2025-04-20 22:09:55'),(42,'georgiagelasco@gmail.com','login_attempt','Login successful',1,'2025-04-20 22:10:32'),(43,'georgiagelasco@gmail.com','login_attempt','Login successful',1,'2025-04-20 22:23:41'),(44,'georgiagelasco@gmail.com','login_attempt','Login successful',1,'2025-04-20 22:34:24'),(45,'trishaa@g.clemson.edu','login_attempt','Login successful',NULL,'2025-04-20 22:39:53'),(46,'trisha316andres@gmail.com','login_attempt','Login successful',1,'2025-04-20 22:40:28'),(47,'trisha316andres@gmail.com','login_attempt','Login successful',2,'2025-04-20 22:40:28'),(48,'trisha316andres@gmail.com','login_attempt','Login successful',3,'2025-04-20 22:40:28'),(49,'georgiagelasco@gmail.com','login_attempt','Login successful',1,'2025-04-20 22:48:11'),(50,'trisha316andres@gmail.com','login_attempt','Login successful',1,'2025-04-20 22:52:40'),(51,'trisha316andres@gmail.com','login_attempt','Login successful',2,'2025-04-20 22:52:40'),(52,'trisha316andres@gmail.com','login_attempt','Login successful',3,'2025-04-20 22:52:40');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-20 19:02:06
