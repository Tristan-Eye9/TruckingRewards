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
-- Table structure for table `UserPurchases`
--

DROP TABLE IF EXISTS `UserPurchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserPurchases` (
  `purchase_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(30) NOT NULL,
  `song_id` int NOT NULL,
  `purchase_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `prev_val` int DEFAULT NULL,
  `new_val` int DEFAULT NULL,
  PRIMARY KEY (`purchase_id`),
  KEY `fk_user` (`email`),
  KEY `fk_song` (`song_id`),
  CONSTRAINT `fk_song` FOREIGN KEY (`song_id`) REFERENCES `Songs` (`song_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_user` FOREIGN KEY (`email`) REFERENCES `users` (`email`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserPurchases`
--

LOCK TABLES `UserPurchases` WRITE;
/*!40000 ALTER TABLE `UserPurchases` DISABLE KEYS */;
INSERT INTO `UserPurchases` VALUES (1,'newuser@example.com',1234567,'2025-04-10 17:26:52',0,0),(2,'newuser@example.com',1234567,'2025-04-10 17:32:53',50,50),(3,'newuser@example.com',12345678,'2025-04-10 17:33:54',50,45),(4,'georgiagelasco@gmail.com',332830174,'2025-04-19 23:28:06',250,243),(5,'georgiagelasco@gmail.com',332830174,'2025-04-19 23:33:22',243,236),(6,'georgiagelasco@gmail.com',332830174,'2025-04-19 23:33:29',236,229),(7,'georgiagelasco@gmail.com',279647290,'2025-04-19 23:36:57',229,137),(8,'georgiagelasco@gmail.com',279647290,'2025-04-19 23:37:05',137,45),(9,'georgiagelasco@gmail.com',368016758,'2025-04-19 23:41:12',45,26),(10,'georgiagelasco@gmail.com',279647290,'2025-04-19 23:42:21',526,434),(11,'georgiagelasco@gmail.com',279647290,'2025-04-20 01:28:16',434,342),(12,'georgiagelasco@gmail.com',279647290,'2025-04-20 01:33:32',342,250),(13,'georgiagelasco@gmail.com',279647290,'2025-04-20 01:36:45',250,158),(14,'georgiagelasco@gmail.com',279647290,'2025-04-20 03:12:40',158,66),(15,'georgiagelasco@gmail.com',332830174,'2025-04-20 03:59:08',1000066,1000059),(16,'georgiagelasco@gmail.com',332830174,'2025-04-20 04:00:24',1000059,1000052),(17,'georgiagelasco@gmail.com',279647290,'2025-04-20 13:36:40',1000052,999960),(18,'trisha316andres@gmail.com',1449621809,'2025-04-20 14:03:06',410,325),(19,'georgiagelasco@gmail.com',368016758,'2025-04-20 14:25:07',999960,999941),(20,'georgiagelasco@gmail.com',332830174,'2025-04-20 14:41:29',999941,999934),(21,'georgiagelasco@gmail.com',279647290,'2025-04-20 14:49:40',999934,999842),(22,'georgiagelasco@gmail.com',279647290,'2025-04-20 14:49:45',999842,999750),(23,'georgiagelasco@gmail.com',279647290,'2025-04-20 14:52:33',999750,999658),(24,'trisha316andres@gmail.com',332830174,'2025-04-20 15:28:04',9,2),(25,'georgiagelasco@gmail.com',279647290,'2025-04-20 18:16:42',999658,999566),(26,'georgiagelasco@gmail.com',279647290,'2025-04-20 18:31:20',999566,999474),(27,'georgiagelasco@gmail.com',279647290,'2025-04-20 22:10:47',999474,999382),(28,'georgiagelasco@gmail.com',279647290,'2025-04-20 22:23:59',999382,999290),(29,'georgiagelasco@gmail.com',1389988022,'2025-04-20 22:37:28',999290,999260);
/*!40000 ALTER TABLE `UserPurchases` ENABLE KEYS */;
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

-- Dump completed on 2025-04-20 19:02:07
