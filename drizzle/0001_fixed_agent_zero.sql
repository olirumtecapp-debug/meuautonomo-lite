CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`clientId` int,
	`serviceId` int,
	`startsAt` timestamp NOT NULL,
	`durationMinutes` int NOT NULL DEFAULT 60,
	`location` text,
	`amountCents` int NOT NULL DEFAULT 0,
	`status` enum('agendado','confirmado','andamento','concluido','cancelado','faltou') NOT NULL DEFAULT 'agendado',
	`notes` text,
	`paymentMethod` enum('pix','dinheiro','cartao','transferencia','outro'),
	`paymentStatus` enum('pendente','parcial','pago') NOT NULL DEFAULT 'pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `availability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`schedule` text NOT NULL,
	`timezone` varchar(64) NOT NULL DEFAULT 'America/Sao_Paulo',
	`unavailableDays` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `availability_id` PRIMARY KEY(`id`),
	CONSTRAINT `availability_profileId_unique` UNIQUE(`profileId`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`phone` varchar(40),
	`whatsapp` varchar(40),
	`email` varchar(320),
	`address` text,
	`notes` text,
	`archived` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`type` varchar(60) NOT NULL,
	`title` varchar(180) NOT NULL,
	`body` text,
	`read` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`appointmentId` int,
	`clientId` int,
	`amountCents` int NOT NULL DEFAULT 0,
	`method` enum('pix','dinheiro','cartao','transferencia','outro') NOT NULL DEFAULT 'pix',
	`status` enum('pago','pendente','parcial') NOT NULL DEFAULT 'pago',
	`paidAt` timestamp,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `professionalProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` varchar(160) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`professionCategory` varchar(100),
	`professionName` varchar(160) NOT NULL,
	`bio` text,
	`city` varchar(120),
	`serviceRegion` varchar(160),
	`phone` varchar(40),
	`whatsapp` varchar(40),
	`avatarUrl` text,
	`showPrices` boolean NOT NULL DEFAULT true,
	`bookingEnabled` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `professionalProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `professionalProfiles_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `professionalProfiles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `quoteItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteId` int NOT NULL,
	`description` varchar(180) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPriceCents` int NOT NULL DEFAULT 0,
	`totalCents` int NOT NULL DEFAULT 0,
	CONSTRAINT `quoteItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`clientId` int,
	`requestId` int,
	`serviceId` int,
	`secureToken` varchar(80) NOT NULL,
	`description` text,
	`subtotalCents` int NOT NULL DEFAULT 0,
	`discountCents` int NOT NULL DEFAULT 0,
	`totalCents` int NOT NULL DEFAULT 0,
	`notes` text,
	`validUntil` timestamp,
	`status` enum('rascunho','enviado','aceito','recusado','alteracao_solicitada','expirado') NOT NULL DEFAULT 'rascunho',
	`respondedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quotes_id` PRIMARY KEY(`id`),
	CONSTRAINT `quotes_secureToken_unique` UNIQUE(`secureToken`)
);
--> statement-breakpoint
CREATE TABLE `requestAttachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` int NOT NULL,
	`fileName` varchar(180) NOT NULL,
	`fileUrl` text NOT NULL,
	`mimeType` varchar(120),
	`fileSize` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `requestAttachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`clientId` int,
	`requesterName` varchar(160) NOT NULL,
	`requesterPhone` varchar(40) NOT NULL,
	`requesterEmail` varchar(320),
	`serviceId` int,
	`description` text NOT NULL,
	`address` text,
	`desiredAt` timestamp,
	`preferredTime` varchar(80),
	`status` enum('nova','em_analise','orcamento_enviado','agendada','arquivada') NOT NULL DEFAULT 'nova',
	`secureToken` varchar(80) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `requests_secureToken_unique` UNIQUE(`secureToken`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text,
	`durationMinutes` int NOT NULL DEFAULT 60,
	`priceCents` int NOT NULL DEFAULT 0,
	`modality` enum('presencial','endereco','online','hibrido') NOT NULL DEFAULT 'presencial',
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
