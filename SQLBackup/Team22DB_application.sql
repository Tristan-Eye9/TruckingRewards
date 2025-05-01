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
-- Table structure for table `application`
--

DROP TABLE IF EXISTS `application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application` (
  `appID` int NOT NULL AUTO_INCREMENT,
  `driverEmail` varchar(30) DEFAULT NULL,
  `sponsorCompanyID` int DEFAULT NULL,
  `status` enum('submitted','pending','accepted','rejected') DEFAULT 'submitted',
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fullName` varchar(200) NOT NULL,
  `reason` text,
  PRIMARY KEY (`appID`),
  KEY `fk_driverEmail` (`driverEmail`),
  KEY `fk_sponsorCompanyID` (`sponsorCompanyID`),
  CONSTRAINT `fk_driverEmail` FOREIGN KEY (`driverEmail`) REFERENCES `users` (`email`),
  CONSTRAINT `fk_sponsorCompanyID` FOREIGN KEY (`sponsorCompanyID`) REFERENCES `sponsor_companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application`
--

LOCK TABLES `application` WRITE;
/*!40000 ALTER TABLE `application` DISABLE KEYS */;
INSERT INTO `application` VALUES (1,'trisha316andres@gmail.com',2,'accepted','2025-03-27 17:41:00','Trisha Andres','Need a new driver.'),(2,'trisha316andres@gmail.com',1,'accepted','2025-04-03 01:13:43','Trisha Andres','Seems like a good driver.'),(3,'georgiagelasco@gmail.com',3,'rejected','2025-04-03 18:47:17','Georgia Gelasco','Accidents on record.'),(4,'georgiagelasco@gmail.com',1,'accepted','2025-04-03 18:49:44','Georgia Gelasco','No accidents!'),(5,'jkthomp@clemson.edu',2,'accepted','2025-04-07 13:01:29','Jay Thompson','Clean driving record.'),(6,'jkthomp@clemson.edu',1,'accepted','2025-04-07 13:01:40','Jay Thompson','Good driver overall.'),(11,'driver@gmail.com',2,'accepted','2025-04-19 00:10:09','meow meow','Race car driver.'),(12,'trisha316andres@gmail.com',4,'rejected','2025-04-20 13:01:49','Trisha Andres','Bad driver');
/*!40000 ALTER TABLE `application` ENABLE KEYS */;
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

-- Dump completed on 2025-04-20 19:01:51
