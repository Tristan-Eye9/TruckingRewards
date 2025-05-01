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
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notifID` int NOT NULL AUTO_INCREMENT,
  `userEmail` varchar(255) NOT NULL,
  `notifName` varchar(20) NOT NULL,
  `notifDesc` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`notifID`),
  KEY `idx_notif_email` (`userEmail`),
  KEY `idx_notif_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'trisha316andres@gmail.com','points_added','Your account has gained 5 points. Reason: good driving','2025-04-18 18:58:24',1),(9,'driver@gmail.com','application_accepted','Your application (ID 11) has been accepted by sponsor 2.','2025-04-19 00:10:26',1),(10,'driver@gmail.com','points_added','Your account has gained 5 points. Reason: good driver','2025-04-19 00:10:59',1),(11,'driver@gmail.com','points_added','Your account has gained 5 points. Reason: yay','2025-04-19 00:32:41',1),(12,'georgiagelasco@gmail.com','points_added','Your account has gained 1000000 points. Reason: stop using them','2025-04-20 03:13:09',1),(13,'trisha316andres@gmail.com','points_added','Your account has gained 100 points. Reason: yay driver','2025-04-20 06:05:38',1),(14,'georgiagelasco@gmail.com','application_accepted','Your application (ID 3) has been rejected by sponsor 3.','2025-04-20 06:18:50',1),(15,'georgiagelasco@gmail.com','application_rejected','Your application (ID 3) has been rejected by sponsor 3. Reason: Prone to accidents','2025-04-20 13:08:01',1),(16,'georgiagelasco@gmail.com','application_rejected','Your application (ID 3) has been rejected by sponsor 3. Reason: Lots of accidents','2025-04-20 13:26:31',1),(17,'georgiagelasco@gmail.com','application_rejected','Your application (ID 3) has been rejected by sponsor 3. Reason: Lots of accidents','2025-04-20 13:29:05',1),(18,'georgiagelasco@gmail.com','application_rejected','Your application (ID 3) has been rejected by sponsor 3. Reason: Lots of accidents','2025-04-20 13:29:50',1),(19,'georgiagelasco@gmail.com','application_rejected','Your application (ID 3) has been rejected by sponsor 3. Reason: Accidents on record.','2025-04-20 13:35:58',1),(20,'georgiagelasco@gmail.com','application_rejected','Your application (ID 3) has been rejected by sponsor 3. Reason: Accidents on record.','2025-04-20 13:37:00',1),(21,'georgiagelasco@gmail.com','application_rejected','Your application (ID 3) has been rejected by sponsor 3. Reason: Accidents on record.','2025-04-20 13:38:30',1),(22,'georgiagelasco@gmail.com','application_rejected','Your application (ID 3) has been rejected by sponsor 3. Reason: Accidents on record.','2025-04-20 13:40:44',1),(23,'trisha316andres@gmail.com','application_rejected','Your application (ID 12) has been rejected by sponsor 4. Reason: Bad driver','2025-04-20 13:40:53',1);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
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

-- Dump completed on 2025-04-20 19:01:50
