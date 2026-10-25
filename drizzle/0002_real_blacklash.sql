CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`description` varchar(180) NOT NULL,
	`category` varchar(100),
	`amountCents` int NOT NULL DEFAULT 0,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
