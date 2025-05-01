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
-- Table structure for table `points`
--

DROP TABLE IF EXISTS `points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `points` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `points` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `sponsorCompanyID` int DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `points`
--

LOCK TABLES `points` WRITE;
/*!40000 ALTER TABLE `points` DISABLE KEYS */;
INSERT INTO `points` VALUES (9,'newuser@example.com',15,'2025-03-27 15:44:03',0,'New user registration'),(10,'newuser@example.com',20,'2025-03-27 15:44:09',0,'New user registration'),(11,'newuser@example.com',-5,'2025-03-27 15:44:15',0,'New user registration'),(12,'newuser@example.com',0,'2025-03-27 15:51:47',0,'New user registration'),(14,'trisha316andres@gmail.com',0,'2025-03-27 17:41:20',2,'Initial connection'),(15,'trisha316andres@gmail.com',100,'2025-03-27 18:31:57',2,'Amazing Driving!'),(18,'trisha316andres@gmail.com',-5,'2025-04-01 18:17:25',2,'Ran red light'),(19,'trisha316andres@gmail.com',200,'2025-04-02 16:34:42',2,'Great driving!'),(20,'trisha316andres@gmail.com',0,'2025-04-03 01:14:42',1,'Initial connection'),(21,'georgiagelasco@gmail.com',0,'2025-04-03 18:49:52',1,'Initial connection'),(22,'georgiagelasco@gmail.com',250,'2025-04-03 18:50:16',1,'just need'),(23,'trisha316andres@gmail.com',5,'2025-04-03 19:48:33',2,'yay driving'),(24,'jkthomp@clemson.edu',0,'2025-04-07 14:18:59',1,'Initial connection'),(25,'jkthomp@clemson.edu',3,'2025-04-07 14:19:14',1,'trees'),(26,'trisha316andres@gmail.com',9,'2025-04-07 14:19:27',1,'apples'),(29,'jkthomp@clemson.edu',0,'2025-04-08 13:58:26',2,'Initial connection'),(30,'newuser@example.com',0,'2025-04-10 17:26:52',2,'Deduction for purchase of song 1234567'),(31,'newuser@example.com',50,'2025-04-10 17:32:06',2,'Adding test points'),(32,'newuser@example.com',0,'2025-04-10 17:32:53',2,'Deduction for purchase of song 1234567'),(33,'newuser@example.com',-5,'2025-04-10 17:33:54',2,'Deduction for purchase of song 12345678'),(41,'trisha316andres@gmail.com',5,'2025-04-18 18:58:23',2,'good driving'),(50,'driver@gmail.com',0,'2025-04-19 00:10:26',2,'Initial connection'),(51,'driver@gmail.com',5,'2025-04-19 00:10:59',2,'good driver'),(52,'driver@gmail.com',5,'2025-04-19 00:32:40',2,'yay'),(53,'georgiagelasco@gmail.com',-7,'2025-04-19 23:28:06',1,'Deduction for purchase of song 332830174'),(54,'georgiagelasco@gmail.com',-7,'2025-04-19 23:33:22',1,'Deduction for purchase of song 332830174'),(55,'georgiagelasco@gmail.com',-7,'2025-04-19 23:33:29',1,'Deduction for purchase of song 332830174'),(56,'georgiagelasco@gmail.com',-92,'2025-04-19 23:36:57',1,'Deduction for purchase of song 279647290'),(57,'georgiagelasco@gmail.com',-92,'2025-04-19 23:37:05',1,'Deduction for purchase of song 279647290'),(58,'georgiagelasco@gmail.com',-19,'2025-04-19 23:41:12',1,'Deduction for purchase of song 368016758'),(59,'georgiagelasco@gmail.com',500,'2025-04-19 23:41:50',1,'girl needs some music'),(60,'georgiagelasco@gmail.com',-92,'2025-04-19 23:42:21',1,'Deduction for purchase of song 279647290'),(61,'georgiagelasco@gmail.com',-92,'2025-04-20 01:28:16',1,'Deduction for purchase of song 279647290'),(62,'georgiagelasco@gmail.com',-92,'2025-04-20 01:33:32',1,'Deduction for purchase of song 279647290'),(63,'georgiagelasco@gmail.com',-92,'2025-04-20 01:36:45',1,'Deduction for purchase of song 279647290'),(64,'georgiagelasco@gmail.com',-92,'2025-04-20 03:12:40',1,'Deduction for purchase of song 279647290'),(65,'georgiagelasco@gmail.com',1000000,'2025-04-20 03:13:08',1,'stop using them'),(66,'georgiagelasco@gmail.com',-7,'2025-04-20 03:59:08',1,'Deduction for purchase of song 332830174'),(67,'georgiagelasco@gmail.com',-7,'2025-04-20 04:00:24',1,'Deduction for purchase of song 332830174'),(68,'trisha316andres@gmail.com',5,'2025-04-20 05:38:08',2,'good job!'),(69,'trisha316andres@gmail.com',100,'2025-04-20 06:05:37',2,'yay driver'),(70,'georgiagelasco@gmail.com',-92,'2025-04-20 13:36:40',1,'Deduction for purchase of song 279647290'),(71,'trisha316andres@gmail.com',-85,'2025-04-20 14:03:06',2,'Deduction for purchase of song 1449621809'),(72,'georgiagelasco@gmail.com',-19,'2025-04-20 14:25:07',1,'Deduction for purchase of song 368016758'),(73,'georgiagelasco@gmail.com',-7,'2025-04-20 14:41:29',1,'Deduction for purchase of song 332830174'),(74,'georgiagelasco@gmail.com',-92,'2025-04-20 14:49:40',1,'Deduction for purchase of song 279647290'),(75,'georgiagelasco@gmail.com',-92,'2025-04-20 14:49:45',1,'Deduction for purchase of song 279647290'),(76,'georgiagelasco@gmail.com',-92,'2025-04-20 14:52:33',1,'Deduction for purchase of song 279647290'),(77,'trisha316andres@gmail.com',-7,'2025-04-20 15:28:04',1,'Deduction for purchase of song 332830174'),(78,'georgiagelasco@gmail.com',-92,'2025-04-20 18:16:42',1,'Deduction for purchase of song 279647290'),(79,'georgiagelasco@gmail.com',-92,'2025-04-20 18:31:20',1,'Deduction for purchase of song 279647290'),(80,'georgiagelasco@gmail.com',-92,'2025-04-20 22:10:47',1,'Deduction for purchase of song 279647290'),(81,'georgiagelasco@gmail.com',-92,'2025-04-20 22:23:59',1,'Deduction for purchase of song 279647290'),(82,'georgiagelasco@gmail.com',-30,'2025-04-20 22:37:28',1,'Deduction for purchase of song 1389988022');
/*!40000 ALTER TABLE `points` ENABLE KEYS */;
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

-- Dump completed on 2025-04-20 19:01:49
