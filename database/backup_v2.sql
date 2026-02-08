-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: petrodiesel_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `station_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `user_name` varchar(100) DEFAULT NULL COMMENT 'Cached user name for historical reference',
  `action` varchar(50) NOT NULL COMMENT 'create, update, delete, login, logout',
  `entity_type` varchar(50) NOT NULL COMMENT 'sale, purchase, transaction, user, tank, pump, etc.',
  `entity_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Previous values before update' CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'New values after update' CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_logs_user` (`user_id`),
  KEY `idx_logs_station` (`station_id`),
  KEY `idx_logs_entity` (`entity_type`,`entity_id`),
  KEY `idx_logs_action` (`action`),
  KEY `idx_logs_date` (`created_at`),
  CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `activity_logs_ibfk_2` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES (1,1,6,'Super Admin','login','session',NULL,'تسجيل دخول: Super Admin',NULL,NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-07 12:51:58');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banks`
--

DROP TABLE IF EXISTS `banks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `banks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `station_id` int(11) DEFAULT NULL,
  `account_scope` enum('local','global') NOT NULL DEFAULT 'local',
  `bank_name` varchar(100) NOT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `balance` decimal(15,2) DEFAULT 0.00,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `station_id` (`station_id`),
  KEY `idx_scope_station` (`account_scope`,`station_id`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `banks_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banks`
--

LOCK TABLES `banks` WRITE;
/*!40000 ALTER TABLE `banks` DISABLE KEYS */;
INSERT INTO `banks` VALUES (1,1,'local','الخرطوم','',0.00,1,'2026-02-07 11:40:51'),(2,NULL,'global','PETRODIESEL الرئاسة','333',4999990.00,1,'2026-02-07 15:45:24');
/*!40000 ALTER TABLE `banks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calibration_tables`
--

DROP TABLE IF EXISTS `calibration_tables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `calibration_tables` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tank_id` int(11) NOT NULL,
  `reading_cm` decimal(10,2) NOT NULL,
  `volume_liters` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tank_id` (`tank_id`),
  CONSTRAINT `calibration_tables_ibfk_1` FOREIGN KEY (`tank_id`) REFERENCES `tanks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calibration_tables`
--

LOCK TABLES `calibration_tables` WRITE;
/*!40000 ALTER TABLE `calibration_tables` DISABLE KEYS */;
INSERT INTO `calibration_tables` VALUES (4,3,54.00,45.00),(8,2,50000.00,50000.00);
/*!40000 ALTER TABLE `calibration_tables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `counters`
--

DROP TABLE IF EXISTS `counters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `counters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pump_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL COMMENT 'e.g. Nozzle A',
  `current_worker_id` int(11) DEFAULT NULL,
  `current_reading` decimal(15,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pump_id` (`pump_id`),
  CONSTRAINT `counters_ibfk_1` FOREIGN KEY (`pump_id`) REFERENCES `pumps` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `counters`
--

LOCK TABLES `counters` WRITE;
/*!40000 ALTER TABLE `counters` DISABLE KEYS */;
INSERT INTO `counters` VALUES (1,1,'عداد1',1,5000.00,'2026-02-07 10:12:56',NULL),(2,2,'العداد1 ',2,39.00,'2026-02-07 10:13:26',NULL),(3,3,'العداد 1',4,699.00,'2026-02-07 10:13:58',NULL),(4,4,'عداد 2',3,799.00,'2026-02-07 10:14:19',NULL),(5,5,'3',4,455.00,'2026-02-07 13:33:08',NULL),(6,6,'66',1,150.00,'2026-02-07 13:53:27',NULL);
/*!40000 ALTER TABLE `counters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `station_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `balance` decimal(15,2) DEFAULT 0.00 COMMENT 'Positive = They owe us',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `station_id` (`station_id`),
  CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,1,'تيراب','3423',0.00,'2026-02-07 10:10:15');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drivers`
--

DROP TABLE IF EXISTS `drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `drivers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `truck_number` varchar(50) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drivers`
--

LOCK TABLES `drivers` WRITE;
/*!40000 ALTER TABLE `drivers` DISABLE KEYS */;
INSERT INTO `drivers` VALUES (1,'مصطفي هارون','34','564','2026-02-07 10:11:39');
/*!40000 ALTER TABLE `drivers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `expenses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `station_id` int(11) NOT NULL,
  `category` varchar(100) NOT NULL COMMENT 'Salaries, Electricity, etc.',
  `description` text DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `user_id` int(11) NOT NULL,
  `source_type` enum('safe','bank') NOT NULL,
  `source_id` int(11) NOT NULL COMMENT 'ID of Safe or Bank',
  `expense_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `station_id` (`station_id`),
  CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fuel_price_history`
--

DROP TABLE IF EXISTS `fuel_price_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fuel_price_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fuel_type_id` int(11) NOT NULL,
  `fuel_name` varchar(100) DEFAULT NULL COMMENT 'Cached name for historical reference',
  `old_price` decimal(10,2) DEFAULT NULL COMMENT 'Price before change, NULL for new fuel',
  `new_price` decimal(10,2) NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `changed_by_name` varchar(100) DEFAULT NULL COMMENT 'Cached username',
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_price_fuel` (`fuel_type_id`),
  KEY `idx_price_date` (`changed_at`),
  KEY `changed_by` (`changed_by`),
  CONSTRAINT `fuel_price_history_ibfk_1` FOREIGN KEY (`fuel_type_id`) REFERENCES `fuel_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fuel_price_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fuel_price_history`
--

LOCK TABLES `fuel_price_history` WRITE;
/*!40000 ALTER TABLE `fuel_price_history` DISABLE KEYS */;
INSERT INTO `fuel_price_history` VALUES (1,1,'بنزين',NULL,3555.00,6,'Super Admin','2026-02-06 23:27:51'),(2,2,'جاز',NULL,3200.00,6,'Super Admin','2026-02-06 23:28:20'),(3,1,'بنزين',NULL,3444.00,6,'Super Admin','2026-02-07 08:56:21'),(4,1,'بنزين',NULL,3333.00,6,'Super Admin','2026-02-07 09:21:16'),(5,1,'بنزين',NULL,3500.00,6,'Super Admin','2026-02-07 09:32:19'),(6,2,'جاز',NULL,3200.00,6,'Super Admin','2026-02-07 09:32:33');
/*!40000 ALTER TABLE `fuel_price_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fuel_types`
--

DROP TABLE IF EXISTS `fuel_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fuel_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `code` varchar(50) NOT NULL,
  `color_hex` varchar(20) DEFAULT '#64748b',
  `price_per_liter` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fuel_types`
--

LOCK TABLES `fuel_types` WRITE;
/*!40000 ALTER TABLE `fuel_types` DISABLE KEYS */;
INSERT INTO `fuel_types` VALUES (1,'بنزين','__________','#f97316',3500.00,'2026-02-07 09:32:19','2026-02-07 09:32:19'),(2,'جاز','______','#3b82f6',3200.00,'2026-02-07 09:32:33','2026-02-07 09:32:33');
/*!40000 ALTER TABLE `fuel_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll_entries`
--

DROP TABLE IF EXISTS `payroll_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payroll_entries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `entity_type` enum('user','worker','driver') NOT NULL,
  `entity_id` int(11) NOT NULL,
  `type` enum('advance','deduction','bonus','payment') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `date` date NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll_entries`
--

LOCK TABLES `payroll_entries` WRITE;
/*!40000 ALTER TABLE `payroll_entries` DISABLE KEYS */;
/*!40000 ALTER TABLE `payroll_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pumps`
--

DROP TABLE IF EXISTS `pumps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pumps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `station_id` int(11) NOT NULL,
  `tank_id` int(11) NOT NULL COMMENT 'Source Tank',
  `name` varchar(100) NOT NULL COMMENT 'e.g. Pump 1',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `station_id` (`station_id`),
  KEY `tank_id` (`tank_id`),
  CONSTRAINT `pumps_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pumps_ibfk_2` FOREIGN KEY (`tank_id`) REFERENCES `tanks` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pumps`
--

LOCK TABLES `pumps` WRITE;
/*!40000 ALTER TABLE `pumps` DISABLE KEYS */;
INSERT INTO `pumps` VALUES (1,1,1,'ماكينة 1','2026-02-07 10:12:56',NULL),(2,1,2,'ماكينة 2','2026-02-07 10:13:26',NULL),(3,1,3,'ماكينة 3','2026-02-07 10:13:58',NULL),(4,1,4,'ماكينة4','2026-02-07 10:14:19',NULL),(5,1,5,'ماكين 5','2026-02-07 13:33:08',NULL),(6,1,6,'مكنة6','2026-02-07 13:53:27',NULL);
/*!40000 ALTER TABLE `pumps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `purchases` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `station_id` int(11) DEFAULT NULL,
  `supplier_id` int(11) NOT NULL,
  `tank_id` int(11) DEFAULT NULL,
  `driver_id` int(11) DEFAULT NULL,
  `truck_number` varchar(50) DEFAULT NULL,
  `driver_name` varchar(100) DEFAULT NULL,
  `invoice_number` varchar(50) DEFAULT NULL,
  `volume_ordered` decimal(10,2) NOT NULL,
  `volume_received` decimal(10,2) NOT NULL,
  `price_per_liter` decimal(10,2) NOT NULL,
  `total_cost` decimal(15,2) NOT NULL,
  `paid_amount` decimal(15,2) DEFAULT 0.00,
  `payment_source_type` enum('safe','bank') DEFAULT NULL,
  `payment_source_id` int(11) DEFAULT NULL,
  `status` enum('ordered','in_transit','arrived','offloading','completed') DEFAULT 'ordered',
  `invoice_image` varchar(255) DEFAULT NULL,
  `delivery_note_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `fuel_type_id` int(11) DEFAULT NULL,
  `offloading_start` datetime DEFAULT NULL,
  `offloading_end` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `station_id` (`station_id`),
  KEY `supplier_id` (`supplier_id`),
  KEY `tank_id` (`tank_id`),
  KEY `driver_id` (`driver_id`),
  KEY `fuel_type_id` (`fuel_type_id`),
  CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchases_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  CONSTRAINT `purchases_ibfk_3` FOREIGN KEY (`tank_id`) REFERENCES `tanks` (`id`),
  CONSTRAINT `purchases_ibfk_4` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `purchases_ibfk_5` FOREIGN KEY (`fuel_type_id`) REFERENCES `fuel_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases`
--

LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
INSERT INTO `purchases` VALUES (1,1,1,NULL,1,'34','مصطفي هارون','26021',45000.00,45000.00,3000.00,135000000.00,0.00,NULL,NULL,'ordered',NULL,NULL,'2026-02-07 11:24:27',1,NULL,NULL),(2,1,1,NULL,1,'34','مصطفي هارون','26022',60000.00,60000.00,3000.00,180000000.00,0.00,NULL,NULL,'ordered',NULL,NULL,'2026-02-07 11:25:08',1,NULL,NULL),(3,1,1,NULL,1,'34','مصطفي هارون','26023',100000.00,100000.00,3000.00,300000000.00,0.00,NULL,NULL,'completed',NULL,NULL,'2026-02-07 11:25:36',2,NULL,'2026-02-07 13:33:50');
/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `permissions` longtext DEFAULT NULL,
  `is_system` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'super_admin','Full access to everything','[\"*\"]',1,'2026-01-17 10:56:26','2026-01-17 10:56:26'),(17,'مشاهد','مشاهد فقط','[\"sales.view\",\"sales.edit\",\"purchases.view\",\"purchases.edit\"]',0,'2026-01-18 18:24:23','2026-01-18 18:56:36'),(18,'محاسب','محاسب','[\"purchases.create\",\"purchases.delete\"]',0,'2026-01-18 18:25:33','2026-01-18 18:56:58');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safes`
--

DROP TABLE IF EXISTS `safes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `station_id` int(11) DEFAULT NULL,
  `account_scope` enum('local','global') NOT NULL DEFAULT 'local',
  `name` varchar(100) NOT NULL COMMENT 'Main Safe, Office Safe...',
  `balance` decimal(15,2) DEFAULT 0.00,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `station_id` (`station_id`),
  KEY `idx_scope_station` (`account_scope`,`station_id`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `safes_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safes`
--

LOCK TABLES `safes` WRITE;
/*!40000 ALTER TABLE `safes` DISABLE KEYS */;
INSERT INTO `safes` VALUES (1,1,'local','الصناعلت',8407400.00,1,'2026-02-07 11:40:37');
/*!40000 ALTER TABLE `safes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salaries`
--

DROP TABLE IF EXISTS `salaries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `salaries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `entity_type` enum('user','worker','driver') NOT NULL,
  `entity_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_entity` (`entity_type`,`entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salaries`
--

LOCK TABLES `salaries` WRITE;
/*!40000 ALTER TABLE `salaries` DISABLE KEYS */;
/*!40000 ALTER TABLE `salaries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sales` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(20) DEFAULT NULL,
  `station_id` int(11) NOT NULL,
  `counter_id` int(11) NOT NULL,
  `worker_id` int(11) DEFAULT NULL COMMENT 'Worker assigned to this shift',
  `user_id` int(11) NOT NULL COMMENT 'User who entered the record',
  `opening_reading` decimal(15,2) NOT NULL,
  `closing_reading` decimal(15,2) NOT NULL,
  `volume_sold` decimal(10,2) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `payment_method` enum('cash','credit') DEFAULT 'cash',
  `customer_id` int(11) DEFAULT NULL COMMENT 'If credit',
  `shift` enum('Morning','Evening','Night') DEFAULT 'Morning',
  `sale_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `station_id` (`station_id`),
  KEY `counter_id` (`counter_id`),
  KEY `worker_id` (`worker_id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sales_ibfk_2` FOREIGN KEY (`counter_id`) REFERENCES `counters` (`id`),
  CONSTRAINT `sales_ibfk_3` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`),
  CONSTRAINT `sales_ibfk_4` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES (5,'S26020001',1,1,1,6,4433.00,5000.00,567.00,3500.00,1984500.00,'cash',NULL,'Morning','2026-02-07','2026-02-07 11:41:11'),(6,'S26020002',1,2,2,6,34.00,39.00,5.00,3500.00,17500.00,'cash',NULL,'Morning','2026-02-07','2026-02-07 11:41:40'),(7,'S26020003',1,3,4,6,50.00,67.00,17.00,3200.00,54400.00,'cash',NULL,'Morning','2026-02-07','2026-02-07 11:41:53'),(8,'S26020004',1,3,4,6,67.00,699.00,632.00,3200.00,2022400.00,'cash',NULL,'Morning','2026-02-07','2026-02-07 11:42:09'),(9,'S26020005',1,4,3,6,23.00,787.00,764.00,3200.00,2444800.00,'cash',NULL,'Morning','2026-02-07','2026-02-07 11:42:23'),(10,'S26020006',1,4,3,6,787.00,799.00,12.00,3200.00,38400.00,'cash',NULL,'Morning','2026-02-07','2026-02-07 13:33:24'),(11,'S26020007',1,5,4,6,33.00,455.00,422.00,3200.00,1350400.00,'cash',NULL,'Morning','2026-02-07','2026-02-07 13:33:46'),(12,'S26020008',1,6,1,6,0.00,100.00,100.00,3500.00,350000.00,'cash',NULL,'Morning','2026-02-07','2026-02-07 13:53:47'),(13,'S26020009',1,6,1,6,100.00,150.00,50.00,3500.00,175000.00,'cash',NULL,'Morning','2026-02-07','2026-02-07 13:55:05');
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `station_id` int(11) DEFAULT NULL COMMENT 'NULL for global settings, specific ID for station settings',
  `section` varchar(50) NOT NULL COMMENT 'general, finance, sales, etc.',
  `key_name` varchar(100) NOT NULL,
  `value` text DEFAULT NULL,
  `type` enum('string','integer','boolean','json') DEFAULT 'string',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_setting` (`station_id`,`key_name`),
  CONSTRAINT `settings_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,NULL,'general','app_name','PetroDiesel ERP','string','2026-01-17 10:46:21','2026-01-17 10:46:21'),(2,NULL,'general','currency','SDG','string','2026-01-17 10:46:21','2026-01-31 13:39:57'),(3,NULL,'general','timezone','Africa/Khartoum','string','2026-01-17 10:46:21','2026-01-31 23:55:56'),(4,NULL,'finance','enable_credit_sales','1','boolean','2026-01-17 10:46:21','2026-01-17 10:46:21'),(5,NULL,'finance','tax_rate','0','integer','2026-01-17 10:46:21','2026-01-17 10:46:21'),(6,NULL,'sales','require_worker_assignment','1','boolean','2026-01-17 10:46:21','2026-01-17 10:46:21'),(7,NULL,'general','station_name','محطة نبتة الصناعات','string','2026-01-17 19:59:35','2026-01-17 19:59:35'),(8,NULL,'general','cr_number','84327','string','2026-01-17 19:59:35','2026-01-17 19:59:35'),(9,NULL,'general','vat_number','7237489','string','2026-01-17 19:59:35','2026-01-17 19:59:35'),(10,NULL,'general','exchange_rate','940','string','2026-01-17 19:59:35','2026-01-17 19:59:35'),(11,NULL,'general','enable_notifications','1','string','2026-01-17 20:07:57','2026-01-17 20:07:57'),(12,NULL,'general','maintenance_mode','1','string','2026-01-17 20:09:19','2026-01-17 20:19:11'),(13,NULL,'general','language','ar','string','2026-01-30 23:28:19','2026-01-30 23:28:31'),(16,NULL,'general','app_name','PetroDiesel ERP','string','2026-01-31 23:25:57','2026-01-31 23:25:57'),(17,NULL,'general','cr_number','84327','string','2026-01-31 23:25:57','2026-01-31 23:25:57'),(18,NULL,'general','currency','SDG','string','2026-01-31 23:25:57','2026-01-31 23:25:57'),(19,NULL,'general','enable_notifications','1','string','2026-01-31 23:25:57','2026-01-31 23:25:57'),(20,NULL,'general','exchange_rate','940','string','2026-01-31 23:25:57','2026-01-31 23:25:57'),(21,NULL,'general','language','ar','string','2026-01-31 23:25:57','2026-01-31 23:25:57'),(22,NULL,'general','maintenance_mode','1','string','2026-01-31 23:25:57','2026-01-31 23:25:57'),(23,NULL,'general','station_name','محطة نبتة الصناعات','string','2026-01-31 23:25:57','2026-01-31 23:25:57'),(24,NULL,'general','timezone','Africa/Khartoum','string','2026-01-31 23:25:57','2026-01-31 23:25:57'),(25,NULL,'general','vat_number','7237489','string','2026-01-31 23:25:57','2026-01-31 23:25:57'),(26,NULL,'general','app_name','PetroDiesel ERP','string','2026-01-31 23:49:46','2026-01-31 23:49:46'),(27,NULL,'general','cr_number','84327','string','2026-01-31 23:49:46','2026-01-31 23:49:46'),(28,NULL,'general','currency','SDG','string','2026-01-31 23:49:46','2026-01-31 23:49:46'),(29,NULL,'general','enable_notifications','1','string','2026-01-31 23:49:46','2026-01-31 23:49:46'),(30,NULL,'general','exchange_rate','940','string','2026-01-31 23:49:46','2026-01-31 23:49:46'),(31,NULL,'general','language','ar','string','2026-01-31 23:49:46','2026-01-31 23:49:46'),(32,NULL,'general','maintenance_mode','1','string','2026-01-31 23:49:46','2026-01-31 23:49:46'),(33,NULL,'general','station_name','محطة نبتة الصناعات','string','2026-01-31 23:49:46','2026-01-31 23:49:46'),(34,NULL,'general','timezone','Africa/Khartoum','string','2026-01-31 23:49:46','2026-01-31 23:49:46'),(35,NULL,'general','vat_number','7237489','string','2026-01-31 23:49:46','2026-01-31 23:49:46'),(36,NULL,'general','app_name','PetroDiesel ERP','string','2026-02-03 14:14:31','2026-02-03 14:14:31'),(37,NULL,'general','cr_number','84327','string','2026-02-03 14:14:31','2026-02-03 14:14:31'),(38,NULL,'general','currency','SDG','string','2026-02-03 14:14:31','2026-02-03 14:14:31'),(39,NULL,'general','enable_notifications','1','string','2026-02-03 14:14:31','2026-02-03 14:14:31'),(40,NULL,'general','exchange_rate','940','string','2026-02-03 14:14:31','2026-02-03 14:14:31'),(41,NULL,'general','language','ar','string','2026-02-03 14:14:31','2026-02-03 14:14:31'),(42,NULL,'general','maintenance_mode','1','string','2026-02-03 14:14:31','2026-02-03 14:14:31'),(43,NULL,'general','station_name','محطة نبتة الصناعات','string','2026-02-03 14:14:31','2026-02-03 14:14:31'),(44,NULL,'general','timezone','Africa/Khartoum','string','2026-02-03 14:14:31','2026-02-03 14:14:31'),(45,NULL,'general','vat_number','7237489','string','2026-02-03 14:14:31','2026-02-03 14:14:31'),(46,NULL,'general','volume_display_mode','both','string','2026-02-03 14:14:31','2026-02-03 14:14:31'),(47,NULL,'general','app_name','PetroDiesel ERP','string','2026-02-03 14:15:03','2026-02-03 14:15:03'),(48,NULL,'general','cr_number','84327','string','2026-02-03 14:15:03','2026-02-03 14:15:03'),(49,NULL,'general','currency','SDG','string','2026-02-03 14:15:03','2026-02-03 14:15:03'),(50,NULL,'general','enable_notifications','1','string','2026-02-03 14:15:03','2026-02-03 14:15:03'),(51,NULL,'general','exchange_rate','940','string','2026-02-03 14:15:03','2026-02-03 14:15:03'),(52,NULL,'general','language','ar','string','2026-02-03 14:15:03','2026-02-03 14:15:03'),(53,NULL,'general','maintenance_mode','1','string','2026-02-03 14:15:03','2026-02-03 14:15:03'),(54,NULL,'general','station_name','محطة نبتة الصناعات','string','2026-02-03 14:15:03','2026-02-03 14:15:03'),(55,NULL,'general','timezone','Africa/Khartoum','string','2026-02-03 14:15:03','2026-02-03 14:15:03'),(56,NULL,'general','vat_number','7237489','string','2026-02-03 14:15:03','2026-02-03 14:15:03'),(57,NULL,'general','volume_display_mode','both','string','2026-02-03 14:15:03','2026-02-03 14:15:03'),(58,NULL,'general','app_name','PetroDiesel ERP','string','2026-02-06 23:28:31','2026-02-06 23:28:31'),(59,NULL,'general','cr_number','84327','string','2026-02-06 23:28:31','2026-02-06 23:28:31'),(60,NULL,'general','currency','SDG','string','2026-02-06 23:28:31','2026-02-06 23:28:31'),(61,NULL,'general','enable_notifications','1','string','2026-02-06 23:28:31','2026-02-06 23:28:31'),(62,NULL,'general','exchange_rate','940','string','2026-02-06 23:28:31','2026-02-06 23:28:31'),(63,NULL,'general','language','ar','string','2026-02-06 23:28:31','2026-02-06 23:28:31'),(64,NULL,'general','maintenance_mode','1','string','2026-02-06 23:28:31','2026-02-06 23:28:31'),(65,NULL,'general','station_name','محطة نبتة الصناعات','string','2026-02-06 23:28:31','2026-02-06 23:28:31'),(66,NULL,'general','timezone','Africa/Khartoum','string','2026-02-06 23:28:31','2026-02-06 23:28:31'),(67,NULL,'general','vat_number','7237489','string','2026-02-06 23:28:31','2026-02-06 23:28:31'),(68,NULL,'general','volume_display_mode','both','string','2026-02-06 23:28:31','2026-02-06 23:28:31');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stations`
--

DROP TABLE IF EXISTS `stations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stations`
--

LOCK TABLES `stations` WRITE;
/*!40000 ALTER TABLE `stations` DISABLE KEYS */;
INSERT INTO `stations` VALUES (1,'محطة نبتة الصناعات','الدويم','0912399152',NULL,'2026-01-17 20:07:14'),(2,'محطة سودا غاز سوق ليبيا','روتو','0912399999','','2026-01-18 08:34:51');
/*!40000 ALTER TABLE `stations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `station_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `balance` decimal(15,2) DEFAULT 0.00 COMMENT 'Positive = We owe them',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `station_id` (`station_id`),
  CONSTRAINT `suppliers_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,1,'سوداء غاز','0912811242',609999990.00,'2026-02-07 10:09:45');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tank_calibrations`
--

DROP TABLE IF EXISTS `tank_calibrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tank_calibrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tank_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `actual_quantity` decimal(10,2) NOT NULL COMMENT 'الكمية المقاسة يدوياً',
  `previous_quantity` decimal(10,2) NOT NULL COMMENT 'الرصيد قبل المعايرة',
  `variance` decimal(10,2) NOT NULL COMMENT 'الفرق (+ زيادة / - عجز)',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_tank_date` (`tank_id`,`created_at`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `tank_calibrations_ibfk_1` FOREIGN KEY (`tank_id`) REFERENCES `tanks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tank_calibrations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tank_calibrations`
--

LOCK TABLES `tank_calibrations` WRITE;
/*!40000 ALTER TABLE `tank_calibrations` DISABLE KEYS */;
INSERT INTO `tank_calibrations` VALUES (1,2,6,45600.00,45666.00,-66.00,'','2026-01-28 20:10:46','2026-01-28 20:10:46'),(2,1,6,12450.00,12500.00,-50.00,'','2026-01-28 20:15:29','2026-01-28 20:15:29'),(3,3,6,3950.00,3947.00,3.00,'','2026-01-28 20:16:18','2026-01-28 20:16:18'),(4,4,6,46400.00,46330.00,70.00,'','2026-01-28 20:18:33','2026-01-28 20:18:33'),(6,3,6,4000.00,3950.00,50.00,'','2026-01-28 22:50:38','2026-01-28 22:50:38'),(7,1,6,12900.00,11861.00,1039.00,'','2026-01-28 23:07:20','2026-01-28 23:07:20'),(8,2,6,45500.00,45600.00,-100.00,'','2026-01-28 23:07:33','2026-01-28 23:07:33'),(9,3,6,3950.00,4000.00,-50.00,'','2026-01-28 23:07:48','2026-01-28 23:07:48'),(10,4,6,46450.00,46400.00,50.00,'','2026-01-28 23:08:06','2026-01-28 23:08:06'),(12,1,6,48000.00,48232.00,-232.00,'','2026-02-06 23:51:56','2026-02-06 23:51:56'),(13,4,6,39434.00,40434.00,-1000.00,'','2026-02-07 00:02:41','2026-02-07 00:02:41'),(14,1,6,47809.00,48000.00,-191.00,'','2026-02-07 00:38:33','2026-02-07 00:38:33'),(15,1,6,47000.00,47809.00,-809.00,'','2026-02-07 00:43:47','2026-02-07 00:43:47'),(16,1,6,46500.00,47000.00,-500.00,'','2026-02-07 00:57:49','2026-02-07 00:57:49'),(17,1,6,46400.00,46500.00,-100.00,'','2026-02-07 00:58:30','2026-02-07 00:58:30'),(18,1,6,46000.00,46400.00,-400.00,'','2026-02-07 00:59:23','2026-02-07 00:59:23'),(19,1,6,45950.00,46000.00,-50.00,'','2026-02-07 08:41:52','2026-02-07 08:41:52'),(20,1,6,45900.00,45950.00,-50.00,'','2026-02-07 08:42:39','2026-02-07 08:42:39'),(21,1,6,2450.00,-99999999.99,99999999.99,'','2026-02-07 11:26:10','2026-02-07 11:26:10'),(22,3,6,49360.00,49367.00,-7.00,'','2026-02-07 13:29:32','2026-02-07 13:29:32'),(23,4,6,49460.00,49463.00,-3.00,'','2026-02-07 13:31:22','2026-02-07 13:31:22'),(24,6,6,2000.00,2050.00,-50.00,'','2026-02-07 13:59:10','2026-02-07 13:59:10');
/*!40000 ALTER TABLE `tank_calibrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tank_readings`
--

DROP TABLE IF EXISTS `tank_readings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tank_readings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tank_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL COMMENT 'Who recorded it',
  `reading_cm` decimal(10,2) NOT NULL,
  `volume_liters` decimal(10,2) NOT NULL,
  `reading_type` enum('opening','closing','delivery','check') DEFAULT 'closing',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `tank_id` (`tank_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `tank_readings_ibfk_1` FOREIGN KEY (`tank_id`) REFERENCES `tanks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tank_readings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tank_readings`
--

LOCK TABLES `tank_readings` WRITE;
/*!40000 ALTER TABLE `tank_readings` DISABLE KEYS */;
/*!40000 ALTER TABLE `tank_readings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tank_transfers`
--

DROP TABLE IF EXISTS `tank_transfers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tank_transfers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `from_tank_id` int(11) DEFAULT NULL,
  `to_tank_id` int(11) DEFAULT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `from_tank_id` (`from_tank_id`),
  KEY `to_tank_id` (`to_tank_id`),
  CONSTRAINT `tank_transfers_ibfk_1` FOREIGN KEY (`from_tank_id`) REFERENCES `tanks` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tank_transfers_ibfk_2` FOREIGN KEY (`to_tank_id`) REFERENCES `tanks` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tank_transfers`
--

LOCK TABLES `tank_transfers` WRITE;
/*!40000 ALTER TABLE `tank_transfers` DISABLE KEYS */;
INSERT INTO `tank_transfers` VALUES (1,8,1,22.00,NULL,'2026-02-03 16:29:39','Transfer before deletion'),(2,8,2,22.00,NULL,'2026-02-03 16:29:39','Transfer before deletion'),(3,1,2,66.00,NULL,'2026-02-03 17:01:02','Transfer'),(4,1,2,78.00,NULL,'2026-02-03 17:06:53','Transfer'),(5,1,2,43.00,NULL,'2026-02-03 17:10:44','Transfer'),(6,1,2,33.00,NULL,'2026-02-03 18:23:37','Transfer'),(7,1,2,33.00,NULL,'2026-02-03 18:24:30','Transfer'),(8,10,1,31.00,NULL,'2026-02-03 18:45:38','Transfer before deletion'),(9,10,2,2.00,NULL,'2026-02-03 18:45:38','Transfer before deletion'),(10,11,1,22.00,NULL,'2026-02-03 18:49:02','Transfer before deletion'),(11,11,2,33.00,NULL,'2026-02-03 18:49:02','Transfer before deletion'),(12,1,2,44.00,NULL,'2026-02-03 18:49:17','Transfer');
/*!40000 ALTER TABLE `tank_transfers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tanks`
--

DROP TABLE IF EXISTS `tanks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tanks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `station_id` int(11) NOT NULL,
  `fuel_type_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL COMMENT 'e.g. Diesel Tank 1',
  `capacity_liters` decimal(10,2) NOT NULL,
  `current_volume` decimal(10,2) DEFAULT 0.00,
  `current_price` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Current selling price per liter',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `initial_volume` decimal(15,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `station_id` (`station_id`),
  KEY `fk_tanks_fuel_type` (`fuel_type_id`),
  CONSTRAINT `fk_tanks_fuel_type` FOREIGN KEY (`fuel_type_id`) REFERENCES `fuel_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tanks_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tanks`
--

LOCK TABLES `tanks` WRITE;
/*!40000 ALTER TABLE `tanks` DISABLE KEYS */;
INSERT INTO `tanks` VALUES (1,1,1,'بير رقم بنزين 1',60000.00,1883.00,3500.00,'2026-02-07 09:33:05',NULL,1883.00),(2,1,1,'بير رقم بنزين 2',50000.00,28.00,3500.00,'2026-02-07 09:44:17',NULL,28.00),(3,1,2,'بير رقم جاز 1',50000.00,49360.00,3200.00,'2026-02-07 09:45:04',NULL,49360.00),(4,1,2,'بير رقم جاز 2',60000.00,49448.00,3200.00,'2026-02-07 09:45:17',NULL,49448.00),(5,1,2,'حزان جاز 5',50000.00,1678.00,3200.00,'2026-02-07 13:32:39',NULL,1678.00),(6,1,1,'جزان 6',50000.00,2000.00,3500.00,'2026-02-07 13:52:57',NULL,2000.00);
/*!40000 ALTER TABLE `tanks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction_categories`
--

DROP TABLE IF EXISTS `transaction_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transaction_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` enum('income','expense','transfer') NOT NULL,
  `is_system` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction_categories`
--

LOCK TABLES `transaction_categories` WRITE;
/*!40000 ALTER TABLE `transaction_categories` DISABLE KEYS */;
INSERT INTO `transaction_categories` VALUES (1,'صيانة','expense',1,'2026-01-17 10:58:32'),(3,'Salary Payment','expense',1,'2026-01-17 10:58:32'),(4,'General Expense','expense',1,'2026-01-17 10:58:32'),(5,'Bank Transfer','transfer',1,'2026-01-17 10:58:32'),(6,'Safe Transfer','transfer',1,'2026-01-17 10:58:32'),(7,'المولد','expense',0,'2026-01-29 03:36:42'),(8,'Refund','expense',0,'2026-01-29 03:36:42'),(9,'Salary','expense',0,'2026-01-29 03:36:42'),(10,'المشتروات','expense',0,'2026-01-29 03:36:42'),(11,'Utilities','expense',0,'2026-01-29 03:36:42'),(12,'Rent','expense',0,'2026-01-29 03:36:42'),(13,'Other','expense',0,'2026-01-29 03:36:42'),(14,'Sales','income',0,'2026-01-29 03:36:42'),(15,'Refund','expense',0,'2026-01-29 03:36:42'),(16,'Salary','expense',0,'2026-01-29 03:36:42'),(17,'Maintenance','expense',0,'2026-01-29 03:36:42'),(18,'Utilities','expense',0,'2026-01-29 03:36:42'),(19,'Rent','expense',0,'2026-01-29 03:36:42'),(20,'Other','expense',0,'2026-01-29 03:36:42'),(21,'Sales','income',0,'2026-01-29 03:37:07'),(22,'Refund','expense',0,'2026-01-29 03:37:07'),(24,'Maintenance','expense',0,'2026-01-29 03:37:07'),(25,'Utilities','expense',0,'2026-01-29 03:37:07'),(26,'Rent','expense',0,'2026-01-29 03:37:07'),(27,'Other','expense',0,'2026-01-29 03:37:07'),(28,'Sales','income',0,'2026-01-29 03:37:07'),(29,'Refund','expense',0,'2026-01-29 03:37:07'),(30,'Salary','expense',0,'2026-01-29 03:37:07'),(31,'Maintenance','expense',0,'2026-01-29 03:37:07'),(32,'الفطور','expense',0,'2026-01-29 03:37:07'),(33,'Rent','expense',0,'2026-01-29 03:37:07'),(34,'Other','expense',0,'2026-01-29 03:37:07'),(35,'Sales','income',0,'2026-01-29 03:37:25'),(36,'Refund','expense',0,'2026-01-29 03:37:25'),(37,'Salary','expense',0,'2026-01-29 03:37:25'),(38,'Maintenance','expense',0,'2026-01-29 03:37:25'),(40,'Rent','expense',0,'2026-01-29 03:37:25'),(41,'Other','expense',0,'2026-01-29 03:37:25');
/*!40000 ALTER TABLE `transaction_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transfer_request_id` int(11) DEFAULT NULL,
  `station_id` int(11) NOT NULL,
  `type` enum('income','expense','transfer') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `from_type` varchar(50) DEFAULT NULL COMMENT 'safe, bank, customer, supplier',
  `from_id` int(11) DEFAULT NULL,
  `from_scope` enum('local','global') DEFAULT NULL,
  `to_type` varchar(50) DEFAULT NULL COMMENT 'safe, bank, customer, supplier',
  `to_id` int(11) DEFAULT NULL,
  `to_scope` enum('local','global') DEFAULT NULL,
  `related_entity_type` varchar(50) DEFAULT NULL,
  `related_entity_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `reference_number` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `station_id` (`station_id`),
  KEY `category_id` (`category_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_transfer_request` (`transfer_request_id`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `transaction_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transactions_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,NULL,1,'income',1984500.00,NULL,NULL,NULL,NULL,'safe',1,NULL,'sales',5,'مبيعات محروقات - عملية S26020001',NULL,'2026-02-07',6,'2026-02-07 11:41:11','2026-02-07 11:41:11'),(2,NULL,1,'income',17500.00,NULL,NULL,NULL,NULL,'safe',1,NULL,'sales',6,'مبيعات محروقات - عملية S26020002',NULL,'2026-02-07',6,'2026-02-07 11:41:40','2026-02-07 11:41:40'),(3,NULL,1,'income',54400.00,NULL,NULL,NULL,NULL,'safe',1,NULL,'sales',7,'مبيعات محروقات - عملية S26020003',NULL,'2026-02-07',6,'2026-02-07 11:41:53','2026-02-07 11:41:53'),(4,NULL,1,'income',2022400.00,NULL,NULL,NULL,NULL,'safe',1,NULL,'sales',8,'مبيعات محروقات - عملية S26020004',NULL,'2026-02-07',6,'2026-02-07 11:42:09','2026-02-07 11:42:09'),(5,NULL,1,'income',2444800.00,NULL,NULL,NULL,NULL,'safe',1,NULL,'sales',9,'مبيعات محروقات - عملية S26020005',NULL,'2026-02-07',6,'2026-02-07 11:42:23','2026-02-07 11:42:23'),(6,NULL,1,'expense',30000.00,17,'safe',1,NULL,NULL,NULL,NULL,NULL,NULL,'4444ضثبيسشس','','2026-02-07',6,'2026-02-07 12:46:24','2026-02-07 12:46:24'),(7,NULL,1,'income',38400.00,NULL,NULL,NULL,NULL,'safe',1,NULL,'sales',10,'مبيعات محروقات - عملية S26020006',NULL,'2026-02-07',6,'2026-02-07 13:33:24','2026-02-07 13:33:24'),(8,NULL,1,'income',1350400.00,NULL,NULL,NULL,NULL,'safe',1,NULL,'sales',11,'مبيعات محروقات - عملية S26020007',NULL,'2026-02-07',6,'2026-02-07 13:33:46','2026-02-07 13:33:46'),(9,NULL,1,'income',350000.00,NULL,NULL,NULL,NULL,'safe',1,NULL,'sales',12,'مبيعات محروقات - عملية S26020008',NULL,'2026-02-07',6,'2026-02-07 13:53:47','2026-02-07 13:53:47'),(10,NULL,1,'income',175000.00,NULL,NULL,NULL,NULL,'safe',1,NULL,'sales',13,'مبيعات محروقات - عملية S26020009',NULL,'2026-02-07',6,'2026-02-07 13:55:05','2026-02-07 13:55:05'),(11,NULL,1,'expense',5000000.00,NULL,'bank',2,NULL,NULL,NULL,NULL,'supplier',1,'سيبييسش','33232','2026-02-07',6,'2026-02-07 15:46:15','2026-02-07 15:46:15'),(12,NULL,1,'expense',10.00,NULL,'bank',2,NULL,NULL,NULL,NULL,'supplier',1,'3333','333','2026-02-07',6,'2026-02-07 16:23:08','2026-02-07 16:23:08');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transfer_requests`
--

DROP TABLE IF EXISTS `transfer_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transfer_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `request_code` varchar(50) NOT NULL,
  `from_type` enum('safe','bank') NOT NULL DEFAULT 'bank',
  `from_id` int(11) NOT NULL,
  `from_scope` enum('local','global') NOT NULL,
  `to_type` enum('safe','bank') NOT NULL DEFAULT 'bank',
  `to_id` int(11) NOT NULL,
  `to_scope` enum('local','global') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `requested_by` int(11) NOT NULL,
  `station_id` int(11) DEFAULT NULL COMMENT 'Station of requester',
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `review_notes` text DEFAULT NULL,
  `transaction_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `request_code` (`request_code`),
  KEY `reviewed_by` (`reviewed_by`),
  KEY `idx_status` (`status`),
  KEY `idx_requested_by` (`requested_by`),
  KEY `idx_station` (`station_id`),
  KEY `idx_created_at` (`requested_at`),
  CONSTRAINT `transfer_requests_ibfk_1` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`),
  CONSTRAINT `transfer_requests_ibfk_2` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`),
  CONSTRAINT `transfer_requests_ibfk_3` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transfer_requests`
--

LOCK TABLES `transfer_requests` WRITE;
/*!40000 ALTER TABLE `transfer_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `transfer_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_stations`
--

DROP TABLE IF EXISTS `user_stations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_stations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `station_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_station` (`user_id`,`station_id`),
  KEY `station_id` (`station_id`),
  CONSTRAINT `user_stations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_stations_ibfk_2` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_stations`
--

LOCK TABLES `user_stations` WRITE;
/*!40000 ALTER TABLE `user_stations` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_stations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `station_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `role` enum('super_admin','admin','manager','accountant','viewer') DEFAULT 'viewer',
  `role_id` int(11) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `last_activity` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `station_id` (`station_id`),
  KEY `fk_users_role_id` (`role_id`),
  CONSTRAINT `fk_users_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,2,'Super Admin','admin@petrodiesel.com','$2y$10$Y66MwBJ8GJb67rjFWUkWCeSdSmgON6ZHk2Zk7fFUFS1vAj7/w3he6',NULL,'super_admin',1,'active','2026-01-29 10:30:29','2026-01-17 10:47:12'),(2,2,'ايمن','123@123','$2y$10$rY8FhAXLAeqb5EMn2QJaqezW7DDeOAJAqqSubi07Q5uLIYvmE5.7W',NULL,'admin',NULL,'active','2026-01-24 01:41:02','2026-01-17 20:43:23'),(6,1,'Super Admin','admin@admin.com','$2y$10$rnMPwojDIUSS3.4nZbcRbegU4knOUsvj4nPWOeokP.RTK4sdR5q/q',NULL,'super_admin',1,'active','2026-02-07 17:42:14','2026-01-18 11:04:58'),(7,1,'TestUser','test@test.com','$2y$10$k/VLDGo9PeGbda9ad3/vPOo5ELmq9WjhfgEgeJFgzz1xbl.SN1Qya',NULL,'',NULL,'active','2026-01-23 01:06:40','2026-01-18 13:40:58'),(8,NULL,'FixTest','fix@test.com','$2y$10$/edJ0G5FLmFaSIPrD6IsIuu3fbmKFaFCC4QaC4SXkDI4IQb6G.y/G',NULL,'',NULL,'active','2026-01-23 01:06:40','2026-01-18 14:54:24');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workers`
--

DROP TABLE IF EXISTS `workers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `workers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `station_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `national_id` varchar(50) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `station_id` (`station_id`),
  CONSTRAINT `workers_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workers`
--

LOCK TABLES `workers` WRITE;
/*!40000 ALTER TABLE `workers` DISABLE KEYS */;
INSERT INTO `workers` VALUES (1,1,'تشادي','3','','active','2026-02-07 10:10:36'),(2,1,'تنقا','44','','active','2026-02-07 10:10:49'),(3,1,'محمود','3425454','','active','2026-02-07 10:11:02'),(4,1,'حسن','33','','active','2026-02-07 10:11:13');
/*!40000 ALTER TABLE `workers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-07 22:17:41
