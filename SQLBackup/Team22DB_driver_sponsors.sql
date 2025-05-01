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
-- Table structure for table `driver_sponsors`
--

DROP TABLE IF EXISTS `driver_sponsors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver_sponsors` (
  `driverEmail` varchar(30) NOT NULL,
  `sponsorCompanyID` int NOT NULL,
  `connected_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`driverEmail`,`sponsorCompanyID`),
  KEY `sponsorCompanyID` (`sponsorCompanyID`),
  CONSTRAINT `driver_sponsors_ibfk_1` FOREIGN KEY (`driverEmail`) REFERENCES `users` (`email`),
  CONSTRAINT `driver_sponsors_ibfk_2` FOREIGN KEY (`sponsorCompanyID`) REFERENCES `sponsor_companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `driver_sponsors`
--

LOCK TABLES `driver_sponsors` WRITE;
/*!40000 ALTER TABLE `driver_sponsors` DISABLE KEYS */;
INSERT INTO `driver_sponsors` VALUES ('driver@gmail.com',2,'2025-04-19 00:10:26'),('georgiagelasco@gmail.com',1,'2025-04-03 18:49:52'),('jkthomp@clemson.edu',1,'2025-04-07 14:18:59'),('trisha316andres@gmail.com',1,'2025-04-19 17:57:20'),('trisha316andres@gmail.com',2,'2025-03-27 17:41:20'),('trisha316andres@gmail.com',3,'2025-04-19 17:58:27');
/*!40000 ALTER TABLE `driver_sponsors` ENABLE KEYS */;
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

-- Dump completed on 2025-04-20 19:01:55
