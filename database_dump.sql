PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE `company` (
	`companyID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`mainAddress` text
);
CREATE TABLE `department` (
	`depID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`location` text,
	`companyID` integer NOT NULL
);
CREATE TABLE `employee` (
	`employeeID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`email` text NOT NULL,
	`teamID` integer
);
CREATE TABLE `goal` (
	`goalID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`unitOfMeasure` text,
	`status` text,
	`targetValue` real,
	`currentValue` real,
	`startDate` text,
	`endDate` text,
	`level` text NOT NULL,
	`companyID` integer,
	`depID` integer,
	`teamID` integer,
	`employeeID` integer,
	`strategy` text,
	`budget` real,
	`smartGoal` text
);
CREATE TABLE `team` (
	`teamID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`depID` integer NOT NULL
);
CREATE UNIQUE INDEX `employee_email_unique` ON `employee` (`email`);
COMMIT;
